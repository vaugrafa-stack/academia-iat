export const PUBLIC_EDITORIAL_RULES = Object.freeze([
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
