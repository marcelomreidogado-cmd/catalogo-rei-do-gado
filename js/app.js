import { CONFIG } from "./config.js?v=20260918-firebase2";
import * as data from "./data.js?v=20260918-firebase2";
import {
  money,
  escapeHTML as e,
  normalize,
  phoneBR,
  validatePhone,
  formatWeight,
  STATUSES,
  makeLine,
  lineTotal,
  lineQuantity,
  cartTotal,
  groupCustomers,
  whatsappMessage,
  whatsappUrl,
} from "./core.js";
const $ = (s) => document.querySelector(s);
const paths = {
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  close: "m6 6 12 12M6 18 18 6",
  chevron: "m9 5 7 7-7 7",
  down: "m6 9 6 6 6-6",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  bag: "M5 7h14l1 14H4L5 7ZM8 8V6a4 4 0 0 1 8 0v2",
  search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  check: "m5 12 4 4L19 6",
  edit: "m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15v5Z",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6",
  grid: "M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z",
  orders: "M6 3h12v18l-3-2-3 2-3-2-3 2V3ZM9 7h6M9 11h6",
  users:
    "M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4 21v-3a8 8 0 0 1 16 0v3M20 5a3 3 0 0 1 0 6",
  logout: "M10 4H4v16h6m4-4 4-4-4-4M8 12h13",
  clock: "M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  truck:
    "M1 4h14v12H1ZM15 9h4l4 5v2h-8M8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm13 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0",
  upload: "M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6",
};
const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.grid}"/></svg>`;
const storageRead = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const params = new URLSearchParams(location.search);
const knownBranch = (id) => CONFIG.branches.find((b) => b.id === id);
let branchId =
  knownBranch(params.get("unit"))?.id || storageRead("rdg-unit", null);
if (!knownBranch(branchId)) branchId = null;
let catalog = { categories: [], products: [] },
  cart = [],
  category = "all",
  search = "",
  admin = null,
  adminTab = "orders",
  orders = [],
  ordersLoaded = false,
  orderFilter = "all",
  adminSearch = "",
  unsubscribe = null,
  modalReturnFocus = null,
  pendingProduct = null,
  checkoutId = null,
  lastOrder = null;
const branch = () => knownBranch(branchId) || CONFIG.branches[0];
const currentAdminBranch = () => knownBranch(admin?.branchId);
const cartKey = () => `rdg-cart-v2:${branchId}`;
function loadCart() {
  cart = storageRead(cartKey(), []).filter(
    (x) =>
      x &&
      x.productId &&
      Number.isFinite(x.grams) &&
      Number.isFinite(x.quantity) &&
      x.quantity > 0 &&
      x.grams >= 0,
  );
}
function persistCart() {
  try {
    localStorage.setItem(cartKey(), JSON.stringify(cart));
  } catch {
    toast("A sacola ficará salva apenas enquanto esta página estiver aberta.");
  }
}
function toast(message) {
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("#toast").classList.remove("visible"), 4500);
}
const errorText = (error) =>
  ({
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/too-many-requests":
      "Muitas tentativas. Aguarde um pouco e tente novamente.",
    "permission-denied":
      "Seu acesso não permite esta ação. Entre novamente ou confira a configuração da loja.",
    unavailable:
      "Sem conexão com a loja. Confira sua internet e tente novamente.",
    "resource-exhausted":
      "O serviço atingiu o limite de uso. Tente novamente mais tarde.",
  })[error?.code] ||
  error?.message ||
  "Não foi possível concluir. Tente novamente.";
function modal(title, body) {
  const d = $("#modal");
  if (!d.open) modalReturnFocus = document.activeElement;
  d.innerHTML = `<div class="modal-head"><h2 id="modal-title">${e(title)}</h2><button class="icon-btn" data-action="close" aria-label="Fechar">${icon("close")}</button></div><div class="modal-body">${body}</div>`;
  if (!d.open) d.showModal();
}
function closeModal() {
  $("#modal").close();
  modalReturnFocus?.focus?.();
}
$("#modal").addEventListener("click", (event) => {
  if (event.target === $("#modal")) closeModal();
});
const brandHTML = `<a class="brand" href="./"><img src="assets/logo.jpg" alt="Rei do Gado"><div><strong>REI DO GADO</strong><small>CASA DE CARNES</small></div></a>`;
function footer() {
  return `<footer class="wrap"><div class="foot"><span>© ${new Date().getFullYear()} Rei do Gado • Casa de Carnes<br>Petrópolis, RJ</span><a href="?view=admin">Área da loja ${icon("arrow")}</a></div></footer>`;
}
function renderCatalog() {
  const b = branch();
  document.title = "Rei do Gado • Casa de Carnes";
  $("#app").innerHTML =
    `<div class="topbar"><header class="header wrap">${brandHTML}<div class="header-actions"><button class="location" data-action="branches">${icon("pin")}<span><small>${branchId ? "Você está na unidade" : "Qual é a sua unidade?"}</small><b>${branchId ? e(b.name) : "Escolha uma loja"}</b></span>${icon("down")}</button><button class="cart-top" data-action="cart">${icon("bag")} Minha sacola <span class="count" data-count>0</span></button></div></header></div>${data.isDemo ? '<div class="demo-strip">Demonstração • pedidos de teste, salvos apenas neste navegador</div>' : ""}<section class="intro"><div class="wrap intro-inner"><div><div class="eyebrow">DO NOSSO BALCÃO PARA A SUA MESA</div><h1>Carne de qualidade.<br><span>Do seu jeito.</span></h1><p>Seus cortes favoritos, com o cuidado de sempre.</p></div><div class="intro-note">${icon("bag")}<strong>O ponto de partida<br>de uma boa refeição.</strong>Escolha os cortes.<br>A gente cuida do preparo.</div></div></section><main class="wrap" id="main"><div class="catalog-toolbar"><div><h2 class="section-title">Nosso balcão</h2><p class="subtle">${branchId ? "Unidade " + e(b.name) : "Escolha sua unidade para fazer o pedido."}</p></div><label class="search">${icon("search")}<input id="search" type="search" placeholder="Qual corte você procura?" aria-label="Buscar produtos" value="${e(search)}"></label></div><nav class="categories" aria-label="Categorias"><button class="chip ${category === "all" ? "active" : ""}" data-category="all" aria-pressed="${category === "all"}">Todos os produtos</button>${catalog.categories.map((c) => `<button class="chip ${category === c.id ? "active" : ""}" data-category="${e(c.id)}" aria-pressed="${category === c.id}">${e(c.name)}</button>`).join("")}</nav><div class="catalog-layout"><div id="products"></div><aside class="cart-panel" id="desktop-cart" aria-label="Sua sacola"></aside></div></main>${footer()}<button class="mobile-cart" data-action="cart"><span class="count" data-count>0</span><span>Ver minha sacola</span><span class="mobile-total" data-total>R$ 0,00</span>${icon("arrow")}</button>`;
  renderProducts();
  renderCart();
}
function productCard(p) {
  const varies = new Set(p.variants.map((v) => v.priceCents)).size > 1;
  const desc =
    p.saleMode === "piece"
      ? `Peça com aprox. ${formatWeight(p.weightGrams)}`
      : p.unit === "kg"
        ? "Escolha o corte e a quantidade"
        : p.description || "Seleção Rei do Gado";
  return `<article class="product"><div class="product-photo ${p.image ? "" : "placeholder"}"><img src="${safeImage(p.image)}" alt="${e(p.image ? p.name : "Foto ainda não disponível")}" loading="lazy" width="300" height="200">${p.saleMode === "piece" ? '<span class="tag">PEÇA • PESO ESTIMADO</span>' : ""}</div><div class="product-body"><h3>${e(p.name)}</h3><p class="product-desc">${e(desc)}</p><div class="product-bottom"><div><span class="price-label">${varies ? "A partir de" : "Preço por " + (p.unit === "kg" ? "quilo" : "unidade")}</span><span class="price">${money(p.priceCents)} <small>/${p.unit}</small></span></div><button class="add" data-product="${e(p.id)}" aria-label="Adicionar ${e(p.name)}">${icon("plus")}</button></div></div></article>`;
}
function safeImage(url) {
  return url &&
    /^(assets\/|data:image\/(jpeg|png|webp);base64,|https:\/\/)/.test(url)
    ? e(url)
    : "assets/logo.jpg";
}
function renderProducts() {
  const visible = catalog.products.filter(
    (p) =>
      p.active &&
      (category === "all" || p.categoryId === category) &&
      normalize(p.name + " " + p.description).includes(normalize(search)),
  );
  $("#products").innerHTML = visible.length
    ? catalog.categories
        .filter((c) => visible.some((p) => p.categoryId === c.id))
        .map(
          (c) =>
            `<section class="product-section"><div class="product-heading"><h2>${e(c.name)}</h2><span>${visible.filter((p) => p.categoryId === c.id).length} opções</span></div><div class="product-grid">${visible
              .filter((p) => p.categoryId === c.id)
              .map(productCard)
              .join("")}</div></section>`,
        )
        .join("")
    : `<div class="empty-state"><h3>${search ? "Não encontramos esse corte." : "O balcão está sendo preparado."}</h3><p class="subtle">${search ? "Tente outro nome ou escolha uma categoria." : "Os produtos desta unidade aparecerão aqui em breve."}</p>${search ? '<button class="btn ghost" data-action="clear-search" style="margin-top:20px">Limpar busca</button>' : ""}</div>`;
}
function cartContent() {
  return `<div class="cart-title"><h2>${icon("bag")} Sua sacola</h2><span class="count">${cart.length}</span></div>${cart.length ? `<div>${cart.map((line) => `<div class="cart-line"><div class="cart-line-top"><strong>${e(line.name)}</strong><button data-remove="${e(line.key)}" aria-label="Remover ${e(line.name)}">${icon("close")}</button></div><small>${e(line.variant)}${line.saleMode === "piece" ? " • aprox. " + formatWeight(line.grams) : ""}</small><div class="line-controls"><div class="stepper"><button data-quantity="${e(line.key)}" data-delta="-1" aria-label="Diminuir ${e(line.name)}">${icon("minus")}</button><span>${lineQuantity(line)}</span><button data-quantity="${e(line.key)}" data-delta="1" aria-label="Aumentar ${e(line.name)}">${icon("plus")}</button></div><strong style="font-size:14px">${money(lineTotal(line))}</strong></div></div>`).join("")}</div>` : `<div class="cart-empty">${icon("bag")}<strong>O melhor corte é a sua escolha.</strong><p>Adicione seus favoritos e<br>monte seu pedido.</p></div>`}<div class="cart-footer"><div class="total-row"><span>Total estimado</span><strong>${money(cartTotal(cart))}</strong></div><button class="btn wide" data-action="checkout" ${!cart.length ? "disabled" : ""}>Continuar pedido ${icon("arrow")}</button><p class="fine">O valor dos cortes por kg é confirmado após a pesagem. Entrega a combinar.</p></div>`;
}
function renderCart() {
  if ($("#desktop-cart")) $("#desktop-cart").innerHTML = cartContent();
  if ($("#modal-cart")) $("#modal-cart").innerHTML = cartContent();
  document
    .querySelectorAll("[data-count]")
    .forEach((el) => (el.textContent = cart.length));
  document
    .querySelectorAll("[data-total]")
    .forEach((el) => (el.textContent = money(cartTotal(cart))));
}
function chooseBranch() {
  modal(
    "Qual unidade vai atender você?",
    `<p class="subtle">Escolha sua loja. Seu pedido vai direto para o WhatsApp dessa unidade.</p>${CONFIG.branches.map((b) => `<button class="branch-option ${b.id === branchId ? "selected" : ""}" data-branch="${b.id}">${icon("pin")}<span><strong>Unidade ${e(b.name)}</strong><small>${e(b.address)}</small></span>${icon(b.id === branchId ? "check" : "chevron")}</button>`).join("")}${cart.length ? '<p class="fine">Sua sacola atual fica guardada nesta unidade.</p>' : ""}`,
  );
}
async function changeBranch(id) {
  if (!knownBranch(id)) return;
  const next = await data.getCatalog(id);
  branchId = id;
  try {
    localStorage.setItem("rdg-unit", JSON.stringify(id));
  } catch {}
  catalog = next;
  category = "all";
  search = "";
  checkoutId = null;
  loadCart();
  closeModal();
  renderCatalog();
  if (pendingProduct) {
    const p = pendingProduct;
    pendingProduct = null;
    openProduct(p);
  }
}
function openProduct(id) {
  if (!branchId) {
    pendingProduct = id;
    chooseBranch();
    return;
  }
  const p = catalog.products.find((x) => x.id === id && x.active);
  if (!p) {
    toast("Este produto não está disponível nesta unidade.");
    return;
  }
  let amount = p.saleMode === "weight" ? 500 : 1;
  modal(
    p.name,
    `<form id="add-product" data-id="${e(p.id)}"><img class="product-detail-img" src="${safeImage(p.image)}" alt="${e(p.name)}"><p class="product-detail-desc">${e(p.description || "Selecione a quantidade desejada.")}</p>${p.variants.length > 1 ? `<label class="field">Como você prefere?<select name="variant">${p.variants.map((v) => `<option value="${e(v.id)}">${e(v.name)} • ${money(v.priceCents)}/${p.unit}</option>`).join("")}</select></label>` : `<input name="variant" type="hidden" value="${e(p.variants[0].id)}">`}<label class="field">${p.saleMode === "weight" ? "Quantidade em kg" : p.saleMode === "piece" ? "Quantidade de peças" : "Quantidade de unidades"}<input name="amount" type="number" inputmode="decimal" min="${p.saleMode === "weight" ? ".25" : "1"}" max="${p.saleMode === "weight" ? "30" : "30"}" step="${p.saleMode === "weight" ? ".25" : "1"}" value="${p.saleMode === "weight" ? ".5" : "1"}" required></label>${p.unit === "kg" ? `<div class="notice">${p.saleMode === "piece" ? `Cada peça pesa aproximadamente ${formatWeight(p.weightGrams)}. ` : ""}O valor final depende da pesagem na loja.</div>` : ""}<div class="total-row"><span>Valor estimado</span><strong id="product-total">${money(makeLine(p, p.variants[0].id, amount).totalCents)}</strong></div><button class="btn wide" type="submit">${icon("plus")} Adicionar à sacola</button></form>`,
  );
}
function addProduct(form) {
  const p = catalog.products.find((x) => x.id === form.dataset.id);
  const fd = new FormData(form);
  const amount =
    Number(fd.get("amount")) * (p.saleMode === "weight" ? 1000 : 1);
  const line = makeLine(p, fd.get("variant"), amount);
  const existing = cart.find((x) => x.key === line.key);
  if (!existing && cart.length >= CONFIG.maxCartLines)
    throw new Error(
      `Adicione no máximo ${CONFIG.maxCartLines} opções por pedido.`,
    );
  if (existing) {
    const next =
      p.saleMode === "weight"
        ? existing.grams + amount
        : existing.quantity + amount;
    if (next > (p.saleMode === "weight" ? 30000 : 30))
      throw new Error("Quantidade máxima por item atingida.");
    Object.assign(existing, makeLine(p, line.variantId, next));
  } else cart.push(line);
  checkoutId = null;
  persistCart();
  renderCart();
  closeModal();
  toast(`${p.name} adicionado à sacola.`);
}
function adjustQuantity(key, delta) {
  const line = cart.find((x) => x.key === key);
  if (!line) return;
  const next =
    line.saleMode === "weight"
      ? line.grams + delta * 250
      : line.quantity + delta;
  if (next <= 0) {
    cart = cart.filter((x) => x.key !== key);
  } else {
    if (next > (line.saleMode === "weight" ? 30000 : 30))
      return toast("Quantidade máxima por item atingida.");
    if (line.saleMode === "weight") line.grams = next;
    else {
      line.quantity = next;
      if (line.unit === "kg") line.grams = line.weightGrams * next;
    }
    line.totalCents = lineTotal(line);
  }
  checkoutId = null;
  persistCart();
  renderCart();
}
function checkout() {
  if (!cart.length) return;
  if (!branchId) return chooseBranch();
  modal(
    "Vamos fechar seu pedido",
    `<p class="subtle" style="margin-bottom:20px">Unidade ${e(branch().name)} • ${cart.length} opções na sacola</p>${data.isDemo ? '<div class="notice">Demonstração: use dados fictícios. O pedido ficará apenas neste navegador e nenhuma mensagem será enviada.</div>' : ""}<form id="checkout-form"><label class="field">Seu nome<input name="name" autocomplete="name" minlength="2" maxlength="80" placeholder="Como podemos chamar você?" required></label><label class="field">Telefone com DDD<input name="phone" type="tel" autocomplete="tel-national" maxlength="20" placeholder="(24) 99999-9999" required></label><div class="fields-row"><label class="field">Como deseja receber?<select name="fulfillment"><option value="pickup">Retirar na loja</option><option value="delivery">Entrega em domicílio</option></select></label><label class="field">Pagamento<select name="payment"><option>Pix</option><option>Cartão de crédito</option><option>Cartão de débito</option><option>Dinheiro</option></select></label></div><div id="address-field" class="hidden"><label class="field">Endereço completo<textarea name="address" maxlength="400" placeholder="Rua, número, bairro e complemento"></textarea></label><p class="fine" style="margin-top:-8px;margin-bottom:18px">Taxa e prazo de entrega serão confirmados pelo WhatsApp.</p></div><div id="change-field" class="hidden"><label class="field">Precisa de troco para quanto?<input name="changeFor" maxlength="40" placeholder="Ex.: R$ 200,00 ou sem troco"></label></div><label class="field">Observações <span class="subtle">(opcional)</span><textarea name="notes" maxlength="500" placeholder="Espessura do corte, ponto de referência…"></textarea></label><p class="fine">Seu nome, telefone e endereço serão usados pela unidade escolhida para atender este pedido e manter seu histórico de compras.</p><div class="divider"></div><div class="total-row"><span>Total estimado, sem frete</span><strong>${money(cartTotal(cart))}</strong></div><p class="fine" style="margin:-8px 0 20px">O pagamento é combinado com a loja. Não cobramos pelo site.</p><div id="checkout-error" class="login-error" role="alert"></div><button class="btn wide" type="submit">${data.isDemo ? "Salvar pedido de teste" : "Finalizar e abrir WhatsApp"} ${icon("arrow")}</button></form>`,
  );
}
async function submitCheckout(form) {
  const values = Object.fromEntries(new FormData(form));
  if (!validatePhone(values.phone))
    throw new Error("Informe um telefone válido com DDD.");
  if (values.fulfillment === "delivery" && values.address.trim().length < 10)
    throw new Error("Informe o endereço completo para entrega.");
  if (!data.isDemo) whatsappUrl(branch().whatsapp, "");
  const button = form.querySelector("[type=submit]");
  button.disabled = true;
  button.textContent = "Salvando seu pedido…";
  checkoutId ||= crypto.randomUUID().replaceAll("-", "");
  let popup = null;
  // Reserve tab during the user gesture, then navigate only after Firestore confirms the save.
  if (!data.isDemo) {
    popup = window.open("about:blank", "_blank");
    if (popup) {
      popup.opener = null;
      popup.document.title = "Preparando pedido";
      popup.document.body.textContent = "Salvando seu pedido na loja. Aguarde…";
    }
  }
  try {
    const payload = {
      customer: { name: values.name.trim(), phone: phoneBR(values.phone) },
      fulfillment: values.fulfillment,
      payment: values.payment,
      address: values.fulfillment === "delivery" ? values.address.trim() : "",
      changeFor: values.payment === "Dinheiro" ? values.changeFor.trim() : "",
      notes: values.notes.trim(),
    };
    const order = await data.saveOrder(branchId, checkoutId, payload, cart);
    lastOrder = order;
    cart = [];
    persistCart();
    checkoutId = null;
    renderCart();
    const message = whatsappMessage(order, branch());
    const url = whatsappUrl(branch().whatsapp, message);
    modal(
      data.isDemo ? "Pedido de teste salvo" : "Pedido registrado!",
      `<div style="text-align:center;padding:5px 0 22px;color:var(--wine)">${icon("check")}<p style="font-size:22px;font-weight:700;margin-top:12px">#${e(order.code)}</p></div><p>${data.isDemo ? "Você pode conferir este pedido na área da loja, neste navegador." : "Seu pedido foi registrado na unidade " + e(branch().name) + ". Envie a mensagem no WhatsApp para confirmar com a equipe."}</p><p class="fine">Registrar o pedido não confirma disponibilidade, pagamento ou envio da mensagem.</p><div class="divider"></div><pre class="review-box">${e(message)}</pre>${data.isDemo ? "" : `<a class="btn wide" style="margin-top:20px" href="${e(url)}" target="_blank" rel="noopener">Abrir WhatsApp novamente ${icon("arrow")}</a>`}<button class="btn outline wide" style="margin-top:10px" data-action="close">Voltar ao catálogo</button>`,
    );
    if (popup) popup.location.replace(url);
  } catch (error) {
    popup?.close();
    if ($("#checkout-error"))
      $("#checkout-error").textContent = errorText(error);
    button.disabled = false;
    button.textContent = data.isDemo
      ? "Salvar pedido de teste"
      : "Finalizar e abrir WhatsApp";
    throw error;
  }
}
function loginView() {
  document.title = "Área da loja • Rei do Gado";
  $("#app").innerHTML =
    `<main class="login-page" id="main"><div class="login-brand"><img src="assets/logo.jpg" alt="Rei do Gado"><div><div class="eyebrow">ÁREA DA LOJA</div><h1>O seu balcão.<br>Sob seu controle.</h1><p>Produtos, pedidos e clientes<br>organizados por unidade.</p></div></div><section class="login-card"><h2>Bem-vindo de volta.</h2><p class="subtle">Entre para gerenciar sua unidade.</p>${data.isDemo ? '<div class="notice">Demonstração local. Senhas: coronel123, bingen123 ou correas123, conforme a unidade.</div>' : ""}<form id="login-form"><label class="field">Unidade<select name="branch">${CONFIG.branches.map((b) => `<option value="${b.id}" ${b.id === branchId ? "selected" : ""}>Unidade ${e(b.name)}</option>`).join("")}</select></label>${data.isDemo || CONFIG.branches.every((b) => b.email) ? "" : `<label class="field">E-mail de acesso<input name="email" type="email" autocomplete="username" value="${e(branch().email)}" placeholder="Seu e-mail da loja" required></label>`}<label class="field">Senha<input name="password" type="password" autocomplete="current-password" minlength="6" placeholder="Sua senha" required></label><div id="login-error" class="login-error" role="alert"></div><button class="btn wide" type="submit">Entrar no painel ${icon("arrow")}</button></form><a href="./" class="btn outline wide" style="margin-top:12px">Voltar para o catálogo</a></section></main>`;
}
async function startAdmin() {
  catalog = await data.getCatalog(admin.branchId, true);
  ordersLoaded = false;
  renderAdmin();
  unsubscribe?.();
  unsubscribe = data.subscribeOrders(
    admin.branchId,
    (next) => {
      orders = next;
      ordersLoaded = true;
      if (
        (admin && adminTab === "orders") ||
        (admin && adminTab === "customers")
      )
        renderAdminContent();
    },
    (error) => {
      ordersLoaded = true;
      toast(errorText(error));
      if ($("#admin-content"))
        $("#admin-content").innerHTML =
          `<div class="notice error">Não foi possível carregar os pedidos. ${e(errorText(error))}</div>`;
    },
  );
}
function renderAdmin() {
  document.title = `Unidade ${currentAdminBranch().name} • Rei do Gado`;
  $("#app").innerHTML =
    `<div class="admin-shell"><aside class="admin-side">${brandHTML}<div><div class="eyebrow" style="margin-left:14px">UNIDADE ${e(currentAdminBranch().name)}</div><nav class="admin-nav" aria-label="Painel da loja">${[
      ["orders", "orders", "Pedidos"],
      ["products", "grid", "Produtos"],
      ["categories", "grid", "Categorias"],
      ["customers", "users", "Clientes"],
    ]
      .map(
        ([tab, ic, label]) =>
          `<button data-admin-tab="${tab}" class="${adminTab === tab ? "active" : ""}">${icon(ic)}${label}</button>`,
      )
      .join(
        "",
      )}</nav></div><div class="admin-side-bottom"><a href="?unit=${admin.branchId}">Ver catálogo da unidade ${icon("arrow")}</a><button class="btn ghost" data-action="logout">${icon("logout")} Sair da conta</button></div></aside><main class="admin-main" id="main"><div class="admin-top"><div><div class="eyebrow" style="color:var(--wine)">REI DO GADO / ${e(currentAdminBranch().name)}</div><h1>${{ orders: "Pedidos da unidade", products: "Seu catálogo", categories: "Categorias", customers: "Histórico de clientes" }[adminTab]}</h1><p class="subtle">${{ orders: "Acompanhe cada pedido, do balcão à entrega.", products: "Preços, cortes e fotos do seu balcão.", categories: "Organize os produtos do jeito da sua loja.", customers: "As compras e preferências de quem volta à sua loja." }[adminTab]}</p></div><div style="display:flex;gap:8px">${adminTab === "products" ? '<button class="btn" data-action="new-product">' + icon("plus") + " Novo produto</button>" : adminTab === "categories" ? '<button class="btn" data-action="new-category">' + icon("plus") + " Nova categoria</button>" : ""}<button class="btn outline" data-action="password">Alterar senha</button><button class="icon-btn" data-action="logout" aria-label="Sair">${icon("logout")}</button></div></div>${data.isDemo ? '<div class="notice">Modo demonstração • dados salvos apenas neste navegador.</div>' : ""}<div id="admin-content"></div></main></div>`;
  renderAdminContent();
}
function statsHTML() {
  return `<div class="stats"><div class="stat"><span>Pedidos recebidos</span><strong>${orders.length}</strong></div><div class="stat"><span>Aguardando preparo</span><strong>${orders.filter((o) => o.status === "pending").length}</strong></div><div class="stat"><span>Valor dos pedidos*</span><strong>${money(orders.reduce((s, o) => s + o.totalCents, 0))}</strong></div><div class="stat"><span>Clientes da unidade</span><strong>${groupCustomers(orders).length}</strong></div></div>`;
}
const badge = (status) =>
  `<span class="status ${e(status)}">${e(STATUSES[status] || status)}</span>`;
const date = (timestamp) =>
  new Date(timestamp).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
function renderAdminContent() {
  const target = $("#admin-content");
  if (!target) return;
  if (["orders", "customers"].includes(adminTab) && !ordersLoaded) {
    target.innerHTML = '<p class="subtle">Carregando histórico da unidade…</p>';
    return;
  }
  if (adminTab === "orders") {
    const list = orders.filter(
      (o) =>
        (orderFilter === "all" || o.status === orderFilter) &&
        normalize(o.customer.name + o.customer.phone + o.code).includes(
          normalize(adminSearch),
        ),
    );
    target.innerHTML =
      statsHTML() +
      `<div class="list-toolbar"><div class="tabs"><button class="chip ${orderFilter === "all" ? "active" : ""}" data-order-filter="all">Todos</button>${Object.entries(
        STATUSES,
      )
        .map(
          ([id, label]) =>
            `<button class="chip ${id === orderFilter ? "active" : ""}" data-order-filter="${id}">${label}</button>`,
        )
        .join(
          "",
        )}</div><label class="search">${icon("search")}<input id="admin-search" value="${e(adminSearch)}" placeholder="Cliente, telefone ou pedido" aria-label="Buscar pedidos"></label></div>${list.length ? `<div class="table-wrap"><table><thead><tr><th>Pedido / Cliente</th><th>Recebimento</th><th>Valor estimado</th><th>Status</th><th>Detalhes</th></tr></thead><tbody>${list.map((o) => `<tr><td><strong>${e(o.customer.name)}</strong><small>#${e(o.code)} • ${date(o.createdAt)}</small><small>${e(o.customer.phone)}</small></td><td>${o.fulfillment === "delivery" ? "Entrega" : "Retirada"}<small>${e(o.payment)}</small></td><td><strong>${money(o.totalCents)}</strong><small>${o.items.length} opções</small></td><td>${badge(o.status)}</td><td><button class="btn outline" data-order="${e(o.id)}">Ver pedido</button></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-state">${icon("orders")}<h3 style="margin-top:15px">${orders.length ? "Nenhum pedido com este filtro." : "Seu próximo pedido começa aqui."}</h3><p class="subtle">Os pedidos desta unidade aparecem automaticamente.</p></div>`}<p class="fine">*Valores estimados dos pedidos, sem frete. Não representam pagamentos recebidos.</p>`;
  }
  if (adminTab === "products") {
    const list = catalog.products.filter((p) =>
      normalize(p.name).includes(normalize(adminSearch)),
    );
    target.innerHTML = `<div class="list-toolbar"><label class="search">${icon("search")}<input id="admin-search" value="${e(adminSearch)}" placeholder="Buscar no catálogo" aria-label="Buscar produtos"></label><button class="btn outline" data-action="import">Importar catálogo Goomer</button></div>${catalog.products.some((p) => p.reviewRequired) ? `<div class="notice">${catalog.products.filter((p) => p.reviewRequired).length} produtos importados precisam de revisão de preço, peso ou unidade. Estão pausados até você revisar e ativar.</div>` : ""}${list.length ? `<div class="table-wrap"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Disponibilidade</th><th>Ações</th></tr></thead><tbody>${list.map((p) => `<tr><td><div class="item-name"><img class="table-img" src="${safeImage(p.image)}" alt=""><span><strong>${e(p.name)}</strong><small>${p.saleMode === "piece" ? "Peça • " + formatWeight(p.weightGrams) : p.unit === "kg" ? "Por peso" : "Por unidade"}</small></span></div></td><td>${e(catalog.categories.find((c) => c.id === p.categoryId)?.name || "Sem categoria")}</td><td><strong>${money(p.priceCents)}/${p.unit}</strong><small>${p.variants.length > 1 ? p.variants.length + " opções" : ""}</small></td><td><span class="status ${p.active ? "done" : "inactive"}">${p.active ? "Disponível" : p.reviewRequired ? "Revisar" : "Pausado"}</span></td><td><div class="row-actions"><button data-edit-product="${e(p.id)}" aria-label="Editar ${e(p.name)}">${icon("edit")}</button><button data-delete-product="${e(p.id)}" aria-label="Excluir ${e(p.name)}">${icon("trash")}</button></div></td></tr>`).join("")}</tbody></table></div>` : '<div class="empty-state"><h3>Seu balcão está vazio.</h3><p class="subtle">Adicione um produto ou importe o catálogo inicial.</p></div>'}`;
  }
  if (adminTab === "categories") {
    target.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Categoria</th><th>Produtos</th><th>Ordem</th><th>Ações</th></tr></thead><tbody>${catalog.categories.map((c) => `<tr><td><strong>${e(c.name)}</strong></td><td>${catalog.products.filter((p) => p.categoryId === c.id).length}</td><td>${c.sort + 1}</td><td><div class="row-actions"><button data-edit-category="${e(c.id)}" aria-label="Editar ${e(c.name)}">${icon("edit")}</button><button data-delete-category="${e(c.id)}" aria-label="Excluir ${e(c.name)}">${icon("trash")}</button></div></td></tr>`).join("")}</tbody></table></div>${!catalog.categories.length ? '<div class="empty-state">Crie a primeira categoria para organizar seus produtos.</div>' : ""}`;
  }
  if (adminTab === "customers") {
    const customers = groupCustomers(orders).filter((c) =>
      normalize(c.name + c.phone).includes(normalize(adminSearch)),
    );
    target.innerHTML = `<div class="list-toolbar"><p class="subtle">${customers.length} clientes • Unidade ${e(currentAdminBranch().name)}</p><label class="search">${icon("search")}<input id="admin-search" value="${e(adminSearch)}" placeholder="Buscar nome ou telefone" aria-label="Buscar clientes"></label></div>${customers.length ? `<div class="table-wrap"><table><thead><tr><th>Cliente</th><th>Compras</th><th>Valor acumulado*</th><th>Último pedido</th><th>Histórico</th></tr></thead><tbody>${customers.map((c) => `<tr><td><strong>${e(c.name)}</strong><small>${e(c.phone)}</small></td><td>${c.orders.length}</td><td><strong>${money(c.totalCents)}</strong></td><td>${date(c.lastOrder.createdAt)}<small>${money(c.lastOrder.totalCents)}</small></td><td><button class="btn outline" data-customer="${e(c.phone)}">Ver compras</button></td></tr>`).join("")}</tbody></table></div><p class="fine">*Soma estimada dos pedidos, sem frete e sem confirmação de pagamento.</p>` : '<div class="empty-state"><h3>Ainda não há clientes por aqui.</h3><p class="subtle">O histórico é criado quando o primeiro pedido chega.</p></div>'}`;
  }
}
function orderDetails(id) {
  const o = orders.find((o) => o.id === id);
  if (!o) return;
  modal(
    `Pedido #${o.code}`,
    `<div class="order-details"><div>${badge(o.status)}<p class="fine">${date(o.createdAt)} • Unidade ${e(currentAdminBranch().name)}</p></div><div><h3>${e(o.customer.name)}</h3><p class="subtle">${e(o.customer.phone)}</p></div><div><h3>Sacola do cliente</h3><ul class="detail-list">${o.items.map((l) => `<li><span>${e(l.name)}<small>${e(l.variant)} • ${lineQuantity(l)}${l.saleMode === "piece" ? " • aprox. " + formatWeight(l.grams) : ""}</small></span><strong>${money(l.totalCents)}</strong></li>`).join("")}</ul></div><div class="total-row"><span>Total estimado, sem frete</span><strong>${money(o.totalCents)}</strong></div><div><h3>${o.fulfillment === "delivery" ? "Entrega em domicílio" : "Retirada na unidade"}</h3><p class="subtle">${e(o.address || currentAdminBranch().address)}</p><p class="subtle">Pagamento: ${e(o.payment)}${o.changeFor ? " • Troco para " + e(o.changeFor) : ""}</p>${o.notes ? `<p class="subtle" style="margin-top:12px">Observações: ${e(o.notes)}</p>` : ""}</div><div class="notice">Confira os cortes, a pesagem e o valor final antes de confirmar com o cliente.</div><form id="status-form" data-id="${e(o.id)}"><label class="field">Atualizar status<select name="status">${Object.entries(
      STATUSES,
    )
      .map(
        ([id, label]) =>
          `<option value="${id}" ${o.status === id ? "selected" : ""}>${label}</option>`,
      )
      .join(
        "",
      )}</select></label><button type="submit" class="btn wide">Salvar status</button></form></div>`,
  );
}
function customerDetails(phone) {
  const c = groupCustomers(orders).find((c) => c.phone === phone);
  if (!c) return;
  modal(
    c.name,
    `<p class="subtle">${e(c.phone)} • ${c.orders.length} pedidos</p><div class="total-row" style="margin-top:22px"><span>Total acumulado estimado</span><strong>${money(c.totalCents)}</strong></div><ul class="detail-list">${c.orders
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(
        (o) =>
          `<li><div><strong>#${e(o.code)} • ${date(o.createdAt)}</strong><small>${o.items.map((l) => e(l.name) + " (" + lineQuantity(l) + ")").join(", ")}</small><small>${STATUSES[o.status]}</small></div><div style="text-align:right"><strong>${money(o.totalCents)}</strong><button class="btn ghost" style="margin-top:8px" data-order="${e(o.id)}">Ver sacola</button></div></li>`,
      )
      .join("")}</ul>`,
  );
}
function editCategory(id) {
  const c = catalog.categories.find((c) => c.id === id) || {
    id: crypto.randomUUID(),
    name: "",
    sort: catalog.categories.length,
  };
  modal(
    id ? "Editar categoria" : "Nova categoria",
    `<form id="category-form" data-id="${e(c.id)}"><label class="field">Nome da categoria<input name="name" maxlength="60" value="${e(c.name)}" required></label><label class="field">Posição no catálogo<input name="sort" type="number" min="1" max="1000" value="${c.sort + 1}" required></label><button class="btn wide" type="submit">Salvar categoria</button></form>`,
  );
}
function editProduct(id) {
  if (!catalog.categories.length)
    return toast("Crie uma categoria antes de adicionar produtos.");
  const p = catalog.products.find((p) => p.id === id) || {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    priceCents: 0,
    unit: "kg",
    saleMode: "weight",
    weightGrams: 1000,
    variants: [{ id: "0", name: "Padrão", priceCents: 0 }],
    image: "",
    imagePath: "",
    active: true,
    sort: catalog.products.length,
    categoryId: catalog.categories[0].id,
    reviewRequired: false,
  };
  modal(
    id ? "Editar produto" : "Novo produto",
    `<form id="product-form" data-id="${e(p.id)}">${p.reviewRequired ? '<div class="notice">Confira preço, unidade e peso importados antes de disponibilizar este produto.</div>' : ""}<label class="field">Nome<input name="name" value="${e(p.name)}" maxlength="100" required></label><div class="fields-row"><label class="field">Categoria<select name="categoryId">${catalog.categories.map((c) => `<option value="${e(c.id)}" ${c.id === p.categoryId ? "selected" : ""}>${e(c.name)}</option>`).join("")}</select></label><label class="field">Venda<select name="saleMode"><option value="weight" ${p.saleMode === "weight" ? "selected" : ""}>Por kg (fracionado)</option><option value="piece" ${p.saleMode === "piece" ? "selected" : ""}>Peça (preço por kg)</option><option value="unit" ${p.saleMode === "unit" ? "selected" : ""}>Por unidade</option></select></label></div><div class="fields-row"><label class="field">Preço base (R$)<input name="price" type="number" min="0.01" max="100000" step="0.01" value="${(p.priceCents / 100).toFixed(2)}" required></label><label class="field">Peso médio da peça (kg)<input name="weight" type="number" min="0.001" max="30" step="0.001" value="${p.weightGrams ? p.weightGrams / 1000 : 1}" required></label></div><label class="field">Descrição<textarea name="description" maxlength="2000">${e(p.description)}</textarea></label><label class="field">Opções e preços <span class="subtle">(opcional)</span><textarea name="variants" placeholder="Bife | 69.90&#10;Estrogonofe | 72.90">${p.variants.length > 1 ? p.variants.map((v) => `${e(v.name)} | ${(v.priceCents / 100).toFixed(2)}`).join("\n") : ""}</textarea></label><p class="fine" style="margin-top:-8px;margin-bottom:18px">Uma opção por linha: nome | preço. Deixe vazio para usar somente o preço base.</p><img id="upload-preview" class="upload-preview" src="${safeImage(p.image)}" alt="Foto atual do produto"><label class="field">${icon("upload")} Carregar foto<input name="photo" type="file" accept="image/jpeg,image/png,image/webp"></label><label class="check"><input type="checkbox" name="removeImage">Remover foto atual</label><label class="check"><input name="active" type="checkbox" ${p.active ? "checked" : ""}>Disponível para pedidos</label>${p.reviewRequired ? '<label class="check"><input name="reviewed" type="checkbox" required>Conferi preço, unidade e peso deste produto.</label>' : ""}<div id="product-error" class="login-error" role="alert"></div><button class="btn wide" type="submit">Salvar produto</button></form>`,
  );
}
async function submitProduct(form) {
  const fd = new FormData(form);
  const old = catalog.products.find((p) => p.id === form.dataset.id);
  let priceCents = Math.round(Number(fd.get("price")) * 100);
  let variants = String(fd.get("variants"))
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line, i) => {
      const parts = line.split("|");
      const value = Number(parts[1]?.trim().replace(",", "."));
      if (
        parts.length !== 2 ||
        !parts[0].trim() ||
        !Number.isFinite(value) ||
        value <= 0 ||
        value > 100000
      )
        throw new Error("Use uma opção por linha no formato: Bife | 69.90");
      return {
        id: String(i),
        name: parts[0].trim(),
        priceCents: Math.round(value * 100),
      };
    });
  if (variants.length > 20)
    throw new Error("Use no máximo 20 opções por produto.");
  if (!variants.length)
    variants = [
      {
        id: old?.variants.length === 1 ? old.variants[0].id : "0",
        name: old?.variants.length === 1 ? old.variants[0].name : "Padrão",
        priceCents,
      },
    ];
  else priceCents = Math.min(...variants.map((v) => v.priceCents));
  const mode = fd.get("saleMode");
  const record = {
    id: form.dataset.id,
    name: String(fd.get("name")).trim(),
    description: String(fd.get("description")).trim(),
    categoryId: fd.get("categoryId"),
    unit: mode === "unit" ? "un" : "kg",
    saleMode: mode,
    weightGrams:
      mode === "unit" ? 0 : Math.round(Number(fd.get("weight")) * 1000),
    priceCents,
    variants,
    active: fd.has("active"),
    sort: old?.sort ?? catalog.products.length,
    reviewRequired: false,
    image: old?.image || "",
    imagePath: old?.imagePath || "",
  };
  if (!record.name) throw new Error("Informe o nome do produto.");
  if (fd.has("removeImage")) {
    record.image = "";
    record.imagePath = "";
  }
  const file = fd.get("photo");
  if (file?.size)
    Object.assign(record, await data.uploadImage(admin.branchId, file));
  try {
    await data.saveEntity(admin.branchId, "products", record);
  } catch (err) {
    if (record.imagePath && record.imagePath !== old?.imagePath)
      await data.deleteImage(record.imagePath);
    throw err;
  }
  if (old?.imagePath && old.imagePath !== record.imagePath)
    await data.deleteImage(old.imagePath);
  await refreshAdmin();
  closeModal();
  toast("Produto salvo.");
}
async function refreshAdmin() {
  catalog = await data.getCatalog(admin.branchId, true);
  renderAdminContent();
}
function confirmDelete(type, id) {
  const record = catalog[type].find((r) => r.id === id);
  if (!record) return;
  if (
    type === "categories" &&
    catalog.products.some((p) => p.categoryId === id)
  )
    return toast(
      "Mova ou exclua os produtos desta categoria antes de removê-la.",
    );
  modal(
    "Excluir " + (type === "products" ? "produto" : "categoria"),
    `<p>Excluir <strong>${e(record.name)}</strong> do catálogo desta unidade?</p><p class="fine">O histórico dos pedidos já recebidos será preservado.</p><div class="modal-actions"><button class="btn outline" data-action="close">Cancelar</button><button class="btn danger" data-confirm-delete="${e(id)}" data-type="${type}">Excluir</button></div>`,
  );
}
document.addEventListener("input", (event) => {
  const input = event.target;
  if (input.id === "search") {
    search = input.value;
    renderProducts();
  }
  if (input.id === "admin-search") {
    const caret = input.selectionStart;
    adminSearch = input.value;
    renderAdminContent();
    const field = $("#admin-search");
    field?.focus();
    field?.setSelectionRange(caret, caret);
  }
  const form = input.closest("#add-product");
  if (form) {
    const p = catalog.products.find((p) => p.id === form.dataset.id);
    const fd = new FormData(form);
    const amount =
      Number(fd.get("amount")) * (p.saleMode === "weight" ? 1000 : 1);
    $("#product-total").textContent = money(
      makeLine(p, fd.get("variant"), amount).totalCents,
    );
  }
});
document.addEventListener("change", (event) => {
  const input = event.target;
  if (input.closest("#checkout-form")) {
    if (input.name === "fulfillment") {
      $("#address-field").classList.toggle(
        "hidden",
        input.value !== "delivery",
      );
      $("[name=address]").required = input.value === "delivery";
    }
    if (input.name === "payment")
      $("#change-field").classList.toggle("hidden", input.value !== "Dinheiro");
  }
  if (
    input.closest("#login-form") &&
    input.name === "branch" &&
    $("[name=email]")
  )
    $("[name=email]").value = knownBranch(input.value).email;
  if (input.name === "photo" && input.files[0]) {
    const url = URL.createObjectURL(input.files[0]);
    $("#upload-preview").src = url;
    $("#upload-preview").onload = () => URL.revokeObjectURL(url);
  }
});
document.addEventListener("click", async (event) => {
  const target = event.target.closest("button,[data-action]");
  if (!target || target.disabled) return;
  try {
    const d = target.dataset;
    if (d.category) {
      category = d.category;
      document.querySelectorAll("[data-category]").forEach((b) => {
        b.classList.toggle("active", b.dataset.category === category);
        b.setAttribute("aria-pressed", String(b.dataset.category === category));
      });
      renderProducts();
    }
    if (d.branch) {
      target.disabled = true;
      await changeBranch(d.branch);
    }
    if (d.product) openProduct(d.product);
    if (d.remove) {
      cart = cart.filter((x) => x.key !== d.remove);
      checkoutId = null;
      persistCart();
      renderCart();
    }
    if (d.quantity) adjustQuantity(d.quantity, Number(d.delta));
    if (d.adminTab) {
      adminTab = d.adminTab;
      adminSearch = "";
      renderAdmin();
    }
    if (d.orderFilter) {
      orderFilter = d.orderFilter;
      renderAdminContent();
    }
    if (d.order) orderDetails(d.order);
    if (d.customer) customerDetails(d.customer);
    if (d.editProduct) editProduct(d.editProduct);
    if (d.editCategory) editCategory(d.editCategory);
    if (d.deleteProduct) confirmDelete("products", d.deleteProduct);
    if (d.deleteCategory) confirmDelete("categories", d.deleteCategory);
    if (d.confirmDelete) {
      target.disabled = true;
      const old = catalog[d.type].find((x) => x.id === d.confirmDelete);
      await data.deleteEntity(admin.branchId, d.type, d.confirmDelete);
      if (old.imagePath) await data.deleteImage(old.imagePath);
      await refreshAdmin();
      closeModal();
      toast("Excluído do catálogo.");
    }
    switch (d.action) {
      case "close":
        closeModal();
        break;
      case "branches":
        chooseBranch();
        break;
      case "cart":
        modal(
          "Seu pedido",
          `<p class="subtle" style="margin-bottom:20px">Unidade ${e(branch().name)}</p><div id="modal-cart">${cartContent()}</div>`,
        );
        break;
      case "checkout":
        checkout();
        break;
      case "clear-search":
        search = "";
        category = "all";
        renderCatalog();
        break;
      case "password":
        modal(
          "Alterar sua senha",
          `<form id="password-form"><label class="field">Senha atual<input type="password" name="current" autocomplete="current-password" required></label><label class="field">Nova senha<input type="password" name="new" minlength="10" maxlength="128" autocomplete="new-password" required></label><label class="field">Repita a nova senha<input type="password" name="confirm" minlength="10" maxlength="128" autocomplete="new-password" required></label><div class="login-error" role="alert"></div><button class="btn wide" type="submit">Salvar nova senha</button></form>`,
        );
        break;
      case "new-product":
        editProduct();
        break;
      case "new-category":
        editCategory();
        break;
      case "logout":
        unsubscribe?.();
        await data.logout();
        admin = null;
        orders = [];
        loginView();
        break;
      case "import":
        modal(
          "Importar o catálogo inicial",
          `<p>Adicionar os produtos e categorias do Goomer que ainda não existem nesta unidade?</p><p class="fine">Os produtos existentes serão preservados. Confira os preços antes de divulgar o catálogo.</p><div class="modal-actions"><button class="btn outline" data-action="close">Cancelar</button><button class="btn" data-action="confirm-import">Importar catálogo</button></div>`,
        );
        break;
      case "confirm-import":
        target.disabled = true;
        target.textContent = "Importando…";
        await data.seedCatalog(admin.branchId);
        await refreshAdmin();
        closeModal();
        toast("Catálogo importado.");
        break;
    }
  } catch (error) {
    toast(errorText(error));
    target.disabled = false;
  }
});
document.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector("[type=submit]");
  try {
    if (form.id === "add-product") return addProduct(form);
    if (form.id === "checkout-form") return await submitCheckout(form);
    button.disabled = true;
    const fd = new FormData(form);
    if (form.id === "login-form") {
      admin = await data.login(
        fd.get("branch"),
        fd.get("email") || knownBranch(fd.get("branch")).email || "",
        fd.get("password"),
      );
      await startAdmin();
    }
    if (form.id === "category-form") {
      const name = String(fd.get("name")).trim();
      if (!name) throw new Error("Informe o nome da categoria.");
      await data.saveEntity(admin.branchId, "categories", {
        id: form.dataset.id,
        name,
        sort: Number(fd.get("sort")) - 1,
      });
      await refreshAdmin();
      closeModal();
      toast("Categoria salva.");
    }
    if (form.id === "password-form") {
      if (fd.get("new") !== fd.get("confirm"))
        throw new Error("As novas senhas não coincidem.");
      await data.changePassword(fd.get("current"), fd.get("new"));
      closeModal();
      toast("Senha alterada.");
    }
    if (form.id === "product-form") await submitProduct(form);
    if (form.id === "status-form") {
      await data.updateStatus(
        admin.branchId,
        form.dataset.id,
        fd.get("status"),
      );
      closeModal();
      toast("Status atualizado.");
    }
  } catch (error) {
    const field = form.querySelector("[role=alert]");
    if (field) field.textContent = errorText(error);
    else toast(errorText(error));
  } finally {
    if (button?.isConnected) button.disabled = false;
  }
});
async function boot() {
  try {
    await data.initialize();
    if (params.get("view") === "admin") {
      admin = await data.session();
      if (admin) await startAdmin();
      else loginView();
    } else {
      catalog = await data.getCatalog(branch().id);
      loadCart();
      renderCatalog();
    }
  } catch (error) {
    $("#app").innerHTML =
      `<div class="boot" style="padding:30px;text-align:center"><img src="assets/logo.jpg" alt="Rei do Gado"><h1 style="font-size:24px">O balcão está temporariamente indisponível.</h1><p class="subtle">${e(errorText(error))}</p><button class="btn" id="retry">Tentar novamente</button></div>`;
    $("#retry").onclick = () => location.reload();
  }
}
boot();
