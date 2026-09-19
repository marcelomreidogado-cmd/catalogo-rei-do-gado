import assert from "node:assert/strict";
import {
  makeLine,
  formatWeight,
  formatWeightWithGrams,
  lineTotal,
  cartTotal,
  whatsappUrl,
  whatsappMessage,
  groupCustomers,
  phoneBR,
  mergeCatalogs,
  priceCartForBranch,
} from "../js/core.js";
const p = {
  id: "p",
  name: "Picanha",
  unit: "kg",
  saleMode: "piece",
  weightGrams: 1400,
  variants: [{ id: "0", name: "Kg", priceCents: 10490 }],
};
const l = makeLine(p, "0", 2);
assert.equal(l.grams, 2800);
assert.equal(l.totalCents, 29372);
const fraction = makeLine({ ...p, saleMode: "weight" }, "0", 250);
assert.equal(fraction.totalCents, 2623);
assert.equal(cartTotal([l, fraction]), 31995);
assert.equal(phoneBR("+55 (24) 99217-7114"), "24992177114");
const order = {
  code: "ABC12345",
  customer: { name: "João & Maria", phone: "24999990001" },
  items: [l],
  totalCents: 29372,
  fulfillment: "delivery",
  address: "Rua A, 10",
  payment: "Pix",
  notes: "Sem cortar",
};
const message = whatsappMessage(order, { name: "Corrêas" });
const url = whatsappUrl("5524981754161", message);
assert.ok(decodeURIComponent(url).includes("João & Maria"));
assert.ok(message.includes("*Item - Picanha*"));
assert.ok(message.includes("*Quantidade: 2 PEÇAS*"));
assert.ok(message.includes("*Peso total estimado: 2,800 kg*"));
assert.doesNotMatch(message, /^\d+\. /m);
assert.equal(formatWeight(500), "0,500 kg");
assert.equal(formatWeight(1300), "1,300 kg");
assert.equal(formatWeight(1000), "1,000 kg");
assert.equal(formatWeightWithGrams(500), "0,500 kg (500 g)");
const weightedMessage = whatsappMessage({...order, items: [makeLine({...p, saleMode: "weight"}, "0", 500), makeLine({...p, weightGrams: 700}, "0", 1)]}, {name:"Coronel"});
assert.ok(weightedMessage.includes("*Quantidade: 0,500 kg (500 g)*"));
assert.ok(weightedMessage.includes("*Quantidade: 1 PEÇA*"));
assert.ok(weightedMessage.includes("*Peso total estimado: 0,700 kg (700 g)*"));
assert.equal(new URL(url).searchParams.get("text"), message);
assert.throws(() => whatsappUrl("", message));
const customers = groupCustomers([
  { ...order, createdAt: 1 },
  {
    ...order,
    createdAt: 2,
    customer: { ...order.customer, name: "João atualizado" },
  },
]);
assert.equal(customers.length, 1);
assert.equal(customers[0].orders.length, 2);
assert.equal(customers[0].totalCents, 58744);
assert.equal(customers[0].name, "João atualizado");
const beef = { ...p, id: 'beef', active: true, sort: 0, saleMode: 'weight', categoryId: 'meat', priceCents: 5000, variants: [{id:'bife',name:'Bife',priceCents:5000}] };
const storeA = {categories:[{id:'meat',name:'Carnes',sort:0}],products:[beef]};
const storeB = {categories:storeA.categories,products:[{...beef,priceCents:6000,variants:[{id:'bife',name:'Bife',priceCents:6000},{id:'cubos',name:'Cubos',priceCents:6500}]}]};
const storefront = mergeCatalogs([storeA,storeB]);
assert.equal(storefront.products.length,1);
assert.equal(storefront.products[0].priceVariesByStore,true);
assert.equal(storefront.products[0].variants.length,2);
assert.equal(storefront.products[0].priceCents,5000);
const basket=[makeLine(storefront.products[0],'bife',750)];
assert.equal(priceCartForBranch(basket,storeA).totalCents,3750);
assert.equal(priceCartForBranch(basket,storeB).totalCents,4500);
assert.equal(priceCartForBranch([makeLine(storefront.products[0],'cubos',500)],storeA).unavailable.length,1);
assert.equal(priceCartForBranch(basket,{...storeA,products:[{...beef,active:false}]}).unavailable.length,1);
assert.equal(priceCartForBranch(basket,{...storeA,products:[{...beef,saleMode:'piece'}]}).unavailable.length,1);
assert.equal(storeA.products[0].variants[0].priceCents,5000);
console.log(
  "PASS: centavo rounding, whole-piece weight, fractions, sum, phone normalization, encoded WhatsApp and customer grouping.",
);
