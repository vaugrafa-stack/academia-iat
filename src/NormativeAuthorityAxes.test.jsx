import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import NormativeAuthorityAxes from './NormativeAuthorityAxes.jsx';

describe('painel de competências normativas', () => {
  it('mostra três decisões separadas, fontes e ressalva de aplicação humana', () => {
    const html = renderToStaticMarkup(<NormativeAuthorityAxes />);

    expect(html).toContain('Três eixos, três decisões diferentes');
    expect(html).toContain('Licenciamento ambiental estadual');
    expect(html).toContain('Regulação e outorga do setor elétrico');
    expect(html).toContain('Disponibilidade e direito de uso da água');
    expect(html).toContain('Revisão institucional pendente');
    expect(html).toContain('Fonte primária localizada não equivale a conteúdo validado');
    expect(html).toContain('Revisão:</strong> institucional pendente');
    expect(html).toContain('Atenção às fontes:');
    expect(html).toContain('Página geral divergente');
    expect(html).toContain('Ato alterador');
    expect((html.match(/Fonte principal/g) || [])).toHaveLength(3);
  });

  it('mantém visível no modo compacto a divergência entre a REN consolidada e a página geral', () => {
    const html = renderToStaticMarkup(<NormativeAuthorityAxes compact />);

    expect(html).toContain('normative-axes compact');
    expect(html).toContain('15/05/2025');
    expect(html).toContain('13 km²');
    expect(html).toContain('20/02/2026');
    expect(html).toContain('ren2020875.pdf');
    expect(html).toContain('ren20231070.pdf');
    expect(html).toContain('/assuntos/geracao/outorgas');
    expect(html).not.toContain('<li>');
  });
});
