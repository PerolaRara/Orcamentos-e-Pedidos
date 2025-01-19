/* ==== INÍCIO SEÇÃO - VARIÁVEIS GLOBAIS ==== */
let pedidos = [];
/* ==== FIM SEÇÃO - VARIÁVEIS GLOBAIS ==== */

/* ==== INÍCIO SEÇÃO - FUNÇÕES AUXILIARES ==== */
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarCampoMoeda(campo) {
    let valor = campo.value.replace(/\D/g, '');
    valor = (valor / 100).toFixed(2);
    campo.value = formatarMoeda(parseFloat(valor));
}

function limparCamposMoeda() {
    const camposMoeda = ['valorFrete', 'entrada', 'lucro'];
    camposMoeda.forEach(id => {
        const campo = document.getElementById(id);
        if (campo) {
            campo.value = '0,00';
        }
    });
}

function adicionarProduto() {
    const tbody = document.querySelector("#tabelaProdutos tbody");
    const newRow = tbody.insertRow();

    const cellQuantidade = newRow.insertCell();
    const cellDescricao = newRow.insertCell();
    const cellValorUnit = newRow.insertCell();
    const cellValorTotal = newRow.insertCell();

    cellQuantidade.innerHTML = '<input type="number" class="produto-quantidade" value="1" min="1" onchange="atualizarTotais()">';
    cellDescricao.innerHTML = '<input type="text" class="produto-descricao">';
    cellValorUnit.innerHTML = '<input type="text" class="produto-valor-unit" value="0,00" onblur="formatarCampoMoeda(this); atualizarTotais()">';
    cellValorTotal.textContent = formatarMoeda(0);
}

function atualizarTotais() {
    let valorTotalPedido = 0;
    const produtos = document.querySelectorAll("#tabelaProdutos tbody tr");

    produtos.forEach(row => {
        const quantidade = parseFloat(row.querySelector(".produto-quantidade").value);
        const valorUnit = parseFloat(row.querySelector(".produto-valor-unit").value.replace(/[^\d,]/g, '').replace(',', '.'));
        const valorTotal = quantidade * valorUnit;

        row.cells[3].textContent = formatarMoeda(valorTotal);
        valorTotalPedido += valorTotal;
    });

    const valorFrete = parseFloat(document.getElementById("valorFrete").value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const total = valorTotalPedido + valorFrete;

    document.getElementById("valorPedido").value = formatarMoeda(valorTotalPedido);
    document.getElementById("total").value = formatarMoeda(total);

    atualizarRestante();
}

function atualizarRestante() {
    const total = parseFloat(document.getElementById("total").value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const entrada = parseFloat(document.getElementById("entrada").value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const restante = total - entrada;

    document.getElementById("restante").value = formatarMoeda(restante);
}

function salvarPedido() {
    const pedido = {
        dataPedido: document.getElementById("dataPedido").value,
        dataEntrega: document.getElementById("dataEntrega").value,
        cliente: document.getElementById("cliente").value,
        endereco: document.getElementById("endereco").value,
        tema: document.getElementById("tema").value,
        nome: document.getElementById("nome").value,
        contato: document.getElementById("contato").value,
        cidade: document.getElementById("cidade").value,
        cores: document.getElementById("cores").value,
        idade: document.getElementById("idade").value,
        produtos: [],
        entrega: Array.from(document.querySelectorAll('input[name="entrega"]:checked')).map(el => el.value),
        pagamento: Array.from(document.querySelectorAll('input[name="pagamento"]:checked')).map(el => el.value),
        valorFrete: parseFloat(document.getElementById("valorFrete").value.replace(/[^\d,]/g, '').replace(',', '.')),
        valorPedido: parseFloat(document.getElementById("valorPedido").value.replace(/[^\d,]/g, '').replace(',', '.')),
        total: parseFloat(document.getElementById("total").value.replace(/[^\d,]/g, '').replace(',', '.')),
        entrada: parseFloat(document.getElementById("entrada").value.replace(/[^\d,]/g, '').replace(',', '.')),
        restante: parseFloat(document.getElementById("restante").value.replace(/[^\d,]/g, '').replace(',', '.')),
        lucro: parseFloat(document.getElementById("lucro").value.replace(/[^\d,]/g, '').replace(',', '.')),
        observacoes: document.getElementById("observacoes").value
    };

    const produtos = document.querySelectorAll("#tabelaProdutos tbody tr");
    produtos.forEach(row => {
        pedido.produtos.push({
            quantidade: parseFloat(row.querySelector(".produto-quantidade").value),
            descricao: row.querySelector(".produto-descricao").value,
            valorUnit: parseFloat(row.querySelector(".produto-valor-unit").value.replace(/[^\d,]/g, '').replace(',', '.')),
            valorTotal: parseFloat(row.cells[3].textContent.replace(/[^\d,]/g, '').replace(',', '.'))
        });
    });

    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));

    document.getElementById("pedido").reset();
    limparCamposMoeda();
    document.querySelector("#tabelaProdutos tbody").innerHTML = "";

    alert("Pedido salvo com sucesso!");
}

function gerarRelatorioCSV() {
    let csv = 'Data do Pedido,Cliente,Total,Frete,Lucro\n';

    pedidos.forEach(pedido => {
        csv += `${pedido.dataPedido},${pedido.cliente},${pedido.total},${pedido.valorFrete},${pedido.lucro}\n`;
    });

    const hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'relatorio_pedidos.csv';
    hiddenElement.click();
}

function carregarPedidos() {
    const dados = localStorage.getItem('pedidos');
    if (dados) {
        pedidos = JSON.parse(dados);
    }
}
// Modificada a função filtrarPedidosRelatorio para gerarRelatorio
function filtrarPedidosRelatorio() {
    const dataInicio = document.getElementById('filtroDataInicio').value;
    const dataFim = document.getElementById('filtroDataFim').value;

    const pedidosFiltrados = pedidos.filter(pedido => {
        return pedido.dataPedido >= dataInicio && pedido.dataPedido <= dataFim;
    });

    gerarRelatorio(pedidosFiltrados);
}

function mostrarPedidosDoMes() {
    const hoje = new Date();
    const primeiroDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    const ultimoDiaDoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0];

    document.getElementById('filtroDataInicio').value = primeiroDiaDoMes;
    document.getElementById('filtroDataFim').value = ultimoDiaDoMes;

    filtrarPedidos();
}

// Modificada a função filtrarPedidos para atualizarListaPedidos
function filtrarPedidos() {
    const dataInicio = document.getElementById('filtroDataInicio').value;
    const dataFim = document.getElementById('filtroDataFim').value;

    const pedidosFiltrados = pedidos.filter(pedido => {
        return pedido.dataPedido >= dataInicio && pedido.dataPedido <= dataFim;
    });

    atualizarListaPedidos(pedidosFiltrados);
}

function atualizarListaPedidos(pedidos) {
    const tbody = document.querySelector("#tabela-pedidos tbody");
    tbody.innerHTML = '';

    pedidos.forEach(pedido => {
        const row = tbody.insertRow();
        const cellDataPedido = row.insertCell();
        const cellCliente = row.insertCell();
        const cellTotal = row.insertCell();
        const cellDetalhes = row.insertCell();

        cellDataPedido.textContent = pedido.dataPedido;
        cellCliente.textContent = pedido.cliente;
        cellTotal.textContent = formatarMoeda(pedido.total);
        cellDetalhes.innerHTML = `<button type="button" onclick="detalharPedido('${pedido.dataPedido}')">Detalhes</button>`;
    });
}

function detalharPedido(dataPedido) {
    const pedido = pedidos.find(p => p.dataPedido === dataPedido);
    if (pedido) {
        alert(`Detalhes do Pedido:\nCliente: ${pedido.cliente}\nTotal: ${formatarMoeda(pedido.total)}\nFrete: ${formatarMoeda(pedido.valorFrete)}\nLucro: ${formatarMoeda(pedido.lucro)}`);
    }
}

function gerarRelatorio(pedidosFiltrados) {
    let relatorio = '';
    let totalPedidos = 0;
    let totalFrete = 0;
    let totalLucro = 0;

    pedidosFiltrados.forEach(pedido => {
        totalPedidos += pedido.total;
        totalFrete += pedido.valorFrete;
        totalLucro += pedido.lucro;
    });

    relatorio += `<p>Total de Pedidos: ${formatarMoeda(totalPedidos)}</p>`;
    relatorio += `<p>Total de Frete: ${formatarMoeda(totalFrete)}</p>`;
    relatorio += `<p>Total de Lucro: ${formatarMoeda(totalLucro)}</p>`;

    document.getElementById('relatorio-conteudo').innerHTML = relatorio;
}

function mostrarPagina(idPagina) {
    const paginas = document.querySelectorAll('.pagina');
    paginas.forEach(pagina => {
        pagina.style.display = 'none';
    });

    document.getElementById(idPagina).style.display = 'block';
}

/* ==== INÍCIO SEÇÃO - EVENT LISTENERS ==== */
document.addEventListener('DOMContentLoaded', () => {
    carregarPedidos();
    mostrarPagina('form-pedido'); // Exibe o formulário de pedido por padrão
});
document.getElementById("entrada").addEventListener("blur", () => formatarCampoMoeda(document.getElementById("entrada")));
document.getElementById("valorFrete").addEventListener("blur", () => formatarCampoMoeda(document.getElementById("valorFrete")));
document.getElementById("lucro").addEventListener("blur", () => formatarCampoMoeda(document.getElementById("lucro")));
/* ==== FIM SEÇÃO - EVENT LISTENERS ==== */
