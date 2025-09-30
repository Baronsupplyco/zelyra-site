// --------- UTIL ---------
const qs = (s, el=document)=> el.querySelector(s);
const qsa = (s, el=document)=> [...el.querySelectorAll(s)];
const fmt = n => n.toFixed(2).replace('.', ',');

// --------- ESTADO ---------
let cart = JSON.parse(localStorage.getItem('zelyra_cart') || '[]');

// --------- DOM BÁSICO ---------
const cartBtn     = qs('#btn-cart');
const cartModal   = qs('#cart-modal');
const closeCart   = qs('#close-cart');
const cartItemsEl = qs('#cart-items');
const cartTotalEl = qs('#cart-total');
const cartCountEl = qs('#cart-count');
const checkoutBtn = qs('#checkout-btn');

// --------- CARRINHO ---------
function saveCart(){ localStorage.setItem('zelyra_cart', JSON.stringify(cart)); renderCart(); }
function addToCart(item){
  const found = cart.find(p => p.id === item.id);
  if(found) found.qty += 1; else cart.push({...item, qty:1});
  saveCart();
}
function removeFromCart(id){ cart = cart.filter(it => it.id !== id); saveCart(); }
function changeQty(id, delta){
  const it = cart.find(p => p.id === id); if(!it) return;
  it.qty += delta; if(it.qty <= 0) removeFromCart(id); saveCart();
}
function renderCart(){
  if(!cartItemsEl) return; // index.html e catalogo.html tem modal
  // badge
  const qty = cart.reduce((s,it)=>s+it.qty,0);
  if(cartCountEl) cartCountEl.textContent = qty;

  // itens
  cartItemsEl.innerHTML = '';
  let total = 0;
  cart.forEach(it=>{
    total += it.qty * it.price;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${it.img}" alt="${it.name}">
      <div>
        <h4>${it.name}</h4>
        <div class="item-price">R$ ${fmt(it.price)} • 
          <span class="qty">
            <button data-act="dec" data-id="${it.id}">–</button>
            <b>${it.qty}</b>
            <button data-act="inc" data-id="${it.id}">+</button>
          </span>
        </div>
      </div>
      <button data-act="del" data-id="${it.id}">🗑</button>
    `;
    cartItemsEl.appendChild(row);
  });
  if(cartTotalEl) cartTotalEl.textContent = fmt(total);

  // checkout (WhatsApp) — altere o número abaixo
  const msg = encodeURIComponent(
    `Olá! Gostaria de finalizar uma compra:\n\n` +
    cart.map(it=>`• ${it.name} (x${it.qty}) — R$ ${fmt(it.price)}`).join('\n') +
    `\n\nTotal: R$ ${fmt(total)}`
  );
  if(checkoutBtn) checkoutBtn.href = `https://wa.me/5547997695133?text=${msg}`;
}

// --------- MODAL ---------
if(cartBtn) cartBtn.addEventListener('click', ()=> cartModal.classList.remove('hidden'));
if(closeCart) closeCart.addEventListener('click', ()=> cartModal.classList.add('hidden'));
if(cartModal) cartModal.addEventListener('click', (e)=>{ if(e.target === cartModal) cartModal.classList.add('hidden'); });
if(cartItemsEl) cartItemsEl.addEventListener('click', (e)=>{
  const id = e.target.getAttribute('data-id');
  const act = e.target.getAttribute('data-act');
  if(!id || !act) return;
  if(act === 'inc') changeQty(id, +1);
  else if(act === 'dec') changeQty(id, -1);
  else if(act === 'del') removeFromCart(id);
});

// --------- RENDER CATÁLOGO (catalogo.html) ---------
(function renderCatalog(){
  const grid = qs('#grid');
  if(!grid) return;

  const products = (window.ZELYRA_PRODUCTS || []).map(p=>({
    ...p,
    price: parseFloat(p.price)
  }));

  grid.innerHTML = '';
  products.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img" style="background-image:url('${p.img}');"></div>
      <div class="card-body">
        <h3>${p.name}</h3>
        <p>${p.desc || ''}</p>
        <div class="price">R$ ${fmt(p.price)}</div>
        <button class="btn add-to-cart">Adicionar</button>
      </div>
    `;
    // dataset para carrinho
    card.dataset.id = p.id;
    card.dataset.name = p.name;
    card.dataset.price = p.price;
    card.dataset.img = p.img;
    grid.appendChild(card);
  });

  qsa('.add-to-cart', grid).forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const card = e.target.closest('.card');
      const item = {
        id: card.dataset.id,
        name: card.dataset.name,
        price: parseFloat(card.dataset.price),
        img: card.dataset.img
      };
      addToCart(item);
      cartModal.classList.remove('hidden');
    });
  });
})();

renderCart();
