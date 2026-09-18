import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import fs from "node:fs";
const root = "./";
const env = await initializeTestEnvironment({
  projectId: "demo-rei-do-gado",
  firestore: {
    host: "127.0.0.1",
    port: 8080,
    rules: fs.readFileSync(root + "firestore.rules", "utf8"),
  },
});
await env.clearFirestore();
const seed = JSON.parse(fs.readFileSync(root + "data/catalog.json"));
const p = seed.products.find((p) => p.active);
const { id, ...product } = p;
await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, "admins", "admin-coronel"), {
    branchId: "coronel",
    enabled: true,
  });
  await setDoc(doc(db, "admins", "admin-bingen"), {
    branchId: "bingen",
    enabled: true,
  });
  await setDoc(doc(db, "branches/coronel/products", id), product);
  await setDoc(doc(db, "branches/coronel/products", "hidden"), {
    ...product,
    active: false,
  });
});
const client = env.authenticatedContext("customer-a").firestore();
const other = env.authenticatedContext("customer-b").firestore();
const admin = env.authenticatedContext("admin-coronel").firestore();
const bingen = env.authenticatedContext("admin-bingen").firestore();
const guest = env.unauthenticatedContext().firestore();
const line = {
  key: "a:0",
  productId: "a",
  variantId: "0",
  name: "Teste",
  variant: "Padrão",
  unit: "kg",
  saleMode: "weight",
  unitPriceCents: 6590,
  quantity: 1,
  grams: 750,
  weightGrams: 500,
  totalCents: 4943,
};
const order = {
  code: "TEST0001",
  customer: { name: "Teste QA", phone: "24999990001" },
  fulfillment: "pickup",
  payment: "Pix",
  address: "",
  changeFor: "",
  notes: "",
  branchId: "coronel",
  items: [line],
  totalCents: 4943,
  status: "pending",
  ownerUid: "customer-a",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
};
await assertSucceeds(
  getDocs(
    query(
      collection(guest, "branches/coronel/products"),
      where("active", "==", true),
    ),
  ),
);
await assertFails(getDocs(collection(guest, "branches/coronel/products")));
await assertSucceeds(getDoc(doc(client, "branches/coronel/orders/new-id")));
console.log("CREATE ONE");
await assertSucceeds(
  setDoc(doc(client, "branches/coronel/orders/order-1"), order),
);
console.log("CREATED ONE");
await assertSucceeds(getDoc(doc(client, "branches/coronel/orders/order-1")));
await assertFails(getDoc(doc(other, "branches/coronel/orders/order-1")));
await assertFails(getDocs(collection(client, "branches/coronel/orders")));
await assertSucceeds(getDocs(collection(admin, "branches/coronel/orders")));
await assertFails(getDocs(collection(bingen, "branches/coronel/orders")));
await assertFails(
  setDoc(doc(client, "admins/customer-a"), {
    branchId: "coronel",
    enabled: true,
  }),
);
await assertFails(
  updateDoc(doc(client, "branches/coronel/orders/order-1"), {
    status: "done",
    updatedAt: serverTimestamp(),
  }),
);
await assertSucceeds(
  updateDoc(doc(admin, "branches/coronel/orders/order-1"), {
    status: "preparing",
    updatedAt: serverTimestamp(),
  }),
);
await assertFails(
  updateDoc(doc(admin, "branches/coronel/orders/order-1"), {
    totalCents: 1,
    updatedAt: serverTimestamp(),
  }),
);
await assertFails(
  setDoc(doc(client, "branches/coronel/orders/negative"), {
    ...order,
    totalCents: -1,
  }),
);
await assertFails(
  setDoc(doc(client, "branches/coronel/orders/bad-phone"), {
    ...order,
    customer: { name: "Teste", phone: "abc" },
  }),
);
await assertSucceeds(
  setDoc(doc(admin, "branches/coronel/products/new-product"), product),
);
await assertFails(
  setDoc(doc(bingen, "branches/coronel/products/cross-unit"), product),
);
console.log("CREATE 10");
await assertSucceeds(
  setDoc(doc(client, "branches/coronel/orders/large"), {
    ...order,
    items: Array.from({ length: 10 }, (_, i) => ({ ...line, key: `${i}:0` })),
    totalCents: 4943 * 10,
  }),
);
await assertFails(
  setDoc(doc(client, "branches/coronel/orders/too-many"), {
    ...order,
    items: Array(11).fill(line),
    totalCents: 4943 * 11,
  }),
);
await assertFails(
  setDoc(doc(client, "branches/coronel/orders/bad-total"), {
    ...order,
    totalCents: 1,
  }),
);
console.log(
  "PASS 20 rule checks: public active-only catalog, private customer data, owner receipt, anonymous create, branch isolation, immutable orders, role escalation blocked, valid status, malformed data blocked, 10-line order.",
);
await env.cleanup();
