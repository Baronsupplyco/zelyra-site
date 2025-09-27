let carrinho = [];
let carrinhoCount = document.getElementById("carrinho-count");

function adicionarCarrinho(produto, preco) {
  carrinho.push({ produto, preco });
  carrinhoCount.innerText = carrinho.length;
  alert(produto + " adicionado ao carrinho!");
}

// Simulação do checkout com Mercado Pago
document.getElementById("carrinho-btn").addEventListener("click", () => {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }

  let total = carrinho.reduce((s, p) => s + p.preco, 0).toFixed(2);
  alert("Total: R$ " + total + "\nPagamento via Mercado Pago (Pix, Débito, Crédito).");

  // Aqui entraria a chamada para API Mercado Pago
});


---
