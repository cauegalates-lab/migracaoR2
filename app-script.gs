var CONFIG_R2 = {
  ABA: "Vendas",
  LINHA_INICIAL: 2,

  // Painel R2 lê de B até M
  PRIMEIRA_COLUNA: 2,
  TOTAL_COLUNAS: 12,

  // Coluna M dentro do intervalo B:M
  INDICE_COLUNA_FILTRO: 11,

  // Valores aceitos na coluna M
  VALORES_FILTRO: [
    "R2 2026",
    "DIPLOMADO-R2"
  ],


  CACHE_SEGUNDOS: 30
};


var CONFIG_EQUIPES = {
  ABA: "Vendas",
  LINHA_INICIAL: 2,
  FUSO_HORARIO: "America/Sao_Paulo",

  // Data da venda separada nas colunas B, C e D.
  COLUNA_DIA: 2,          // B
  COLUNA_MES: 3,          // C
  COLUNA_ANO: 4,          // D

  // O painel identifica o vendedor na coluna E
  // e soma o faturamento correspondente da coluna T.
  COLUNA_VENDEDOR: 5,     // E
  COLUNA_VALOR_TOTAL: 20, // T

  // Segunda a sábado. Domingo não entra nem na semana nem no mês.
  IGNORAR_DOMINGO: true,
  CACHE_SEGUNDOS: 30
};


var CONFIG_CRESCIMENTO = {
  LINHA_INICIAL: 4,
  FUSO_HORARIO: "America/Sao_Paulo",
  CACHE_SEGUNDOS: 15,

  MESES: {
    6: {
      nome: "Junho",
      aba: "Junho",
      colunaData: 18,  // R
      colunaValor: 24  // X
    },

    7: {
      nome: "Julho",
      aba: "Julho",
      colunaData: 31,  // AE
      colunaValor: 37  // AK
    }
  }
};


var CONFIG_META_MILHAO = {
  ABA: "Julho",
  CELULA_FATURADO: "AK35",
  CACHE_SEGUNDOS: 30,
  FUSO_HORARIO: "America/Sao_Paulo"
};


/**
 * METAS SEMANAIS DAS EQUIPES
 *
 * Edite somente os valores abaixo quando quiser alterar as metas.
 * No botão MÊS, a meta mensal é a soma das cinco semanas.
 * Opcional: você pode adicionar `mes: 150000` em uma equipe para
 * substituir a soma automática por uma meta mensal fixa.
 */
var CONFIG_METAS_EQUIPES = {
   predadores: {
    semana1: 36900,
    semana2: 36900,
    semana3: 36900,
    semana4: 31900,
    semana5: 50000

  },

  invictus: {
    semana1: 32675,
    semana2: 32675,
    semana3: 32675,
    semana4: 26900,
    semana5: 50000
  },

  evolution: {
    semana1: 33450,
    semana2: 33450,
    semana3: 33450,
    semana4: 28450,
    semana5: 50000
  },

  vip: {
    semana1: 38450,
    semana2: 38450,
    semana3: 34225,
    semana4: 32675,
    semana5: 50000
  },

  winx: {
    semana1: 29225,
    semana2: 29225,
    semana3: 33450,
    semana4: 28450,
    semana5: 50000
  },

  alfas: {
    semana1: 36900,
    semana2: 36900,
    semana3: 36900,
    semana4: 31900,
    semana5: 50000
  },

  goat: {
    semana1: 32675,
    semana2: 32675,
    semana3: 32675,
    semana4: 28450,
    semana5: 50000
  }
};


/**
 * MEMBROS DAS EQUIPES
 *
 * O Apps Script usa esta configuração para calcular o realizado de cada baia.
 * Na primeira semana, usa `semana1`. Nas demais semanas e no mês, usa `padrao`.
 */
var CONFIG_MEMBROS_EQUIPES = {
  predadores: {
    padrao: [
      "Gabriel Gorgonio",
      "Maria Laura",
      "Raíssa Fontoura",
      "Rodolfo Henrique"
    ],
    semana1: [
      "Camilly Longhi",
      "Paola Fernandes",
      "Jane menezes"
    ]
  },

  invictus: {
    padrao: [
      "Letícia Vieira",
      "Vinicius Ribeiro",
      "Chrystian",
      "Melissa Ferreira"
    ],
    semana1: [
      "Letícia Goretti",
      "Ana Kelly",
      "Ana Luiza",
      "Leticia Pereira"
    ]
  },

  evolution: {
    padrao: [
      "Giseli de Jesus",
      "Ana Kelly",
      "Leticia Pereira",
      "Carliane",
    ],
    semana1: [
      "Cauê Galates",
      "Lara Baptista",
      "Daniela Moura",
      "Letícia Vieira"
    ]
  },

  vip: {
    padrao: [
      "Cauê Galates",
      "Daniela Moura",
      "Gabrielle Carvalho",
      "Kevin Cristovão"
    ],
    semana1: [
      "Maria Laura",
      "Gabriel Gorgonio",
      "Raíssa Fontoura",
      "Rodolfo Henrique"
    ]
  },

  winx: {
    padrao: [
      "Alana Santos",
      "Camilly Longhi",
      "Jane menezes",
      "Paola Fernandes"
    ],
    semana1: [
      "Vinicius Ribeiro",
      "Gabrielle Carvalho",
      "Melissa Ferreira",
      "Kevin Cristovão"
    ]
  },

  alfas: {
    padrao: [
      "Nathália",
      "Fabiana Godoy",
      "Bruna Moraes",
      "Gabrielle Andrade"
    ],
    semana1: [
      "Fabiana Godoy",
      "Bruna Moraes",
      "Nathália",
      "Gabrielle Andrade"
    ]
  },

  goat: {
    padrao: [
      "Beatriz Cunha",
      "Lara Baptista",
      "Lucas Eduardo",
      "Estephany"
    ],
    semana1: [
      "Beatriz Cunha",
      "Lucas Eduardo",
      "Alana Santos",
      "Eduardo Rogério"
    ]
  }
};



/**
 * Único doGet do projeto.
 *
 * Painel R2:
 * URL normal do Apps Script
 *
 * Painel das equipes:
 * ?rota=equipes&visao=semana&semana=1
 * ?rota=equipes&visao=mes
 *
 * Painel de crescimento:
 * ?rota=crescimento&mesBase=6&anoBase=2026&mesAtual=7&anoAtual=2026
 *
 * Painel da meta de 1 milhão:
 * ?rota=metaMilhao
 */
function doGet(e) {
  e = e || {};
  e.parameter = e.parameter || {};

  var rota = normalizarTexto(
    e.parameter.rota || "r2"
  );

  if (rota === "EQUIPES") {
    return responderEquipes(e);
  }

  if (rota === "CRESCIMENTO") {
    return responderCrescimento(e);
  }

  if (rota === "METAMILHAO") {
    return responderMetaMilhao(e);
  }

  return responderR2(e);
}


/* =========================================================
   PAINEL META DE 1 MILHÃO
========================================================= */

function responderMetaMilhao(e) {
  var callback = e.parameter.callback || "";
  var cache = CacheService.getScriptCache();
  var cacheKey = "painel_meta_milhao";
  var json = cache.get(cacheKey);

  try {
    if (!json) {
      json = JSON.stringify(montarDadosMetaMilhao());

      cache.put(
        cacheKey,
        json,
        CONFIG_META_MILHAO.CACHE_SEGUNDOS
      );
    }
  } catch (erro) {
    json = JSON.stringify({
      sucesso: false,
      painel: "metaMilhao",
      faturado: 0,
      mensagem: erro.message
    });
  }

  return criarResposta(json, callback);
}


function montarDadosMetaMilhao() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();

  if (!planilha) {
    throw new Error(
      "O Apps Script não está vinculado à planilha."
    );
  }

  var aba = planilha.getSheetByName(
    CONFIG_META_MILHAO.ABA
  );

  if (!aba) {
    throw new Error(
      'A aba "' + CONFIG_META_MILHAO.ABA +
      '" não foi encontrada.'
    );
  }

  var intervalo = aba.getRange(
    CONFIG_META_MILHAO.CELULA_FATURADO
  );

  var faturado = converterNumeroEquipes(
    intervalo.getValue()
  );

  if (!faturado) {
    faturado = converterNumeroEquipes(
      intervalo.getDisplayValue()
    );
  }

  return {
    sucesso: true,
    painel: "metaMilhao",
    faturado: faturado,
    origem: CONFIG_META_MILHAO.ABA + "!" +
      CONFIG_META_MILHAO.CELULA_FATURADO,
    atualizadoEm: Utilities.formatDate(
      new Date(),
      CONFIG_META_MILHAO.FUSO_HORARIO,
      "yyyy-MM-dd'T'HH:mm:ss"
    )
  };
}


/* =========================================================
   PAINEL R2
========================================================= */

function responderR2(e) {
  var callback = e.parameter.callback || "";
  var cache = CacheService.getScriptCache();
  var cacheKey = "vendas_r2_2026_e_diplomado_r2";
  var json = cache.get(cacheKey);

  try {
    if (!json) {
      json = JSON.stringify(montarDadosR2());

      cache.put(
        cacheKey,
        json,
        CONFIG_R2.CACHE_SEGUNDOS
      );
    }
  } catch (erro) {
    json = JSON.stringify({
      sucesso: false,
      painel: "r2",
      mensagem: erro.message,
      filtros: CONFIG_R2.VALORES_FILTRO,
      total: 0,
      dados: []
    });
  }

  return criarResposta(json, callback);
}


function montarDadosR2() {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();
  var aba = planilha.getSheetByName(CONFIG_R2.ABA);

  if (!aba) {
    throw new Error(
      'A aba "' + CONFIG_R2.ABA + '" não foi encontrada.'
    );
  }

  var ultimaLinha = aba.getLastRow();

  if (ultimaLinha < CONFIG_R2.LINHA_INICIAL) {
    return {
      sucesso: true,
      painel: "r2",
      filtros: CONFIG_R2.VALORES_FILTRO,
      total: 0,
      dados: [],
      atualizadoEm: new Date().toISOString()
    };
  }

  var quantidadeLinhas =
    ultimaLinha - CONFIG_R2.LINHA_INICIAL + 1;

  var linhas = aba
    .getRange(
      CONFIG_R2.LINHA_INICIAL,
      CONFIG_R2.PRIMEIRA_COLUNA,
      quantidadeLinhas,
      CONFIG_R2.TOTAL_COLUNAS
    )
    .getDisplayValues();

  var filtros = CONFIG_R2.VALORES_FILTRO.map(function(valor) {
    return normalizarTexto(valor);
  });

  var dados = [];

  for (var i = 0; i < linhas.length; i++) {
    var linha = linhas[i];

    var valorFiltro = normalizarTexto(
      linha[CONFIG_R2.INDICE_COLUNA_FILTRO]
    );

    if (filtros.indexOf(valorFiltro) === -1) {
      continue;
    }

    dados.push({
      dia: linha[0],          // B
      mes: linha[1],          // C
      ano: linha[2],          // D
      vendedor: linha[3],     // E
      aluno: linha[4],        // F
      tipoPgto: linha[5],     // G
      taxa: linha[6],         // H
      boleto: linha[7],       // I
      parcelas: linha[8],     // J
      cartao: linha[9],       // K
      pendenciaR2: linha[10], // L
      modalidade: linha[11]   // M
    });
  }

  return {
    sucesso: true,
    painel: "r2",
    filtros: CONFIG_R2.VALORES_FILTRO,
    total: dados.length,
    dados: dados,
    atualizadoEm: new Date().toISOString()
  };
}


/* =========================================================
   PAINEL DAS EQUIPES
========================================================= */

function responderEquipes(e) {
  e = e || {};
  e.parameter = e.parameter || {};

  var callback = e.parameter.callback || "";
  var hoje = new Date();

  // Evita diferença de data entre o servidor do Apps Script e o Brasil.
  var mesAtual = Number(
    Utilities.formatDate(
      hoje,
      CONFIG_EQUIPES.FUSO_HORARIO,
      "M"
    )
  );

  var anoAtual = Number(
    Utilities.formatDate(
      hoje,
      CONFIG_EQUIPES.FUSO_HORARIO,
      "yyyy"
    )
  );

  var mes = converterInteiroEquipes(e.parameter.mes) || mesAtual;
  var ano = converterInteiroEquipes(e.parameter.ano) || anoAtual;

  if (mes < 1 || mes > 12) {
    mes = mesAtual;
  }

  var semana = converterInteiroEquipes(e.parameter.semana) ||
    descobrirSemanaAtual(hoje);

  if (semana < 1 || semana > 5) {
    semana = 1;
  }

  var visao = normalizarTexto(
    e.parameter.visao || "semana"
  );

  if (visao !== "MES") {
    visao = "SEMANA";
  }

  var cache = CacheService.getScriptCache();

  var cacheKey = [
    "painel_equipes_v2",
    visao,
    ano,
    mes,
    semana
  ].join("_");

  var jsonCache = cache.get(cacheKey);
  var dadosResposta;

  try {
    if (jsonCache) {
      dadosResposta = JSON.parse(jsonCache);
    } else {
      dadosResposta = montarDadosEquipes(
        mes,
        ano,
        semana,
        visao
      );

      cache.put(
        cacheKey,
        JSON.stringify(dadosResposta),
        CONFIG_EQUIPES.CACHE_SEGUNDOS
      );
    }

    // Metas e composição das baias são lidas em toda requisição.
    // As vendas podem continuar em cache por alguns segundos.
    dadosResposta.metas = obterMetasEquipes(semana, visao);
    dadosResposta.membrosEquipes = obterMembrosTodasEquipes(
      semana,
      visao
    );
    dadosResposta.equipes = calcularTotaisEquipes(
      dadosResposta.vendedores,
      semana,
      visao
    );
    dadosResposta.totalEquipes = somarTotaisEquipes(
      dadosResposta.equipes
    );
  } catch (erro) {
    dadosResposta = {
      sucesso: false,
      painel: "equipes",
      visao: visao.toLowerCase(),
      mensagem: erro.message,
      vendedores: {},
      vendedoresLista: [],
      membrosEquipes: obterMembrosTodasEquipes(semana, visao),
      equipes: calcularTotaisEquipes({}, semana, visao),
      metas: obterMetasEquipes(semana, visao),
      totalEquipes: 0,
      totalGeral: 0
    };
  }

  return criarResposta(
    JSON.stringify(dadosResposta),
    callback
  );
}


function montarDadosEquipes(mes, ano, semana, visao) {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();

  if (!planilha) {
    throw new Error(
      "O Apps Script não está vinculado à planilha."
    );
  }

  var aba = planilha.getSheetByName(CONFIG_EQUIPES.ABA);

  if (!aba) {
    throw new Error(
      'A aba "' + CONFIG_EQUIPES.ABA + '" não foi encontrada.'
    );
  }

  mes = converterInteiroEquipes(mes);
  ano = converterInteiroEquipes(ano);
  semana = converterInteiroEquipes(semana);
  visao = normalizarTexto(visao || "SEMANA");

  if (mes < 1 || mes > 12 || ano < 2000) {
    throw new Error("Mês ou ano inválido no filtro do painel de times.");
  }

  if (visao !== "MES") {
    visao = "SEMANA";
  }

  var periodo = visao === "MES"
    ? obterPeriodoMes(mes, ano)
    : obterPeriodoSemana(semana, mes, ano);

  var metas = obterMetasEquipes(semana, visao);
  var ultimaLinha = aba.getLastRow();

  if (ultimaLinha < CONFIG_EQUIPES.LINHA_INICIAL) {
    return criarRetornoEquipesVazio(
      mes,
      ano,
      semana,
      visao,
      periodo,
      metas
    );
  }

  var quantidadeLinhas =
    ultimaLinha - CONFIG_EQUIPES.LINHA_INICIAL + 1;

  // Leitura de B:E: dia, mês, ano e vendedor.
  var intervaloPrincipal = aba.getRange(
    CONFIG_EQUIPES.LINHA_INICIAL,
    CONFIG_EQUIPES.COLUNA_DIA,
    quantidadeLinhas,
    CONFIG_EQUIPES.COLUNA_VENDEDOR -
      CONFIG_EQUIPES.COLUNA_DIA + 1
  );

  var dadosPrincipais = intervaloPrincipal.getValues();
  var dadosPrincipaisExibidos = intervaloPrincipal.getDisplayValues();

  // Leitura da coluna T, incluindo o valor bruto e o valor exibido.
  // O valor exibido serve como segurança quando a célula contém "R$".
  var intervaloValores = aba.getRange(
    CONFIG_EQUIPES.LINHA_INICIAL,
    CONFIG_EQUIPES.COLUNA_VALOR_TOTAL,
    quantidadeLinhas,
    1
  );

  var valoresTotais = intervaloValores.getValues();
  var valoresTotaisExibidos = intervaloValores.getDisplayValues();

  var totaisNormalizados = {};
  var nomesOriginais = {};
  var totalGeral = 0;
  var linhasConsideradas = 0;

  for (var i = 0; i < dadosPrincipais.length; i++) {
    var linha = dadosPrincipais[i];
    var linhaExibida = dadosPrincipaisExibidos[i];

    var dataVenda = interpretarDataEquipes(
      linha[0],       // B - dia ou data
      linha[1],       // C - mês
      linha[2],       // D - ano
      linhaExibida[0],
      linhaExibida[1],
      linhaExibida[2]
    );

    var vendedor = String(
      linha[3] || linhaExibida[3] || ""
    ).trim(); // E

    var valorTotalVenda = interpretarValorEquipes(
      valoresTotais[i][0],
      valoresTotaisExibidos[i][0]
    ); // T

    if (!dataVenda || !vendedor) {
      continue;
    }

    if (dataVenda.mes !== mes || dataVenda.ano !== ano) {
      continue;
    }

    if (!dataPertenceAoPeriodoEquipes(dataVenda, periodo)) {
      continue;
    }

    var chaveVendedor = normalizarTexto(vendedor);

    if (!chaveVendedor) {
      continue;
    }

    if (
      !Object.prototype.hasOwnProperty.call(
        totaisNormalizados,
        chaveVendedor
      )
    ) {
      totaisNormalizados[chaveVendedor] = 0;
      nomesOriginais[chaveVendedor] = vendedor;
    }

    totaisNormalizados[chaveVendedor] = arredondarMoedaEquipes(
      totaisNormalizados[chaveVendedor] + valorTotalVenda
    );

    totalGeral = arredondarMoedaEquipes(
      totalGeral + valorTotalVenda
    );

    linhasConsideradas++;
  }

  var vendedores = {};
  var vendedoresLista = [];

  Object.keys(totaisNormalizados).forEach(function(chave) {
    var nome = nomesOriginais[chave];
    var total = totaisNormalizados[chave];

    // Mantém as duas formas para o index localizar com ou sem acento.
    vendedores[nome] = total;
    vendedores[chave] = total;

    vendedoresLista.push({
      nome: nome,
      chave: chave,
      total: total
    });
  });

  vendedoresLista.sort(function(a, b) {
    return b.total - a.total;
  });

  var equipes = calcularTotaisEquipes(
    vendedores,
    semana,
    visao
  );

  var totalEquipes = somarTotaisEquipes(equipes);

  return {
    sucesso: true,
    painel: "equipes",
    visao: visao.toLowerCase(),
    semana: semana,
    periodo: periodo,
    mes: mes,
    ano: ano,
    origem: {
      aba: CONFIG_EQUIPES.ABA,
      data: "B/C/D",
      vendedor: "E",
      valor: "T"
    },
    linhasConsideradas: linhasConsideradas,
    vendedores: vendedores,
    vendedoresLista: vendedoresLista,
    membrosEquipes: obterMembrosTodasEquipes(semana, visao),
    equipes: equipes,
    metas: metas,
    totalEquipes: totalEquipes,
    totalGeral: totalGeral,
    atualizadoEm: Utilities.formatDate(
      new Date(),
      CONFIG_EQUIPES.FUSO_HORARIO,
      "yyyy-MM-dd'T'HH:mm:ss"
    )
  };
}

function criarRetornoEquipesVazio(mes, ano, semana, visao, periodo, metas) {
  return {
    sucesso: true,
    painel: "equipes",
    visao: visao.toLowerCase(),
    semana: semana,
    periodo: periodo,
    mes: mes,
    ano: ano,
    vendedores: {},
    vendedoresLista: [],
    membrosEquipes: obterMembrosTodasEquipes(semana, visao),
    equipes: calcularTotaisEquipes({}, semana, visao),
    metas: metas || obterMetasEquipes(semana, visao),
    totalEquipes: 0,
    totalGeral: 0,
    atualizadoEm: new Date().toISOString()
  };
}


/* =========================================================
   TOTAIS DAS EQUIPES
========================================================= */

function obterMembrosEquipe(equipeId, semana, visao) {
  var configuracao = CONFIG_MEMBROS_EQUIPES[equipeId] || {};
  var usarSemana1 =
    normalizarTexto(visao) !== "MES" &&
    converterInteiroEquipes(semana) === 1;

  if (usarSemana1 && Array.isArray(configuracao.semana1)) {
    return configuracao.semana1;
  }

  return Array.isArray(configuracao.padrao)
    ? configuracao.padrao
    : [];
}


function obterMembrosTodasEquipes(semana, visao) {
  var membrosEquipes = {};

  Object.keys(CONFIG_MEMBROS_EQUIPES).forEach(function(equipeId) {
    membrosEquipes[equipeId] = obterMembrosEquipe(
      equipeId,
      semana,
      visao
    ).slice();
  });

  return membrosEquipes;
}


function calcularTotaisEquipes(vendedores, semana, visao) {
  var vendedoresNormalizados = {};
  var totaisEquipes = {};

  Object.keys(vendedores || {}).forEach(function(nome) {
    var chave = normalizarTexto(nome);
    var valor = converterNumeroEquipes(vendedores[nome]);

    if (!chave) {
      return;
    }

    vendedoresNormalizados[chave] = Math.max(
      converterNumeroEquipes(vendedoresNormalizados[chave]),
      valor
    );
  });

  Object.keys(CONFIG_MEMBROS_EQUIPES).forEach(function(equipeId) {
    var membros = obterMembrosEquipe(equipeId, semana, visao);
    var total = 0;

    membros.forEach(function(nome) {
      total += converterNumeroEquipes(
        vendedoresNormalizados[normalizarTexto(nome)]
      );
    });

    totaisEquipes[equipeId] = arredondarMoedaEquipes(total);
  });

  return totaisEquipes;
}


function somarTotaisEquipes(equipes) {
  var total = 0;

  Object.keys(equipes || {}).forEach(function(equipeId) {
    total += converterNumeroEquipes(equipes[equipeId]);
  });

  return arredondarMoedaEquipes(total);
}


/* =========================================================
   METAS DAS EQUIPES
========================================================= */

function obterMetasEquipes(semana, visao) {
  var metas = {};
  var chaveSemana = "semana" + semana;
  var modoMes = normalizarTexto(visao) === "MES";

  Object.keys(CONFIG_METAS_EQUIPES).forEach(function(equipeId) {
    var configuracao = CONFIG_METAS_EQUIPES[equipeId] || {};

    if (modoMes) {
      if (
        configuracao.mes !== undefined &&
        configuracao.mes !== null &&
        configuracao.mes !== ""
      ) {
        metas[equipeId] = converterNumeroEquipes(configuracao.mes);
        return;
      }

      metas[equipeId] =
        converterNumeroEquipes(configuracao.semana1) +
        converterNumeroEquipes(configuracao.semana2) +
        converterNumeroEquipes(configuracao.semana3) +
        converterNumeroEquipes(configuracao.semana4) +
        converterNumeroEquipes(configuracao.semana5);

      return;
    }

    metas[equipeId] = converterNumeroEquipes(
      configuracao[chaveSemana]
    );
  });

  return metas;
}


/* =========================================================
   PERÍODOS
========================================================= */

/**
 * Semanas comerciais configuradas para julho de 2026:
 * 1ª: 1 a 4
 * 2ª: 6 a 11
 * 3ª: 13 a 18
 * 4ª: 20 a 25
 * 5ª: 27 até o final do mês
 */
function obterPeriodoSemana(semana, mes, ano) {
  var ultimoDiaDoMes = new Date(
    ano,
    mes,
    0
  ).getDate();

  var periodos = {
    1: {
      tipo: "semana",
      inicio: 1,
      fim: Math.min(4, ultimoDiaDoMes),
      mes: mes,
      ano: ano
    },

    2: {
      tipo: "semana",
      inicio: 6,
      fim: Math.min(11, ultimoDiaDoMes),
      mes: mes,
      ano: ano
    },

    3: {
      tipo: "semana",
      inicio: 13,
      fim: Math.min(18, ultimoDiaDoMes),
      mes: mes,
      ano: ano
    },

    4: {
      tipo: "semana",
      inicio: 20,
      fim: Math.min(25, ultimoDiaDoMes),
      mes: mes,
      ano: ano
    },

    5: {
      tipo: "semana",
      inicio: 27,
      fim: ultimoDiaDoMes,
      mes: mes,
      ano: ano
    }
  };

  return periodos[semana] || periodos[1];
}


function obterPeriodoMes(mes, ano) {
  return {
    tipo: "mes",
    inicio: 1,
    fim: new Date(ano, mes, 0).getDate(),
    mes: mes,
    ano: ano,
    diasConsiderados: "segunda a sábado"
  };
}


/**
 * Retorna true para segunda, terça, quarta, quinta, sexta e sábado.
 * Domingo (getDay() === 0) não entra no total mensal.
 */
function diaUtilComercial(dia, mes, ano) {
  var ultimoDia = new Date(ano, mes, 0).getDate();

  if (dia < 1 || dia > ultimoDia) {
    return false;
  }

  var data = new Date(ano, mes - 1, dia);

  return data.getDay() !== 0;
}


/**
 * Aceita tanto B/C/D separados quanto uma data completa na coluna B.
 */
function interpretarDataEquipes(
  valorDia,
  valorMes,
  valorAno,
  diaExibido,
  mesExibido,
  anoExibido
) {
  if (
    valorDia instanceof Date &&
    !isNaN(valorDia.getTime())
  ) {
    return {
      dia: Number(
        Utilities.formatDate(
          valorDia,
          CONFIG_EQUIPES.FUSO_HORARIO,
          "d"
        )
      ),
      mes: Number(
        Utilities.formatDate(
          valorDia,
          CONFIG_EQUIPES.FUSO_HORARIO,
          "M"
        )
      ),
      ano: Number(
        Utilities.formatDate(
          valorDia,
          CONFIG_EQUIPES.FUSO_HORARIO,
          "yyyy"
        )
      )
    };
  }

  var dia = converterInteiroEquipes(valorDia || diaExibido);
  var mes = converterInteiroEquipes(valorMes || mesExibido);
  var ano = converterInteiroEquipes(valorAno || anoExibido);

  if (ano > 0 && ano < 100) {
    ano += 2000;
  }

  if (
    dia < 1 || dia > 31 ||
    mes < 1 || mes > 12 ||
    ano < 2000
  ) {
    // Segurança para o caso de B vir como texto no formato dd/mm/aaaa.
    var textoData = String(diaExibido || valorDia || "").trim();
    var partes = textoData.match(
      /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/
    );

    if (!partes) {
      return null;
    }

    dia = Number(partes[1]);
    mes = Number(partes[2]);
    ano = Number(partes[3]);

    if (ano < 100) {
      ano += 2000;
    }
  }

  var ultimoDia = new Date(ano, mes, 0).getDate();

  if (dia > ultimoDia) {
    return null;
  }

  return {
    dia: dia,
    mes: mes,
    ano: ano
  };
}


function interpretarValorEquipes(valorBruto, valorExibido) {
  if (
    typeof valorBruto === "number" &&
    isFinite(valorBruto)
  ) {
    return arredondarMoedaEquipes(valorBruto);
  }

  return arredondarMoedaEquipes(
    converterNumeroEquipes(valorExibido || valorBruto)
  );
}


function dataPertenceAoPeriodoEquipes(dataVenda, periodo) {
  if (!dataVenda || !periodo) {
    return false;
  }

  if (
    dataVenda.dia < periodo.inicio ||
    dataVenda.dia > periodo.fim
  ) {
    return false;
  }

  if (
    CONFIG_EQUIPES.IGNORAR_DOMINGO &&
    !diaUtilComercial(
      dataVenda.dia,
      dataVenda.mes,
      dataVenda.ano
    )
  ) {
    return false;
  }

  return true;
}


function arredondarMoedaEquipes(valor) {
  return Math.round((Number(valor) || 0) * 100) / 100;
}


function descobrirSemanaAtual(data) {
  var dia = Number(
    Utilities.formatDate(
      data,
      CONFIG_EQUIPES.FUSO_HORARIO,
      "d"
    )
  );

  if (dia <= 5) {
    return 1;
  }

  if (dia <= 12) {
    return 2;
  }

  if (dia <= 19) {
    return 3;
  }

  if (dia <= 26) {
    return 4;
  }

  return 5;
}



/* =========================================================
   PAINEL DE CRESCIMENTO — JUNHO X JULHO
========================================================= */

function responderCrescimento(e) {
  var callback = validarCallbackCrescimento(
    e.parameter.callback || ""
  );

  var agora = new Date();
  var anoPadrao = Number(
    Utilities.formatDate(
      agora,
      CONFIG_CRESCIMENTO.FUSO_HORARIO,
      "yyyy"
    )
  );

  var mesBase = converterInteiroCrescimento(
    e.parameter.mesBase,
    6
  );

  var anoBase = converterInteiroCrescimento(
    e.parameter.anoBase,
    anoPadrao
  );

  var mesAtual = converterInteiroCrescimento(
    e.parameter.mesAtual,
    7
  );

  var anoAtual = converterInteiroCrescimento(
    e.parameter.anoAtual,
    anoPadrao
  );

  var cache = CacheService.getScriptCache();
  var cacheKey = [
    "painel_crescimento",
    mesBase,
    anoBase,
    mesAtual,
    anoAtual
  ].join("_");

  var json = cache.get(cacheKey);

  try {
    validarMesCrescimento(mesBase);
    validarMesCrescimento(mesAtual);

    if (!json) {
      json = JSON.stringify(
        montarComparativoCrescimento(
          mesBase,
          anoBase,
          mesAtual,
          anoAtual
        )
      );

      cache.put(
        cacheKey,
        json,
        CONFIG_CRESCIMENTO.CACHE_SEGUNDOS
      );
    }
  } catch (erro) {
    json = JSON.stringify({
      sucesso: false,
      painel: "crescimento",
      mensagem: erro.message,
      base: {},
      atual: {},
      crescimentoTotal: {},
      dias: []
    });
  }

  return criarResposta(json, callback);
}


function montarComparativoCrescimento(
  mesBase,
  anoBase,
  mesAtual,
  anoAtual
) {
  var planilha = SpreadsheetApp.getActiveSpreadsheet();

  if (!planilha) {
    throw new Error(
      "O Apps Script não está vinculado à planilha."
    );
  }

  var diaLimite = obterDiaLimiteCrescimento(
    mesAtual,
    anoAtual
  );

  var valoresBase = lerFaturamentoPorDiaCrescimento(
    planilha,
    mesBase,
    anoBase,
    diaLimite
  );

  var valoresAtuais = lerFaturamentoPorDiaCrescimento(
    planilha,
    mesAtual,
    anoAtual,
    diaLimite
  );

  var dias = [];
  var totalBase = 0;
  var totalAtual = 0;

  for (var dia = 1; dia <= diaLimite; dia++) {
    var base = arredondarMoedaCrescimento(
      valoresBase[dia] || 0
    );

    var atual = arredondarMoedaCrescimento(
      valoresAtuais[dia] || 0
    );

    var diferenca = arredondarMoedaCrescimento(
      atual - base
    );

    totalBase += base;
    totalAtual += atual;

    dias.push({
      dia: dia,
      base: base,
      atual: atual,
      diferenca: diferenca,
      crescimento: calcularPercentualCrescimento(
        base,
        atual
      )
    });
  }

  totalBase = arredondarMoedaCrescimento(totalBase);
  totalAtual = arredondarMoedaCrescimento(totalAtual);

  return {
    sucesso: true,
    painel: "crescimento",

    base: {
      mes: CONFIG_CRESCIMENTO.MESES[mesBase].nome,
      numeroMes: mesBase,
      ano: anoBase,
      total: totalBase
    },

    atual: {
      mes: CONFIG_CRESCIMENTO.MESES[mesAtual].nome,
      numeroMes: mesAtual,
      ano: anoAtual,
      total: totalAtual
    },

    crescimentoTotal: {
      diferenca: arredondarMoedaCrescimento(
        totalAtual - totalBase
      ),
      crescimento: calcularPercentualCrescimento(
        totalBase,
        totalAtual
      )
    },

    dias: dias,

    atualizadoEm: Utilities.formatDate(
      new Date(),
      CONFIG_CRESCIMENTO.FUSO_HORARIO,
      "yyyy-MM-dd'T'HH:mm:ss"
    )
  };
}


function lerFaturamentoPorDiaCrescimento(
  planilha,
  numeroMes,
  ano,
  diaLimite
) {
  var configuracao = CONFIG_CRESCIMENTO.MESES[numeroMes];
  var aba = planilha.getSheetByName(configuracao.aba);

  if (!aba) {
    throw new Error(
      'A aba "' + configuracao.aba + '" não foi encontrada.'
    );
  }

  var ultimaLinha = aba.getLastRow();
  var totais = {};

  if (ultimaLinha < CONFIG_CRESCIMENTO.LINHA_INICIAL) {
    return totais;
  }

  var quantidadeLinhas =
    ultimaLinha - CONFIG_CRESCIMENTO.LINHA_INICIAL + 1;

  var largura =
    configuracao.colunaValor - configuracao.colunaData + 1;

  var intervalo = aba.getRange(
    CONFIG_CRESCIMENTO.LINHA_INICIAL,
    configuracao.colunaData,
    quantidadeLinhas,
    largura
  );

  var valores = intervalo.getValues();
  var valoresExibidos = intervalo.getDisplayValues();
  var indiceValor =
    configuracao.colunaValor - configuracao.colunaData;

  for (var i = 0; i < valores.length; i++) {
    var data = interpretarDataCrescimento(
      valores[i][0],
      valoresExibidos[i][0],
      numeroMes,
      ano
    );

    if (!data) {
      continue;
    }

    if (data.mes !== numeroMes || data.ano !== ano) {
      continue;
    }

    if (data.dia < 1 || data.dia > diaLimite) {
      continue;
    }

    var valor = interpretarValorCrescimento(
      valores[i][indiceValor],
      valoresExibidos[i][indiceValor]
    );

    totais[data.dia] = arredondarMoedaCrescimento(
      (totais[data.dia] || 0) + valor
    );
  }

  return totais;
}


function interpretarDataCrescimento(
  valorBruto,
  valorExibido,
  mesPadrao,
  anoPadrao
) {
  if (
    valorBruto instanceof Date &&
    !isNaN(valorBruto.getTime())
  ) {
    return {
      dia: Number(
        Utilities.formatDate(
          valorBruto,
          CONFIG_CRESCIMENTO.FUSO_HORARIO,
          "d"
        )
      ),
      mes: Number(
        Utilities.formatDate(
          valorBruto,
          CONFIG_CRESCIMENTO.FUSO_HORARIO,
          "M"
        )
      ),
      ano: Number(
        Utilities.formatDate(
          valorBruto,
          CONFIG_CRESCIMENTO.FUSO_HORARIO,
          "yyyy"
        )
      )
    };
  }

  if (
    typeof valorBruto === "number" &&
    isFinite(valorBruto) &&
    valorBruto >= 1 &&
    valorBruto <= 31
  ) {
    return {
      dia: Math.floor(valorBruto),
      mes: mesPadrao,
      ano: anoPadrao
    };
  }

  var texto = String(
    valorExibido || valorBruto || ""
  ).trim();

  if (!texto) {
    return null;
  }

  var correspondencia = texto.match(
    /^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?$/
  );

  if (correspondencia) {
    var ano = correspondencia[3]
      ? Number(correspondencia[3])
      : anoPadrao;

    if (ano < 100) {
      ano += 2000;
    }

    return {
      dia: Number(correspondencia[1]),
      mes: Number(correspondencia[2]),
      ano: ano
    };
  }

  correspondencia = texto.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})/
  );

  if (correspondencia) {
    return {
      dia: Number(correspondencia[3]),
      mes: Number(correspondencia[2]),
      ano: Number(correspondencia[1])
    };
  }

  if (/^\d{1,2}$/.test(texto)) {
    return {
      dia: Number(texto),
      mes: mesPadrao,
      ano: anoPadrao
    };
  }

  return null;
}


function interpretarValorCrescimento(
  valorBruto,
  valorExibido
) {
  if (
    typeof valorBruto === "number" &&
    isFinite(valorBruto)
  ) {
    return valorBruto;
  }

  return converterNumeroEquipes(
    valorExibido || valorBruto
  );
}


function obterDiaLimiteCrescimento(mes, ano) {
  var hoje = new Date();

  var anoHoje = Number(
    Utilities.formatDate(
      hoje,
      CONFIG_CRESCIMENTO.FUSO_HORARIO,
      "yyyy"
    )
  );

  var mesHoje = Number(
    Utilities.formatDate(
      hoje,
      CONFIG_CRESCIMENTO.FUSO_HORARIO,
      "M"
    )
  );

  var diaHoje = Number(
    Utilities.formatDate(
      hoje,
      CONFIG_CRESCIMENTO.FUSO_HORARIO,
      "d"
    )
  );

  var ultimoDiaDoMes = new Date(
    ano,
    mes,
    0
  ).getDate();

  if (ano === anoHoje && mes === mesHoje) {
    return Math.min(diaHoje, ultimoDiaDoMes);
  }

  if (
    ano > anoHoje ||
    (ano === anoHoje && mes > mesHoje)
  ) {
    return 0;
  }

  return ultimoDiaDoMes;
}


function calcularPercentualCrescimento(base, atual) {
  if (base === 0 && atual === 0) {
    return 0;
  }

  if (base === 0 && atual > 0) {
    return null;
  }

  return ((atual - base) / base) * 100;
}


function arredondarMoedaCrescimento(valor) {
  return Math.round((Number(valor) || 0) * 100) / 100;
}


function validarMesCrescimento(mes) {
  if (!CONFIG_CRESCIMENTO.MESES[mes]) {
    throw new Error(
      "O mês " + mes +
      " não está configurado. Use Junho ou Julho."
    );
  }
}


function converterInteiroCrescimento(valor, padrao) {
  var numero = Number(valor);

  return numero % 1 === 0
    ? numero
    : padrao;
}


function validarCallbackCrescimento(callback) {
  var nome = String(callback || "").trim();

  return /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(nome)
    ? nome
    : "";
}


/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function converterInteiroEquipes(valor) {
  if (valor instanceof Date) {
    return valor.getDate();
  }

  var numero = parseInt(valor, 10);

  return isNaN(numero) ? 0 : numero;
}


function converterNumeroEquipes(valor) {
  if (typeof valor === "number") {
    return isNaN(valor) ? 0 : valor;
  }

  var texto = String(valor || "")
    .trim()
    .replace(/R\$/gi, "")
    .replace(/\s/g, "");

  if (
    texto.indexOf(".") !== -1 &&
    texto.indexOf(",") !== -1
  ) {
    texto = texto
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (texto.indexOf(",") !== -1) {
    texto = texto.replace(",", ".");
  }

  var numero = Number(texto);

  return isNaN(numero) ? 0 : numero;
}


function normalizarTexto(valor) {
  return String(valor || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}


function criarResposta(json, callback) {
  if (callback) {
    return ContentService
      .createTextOutput(
        callback + "(" + json + ")"
      )
      .setMimeType(
        ContentService.MimeType.JAVASCRIPT
      );
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(
      ContentService.MimeType.JSON
    );
}


/* =========================================================
   TESTES
========================================================= */

function testarMetaMilhao() {
  var resultado = montarDadosMetaMilhao();

  Logger.log(
    JSON.stringify(resultado, null, 2)
  );
}


function testarCrescimento() {
  var resultado = montarComparativoCrescimento(
    6,
    2026,
    7,
    2026
  );

  Logger.log(
    JSON.stringify(resultado, null, 2)
  );
}


function testarR2() {
  var resultado = montarDadosR2();

  Logger.log(
    JSON.stringify(resultado, null, 2)
  );
}


function testarEquipesSemana() {
  var hoje = new Date();

  var resultado = montarDadosEquipes(
    hoje.getMonth() + 1,
    hoje.getFullYear(),
    descobrirSemanaAtual(hoje),
    "SEMANA"
  );

  Logger.log(
    JSON.stringify(resultado, null, 2)
  );
}


function testarEquipesMes() {
  var hoje = new Date();

  var resultado = montarDadosEquipes(
    hoje.getMonth() + 1,
    hoje.getFullYear(),
    1,
    "MES"
  );

  Logger.log(
    JSON.stringify(resultado, null, 2)
  );
}
