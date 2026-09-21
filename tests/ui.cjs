const fs=require('node:fs'),assert=require('node:assert/strict');
const path=require('node:path');
const {chromium}=require('playwright');
const projectRoot=path.resolve(__dirname,'..');
process.chdir(projectRoot);
fs.mkdirSync('.qa',{recursive:true});
const live=false; // This committed test never writes production data.
const token=String(Date.now()), fixtureName='QA PRODUTO REVISAO '+token, categoryName='QA CATEGORIA REVISAO '+token, testNotes='QA REVISAO AUTOMATICA '+token+' - NAO PREPARAR - NAO ENVIAR';
fs.writeFileSync('.qa/review-run.json',JSON.stringify({testNotes,fixtureName,categoryName,live}),{mode:0o600});
(async()=>{
const b=await chromium.launch({headless:true,...(process.env.RDG_BROWSER_CHANNEL?{channel:process.env.RDG_BROWSER_CHANNEL}:{})}),ctx=await b.newContext({viewport:{width:390,height:844}}),page=await ctx.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
if(!live)await ctx.route('**/js/config.js*',route=>route.fulfill({contentType:'application/javascript',body:fs.readFileSync('js/config.js','utf8').replace(/firebase: \{[\s\S]*?\n  \},/,'firebase: {},').replace('demo: false','demo: true')}));
await page.addInitScript(()=>{window.open=()=>({opener:null,document:{title:'',body:{textContent:''}},location:{replace:url=>{window.__qaWhatsapp=url}},close:()=>{}})});
await page.goto('http://127.0.0.1:4173/');await page.waitForSelector('.product');await page.evaluate(()=>document.fonts.ready);
assert.equal(await page.locator('.product').count(),90);
assert.equal(await page.locator('[data-branch],.location').count(),0);
assert.equal(await page.locator('link[href*="fonts.googleapis"]').count(),0);
assert.ok(await page.evaluate(()=>document.fonts.check('16px "Corona RDG"')&&document.fonts.check('16px "Clarendon RDG"')));
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await page.screenshot({path:'.qa/revised-mobile.png',fullPage:false});
await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'.qa/revised-desktop.png',fullPage:false});await page.setViewportSize({width:390,height:844});
await page.getByRole('searchbox',{name:'Buscar produtos'}).fill('moído');assert.equal(await page.locator('.product').count(),2);await page.getByRole('searchbox',{name:'Buscar produtos'}).fill('');
for(const [i,unit] of ['coronel','bingen','correas'].entries()){
 await page.getByRole('button',{name:'Escolher Patinho Angus',exact:true}).click();assert.equal(await page.locator('#add-product [type=radio]').count(),4);assert.equal(await page.locator('[data-branch]').count(),0);
 await page.getByRole('radio',{name:/Bifes/}).check();await page.locator('#add-product [name=amount]').fill('0.75');
 assert.match(await page.locator('#product-total').innerText(),/51,68/);
 await page.getByRole('button',{name:'Adicionar à sacola',exact:true}).click();
 await page.reload();await page.waitForSelector('.product');assert.equal(await page.locator('.mobile-cart [data-count]').innerText(),'1');
 await page.locator('.mobile-cart').click();await page.locator('#modal-cart [data-action=checkout]').click();
 await page.locator('#checkout-form [name=name]').fill('QA REVISAO '+unit);
 await page.locator('#checkout-form [name=phone]').fill('24999990001');
 await page.locator('#checkout-form [name=notes]').fill(testNotes);
 if(i===1){await page.locator('[name=fulfillment]').selectOption('delivery');await page.locator('[name=address]').fill('Rua de teste, 123, Bingen');await page.locator('[name=payment]').selectOption('Dinheiro');await page.locator('[name=changeFor]').fill('100,00')}
 await page.getByRole('button',{name:'Enviar pedido',exact:true}).click();await page.waitForSelector('[data-branch]');assert.equal(await page.locator('[data-branch]').count(),3);
 assert.equal(await page.getByRole('heading',{name:'Quem vai preparar seu pedido?'}).count(),1);
 if(i===0){await page.getByRole('button',{name:'Voltar aos meus dados'}).click();assert.equal(await page.locator('[name=name]').inputValue(),'QA REVISAO '+unit);await page.getByRole('button',{name:'Enviar pedido',exact:true}).click();await page.waitForSelector('[data-branch]');await page.screenshot({path:'.qa/revised-choose-store.png',fullPage:false})}
 await page.locator('[data-branch='+unit+']').click();await page.getByRole('heading',{name:live?'Pedido registrado!':'Pedido de teste salvo',exact:true}).waitFor({timeout:40000});
 assert.match(await page.locator('.review-box').innerText(),new RegExp('UNIDADE '+({coronel:'CORONEL',bingen:'BINGEN',correas:'CORRÊAS'}[unit])));
 const reviewText=await page.locator('.review-box').innerText();
 assert.match(reviewText,/\*Item - Patinho Angus — Bifes\*/);
 assert.match(reviewText,/\*Quantidade: 0,750 kg \(750 g\)\*/);
 assert.doesNotMatch(reviewText,/^\d+\. /m);
 if(live){const url=await page.evaluate(()=>window.__qaWhatsapp);assert.ok(url.startsWith('https://wa.me/'+['5524992177114','552420171476','5524981754161'][i]+'?'));}
 await page.getByRole('button',{name:'Voltar ao catálogo'}).click();assert.equal(await page.locator('.mobile-cart [data-count]').innerText(),'0');console.log('PASS checkout:',unit,'unit only at send, subcut, price, saved cart, final selection, correct destination');
}
await page.goto('http://127.0.0.1:4173/?view=admin');
const access=live?JSON.parse(fs.readFileSync('.qa/unused-access.json')):null;
assert.equal(await page.locator('#login-form [name=branch]').count(),0);await page.locator('[name=password]').fill(live?access.find(a=>a.branch==='coronel').password:'demo123456');await page.getByRole('button',{name:'Entrar no painel'}).click();await page.waitForSelector('.admin-shell');
assert.match(await page.locator('#admin-content').innerText(),/QA REVISAO bingen/);await page.locator('#admin-order-branch').selectOption('coronel');assert.match(await page.locator('#admin-content').innerText(),/QA REVISAO coronel/);assert.doesNotMatch(await page.locator('#admin-content').innerText(),/QA REVISAO bingen/);
await page.getByRole('button',{name:'Ver pedido',exact:true}).first().click();await page.locator('[name=status]').selectOption('preparing');await page.getByRole('button',{name:'Salvar status'}).click();await page.waitForSelector('#status-form',{state:'hidden'});await page.locator('[data-admin-tab=customers]').click();assert.match(await page.locator('#admin-content').innerText(),/QA REVISAO coronel/);
await page.locator('[data-admin-tab=products]').click();await page.getByRole('button',{name:'Novo produto',exact:true}).click();
await page.locator('#product-form [name=name]').fill(fixtureName);await page.locator('[name=variantName]').fill('Bife');await page.locator('[name=variantPrice]').fill('50.00');
await page.getByRole('button',{name:'Adicionar variação'}).click();await page.locator('[name=variantName]').nth(1).fill('Cubos');await page.locator('[name=variantPrice]').nth(1).fill('55.00');
await page.locator('[name=photo]').setInputFiles('assets/products/1235984.jpg');await page.getByRole('button',{name:'Salvar produto',exact:true}).click();await page.waitForSelector('#product-form',{state:'hidden'});
await page.locator('#admin-search').fill(fixtureName);assert.equal(await page.locator('.row-actions button').count(),2);assert.ok((await page.locator('.table-img').getAttribute('src')).startsWith('data:image/jpeg;base64,'));
await page.getByRole('button',{name:'Editar '+fixtureName,exact:true}).click();await page.locator('[name=variantPrice]').nth(1).fill('56.00');await page.getByRole('button',{name:'Salvar produto',exact:true}).click();await page.waitForSelector('#product-form',{state:'hidden'});
await page.getByRole('button',{name:'Excluir '+fixtureName,exact:true}).click();await page.getByRole('button',{name:'Cancelar',exact:true}).click();assert.equal(await page.locator('.table-img').count(),1);
await page.getByRole('button',{name:'Editar '+fixtureName,exact:true}).click();await page.getByRole('button',{name:'Excluir produto',exact:true}).click();await page.locator('[data-confirm-delete]').click();await page.waitForSelector('[data-confirm-delete]',{state:'hidden'});assert.equal(await page.locator('.table-img').count(),0);
await page.locator('[data-admin-tab=categories]').click();await page.getByRole('button',{name:'Nova categoria'}).click();await page.locator('#category-form [name=name]').fill(categoryName);await page.getByRole('button',{name:'Salvar categoria'}).click();await page.waitForSelector('#category-form',{state:'hidden'});await page.getByRole('button',{name:'Excluir '+categoryName}).click();await page.locator('[data-confirm-delete]').click();await page.waitForSelector('[data-confirm-delete]',{state:'hidden'});
assert.deepEqual(errors,[]);console.log('PASS admin: single login, global orders, unit filter, status, customer history, photo upload, subcut creation/edit, explicit deletion, cancellation, preserved order history, category create/delete.');
await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
