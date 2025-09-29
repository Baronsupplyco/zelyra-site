// Estado do carrinho
let carrinho = [];

// DOM
const btnAbrirCarrinho = document.getElementById('btnAbrirCarrinho');
const btnFecharCarrinho = document.getElementById('btnFecharCarrinho');
const carrinhoEl = document.getElementById('carrinho');
const overlayCarrinho = document.getElementById('overlayCarrinho');
const listaCarrinhoEl = document.getElementById('listaCarrinho');
const totalCarrinhoEl = document.getElementById('totalCarrinho');
const contadorCarrinhoEl = document.getElementById('contadorCarrinho');
const btnFinalizarCompra = document.getElementById('btnFinalizarCompra');

// Abertura/fechamento
btnAbrirCarrinho.addEventListener('click', () => {
  carrinhoEl.classList.add('aberto');
  overlayCarrinho.classList.add('visivel');
});
btnFecharCarrinho.addEventListener('click', fecharCarrinho);
overlayCarrinho.addEventListener('click', fecharCarrinho);

function fecharCarrinho(){
  carrinhoEl.classList.remove('aberto');
  overlayCarrinho.classList.remove('visivel');
}

// Adicionar item
function adicionarAoCarrinho(nome, preco, imagem){
  const itemExistente = carrinho.find(i => i.nome === nome);
  if(itemExistente){
    itemExistente.qtde += 1;
  }else{
    carrinho.push({nome, preco, imagem, qtde:1});
  }
  renderCarrinho();
}

// Remover/alterar qtd
function alterarQtde(index, delta){
  carrinho[index].qtde += delta;
  if(carrinho[index].qtde <= 0) carrinho.splice(index,1);
  renderCarrinho();
}

// Exibir
function renderCarrinho(){
  listaCarrinhoEl.innerHTML = '';
  let total = 0;
  carrinho.forEach((item,idx)=>{
    total += item.preco * item.qtde;
    listaCarrinhoEl.innerHTML += `
      <div class="item">
        <img src="${item.imagem}" alt="${item.nome}">
        <div class="item__info">
          <div><strong>${item.nome}</strong></div>
          <div>R$ ${item.preco.toFixed(2).replace('.',',')}</div>
        </div>
        <div class="item__qtde">
          <button onclick="alterarQtde(${idx},-1)">–</button>
          <span>${item.qtde}</span>
          <button onclick="alterarQtde(${idx},1)">+</button>
        </div>
      </div>
    `;
  });
  totalCarrinhoEl.textContent = total.toFixed(2).replace('.',',');
  contadorCarrinhoEl.textContent = carrinho.reduce((acc,i)=> acc+i.qtde,0);
}
renderCarrinho();

// Finalizar compra -> Cria preferência MP pelo endpoint /api/checkout
btnFinalizarCompra.addEventListener('click', async ()=>{
  if(!carrinho.length){ alert('Seu carrinho está vazio.'); return; }

  try{
    const body = {
      items: carrinho.map(i => ({
        title: i.nome,
        quantity: i.qtde,
        unit_price: Number(i.preco.toFixed(2)),
        picture_url: location.origin + '/' + i.imagem
      })),
      // opcional: dados do comprador
      payer: {}
    };

    const resp = await fetch('/api/checkout', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(body)
    });

    const data = await resp.json();
    if(data.init_point){
      // redireciona para o MP
      window.location.href = data.init_point;
    } else {
      console.log('Erro retorno:', data);
      alert('Não foi possível iniciar o checkout. Tente novamente.');
    }
  }catch(e){
    console.error(e);
    alert('Falha ao iniciar pagamento.');
  }
});

// Deixa as funções no escopo global (usadas no HTML)
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.alterarQtde = alterarQtde;
