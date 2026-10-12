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

// botoes para abrir e fechar o modal
addReceita.addEventListener("click", () => {
    modalOverlay.classList.remove("hidden");
    modalTitle.textContent = "Adicionar Receita";
    campoClassificacao.classList.add("hidden");
    campoPagamento.classList.add("hidden");
    tipoTransacao = "receita";
});

addDespesa.addEventListener("click", () => {
    modalOverlay.classList.remove("hidden");
    modalTitle.textContent = "Adicionar Despesa";
    campoClassificacao.classList.remove("hidden");
    campoPagamento.classList.remove("hidden");
    tipoTransacao = "despesa";
});

botoesFechar.forEach((fechar) => {
    fechar.addEventListener("click", () => {
        modalOverlay.classList.add("hidden");
    });
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

    const transacao = {
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
    localStorage.setItem("transacoes", JSON.stringify(transacoes));
    renderizarTransacoes();
    atualizarResumo();

    formTransacao.reset();
    modalOverlay.classList.add("hidden");
});

renderizarTransacoes();
atualizarResumo();

/* RESETAR OS DADOS DE TESTE

transacoes.length = 0;
localStorage.setItem("transacoes", JSON.stringify(transacoes));
renderizarTransacoes(); 

*/