const LEARNING_PROFILES = [
  {
    id: "norma",
    pattern:
      /(referência|norma|lei|decreto|resolução|portaria|instrução|vigência|transição)/i,
    action:
      "localizar o fundamento citado, verificar vigência e transição e explicar como ele condiciona a análise",
    recognize:
      "Localize o ato, a regra específica e a posição que ele ocupa na hierarquia aplicável; diga também o que o POP apenas organiza.",
    apply:
      "Monte uma linha do tempo com protocolo, entrada em vigor, fase e regime aplicável antes de usar a regra no caso.",
    audit:
      "Confira fonte oficial, situação do ato, data de consulta, regra de transição e se a citação realmente sustenta a consequência adotada.",
    mastery: [
      "distingue fundamento normativo de orientação procedimental do POP",
      "registra vigência, transição, data de consulta e limite de aplicação",
      "liga artigo ou regra à consequência concreta sem criar norma própria",
    ],
    risk:
      "aplicar regra revogada, fora do período de transição ou acima de sua hierarquia",
  },
  {
    id: "competencia",
    pattern:
      /(competência|delegação|act|rtaa|aneel|ibama|iphan|município|interveniente)/i,
    action:
      "distinguir competência originária, execução delegada e interface institucional, registrando o fundamento antes do mérito",
    recognize:
      "Identifique qual órgão decide, qual apenas se manifesta e qual evidência comprova delegação, anuência, ciência ou ato setorial.",
    apply:
      "Separe objeto ambiental, setorial e institucional; depois registre o ato exigível, o responsável e o limite da atuação do IAT.",
    audit:
      "Teste se a manifestação pertence ao mesmo empreendimento, fase e período e se a conclusão invadiu ou omitiu competência externa.",
    mastery: [
      "identifica órgão, ato, objeto, fase e fundamento da competência",
      "compatibiliza manifestações sem presumir que uma substitui a outra",
      "explicita limites, pendências e encaminhamento institucional",
    ],
    risk:
      "substituir decisão de outro órgão ou usar uma interface externa como aprovação ambiental automática",
  },
  {
    id: "enquadramento",
    pattern:
      /(consulta prévia|enquadramento|modalidade|porte|potência|alagamento|ida|dlam|lac|las)/i,
    action:
      "enquadrar fase e modalidade pelo conjunto de critérios, sem confundir orientação preliminar com decisão de viabilidade",
    recognize:
      "Liste tipologia, potência, alagamento, IDA, localização, supressão, fase e restrições capazes de alterar o rito.",
    apply:
      "Aplique primeiro os critérios objetivos e depois o conjunto locacional e ambiental mais restritivo, registrando memória de cálculo e exceções.",
    audit:
      "Refaça o enquadramento com as fontes originais e procure dados divergentes, regra especial ou sensibilidade que tenha sido omitida.",
    mastery: [
      "reconstrói o enquadramento com valores, fontes e regra vigente",
      "separa modalidade adequada de suficiência documental e mérito",
      "registra exceções e incertezas sem transformar triagem em licença",
    ],
    risk:
      "escolher o rito apenas pelo nome ou pelo critério numérico menos restritivo",
  },
  {
    id: "documentos",
    pattern:
      /(document|triagem|checklist|suficiência|protocolo|recebimento|histórico|memorial|estudo|relatório|pba|pca|ras|eia|rima|rdpa|rca|rce)/i,
    action:
      "classificar exigibilidade, apresentação, compatibilidade e suficiência de cada evidência, justificando toda lacuna",
    recognize:
      "Diferencie documento existente de documento aplicável, íntegro, atual, compatível e suficiente para a decisão da fase.",
    apply:
      "Confronte autoria, objeto, versão, data, ART, conteúdo mínimo e coerência com os demais autos antes de classificar o item.",
    audit:
      "Procure troca de empreendimento, versão superada, dado sem fonte, contradição interna e conclusão que o conteúdo apresentado não permite.",
    mastery: [
      "separa exigível, apresentado, válido, compatível e suficiente",
      "indica a evidência examinada e a consequência técnica da lacuna",
      "evita aprovar por presença formal ou rejeitar sem nexo com a decisão",
    ],
    risk:
      "tratar arquivo protocolado como prova suficiente sem examinar conteúdo e compatibilidade",
  },
  {
    id: "cartografia",
    pattern:
      /(cartograf|mapa|coordenad|ada|app|kmz|kml|geoespacial|flora|fauna|recursos hídricos|supressão)/i,
    action:
      "conferir consistência espacial, escala e completude das evidências e apontar o efeito técnico de cada lacuna territorial",
    recognize:
      "Identifique quais estruturas e áreas precisam de ponto, linha ou polígono e quais bases oficiais devem ser cruzadas.",
    apply:
      "Compare sistema de referência, coordenadas, arquivos vetoriais, mapas, áreas e valores declarados; registre cada interferência e sua fonte.",
    audit:
      "Tente reproduzir o mapa e as áreas calculadas, procurando geometrias ausentes, deslocadas, incompatíveis ou sem metadados.",
    mastery: [
      "delimita o arranjo integral com geometria adequada a cada estrutura",
      "cruza bases oficiais e registra data, escala, fonte e limitação",
      "relaciona a lacuna espacial ao impacto e à impossibilidade de concluir",
    ],
    risk:
      "decidir APP, supressão ou restrição territorial a partir de ponto isolado ou mapa não reproduzível",
  },
  {
    id: "uc",
    pattern:
      /(unidade de conserva|apa|plano de manejo|zona de amortecimento|escarpa)/i,
    action:
      "confrontar categoria, ato de criação, incidência espacial, zoneamento e Plano de Manejo antes de concluir compatibilidade",
    recognize:
      "Localize UC, categoria, esfera, ato de criação, limites, zona de amortecimento e existência de Plano de Manejo.",
    apply:
      "Sobreponha o arranjo integral ao zoneamento vigente e identifique regra, uso permitido, restrição e manifestação cabível para a fase.",
    audit:
      "Verifique versão e fonte do Plano de Manejo, precisão dos limites e se a regra usada corresponde à zona realmente interceptada.",
    mastery: [
      "distingue estar dentro, na zona de amortecimento ou apenas no entorno",
      "liga zona e regra do Plano de Manejo à estrutura atingida",
      "separa triagem, manifestação e decisão de compatibilidade",
    ],
    risk:
      "presumir autorização ou impedimento apenas pela proximidade da UC, sem ler categoria e zoneamento",
  },
  {
    id: "pacuera",
    pattern:
      /(pacuera|reservatório|uth|entorno|zoneamento|participação social)/i,
    action:
      "avaliar diagnóstico, UTHs, zoneamento, participação e implementação do PACUERA como sistema contínuo de gestão territorial",
    recognize:
      "Identifique exigibilidade, área de estudo, diagnóstico integrado, UTHs, zonas, usos consolidados, participação e governança.",
    apply:
      "Teste se cada regra de uso decorre do diagnóstico e da UTH correspondente e se há responsáveis, indicadores, cronograma e revisão.",
    audit:
      "Procure zona sem justificativa, conflito entre mapa e texto, participação meramente formal e medida sem mecanismo de implementação.",
    mastery: [
      "conecta diagnóstico, fragilidade, potencialidade, UTH e regra de uso",
      "verifica cartografia, participação social e tratamento de conflitos",
      "avalia implementação, indicador, responsável, monitoramento e revisão",
    ],
    risk:
      "aprovar um plano ilustrativo que não possa orientar nem acompanhar os usos do entorno",
  },
  {
    id: "pendencia",
    pattern:
      /(condicionante|diligência|pendência|complementação|indeferimento|conclusão)/i,
    action:
      "separar lacuna sanável, impedimento material e condicionante verificável, escolhendo encaminhamento proporcional",
    recognize:
      "Descreva a lacuna, o fundamento, a evidência ausente e a consequência sobre a decisão antes de nomear a saída.",
    apply:
      "Pergunte se a informação é necessária antes da conclusão, se pode ser sanada e se existe base suficiente para uma obrigação futura verificável.",
    audit:
      "Teste nexo, clareza, proporcionalidade, prazo, forma de comprovação e se uma lacuna crítica foi indevidamente empurrada para condicionante.",
    mastery: [
      "distingue diligência prévia, impedimento, condicionante e recomendação",
      "redige lacuna, fundamento, consequência e providência de forma única",
      "define condição mensurável sem antecipar conclusão insegura",
    ],
    risk:
      "usar condicionante para suprir informação essencial que deveria existir antes da decisão",
  },
  {
    id: "produto",
    pattern:
      /(informação técnica|parecer|redação|assinatura|qualidade|rastreabilidade|título|numeração|sumário|navegação|formatação|anexo)/i,
    action:
      "construir e auditar um produto técnico que conecte evidência, fundamento, consequência e encaminhamento",
    recognize:
      "Identifique objeto, histórico, documentos, método, achados, limitações, conclusão e responsável que precisam aparecer no produto.",
    apply:
      "Redija cada achado em cadeia verificável — fato, evidência, critério, análise, consequência e saída — mantendo versões e referências.",
    audit:
      "Faça leitura adversarial de coerência entre corpo, quadros, pendências, condicionantes, conclusão, anexos e assinatura.",
    mastery: [
      "mantém objeto, fase, titular e versões consistentes em todo o produto",
      "liga cada conclusão às evidências e fundamentos realmente examinados",
      "registra revisão, limitações, pendências e responsável sem contradição",
    ],
    risk:
      "entregar texto formalmente correto, mas impossível de reproduzir ou contraditório com os autos",
  },
  {
    id: "fase",
    pattern:
      /(\blp\b|licença prévia|\bli\b|licença de instalação|\blo\b|operação|renovação|regularização|transferência|alteração|repotenciação)/i,
    action:
      "distinguir o objeto da fase, confrontar o autorizado com a evidência atual e motivar o próximo ato",
    recognize:
      "Defina o que a fase pode decidir, quais atos anteriores a condicionam e qual evidência demonstra o estado atual do empreendimento.",
    apply:
      "Compare pedido, licença anterior, projetos, execução, condicionantes e fatos novos, sem antecipar autorização pertencente à fase seguinte.",
    audit:
      "Procure alteração material, licença vencida, objeto divergente, condicionante sem prova e conclusão incompatível com a fase.",
    mastery: [
      "delimita objeto, alcance e limite decisório da fase",
      "confronta autorizado, executado, comprovado e fato novo",
      "motiva continuidade, diligência, reanálise ou decisão proporcional",
    ],
    risk:
      "usar a fase errada para convalidar obra, operação ou impacto ainda não analisado",
  },
];

const DEFAULT_PROFILE = {
  id: "metodo",
  action:
    "explicar o critério central da seção, aplicá-lo a uma evidência e justificar um encaminhamento proporcional",
  recognize:
    "Explique com suas palavras qual problema a seção resolve e localize no POP a evidência que sustenta essa explicação.",
  apply:
    "Separe fato, documento, fundamento, suficiência e lacuna; só então proponha o próximo passo.",
  audit:
    "Defenda ou conteste a decisão, explicite limitações e diga qual evidência nova poderia alterar o encaminhamento.",
  mastery: [
    "identifica a evidência usada sem confundir presença com suficiência",
    "relaciona o critério da seção à consequência técnica",
    "registra incerteza, fonte e encaminhamento de forma auditável",
  ],
  risk: "transformar uma etapa de verificação em formalidade sem efeito técnico",
};

const CLEAN_PREFIX = /^\s*(?:\d+(?:\.\d+)*\.?\s*)?/;

function normalizedTitle(lesson) {
  return String(lesson?.title || "").replace(CLEAN_PREFIX, "").trim();
}

function learningProfile(lesson) {
  const haystack = `${lesson?.number || ""} ${normalizedTitle(lesson)}`;
  return (
    LEARNING_PROFILES.find((profile) => profile.pattern.test(haystack)) ||
    DEFAULT_PROFILE
  );
}

function meaningfulParagraph(blocks = []) {
  return blocks
    .filter(
      (block) =>
        block?.type === "paragraph" &&
        block.paragraph?.text &&
        !block.paragraph?.headingLevel,
    )
    .map((block) => block.paragraph.text.replace(/\s+/g, " ").trim())
    .find(
      (text) => text.length >= 45 && !/^(quadro|tabela|figura)\s+\d/i.test(text),
    );
}

export function getLearningDesign(lesson, blocks = []) {
  const title = normalizedTitle(lesson) || "esta seção";
  const profile = learningProfile(lesson);
  const sourceBasis = meaningfulParagraph(blocks);
  const section = lesson?.number
    ? `seção ${lesson.number}`
    : "seção introdutória";

  return {
    profileId: profile.id,
    objective: `Ao final, você conseguirá ${profile.action}, usando os critérios da ${section}.`,
    levels: [
      {
        id: "iniciante",
        label: "Reconhecer",
        description: profile.recognize,
      },
      {
        id: "aplicacao",
        label: "Aplicar",
        description: profile.apply,
      },
      {
        id: "especialista",
        label: "Auditar",
        description: profile.audit,
      },
    ],
    mastery: [...profile.mastery],
    challenge: `Em um processo relacionado a “${title}”, registre um fato que precisa ser confirmado, a evidência necessária, o fundamento aplicável e o encaminhamento se a evidência faltar. Mostre como evitaria ${profile.risk}.`,
    sourceBasis: sourceBasis
      ? sourceBasis.slice(0, 360) + (sourceBasis.length > 360 ? "…" : "")
      : "Esta é uma seção de organização. Use os subtópicos vinculados como base para a atividade.",
  };
}

export function learningDesignFingerprint(design) {
  return [
    design.profileId,
    design.objective,
    ...design.levels.map((level) => level.description),
    ...design.mastery,
    design.challenge,
  ].join("|");
}
