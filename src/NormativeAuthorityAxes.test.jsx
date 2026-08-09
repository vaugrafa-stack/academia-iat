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
    expect((html.match(/Fonte principal/g) || [])).toHaveLength(3);
  });
});
