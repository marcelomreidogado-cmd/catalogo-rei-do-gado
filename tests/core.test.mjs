import assert from "node:assert/strict";
import {
  makeLine,
  parseFinalTotal,
  hasFinalTotal,
  orderTotalCents,
  orderStatus,
  orderKey,
  ordersForBranch,
  formatWeight,
  formatWeightWithGrams,
  lineTotal,
  cartTotal,
  whatsappUrl,
  whatsappMessage,
  groupCustomers,
  phoneBR,
  priceCart,
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
  { ...order, createdAt: 1, finalTotalCents: 30000 },
  {
    ...order,
    createdAt: 2,
    customer: { ...order.customer, name: "João atualizado" },
  },
]);
assert.equal(customers.length, 1);
assert.equal(customers[0].orders.length, 2);
assert.equal(customers[0].totalCents, 30000);
assert.equal(customers[0].unconfirmedCount, 1);
assert.equal(customers[0].name, "João atualizado");
const beef = { ...p, id: 'beef', active: true, sort: 0, saleMode: 'weight', categoryId: 'meat', priceCents: 5000, variants: [{id:'bife',name:'Bife',priceCents:5000}] };
const storeA = {categories:[{id:'meat',name:'Carnes',sort:0}],products:[beef]};
const storeB = {categories:storeA.categories,products:[{...beef,priceCents:6000,variants:[{id:'bife',name:'Bife',priceCents:6000},{id:'cubos',name:'Cubos',priceCents:6500}]}]};
const basket=[makeLine(beef,'bife',750)];
assert.equal(priceCart(basket,storeA).totalCents,3750);
assert.equal(priceCart(basket,storeB).totalCents,4500);
assert.equal(priceCart(basket,{...storeA,products:[{...beef,active:false}]}).unavailable.length,1);
assert.equal(priceCart(basket,{...storeA,products:[{...beef,saleMode:'piece'}]}).unavailable.length,1);
assert.equal(storeA.products[0].variants[0].priceCents,5000);
for(const input of ['125,90','125.90'])assert.equal(parseFinalTotal(input),12590);
for(const input of ['0','-1','NaN','1e3','1.234','1,234','10000001',''])assert.throws(()=>parseFinalTotal(input));
assert.equal(orderTotalCents({...order,finalTotalCents:45000}),45000);
assert.equal(orderTotalCents(order),order.totalCents);
assert.equal(hasFinalTotal(order),false);
assert.equal(orderStatus({status:'preparing'}),'pending');
assert.equal(orderStatus({status:'delivery'}),'pending');
console.log(
  "PASS: centavo rounding, whole-piece weight, fractions, sum, phone normalization, encoded WhatsApp and customer grouping.",
);

const sameIds = ["coronel", "bingen", "correas"].map(branchId => ({id:"same-id",branchId}));
assert.equal(new Set(sameIds.map(orderKey)).size, 3);
assert.equal(ordersForBranch(sameIds, "all").length, 3);
assert.deepEqual(ordersForBranch(sameIds, "bingen"), [sameIds[1]]);
