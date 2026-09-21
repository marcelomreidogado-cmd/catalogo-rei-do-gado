const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
process.chdir(path.resolve(__dirname, '..'));
(async () => {
  const browser = await chromium.launch({headless:true, ...(process.env.RDG_BROWSER_CHANNEL ? {channel:process.env.RDG_BROWSER_CHANNEL} : {})});
  try {
    const context = await browser.newContext({viewport:{width:390,height:844}});
    await context.route('**/js/config.js*', r => r.fulfill({contentType:'application/javascript',body:fs.readFileSync('js/config.js','utf8').replace(/firebase: \{[\s\S]*?\n  \},/,'firebase: {},').replace('demo: false','demo: true')}));
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:4173/?view=admin');
    await page.waitForSelector('#login-form');
    await page.evaluate(() => {
      for (const [i,branchId] of ['coronel','bingen','correas'].entries()) {
        const order = {id:'same-id', code:'MESMO123', branchId, customer:{name:'Cliente das três lojas',phone:'24999990001'}, createdAt:Date.now()+i, updatedAt:Date.now(), status:'pending', totalCents:(i+1)*1000, items:[{name:'Produto teste',variant:'Bife',quantity:1,saleMode:'weight',grams:500,totalCents:(i+1)*1000,unit:'kg',unitPriceCents:(i+1)*2000}],fulfillment:'pickup',payment:'Pix',notes:'',address:''};
        localStorage.setItem('rdg-demo-v1:orders:'+branchId,JSON.stringify([order]));
      }
    });
    assert.equal(await page.locator('#login-form select').count(),0);
    await page.locator('[name=password]').fill('incorreta');
    await page.getByRole('button',{name:'Entrar no painel'}).click();
    await page.getByText('Senha incorreta.',{exact:true}).waitFor();
    await page.locator('[name=password]').fill('demo123456');
    await page.getByRole('button',{name:'Entrar no painel'}).click();
    await page.waitForSelector('.admin-shell');
    assert.equal(await page.locator('[data-order]').count(),3);
    assert.equal(await page.locator('.stat strong').nth(0).innerText(),'3');
    assert.match(await page.locator('.stat strong').nth(2).innerText(),/60,00/);
    await page.locator('[data-order="bingen:same-id"]').click();
    assert.match(await page.locator('.order-details').innerText(),/Unidade Bingen/);
    await page.locator('[name=status]').selectOption('preparing');
    await page.getByRole('button',{name:'Salvar status'}).click();
    await page.waitForSelector('#status-form',{state:'hidden'});
    assert.deepEqual(await page.evaluate(()=>['coronel','bingen','correas'].map(b=>JSON.parse(localStorage.getItem('rdg-demo-v1:orders:'+b))[0].status)),['pending','preparing','pending']);
    await page.locator('#admin-order-branch').selectOption('correas');
    assert.equal(await page.locator('[data-order]').count(),1);
    assert.equal(await page.locator('[data-order]').getAttribute('data-order'),'correas:same-id');
    assert.match(await page.locator('.stat strong').nth(2).innerText(),/30,00/);
    await page.locator('#admin-order-branch').selectOption('all');
    await page.locator('[data-admin-tab=customers]').click();
    assert.equal(await page.locator('[data-customer]').count(),1);
    await page.locator('[data-customer]').click();
    assert.equal(await page.locator('#modal [data-order]').count(),3);
    await page.getByRole('button',{name:'Fechar',exact:true}).click();
    await page.reload();await page.waitForSelector('.admin-shell');
    assert.equal(await page.locator('[data-order]').count(),3);
    // A new order in another store appears without reloading the admin.
    await page.evaluate(()=>{const key='rdg-demo-v1:orders:coronel';const orders=JSON.parse(localStorage.getItem(key));orders.push({...orders[0],id:'new-id',code:'NOVO1234',createdAt:Date.now()+10000});localStorage.setItem(key,JSON.stringify(orders));});
    await page.locator('[data-order="coronel:new-id"]').waitFor();
    await page.locator('[data-admin-tab=products]').click();
    for(const branch of ['bingen','correas','coronel']) {
      await page.locator('#admin-catalog-branch').selectOption(branch);
      await page.getByRole('button',{name:'Novo produto',exact:true}).click();
      await page.locator('#product-form [name=name]').fill('QA PAINEL '+branch);
      await page.locator('[name=variantName]').fill('Bifes');
      await page.locator('[name=variantPrice]').fill('20.00');
      await page.locator('[name=photo]').setInputFiles('assets/products/1235984.jpg');
      await page.getByRole('button',{name:'Salvar produto',exact:true}).click();
      await page.waitForSelector('#product-form',{state:'hidden'});
      await page.locator('#admin-search').fill('QA PAINEL');
      assert.equal(await page.locator('.table-img').count(),1);
      await page.getByRole('button',{name:'Editar QA PAINEL '+branch,exact:true}).click();
      await page.locator('[name=variantPrice]').fill('25.00');
      await page.getByRole('button',{name:'Salvar produto',exact:true}).click();
      await page.waitForSelector('#product-form',{state:'hidden'});
      const stored=await page.evaluate(branch=>JSON.parse(localStorage.getItem('rdg-demo-v1:catalog:'+branch)).products.find(p=>p.name==='QA PAINEL '+branch),branch);
      assert.equal(stored.priceCents,2500);assert.match(stored.image,/^data:image\/jpeg;base64,/);
      await page.getByRole('button',{name:'Excluir QA PAINEL '+branch,exact:true}).click();
      await page.locator('[data-confirm-delete]').click();await page.waitForSelector('[data-confirm-delete]',{state:'hidden'});
      assert.equal(await page.locator('.table-img').count(),0);
    }
    await page.locator('[data-admin-tab=orders]').click();
    fs.mkdirSync('.qa',{recursive:true});
    for(const width of [320,390,1440]) {
      await page.setViewportSize({width,height:900});
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)){console.log(await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,els:[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1&&!el.closest('.table-wrap')).map(el=>({tag:el.tagName,cls:el.className,width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right})).slice(0,20)})));await page.screenshot({path:'.qa/admin-overflow.png'});}assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Admin overflow '+width);
      await page.screenshot({path:'.qa/admin-unified-'+width+'.png'});
    }
    await page.getByRole('button',{name:'Sair',exact:true}).click();
    await page.waitForSelector('#login-form');await page.reload();await page.waitForSelector('#login-form');
    assert.deepEqual(errors,[]);
    console.log('PASS unified admin: wrong password, all-store history, unit filters and totals, same-ID routing, customer consolidation, realtime updates, session restore/logout, per-store photo/edit/delete and responsive layout.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
