import { describe, expect, it } from 'vitest';
import { ancorasDoCaso, conferirMinuta, IDS_VERIFICACAO } from './conferenciaIT.js';
import { ESTRUTURA_IT, MINIMO_SECAO } from './redatorIT.js';

const caso = {
  id: 'cp',
  type: 'CGH',
  title: 'CGH com sensibilidade locacional na Consulta Prévia',
  facts: ['Potência de 2,4 MW', 'ADA a cerca de 600 m de unidade de conservação'],
  evidence: ['Requerimento da Consulta Prévia', 'Memorial preliminar'],
};

const encorpar = (texto) => (texto.length >= 70 ? texto : `${texto} ${'.'.repeat(70 - texto.length)}`);

const minutaModelo = () => ({
  identificacao: encorpar('CGH do empreendedor, com município, corpo hídrico, modalidade requerida e protocolo.'),
  objeto: encorpar('Analisa-se o requerimento quanto à suficiência documental; fica fora o juízo de viabilidade.'),
  historico: encorpar('Não há licença anterior; a Consulta Prévia é a primeira movimentação do processo.'),
  base: encorpar('Resolução CEMA aplicável, art. 5º, inciso II, e o Termo de Referência da data do protocolo.'),
  metodologia: encorpar('Confrontei o Requerimento da Consulta Prévia e o Memorial preliminar com a fase atual.'),
  identificacao_tecnica: encorpar('Configuração de CGH, com potência declarada e arranjo ainda a confirmar no Memorial.'),
  documental: encorpar('O Memorial preliminar foi apresentado, porém é insuficiente para caracterizar o arranjo.'),
  tecnica: encorpar('A lacuna do arranjo compromete a leitura da ADA e da sensibilidade do entorno nesta fase.'),
  pendencias: encorpar('Pendência impeditiva: o Memorial não caracteriza o arranjo e impede decisão segura.'),
  conclusao: encorpar('A modalidade requerida está adequada; a instrução documental é insuficiente ainda.'),
  encaminhamento: encorpar('Encaminho em diligência, para complementação do Memorial, antes do juízo de mérito.'),
  controle_qualidade: encorpar('Fiz a leitura inversa do encaminhamento até cada evidência que o sustenta.'),
});

const idsDe = (resultado) => resultado.achados.map((achado) => achado.id);

describe('conferência da minuta de Informação Técnica', () => {
  it('não acusa nada antes de a pessoa escrever', () => {
    const resultado = conferirMinuta(caso, {});
    expect(resultado.achados).toEqual([]);
    expect(resultado.conferiveis).toBe(0);
    expect(resultado.escritas).toBe(0);
    expect(resultado.total).toBe(ESTRUTURA_IT.length);
  });

  it('não acusa a minuta que atende os doze elementos', () => {
    const resultado = conferirMinuta(caso, minutaModelo());
    expect(idsDe(resultado)).toEqual([]);
    expect(resultado.escritas).toBe(ESTRUTURA_IT.length);
    expect(resultado.conferiveis).toBeGreaterThan(0);
  });

  it('acusa o POP como fundamento de exigência, e aceita o POP ao lado do dispositivo', () => {
    const comPop = conferirMinuta(caso, {
      ...minutaModelo(),
      base: encorpar('A exigência decorre do POP de licenciamento, que orienta a análise desta fase.'),
    });
    expect(idsDe(comPop)).toContain('base-pop-como-fundamento');

    const comNorma = conferirMinuta(caso, {
      ...minutaModelo(),
      base: encorpar('Resolução CEMA, art. 5º, inciso II; o POP organiza o método aplicado nesta análise.'),
    });
    expect(idsDe(comNorma)).not.toContain('base-pop-como-fundamento');
  });

  it('confronta a tipologia declarada com a do caso', () => {
    const divergente = conferirMinuta(caso, {
      ...minutaModelo(),
      identificacao: encorpar('Trata-se de PCH do empreendedor, com município, modalidade e protocolo.'),
    });
    const achado = divergente.achados.find((item) => item.id === 'tipologia-divergente');
    expect(achado).toBeDefined();
    expect(achado.mensagem).toContain('PCH');
    expect(achado.mensagem).toContain('CGH');
  });

  it('acusa condicionante usada para adiar pendência impeditiva', () => {
    const resultado = conferirMinuta(caso, {
      ...minutaModelo(),
      encaminhamento: encorpar('Encaminho com condicionante a ser cumprida na etapa seguinte do processo.'),
    });
    expect(idsDe(resultado)).toContain('condicionante-para-pendencia-impeditiva');
  });

  it('acusa conclusão que contradiz o encaminhamento', () => {
    const resultado = conferirMinuta(caso, {
      ...minutaModelo(),
      pendencias: encorpar('Registro pendência quanto ao Memorial preliminar, que segue em conferência.'),
      encaminhamento: encorpar('Encaminho pelo deferimento do pedido, na forma requerida pelo interessado.'),
    });
    expect(idsDe(resultado)).toContain('conclusao-contradiz-encaminhamento');
  });

  it('não confunde indeferimento com deferimento na coerência', () => {
    // "indeferimento" contém "deferimento", e a conclusão que aponta
    // insuficiência seguida de indeferimento é coerente, não contraditória.
    const coerente = conferirMinuta(caso, {
      ...minutaModelo(),
      encaminhamento: encorpar('Encaminho pelo indeferimento do pedido, na forma da conclusão registrada.'),
    });
    expect(idsDe(coerente)).not.toContain('conclusao-contradiz-encaminhamento');

    const contraditorio = conferirMinuta(caso, {
      ...minutaModelo(),
      encaminhamento: encorpar('Encaminho pelo deferimento do pedido, na forma requerida pelo interessado.'),
    });
    expect(idsDe(contraditorio)).toContain('conclusao-contradiz-encaminhamento');
  });

  it('acusa minuta que não cita nenhuma evidência nem fato do caso', () => {
    const generica = {};
    for (const secao of ['identificacao', 'base', 'documental', 'metodologia', 'conclusao']) {
      generica[secao] = encorpar('Analisei o processo e considero que está tudo certo, sem impedimento.');
    }
    expect(idsDe(conferirMinuta(caso, generica))).toContain('minuta-generica');
    expect(idsDe(conferirMinuta(caso, minutaModelo()))).not.toContain('minuta-generica');
  });

  it('devolve seção e critério em cada achado, para a pessoa saber onde voltar', () => {
    const resultado = conferirMinuta(caso, {
      ...minutaModelo(),
      identificacao: encorpar('Trata-se do empreendimento do interessado, com protocolo e município.'),
    });
    expect(resultado.achados.length).toBeGreaterThan(0);
    for (const achado of resultado.achados) {
      expect(ESTRUTURA_IT.some((secao) => secao.id === achado.secaoId)).toBe(true);
      expect(Number.isInteger(achado.secaoN)).toBe(true);
      expect(achado.secaoTitulo.length).toBeGreaterThan(0);
      expect(achado.criterio.length).toBeGreaterThan(0);
      expect(['faltou', 'risco']).toContain(achado.natureza);
    }
  });

  it('não devolve nota, percentual nem aprovação', () => {
    const resultado = conferirMinuta(caso, minutaModelo());
    const chaves = Object.keys(resultado);
    expect(chaves).toEqual(['achados', 'escritas', 'total', 'conferiveis']);
    const texto = JSON.stringify(resultado).toLowerCase();
    expect(texto).not.toContain('aprovad');
    expect(texto).not.toContain('nota');
    expect(texto).not.toContain('%');
  });

  it('ancora o caso pelas evidências e pelos fatos, ignorando palavra curta', () => {
    const ancoras = ancorasDoCaso(caso);
    expect(ancoras).toContain('memorial');
    expect(ancoras).toContain('requerimento');
    expect(ancoras.every((termo) => termo.length >= 5)).toBe(true);
    expect(ancorasDoCaso({})).toEqual([]);
  });

  it('mantém o mínimo por seção alinhado ao redator', () => {
    const quaseVazia = { identificacao: 'CGH' };
    expect(conferirMinuta(caso, quaseVazia).escritas).toBe(0);
    const naMedida = { identificacao: 'C'.repeat(MINIMO_SECAO) };
    expect(conferirMinuta(caso, naMedida).escritas).toBe(1);
  });

  it('declara cada verificação com identificador único', () => {
    expect(IDS_VERIFICACAO.length).toBeGreaterThan(0);
    expect(new Set(IDS_VERIFICACAO).size).toBe(IDS_VERIFICACAO.length);
  });
});
