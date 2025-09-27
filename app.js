// Produtos do catálogo
const PRODUCTS = [
  {
    id: 'macaquinho-preto',
    name: 'Macaquinho Fitness Premium',
    desc: 'Caimento perfeito e tecido confortável para treinos intensos. Logo ZELYRA dourado.',
    price: 99.90,
    img: 'https://raw.githubusercontent.com/Baronsupplyco/site-zelyra-assets/main/macaquinho-preto.jpg'
  },
  {
    id: 'top-rosa',
    name: 'Top Fitness Zelyra Rosa',
    desc: 'Alto suporte e toque macio. Modelagem que valoriza.',
    price: 79.90,
    img: 'https://raw.githubusercontent.com/Baronsupplyco/site-zelyra-assets/main/top-rosa.jpg'
  },
  {
    id: 'short-preto',
    name: 'Short Fitness Zelyra',
    desc: 'Compressão na medida, não marca.',
    price: 89.90,
    img: 'https://raw.githubusercontent.com/Baronsupplyco/site-zelyra-assets/main/short-preto.jpg'
  },
  {
    id: 'legging-premium',
    name: 'Legging Premium',
    desc: 'Conforto e sustentação. Ideal para treinos e lifestyle.',
    price: 149.90,
    img: 'https://raw.githubusercontent.com/Baronsupplyco/site-zelyra-assets/main/legging-recortes.jpg'
  }
];

// Se quiser trocar as imagens pelos seus arquivos do GitHub, é só trocar os links das propriedades `img`

// Render dos cards
const grid = document.getElementById('product-grid');
const renderProducts = () => {
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="card">
      <img class="thumb" src="${p.img}" alt="${p.name}" onerror="this.src='heroi.jpg'"/>
      <div class="content">
        <h3>${p.name}</h3>
        <p class="desc">${p.desc}</p>
        <div class="actions">
          <span class="price">R$ ${p.price.toFixed(2).replace('.', ',')}</span>
          <button class="btn btn-primary" onclick="addToCart('${p.id}')">Adicionar</button>
          <span class="tag">ZELYRA</span>
        </div>
      </div>
    </article>
  `).join('');
};
renderProducts();

// Carrinho (localStorage)
let cart = JSON.parse(localStorage.getItem('zelyra_cart') || '[]');
const saveCart = () => localStorage.setItem('zelyra_cart', JSON.stringify(cart));

const addToCart = (id) => {
  const prod = PRODUCTS.find(p => p.id === id);
  const idx = cart.findIndex(c => c.id === id);
  if (idx >= 0) cart[idx].qty += 1;
  else cart.push({ id: prod.id, name: prod.name, price: prod.price, img: prod.img, qty: 1 });
  saveCart(); renderCart();
};

// Drawer
const cartDrawer = document.getElementById('cart-drawer');
const backdrop = document.getElementById('backdrop');
document.getElementById('btn-open-cart').onclick = () => openCart();
document.getElementById('btn-close-cart').onclick = () => closeCart();
backdrop.onclick = () => closeCart();

function openCart(){ cartDrawer.classList.add('open'); backdrop.classList.add('open'); renderCart(); }
function closeCart(){ cartDrawer.classList.remove('open'); backdrop.classList.remove('open'); }

function renderCart(){
  const el = document.getElementById('cart-items');
  const count = cart.reduce((n,i)=>n+i.qty,0);
  document.getElementById('cart-count').innerText = count;
  el.innerHTML = cart.length===0 ? '<p>Seu carrinho está vazio.</p>' : cart.map(i=>`
    <div class="cart-item">
      <img src="${i.img}" alt="${i.name}"/>
      <div>
        <h4>${i.name}</h4>
        <div class="qty">
          <button onclick="decQty('${i.id}')">-</button>
          <span>${i.qty}</span>
          <button onclick="incQty('${i.id}')">+</button>
        </div>
      </div>
      <div><strong>R$ ${(i.price*i.qty).toFixed(2).replace('.', ',')}</strong></div>
    </div>
  `).join('');

  const total = cart.reduce((s,i)=> s + i.price*i.qty, 0);
  document.getElementById('cart-total').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function incQty(id){ const i=cart.findIndex(c=>c.id===id); cart[i].qty++; saveCart(); renderCart(); }
function decQty(id){ const i=cart.findIndex(c=>c.id===id); cart[i].qty--; if(cart[i].qty<=0) cart.splice(i,1); saveCart(); renderCart(); }

document.getElementById('btn-checkout').onclick = async () => {
  if(cart.length===0){ alert('Seu carrinho está vazio.'); return; }
  const body = {
    items: cart.map(c=>({
      title: c.name,
      picture_url: c.img,
      quantity: c.qty,
      unit_price: Number(c.price.toFixed(2)),
      currency_id: 'BRL'
    }))
  };
  try{
    const resp = await fetch('/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await resp.json();
    if(data.init_point){
      window.location.href = data.init_point; // redireciona para o checkout do Mercado Pago
    } else {
      alert('Não foi possível iniciar o pagamento.');
    }
  }catch(e){
    console.error(e);
    alert('Erro ao iniciar pagamento.');
  }
};
