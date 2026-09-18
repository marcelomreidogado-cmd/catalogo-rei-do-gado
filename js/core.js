export const money = (cents) =>
  (Number(cents || 0) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export const digits = (value) => String(value || "").replace(/\D/g, "");
export function phoneBR(value) {
  const d = digits(value);
  return d.length > 11 && d.startsWith("55") ? d.slice(2) : d;
}
export function validatePhone(value) {
  return /^[1-9]{2}\d{8,9}$/.test(phoneBR(value));
}
export const formatWeight = (grams) =>
  `${(grams / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 3 })} kg`;
export const STATUSES = {
  pending: "Pendente",
  preparing: "Em preparação",
  delivery: "Saiu para entrega",
  done: "Finalizado",
};
export function lineTotal(line) {
  return Math.round(
    line.unitPriceCents *
      (line.unit === "kg" ? line.grams / 1000 : line.quantity),
  );
}
export function makeLine(product, variantId, amount) {
  const variant =
    product.variants.find((v) => v.id === variantId) || product.variants[0];
  const quantity = product.saleMode === "weight" ? 1 : amount;
  const grams =
    product.unit === "kg"
      ? product.saleMode === "weight"
        ? amount
        : product.weightGrams * quantity
      : 0;
  const line = {
    key: `${product.id}:${variant.id}`,
    productId: product.id,
    variantId: variant.id,
    name: product.name,
    variant: variant.name,
    unit: product.unit,
    saleMode: product.saleMode,
    unitPriceCents: variant.priceCents,
    quantity,
    grams,
    weightGrams: product.weightGrams,
  };
  return { ...line, totalCents: lineTotal(line) };
}
export function lineQuantity(line) {
  return line.saleMode === "weight"
    ? formatWeight(line.grams)
    : `${line.quantity} ${line.saleMode === "piece" ? (line.quantity === 1 ? "peça" : "peças") : "un"}`;
}
export function cartTotal(lines) {
  return lines.reduce((total, line) => total + lineTotal(line), 0);
}
export function groupCustomers(orders) {
  const grouped = new Map();
  for (const order of orders) {
    const key = phoneBR(order.customer.phone);
    const customer = grouped.get(key) || {
      phone: key,
      name: order.customer.name,
      orders: [],
      totalCents: 0,
      lastOrder: null,
    };
    customer.orders.push(order);
    customer.totalCents += order.totalCents;
    if (!customer.lastOrder || order.createdAt > customer.lastOrder.createdAt) {
      customer.lastOrder = order;
      customer.name = order.customer.name;
    }
    grouped.set(key, customer);
  }
  return [...grouped.values()].sort(
    (a, b) => b.lastOrder.createdAt - a.lastOrder.createdAt,
  );
}
export function whatsappMessage(order, branch) {
  const itemText = order.items
    .map(
      (item, index) =>
        `${index + 1}. ${item.name}${item.variant && !["Padrão", "Kg", "KG"].includes(item.variant) ? ` — ${item.variant}` : ""}\n   ${lineQuantity(item)}${item.saleMode === "piece" ? ` (aprox. ${formatWeight(item.grams)})` : ""} × ${money(item.unitPriceCents)}/${item.unit} = ${money(item.totalCents)}`,
    )
    .join("\n\n");
  return `*REI DO GADO • UNIDADE ${branch.name.toUpperCase()}*\n*Pedido #${order.code}*\n\n*Cliente:* ${order.customer.name}\n*Telefone:* ${order.customer.phone}\n\n*MINHA SACOLA*\n${itemText}\n\n*Subtotal estimado: ${money(order.totalCents)}*\n${order.fulfillment === "delivery" ? "*Entrega:* Domicílio\n*Endereço:* " + order.address + "\n*Frete:* a confirmar pela unidade" : "*Retirada:* Unidade " + branch.name}\n*Pagamento:* ${order.payment}${order.changeFor ? "\n*Troco para:* " + order.changeFor : ""}${order.notes ? "\n*Observações:* " + order.notes : ""}\n\nO valor final dos itens por kg depende da pesagem. Disponibilidade, frete e prazo serão confirmados pela loja.`;
}
export function whatsappUrl(phone, message) {
  const number = digits(phone);
  if (!/^55\d{10,11}$/.test(number))
    throw new Error("O WhatsApp desta unidade ainda não foi configurado.");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
