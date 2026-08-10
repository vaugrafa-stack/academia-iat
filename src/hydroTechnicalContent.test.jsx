import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HydroGuide from './hydro.jsx';
import { PR_CASES, PRCasesSection } from './hydroCases.jsx';

describe('contratos técnicos do guia de hidrelétricas', () => {
  it('separa o critério ambiental do IAT do enquadramento setorial da ANEEL', () => {
    const pch = PR_CASES.find((item) => item.tipo.startsWith('PCH'));

    expect(pch.criterioAmbiental).toContain('reservatório de até 3 km²');
    expect(pch.criterioAmbiental).toContain('excluída a calha do leito regular');
    expect(pch.criterioAmbiental).toContain('objetivos diferentes da geração');
    expect(pch.criterioSetorial).toContain('5.000 kW');
    expect(pch.criterioSetorial).toContain('30.000 kW');
    expect(pch.criterioSetorial).not.toContain('3 km²');
    expect(pch.criterioSetorial).not.toContain('13 km²');
    expect(pch.criterioAlerta).toContain('13 km²');

    const html = renderToStaticMarkup(<PRCasesSection />);
    expect(html).toContain('Eixo ambiental IAT.');
    expect(html).toContain('Eixo setorial ANEEL.');
    expect(html).toContain('Não misture os critérios.');
  });

  it('usa fallbacks oficiais sem apresentar a fonte como prova de situação atual', () => {
    const baixoIguacu = PR_CASES.find((item) => item.nome === 'UHE Baixo Iguaçu');
    const bathCounty = PR_CASES.find((item) => item.nome.startsWith('Bath County'));

    expect(baixoIguacu.site).toContain('epe.gov.br');
    expect(baixoIguacu.dados).toContain('confirme a situação operacional atual');
    expect(bathCounty.site).toContain('energy.gov');
    expect(bathCounty.dados).toContain('não atesta a situação operacional atual');
  });

  it('explica potência, conexão e impactos sem atalhos deterministas', () => {
    const html = renderToStaticMarkup(<HydroGuide go={() => {}} />);

    expect(html).toContain('P = ρ · g · Q · H · η');
    expect(html).toContain('queda líquida disponível após as perdas');
    expect(html).toContain('rede de distribuição ou transmissão');
    expect(html).toContain('não significa impacto automaticamente menor');
    expect(html).toContain('não os definem sozinhos');
    expect(html).not.toContain('segue pela linha de transmissão');
    expect(html).not.toContain('O tamanho do reservatório define a operação e o impacto');
  });
});
