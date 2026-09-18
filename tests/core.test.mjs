import assert from "node:assert/strict";
import {
  makeLine,
  lineTotal,
  cartTotal,
  whatsappUrl,
  whatsappMessage,
  groupCustomers,
  phoneBR,
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
assert.ok(message.includes("2,8 kg"));
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
console.log(
  "PASS: centavo rounding, whole-piece weight, fractions, sum, phone normalization, encoded WhatsApp and customer grouping.",
);
