import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  SUPPORT_EMAIL,
  Suporte,
  buildSupportDiagnostic,
  buildSupportMailto,
} from './painelAluno.jsx';
import { firstEditorialViolation } from '../tools/public-editorial-rules.mjs';
import { isPermittedPublicEmail } from '../tools/audit-premium-email-policy.mjs';

describe('Central de Suporte', () => {
  it('mantém toda a ajuda dentro da plataforma e cobre os sete assuntos essenciais', () => {
    const html = renderToStaticMarkup(<Suporte/>);

    expect(html).toContain('Central de Suporte');
    expect(html).toContain(SUPPORT_EMAIL);
    expect(html).toContain('Mapa e camada de satélite');
    expect(html).toContain('Exportação e importação de backup');
    expect(html).toContain('Versão e diagnóstico técnico');
    expect(html.match(/<details/g)).toHaveLength(7);
    expect(html).not.toContain('github.com');
    expect(html).not.toContain('>AI<');
  });

  it('gera diagnóstico somente com os campos técnicos permitidos', () => {
    const diagnostic = buildSupportDiagnostic({
      version: '2.0.0',
      build: 'build-teste',
      route: '#/mapa',
      userAgent: 'Navegador de teste',
      online: false,
      nome: 'Pessoa de teste',
      nota: 7,
      resposta: 'conteúdo reservado',
      rascunho: 'texto de processo',
    });

    expect(diagnostic).toContain('Versão da plataforma: 2.0.0');
    expect(diagnostic).toContain('Build: build-teste');
    expect(diagnostic).toContain('Página: #/mapa');
    expect(diagnostic).toContain('Conectividade: offline');
    expect(diagnostic).toContain('Navegador: Navegador de teste');
    expect(diagnostic).not.toMatch(/Pessoa de teste|conteúdo reservado|texto de processo|Nota:/u);
  });

  it('usa o estado de conexão observado pela aplicação no diagnóstico', () => {
    const html = renderToStaticMarkup(<Suporte online={false} />);
    expect(html).toContain('Conectividade: offline');
  });

  it('prepara o e-mail oficial com assunto, descrição e diagnóstico', () => {
    const href = buildSupportMailto({
      area: 'Mapa do Paraná',
      page: 'Mapa › camada de satélite',
      expected: 'Exibir a camada selecionada.',
      found: 'A camada não carregou.',
      version: '2.0.0',
      build: 'build-teste',
      route: '#/mapa',
      userAgent: 'Navegador de teste',
      online: true,
    });
    const query = new URLSearchParams(href.slice(href.indexOf('?') + 1));

    expect(href.startsWith(`mailto:${SUPPORT_EMAIL}?`)).toBe(true);
    expect(query.get('subject')).toBe(
      'Academia IAT | Suporte | v2.0.0 | build build-teste | Mapa do Paraná',
    );
    expect(query.get('body')).toContain('Página ou aula: Mapa › camada de satélite');
    expect(query.get('body')).toContain('Comportamento esperado: Exibir a camada selecionada.');
    expect(query.get('body')).toContain('Comportamento encontrado: A camada não carregou.');
    expect(query.get('body')).toContain('Conectividade: online');
    expect(query.get('body')).toContain('Não inclua processos reais');
  });
});

describe('política editorial da superfície pública', () => {
  it.each(['AI', 'IA', 'Uma referência a AI.', 'Uma referência a IA.'])(
    'bloqueia a sigla pública exata em “%s”',
    (text) => {
      expect(firstEditorialViolation(text)?.rule.label).toBe(
        'sigla removida da apresentação pública',
      );
    },
  );

  it.each([
    'Ai, preciso de ajuda.',
    'Eu ia abrir o mapa.',
    'A praia aparece no mapa.',
    'O e-mail foi preparado.',
    'MAIOR',
  ])('não cria falso positivo para “%s”', (text) => {
    expect(firstEditorialViolation(text)).toBeNull();
  });

  it.each([
    'Gravidade do achado',
    'Severidade alta',
    'Criticidade documental',
    'Pendência crítica',
    'Análise crítica dos resultados',
    'Atividade de baixo risco',
    'Intervenção de baixo impacto',
    'Empreendimento de baixo potencial',
    'Atividade com risco baixo',
    'Intervenções com impactos baixos',
    'Critical analysis of the results',
    'High severity finding',
    'Physical gravity',
    'Low-impact activity',
  ])('bloqueia a linguagem operacional retirada em “%s”', (text) => {
    expect(firstEditorialViolation(text)).not.toBeNull();
  });

  it.each([
    'Usina Hidrelétrica Baixo Iguaçu',
    'A constante física g entra no cálculo.',
    'Pendência que impede a decisão segura.',
  ])('preserva formulações permitidas em “%s”', (text) => {
    expect(firstEditorialViolation(text)).toBeNull();
  });
});

describe('exceção institucional do auditor de privacidade', () => {
  it('aceita o contato oficial autorizado e preserva os aliases genéricos', () => {
    expect(isPermittedPublicEmail(SUPPORT_EMAIL)).toBe(true);
    expect(isPermittedPublicEmail('SUPORTE' + '@' + 'iat.pr.gov.br')).toBe(true);
  });

  it.each([
    'bol.rafaelaugusto' + '@' + 'iat.pr.gov.com',
    'rafaelaugusto' + '@' + 'iat.pr.gov.br',
    'bol.rafaelaugusto+teste' + '@' + 'iat.pr.gov.br',
    'bol.rafaelaugusto' + '@' + 'iat.pr.gov.br.exemplo',
  ])('continua bloqueando endereços próximos, mas não autorizados', (email) => {
    expect(isPermittedPublicEmail(email)).toBe(false);
  });
});
