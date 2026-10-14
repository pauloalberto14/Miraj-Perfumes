/* =========================================================
   MIRAJ PERFUMES — configuração
   ========================================================= */
const WHATSAPP = "5511999999999"; // troque pelo seu número (código do país + DDD + número)

/* Para cadastrar um perfume, basta copiar um bloco abaixo.
   As imagens ficam na pasta /images (ex.: images/asad.jpg). */
const PRODUTOS = [
  {
    id: 1,
    marca: "Lattafa",
    nome: "Asad",
    volume: "100ml",
    tipo: "Eau de Parfum",
    notas: ["Pimenta", "Tabaco", "Baunilha"],
    preco: 289,
    familia: "Oriental / Ambarado",
    destaque: true,
    imagem: "images/asad.jpg",
  },
  {
    id: 2,
    marca: "Lattafa",
    nome: "Asad Bourbon",
    volume: "100ml",
    tipo: "Eau de Parfum",
    notas: ["Baunilha", "Cacau", "Lavanda"],
    preco: 299,
    familia: "Gourmand",
    destaque: true,
    imagem: "images/asad-bourbon.jpg",
  },
  {
    id: 3,
    marca: "Armaf",
    nome: "Club de Nuit Intense Man",
    volume: "105ml",
    tipo: "Eau de Parfum",
    notas: ["Limão", "Abacaxi", "Bétula"],
    preco: 399,
    familia: "Fresco / Cítrico",
    destaque: true,
    imagem: "images/club-de-nuit.jpg",
  },
  {
    id: 4,
    marca: "French Avenue",
    nome: "Liquid Brun Limited Edition",
    volume: "100ml",
    tipo: "Eau de Parfum",
    notas: ["Canela", "Cardamomo", "Baunilha"],
    preco: 489,
    familia: "Oriental / Ambarado",
    destaque: true,
    imagem: "images/liquid-brun.jpg",
  },
  {
    id: 5,
    marca: "Al Wataniah",
    nome: "Sabah Al Ward",
    volume: "100ml",
    tipo: "Eau de Parfum",
    notas: ["Baunilha", "Flor de laranjeira", "Rosa"],
    preco: 229,
    familia: "Floral",
    destaque: true,
    imagem: "images/sabah-al-ward.jpg",
  },
];

const FAMILIAS = ["Todos", "Oriental / Ambarado", "Gourmand", "Fresco / Cítrico", "Floral"];

/* =========================================================
   Utilidades
   ========================================================= */
const $ = (sel) => document.querySelector(sel);
const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const img = (src, alt = "") => `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" onerror="this.style.display='none'">`;

let filtroAtual = "Todos";
let termoBusca = "";
let sacola = JSON.parse(localStorage.getItem("miraj-sacola") || "[]"); // [{id, qtd}]

/* =========================================================
   Hero: carrossel de destaques (rolagem automática)
   ========================================================= */
const destaques = PRODUTOS.filter((p) => p.destaque);

function renderDestaques() {
  const track = $("#destaquesTrack");
  const largura = 256 + 12; // largura de cada mini-card + espaço
  // repete os itens o bastante para cobrir a tela inteira, sem buracos
  const reps = Math.max(1, Math.ceil(window.innerWidth / (destaques.length * largura)) + 1);

  const cards = Array.from({ length: reps }, () => destaques)
    .flat()
    .map(
      (p) => `
      <button type="button" class="mini" data-id="${p.id}">
        <div class="mini__img">${img(p.imagem, p.nome)}</div>
        <div>
          <small>${esc(p.marca)}</small>
          <strong>${esc(p.nome)}</strong>
          <span>${brl(p.preco)}</span>
        </div>
      </button>`
    )
    .join("");

  // dois conjuntos idênticos: a animação percorre um e recomeça sem salto
  track.innerHTML = `<div class="destaques__set">${cards}</div><div class="destaques__set" aria-hidden="true">${cards}</div>`;

  track.querySelectorAll(".mini").forEach((el) =>
    el.addEventListener("click", () => irParaProduto(Number(el.dataset.id)))
  );
}

function irParaProduto(id) {
  filtroAtual = "Todos";
  termoBusca = "";
  $("#busca").value = "";
  renderFiltros();
  renderGrid();
  const card = document.querySelector(`.card[data-id="${id}"]`);
  if (card) card.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* =========================================================
   Catálogo: filtros, busca e cards
   ========================================================= */
function renderFiltros() {
  $("#filtros").innerHTML = FAMILIAS.map(
    (f) => `<button type="button" class="chip ${f === filtroAtual ? "is-active" : ""}" data-f="${esc(f)}">${esc(f)}</button>`
  ).join("");

  document.querySelectorAll(".chip").forEach((el) =>
    el.addEventListener("click", () => {
      filtroAtual = el.dataset.f;
      renderFiltros();
      renderGrid();
    })
  );
}

function renderGrid() {
  const t = termoBusca.trim().toLowerCase();
  const lista = PRODUTOS.filter((p) => {
    const okFamilia = filtroAtual === "Todos" || p.familia === filtroAtual;
    const texto = [p.nome, p.marca, p.familia, ...p.notas].join(" ").toLowerCase();
    return okFamilia && (!t || texto.includes(t));
  });

  $("#grid").innerHTML = lista
    .map(
      (p) => `
      <article class="card" data-id="${p.id}">
        <div class="card__img">
          ${p.destaque ? '<span class="badge">DESTAQUE</span>' : ""}
          ${img(p.imagem, p.nome)}
        </div>
        <div class="card__body">
          <p class="card__brand">${esc(p.marca)}</p>
          <h3 class="card__name">${esc(p.nome)}</h3>
          <p class="card__meta">${esc(p.volume)} · ${esc(p.tipo)}</p>
          <p class="card__notes"><span>Cheira a</span> ${p.notas.map(esc).join(" · ")}</p>
          <div class="card__foot">
            <span class="card__price">${brl(p.preco)}</span>
            <button type="button" class="add" data-add="${p.id}" aria-label="Adicionar ${esc(p.nome)} à sacola">+</button>
          </div>
        </div>
      </article>`
    )
    .join("");

  $("#vazio").hidden = lista.length > 0;

  document.querySelectorAll("[data-add]").forEach((btn) =>
    btn.addEventListener("click", () => {
      adicionar(Number(btn.dataset.add));
      abrirSacola();
    })
  );
}

$("#busca").addEventListener("input", (e) => {
  termoBusca = e.target.value;
  renderGrid();
});

/* =========================================================
   Sacola
   ========================================================= */
function salvar() {
  localStorage.setItem("miraj-sacola", JSON.stringify(sacola));
}

function adicionar(id) {
  const item = sacola.find((i) => i.id === id);
  item ? item.qtd++ : sacola.push({ id, qtd: 1 });
  renderSacola();
}

function alterarQtd(id, delta) {
  const item = sacola.find((i) => i.id === id);
  if (!item) return;
  item.qtd += delta;
  if (item.qtd <= 0) sacola = sacola.filter((i) => i.id !== id);
  renderSacola();
}

function remover(id) {
  sacola = sacola.filter((i) => i.id !== id);
  renderSacola();
}

function renderSacola() {
  salvar();
  const itens = sacola
    .map((i) => ({ ...PRODUTOS.find((p) => p.id === i.id), qtd: i.qtd }))
    .filter((i) => i.id);

  const total = itens.reduce((s, i) => s + i.preco * i.qtd, 0);
  const qtdTotal = itens.reduce((s, i) => s + i.qtd, 0);

  const contador = $("#contador");
  contador.textContent = qtdTotal;
  contador.hidden = qtdTotal === 0;

  $("#totalSacola").textContent = brl(total);
  $("#finalizar").disabled = itens.length === 0;

  $("#itensSacola").innerHTML = itens.length
    ? itens
        .map(
          (i) => `
        <div class="item">
          <div class="item__img">${img(i.imagem, i.nome)}</div>
          <div class="item__info">
            <small>${esc(i.marca)}</small>
            <strong>${esc(i.nome)}</strong>
            <span class="price">${brl(i.preco * i.qtd)}</span>
            <div class="qty">
              <button type="button" data-menos="${i.id}" aria-label="Diminuir">−</button>
              <span>${i.qtd}</span>
              <button type="button" data-mais="${i.id}" aria-label="Aumentar">+</button>
            </div>
          </div>
          <button type="button" class="item__remove" data-rem="${i.id}">Remover</button>
        </div>`
        )
        .join("")
    : '<p class="drawer__empty">Sua sacola está vazia. Escolha um perfume no catálogo.</p>';

  document.querySelectorAll("[data-menos]").forEach((b) => b.addEventListener("click", () => alterarQtd(Number(b.dataset.menos), -1)));
  document.querySelectorAll("[data-mais]").forEach((b) => b.addEventListener("click", () => alterarQtd(Number(b.dataset.mais), 1)));
  document.querySelectorAll("[data-rem]").forEach((b) => b.addEventListener("click", () => remover(Number(b.dataset.rem))));
}

function abrirSacola() {
  $("#drawer").classList.add("is-open");
  $("#drawer").setAttribute("aria-hidden", "false");
  $("#overlay").hidden = false;
}
function fecharSacola() {
  $("#drawer").classList.remove("is-open");
  $("#drawer").setAttribute("aria-hidden", "true");
  $("#overlay").hidden = true;
}

$("#abrirSacola").addEventListener("click", abrirSacola);
$("#fecharSacola").addEventListener("click", fecharSacola);
$("#overlay").addEventListener("click", fecharSacola);
document.addEventListener("keydown", (e) => e.key === "Escape" && fecharSacola());

$("#finalizar").addEventListener("click", () => {
  const linhas = sacola.map((i) => {
    const p = PRODUTOS.find((x) => x.id === i.id);
    return `• ${i.qtd}x ${p.nome} (${p.marca}) — ${brl(p.preco * i.qtd)}`;
  });
  const total = sacola.reduce((s, i) => s + PRODUTOS.find((x) => x.id === i.id).preco * i.qtd, 0);
  const msg = `Olá! Gostaria de fazer este pedido:\n\n${linhas.join("\n")}\n\nTotal: ${brl(total)}`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
});

/* =========================================================
   Inicialização
   ========================================================= */
$("#linkWhats").href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Olá! Vim pelo site da Miraj Perfumes.")}`;

renderDestaques();
renderFiltros();
renderGrid();
renderSacola();
