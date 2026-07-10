var CONFIG_R2 = {
  ABA: "Vendas",
  LINHA_INICIAL: 2,

  // Dados da linha: B até M
  PRIMEIRA_COLUNA: 2,  // B
  TOTAL_COLUNAS: 12,   // B:M

  // Dentro do intervalo B:M, a coluna M é o índice 11.
  INDICE_COLUNA_FILTRO: 11,

  VALOR_FILTRO: "R2 2026",
  CACHE_SEGUNDOS: 30
};


/**
 * Aplicativo da Web exclusivo do painel R2.
 *
 * Basta acessar:
 * https://script.google.com/macros/s/SEU_ID/exec
 */
function doGet(e) {
  e = e || {};
  e.parameter = e.parameter || {};

  var callback = e.parameter.callback || "";
  var cache = CacheService.getScriptCache();
  var cacheKey = "vendas_r2_2026";
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
      mensagem: erro.message,
      filtro: CONFIG_R2.VALOR_FILTRO,
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
      filtro: CONFIG_R2.VALOR_FILTRO,
      total: 0,
      dados: [],
      atualizadoEm: new Date().toISOString()
    };
  }

  var quantidadeLinhas =
    ultimaLinha - CONFIG_R2.LINHA_INICIAL + 1;

  // Uma única leitura, somente de B até M.
  // getDisplayValues lê os valores exibidos nos menus suspensos
  // e mantém a formatação visual de moedas.
  var linhas = aba
    .getRange(
      CONFIG_R2.LINHA_INICIAL,
      CONFIG_R2.PRIMEIRA_COLUNA,
      quantidadeLinhas,
      CONFIG_R2.TOTAL_COLUNAS
    )
    .getDisplayValues();

  var filtro = normalizarTexto(
    CONFIG_R2.VALOR_FILTRO
  );

  var dados = [];

  for (var i = 0; i < linhas.length; i++) {
    var linha = linhas[i];

    var valorFiltro = normalizarTexto(
      linha[CONFIG_R2.INDICE_COLUNA_FILTRO]
    );

    if (valorFiltro !== filtro) {
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
    filtro: CONFIG_R2.VALOR_FILTRO,
    total: dados.length,
    dados: dados,
    atualizadoEm: new Date().toISOString()
  };
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
      .createTextOutput(callback + "(" + json + ")")
      .setMimeType(
        ContentService.MimeType.JAVASCRIPT
      );
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}


/**
 * Execute manualmente esta função somente para testar dentro
 * do editor do Apps Script.
 */
function testarR2() {
  var resultado = montarDadosR2();
  Logger.log(JSON.stringify(resultado, null, 2));
}
