// @vitest-environment jsdom
//
// O guia do empreendedor nasceu com cobertura de navegador e nenhum teste
// proprio, e o conteudo dele e 238 linhas de dado. As invariantes abaixo sao as
// que, se quebrarem, transformam um guia util em um guia perigoso: promessa de
// resultado, exigencia sem fonte, e o POP aparecendo como fundamento.
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import GuiaEmpreendedor from './empreendedor.jsx';
import {
  CUSTA_PRAZO,
  EMPREENDEDOR_SECOES,
  MODALIDADES,
  NAO_CONFUNDA,
  ONDE_ESTA_A_EXIGENCIA,
  PAPEIS_EMPREENDIMENTO,
  TRILHO_AMBIENTAL,
  TRILHO_SETORIAL,
} from './empreendedorGuia.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// jsdom nao implementa rolagem nem observador de interseccao. O que este
// arquivo verifica e o destino e o anuncio, e nao a animacao do navegador.
Element.prototype.scrollIntoView ??= function scrollIntoView() {};
globalThis.IntersectionObserver ??= class {
  observe() {}

  disconnect() {}
};

const hospedeiros = [];
afterEach(() => {
  while (hospedeiros.length) hospedeiros.pop()?.remove();
});

async function montar() {
  const host = document.createElement('div');
  document.body.append(host);
  hospedeiros.push(host);
  const root = createRoot(host);
  await act(async () => { root.render(<GuiaEmpreendedor go={() => {}} />); });
  return { host, root };
}

describe('guia do empreendedor', () => {
  it('a navegação local e as seções descrevem a mesma lista', async () => {
    const { host } = await montar();
    const secoes = [...host.querySelectorAll('.emp-secao')].map((s) => s.id);
    const atalhos = [...host.querySelectorAll('.emp-nav-links button')]
      .map((b) => b.dataset.empNavTarget);
    expect(secoes).toEqual(EMPREENDEDOR_SECOES.map((s) => s.id));
    expect(atalhos).toEqual(secoes);
  });

  it('declara na tela que não é canal oficial e que a fonte é uma minuta', async () => {
    const { host } = await montar();
    const aviso = host.querySelector('.emp-aviso')?.textContent || '';
    expect(aviso).toMatch(/não é canal oficial/i);
    expect(aviso).toMatch(/minuta/i);
    // Um guia que promete resultado deixa de ser guia e vira expectativa.
    expect(host.textContent).not.toMatch(/garante a licença|licença sai|aprovação garantida/i);
  });

  it('nenhuma exigência documental é atribuída ao POP', () => {
    // A regra permanente do projeto: o POP organiza o método e não cria
    // exigência. Se um grupo apontar o POP como fonte, o guia passa a ensinar
    // exatamente o erro que a plataforma marca como armadilha.
    for (const grupo of ONDE_ESTA_A_EXIGENCIA) {
      expect(grupo.fonte, `fonte de "${grupo.grupo}"`).toBeTruthy();
      expect(grupo.fonte).not.toMatch(/\bPOP\b|procedimento operacional/i);
    }
  });

  it('a Portaria de fauna não volta a figurar como fonte documental', () => {
    // Erro material corrigido depois da revisão técnica de 04/09/2026: a
    // Portaria IAT nº 12/2024 disciplina estudos de fauna e estava apontada
    // como fonte das listas documentais. O número tem lastro no POP, então o
    // portão de normas aprovou: ele confere que a norma existe, não que ela
    // foi aplicada ao assunto certo. Esta regressão fecha o buraco no ponto
    // exato em que ele apareceu.
    const documental = ONDE_ESTA_A_EXIGENCIA
      .find((g) => /listas documentais/i.test(g.grupo));
    expect(documental).toBeTruthy();
    expect(documental.fonte).toMatch(/Instrução Normativa IAT nº 09\/2025/);
    expect(documental.fonte).not.toMatch(/Portaria/i);
    expect(documental.atencao).toMatch(/fauna/i);
  });

  it('a Consulta Prévia declara o alcance, a finalidade e a validade', async () => {
    const { host } = await montar();
    const secao = host.querySelector('#emp-consulta')?.textContent || '';
    // Ela não alcança toda CGH: a obrigatoriedade começa em 1 MW.
    expect(secao).toMatch(/igual ou superior a 1 MW/i);
    expect(secao).toMatch(/24 meses/);
    expect(secao).toMatch(/não é prorrogável/i);
    const consultaNoTrilho = TRILHO_AMBIENTAL[0];
    expect(consultaNoTrilho.passo).toMatch(/1 MW/);
    // A CP não é modalidade de licenciamento e saiu daquela lista.
    expect(MODALIDADES.some((m) => /consulta prévia/i.test(m.sigla))).toBe(false);
  });

  it('a tabela de documentos distingue os estudos entre si', () => {
    expect(NAO_CONFUNDA.length).toBeGreaterThanOrEqual(8);
    for (const d of NAO_CONFUNDA) {
      expect(d.documento).toBeTruthy();
      expect(d.serve).toBeTruthy();
    }
    const siglas = NAO_CONFUNDA.map((d) => d.documento);
    for (const esperada of ['Memorial Descritivo', 'RAS', 'RDPA', 'PCA', 'PBA', 'Outorga']) {
      expect(siglas).toContain(esperada);
    }
  });

  it('cada modalidade diz o que é e o que não é', () => {
    expect(MODALIDADES.length).toBeGreaterThanOrEqual(5);
    for (const m of MODALIDADES) {
      expect(m.sigla, 'sigla').toBeTruthy();
      expect(m.nome, `nome de ${m.sigla}`).toBeTruthy();
      expect(m.serve, `serve de ${m.sigla}`).toBeTruthy();
      expect(m.limite, `limite de ${m.sigla}`).toBeTruthy();
    }
    // A dispensa e a confusao mais cara da lista: ela nao e licenca.
    const dlam = MODALIDADES.find((m) => m.sigla === 'DLAM');
    expect(dlam.nome).toBe('Declaração de Dispensa de Licenciamento Ambiental Estadual');
    expect(dlam.limite).toMatch(/não é licença/i);
  });

  it('cada papel declara também o que não faz', () => {
    for (const p of PAPEIS_EMPREENDIMENTO) {
      expect(p.faz, `faz de ${p.papel}`).toBeTruthy();
      expect(p.naoFaz, `naoFaz de ${p.papel}`).toBeTruthy();
    }
    const empreendedor = PAPEIS_EMPREENDIMENTO.find((p) => p.papel === 'Empreendedor');
    expect(empreendedor.naoFaz).toMatch(/não define a própria modalidade/i);
  });

  it('os dois trilhos e os erros de prazo vêm completos', () => {
    for (const lista of [TRILHO_SETORIAL, TRILHO_AMBIENTAL]) {
      expect(lista.length).toBeGreaterThanOrEqual(4);
      for (const etapa of lista) {
        expect(etapa.passo).toBeTruthy();
        expect(etapa.detalhe).toBeTruthy();
      }
    }
    for (const item of CUSTA_PRAZO) {
      expect(item.erro).toBeTruthy();
      expect(item.efeito).toBeTruthy();
    }
  });

  it('o atalho leva à seção e devolve o foco a ela', async () => {
    const { host } = await montar();
    const alvo = EMPREENDEDOR_SECOES[6].id;
    const botao = host.querySelector(`[data-emp-nav-target="${alvo}"]`);
    await act(async () => { botao.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    expect(document.activeElement?.id).toBe(alvo);
    expect(botao.getAttribute('aria-current')).toBe('location');
  });
});
