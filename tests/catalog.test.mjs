import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalize,makeLine} from '../js/core.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../data/catalog.json',import.meta.url)));
assert.equal(catalog.products.length,95);
assert.equal(new Set(catalog.products.map(p=>normalize(p.name))).size,catalog.products.length);
for(const p of catalog.products) {
  assert.ok(p.name.trim() && p.description.trim());
  assert.ok(!/\s{2,}/.test(p.name));
  assert.ok(catalog.categories.some(c=>c.id===p.categoryId));
  assert.ok(p.variants.length && p.variants.length<=20);
  assert.equal(new Set(p.variants.map(v=>v.id)).size,p.variants.length);
  assert.equal(new Set(p.variants.map(v=>normalize(v.name))).size,p.variants.length);
  assert.equal(p.priceCents,Math.min(...p.variants.map(v=>v.priceCents)));
  for(const v of p.variants) {
    assert.ok(v.name.trim());assert.ok(Number.isSafeInteger(v.priceCents)&&v.priceCents>0);
    assert.ok(makeLine(p,v.id,p.saleMode==='weight'?500:1).totalCents>0);
  }
  if(p.image)assert.ok(fs.existsSync(new URL('../'+p.image,import.meta.url)));
  if(p.reviewRequired)assert.equal(p.active,false);
}
assert.equal(catalog.products.find(p=>p.id==='6603797').variants.find(v=>v.name==='Com bacon').priceCents,2990);
for(const id of Object.keys(catalog.deduplicatedIds))assert.ok(!catalog.products.some(p=>p.id===id));
console.log('PASS: 95 unique products, reviewed text, category links, all variant prices/IDs, photos, duplicate removal and paused ambiguous records.');
