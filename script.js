/* ==== INÍCIO SEÇÃO - VARIÁVEIS GLOBAIS ==== */
let orcamentos = [];
let pedidos = [];
let numeroOrcamento = 1;
let numeroPedido = 1;
const anoAtual = new Date().getFullYear();
/* ==== FIM SEÇÃO - VARIÁVEIS GLOBAIS ==== */

/* ==== INÍCIO SEÇÃO - CARREGAR DADOS DO LOCALSTORAGE ==== */
document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    mostrarPagina('form-orcamento');
});
/* ==== FIM SEÇÃO - CARREGAR DADOS DO LOCALSTORAGE ==== */

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
    const camposMoeda = ['valorFrete', 'valorOrcamento', 'total', 'entrada', 'restante', 'lucro',
                         'valorFreteEdicao', 'valorPedidoEdicao', 'totalEdicao', 'entradaEdicao', 'restanteEdicao', 'lucroEdicao'];
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

function adicionarProdutoEdicao() {
    const tbody = document.querySelector("#tabelaProdutosEdicao tbody");
    const newRow = tbody.insertRow();

    const cellQuantidade = newRow.insertCell();
    const cellDescricao = newRow.insertCell();
    const cellValorUnit = newRow.insertCell();
    const cellValorTotal = newRow.insertCell();

    cellQuantidade.innerHTML = '<input type="number" class="produto-quantidade" value="1" min="1" onchange="atualizarTotaisEdicao()">';
    cellDescricao.innerHTML = '<input type="text" class="produto-descricao">';
    cellValorUnit.innerHTML = '<input type="text" class="produto-valor-unit" value="0,00" onblur="formatarCampoMoeda(this); atualizarTotaisEdicao()">';
    cellValorTotal.textContent = formatarMoeda(0);
}

function atualizarTotais() {
    let valorTotalOrcamento = 0;
    const produtos = document.querySelectorAll("#tabelaProdutos tbody tr");

    produtos.forEach(row => {
        const quantidade = parseFloat(row.querySelector(".produto-quantidade").value);
        const valorUnit = parseFloat(row.querySelector(".produto-valor-unit").value.replace(/[^\d,]/g, '').replace(',', '.'));
        const valorTotal = quantidade * valorUnit;

        row.cells[3].textContent = formatarMoeda(valorTotal);
        valorTotalOrcamento += valorTotal;
    });

    const valorFrete = parseFloat(document.getElementById("valorFrete").value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const total = valorTotalOrcamento + valorFrete;

    document.getElementById("valorOrcamento").value = formatarMoeda(valorTotalOrcamento);
    document.getElementById("total").value = formatarMoeda(total);
}

function atualizarTotaisEdicao() {
    let valorTotalPedido = 0;
    const produtos = document.querySelectorAll("#tabelaProdutosEdicao tbody tr");

    produtos.forEach(row => {
        const quantidade = parseFloat(row.querySelector(".produto-quantidade").value);
        const valorUnit = parseFloat(row.querySelector(".produto-valor-unit").value.replace(/[^\d,]/g, '').replace(',', '.'));
        const valorTotal = quantidade * valorUnit;

        row.cells[3].textContent = formatarMoeda(valorTotal);
        valorTotalPedido += valorTotal;
    });

    const valorFrete = parseFloat(document.getElementById("valorFreteEdicao").value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const total = valorTotalPedido + valorFrete;

    document.getElementById("valorPedidoEdicao").value = formatarMoeda(valorTotalPedido);
    document.getElementById("totalEdicao").value = formatarMoeda(total);

    atualizarRestanteEdicao();
}

function atualizarRestanteEdicao() {
    const total = parseFloat(document.getElementById("totalEdicao").value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const entrada = parseFloat(document.getElementById("entradaEdicao").value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
    const restante = total - entrada;

    document.getElementById("restanteEdicao").value = formatarMoeda(restante);
}

function gerarNumeroFormatado(numero) {
    return numero.toString().padStart(4, '0') + '/' + anoAtual;
}
/* ==== FIM SEÇÃO - FUNÇÕES AUXILIARES ==== */

/* ==== INÍCIO SEÇÃO - GERAÇÃO DE ORÇAMENTO ==== */
function gerarOrcamento() {
    const orcamento = {
        numero: gerarNumeroFormatado(numeroOrcamento),
        dataOrcamento: document.getElementById("dataOrcamento").value,
        dataValidade: document.getElementById("dataValidade").value,
        cliente: document.getElementById("cliente").value,
        endereco: document.getElementById("endereco").value,
        tema: document.getElementById("tema").value,
        cidade: document.getElementById("cidade").value,
        contato: document.getElementById("contato").value,
        cores: document.getElementById("cores").value,
        produtos: [],
        entrega: Array.from(document.querySelectorAll('input[name="entrega"]:checked')).map(el => el.value),
        pagamento: Array.from(document.querySelectorAll('input[name="pagamento"]:checked')).map(el => el.value),
        valorFrete: parseFloat(document.getElementById("valorFrete").value.replace(/[^\d,]/g, '').replace(',', '.')),
        valorOrcamento: parseFloat(document.getElementById("valorOrcamento").value.replace(/[^\d,]/g, '').replace(',', '.')),
        total: parseFloat(document.getElementById("total").value.replace(/[^\d,]/g, '').replace(',', '.')),
        observacoes: document.getElementById("observacoes").value
    };

    const produtos = document.querySelectorAll("#tabelaProdutos tbody tr");
    produtos.forEach(row => {
        orcamento.produtos.push({
            quantidade: parseFloat(row.querySelector(".produto-quantidade").value),
            descricao: row.querySelector(".produto-descricao").value,
            valorUnit: parseFloat(row.querySelector(".produto-valor-unit").value.replace(/[^\d,]/g, '').replace(',', '.')),
            valorTotal: parseFloat(row.cells[3].textContent.replace(/[^\d,]/g, '').replace(',', '.'))
        });
    });

    orcamentos.push(orcamento);
    numeroOrcamento++;
    
    // Chamar a função para exibir o orçamento em HTML
    exibirOrcamentoEmHTML(orcamento);

    // Gerar backup dos dados
    exportarDados();

    // Salvar dados no localStorage
    salvarDados();

    // Limpar formulário e tabela de produtos
    document.getElementById("orcamento").reset();
    limparCamposMoeda();
    document.querySelector("#tabelaProdutos tbody").innerHTML = "";

    alert("Orçamento gerado com sucesso!");
}

function exibirOrcamentoEmHTML(orcamento) {
    // Cria uma nova janela/aba
    const janelaOrcamento = window.open('orcamento.html', '_blank');

    // Aguarda a nova janela carregar o HTML base
    janelaOrcamento.addEventListener('load', () => {
        // Obtém a referência para o div onde o conteúdo será inserido
        const conteudoOrcamento = janelaOrcamento.document.getElementById("conteudo-orcamento");

        // Adiciona as informações do orçamento
        let html = `
            <h2>Orçamento Nº ${orcamento.numero}</h2>
            <div class="info-orcamento">
                <strong>Data do Orçamento:</strong> ${orcamento.dataOrcamento}<br>
                <strong>Data de Validade:</strong> ${orcamento.dataValidade}<br>
                <strong>Cliente:</strong> ${orcamento.cliente}<br>
                <strong>Endereço:</strong> ${orcamento.endereco}<br>
                <strong>Cidade:</strong> ${orcamento.cidade}<br>
                <strong>Contato:</strong> ${orcamento.contato}<br>
                ${orcamento.tema ? `<strong>Tema:</strong> ${orcamento.tema}<br>` : ''}
                ${orcamento.cores ? `<strong>Cores:</strong> ${orcamento.cores}<br>` : ''}
            </div>
            <h3>Produtos</h3>
            <table>
                <thead>
                    <tr>
                        <th>Quantidade</th>
                        <th>Descrição do Produto</th>
                        <th>Valor Unit.</th>
                        <th>Valor Total</th>
                    </tr>
                </thead>
                <tbody>
        `;

        // Adiciona as linhas de produtos
        orcamento.produtos.forEach(produto => {
            html += `
                <tr>
                    <td>${produto.quantidade}</td>
                    <td>${produto.descricao}</td>
                    <td>${formatarMoeda(produto.valorUnit)}</td>
                    <td>${formatarMoeda(produto.valorTotal)}</td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
            <div class="info-orcamento">
                <strong>Entrega:</strong> ${orcamento.entrega.join(', ')}<br>
                <strong>Pagamento:</strong> ${orcamento.pagamento.join(', ')}<br>
                <strong>Valor do Frete:</strong> ${formatarMoeda(orcamento.valorFrete)}<br>
                <strong>Valor do Orçamento:</strong> ${formatarMoeda(orcamento.valorOrcamento)}<br>
                <strong>Total:</strong> ${formatarMoeda(orcamento.total)}<br>
                ${orcamento.observacoes ? `<strong>Observações:</strong> ${orcamento.observacoes}<br>` : ''}
            </div>
        `;

        // Insere o HTML do orçamento na nova janela
        conteudoOrcamento.innerHTML = html;
    });
}

/* ==== FIM SEÇÃO - GERAÇÃO DE ORÇAMENTO ==== */

/* ==== INÍCIO SEÇÃO - ORÇAMENTOS GERADOS ==== */
function mostrarOrcamentosGerados() {
    const tbody = document.querySelector("#tabela-orcamentos tbody");
    tbody.innerHTML = '';

    orcamentos.forEach(orcamento => {
        const row = tbody.insertRow();
        const cellNumero = row.insertCell();
        const cellData = row.insertCell();
        const cellCliente = row.insertCell();
        const cellTotal = row.insertCell();
        const cellAcoes = row.insertCell();

        cellNumero.textContent = orcamento.numero;
        cellData.textContent = orcamento.dataOrcamento;
        cellCliente.textContent = orcamento.cliente;
        cellTotal.textContent = formatarMoeda(orcamento.total);
        cellAcoes.innerHTML = `<button type="button" onclick="gerarPedido('${orcamento.numero}')">Gerar Pedido</button>
                               <button type="button" onclick="exibirOrcamentoEmHTML(orcamentos.find(o => o.numero === '${orcamento.numero}'))">Visualizar</button>`;
    });
}

function filtrarOrcamentos() {
    const dataInicio = document.getElementById('filtroDataInicioOrcamento').value;
    const dataFim = document.getElementById('filtroDataFimOrcamento').value;
    const numeroOrcamentoFiltro = parseInt(document.getElementById('filtroNumeroOrcamento').value);
    const anoOrcamentoFiltro = parseInt(document.getElementById('filtroAnoOrcamento').value);

    const orcamentosFiltrados = orcamentos.filter(orcamento => {
        const [numOrcamento, anoOrcamento] = orcamento.numero.split('/');
        const dataOrcamento = new Date(orcamento.dataOrcamento);

        return (!dataInicio || dataOrcamento >= new Date(dataInicio)) &&
               (!dataFim || dataOrcamento <= new Date(dataFim)) &&
               (!numeroOrcamentoFiltro || parseInt(numOrcamento) === numeroOrcamentoFiltro) &&
               (!anoOrcamentoFiltro || parseInt(anoOrcamento) === anoOrcamentoFiltro);
    });

    atualizarListaOrcamentos(orcamentosFiltrados);
}

function atualizarListaOrcamentos(orcamentosFiltrados) {
    const tbody = document.querySelector("#tabela-orcamentos tbody");
    tbody.innerHTML = '';

    orcamentosFiltrados.forEach(orcamento => {
        const row = tbody.insertRow();
        row.insertCell().textContent = orcamento.numero;
        row.insertCell().textContent = orcamento.dataOrcamento;
        row.insertCell().textContent = orcamento.cliente;
        row.insertCell().textContent = formatarMoeda(orcamento.total);
        row.insertCell().innerHTML = `<button type="button" onclick="gerarPedido('${orcamento.numero}')">Gerar Pedido</button>
                                       <button type="button" onclick="exibirOrcamentoEmHTML(orcamentos.find(o => o.numero === '${orcamento.numero}'))">Visualizar</button>`;
    });
}
/* ==== FIM SEÇÃO - ORÇAMENTOS GERADOS ==== */

/* ==== INÍCIO SEÇÃO - GERAR PEDIDO A PARTIR DO ORÇAMENTO ==== */
function gerarPedido(numeroOrcamento) {
    const orcamento = orcamentos.find(o => o.numero === numeroOrcamento);
    if (!orcamento) {
        alert("Orçamento não encontrado.");
        return;
    }

    numeroPedido++; // Incrementar numeroPedido antes de usá-lo

    const pedido = {
        numero: gerarNumeroFormatado(numeroPedido), // Usar numeroPedido para gerar o número do pedido
        ...orcamento, // Copia os dados do orçamento para o pedido
        dataPedido: new Date().toISOString().split('T')[0], // Define a data do pedido como hoje
        dataEntrega: orcamento.dataValidade, // Usar dataValidade como dataEntrega
        entrada: 0,
        restante: orcamento.total,
        lucro: 0,
        observacoes: ''
    };

    // Remover campo dataValidade, pois não faz parte do pedido
    delete pedido.dataValidade;

    pedidos.push(pedido);

    // Gerar backup dos dados
    exportarDados();

    // Salvar dados no localStorage
    salvarDados();

    alert(`Pedido Nº ${pedido.numero} gerado com sucesso a partir do orçamento Nº ${numeroOrcamento}!`);
    mostrarPagina('lista-pedidos');
    mostrarPedidosRealizados();
}
/* ==== FIM SEÇÃO - GERAR PEDIDO A PARTIR DO ORÇAMENTO ==== */

/* ==== INÍCIO SEÇÃO - PEDIDOS REALIZADOS ==== */
function mostrarPedidosRealizados() {
    const tbody = document.querySelector("#tabela-pedidos tbody");
    tbody.innerHTML = '';

    pedidos.forEach(pedido => {
        const row = tbody.insertRow();
        const cellNumero = row.insertCell();
        const cellDataPedido = row.insertCell();
        const cellCliente = row.insertCell();
        const cellTotal = row.insertCell();
        const cellAcoes = row.insertCell();

        cellNumero.textContent = pedido.numero;
        cellDataPedido.textContent = pedido.dataPedido;
        cellCliente.textContent = pedido.cliente;
        cellTotal.textContent = formatarMoeda(pedido.total);
        cellAcoes.innerHTML = `<button type="button" onclick="editarPedido('${pedido.numero}')">Editar</button>`;
    });
}

function editarPedido(numeroPedido) {
    const pedido = pedidos.find(p => p.numero === numeroPedido);
    if (!pedido) {
        alert("Pedido não encontrado.");
        return;
    }

    // Preencher o formulário de edição com os dados do pedido
    document.getElementById("dataPedidoEdicao").value = pedido.dataPedido;
    document.getElementById("dataEntregaEdicao").value = pedido.dataEntrega;
    document.getElementById("clienteEdicao").value = pedido.cliente;
    document.getElementById("enderecoEdicao").value = pedido.endereco;
    document.getElementById("temaEdicao").value = pedido.tema;
    document.getElementById("cidadeEdicao").value = pedido.cidade;
    document.getElementById("contatoEdicao").value = pedido.contato;
    document.getElementById("coresEdicao").value = pedido.cores;
    document.getElementById("valorFreteEdicao").value = formatarMoeda(pedido.valorFrete);
    document.getElementById("valorPedidoEdicao").value = formatarMoeda(pedido.valorOrcamento); // Usar valorOrcamento como valor do pedido
    document.getElementById("totalEdicao").value = formatarMoeda(pedido.total);
    document.getElementById("entradaEdicao").value = formatarMoeda(pedido.entrada);
    document.getElementById("restanteEdicao").value = formatarMoeda(pedido.restante);
    document.getElementById("lucroEdicao").value = formatarMoeda(pedido.lucro);
    document.getElementById("observacoesEdicao").value = pedido.observacoes;

    // Preencher a tabela de produtos
    const tbody = document.querySelector("#tabelaProdutosEdicao tbody");
    tbody.innerHTML = '';
    pedido.produtos.forEach(produto => {
        const row = tbody.insertRow();
        const cellQuantidade = row.insertCell();
        const cellDescricao = row.insertCell();
        const cellValorUnit = row.insertCell();
        const cellValorTotal = row.insertCell();

        cellQuantidade.innerHTML = `<input type="number" class="produto-quantidade" value="${produto.quantidade}" min="1" onchange="atualizarTotaisEdicao()">`;
        cellDescricao.innerHTML = `<input type="text" class="produto-descricao" value="${produto.descricao}">`;
        cellValorUnit.innerHTML = `<input type="text" class="produto-valor-unit" value="${formatarMoeda(produto.valorUnit)}" onblur="formatarCampoMoeda(this); atualizarTotaisEdicao()">`;
        cellValorTotal.textContent = formatarMoeda(produto.valorTotal);
    });

    // Preencher checkboxes de entrega e pagamento
    document.querySelectorAll('input[name="entregaEdicao"]').forEach(el => el.checked = pedido.entrega.includes(el.value));
    document.querySelectorAll('input[name="pagamentoEdicao"]').forEach(el => el.checked = pedido.pagamento.includes(el.value));

    // Mostrar a página de edição
    mostrarPagina('form-edicao-pedido');
}

function atualizarPedido() {
    const numeroPedido = document.querySelector("#tabela-pedidos tbody tr:focus-within td:first-child").textContent;
    const pedidoIndex = pedidos.findIndex(p => p.numero === numeroPedido);

    if (pedidoIndex === -1) {
        alert("Pedido não encontrado.");
        return;
    }

    const pedidoAtualizado = {
        numero: numeroPedido, // Preencher o número do pedido
        dataPedido: document.getElementById("dataPedidoEdicao").value,
        dataEntrega: document.getElementById("dataEntregaEdicao").value,
        cliente: document.getElementById("clienteEdicao").value,
        endereco: document.getElementById("enderecoEdicao").value,
        tema: document.getElementById("temaEdicao").value,
        cidade: document.getElementById("cidadeEdicao").value,
        contato: document.getElementById("contatoEdicao").value,
        cores: document.getElementById("coresEdicao").value,
        produtos: [],
        entrega: Array.from(document.querySelectorAll('input[name="entregaEdicao"]:checked')).map(el => el.value),
        pagamento: Array.from(document.querySelectorAll('input[name="pagamentoEdicao"]:checked')).map(el => el.value),
        valorFrete: parseFloat(document.getElementById("valorFreteEdicao").value.replace(/[^\d,]/g, '').replace(',', '.')),
        valorOrcamento: parseFloat(document.getElementById("valorPedidoEdicao").value.replace(/[^\d,]/g, '').replace(',', '.')),
        total: parseFloat(document.getElementById("totalEdicao").value.replace(/[^\d,]/g, '').replace(',', '.')),
        entrada: parseFloat(document.getElementById("entradaEdicao").value.replace(/[^\d,]/g, '').replace(',', '.')),
        restante: parseFloat(document.getElementById("restanteEdicao").value.replace(/[^\d,]/g, '').replace(',', '.')),
        lucro: parseFloat(document.getElementById("lucroEdicao").value.replace(/[^\d,]/g, '').replace(',', '.')),
        observacoes: document.getElementById("observacoesEdicao").value
    };

    const produtos = document.querySelectorAll("#tabelaProdutosEdicao tbody tr");
    produtos.forEach(row => {
        pedidoAtualizado.produtos.push({
            quantidade: parseFloat(row.querySelector(".produto-quantidade").value),
            descricao: row.querySelector(".produto-descricao").value,
            valorUnit: parseFloat(row.querySelector(".produto-valor-unit").value.replace(/[^\d,]/g, '').replace(',', '.')),
            valorTotal: parseFloat(row.cells[3].textContent.replace(/[^\d,]/g, '').replace(',', '.'))
        });
    });

    pedidos[pedidoIndex] = pedidoAtualizado;

    // Gerar backup dos dados
    exportarDados();

    // Salvar dados no localStorage
    salvarDados();

    alert("Pedido atualizado com sucesso!");
    mostrarPagina('lista-pedidos');
    mostrarPedidosRealizados();
}
/* ==== FIM SEÇÃO - PEDIDOS REALIZADOS ==== */

/* ==== INÍCIO SEÇÃO - RELATÓRIO ==== */
function filtrarPedidosRelatorio() {
    const dataInicio = document.getElementById('filtroDataInicio').value;
    const dataFim = document.getElementById('filtroDataFim').value;

    const pedidosFiltrados = pedidos.filter(pedido => {
        return pedido.dataPedido >= dataInicio && pedido.dataPedido <= dataFim;
    });

    gerarRelatorio(pedidosFiltrados);
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

function gerarRelatorioCSV() {
    let csv = 'Número do Pedido,Data do Pedido,Cliente,Total,Frete,Lucro\n';

    pedidos.forEach(pedido => {
        csv += `${pedido.numero},${pedido.dataPedido},${pedido.cliente},${pedido.total},${pedido.valorFrete},${pedido.lucro}\n`;
    });

    const hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'relatorio_pedidos.csv';
    hiddenElement.click();
}
/* ==== FIM SEÇÃO - RELATÓRIO ==== */

/* ==== INÍCIO SEÇÃO - IMPORTAR/EXPORTAR ==== */
function exportarDados() {
    const dadosParaExportar = JSON.stringify({ orcamentos, pedidos, numeroOrcamento, numeroPedido });
    const blob = new Blob([dadosParaExportar], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Obter data e hora atuais
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = (agora.getMonth() + 1).toString().padStart(2, '0'); // +1 porque os meses começam em 0
    const dia = agora.getDate().toString().padStart(2, '0');
    const hora = agora.getHours().toString().padStart(2, '0');
    const minuto = agora.getMinutes().toString().padStart(2, '0');
    const nomeArquivo = `${ano}${mes}${dia}_${hora}${minuto}_Backup_Pérola_Rara.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importarDados() {
    const inputImportar = document.getElementById('inputImportar');
    if (inputImportar.files.length > 0) {
        const arquivo = inputImportar.files[0];
        const leitor = new FileReader();

        leitor.onload = function (e) {
            try {
                const dadosImportados = JSON.parse(e.target.result);
                orcamentos = dadosImportados.orcamentos || [];
                pedidos = dadosImportados.pedidos || [];
                numeroOrcamento = dadosImportados.numeroOrcamento || 1;
                numeroPedido = dadosImportados.numeroPedido || 1;

                salvarDados();
                alert('Dados importados com sucesso!');
                mostrarPagina('form-orcamento');
            } catch (erro) {
                alert('Erro ao importar dados: ' + erro.message);
            }
        };

        leitor.readAsText(arquivo);
    } else {
        alert('Selecione um arquivo para importar.');
    }
}
/* ==== FIM SEÇÃO - IMPORTAR/EXPORTAR ==== */

/* ==== INÍCIO SEÇÃO - FUNÇÕES DE CONTROLE DE PÁGINA ==== */
function mostrarPagina(idPagina) {
    const paginas = document.querySelectorAll('.pagina');
    paginas.forEach(pagina => {
        pagina.style.display = 'none';
    });

    document.getElementById(idPagina).style.display = 'block';
}

function salvarDados() {
    localStorage.setItem('orcamentos', JSON.stringify(orcamentos));
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    localStorage.setItem('numeroOrcamento', numeroOrcamento);
    localStorage.setItem('numeroPedido', numeroPedido);
}

function carregarDados() {
    orcamentos = JSON.parse(localStorage.getItem('orcamentos')) || [];
    pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    numeroOrcamento = parseInt(localStorage.getItem('numeroOrcamento')) || 1;
    numeroPedido = parseInt(localStorage.getItem('numeroPedido')) || 1;
}
/* ==== FIM SEÇÃO - FUNÇÕES DE CONTROLE DE PÁGINA ==== */

