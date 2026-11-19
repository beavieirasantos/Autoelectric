const el = id => document.getElementById(id);
const moeda = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const ler = (chave, padrao) => JSON.parse(localStorage.getItem(chave)) ?? padrao;
const salvar = (chave, valor) => localStorage.setItem(chave, JSON.stringify(valor));

const cartao = p => `
  <div class="card">
    <img src="${p.imagem}" alt="${p.nome}">
    <h3>${p.nome}</h3>
    <p class="preco">${moeda(p.preco)}</p>
    <button class="btn" onclick="adicionarCarrinho(${p.id})">Adicionar</button>
    <a href="carrinho.html">Ver carrinho</a>
  </div>`;

function atualizarContador() {
  const total = ler("carrinho", []).reduce((soma, item) => soma + item.qtd, 0);
  document.querySelector(".qtd-carrinho").textContent = total;
}

function adicionarCarrinho(id) {
  const p = PRODUTOS.find(produto => produto.id === id);
  const carrinho = ler("carrinho", []);
  const item = carrinho.find(i => i.id === id);
  if (p.estoque === 0) return alert("Produto esgotado.");
  if (item && item.qtd >= p.estoque) return alert("Estoque limite atingido.");
  if (item) {
    item.qtd++;
  } else {
    carrinho.push({ id, nome: p.nome, preco: p.preco, qtd: 1 });
  }
  salvar("carrinho", carrinho);
  atualizarContador();
  alert(`${p.nome} adicionado!`);
}

function iniciarHome() {
  el("destaques").innerHTML = [8, 1, 5].map(id => cartao(PRODUTOS[id - 1])).join("");
}

function iniciarLista(tipo) {
  const lista = PRODUTOS.filter(p => p.tipo === tipo);
  const busca = el("busca");
  const filtro = el("filtro");
  new Set(lista.map(p => p.categoria)).forEach(c => filtro.innerHTML += `<option>${c}</option>`);
  const mostrar = () => {
    const termo = busca.value.toLowerCase();
    const achados = lista.filter(p => p.nome.toLowerCase().includes(termo) && (filtro.value === "" || p.categoria === filtro.value));
    el("listaProdutos").innerHTML = achados.length ? achados.map(cartao).join("") : "<p>Nenhum produto encontrado.</p>";
  };
  busca.oninput = mostrar;
  filtro.onchange = mostrar;
  mostrar();
}

function iniciarCarrinho() {
  const carrinho = ler("carrinho", []);
  if (carrinho.length === 0) {
    el("areaCarrinho").innerHTML = `<p>Seu carrinho está vazio.</p><a class="btn" href="veiculo.html">Ver produtos</a>`;
    return;
  }
  let total = 0;
  let linhas = "";
  for (const item of carrinho) {
    total += item.preco * item.qtd;
    linhas += `<tr><td>${item.nome}</td><td>${item.qtd}</td><td>${moeda(item.preco * item.qtd)}</td><td><button class="btn btn-escuro" onclick="removerItem(${item.id})">Remover</button></td></tr>`;
  }
  el("areaCarrinho").innerHTML = `
    <table>
      <tr><th>Produto</th><th>Qtd.</th><th>Valor</th><th></th></tr>
      ${linhas}
    </table>
    <p class="preco">Total: ${moeda(total)}</p>
    <button class="btn" onclick="finalizarPedido()">Finalizar compra</button>`;
}

function removerItem(id) {
  salvar("carrinho", ler("carrinho", []).filter(i => i.id !== id));
  atualizarContador();
  iniciarCarrinho();
}

function finalizarPedido() {
  const u = ler("usuarioLogado", null);
  if (!u) return location.href = "login.html";
  const carrinho = ler("carrinho", []);
  const pedidos = ler("pedidos", []);
  pedidos.push({ numero: 1001 + pedidos.length, email: u.email, total: carrinho.reduce((s, i) => s + i.preco * i.qtd, 0) });
  salvar("pedidos", pedidos);
  salvar("carrinho", []);
  location.href = "pedidos.html";
}

function autenticar(e) {
  e.preventDefault();
  const email = el("emailLogin").value.trim().toLowerCase();
  const senha = el("senhaLogin").value;
  const usuario = ler("clientes", []).find(c => c.email === email && c.senha === senha);
  if (!usuario) return alert("Dados incorretos.");
  salvar("usuarioLogado", usuario);
  location.href = "index.html";
}

function iniciarPedidos() {
  const u = ler("usuarioLogado", null);
  const pedidos = u ? ler("pedidos", []).filter(p => p.email === u.email) : [];
  el("listaPedidos").innerHTML = u ? pedidos.map(p => `<p>Pedido #${p.numero} - ${moeda(p.total)}</p>`).join("") : "<p>Faça login para ver seus pedidos.</p>";
}

function enviarContato(e) {
  e.preventDefault();
  alert("Mensagem enviada!");
  e.target.reset();
}

atualizarContador();
