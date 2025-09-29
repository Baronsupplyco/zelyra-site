// Produtos (você pode adicionar mais)
const produtos = [
  {
    id: 'MAC-PRETO',
    nome: 'Macaquinho Fitness Preto • ZELYRA',
    preco: 99.90,
    img: 'https://i.imgur.com/nPpL1S1.jpeg', // troque quando quiser
  },
  {
    id: 'CONJ-ROSA',
    nome: 'Conjunto Rosa (Top + Short) • ZELYRA',
    preco: 119.90,
    img: 'https://i.imgur.com/4X4pJ4p.jpeg',
  }
];

const grid = document.getElementById('gridProdutos');
const cartModal = document.getElementById('cartModal');
const btnCart = document.getElementById('btnCart');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');

let carrinho = JSON.parse(localStorage.getItem('zelyra_cart') || '[]');

function salvar(){
  localStorage.setItem('zelyra_cart', JSON.stringify(carrinho));
  atualizarContadores();
}

function atualizarContadores(){
  cartCount.textContent = carrinho.reduce((acc,p)=>acc + p.qtd,0);
  const total = carrinho.reduce((acc,p)=>acc + (p.preco * p.qtd),0);
  cartTotal.textContent = total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}

function renderProdutos(){
  grid.innerHTML = '';
  produtos.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.nome}">
      <div class="title">${p.nome}</div>
      <div class="price">${p.preco.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div>
      <button class="btn btn-primary" data-id="${p.id}">Adicionar</button>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=>addCarrinho(btn.dataset.id));
  });
}

function addCarrinho(id){
  const p = produtos.find(x=>x.id===id);
  const idx = carrinho.findIndex(x=>x.id===id);
  if(idx>=0) carrinho[idx].qtd++;
  else carrinho.push({...p, qtd:1});
  salvar();
  abrirCarrinho();
}

function abrirCarrinho(){
  renderCarrinho();
  cartModal.style.display = 'flex';
}
function fecharCarrinho(){
  cartModal.style.display = 'none';
}

function renderCarrinho(){
  cartItems.innerHTML = '';
  if(!carrinho.length){
    cartItems.innerHTML = `<p>Seu carrinho está vazio.</p>`;
    atualizarContadores();
    return;
  }
  carrinho.forEach(item=>{
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
       <img src="${item.img}" alt="${item.nome}">
       <div class="info">
         <strong>${item.nome}</strong>
         <div class="qtd">
           <button class="btnMenos">−</button>
           <span>${item.qtd}</span>
           <button class="btnMais">+</button>
         </div>
       </div>
       <div class="price">${(item.preco*item.qtd).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div>
    `;
    const btnMenos = div.querySelector('.btnMenos');
    const btnMais = div.querySelector('.btnMais');
    btnMenos.addEventListener('click', ()=>{
      item.qtd--;
      if(item.qtd<=0) carrinho = carrinho.filter(x=>x.id!==item.id);
      salvar(); renderCarrinho();
    });
    btnMais.addEventListener('click', ()=>{
      item.qtd++; salvar(); renderCarrinho();
    });
    cartItems.appendChild(div);
  });
  atualizarContadores();
}

document.getElementById('checkout').addEventListener('click', async ()=>{
  if(!carrinho.length) return alert('Adicione algum produto ao carrinho.');
  try {
    const body = {
      items: carrinho.map(p=>({
        id: p.id,
        title: p.nome,
        quantity: p.qtd,
        currency_id: "BRL",
        unit_price: Number(p.preco.toFixed(2))
      })),
      back_urls: {
        success: `${location.origin}/sucesso.html`,
        failure: `${location.origin}/erro.html`,
        pending: `${location.origin}/sucesso.html`
      }
    };

    const resp = await fetch('/api/create-preference', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    const data = await resp.json();
    if(!resp.ok) throw new Error(data.error||'Erro no checkout');

    // Redireciona para o Mercado Pago
    location.href = data.init_point;
  } catch (e) {
    console.error(e);
    alert('Não foi possível iniciar o pagamento.');
  }
});

btnCart.addEventListener('click', abrirCarrinho);
closeCart.addEventListener('click', fecharCarrinho);
cartModal.addEventListener('click', e=>{ if(e.target===cartModal) fecharCarrinho();});

// inicialização
renderProdutos();
atualizarContadores();
