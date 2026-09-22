const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright');process.chdir(path.resolve(__dirname,'..'));
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.RDG_BROWSER_CHANNEL?{channel:process.env.RDG_BROWSER_CHANNEL}:{})});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.route('**/js/config.js*',r=>r.fulfill({contentType:'application/javascript',body:fs.readFileSync('js/config.js','utf8').replace(/firebase: \{[\s\S]*?\n  \},/,'firebase: {},').replace('demo: false','demo: true')}));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?view=admin');await page.waitForSelector('#login-form');
 await page.evaluate(()=>{for(const [i,branchId] of ['coronel','bingen','correas'].entries()){
 const order={id:'same-id',code:'MESMO123',branchId,customer:{name:'Cliente das três lojas',phone:'24999990001'},createdAt:Date.now()+i,updatedAt:Date.now(),status:i===2?'delivery':'pending',totalCents:(i+1)*1000,items:[{name:'Produto teste',variant:'Bife',quantity:1,saleMode:'weight',grams:500,totalCents:(i+1)*1000,unit:'kg',unitPriceCents:(i+1)*2000}],fulfillment:'pickup',payment:'Pix',notes:'',address:''};localStorage.setItem('rdg-demo-v1:orders:'+branchId,JSON.stringify([order]));}});
 assert.equal(await page.locator('#login-form select').count(),0);
 await page.locator('[name=password]').fill('incorreta');await page.getByRole('button',{name:'Entrar no painel'}).click();await page.getByText('Senha incorreta.',{exact:true}).waitFor();
 await page.locator('[name=password]').fill('demo123456');await page.getByRole('button',{name:'Entrar no painel'}).click();await page.waitForSelector('.stats');
 assert.equal(await page.locator('[data-order-row]').count(),3);assert.match(await page.locator('.stat strong').nth(2).innerText(),/0,00/);
 assert.equal(await page.locator('[data-order-filter]').count(),3);assert.equal(await page.locator('[name=status]').count(),0);
 // Double click the row, not an action, opens the correct store even with identical IDs.
 await page.locator('[data-order-row="bingen:same-id"] td').first().dblclick();
 assert.match(await page.locator('.order-details').innerText(),/Unidade Bingen/);
 await page.locator('#modal [data-order-status=done]').click();assert.match(await page.locator('#final-total-form [role=alert]').innerText(),/valor final/);
 await page.locator('[name=finalTotal]').fill('-2');await page.getByRole('button',{name:'Salvar valor final',exact:true}).click();assert.match(await page.locator('#final-total-form [role=alert]').innerText(),/valor final/);
 await page.locator('[name=finalTotal]').fill('25,90');await page.locator('#modal [data-order-status=done]').click();await page.waitForSelector('#final-total-form',{state:'hidden'});
 const readOrders=()=>page.evaluate(()=>['coronel','bingen','correas'].map(b=>JSON.parse(localStorage.getItem('rdg-demo-v1:orders:'+b))[0]));
 let saved=await readOrders();assert.deepEqual(saved.map(o=>o.status),['pending','done','delivery']);assert.equal(saved[1].totalCents,2000);assert.equal(saved[1].finalTotalCents,2590);
 assert.match(await page.locator('.stat strong').nth(2).innerText(),/25,90/);
 // Reopen by icon, change final value and return to pending; original basket is immutable.
 await page.locator('[data-order-row="bingen:same-id"] [data-order-status=pending]').click();
 await page.locator('[data-order="bingen:same-id"]').click();assert.equal(await page.locator('[name=finalTotal]').inputValue(),'25,90');
 await page.locator('[name=finalTotal]').fill('26.50');await page.getByRole('button',{name:'Salvar valor final',exact:true}).click();await page.waitForSelector('#final-total-form',{state:'hidden'});
 saved=await readOrders();assert.equal(saved[1].finalTotalCents,2650);assert.equal(saved[1].status,'pending');assert.equal(saved[1].items[0].totalCents,2000);
 await page.locator('[data-order-row="bingen:same-id"] [data-order-status=done]').click();
 await page.locator('#admin-order-branch').selectOption('correas');assert.equal(await page.locator('[data-order-row]').count(),1);assert.match(await page.locator('.stat strong').nth(2).innerText(),/0,00/);
 await page.locator('#admin-order-branch').selectOption('all');await page.locator('[data-admin-tab=customers]').click();assert.equal(await page.locator('[data-customer]').count(),1);assert.match(await page.locator('#admin-content').innerText(),/26,50/);assert.match(await page.locator('#admin-content').innerText(),/2 com valor a confirmar/);
 await page.locator('[data-customer]').click();assert.equal(await page.locator('#modal [data-order]').count(),3);await page.getByRole('button',{name:'Fechar',exact:true}).click();
 await page.reload();await page.waitForSelector('.stats');assert.match(await page.locator('.stat strong').nth(2).innerText(),/26,50/);
 await page.evaluate(()=>{const key='rdg-demo-v1:orders:coronel',orders=JSON.parse(localStorage.getItem(key));orders.push({...orders[0],id:'new-id',code:'NOVO1234',createdAt:Date.now()+10000});localStorage.setItem(key,JSON.stringify(orders));});await page.locator('[data-order="coronel:new-id"]').waitFor();
 // One shared catalogue; no unit selector anywhere in product/category management.
 await page.locator('[data-admin-tab=products]').click();assert.equal(await page.locator('#admin-catalog-branch,#admin-order-branch').count(),0);
 await page.getByRole('button',{name:'Novo produto',exact:true}).click();await page.locator('#product-form [name=name]').fill('QA COMPARTILHADO');await page.locator('[name=variantName]').fill('Bifes');await page.locator('[name=variantPrice]').fill('20.00');await page.locator('[name=photo]').setInputFiles('assets/products/1235984.jpg');await page.getByRole('button',{name:'Salvar produto',exact:true}).click();await page.waitForSelector('#product-form',{state:'hidden'});
 await page.locator('#admin-search').fill('QA COMPARTILHADO');await page.getByRole('button',{name:'Editar QA COMPARTILHADO',exact:true}).click();await page.locator('[name=variantPrice]').fill('25.00');await page.getByRole('button',{name:'Salvar produto',exact:true}).click();await page.waitForSelector('#product-form',{state:'hidden'});
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('rdg-demo-v1:catalog:shared')).products.find(p=>p.name==='QA COMPARTILHADO'));assert.equal(stored.priceCents,2500);assert.match(stored.image,/^data:image\/jpeg;base64,/);
 const customer=await context.newPage();await customer.goto('http://127.0.0.1:4173/');await customer.getByRole('button',{name:'Escolher QA COMPARTILHADO',exact:true}).click();await customer.getByRole('button',{name:'Adicionar à sacola',exact:true}).click();await customer.locator('.mobile-cart').click();await customer.locator('#modal-cart [data-action=checkout]').click();await customer.locator('[name=name]').fill('QA loja');await customer.locator('[name=phone]').fill('24999990001');await customer.getByRole('button',{name:'Enviar pedido',exact:true}).click();await customer.waitForSelector('[data-branch]');
 for(const branch of ['coronel','bingen','correas'])assert.match(await customer.locator('[data-branch='+branch+']').innerText(),/12,50/);
 await customer.close();
 await page.getByRole('button',{name:'Excluir QA COMPARTILHADO',exact:true}).click();assert.match(await page.locator('#modal').innerText(),/todas as lojas/);await page.locator('[data-confirm-delete]').click();await page.waitForSelector('[data-confirm-delete]',{state:'hidden'});assert.equal(await page.locator('.table-img').count(),0);
 await page.locator('[data-admin-tab=categories]').click();assert.equal(await page.locator('#admin-catalog-branch,#admin-order-branch').count(),0);
 await page.locator('[data-admin-tab=orders]').click();fs.mkdirSync('.qa',{recursive:true});
 for(const width of [320,390,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Admin overflow '+width);await page.screenshot({path:'.qa/admin-shared-'+width+'.png'});}
 await page.locator('[data-order="bingen:same-id"]').click();assert.equal(await page.locator('dialog').evaluate(el=>el.scrollWidth>el.clientWidth),false);await page.screenshot({path:'.qa/admin-final-total.png'});await page.getByRole('button',{name:'Fechar',exact:true}).click();
 await page.getByRole('button',{name:'Sair',exact:true}).click();await page.waitForSelector('#login-form');await page.reload();await page.waitForSelector('#login-form');assert.deepEqual(errors,[]);
 console.log('PASS shared admin: two icon statuses, required/validated final value, original estimate preserved, same-ID isolation, double click, confirmed-only history, global photo/price/delete, same checkout prices in all stores, realtime and responsive layout.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
