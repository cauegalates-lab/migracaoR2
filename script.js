const CONFIG = {
  // Link informado por você.
  // Depois de atualizar o Apps Script, mantenha este mesmo endereço.
  DATA_URL:
 "https://script.google.com/macros/s/AKfycbwQGo2Ipg9zfIKAaN5A1YtCZMIckRqQOkhB8BE7T3Uq4x8tDeve4Asz7WF3sRD2fit1/exec",


  // Atualiza automaticamente a cada 30 segundos.
  AUTO_REFRESH_MS: 30000,

  // Tempo máximo para a resposta do Apps Script.
  REQUEST_TIMEOUT_MS: 60000
};

const state = {
  dados: [],
  filtrados: [],
  carregando: false
};

const dom = {
  corpoTabela: document.querySelector("#corpoTabela"),
  estadoVazio: document.querySelector("#estadoVazio"),
  statusTabela: document.querySelector("#statusTabela"),
  ultimaAtualizacao: document.querySelector("#ultimaAtualizacao"),

  busca: document.querySelector("#busca"),
  filtroVendedor: document.querySelector("#filtroVendedor"),
  filtroPagamento: document.querySelector("#filtroPagamento"),
  filtroModalidade: document.querySelector("#filtroModalidade"),
  filtroPendencia: document.querySelector("#filtroPendencia"),

  btnLimpar: document.querySelector("#btnLimpar"),
  btnAtualizar: document.querySelector("#btnAtualizar"),

  totalRegistros: document.querySelector("#totalRegistros")
};

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizarPendencia(valor) {
  const texto = normalizarTexto(valor);

  if (
    texto === "sim" ||
    texto === "s" ||
    texto === "pendente" ||
    texto === "true" ||
    texto === "1"
  ) {
    return "SIM";
  }

  if (
    texto === "nao" ||
    texto === "n" ||
    texto === "ok" ||
    texto === "false" ||
    texto === "0" ||
    texto === ""
  ) {
    return "NÃO";
  }

  // Preserva textos diferentes, mas considera como pendência visível.
  return String(valor ?? "").trim().toUpperCase();
}

function converterNumero(valor) {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : 0;
  }

  let texto = String(valor ?? "")
    .replace(/R\$/gi, "")
    .replace(/\s/g, "")
    .trim();

  if (!texto) {
    return 0;
  }

  if (texto.includes(",") && texto.includes(".")) {
    texto = texto.replace(/\./g, "").replace(",", ".");
  } else if (texto.includes(",")) {
    texto = texto.replace(",", ".");
  }

  const numero = Number(texto);
  return Number.isFinite(numero) ? numero : 0;
}

function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(converterNumero(valor));
}

function escaparHTML(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizarRegistro(registro) {
  return {
    dia: registro.dia ?? registro.DIA ?? "",
    mes: registro.mes ?? registro.MES ?? "",
    ano: registro.ano ?? registro.ANO ?? "",
    vendedor: registro.vendedor ?? registro.VENDEDOR ?? "",
    aluno: registro.aluno ?? registro.ALUNO ?? "",
    tipoPgto:
      registro.tipoPgto ??
      registro.tipo_pgto ??
      registro["TIPO PGTO"] ??
      "",
    taxa: registro.taxa ?? registro.TAXA ?? "",
    boleto: registro.boleto ?? registro.BOLETO ?? "",
    parcelas: registro.parcelas ?? registro.PARCELAS ?? "",
    cartao:
      registro.cartao ??
      registro.CARTAO ??
      registro["CARTÃO"] ??
      "",
    pendenciaR2: normalizarPendencia(
      registro.pendenciaR2 ??
      registro.pendencia_r2 ??
      registro["PENDÊNCIA R2"] ??
      registro["PENDENCIA R2"] ??
      ""
    ),
    modalidade: registro.modalidade ?? registro.MODALIDADE ?? ""
  };
}


function criarChaveRegistro(registro) {
  return [
    registro.dia,
    registro.mes,
    registro.ano,
    registro.vendedor,
    registro.aluno,
    registro.tipoPgto,
    registro.parcelas,
    registro.cartao,
    registro.boleto,
    registro.modalidade
  ]
    .map((valor) => normalizarTexto(valor))
    .join("|");
}

function obterBaixaBoleto(registro) {
  const chave = criarChaveRegistro(registro);
  return localStorage.getItem(`baixa-boleto:${chave}`) || "PENDENTE";
}

function salvarBaixaBoleto(chave, status) {
  localStorage.setItem(`baixa-boleto:${chave}`, status);
}

function criarLinha(registro) {
  const temPendencia = registro.pendenciaR2 !== "NÃO";
  const textoPendencia = temPendencia
    ? escaparHTML(registro.pendenciaR2 || "PENDENTE")
    : "OK";

  const chaveBaixa = criarChaveRegistro(registro);
  const statusBaixa = obterBaixaBoleto(registro);

  return `
    <tr>
      <td title="${escaparHTML(registro.dia)}">${escaparHTML(registro.dia)}</td>
      <td title="${escaparHTML(registro.mes)}">${escaparHTML(registro.mes)}</td>
      <td title="${escaparHTML(registro.ano)}">${escaparHTML(registro.ano)}</td>
      <td title="${escaparHTML(registro.vendedor)}">${escaparHTML(registro.vendedor)}</td>
      <td title="${escaparHTML(registro.aluno)}">${escaparHTML(registro.aluno)}</td>
      <td title="${escaparHTML(registro.tipoPgto)}">
        <span class="pagamento">${escaparHTML(registro.tipoPgto)}</span>
      </td>
      <td class="valor" title="${escaparHTML(registro.taxa)}">${escaparHTML(registro.taxa)}</td>
      <td class="valor" title="${escaparHTML(registro.boleto)}">${escaparHTML(registro.boleto)}</td>
      <td title="${escaparHTML(registro.parcelas)}">${escaparHTML(registro.parcelas)}</td>
      <td class="valor" title="${escaparHTML(registro.cartao)}">${escaparHTML(registro.cartao)}</td>
      <td>
        <span class="etiqueta ${temPendencia ? "etiqueta-pendente" : "etiqueta-ok"}">
          ${textoPendencia}
        </span>
      </td>
      <td>
        <select
          class="baixa-select ${statusBaixa === "OK" ? "baixa-select-ok" : "baixa-select-pendente"}"
          data-chave="${escaparHTML(chaveBaixa)}"
          aria-label="Baixa do boleto de ${escaparHTML(registro.aluno)}"
        >
          <option value="PENDENTE" ${statusBaixa === "PENDENTE" ? "selected" : ""}>
            Pendente
          </option>
          <option value="OK" ${statusBaixa === "OK" ? "selected" : ""}>
            OK
          </option>
        </select>
      </td>
      <td title="${escaparHTML(registro.modalidade)}">${escaparHTML(registro.modalidade)}</td>
    </tr>
  `;
}

function renderizarTabela() {
  dom.corpoTabela.innerHTML = state.filtrados.map(criarLinha).join("");

  const vazio = state.filtrados.length === 0;
  dom.estadoVazio.hidden = !vazio;

  dom.statusTabela.textContent =
    `${state.filtrados.length} de ${state.dados.length} registros exibidos`;

  atualizarResumo();
}

function atualizarResumo() {
  dom.totalRegistros.textContent = state.filtrados.length;
}

function preencherSelect(select, valores) {
  const valorAtual = select.value;
  const opcaoInicial = select.options[0];

  select.innerHTML = "";
  select.appendChild(opcaoInicial);

  [...new Set(valores.filter(Boolean))]
    .sort((a, b) =>
      String(a).localeCompare(String(b), "pt-BR", {
        sensitivity: "base"
      })
    )
    .forEach((valor) => {
      const option = document.createElement("option");
      option.value = valor;
      option.textContent = valor;
      select.appendChild(option);
    });

  select.value = valorAtual;
}

function atualizarFiltros() {
  preencherSelect(
    dom.filtroVendedor,
    state.dados.map((item) => item.vendedor)
  );

  preencherSelect(
    dom.filtroPagamento,
    state.dados.map((item) => item.tipoPgto)
  );

  preencherSelect(
    dom.filtroModalidade,
    state.dados.map((item) => item.modalidade)
  );
}

function aplicarFiltros() {
  const termo = normalizarTexto(dom.busca.value);
  const vendedor = dom.filtroVendedor.value;
  const pagamento = dom.filtroPagamento.value;
  const modalidade = dom.filtroModalidade.value;
  const pendencia = dom.filtroPendencia.value;

  state.filtrados = state.dados.filter((item) => {
    const textoCompleto = normalizarTexto(
      [
        item.dia,
        item.mes,
        item.ano,
        item.vendedor,
        item.aluno,
        item.tipoPgto,
        item.taxa,
        item.boleto,
        item.parcelas,
        item.cartao,
        item.pendenciaR2,
        item.modalidade
      ].join(" ")
    );

    const correspondePendencia =
      !pendencia ||
      (pendencia === "SIM" && item.pendenciaR2 !== "NÃO") ||
      (pendencia === "NÃO" && item.pendenciaR2 === "NÃO");

    return (
      (!termo || textoCompleto.includes(termo)) &&
      (!vendedor || item.vendedor === vendedor) &&
      (!pagamento || item.tipoPgto === pagamento) &&
      (!modalidade || item.modalidade === modalidade) &&
      correspondePendencia
    );
  });

  renderizarTabela();
}

function limparFiltros() {
  dom.busca.value = "";
  dom.filtroVendedor.value = "";
  dom.filtroPagamento.value = "";
  dom.filtroModalidade.value = "";
  dom.filtroPendencia.value = "";

  aplicarFiltros();
}

function buscarJsonp() {
  return new Promise((resolve, reject) => {
    const callbackName =
      `receberVendasR2_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    const separador = CONFIG.DATA_URL.includes("?") ? "&" : "?";
    const url =
      `${CONFIG.DATA_URL}${separador}` +
      `callback=${callbackName}&t=${Date.now()}`;

    const script = document.createElement("script");
    let finalizado = false;

    const limpar = () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      try {
        delete window[callbackName];
      } catch {
        window[callbackName] = undefined;
      }
    };

    const timeoutId = window.setTimeout(() => {
      if (finalizado) return;

      finalizado = true;
      limpar();
      reject(new Error("O Apps Script demorou para responder."));
    }, CONFIG.REQUEST_TIMEOUT_MS);

    window[callbackName] = (resposta) => {
      if (finalizado) return;

      finalizado = true;
      window.clearTimeout(timeoutId);
      limpar();
      resolve(resposta);
    };

    script.onerror = () => {
      if (finalizado) return;

      finalizado = true;
      window.clearTimeout(timeoutId);
      limpar();
      reject(new Error("Não foi possível acessar o Apps Script."));
    };

    script.src = url;
    document.head.appendChild(script);
  });
}

async function carregarDados() {
  if (state.carregando) {
    return;
  }

  state.carregando = true;
  dom.btnAtualizar.disabled = true;
  dom.statusTabela.textContent = "Carregando dados da planilha...";

  try {
    const resposta = await buscarJsonp();

    if (!resposta || resposta.sucesso === false) {
      throw new Error(
        resposta?.mensagem || "O Apps Script retornou uma resposta inválida."
      );
    }

    if (!Array.isArray(resposta.dados)) {
      throw new Error("A resposta não contém a lista de vendas.");
    }

    state.dados = resposta.dados.map(normalizarRegistro);

    atualizarFiltros();
    aplicarFiltros();

    const agora = new Date();
    dom.ultimaAtualizacao.textContent =
      `Atualizado às ${agora.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })}`;
  } catch (erro) {
    console.error(erro);

    state.dados = [];
    state.filtrados = [];
    renderizarTabela();

    dom.statusTabela.textContent =
      `Erro ao carregar: ${erro.message}`;

    dom.ultimaAtualizacao.textContent =
      "Verifique a implantação do Apps Script";
  } finally {
    state.carregando = false;
    dom.btnAtualizar.disabled = false;
  }
}


function atualizarAlturaTopoFixo() {
  const painelFixo = document.querySelector(".painel-fixo");

  if (!painelFixo) {
    return;
  }

  const altura = Math.ceil(
    painelFixo.getBoundingClientRect().height
  );

  document.documentElement.style.setProperty(
    "--topo-fixo-altura",
    `${altura}px`
  );
}

function configurarEventos() {
  dom.busca.addEventListener("input", aplicarFiltros);
  dom.filtroVendedor.addEventListener("change", aplicarFiltros);
  dom.filtroPagamento.addEventListener("change", aplicarFiltros);
  dom.filtroModalidade.addEventListener("change", aplicarFiltros);
  dom.filtroPendencia.addEventListener("change", aplicarFiltros);

  dom.btnLimpar.addEventListener("click", limparFiltros);
  dom.btnAtualizar.addEventListener("click", carregarDados);

  dom.corpoTabela.addEventListener("change", (evento) => {
    const select = evento.target.closest(".baixa-select");

    if (!select) {
      return;
    }

    const chave = select.dataset.chave;
    const status = select.value;

    if (!chave || !status) {
      return;
    }

    salvarBaixaBoleto(chave, status);

    select.classList.toggle(
      "baixa-select-ok",
      status === "OK"
    );

    select.classList.toggle(
      "baixa-select-pendente",
      status !== "OK"
    );
  });

  window.addEventListener("resize", atualizarAlturaTopoFixo);

  const painelFixo = document.querySelector(".painel-fixo");

  if (painelFixo && "ResizeObserver" in window) {
    const observerTopo = new ResizeObserver(atualizarAlturaTopoFixo);
    observerTopo.observe(painelFixo);
  }

  window.setInterval(carregarDados, CONFIG.AUTO_REFRESH_MS);
}

configurarEventos();
atualizarAlturaTopoFixo();
carregarDados();

window.setTimeout(atualizarAlturaTopoFixo, 100);
window.setTimeout(atualizarAlturaTopoFixo, 500);
