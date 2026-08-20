export const PUBLIC_EDITORIAL_RULES = Object.freeze([
  {
    // Empreendimento real nomeado. A regra e antiga e nada verificava: a v1.9 do
    // POP trouxe uma usina citada pelo nome e amarrada a um peticionamento
    // concreto, com ano e sistema, e a frase chegou ao site, a legenda publicada,
    // ao banco de questoes e ao video narrado sem que um portao dissesse nada.
    // O nome nao se repete aqui de proposito: este arquivo tambem e publico.
    //
    // Casa a sigla de tipologia seguida de nome proprio na MESMA linha. Nao casa
    // a sigla sozinha, que aparece o tempo todo em texto tecnico legitimo, nem
    // a expansao da sigla em glossario ("CGH, Central Geradora Hidreletrica"),
    // porque essas palavras estao na lista de excecao abaixo.
    label: 'empreendimento nomeado removido da apresentacao publica',
    pattern: new RegExp(
      String.raw`\b(?:UHE|PCH|CGH|MGH|MCH)[ ]+(?!` +
        [
          'Central', 'Centrais', 'Pequena', 'Pequenas', 'Micro', 'Mini',
          'Microcentral', 'Minicentral', 'Minigeradora', 'Aproveitamento',
          'Potencia', 'Pot[êe]ncia', 'Consulta', 'Usina', 'Usinas',
        ].join('|') +
        String.raw`)[A-ZÀ-Ü][\p{L}]+`,
      'u',
    ),
    // Citação técnica de engenharia sobre usina conhecida, usada para ensinar
    // qual turbina serve a qual queda. É conhecimento público de livro-texto,
    // e não dado de processo em análise, que é o que a regra existe para
    // impedir. Cada linha aqui é uma permissão consciente e revisável.
    //
    // A DECIDIR: as duas últimas trazem nome, rio e município juntos, o que é
    // mais do que citação técnica. Estão listadas para ficarem visíveis, não
    // porque a questão esteja resolvida.
    excecoes: [
      'UHE Gov. Parigot de Souza',
      'UHE Gov. Pedro Viriato Parigot de Souza',
      'UHE Gov. Bento Munhoz da Rocha Netto',
      'UHE Parigot de Souza',
      'UHE Foz do Areia',
      'UHE Baixo Iguaçu',
      'PCH Bela Vista',
      'CGH São Francisco de Sales',
    ],
    sourceMaterial: true,
  },
  {
    label: 'classificacao de achado removida da apresentacao publica',
    pattern: /\b(?:gravidades?|graves?|severidades?|sever[oa]s?|severamente|criticidades?|cr[ií]tic(?:o|a|os|as)|gravity|gravities|severity|severities|severe|severely|criticality|criticalities|critical)\b/iu,
    sourceMaterial: true,
  },
  {
    label: 'enquadramento substituido por efeito e encaminhamento',
    pattern: /\b(?:(?:baix[oa]s?|low)[\s-]+(?:riscos?|impactos?|potencia(?:l|is)|risks?|impacts?|potentials?)|(?:riscos?|impactos?|potencia(?:l|is)|risks?|impacts?|potentials?)[\s-]+(?:baix[oa]s?|low))\b/iu,
    sourceMaterial: true,
  },
  {
    label: 'sigla removida da apresentação pública',
    pattern: /\b(?:IA|AI)\b/u,
  },
  {
    label: 'expressão removida da apresentação pública',
    pattern: /intelig[êe]ncia artificial/iu,
  },
  {
    label: 'expressão removida da apresentação pública',
    pattern: /artificial intelligence/iu,
  },
  {
    label: 'produto ou sigla do mesmo tema removido',
    pattern: /\b(?:ChatGPT|GPT(?:-\d+)?|LLM)\b/iu,
    builtPattern: /\b(?:ChatGPT|GPT(?:-\d+)?|LLM)\b/u,
  },
  {
    label: 'expressão correlata removida da apresentação pública',
    pattern: /\b(?:modelos? de linguagem|large language models?|machine learning|aprendizado de máquina)\b/iu,
  },
  {
    label: 'formulação editorial substituída',
    pattern: /\b(?:revisão|validação|autoria|aprovação|conferência|avaliação)(?:\s+técnica)?\s+humana\b/iu,
  },
]);

export function editorialPatternFor(rule, { builtArtifact = false } = {}) {
  return builtArtifact && rule.builtPattern ? rule.builtPattern : rule.pattern;
}

export function firstEditorialViolation(text, options = {}) {
  for (const rule of PUBLIC_EDITORIAL_RULES) {
    const match = editorialPatternFor(rule, options).exec(text);
    if (match) return { rule, match };
  }
  return null;
}
