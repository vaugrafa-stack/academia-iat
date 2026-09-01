// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { GeoprDetalhesDaConsulta } from './geoprPainel.jsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  document.body.replaceChildren();
});

describe('painel de detalhes do GeoPR', () => {
  it('limita a expansao visual, informa o restante e usa uma unica regiao viva', async () => {
    const achados = Array.from({ length: 15 }, (_, indice) => ({
      camada: 'Subcamada de teste',
      origem: {
        id: `camada-${indice}`,
        titulo: `Camada ${indice + 1}`,
        fonte: 'IAT',
        caminho: `00_PUBLICACOES/camada_${indice + 1}`,
        paraQue: 'Explica a feição consultada.',
      },
      valores: [
        { chave: 'NOME', valor: `Feição ${indice + 1}` },
        { chave: 'TIPO', valor: 'Ponto' },
      ],
      ocultos: 0,
      omitidos: 0,
    }));
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);

    await act(async () => {
      root.render(
        <GeoprDetalhesDaConsulta
          aoFechar={() => {}}
          consulta={{ estado: 'pronto', achados, falhas: 0, consultadoEm: '2026-08-27T12:00:00Z' }}
        />,
      );
    });

    expect(host.querySelectorAll('.gp-atributos article')).toHaveLength(12);
    expect(host.querySelector('.gp-atributos > .gp-atributos-topo h2')?.textContent)
      .toBe('Detalhes do ponto');
    expect(host.querySelector('.gp-atributos article h3')?.textContent).toBe('Feição 1');
    expect(host.querySelector('.gp-atributos h4')).toBeNull();
    expect(host.textContent).toContain('3 resultados adicionais não foram expandidos');
    expect(host.textContent).toContain('Serviço oficial: 00_PUBLICACOES/camada_1');
    expect(host.querySelectorAll('.gp-atributos [aria-live="polite"]')).toHaveLength(1);

    await act(async () => root.unmount());
  });
});
