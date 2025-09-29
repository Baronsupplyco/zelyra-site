// ---- Produtos da loja (você pode editar/expandir) ----
const PRODUTOS = [
  {
    id: 'macaquinho-preto',
    nome: 'Macaquinho Fitness Preto',
    preco: 99.90,
    descricao: 'Cintura alta, tecido de compressão e logo dourado ZELYRA.',
    imagem: 'https://i.imgur.com/9hJkOin.jpg' // troque pela sua depois
  },
  {
    id: 'conjunto-rosa',
    nome: 'Conjunto Rosa (Top + Short)',
    preco: 119.90,
    descricao: 'Suporte firme, tecido respirável e caimento premium.',
    imagem: 'https://i.imgur.com/zb3dQn5.jpg' // troque pela sua depois
  }
];

const $lista = document.querySelector('#lista-produtos');
const $contador = document.querySelector('#contador-carrinho');
const $drawer = document.querySelector('#drawer');
const $abrir = document.querySelector('#abrir-carrinho');
const $fechar = document.querySelector('#fechar-carrinho');
const $itensCarrinho = document.querySelector('#itens-carrinho');
const $totalCarrinho = document.querySelector('#total-carrinho');
const $finalizar = document.querySelector('#finalizar-compra');

const CART_KEY = 'zelyra_cart_v1';

function moeda(v){ return v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}

// Renderiza cards
function renderProdutos(){
  $lista.innerHTML = '';
  PRODUTOS.forEach(p=>{
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <img src="${p.imagem}" alt="${p.nome}">
      <h3>${p.nome}</h3>
      <p>${p.descricao}</p>
      <div class="preco">${moeda(p.preco)}</div>
      <button data-id="${p.id}">Adicionar ao carrinho</button>
    `;
    el.querySelector('button').addEventListener('click', ()=> addCarrinho(p.id));
    $lista.appendChild(el);
  });
}

function getCart(){
  try{
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  }catch(_){ return [] }
}
function setCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); atualizarContador(); renderCarrinho();}

function addCarrinho(id){
  const cart = getCart();
  const item = cart.find(i=>i.id===id);
  if(item){ item.qtd += 1; }
  else{
    const p = PRODUTOS.find(p=>p.id===id);
    cart.push({id:p.id, nome:p.nome, preco:p.preco, imagem:p.imagem, qtd:1});
  }
  setCart(cart);
  $drawer.classList.add('ativo');
}

function removerItem(id){
  let cart = getCart().filter(i=>i.id !== id);
  setCart(cart);
}
function mudarQtd(id, delta){
  const cart = getCart().map(i => {
    if(i.id===id){
      const qtd = i.qtd + delta;
      return {...i, qtd: Math.max(1, qtd)};
    }
    return i;
  });
  setCart(cart);
}

function atualizarContador(){
  const q = getCart().reduce((acc,i)=>acc+i.qtd,0);
  $contador.textContent = q;
}

function renderCarrinho(){
  const cart = getCart();
  if(!cart.length){
    $itensCarrinho.innerHTML = `<p>Seu carrinho está vazio.</p>`;
    $totalCarrinho.textContent = 'R$ 0,00';
    return;
  }
  let total = 0;
  $itensCarrinho.innerHTML = cart.map(i=>{
     total += i.preco*i.qtd;
     return `
       <div class="item-carrinho">
         <img src="${i.imagem}" alt="${i.nome}">
         <div style="flex:1">
           <div class="nome">${i.nome}</div>
           <div class="qtd">
              <button onclick="mudarQtd('${i.id}',-1)">-</button>
              <span>${i.qtd}</span>
              <button onclick="mudarQtd('${i.id}',+1)">+</button>
           </div>
         </div>
         <div>${moeda(i.preco*i.qtd)}</div>
         <button class="remover" onclick="removerItem('${i.id}')">remover</button>
       </div>
     `;
  }).join('');
  $totalCarrinho.textContent = moeda(total);
}

async function finalizarCompra(){
  const items = getCart().map(i=> ({
    title: i.nome,
    unit_price: Number(i.preco.toFixed(2)),
    quantity: i.qtd,
    currency_id: "BRL"
  }));

  if(!items.length) return alert('Seu carrinho está vazio.');

  try{
    const resp = await fetch('/api/create-preference', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ items })
    });
    if(!resp.ok) throw new Error('Falha ao criar preferência.');
    const data = await resp.json();
    if(data.init_point){
      window.location.href = data.init_point; // redireciona para o checkout do MP
    }else{
      alert('Erro ao iniciar checkout.');
    }
  }catch(e){
    console.error(e);
    window.location.href = '/erro.html';
  }
}

$abrir.addEventListener('click', ()=> $drawer.classList.add('ativo'));
$fechar.addEventListener('click', ()=> $drawer.classList.remove('ativo'));
$finalizar.addEventListener('click', finalizarCompra);

renderProdutos();
atualizarContador();
renderCarrinho();

// Expondo funções globais usadas no HTML
window.removerItem = removerItem;
window.mudarQtd = mudarQtd;
