import { describe, expect, it } from 'vitest';
import {
  CAIXA_PARANA,
  dentroDoParana,
  formatarGms,
  fusoDe,
  geoParaMercator,
  geoParaUtm,
  lerCoordenada,
  mercatorParaGeo,
  utmParaGeo,
} from './coordenadas.js';

// Verdade de referencia gerada pelo PROJ, via pyproj 3.7.2, convertendo de
// EPSG:4674 (SIRGAS 2000 em grau) para EPSG:31981 e EPSG:31982 (SIRGAS 2000 UTM
// fusos 21S e 22S). Os valores NAO vieram desta implementacao: conferir codigo
// contra ele mesmo nao prova nada.
const REFERENCIA = [
  { nome: 'Curitiba', lat: -25.4284, lon: -49.2733, fuso: 22, leste: 673648.49, norte: 7186491.01 },
  { nome: 'Foz do Iguaçu', lat: -25.5163, lon: -54.5854, fuso: 21, leste: 742674.02, norte: 7175677.51 },
  { nome: 'Londrina', lat: -23.3045, lon: -51.1696, fuso: 22, leste: 482658.35, norte: 7422761.37 },
  { nome: 'Guarapuava', lat: -25.3935, lon: -51.4562, fuso: 22, leste: 454112.38, norte: 7191401.06 },
];

describe('geoParaUtm', () => {
  it.each(REFERENCIA)('bate com o PROJ em $nome', ({ lat, lon, fuso, leste, norte }) => {
    const utm = geoParaUtm(lat, lon);
    expect(utm.fuso).toBe(fuso);
    expect(utm.hemisferio).toBe('S');
    // Um centimetro. Acima disso a serie estaria truncada errado.
    expect(utm.leste).toBeCloseTo(leste, 1);
    expect(utm.norte).toBeCloseTo(norte, 1);
  });

  it('soma o falso norte no hemisfério sul', () => {
    // Sem o falso norte de dez milhoes o valor sai negativo e nao casa com
    // nenhuma carta brasileira.
    expect(geoParaUtm(-25.4284, -49.2733).norte).toBeGreaterThan(7_000_000);
    expect(geoParaUtm(10, -49.2733).norte).toBeLessThan(2_000_000);
  });

  it('permite forçar o fuso, porque o Paraná fica entre dois', () => {
    // O mesmo ponto tem representacao valida em fuso vizinho, com leste bem
    // fora da faixa central. Quem confere memorial precisa poder pedir isso.
    const natural = geoParaUtm(-25.4284, -49.2733);
    const forcado = geoParaUtm(-25.4284, -49.2733, 21);
    expect(natural.fuso).toBe(22);
    expect(forcado.fuso).toBe(21);
    expect(forcado.leste).toBeGreaterThan(natural.leste);
  });
});

describe('fusoDe', () => {
  it('separa o oeste do Paraná no fuso 21 e o restante no 22', () => {
    expect(fusoDe(-54.5854)).toBe(21);
    expect(fusoDe(-49.2733)).toBe(22);
    // O limite entre os fusos e o meridiano de 54 graus oeste.
    expect(fusoDe(-54.0001)).toBe(21);
    expect(fusoDe(-53.9999)).toBe(22);
  });
});

describe('utmParaGeo', () => {
  it.each(REFERENCIA)('volta ao grau original em $nome', ({ lat, lon, fuso, leste, norte }) => {
    const geo = utmParaGeo(fuso, leste, norte, true);
    expect(geo.lat).toBeCloseTo(lat, 6);
    expect(geo.lon).toBeCloseTo(lon, 6);
  });

  it('a ida e a volta fecham', () => {
    const utm = geoParaUtm(-24.9, -52.3);
    const volta = utmParaGeo(utm.fuso, utm.leste, utm.norte, true);
    expect(volta.lat).toBeCloseTo(-24.9, 8);
    expect(volta.lon).toBeCloseTo(-52.3, 8);
  });
});

describe('Web Mercator', () => {
  it('a ida e a volta fecham dentro do Paraná', () => {
    const m = geoParaMercator(-25.4284, -49.2733);
    const g = mercatorParaGeo(m.x, m.y);
    expect(g.lat).toBeCloseTo(-25.4284, 9);
    expect(g.lon).toBeCloseTo(-49.2733, 9);
  });

  it('não confunde o eixo y com latitude', () => {
    // Mercator cresce para o NORTE; latitude mais ao sul da y menor.
    expect(geoParaMercator(-22.5, -50).y).toBeGreaterThan(geoParaMercator(-26.7, -50).y);
  });
});

describe('lerCoordenada', () => {
  it('lê grau decimal com ponto e com vírgula', () => {
    expect(lerCoordenada('-25.4284 -49.2733')).toMatchObject({ lat: -25.4284, lon: -49.2733 });
    expect(lerCoordenada('-25,4284; -49,2733')).toMatchObject({ lat: -25.4284, lon: -49.2733 });
  });

  it('corrige a ordem invertida quando só a troca cai no Paraná', () => {
    // Cuidado com o raciocinio ingenuo: -49,2733 E latitude valida, no oceano
    // ao sul, entao a magnitude NAO desempata. Quem desempata e o Estado: a
    // leitura direta cai longe, a trocada cai em Curitiba.
    const lido = lerCoordenada('-49.2733, -25.4284');
    expect(lido.lat).toBeCloseTo(-25.4284, 4);
    expect(lido.forma).toBe('grau-invertido');
  });

  it('não inventa troca quando o ponto está legitimamente fora do Paraná', () => {
    // Sao Paulo: a leitura direta e valida e nao cai no Parana, mas a trocada
    // tambem nao. Sem ponto no Estado para desempatar, vale a ordem escrita.
    const lido = lerCoordenada('-23.55, -46.63');
    expect(lido).toMatchObject({ lat: -23.55, lon: -46.63, forma: 'grau' });
  });

  it('lê grau, minuto e segundo com hemisfério', () => {
    const lido = lerCoordenada(`25° 25' 42,24" S, 49° 16' 23,88" O`);
    expect(lido.lat).toBeCloseTo(-25.4284, 4);
    expect(lido.lon).toBeCloseTo(-49.2733, 4);
  });

  it('lê UTM na forma fuso, leste, norte', () => {
    const lido = lerCoordenada('22 673648.49 7186491.01');
    expect(lido.forma).toBe('utm');
    expect(lido.lat).toBeCloseTo(-25.4284, 5);
    expect(lido.lon).toBeCloseTo(-49.2733, 5);
  });

  it('recusa UTM impossível em vez de plotar lixo', () => {
    // Leste de UTM fica entre 100 mil e 900 mil por definicao da projecao.
    expect(lerCoordenada('22 12 7186491')).toBeNull();
    expect(lerCoordenada('99 673648 7186491')).toBeNull();
  });

  it('devolve nulo para texto que não é coordenada', () => {
    expect(lerCoordenada('')).toBeNull();
    expect(lerCoordenada('rio Iguaçu')).toBeNull();
    expect(lerCoordenada('abc def')).toBeNull();
  });
});

describe('formatarGms', () => {
  it('usa O para oeste, como o memorial em português', () => {
    expect(formatarGms(-49.2733, 'lon')).toContain('O');
    expect(formatarGms(-25.4284, 'lat')).toContain('S');
  });

  it('não perde o minuto zero', () => {
    expect(formatarGms(-25.0056, 'lat')).toMatch(/^25° 00'/);
  });
});

describe('dentroDoParana', () => {
  it('aceita ponto no Estado e recusa fora', () => {
    expect(dentroDoParana(-25.4284, -49.2733)).toBe(true);
    expect(dentroDoParana(-23.55, -46.63)).toBe(false);
    expect(dentroDoParana(CAIXA_PARANA.latMin, CAIXA_PARANA.lonMin)).toBe(true);
  });
});
