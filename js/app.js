const grid = document.getElementById('produtosGrid');
const cartSidebar = document.getElementById('cartSidebar');
const backdrop = document.getElementById('cartBackdrop');
const openCartBtn = document.getElementById('openCart');
const closeCartBtn = document.getElementById('closeCart');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');
const freteEl = document.getElementById('frete');
const checkoutBtn = document.getElementById('checkout');

let cart = JSON.parse(localStorage.getItem('zelyra_cart') || '[]');
let produtos = [];

function currency(v){ return v.toLocaleString('pt-BR',{style:'currency', currency:'BRL'}); }
function saveCart(){ localStorage.setItem('zelyra_cart', JSON.stringify(cart)); }

async function loadProdutos(){
  const res = await fetch('data/produtos.json');
  produtos = await res.json();
  renderProdutos();
  renderCart();
}

function renderProdutos(){
  grid.innerHTML = '';
  produtos.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card-produto';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nome}">
      <div class="card-body">
        ${p.destaque ? '<span class="badge">Destaque</span>' : ''}
        <div class="card-title">${p.nome}</div>
        <div class="price">${currency(p.preco)}</div>
        <button class="btn btn-primary btn-add" data-id="${p.id}">Adicionar</button>
      </div>`;
    grid.appendChild(card);
  });

  grid.querySelectorAll('.btn-add').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.id;
      addToCart(id);
    });
  });
}

function addToCart(id){
  const prod = produtos.find(p => p.id === id);
  const item = cart.find(i => i.id === id);
  if(item) item.qtd++;
  else cart.push({id:prod.id, nome:prod.nome, preco:prod.preco, img:prod.img, qtd:1});
  saveCart();
  renderCart();
  openCart();
}

function removeFromCart(id){
  cart = cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function changeQtd(id, delta){
  const item = cart.find(i => i.id === id);
  if(!item) return;
  item.qtd += delta;
  if(item.qtd <= 0) removeFromCart(id);
  saveCart();
  renderCart();
}

function cartTotal(){
  let total = cart.reduce((acc,i)=>acc+(i.preco*i.qtd), 0);
  total += parseFloat(freteEl.value || 0);
  return total;
}

function renderCart(){
  cartItemsEl.innerHTML = '';
  cart.forEach(i=>{
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML=`
      <img src="${i.img}" alt="${i.nome}">
      <div>
        <h4>${i.nome}</h4>
        <div>${currency(i.preco)} • <small>x${i.qtd}</small></div>
        <div class="qtd">
          <button onclick="changeQtd('${i.id}',-1)">–</button>
          <span>${i.qtd}</span>
          <button onclick="changeQtd('${i.id}',+1)">+</button>
          <button style="margin-left:8px" onclick="removeFromCart('${i.id}')">Remover</button>
        </div>
      </div>
      <div style="text-align:right">${currency(i.preco*i.qtd)}</div>
    `;
    cartItemsEl.appendChild(div);
  });
  cartTotalEl.textContent = currency(cartTotal());
  cartCountEl.textContent = cart.reduce((acc,i)=>acc+i.qtd,0);
}
window.changeQtd = changeQtd;
window.removeFromCart = removeFromCart;

function openCart(){ cartSidebar.classList.add('open'); backdrop.classList.add('show'); }
function closeCart(){ cartSidebar.classList.remove('open'); backdrop.classList.remove('show'); }

openCartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
backdrop.addEventListener('click', closeCart);
freteEl.addEventListener('change', renderCart);

checkoutBtn.addEventListener('click', async ()=>{
  if(cart.length===0){ alert('Seu carrinho está vazio.'); return; }
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = 'Redirecionando…';

  const body = {
    items: cart.map(i=>({ title:i.nome, quantity:i.qtd, unit_price:i.preco, currency_id:'BRL', picture_url:i.img })),
    shipping_cost: parseFloat(freteEl.value||0)
  };

  try{
    const res = await fetch('/api/checkout', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if(data.init_point){
      window.location.href = data.init_point; // redireciona para Mercado Pago
    }else{
      alert('Erro ao iniciar checkout.');
    }
  }catch(e){
    console.error(e);
    alert('Erro ao conectar ao servidor.');
  }finally{
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = 'Finalizar Compra';
  }
});

loadProdutos();
