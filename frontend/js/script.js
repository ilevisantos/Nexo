const addReceita = document.getElementById("add_receita");
const addDespesa = document.getElementById("add_despesa");
const botoesFechar = document.querySelectorAll(".close-modal, .cancel-modal");
const modalOverlay = document.getElementById("modal-overlay");
const modalTitle = document.querySelector(".modal-title");
const campoClassificacao = document.querySelector(".campo-classificacao");
const campoPagamento = document.querySelector(".campo-pagamento");
const formTransacao = document.querySelector(".form-transacao");
const campoNome = document.getElementById("nome");
const campoValor = document.getElementById("valor");
const campoCategoria = document.getElementById("categoria");
const selectClassificacao = document.getElementById("classificacao");
const selectPagamento = document.getElementById("pagamento");
const campoConta = document.getElementById("conta");
const campoData = document.getElementById("data");
let tipoTransacao = "";
const transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];
const listaTransacoes = document.getElementById("lista-transacoes");
const valorRecebido = document.getElementById("valor-recebido");
const valorDespesas = document.getElementById("valor-despesas");
const valorSaldo = document.getElementById("valor-saldo");
let transacoesSelecionadas = [];
const areaAcoes = document.getElementById("area-acoes");
const quantidadeSelecionadas = document.getElementById("transacoes-selecionadas");
const botaoEditar = document.getElementById("btn-editar");
const botaoExcluir = document.getElementById("btn-excluir");
const modalExclusao = document.getElementById("modal-exclusao");
const mensagemExclusao = document.getElementById("mensagem-exclusao");
const botaoCancelarExclusao = document.getElementById("cancelar-exclusao");
const botaoConfirmarExclusao = document.getElementById("confirmar-exclusao");
let transacaoEmEdicao = null;
const botaoSalvarTransacao = formTransacao.querySelector('button[type="submit"]');

// botoes para abrir e fechar o modal
addReceita.addEventListener("click", () => {
    formTransacao.reset();
    transacaoEmEdicao = null;
    modalTitle.textContent = "Adicionar Receita";
    botaoSalvarTransacao.textContent = "Salvar";
    campoClassificacao.classList.add("hidden");
    campoPagamento.classList.add("hidden");
    tipoTransacao = "receita";
    
    modalOverlay.classList.remove("hidden");
});

addDespesa.addEventListener("click", () => {
    formTransacao.reset();
    transacaoEmEdicao = null;
    modalTitle.textContent = "Adicionar Despesa";
    botaoSalvarTransacao.textContent = "Salvar";
    campoClassificacao.classList.remove("hidden");
    campoPagamento.classList.remove("hidden");
    tipoTransacao = "despesa";

    modalOverlay.classList.remove("hidden");
});

botoesFechar.forEach((fechar) => {
    fechar.addEventListener("click", fecharModalTransacao);
});

// funcoes reutilizaveis
function mostrarErro(campo, mensagem) {
    const erro = document.getElementById(`erro-${campo.id}`);

    erro.textContent = mensagem;
    campo.classList.add("invalido");
}
function limparErros() {
    document.querySelectorAll(".erro-campo").forEach((erro) => {
        erro.textContent = "";
    });

    document.querySelectorAll(".invalido").forEach((campo) => {
        campo.classList.remove("invalido");
    });
}
function limparErroCampo(campo) {
    const erro = document.getElementById(`erro-${campo.id}`);

    erro.textContent = "";
    campo.classList.remove("invalido");
}
const formatadorMoeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
});

function renderizarTransacoes() {
    listaTransacoes.innerHTML = "";
    
    transacoesOrdenadas = transacoes.toSorted((a, b) => {
        return b.data.localeCompare(a.data);
    });

    transacoesOrdenadas.forEach((transacao) => {
        const linha = document.createElement("tr");
        
        const celulaSelecao = document.createElement("td");
        celulaSelecao.classList.add("coluna-selecao");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("checkbox-transacao");
        checkbox.value = transacao.id;
        checkbox.setAttribute("aria-label", `Selecionar ${transacao.nome}`);
        checkbox.checked = transacoesSelecionadas.includes(transacao.id);

        celulaSelecao.appendChild(checkbox);
        linha.appendChild(celulaSelecao);

        checkbox.addEventListener("change", () => {
            const id = checkbox.value;
            if (checkbox.checked) {
                transacoesSelecionadas.push(id);
            } else {
                transacoesSelecionadas = transacoesSelecionadas.filter((idSelecionado) => {
                    return idSelecionado !== id;
                });   
            }
             atualizarBarraAcoes();
        });

        const celulaNome = document.createElement("td");
        celulaNome.textContent = transacao.nome;
        linha.appendChild(celulaNome);
        
        const celulaCategoria = document.createElement("td");
        celulaCategoria.textContent = transacao.categoria;
        linha.appendChild(celulaCategoria);

        const celulaData = document.createElement("td");
        const [ano, mes, dia] = transacao.data.split("-");
        const dataFormatada = `${dia}/${mes}/${ano}`;
        celulaData.textContent = dataFormatada;
        linha.appendChild(celulaData);

        const celulaPagamento = document.createElement("td");
        celulaPagamento.textContent = transacao.pagamento || "-";
        linha.appendChild(celulaPagamento);
        
        const celulaClassificacao = document.createElement("td");
        celulaClassificacao.textContent = transacao.classificacao || "-";
        linha.appendChild(celulaClassificacao);

        const celulaConta = document.createElement("td");
        celulaConta.textContent = transacao.conta;
        linha.appendChild(celulaConta);

        const celulaValor = document.createElement("td");
        const sinal = transacao.tipo === "despesa" ? "-" : "+";
        celulaValor.textContent = `${sinal}${formatadorMoeda.format(transacao.valor)}`;
        celulaValor.classList.add(transacao.tipo);
        linha.appendChild(celulaValor);



        listaTransacoes.appendChild(linha);
    })
}

function atualizarResumo() {
    const receitas = transacoes.reduce((acumulador, transacao) => {
        if (transacao.tipo === "receita") {
            return acumulador + transacao.valor;
        }
        return acumulador;
    }, 0);

    const despesas = transacoes.reduce((acumulador, transacao) => {
        if (transacao.tipo === "despesa") {
            return acumulador + transacao.valor;
        }
        return acumulador;
    }, 0);

    const saldo = receitas - despesas;

    valorRecebido.textContent = formatadorMoeda.format(receitas);
    valorDespesas.textContent = formatadorMoeda.format(despesas);
    valorSaldo.textContent = formatadorMoeda.format(saldo);
}

function atualizarBarraAcoes() {
    const quantidade = transacoesSelecionadas.length;
    botaoEditar.disabled = quantidade !== 1;

    quantidadeSelecionadas.textContent =
        `${quantidade} ${quantidade === 1 ? "transação selecionada" : "transações selecionadas"}`;

    areaAcoes.classList.toggle("ativa", quantidade > 0);
}

function preencherFormulario(transacao) {
    formTransacao.elements.namedItem("nome").value = transacao.nome;
    formTransacao.elements.namedItem("valor").value = transacao.valor;
    formTransacao.elements.namedItem("categoria").value = transacao.categoria;
    formTransacao.elements.namedItem("conta").value = transacao.conta;
    formTransacao.elements.namedItem("data").value = transacao.data;

    formTransacao.elements.namedItem("pagamento").value = transacao.pagamento ?? "";
    formTransacao.elements.namedItem("classificacao").value = transacao.classificacao ?? "";
}

function fecharModalTransacao() {
    modalOverlay.classList.add("hidden");
    formTransacao.reset();
    transacaoEmEdicao = null;
}

// limpar os erros quando o usuario digitar algo nos campos do formulario
const camposFormulario = [
    campoNome,
    campoValor,
    campoCategoria,
    campoData,
    campoConta
];

camposFormulario.forEach((campo) => {
    campo.addEventListener("input", () => {
        limparErroCampo(campo);
    });
});
botaoExcluir.addEventListener("click", () => {
    const quantidade = transacoesSelecionadas.length;

    if (quantidade === 0) return;

    mensagemExclusao.textContent =
        `Deseja realmente excluir ${quantidade} ${quantidade === 1 ? "transação" : "transações"}? Esta ação não poderá ser desfeita.`;

    modalExclusao.classList.remove("hidden");
});

botaoCancelarExclusao.addEventListener("click", () => {
    modalExclusao.classList.add("hidden");
});

botaoConfirmarExclusao.addEventListener("click", () => {
const transacoesRestantes = transacoes.filter((transacao) => {
    return !transacoesSelecionadas.includes(transacao.id);
});

    transacoes.splice(0, transacoes.length, ...transacoesRestantes);

    localStorage.setItem("transacoes", JSON.stringify(transacoes));

    transacoesSelecionadas = [];

    renderizarTransacoes();
    atualizarResumo();
    atualizarBarraAcoes();

    modalExclusao.classList.add("hidden");
});

botaoEditar.addEventListener("click", () => {
    if (transacoesSelecionadas.length !== 1) return;

    const id = transacoesSelecionadas[0];

    const transacao = transacoes.find((transacao) => {
        return transacao.id === id;
    });

    if (!transacao) return;

    transacaoEmEdicao = transacao.id;
    tipoTransacao = transacao.tipo;

    preencherFormulario(transacao);

    modalTitle.textContent =
        transacao.tipo === "receita" ? "Editar Receita" : "Editar Despesa";

    botaoSalvarTransacao.textContent = "Salvar Alterações";

    if (transacao.tipo === "receita") {
        campoClassificacao.classList.add("hidden");
        campoPagamento.classList.add("hidden");
    } else {
        campoClassificacao.classList.remove("hidden");
        campoPagamento.classList.remove("hidden");
    }

    modalOverlay.classList.remove("hidden");
    });

// fechar o modal de exclusao ao clicar fora dele ou botao esc
modalExclusao.addEventListener("click", (event) => {
    if (event.target === modalExclusao) {
        modalExclusao.classList.add("hidden");
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modalExclusao.classList.contains("hidden")) {
        modalExclusao.classList.add("hidden");
    }
});

// evento de envio do formulario
formTransacao.addEventListener("submit", (enviar) => { 
    enviar.preventDefault();
    limparErros();
    const nome = campoNome.value.trim();
    const valor = Number(campoValor.value);
    const categoria = campoCategoria.value;
    const classificacao = selectClassificacao.value;
    const pagamento = selectPagamento.value;
    const conta = campoConta.value;
    const data = campoData.value;
    
    let formularioValido = true;

    if (nome === "") {
        mostrarErro(campoNome, "Informe o nome da transação.");
        formularioValido = false;
    }
    if (!Number.isFinite(valor) || valor <= 0) {
        mostrarErro(campoValor, "O valor deve ser um número positivo.");
        formularioValido = false;
    }
    if (categoria.trim() === "") {
        mostrarErro(campoCategoria, "Informe uma categoria.");
        formularioValido = false;
    }

    if (data === "") {
        mostrarErro(campoData, "Selecione uma data.");
        formularioValido = false;
    }

    if (conta === "") {
        mostrarErro(campoConta, "Selecione uma conta.");
        formularioValido = false;
    }
    if (!formularioValido) {
        return;
    }

    if (transacaoEmEdicao !== null) {
        const transacaoExistente = transacoes.find((transacao) => {
            return transacao.id === transacaoEmEdicao;
        });

        if (!transacaoExistente) return;
            transacaoExistente.nome = nome;
            transacaoExistente.valor = valor;
            transacaoExistente.categoria = categoria;
            transacaoExistente.classificacao =
                tipoTransacao === "despesa" ? classificacao : null;
            transacaoExistente.pagamento =
                tipoTransacao === "despesa" ? pagamento : null;
            transacaoExistente.conta = conta;
            transacaoExistente.data = data;
    } else {
    const transacao = {
        id: crypto.randomUUID(),
        tipo: tipoTransacao,
        nome,
        valor,
        categoria,
        classificacao: tipoTransacao === "despesa" ? classificacao : null,
        pagamento: tipoTransacao === "despesa" ? pagamento : null,
        conta,
        data,
    };
    transacoes.push(transacao);
    }
    
    localStorage.setItem("transacoes", JSON.stringify(transacoes));
    transacoesSelecionadas = []
    renderizarTransacoes();
    atualizarResumo();
    atualizarBarraAcoes();

    fecharModalTransacao();
});

renderizarTransacoes();
atualizarResumo();
atualizarBarraAcoes();

/* RESETAR OS DADOS DE TESTE

transacoes.length = 0;
localStorage.setItem("transacoes", JSON.stringify(transacoes));
renderizarTransacoes(); 

*/

/*OU
localStorage.removeItem("transacoes");
*/