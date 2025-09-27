/* ===========================
   ZELYRA – Loja com carrinho
   =========================== */

// Produtos (ajuste as imagens reais na pasta /imagem)
const PRODUCTS = [
  {
    id: "macaquinho-preto",
    name: "Macaquinho Fitness Preto",
    price: 99.90,
    image: "imagem/macaquinho-preto.jpg",
    desc: "Cintura alta, tecido de compressão e logo dourado ZELYRA. Conforto premium que modela sem marcar."
  },
  {
    id: "conjunto-rosa",
    name: "Conjunto Zelyra Rosa (top + short)",
    price: 119.90,
    image: "imagem/conjunto-rosa.jpg",
    desc: "Design anatômico, secagem rápida e toque macio. Ideal para lifestyle e treino."
  }
];

// Estado do carrinho
let cart = JSON.parse(localStorage.getItem("zelyra_cart") || "[]");

// Renderização de produtos
const grid = document.getElementById("product-grid");
function renderProducts() {
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="card">
      <img src="${p.image}" alt="${p.name}">
      <div class="body">
        <div class="tag">ZELYRA ✨</div>
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <div class="price">R$ ${p.price.toFixed(2).replace('.', ',')}</div>
        <div class="actions">
          <button class="btn small add" onclick="addToCart('${p.id}')">Adicionar</button>
          <button class="btn small buy" onclick="buyNow('${p.id}')">Comprar</button>
        </div>
      </div>
    </article>
  `).join('');
}
renderProducts();

// Carrinho (UI)
const cartPanel = document.getElementById("cart-panel");
const overlay = document.getElementById("cart-overlay");
const count = document.getElementById("cart-count");
const itemsBox = document.getElementById("cart-items");
const subtotalBox = document.getElementById("cart-subtotal");

document.getElementById("btn-cart").onclick = openCart;
document.getElementById("close-cart").onclick = closeCart;
overlay.onclick = closeCart;

function openCart(){ cartPanel.classList.add("open"); overlay.classList.add("show"); }
function closeCart(){ cartPanel.classList.remove("open"); overlay.classList.remove("show"); }

function saveCart(){ localStorage.setItem("zelyra_cart", JSON.stringify(cart)); }

function addToCart(id, qty=1){
  const product = PRODUCTS.find(p => p.id === id);
  if(!product) return;
  const existing = cart.find(i => i.id === id);
  if(existing){ existing.qty += qty; }
  else{ cart.push({ id, name: product.name, price: product.price, image: product.image, qty }); }
  saveCart();
  updateCartUI();
  openCart();
}

function removeFromCart(id){
  cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
}

function changeQty(id, delta){
  const item = cart.find(i => i.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0) removeFromCart(id);
  saveCart();
  updateCartUI();
}

function calcSubtotal(){
  return cart.reduce((acc,i)=> acc + i.price * i.qty, 0);
}

function updateCartUI(){
  count.textContent = cart.reduce((acc,i)=> acc + i.qty, 0);
  itemsBox.innerHTML = cart.length ? cart.map(i => `
    <div class="cart-item">
      <img src="${i.image}" alt="${i.name}">
      <div>
        <h4>${i.name}</h4>
        <div class="qty">
          <button onclick="changeQty('${i.id}',-1)">-</button>
          <span>${i.qty}</span>
          <button onclick="changeQty('${i.id}',1)">+</button>
        </div>
        <small>R$ ${(i.price).toFixed(2).replace('.', ',')} un.</small>
      </div>
      <div>
        <strong>R$ ${(i.price*i.qty).toFixed(2).replace('.', ',')}</strong><br>
        <button class="btn small" style="margin-top:6px" onclick="removeFromCart('${i.id}')">Remover</button>
      </div>
    </div>
  `).join('') : `<p>Seu carrinho está vazio.</p>`;

  subtotalBox.textContent = `R$ ${calcSubtotal().toFixed(2).replace('.', ',')}`;
}
updateCartUI();

// Comprar agora
function buyNow(id){
  cart = []; // limpa e adiciona só 1 item
  saveCart();
  addToCart(id, 1);
}

// Checkout com Mercado Pago (via função serverless)
document.getElementById("checkout-btn").onclick = async () => {
  if(!cart.length){ alert("Seu carrinho está vazio."); return; }
  try{
    const res = await fetch('/API/create-preference', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        items: cart.map(i => ({
          title: i.name,
          unit_price: Number(i.price.toFixed(2)),
          quantity: i.qty,
          picture_url: `${location.origin}/${i.image}`
        }))
      })
    });
    const data = await res.json();
    if(data.init_point){
      // redireciona para o checkout do Mercado Pago
      location.href = data.init_point;
    }else{
      throw new Error("Erro ao criar preferência");
    }
  }catch(e){
    console.error(e);
    // fallback: WhatsApp com resumo do pedido
    const resumo = cart.map(i => `• ${i.qty}x ${i.name} – R$ ${(i.price*i.qty).toFixed(2)}`).join('%0A');
    const total = calcSubtotal().toFixed(2);
    location.href = `https://wa.me/5547997695133?text=Quero%20finalizar%20minha%20compra:%0A${resumo}%0ATotal:%20R$%20${total}`;
  }
};
