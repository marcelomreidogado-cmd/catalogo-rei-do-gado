import { CONFIG } from "./config.js?v=20260921-admin-unico";
import { cartTotal, makeLine, mergeCatalogs } from "./core.js?v=20260921-admin-unico";
export const isDemo = CONFIG.demo && !CONFIG.firebase.projectId;
const prefix = "rdg-demo-v1:";
let sdk, db, auth, adminAuth, storage;
let seed;
const memory = new Map();
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(prefix + key)) ?? fallback;
  } catch {
    return memory.get(key) ?? fallback;
  }
};
const write = (key, value) => {
  localStorage.setItem(prefix + key, JSON.stringify(value));
  memory.set(key, value);
};
const clone = (value) => JSON.parse(JSON.stringify(value));
const toRecord = (doc) => {
  const record = {
    ...doc.data(),
    id: doc.id,
    ...(doc.data().createdAt?.toMillis
      ? { createdAt: doc.data().createdAt.toMillis() }
      : {}),
  };
  if (Array.isArray(record.items))
    record.items = record.items.map((line) => ({
      ...line,
      name: String(line.name || "Item"),
      variant: typeof line.variant === "string" ? line.variant : "",
      unit: ["kg", "un"].includes(line.unit) ? line.unit : "un",
      saleMode: ["weight", "piece", "unit"].includes(line.saleMode)
        ? line.saleMode
        : "unit",
      quantity:
        Number.isFinite(line.quantity) && line.quantity > 0 ? line.quantity : 1,
      grams: Number.isFinite(line.grams) && line.grams >= 0 ? line.grams : 0,
      unitPriceCents: Number.isFinite(line.unitPriceCents)
        ? line.unitPriceCents
        : line.totalCents,
    }));
  return record;
};
export async function initialize() {
  const response = await fetch("data/catalog.json", { cache: "no-cache" });
  if (!response.ok)
    throw new Error("Não foi possível carregar o catálogo inicial.");
  seed = await response.json();
  if (isDemo) return;
  if (!CONFIG.firebase.projectId || !CONFIG.firebase.apiKey)
    throw new Error("A conexão da loja ainda não foi configurada.");
  const base = `https://www.gstatic.com/firebasejs/${CONFIG.firebaseSdkVersion}`;
  const [appSDK, fs, a] = await Promise.all([
    import(`${base}/firebase-app.js`),
    import(`${base}/firebase-firestore.js`),
    import(`${base}/firebase-auth.js`),
  ]);
  sdk = { ...fs, ...a };
  const app = appSDK.initializeApp(CONFIG.firebase);
  const adminApp = appSDK.initializeApp(CONFIG.firebase, "admin");
  db = fs.initializeFirestore(
    app,
    { experimentalForceLongPolling: true },
    CONFIG.databaseId,
  );
  auth = a.getAuth(app);
  adminAuth = a.getAuth(adminApp);
  await a.setPersistence(adminAuth, a.browserSessionPersistence);
  await auth.authStateReady();
  if (CONFIG.imageMode === "storage") {
    const s = await import(`${base}/firebase-storage.js`);
    sdk = { ...sdk, ...s };
    storage = s.getStorage(adminApp);
  }
  // Separate Firebase app/auth for the admin: customer sessions never become store accounts.
  const adminDB = fs.initializeFirestore(
    adminApp,
    { experimentalForceLongPolling: true },
    CONFIG.databaseId,
  );
  sdk.adminDB = adminDB;
}
function demoCatalog(branch) {
  const c = read(`catalog:${branch}`, null);
  return c || clone(seed);
}
export async function getCatalog(branch, admin = false) {
  if (isDemo) return demoCatalog(branch);
  const useDB = admin ? sdk.adminDB : db;
  const productCollection = sdk.collection(
    useDB,
    "branches",
    branch,
    "products",
  );
  const productQuery = admin
    ? productCollection
    : sdk.query(productCollection, sdk.where("active", "==", true));
  const [categories, products] = await Promise.all([
    sdk.getDocs(sdk.collection(useDB, "branches", branch, "categories")),
    sdk.getDocs(productQuery),
  ]);
  return {
    categories: categories.docs.map(toRecord).sort((a, b) => a.sort - b.sort),
    products: products.docs.map(toRecord).sort((a, b) => a.sort - b.sort),
  };
}
export async function getStorefrontCatalog() {
  return mergeCatalogs(await Promise.all(CONFIG.branches.map(b => getCatalog(b.id))));
}
export function refreshSavedCart(lines, catalog) {
  const restored = new Map();
  for (const line of lines) {
    const productId = seed.deduplicatedIds?.[line.productId] || line.productId;
    const variantId = seed.variantRedirects?.[line.productId]?.[line.variantId] || line.variantId;
    const p = catalog.products.find(p => p.id === productId && p.active);
    const next = p && p.saleMode === line.saleMode && p.unit === line.unit && p.variants.some(v => v.id === variantId)
      ? makeLine(p, variantId, line.saleMode === 'weight' ? line.grams : line.quantity) : line;
    const prior = restored.get(next.key);
    if (prior && p) restored.set(next.key, makeLine(p, variantId, next.saleMode === 'weight' ? prior.grams + next.grams : prior.quantity + next.quantity));
    else restored.set(next.key, next);
  }
  return [...restored.values()];
}
export async function login(password) {
  if (isDemo) {
    if (password !== CONFIG.demoPassword) throw new Error("Senha incorreta.");
    sessionStorage.setItem(prefix + "admin", "owner");
    return { role: "owner", enabled: true };
  }
  const { user } = await sdk.signInWithEmailAndPassword(adminAuth, CONFIG.adminEmail, password);
  try {
    const profile = await sdk.getDoc(sdk.doc(sdk.adminDB, "admins", user.uid));
    if (!profile.exists() || profile.data().role !== "owner" || !profile.data().enabled)
      throw new Error("Este acesso não está autorizado para a administração.");
    return profile.data();
  } catch (error) {
    await sdk.signOut(adminAuth);
    throw error;
  }
}
export async function session() {
  if (isDemo) return sessionStorage.getItem(prefix + "admin") === "owner" ? { role: "owner", enabled: true } : null;
  await adminAuth.authStateReady();
  if (!adminAuth.currentUser) return null;
  const profile = await sdk.getDoc(sdk.doc(sdk.adminDB, "admins", adminAuth.currentUser.uid));
  if (profile.exists() && profile.data().enabled && profile.data().role === "owner") return profile.data();
  await sdk.signOut(adminAuth);
  return null;
}
export async function logout() {
  if (isDemo) sessionStorage.removeItem(prefix + "admin");
  else await sdk.signOut(adminAuth);
}
export async function saveEntity(branch, type, record) {
  if (isDemo) {
    const c = demoCatalog(branch);
    const index = c[type].findIndex((x) => x.id === record.id);
    index < 0 ? c[type].push(record) : c[type].splice(index, 1, record);
    write(`catalog:${branch}`, c);
    return;
  }
  const { id, ...data } = record;
  await sdk.setDoc(sdk.doc(sdk.adminDB, "branches", branch, type, id), data);
}
export async function deleteEntity(branch, type, id) {
  if (isDemo) {
    const c = demoCatalog(branch);
    c[type] = c[type].filter((x) => x.id !== id);
    write(`catalog:${branch}`, c);
    return;
  }
  await sdk.deleteDoc(sdk.doc(sdk.adminDB, "branches", branch, type, id));
}
export async function seedCatalog(branch) {
  if (isDemo) {
    write(`catalog:${branch}`, clone(seed));
    return;
  }
  const existing = await getCatalog(branch, true);
  const batch = sdk.writeBatch(sdk.adminDB);
  for (const type of ["categories", "products"])
    for (const record of seed[type])
      if (!existing[type].some((x) => x.id === record.id)) {
        const { id, ...data } = record;
        batch.set(sdk.doc(sdk.adminDB, "branches", branch, type, id), data);
      }
  await batch.commit();
}
export function subscribeOrders(branch, onData, onError) {
  if (isDemo) {
    let first = true;
    let old = "";
    const emit = () => {
      try {
        const orders = read(`orders:${branch}`, []);
        const sig = JSON.stringify(orders);
        if (first || sig !== old) {
          onData(orders.sort((a, b) => b.createdAt - a.createdAt));
          first = false;
          old = sig;
        }
      } catch (e) {
        onError(e);
      }
    };
    emit();
    const interval = setInterval(emit, 1500);
    return () => clearInterval(interval);
  }
  // Real-time is required: new orders must appear immediately on the store counter.
  return sdk.onSnapshot(
    sdk.query(
      sdk.collection(sdk.adminDB, "branches", branch, "orders"),
      sdk.orderBy("createdAt", "desc"),
    ),
    (s) => onData(s.docs.map(toRecord)),
    onError,
  );
}
// Each store remains a separate collection; aggregate live snapshots without losing its identity.
export function subscribeAllOrders(onData, onError) {
  const snapshots = new Map(), stops = [];
  let stopped = false;
  for (const branch of CONFIG.branches) {
    if (stopped) break;
    stops.push(subscribeOrders(branch.id, rows => {
      if (stopped) return;
      snapshots.set(branch.id, rows.map(order => ({ ...order, branchId: branch.id })));
      if (snapshots.size === CONFIG.branches.length)
        onData([...snapshots.values()].flat().sort((a, b) => b.createdAt - a.createdAt));
    }, error => {
      if (stopped) return;
      stopped = true;
      stops.forEach(stop => stop());
      onError(error);
    }));
  }
  return () => { stopped = true; stops.forEach(stop => stop()); };
}
export async function updateStatus(branch, id, status) {
  if (isDemo) {
    const orders = read(`orders:${branch}`, []);
    const order = orders.find((x) => x.id === id);
    if (!order) throw new Error("Pedido não encontrado.");
    order.status = status;
    write(`orders:${branch}`, orders);
    return;
  }
  await sdk.updateDoc(sdk.doc(sdk.adminDB, "branches", branch, "orders", id), {
    status,
    updatedAt: sdk.serverTimestamp(),
  });
}
export async function saveOrder(branch, id, checkout, lines) {
  if (!lines.length) throw new Error("Sua sacola está vazia.");
  if (!isDemo && !auth.currentUser) await sdk.signInAnonymously(auth);
  // Reload authoritative prices immediately before creating the immutable snapshot.
  const catalog = await getCatalog(branch);
  const items = lines.map((line) => {
    const p = catalog.products.find((p) => p.id === line.productId && p.active);
    if (!p)
      throw new Error(
        `${line.name} não está disponível. Remova da sacola para continuar.`,
      );
    const variant = p.variants.find((v) => v.id === line.variantId);
    if (!variant) throw new Error(`Escolha novamente a opção de ${p.name}.`);
    const current = makeLine(
      p,
      line.variantId,
      line.saleMode === "weight" ? line.grams : line.quantity,
    );
    if (
      current.unit !== line.unit ||
      current.saleMode !== line.saleMode ||
      current.totalCents !== line.totalCents ||
      current.unitPriceCents !== line.unitPriceCents ||
      current.grams !== line.grams ||
      current.variant !== line.variant
    )
      throw new Error(
        `O preço ou peso de ${p.name} mudou. Remova o item e adicione novamente para conferir.`,
      );
    return current;
  });
  const order = {
    id,
    code: id.slice(0, 8).toUpperCase(),
    ...checkout,
    branchId: branch,
    items,
    totalCents: cartTotal(items),
    status: "pending",
    createdAt: Date.now(),
  };
  if (isDemo) {
    const orders = read(`orders:${branch}`, []);
    const existing = orders.find((o) => o.id === id);
    if (existing) return existing;
    orders.push(order);
    write(`orders:${branch}`, orders);
    return order;
  }
  const ref = sdk.doc(db, "branches", branch, "orders", id);
  return sdk.runTransaction(db, async (transaction) => {
    const existing = await transaction.get(ref);
    if (existing.exists()) return toRecord(existing);
    const { id: omit, ...data } = order;
    transaction.set(ref, {
      ...data,
      ownerUid: auth.currentUser.uid,
      createdAt: sdk.serverTimestamp(),
      updatedAt: sdk.serverTimestamp(),
    });
    return order;
  });
}
export async function uploadImage(branch, file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type))
    throw new Error("Escolha uma imagem JPG, PNG ou WebP.");
  if (file.size > 12 * 1024 * 1024)
    throw new Error("A foto deve ter no máximo 12 MB.");
  const img = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const ratio = Math.min(1, 900 / Math.max(img.width, img.height));
  canvas.width = Math.round(img.width * ratio);
  canvas.height = Math.round(img.height * ratio);
  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
  img.close();
  let data = "";
  for (let quality = 0.82; quality >= 0.25; quality -= 0.1) {
    data = canvas.toDataURL("image/jpeg", quality);
    if (data.length <= CONFIG.maxImageBytes) break;
  }
  if (data.length > CONFIG.maxImageBytes)
    throw new Error(
      "A foto é muito detalhada. Escolha uma menor para continuar.",
    );
  if (isDemo || CONFIG.imageMode === "firestore")
    return { image: data, imagePath: "" };
  const imagePath = `branches/${branch}/products/${crypto.randomUUID()}.jpg`;
  const ref = sdk.ref(storage, imagePath);
  await sdk.uploadString(ref, data, "data_url", { contentType: "image/jpeg" });
  return { image: await sdk.getDownloadURL(ref), imagePath };
}
export async function deleteImage(path) {
  if (!isDemo && storage && path)
    await sdk.deleteObject(sdk.ref(storage, path)).catch(() => {});
}
export async function changePassword(currentPassword, newPassword) {
  if (isDemo)
    throw new Error("No modo de demonstração, altere a senha em config.js.");
  const credential = sdk.EmailAuthProvider.credential(
    adminAuth.currentUser.email,
    currentPassword,
  );
  await sdk.reauthenticateWithCredential(adminAuth.currentUser, credential);
  await sdk.updatePassword(adminAuth.currentUser, newPassword);
}
