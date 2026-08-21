// Conversao de coordenadas para a leitura do mapa.
//
// POR QUE ISTO EXISTE
//
// O mapa desenha em Web Mercator, que e projecao de tela, boa para encaixar
// imagem e pessima para medir. O processo de licenciamento nao fala Mercator:
// fala SIRGAS 2000, em grau ou em UTM, e o Parana cai em dois fusos, o 21 e o
// 22. Quem confere um arranjo recebe coordenada em UTM e precisa saber em que
// fuso ela esta, porque o mesmo par de numeros cai em lugares diferentes do
// Estado conforme o fuso, sem nenhum aviso de erro.
//
// DATUM
//
// SIRGAS 2000 usa o elipsoide GRS80. WGS84 usa um elipsoide praticamente igual,
// com diferenca de achatamento na decima primeira casa, o que da menos de um
// milimetro no Parana. Por isso a conversao aqui serve para os dois, e o rotulo
// na tela diz SIRGAS 2000, que e o datum que a norma exige.
//
// O que este modulo NAO faz e transformacao entre datums antigos. Coordenada em
// Corrego Alegre ou SAD69 nao vira SIRGAS 2000 por aqui: aquilo exige parametros
// de transformacao e e decisao tecnica de quem analisa, nao conversao de tela.
// Tratar um SAD69 como se fosse SIRGAS 2000 desloca o ponto em dezenas de
// metros, e o mapa nao daria sinal nenhum de que algo esta errado.

/** Semieixo maior do GRS80, em metros. */
export const A = 6378137;
/** Achatamento do GRS80. */
export const F = 1 / 298.257222101;
/** Fator de escala do meridiano central no UTM. */
export const K0 = 0.9996;
const FALSO_LESTE = 500000;
const FALSO_NORTE = 10000000;

const E2 = 2 * F - F * F;
const EL2 = E2 / (1 - E2);

const rad = (g) => (g * Math.PI) / 180;
const grau = (r) => (r * 180) / Math.PI;

export const RAIO_MERCATOR = 20037508.342789244;

/** Web Mercator em metros para latitude e longitude em grau. */
export function mercatorParaGeo(x, y) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const lon = (x / RAIO_MERCATOR) * 180;
  const lat = grau(2 * Math.atan(Math.exp((y / RAIO_MERCATOR) * Math.PI)) - Math.PI / 2);
  return { lat, lon };
}

/** Latitude e longitude em grau para Web Mercator em metros. */
export function geoParaMercator(lat, lon) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const limite = 85.05112878;
  const latLimitada = Math.min(limite, Math.max(-limite, lat));
  return {
    x: (lon / 180) * RAIO_MERCATOR,
    y: (Math.log(Math.tan(Math.PI / 4 + rad(latLimitada) / 2)) / Math.PI) * RAIO_MERCATOR,
  };
}

/** Fuso UTM de uma longitude. O Parana fica entre o 21 e o 22. */
export function fusoDe(lon) {
  if (!Number.isFinite(lon)) return null;
  return Math.floor((((lon + 180) % 360) + 360) % 360 / 6) + 1;
}

const meridianoCentral = (fuso) => (fuso - 1) * 6 - 180 + 3;

/**
 * Latitude e longitude para UTM.
 *
 * Serie de Snyder, a mesma que a norma cartografica usa. Conferida contra o
 * PROJ em quatro pontos do Parana, nos dois fusos, com diferenca abaixo de um
 * centimetro.
 */
export function geoParaUtm(lat, lon, fusoForcado) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const fuso = Number.isFinite(fusoForcado) ? fusoForcado : fusoDe(lon);
  const fi = rad(lat);
  const dLambda = rad(lon - meridianoCentral(fuso));
  const sin = Math.sin(fi);
  const cos = Math.cos(fi);
  const tan = Math.tan(fi);

  const n = A / Math.sqrt(1 - E2 * sin * sin);
  const t = tan * tan;
  const c = EL2 * cos * cos;
  const a1 = dLambda * cos;

  const m = A * (
    (1 - E2 / 4 - (3 * E2 * E2) / 64 - (5 * E2 ** 3) / 256) * fi
    - ((3 * E2) / 8 + (3 * E2 * E2) / 32 + (45 * E2 ** 3) / 1024) * Math.sin(2 * fi)
    + ((15 * E2 * E2) / 256 + (45 * E2 ** 3) / 1024) * Math.sin(4 * fi)
    - ((35 * E2 ** 3) / 3072) * Math.sin(6 * fi)
  );

  const leste = FALSO_LESTE + K0 * n * (
    a1
    + ((1 - t + c) * a1 ** 3) / 6
    + ((5 - 18 * t + t * t + 72 * c - 58 * EL2) * a1 ** 5) / 120
  );

  let norte = K0 * (m + n * tan * (
    (a1 * a1) / 2
    + ((5 - t + 9 * c + 4 * c * c) * a1 ** 4) / 24
    + ((61 - 58 * t + t * t + 600 * c - 330 * EL2) * a1 ** 6) / 720
  ));
  // No hemisferio sul o norte conta a partir de dez milhoes, e nao do equador.
  // Sem isso o valor sai negativo e nao casa com nenhuma carta brasileira.
  if (lat < 0) norte += FALSO_NORTE;

  return { fuso, hemisferio: lat < 0 ? 'S' : 'N', leste, norte };
}

/** UTM de volta para latitude e longitude. */
export function utmParaGeo(fuso, leste, norte, sul = true) {
  if (![fuso, leste, norte].every(Number.isFinite)) return null;
  const x = leste - FALSO_LESTE;
  const y = sul ? norte - FALSO_NORTE : norte;

  const m = y / K0;
  const mu = m / (A * (1 - E2 / 4 - (3 * E2 * E2) / 64 - (5 * E2 ** 3) / 256));
  const e1 = (1 - Math.sqrt(1 - E2)) / (1 + Math.sqrt(1 - E2));

  const fi1 = mu
    + ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu)
    + ((21 * e1 * e1) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu)
    + ((151 * e1 ** 3) / 96) * Math.sin(6 * mu)
    + ((1097 * e1 ** 4) / 512) * Math.sin(8 * mu);

  const sin = Math.sin(fi1);
  const cos = Math.cos(fi1);
  const tan = Math.tan(fi1);
  const c1 = EL2 * cos * cos;
  const t1 = tan * tan;
  const n1 = A / Math.sqrt(1 - E2 * sin * sin);
  const r1 = (A * (1 - E2)) / (1 - E2 * sin * sin) ** 1.5;
  const d = x / (n1 * K0);

  const lat = fi1 - ((n1 * tan) / r1) * (
    (d * d) / 2
    - ((5 + 3 * t1 + 10 * c1 - 4 * c1 * c1 - 9 * EL2) * d ** 4) / 24
    + ((61 + 90 * t1 + 298 * c1 + 45 * t1 * t1 - 252 * EL2 - 3 * c1 * c1) * d ** 6) / 720
  );

  const lon = meridianoCentral(fuso) + grau((
    d
    - ((1 + 2 * t1 + c1) * d ** 3) / 6
    + ((5 - 2 * c1 + 28 * t1 - 3 * c1 * c1 + 8 * EL2 + 24 * t1 * t1) * d ** 5) / 120
  ) / cos);

  return { lat: grau(lat), lon };
}

/** Grau decimal com o sinal, como a maioria dos arquivos traz. */
export function formatarGrau(valor, casas = 5) {
  if (!Number.isFinite(valor)) return '';
  return valor.toFixed(casas).replace('.', ',');
}

/** Grau, minuto e segundo, como aparece em memorial descritivo. */
export function formatarGms(valor, eixo) {
  if (!Number.isFinite(valor)) return '';
  const sufixo = eixo === 'lat' ? (valor < 0 ? 'S' : 'N') : (valor < 0 ? 'O' : 'L');
  const absoluto = Math.abs(valor);
  const g = Math.floor(absoluto);
  const minutoCheio = (absoluto - g) * 60;
  const m = Math.floor(minutoCheio);
  const s = (minutoCheio - m) * 60;
  return `${g}° ${String(m).padStart(2, '0')}' ${s.toFixed(2).replace('.', ',')}" ${sufixo}`;
}

/** Metro com separador de milhar, do jeito que a carta apresenta. */
export function formatarMetro(valor) {
  if (!Number.isFinite(valor)) return '';
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

// Aceita as formas que aparecem em documento de processo: grau decimal com
// ponto ou virgula, com ou sem sinal, e grau, minuto e segundo com sufixo de
// hemisferio. Devolve nulo quando nao reconhece, em vez de chutar: chutar aqui
// coloca um ponto no lugar errado do mapa e ninguem percebe.
const NUMERO = String.raw`[-+]?\d+(?:[.,]\d+)?`;

export function lerCoordenada(texto) {
  const cru = String(texto || '').trim();
  if (!cru) return null;

  // Grau, minuto e segundo, nos dois eixos.
  const gms = new RegExp(
    String.raw`(\d+)\s*[°º]\s*(\d+)\s*['′]\s*(${NUMERO})\s*["″]?\s*([NSns])`
    + String.raw`[\s,;]+(\d+)\s*[°º]\s*(\d+)\s*['′]\s*(${NUMERO})\s*["″]?\s*([WOwoEe])`,
  ).exec(cru);
  if (gms) {
    const paraDecimal = (g, m, s, sinalNegativo) => {
      const v = Number(g) + Number(m) / 60 + Number(String(s).replace(',', '.')) / 3600;
      return sinalNegativo ? -v : v;
    };
    return {
      lat: paraDecimal(gms[1], gms[2], gms[3], /[Ss]/.test(gms[4])),
      lon: paraDecimal(gms[5], gms[6], gms[7], /[WOwo]/.test(gms[8])),
      forma: 'gms',
    };
  }

  // UTM, na forma que o memorial usa: fuso, leste, norte.
  const utm = new RegExp(
    String.raw`^(?:fuso\s*)?(\d{1,2})\s*([NSns])?[\s,;]+(${NUMERO})[\s,;]+(${NUMERO})$`,
    'i',
  ).exec(cru);
  if (utm) {
    const fuso = Number(utm[1]);
    const leste = Number(utm[3].replace(',', '.'));
    const norte = Number(utm[4].replace(',', '.'));
    // Fuso fora de 1 a 60 nao existe, e leste de UTM fica entre 100 mil e 900
    // mil por definicao da projecao. Recusar aqui evita plotar lixo.
    if (fuso >= 1 && fuso <= 60 && leste > 100000 && leste < 900000 && norte > 0) {
      const geo = utmParaGeo(fuso, leste, norte, !/^[Nn]$/.test(utm[2] || 'S'));
      return geo ? { ...geo, forma: 'utm', fuso } : null;
    }
    return null;
  }

  // Dois numeros decimais soltos: latitude e depois longitude.
  const par = new RegExp(String.raw`^(${NUMERO})[\s,;]+(${NUMERO})$`).exec(cru);
  if (par) {
    const a = Number(par[1].replace(',', '.'));
    const b = Number(par[2].replace(',', '.'));
    const latitudePossivel = (v) => Math.abs(v) <= 90;
    const longitudePossivel = (v) => Math.abs(v) <= 180;
    const direto = latitudePossivel(a) && longitudePossivel(b);
    const trocado = latitudePossivel(b) && longitudePossivel(a);

    // A ordem trocada NAO se decide por magnitude. Em "-49,2733 -25,4284" os
    // dois numeros cabem em latitude, porque -49 e latitude valida, no oceano
    // ao sul. Uma regra so de magnitude aceita a leitura direta e planta o
    // ponto a milhares de quilometros do Parana, sem erro nenhum na tela.
    //
    // Quem decide aqui e o Estado: se a leitura direta cai fora do Parana e a
    // trocada cai dentro, a troca e a leitura provavel. O caso fica marcado
    // como invertido para a tela poder avisar, em vez de corrigir escondido.
    if (direto && dentroDoParana(a, b)) return { lat: a, lon: b, forma: 'grau' };
    if (trocado && dentroDoParana(b, a)) return { lat: b, lon: a, forma: 'grau-invertido' };
    if (direto) return { lat: a, lon: b, forma: 'grau' };
    if (trocado) return { lat: b, lon: a, forma: 'grau-invertido' };
  }
  return null;
}

/** Limites do Parana, para avisar quando o ponto cai fora do Estado. */
export const CAIXA_PARANA = { latMin: -26.72, latMax: -22.51, lonMin: -54.62, lonMax: -48.02 };

export function dentroDoParana(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon)
    && lat >= CAIXA_PARANA.latMin && lat <= CAIXA_PARANA.latMax
    && lon >= CAIXA_PARANA.lonMin && lon <= CAIXA_PARANA.lonMax;
}
