const state = {
  produtos: [],
  carrinho: JSON.parse(localStorage.getItem('carrinho_zelyra') || '[]')
};

const byId = s => document.getElementById(s);

function fmt(n){ return n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

function salvarCarrinho(){
  localStorage.setItem('carrinho_zelyra', JSON.stringify(state.carrinho));
  atualizarBadge();
}

function atualizarBadge(){
  byId('qtde-carrinho').textContent = state.carrinho.reduce((t,i)=>t+i.qtd,0);
}

async function carregarProdutos(){
  const r = await fetch('dados/produtos.json');
  state.produtos = await r.json();
  renderProdutos();
  atualizarBadge();
  byId('ano').textContent = new Date().getFullYear();
}

function renderProdutos(){
  const el = document.getElementById('grid-produtos');
  el.innerHTML = '';
  state.produtos.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.imagem}" alt="${p.nome}">
      <div class="body">
        <h3>${p.nome}</h3>
        <p class="desc">${p.descricao}</p>
        <div class="preco">${fmt(p.preco)}</div>
        <div class="acao">
          <button class="btn btn-outline" data-id="${p.id}" data-qtde="1">Comprar</button>
          <button class="btn btn-primary" data-id="${p.id}" data-qtde="1">Adicionar</button>
        </div>
      </div>`;
    el.appendChild(card);
  });

  el.addEventListener('click', e=>{
    const b = e.target.closest('button');
    if(!b) return;
    const id = b.dataset.id;
    adicionarCarrinho(id,1);
    if(b.classList.contains('btn-outline')) abrirCarrinho();
  });
}

function adicionarCarrinho(id, qtd=1){
  const prod = state.produtos.find(p=>p.id===id);
  if(!prod) return;
  const existe = state.carrinho.find(i=>i.id===id);
  if(existe){ existe.qtd += qtd; }
  else { state.carrinho.push({ id: prod.id, nome: prod.nome, preco: prod.preco, imagem: prod.imagem, qtd }); }
  salvarCarrinho();
  renderCarrinho();
}

function removerItem(id){
  state.carrinho = state.carrinho.filter(i=>i.id!==id);
  salvarCarrinho();
  renderCarrinho();
}

function alterarQtd(id, delta){
  const item = state.carrinho.find(i=>i.id===id);
  if(!item) return;
  item.qtd += delta;
  if(item.qtd<=0) removerItem(id);
  salvarCarrinho();
  renderCarrinho();
}

function renderCarrinho(){
  const cont = byId('itens-carrinho');
  cont.innerHTML = '';
  let total = 0;
  state.carrinho.forEach(i=>{
    total += i.preco * i.qtd;
    const row = document.createElement('div');
    row.className='item';
    row.innerHTML = `
      <img src="${i.imagem}" alt="${i.nome}">
      <div class="t">
        <div>${i.nome}</div>
        <div class="p">${fmt(i.preco)}</div>
        <div class="qtd">
          <button onclick="alterarQtd('${i.id}',-1)">-</button>
          <span>${i.qtd}</span>
          <button onclick="alterarQtd('${i.id}',1)">+</button>
          <button onclick="removerItem('${i.id}')" style="margin-left:auto">remover</button>
        </div>
      </div>`;
    cont.appendChild(row);
  });
  byId('total-carrinho').textContent = fmt(total);
}

function abrirCarrinho(){ document.getElementById('drawer').classList.add('open'); renderCarrinho(); }
function fecharCarrinho(){ document.getElementById('drawer').classList.remove('open'); }

byId('btn-carrinho').onclick = abrirCarrinho;
byId('fechar-drawer').onclick = fecharCarrinho;

byId('btn-finalizar').onclick = async ()=>{
  if(state.carrinho.length===0) return;
  try{
    const body = { items: state.carrinho.map(i=>({ title: i.nome, quantity: i.qtd, unit_price: i.preco })) };
    const r = await fetch('/api/create-preference', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    const json = await r.json();
    if(json.init_point){
      // redireciona para o checkout do Mercado Pago (web checkout)
      location.href = json.init_point;
    }else{
      location.href = '/erro.html';
    }
  }catch(e){
    console.error(e);
    location.href = '/erro.html';
  }
};

carregarProdutos();


---
