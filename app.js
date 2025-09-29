// Produtos da loja
const produtos = [
  {
    id: "macaquinho_preto",
    nome: "Macaquinho Fitness Preto",
    preco: 99.90,
    imagem: "https://images.unsplash.com/photo-1584467735871-1eacb3fe7d3b?q=80&w=1200&auto=format&fit=crop",
    descricao: "Cintura alta, tecido de compressão e logo dourado ZELYRA. Conforto premium que modela sem marcar."
  },
  {
    id: "conjunto_rosa",
    nome: "Conjunto ZELYRA Rosa (Top + Short)",
    preco: 119.90,
    imagem: "https://images.unsplash.com/photo-1594737625785-c6683fc63b55?q=80&w=1200&auto=format&fit=crop",
    descricao: "Design moderno, secagem rápida e conforto absoluto. Ideal para treinos e lifestyle."
  }
];

const lista = document.querySelector("#lista-produtos");
const year = document.querySelector("#year");
const cartCount = document.querySelector("#cart-count");
const drawer = document.querySelector("#drawer");
const overlay = document.querySelector("#overlay");
const btnCart = document.querySelector("#btn-cart");
const btnClose = document.querySelector("#close-drawer");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const btnCheckout = document.querySelector("#btn-checkout");

year.textContent = new Date().getFullYear();

function formatBR(n) {
  return n.toLocaleString("pt-BR", {style:"currency", currency:"BRL"});
}

// Render dos cards
function renderProdutos(){
  lista.innerHTML = "";
  produtos.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${p.imagem}" alt="${p.nome}" onerror="this.style.display='none'">
      <h3>${p.nome}</h3>
      <p>${p.descricao}</p>
      <div class="price">${formatBR(p.preco)}</div>
      <button class="add-btn" data-id="${p.id}">Adicionar</button>
    `;
    lista.appendChild(card);
  });
}
renderProdutos();

// Carrinho
const CART_KEY = "zelyra_cart";
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

function saveCart(){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartDisplay();
}

function addToCart(id){
  const prod = produtos.find(p => p.id === id);
  if(!prod) return;
  const item = cart.find(i => i.id === id);
  if(item) item.qtd += 1;
  else cart.push({ id: prod.id, nome: prod.nome, preco: prod.preco, imagem: prod.imagem, qtd: 1 });
  saveCart();
}

function removeFromCart(id){
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function changeQtd(id, delta){
  const item = cart.find(i => i.id === id);
  if(!item) return;
  item.qtd += delta;
  if(item.qtd <= 0) removeFromCart(id);
  saveCart();
}

function calcTotal(){
  return cart.reduce((sum, i) => sum + i.preco * i.qtd, 0);
}

function updateCartDisplay(){
  cartCount.textContent = cart.reduce((sum,i)=>sum+i.qtd,0);
  cartItems.innerHTML = "";
  cart.forEach(i => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${i.imagem}" alt="${i.nome}">
      <div class="info">
        <strong>${i.nome}</strong>
        <div class="price">${formatBR(i.preco)}</div>
      </div>
      <div class="qtd">
        <button class="btn-mini" data-act="menos" data-id="${i.id}">-</button>
        <span>${i.qtd}</span>
        <button class="btn-mini" data-act="mais" data-id="${i.id}">+</button>
        <button class="btn-mini" data-act="remover" data-id="${i.id}">✕</button>
      </div>
    `;
    cartItems.appendChild(row);
  });
  cartTotal.textContent = formatBR(calcTotal());
}

updateCartDisplay();

// Eventos
lista.addEventListener("click", (e) => {
  const id = e.target.getAttribute("data-id");
  if(id) addToCart(id);
});

btnCart.addEventListener("click", () => {
  drawer.classList.add("open");
  overlay.classList.add("show");
});

btnClose.addEventListener("click", closeDrawer);
overlay.addEventListener("click", closeDrawer);

cartItems.addEventListener("click", (e) => {
  const act = e.target.getAttribute("data-act");
  const id = e.target.getAttribute("data-id");
  if(!act || !id) return;
  if(act === "menos") changeQtd(id,-1);
  if(act === "mais") changeQtd(id,1);
  if(act === "remover") removeFromCart(id);
});

function closeDrawer(){
  drawer.classList.remove("open");
  overlay.classList.remove("show");
}

// Checkout – chama nossa API serverless na Vercel
btnCheckout.addEventListener("click", async () => {
  if(cart.length === 0){
    alert("Seu carrinho está vazio.");
    return;
  }
  try{
    const body = {
      items: cart.map(i => ({
        title: i.nome,
        quantity: i.qtd,
        currency_id: "BRL",
        unit_price: Number(i.preco.toFixed(2))
      }))
    };

    const res = await fetch("/api/create-preference", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(body)
    });

    if(!res.ok){
      throw new Error("Falha no checkout");
    }
    const data = await res.json();
    if(data.init_point){
      window.location.href = data.init_point; // redireciona para o checkout MP
    }else{
      throw new Error("Preferência sem init_point");
    }
  }catch(err){
    console.error(err);
    // Fallback: WhatsApp com resumo do pedido
    const resumo = cart.map(i => `${i.qtd}x ${i.nome
