import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import {
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updatePassword
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import {
  get,
  getDatabase,
  onValue,
  ref,
  serverTimestamp,
  set,
  update
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCbIVW0-_4vgakOCsEkt_XwiLg6DKxpjMM",
  authDomain: "migracao-r2.firebaseapp.com",
  databaseURL: "https://migracao-r2-default-rtdb.firebaseio.com",
  projectId: "migracao-r2",
  storageBucket: "migracao-r2.firebasestorage.app",
  messagingSenderId: "856420962966",
  appId: "1:856420962966:web:3bb07ec2777a21306f68b7"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);

const CONFIG = {
  DATA_URL:
    "https://script.google.com/macros/s/AKfycbwQGo2Ipg9zfIKAaN5A1YtCZMIckRqQOkhB8BE7T3Uq4x8tDeve4Asz7WF3sRD2fit1/exec",
  AUTO_REFRESH_MS: 30000,
  REQUEST_TIMEOUT_MS: 60000,
  DOMINIO_LOGIN: "sistema.local"
};

const state = {
  dados: [],
  filtrados: [],
  baixasBoleto: {},
  carregando: false,
  usuarioFirebase: null,
  primeiroAcessoPendente: false,
  painelInicializado: false,
  cancelarListenerBaixas: null,
  intervaloAtualizacao: null,
  observacaoModalChave: null,
  observacaoModalEtapa: null,
  perfilUsuario: "editor"
};

const dom = {
  telaLogin: document.querySelector("#telaLogin"),
  formLogin: document.querySelector("#formLogin"),
  formPrimeiroAcesso: document.querySelector("#formPrimeiroAcesso"),
  loginUsuario: document.querySelector("#loginUsuario"),
  loginSenha: document.querySelector("#loginSenha"),
  novaSenha: document.querySelector("#novaSenha"),
  confirmarNovaSenha: document.querySelector("#confirmarNovaSenha"),
  mensagemLogin: document.querySelector("#mensagemLogin"),
  mensagemPrimeiroAcesso: document.querySelector("#mensagemPrimeiroAcesso"),
  btnEntrar: document.querySelector("#btnEntrar"),
  btnDefinirSenha: document.querySelector("#btnDefinirSenha"),
  appProtegido: document.querySelector("#appProtegido"),
  rodapeProtegido: document.querySelector("#rodapeProtegido"),
  usuarioLogado: document.querySelector("#usuarioLogado"),
  btnSair: document.querySelector("#btnSair"),

  corpoTabela: document.querySelector("#corpoTabela"),
  estadoVazio: document.querySelector("#estadoVazio"),
  statusTabela: document.querySelector("#statusTabela"),
  ultimaAtualizacao: document.querySelector("#ultimaAtualizacao"),

  busca: document.querySelector("#busca"),
  filtrosColuna: [...document.querySelectorAll(".filtro-coluna")],

  btnLimpar: document.querySelector("#btnLimpar"),
  btnAtualizar: document.querySelector("#btnAtualizar"),

  totalRegistros: document.querySelector("#totalRegistros"),

  modalObservacao: document.querySelector("#modalObservacao"),
  formObservacao: document.querySelector("#formObservacao"),
  tituloModalObservacao: document.querySelector("#tituloModalObservacao"),
  alunoModalObservacao: document.querySelector("#alunoModalObservacao"),
  statusFluxoObservacao: document.querySelector("#statusFluxoObservacao"),
  blocoSolicitacao: document.querySelector("#blocoSolicitacao"),
  blocoResposta: document.querySelector("#blocoResposta"),
  textoSolicitacao: document.querySelector("#textoSolicitacao"),
  textoResposta: document.querySelector("#textoResposta"),
  contadorSolicitacao: document.querySelector("#contadorSolicitacao"),
  contadorResposta: document.querySelector("#contadorResposta"),
  metaSolicitacao: document.querySelector("#metaSolicitacao"),
  metaResposta: document.querySelector("#metaResposta"),
  instrucaoFluxoObservacao: document.querySelector("#instrucaoFluxoObservacao"),
  resumoFluxoObservacao: document.querySelector("#resumoFluxoObservacao"),
  btnFecharModalObservacao: document.querySelector("#btnFecharModalObservacao"),
  btnCancelarObservacao: document.querySelector("#btnCancelarObservacao"),
  btnSalvarObservacao: document.querySelector("#btnSalvarObservacao")
};

function normalizarTexto(valor) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizarUsuario(valor) {
  return normalizarTexto(valor)
    .replace(/^@+/, "")
    .replace(/\s+/g, "");
}

function criarEmailInterno(usuario) {
  const usuarioNormalizado = normalizarUsuario(usuario);

  if (!/^[a-z0-9._-]{2,40}$/.test(usuarioNormalizado)) {
    throw new Error(
      "Use apenas letras, números, ponto, traço ou sublinhado no usuário."
    );
  }

  return `${usuarioNormalizado}@${CONFIG.DOMINIO_LOGIN}`;
}

function obterNomeUsuario(email) {
  return String(email ?? "").split("@")[0] || "usuário";
}

function usuarioPodeEditar() {
  return state.perfilUsuario === "editor";
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

  return String(valor ?? "").trim().toUpperCase();
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

function calcularHash(texto, semente) {
  let hash = semente >>> 0;

  for (let indice = 0; indice < texto.length; indice += 1) {
    hash ^= texto.charCodeAt(indice);
    hash = Math.imul(hash, 16777619) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}

function criarIdFirebase(registro) {
  const chave = criarChaveRegistro(registro);
  return `r_${calcularHash(chave, 2166136261)}_${calcularHash(chave, 3339675911)}`;
}

function obterBaixaBoleto(registro) {
  const id = criarIdFirebase(registro);
  return state.baixasBoleto[id]?.status === "OK" ? "OK" : "PENDENTE";
}

function obterFluxoObservacaoPorId(id) {
  const dados = state.baixasBoleto[id] || {};
  const baixaBoleto = dados.status === "OK" ? "OK" : "PENDENTE";
  const solicitacao = String(
    dados.solicitacao ?? dados.observacao ?? ""
  ).trim();
  const respostaComercial = String(dados.respostaComercial ?? "").trim();
  const statusSalvo = String(dados.observacaoStatus ?? "").toUpperCase();

  let status = statusSalvo;

  if (baixaBoleto === "OK") {
    status = "CONCLUIDO";
  } else if (status === "CONCLUIDO" || !["SOLICITADO", "AJUSTADO"].includes(status)) {
    status = respostaComercial
      ? "AJUSTADO"
      : solicitacao
        ? "SOLICITADO"
        : "";
  }

  return {
    status,
    baixaBoleto,
    solicitacao,
    respostaComercial,
    solicitadoPor: String(dados.solicitadoPor ?? dados.observacaoAtualizadaPor ?? ""),
    solicitadoEm: dados.solicitadoEm ?? dados.observacaoAtualizadaEm ?? null,
    ajustadoPor: String(dados.ajustadoPor ?? ""),
    ajustadoEm: dados.ajustadoEm ?? null,
    concluidoPor: String(dados.concluidoPor ?? dados.atualizadoPor ?? ""),
    concluidoEm: dados.concluidoEm ?? dados.atualizadoEm ?? null
  };
}

function obterFluxoObservacao(registro) {
  return obterFluxoObservacaoPorId(criarIdFirebase(registro));
}

function obterRotuloFluxo(status) {
  const rotulos = {
    SOLICITADO: "Ajuste solicitado",
    AJUSTADO: "Ajustado",
    CONCLUIDO: "OK"
  };

  return rotulos[status] || "Sem solicitação";
}

function obterObservacao(registro) {
  const fluxo = obterFluxoObservacao(registro);

  return [
    obterRotuloFluxo(fluxo.status),
    fluxo.solicitacao,
    fluxo.respostaComercial
  ]
    .filter(Boolean)
    .join(" ");
}

function formatarDataHoraFirebase(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero <= 0) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(numero));
}

function montarMetaFluxo(prefixo, usuario, data) {
  const partes = [];

  if (usuario) {
    partes.push(`${prefixo} por ${obterNomeUsuario(usuario)}`);
  }

  const dataFormatada = formatarDataHoraFirebase(data);

  if (dataFormatada) {
    partes.push(dataFormatada);
  }

  return partes.join(" • ");
}

function atualizarEstadoLocalBaixa(id, alteracoes) {
  state.baixasBoleto[id] = {
    ...(state.baixasBoleto[id] || {}),
    ...alteracoes
  };
}

async function salvarBaixaBoleto(id, status) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Sua sessão terminou. Entre novamente para alterar.");
  }

  if (!usuarioPodeEditar()) {
    throw new Error("Este acesso é somente para visualização.");
  }

  const fluxoAtual = obterFluxoObservacaoPorId(id);
  const concluido = status === "OK";
  const statusAoReabrir = fluxoAtual.respostaComercial
    ? "AJUSTADO"
    : fluxoAtual.solicitacao
      ? "SOLICITADO"
      : null;

  const alteracoes = {
    status,
    atualizadoEm: serverTimestamp(),
    atualizadoPor: usuario.email,
    observacaoStatus: concluido ? "CONCLUIDO" : statusAoReabrir,
    concluidoEm: concluido ? serverTimestamp() : null,
    concluidoPor: concluido ? usuario.email : null
  };

  await update(ref(database, `baixasBoleto/${id}`), alteracoes);

  atualizarEstadoLocalBaixa(id, {
    ...alteracoes,
    atualizadoEm: Date.now(),
    concluidoEm: concluido ? Date.now() : null
  });
}

async function salvarSolicitacaoAjuste(id, texto) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Sua sessão terminou. Entre novamente para alterar.");
  }

  if (!usuarioPodeEditar()) {
    throw new Error("Este acesso é somente para visualização.");
  }

  const solicitacao = String(texto ?? "").trim();

  if (!solicitacao) {
    throw new Error("Descreva o que precisa ser ajustado.");
  }

  const alteracoes = {
    status: "PENDENTE",
    atualizadoEm: serverTimestamp(),
    atualizadoPor: usuario.email,
    observacao: solicitacao,
    solicitacao,
    observacaoStatus: "SOLICITADO",
    solicitadoEm: serverTimestamp(),
    solicitadoPor: usuario.email,
    respostaComercial: null,
    ajustadoEm: null,
    ajustadoPor: null,
    concluidoEm: null,
    concluidoPor: null
  };

  await update(ref(database, `baixasBoleto/${id}`), alteracoes);

  atualizarEstadoLocalBaixa(id, {
    ...alteracoes,
    solicitadoEm: Date.now()
  });
}

async function marcarAjusteRealizado(id, resposta) {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error("Sua sessão terminou. Entre novamente para alterar.");
  }

  if (!usuarioPodeEditar()) {
    throw new Error("Este acesso é somente para visualização.");
  }

  const fluxo = obterFluxoObservacaoPorId(id);

  if (!fluxo.solicitacao) {
    throw new Error("Não existe uma solicitação de ajuste para este registro.");
  }

  const respostaComercial = String(resposta ?? "").trim();
  const alteracoes = {
    status: "PENDENTE",
    atualizadoEm: serverTimestamp(),
    atualizadoPor: usuario.email,
    observacaoStatus: "AJUSTADO",
    respostaComercial,
    ajustadoEm: serverTimestamp(),
    ajustadoPor: usuario.email,
    concluidoEm: null,
    concluidoPor: null
  };

  await update(ref(database, `baixasBoleto/${id}`), alteracoes);

  atualizarEstadoLocalBaixa(id, {
    ...alteracoes,
    ajustadoEm: Date.now()
  });
}

function atualizarContadoresObservacao() {
  dom.contadorSolicitacao.textContent = `${dom.textoSolicitacao.value.length}/240`;
  dom.contadorResposta.textContent = `${dom.textoResposta.value.length}/240`;
}

function definirStatusVisualObservacao(status) {
  dom.statusFluxoObservacao.className = "observacao-status";

  const classe = {
    SOLICITADO: "observacao-status-solicitado",
    AJUSTADO: "observacao-status-ajustado",
    CONCLUIDO: "observacao-status-concluido"
  }[status] || "observacao-status-neutro";

  dom.statusFluxoObservacao.classList.add(classe);
  dom.statusFluxoObservacao.textContent = obterRotuloFluxo(status);
}

function abrirModalObservacao(chave, aluno) {
  if (!chave) {
    return;
  }

  const fluxo = obterFluxoObservacaoPorId(chave);
  const podeEditar = usuarioPodeEditar();
  const podeSolicitar = podeEditar && !fluxo.status && fluxo.baixaBoleto !== "OK";
  const podeMarcarAjustado =
    podeEditar && fluxo.status === "SOLICITADO" && fluxo.baixaBoleto !== "OK";

  state.observacaoModalChave = chave;
  state.observacaoModalEtapa = podeSolicitar
    ? "SOLICITAR"
    : podeMarcarAjustado
      ? "AJUSTAR"
      : "VISUALIZAR";

  dom.tituloModalObservacao.textContent = {
    SOLICITADO: "Solicitação de ajuste",
    AJUSTADO: "Ajuste realizado",
    CONCLUIDO: "Solicitação concluída"
  }[fluxo.status] || "Nova solicitação de ajuste";
  dom.alunoModalObservacao.textContent = aluno || "Registro selecionado";
  definirStatusVisualObservacao(fluxo.status);

  dom.textoSolicitacao.value = fluxo.solicitacao;
  dom.textoResposta.value = fluxo.respostaComercial;
  dom.textoSolicitacao.readOnly = !podeSolicitar;
  dom.textoResposta.readOnly = !podeMarcarAjustado;
  dom.blocoSolicitacao.hidden =
    fluxo.status === "CONCLUIDO" && !fluxo.solicitacao;
  dom.blocoResposta.hidden = !fluxo.solicitacao && !podeMarcarAjustado;

  dom.metaSolicitacao.textContent = montarMetaFluxo(
    "Solicitado",
    fluxo.solicitadoPor,
    fluxo.solicitadoEm
  );
  dom.metaResposta.textContent = montarMetaFluxo(
    "Ajustado",
    fluxo.ajustadoPor,
    fluxo.ajustadoEm
  );

  if (podeSolicitar) {
    dom.instrucaoFluxoObservacao.textContent =
      "Descreva o ajuste necessário. O botão da tabela mudará para “Ajuste solicitado”.";
    dom.resumoFluxoObservacao.textContent =
      "Depois, o comercial poderá marcar como ajustado.";
    dom.btnSalvarObservacao.textContent = "Solicitar ajuste";
  } else if (podeMarcarAjustado) {
    dom.instrucaoFluxoObservacao.textContent =
      "Confira a solicitação, realize a correção e informe abaixo o que foi ajustado.";
    dom.resumoFluxoObservacao.textContent =
      "A confirmação final será feita pela coluna Baixa Boleto.";
    dom.btnSalvarObservacao.textContent = "Marcar como ajustado";
  } else if (fluxo.status === "AJUSTADO") {
    dom.instrucaoFluxoObservacao.textContent =
      "O ajuste foi realizado. Para concluir, altere a coluna Baixa Boleto para OK.";
    dom.resumoFluxoObservacao.textContent = "Aguardando confirmação da baixa.";
  } else if (fluxo.status === "CONCLUIDO") {
    dom.instrucaoFluxoObservacao.textContent =
      "Fluxo concluído automaticamente pela Baixa Boleto em OK.";
    dom.resumoFluxoObservacao.textContent = montarMetaFluxo(
      "Concluído",
      fluxo.concluidoPor,
      fluxo.concluidoEm
    ) || "Concluído";
  } else {
    dom.instrucaoFluxoObservacao.textContent =
      "Este acesso permite apenas visualizar a solicitação.";
    dom.resumoFluxoObservacao.textContent = "Somente visualização.";
  }

  dom.btnSalvarObservacao.hidden = !podeSolicitar && !podeMarcarAjustado;
  dom.btnCancelarObservacao.textContent =
    podeSolicitar || podeMarcarAjustado ? "Cancelar" : "Fechar";
  dom.modalObservacao.hidden = false;
  document.body.classList.add("modal-aberto");
  atualizarContadoresObservacao();

  window.requestAnimationFrame(() => {
    const campoFoco = podeSolicitar
      ? dom.textoSolicitacao
      : podeMarcarAjustado
        ? dom.textoResposta
        : dom.btnFecharModalObservacao;

    campoFoco.focus();

    if (campoFoco instanceof HTMLTextAreaElement && !campoFoco.readOnly) {
      campoFoco.setSelectionRange(campoFoco.value.length, campoFoco.value.length);
    }
  });
}

function fecharModalObservacao() {
  dom.modalObservacao.hidden = true;
  document.body.classList.remove("modal-aberto");
  state.observacaoModalChave = null;
  state.observacaoModalEtapa = null;
  dom.formObservacao.reset();
  atualizarContadoresObservacao();
}

async function processarObservacao(evento) {
  evento.preventDefault();

  if (!usuarioPodeEditar()) {
    return;
  }

  const chave = state.observacaoModalChave;
  const etapa = state.observacaoModalEtapa;

  if (!chave || !["SOLICITAR", "AJUSTAR"].includes(etapa)) {
    return;
  }

  dom.btnSalvarObservacao.disabled = true;
  const textoOriginal = dom.btnSalvarObservacao.textContent;
  dom.btnSalvarObservacao.textContent = "Salvando...";

  try {
    if (etapa === "SOLICITAR") {
      await salvarSolicitacaoAjuste(chave, dom.textoSolicitacao.value);
    } else {
      await marcarAjusteRealizado(chave, dom.textoResposta.value);
    }

    aplicarFiltros();
    fecharModalObservacao();
  } catch (erro) {
    console.error(erro);
    alert(traduzirErroFirebase(erro));
  } finally {
    dom.btnSalvarObservacao.disabled = false;
    dom.btnSalvarObservacao.textContent = textoOriginal;
  }
}

function criarLinha(registro) {
  const temPendencia = registro.pendenciaR2 !== "NÃO";
  const textoPendencia = temPendencia
    ? escaparHTML(registro.pendenciaR2 || "PENDENTE")
    : "OK";

  const chaveBaixa = criarIdFirebase(registro);
  const statusBaixa = obterBaixaBoleto(registro);
  const fluxoObservacao = obterFluxoObservacaoPorId(chaveBaixa);
  const observacao = obterObservacao(registro);
  const podeEditar = usuarioPodeEditar();
  const classeObservacao = {
    SOLICITADO: "observacao-botao-solicitado",
    AJUSTADO: "observacao-botao-ajustado",
    CONCLUIDO: "observacao-botao-concluido"
  }[fluxoObservacao.status] || "observacao-botao-neutro";
  const rotuloObservacao = obterRotuloFluxo(fluxoObservacao.status);

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
          ${podeEditar ? "" : "disabled"}
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
      <td class="celula-observacao">
        <button
          class="observacao-botao ${classeObservacao}"
          type="button"
          data-chave="${escaparHTML(chaveBaixa)}"
          data-aluno="${escaparHTML(registro.aluno)}"
          title="${escaparHTML(observacao || rotuloObservacao)}"
          aria-label="${escaparHTML(rotuloObservacao)} de ${escaparHTML(registro.aluno)}"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
            <path d="M5 4.75h14a1.25 1.25 0 0 1 1.25 1.25v9A1.25 1.25 0 0 1 19 16.25H9l-4.25 3v-13A1.25 1.25 0 0 1 5 4.75Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
            <path d="M8 9h8M8 12h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
          </svg>
          <span>${escaparHTML(rotuloObservacao)}</span>
        </button>
      </td>
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

function preencherSelectFiltro(select, valores) {
  const valorAtual = select.value;
  const textoOpcaoInicial = select.options[0]?.textContent || "Todos";

  select.innerHTML = "";

  const opcaoInicial = document.createElement("option");
  opcaoInicial.value = "";
  opcaoInicial.textContent = textoOpcaoInicial;
  select.appendChild(opcaoInicial);

  [...new Set(valores.filter((valor) => String(valor ?? "").trim() !== ""))]
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

function obterValorCampo(registro, campo) {
  if (campo === "baixaBoleto") {
    return obterBaixaBoleto(registro);
  }

  if (campo === "observacao") {
    return obterObservacao(registro);
  }

  return registro[campo] ?? "";
}

function atualizarFiltrosColuna() {
  dom.filtrosColuna.forEach((filtro) => {
    if (filtro.tagName !== "SELECT" || filtro.dataset.campo === "baixaBoleto") {
      return;
    }

    const campo = filtro.dataset.campo;
    const valores = state.dados.map((item) => obterValorCampo(item, campo));

    preencherSelectFiltro(filtro, valores);
  });
}

function aplicarFiltros() {
  const termo = normalizarTexto(dom.busca.value);
  const filtrosAtivos = dom.filtrosColuna.filter(
    (filtro) => String(filtro.value ?? "").trim() !== ""
  );

  state.filtrados = state.dados.filter((item) => {
    const baixaBoleto = obterBaixaBoleto(item);
    const observacao = obterObservacao(item);
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
        baixaBoleto,
        item.modalidade,
        observacao
      ].join(" ")
    );

    const correspondeColunas = filtrosAtivos.every((filtro) => {
      const campo = filtro.dataset.campo;
      const valorRegistro = normalizarTexto(obterValorCampo(item, campo));
      const valorFiltro = normalizarTexto(filtro.value);

      return filtro.tagName === "SELECT"
        ? valorRegistro === valorFiltro
        : valorRegistro.includes(valorFiltro);
    });

    return (
      (!termo || textoCompleto.includes(termo)) &&
      correspondeColunas
    );
  });

  renderizarTabela();
}

function limparFiltros() {
  dom.busca.value = "";
  dom.filtrosColuna.forEach((filtro) => {
    filtro.value = "";
  });

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
  if (state.carregando || !auth.currentUser || state.primeiroAcessoPendente) {
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

    atualizarFiltrosColuna();
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

    dom.statusTabela.textContent = `Erro ao carregar: ${erro.message}`;
    dom.ultimaAtualizacao.textContent =
      "Verifique a implantação do Apps Script";
  } finally {
    state.carregando = false;
    dom.btnAtualizar.disabled = false;
  }
}

function atualizarAlturaTopoFixo() {
  const painelFixo = document.querySelector(".painel-fixo");

  if (!painelFixo || dom.appProtegido.hidden) {
    return;
  }

  const altura = Math.ceil(painelFixo.getBoundingClientRect().height);

  document.documentElement.style.setProperty(
    "--topo-fixo-altura",
    `${altura}px`
  );
}

function definirMensagem(elemento, mensagem = "", tipo = "erro") {
  elemento.hidden = !mensagem;
  elemento.textContent = mensagem;
  elemento.classList.toggle("mensagem-sucesso", tipo === "sucesso");
}

function definirBotaoCarregando(botao, carregando, textoCarregando) {
  if (!botao.dataset.textoOriginal) {
    botao.dataset.textoOriginal = botao.textContent.trim();
  }

  botao.disabled = carregando;
  botao.textContent = carregando
    ? textoCarregando
    : botao.dataset.textoOriginal;
}

function traduzirErroFirebase(erro) {
  const mensagens = {
    "auth/invalid-credential": "Usuário ou senha incorretos.",
    "auth/invalid-email": "O usuário informado é inválido.",
    "auth/user-disabled": "Este usuário foi desativado.",
    "auth/too-many-requests":
      "Muitas tentativas. Aguarde um pouco e tente novamente.",
    "auth/network-request-failed":
      "Falha de conexão. Verifique sua internet e tente novamente.",
    "auth/weak-password": "A nova senha precisa ser mais forte.",
    "auth/requires-recent-login":
      "Entre novamente antes de alterar a senha."
  };

  return mensagens[erro?.code] || erro?.message || "Não foi possível concluir.";
}

function mostrarTelaLogin() {
  document.body.classList.add("aguardando-autenticacao");
  dom.telaLogin.hidden = false;
  dom.formLogin.hidden = false;
  dom.formPrimeiroAcesso.hidden = true;
  dom.appProtegido.hidden = true;
  dom.rodapeProtegido.hidden = true;
  dom.loginSenha.value = "";
  definirMensagem(dom.mensagemLogin);
  definirMensagem(dom.mensagemPrimeiroAcesso);

  window.setTimeout(() => dom.loginUsuario.focus(), 50);
}

function mostrarPrimeiroAcesso() {
  document.body.classList.add("aguardando-autenticacao");
  dom.telaLogin.hidden = false;
  dom.formLogin.hidden = true;
  dom.formPrimeiroAcesso.hidden = false;
  dom.appProtegido.hidden = true;
  dom.rodapeProtegido.hidden = true;
  dom.novaSenha.value = "";
  dom.confirmarNovaSenha.value = "";
  definirMensagem(dom.mensagemPrimeiroAcesso);

  window.setTimeout(() => dom.novaSenha.focus(), 50);
}

function abrirPainel(usuario) {
  state.primeiroAcessoPendente = false;
  document.body.classList.remove("aguardando-autenticacao");
  document.body.classList.toggle("modo-visualizacao", !usuarioPodeEditar());
  dom.telaLogin.hidden = true;
  dom.formLogin.hidden = false;
  dom.formPrimeiroAcesso.hidden = true;
  dom.appProtegido.hidden = false;
  dom.rodapeProtegido.hidden = false;
  dom.usuarioLogado.textContent = usuarioPodeEditar()
    ? `@${obterNomeUsuario(usuario.email)}`
    : `@${obterNomeUsuario(usuario.email)} · Visualização`;

  iniciarListenerBaixas();
  inicializarPainel();

  window.setTimeout(atualizarAlturaTopoFixo, 50);
  window.setTimeout(atualizarAlturaTopoFixo, 300);
}

function encerrarPainel() {
  if (typeof state.cancelarListenerBaixas === "function") {
    state.cancelarListenerBaixas();
  }

  state.cancelarListenerBaixas = null;
  state.baixasBoleto = {};
  state.usuarioFirebase = null;
  state.primeiroAcessoPendente = false;
  state.perfilUsuario = "editor";
  document.body.classList.remove("modo-visualizacao");

  if (state.intervaloAtualizacao) {
    window.clearInterval(state.intervaloAtualizacao);
    state.intervaloAtualizacao = null;
  }
}

async function obterCadastroUsuario(usuario) {
  const snapshot = await get(ref(database, `usuarios/${usuario.uid}`));
  return snapshot.val() || {};
}

function iniciarListenerBaixas() {
  if (typeof state.cancelarListenerBaixas === "function") {
    state.cancelarListenerBaixas();
  }

  state.cancelarListenerBaixas = onValue(
    ref(database, "baixasBoleto"),
    (snapshot) => {
      state.baixasBoleto = snapshot.val() || {};

      if (state.dados.length > 0) {
        aplicarFiltros();
      }
    },
    (erro) => {
      console.error("Erro ao sincronizar baixas:", erro);
      dom.statusTabela.textContent =
        "Não foi possível sincronizar a baixa dos boletos.";
    }
  );
}

async function processarLogin(evento) {
  evento.preventDefault();
  definirMensagem(dom.mensagemLogin);

  try {
    const email = criarEmailInterno(dom.loginUsuario.value);
    const senha = dom.loginSenha.value;

    if (!senha) {
      throw new Error("Digite sua senha ou código de primeiro acesso.");
    }

    definirBotaoCarregando(dom.btnEntrar, true, "Entrando...");
    await signInWithEmailAndPassword(auth, email, senha);
  } catch (erro) {
    console.error(erro);
    definirMensagem(dom.mensagemLogin, traduzirErroFirebase(erro));
  } finally {
    definirBotaoCarregando(dom.btnEntrar, false, "Entrando...");
  }
}

async function processarPrimeiroAcesso(evento) {
  evento.preventDefault();
  definirMensagem(dom.mensagemPrimeiroAcesso);

  const usuario = auth.currentUser;
  const novaSenha = dom.novaSenha.value;
  const confirmarSenha = dom.confirmarNovaSenha.value;

  if (!usuario) {
    mostrarTelaLogin();
    return;
  }

  if (novaSenha.length < 8) {
    definirMensagem(
      dom.mensagemPrimeiroAcesso,
      "A senha precisa ter pelo menos 8 caracteres."
    );
    return;
  }

  if (novaSenha !== confirmarSenha) {
    definirMensagem(
      dom.mensagemPrimeiroAcesso,
      "As senhas digitadas não são iguais."
    );
    return;
  }

  try {
    definirBotaoCarregando(
      dom.btnDefinirSenha,
      true,
      "Salvando senha..."
    );

    await updatePassword(usuario, novaSenha);
    await update(ref(database, `usuarios/${usuario.uid}`), {
      usuario: obterNomeUsuario(usuario.email),
      email: usuario.email,
      senhaDefinida: true,
      atualizadoEm: serverTimestamp()
    });

    abrirPainel(usuario);
  } catch (erro) {
    console.error(erro);
    definirMensagem(
      dom.mensagemPrimeiroAcesso,
      traduzirErroFirebase(erro)
    );
  } finally {
    definirBotaoCarregando(
      dom.btnDefinirSenha,
      false,
      "Salvando senha..."
    );
  }
}

async function sairDoPainel() {
  dom.btnSair.disabled = true;

  try {
    await signOut(auth);
  } catch (erro) {
    console.error(erro);
    alert("Não foi possível sair. Tente novamente.");
  } finally {
    dom.btnSair.disabled = false;
  }
}

function configurarEventosPainel() {
  dom.busca.addEventListener("input", aplicarFiltros);
  dom.filtrosColuna.forEach((filtro) => {
    filtro.addEventListener(
      filtro.tagName === "SELECT" ? "change" : "input",
      aplicarFiltros
    );
  });

  dom.btnLimpar.addEventListener("click", limparFiltros);
  dom.btnAtualizar.addEventListener("click", carregarDados);
  dom.btnSair.addEventListener("click", sairDoPainel);

  dom.corpoTabela.addEventListener("change", async (evento) => {
    const select = evento.target.closest(".baixa-select");

    if (!select || !usuarioPodeEditar()) {
      return;
    }

    const chave = select.dataset.chave;
    const novoStatus = select.value;

    if (!chave || !novoStatus) {
      return;
    }

    const statusAnterior =
      state.baixasBoleto[chave]?.status === "OK" ? "OK" : "PENDENTE";

    select.disabled = true;

    try {
      await salvarBaixaBoleto(chave, novoStatus);

      select.classList.toggle("baixa-select-ok", novoStatus === "OK");
      select.classList.toggle(
        "baixa-select-pendente",
        novoStatus !== "OK"
      );
      aplicarFiltros();
    } catch (erro) {
      console.error(erro);
      select.value = statusAnterior;
      alert(traduzirErroFirebase(erro));
    } finally {
      select.disabled = !usuarioPodeEditar();
    }
  });

  dom.corpoTabela.addEventListener("click", (evento) => {
    const botaoObservacao = evento.target.closest(".observacao-botao");

    if (!botaoObservacao) {
      return;
    }

    abrirModalObservacao(
      botaoObservacao.dataset.chave,
      botaoObservacao.dataset.aluno
    );
  });

  dom.formObservacao.addEventListener("submit", processarObservacao);
  dom.textoSolicitacao.addEventListener("input", atualizarContadoresObservacao);
  dom.textoResposta.addEventListener("input", atualizarContadoresObservacao);
  dom.btnFecharModalObservacao.addEventListener("click", fecharModalObservacao);
  dom.btnCancelarObservacao.addEventListener("click", fecharModalObservacao);
  dom.modalObservacao.addEventListener("click", (evento) => {
    if (evento.target.matches("[data-fechar-modal]")) {
      fecharModalObservacao();
    }
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && !dom.modalObservacao.hidden) {
      fecharModalObservacao();
    }
  });

  window.addEventListener("resize", atualizarAlturaTopoFixo);

  const painelFixo = document.querySelector(".painel-fixo");

  if (painelFixo && "ResizeObserver" in window) {
    const observerTopo = new ResizeObserver(atualizarAlturaTopoFixo);
    observerTopo.observe(painelFixo);
  }
}

function inicializarPainel() {
  if (!state.painelInicializado) {
    configurarEventosPainel();
    state.painelInicializado = true;
  }

  if (!state.intervaloAtualizacao) {
    state.intervaloAtualizacao = window.setInterval(
      carregarDados,
      CONFIG.AUTO_REFRESH_MS
    );
  }

  carregarDados();
}

async function configurarAutenticacao() {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (erro) {
    console.error("Não foi possível persistir a sessão:", erro);
  }

  dom.formLogin.addEventListener("submit", processarLogin);
  dom.formPrimeiroAcesso.addEventListener(
    "submit",
    processarPrimeiroAcesso
  );

  onAuthStateChanged(auth, async (usuario) => {
    if (!usuario) {
      encerrarPainel();
      mostrarTelaLogin();
      return;
    }

    state.usuarioFirebase = usuario;

    try {
      const cadastro = await obterCadastroUsuario(usuario);
      state.perfilUsuario =
        cadastro?.perfil === "visualizacao" ? "visualizacao" : "editor";

      const primeiroAcesso = cadastro?.senhaDefinida !== true;
      state.primeiroAcessoPendente = primeiroAcesso;

      if (primeiroAcesso) {
        mostrarPrimeiroAcesso();
        return;
      }

      abrirPainel(usuario);
    } catch (erro) {
      console.error(erro);
      definirMensagem(
        dom.mensagemLogin,
        "Não foi possível validar o acesso no banco de dados."
      );
      await signOut(auth);
    }
  });
}

configurarAutenticacao();
