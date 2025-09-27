const gridProdutos = document.getElementById('grid-produtos');
const cartBtn = document.getElementById('cartBtn');
const cartDrawer = document.getElementById('cartDrawer');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cart-count');
const finalizarCompra = document.getElementById('finalizarCompra');
const checkoutCartBtn = document.getElementById('checkoutCartBtn');

let produtos = [];
let carrinho = JSON.parse(localStorage.getItem('carrinho-zelyra') || '[]');

function salvarCarrinho(){ localStorage.setItem('carrinho-zelyra', JSON.stringify(carrinho)); }
function moeda(v){ return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

async function carregarProdutos(){
  const res = await fetch('dados/produtos.json');
  produtos = await res.json();
  renderProdutos();
  atualizarCartUI();
}

function renderProdutos(){
  gridProdutos.innerHTML = produtos.map(p => `
    <div class="card">
      <img src="${p.img}" alt="${p.nome}">
      <div class="card__info">
        <h3>${p.nome} ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}</h3>
        <p>${p.descricao}</p>
        <div class="card__preco">${moeda(p.preco)}</div>
        <div class="card__gridbtn">
          <button class="btn btn--rosa" onclick="adicionar('${p.id}')">Adicionar</button>
          <button class="btn btn--borda" onclick="comprarAgora('${p.id}')">Comprar</button>
        </div>
      </div>
    </div>
  `).join('');
}

function adicionar(id){
  const p = produtos.find(x => x.id === id);
  const existe = carrinho.find(x => x.id === id);
  if(existe) existe.qtd += 1;
  else carrinho.push({...p, qtd:1});
  salvarCarrinho();
  atualizarCartUI();
  abrirCarrinho();
}
function remover(id){ carrinho = carrinho.filter(it => it.id !== id); salvarCarrinho(); atualizarCartUI(); }
function alterarQtd(id, delta){
  const item = carrinho.find(x=>x.id===id);
  if(!item) return;
  item.qtd += delta;
  if(item.qtd<=0) remover(id);
  salvarCarrinho(); atualizarCartUI();
}
function totalCarrinho(){ return carrinho.reduce((s,it)=> s + (it.preco*it.qtd), 0); }
function atualizarCartUI(){
  cartItems.innerHTML = carrinho.length ? carrinho.map(it => `
    <div class="cart-item">
      <img src="${it.img}">
      <div style="flex:1">
        <h4>${it.nome}</h4>
        <div>${moeda(it.preco)} — Qtd: ${it.qtd}</div>
        <div style="margin-top:.3rem">
          <button class="btn btn--borda" onclick="alterarQtd('${it.id}', -1)">-</button>
          <button class="btn btn--rosa" style="margin-left:.3rem" onclick="alterarQtd('${it.id}', 1)">+</button>
          <button class="btn btn--borda" style="margin-left:.3rem" onclick="remover('${it.id}')">Remover</button>
        </div>
      </div>
    </div>
  `).join('') : '<p>Seu carrinho está vazio.</p>';
  cartTotal.textContent = moeda(totalCarrinho());
  cartCount.textContent = carrinho.reduce((s,it)=>s+it.qtd,0);
}
function abrirCarrinho(){ cartDrawer.classList.add('aberto'); }
function fecharCarrinho(){ cartDrawer.classList.remove('aberto'); }
cartBtn.addEventListener('click', abrirCarrinho);
closeCart.addEventListener('click', fecharCarrinho);
checkoutCartBtn.addEventListener('click', abrirCarrinho);

async function criarPreferencia(itens){
  const resp = await fetch('/api/criar-preferencia', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({items: itens})
  });
  if(!resp.ok) throw new Error('Erro ao criar preferência');
  return await resp.json(); // { init_point }
}

async function finalizar(){
  if(!carrinho.length) { alert('Seu carrinho está vazio.'); return; }
  const itens = carrinho.map(it => ({
    title: it.nome, quantity: it.qtd, currency_id: 'BRL', unit_price: Number(it.preco.toFixed(2))
  }));
  try{ const pref = await criarPreferencia(itens); window.location.href = pref.init_point; }
  catch(e){ alert('Erro ao iniciar checkout. Tente novamente.'); console.error(e); }
}
finalizarCompra.addEventListener('click', finalizar);

async function comprarAgora(id){
  const p = produtos.find(x => x.id === id);
  try{
    const pref = await criarPreferencia([{ title:p.nome, quantity:1, currency_id:'BRL', unit_price:Number(p.preco.toFixed(2)) }]);
    window.location.href = pref.init_point;
  }catch(e){ console.error(e); alert('Erro ao iniciar checkout.'); }
}
carregarProdutos();
