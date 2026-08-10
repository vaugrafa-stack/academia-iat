# Auditoria de evolução para a meta 10/10 — 10/08/2026

## Situação

Esta auditoria registra o candidato local integralmente validado em 10/08/2026.
Ela não declara nota 10/10 absoluta, não substitui validação humana e não
comprova publicação. Commit, push, workflow público e conferência do SHA em
produção permanecem como o último gate operacional.

O objetivo foi melhorar simultaneamente arquitetura, desempenho,
acessibilidade, experiência de uso, conteúdo técnico e desenho das avaliações,
sem enfraquecer a rastreabilidade já existente.

## Método e evidências

A revisão combinou:

1. contratos automatizados de arquitetura e orçamento do artefato;
2. testes unitários, funcionais, editoriais, de segurança e governança;
3. automação do artefato em navegador real;
4. inspeção visual em desktop e mobile;
5. auditoria dos dados pedagógicos das 213 questões.

| Frente | Entrega | Evidência final | Estado |
|---|---|---|---|
| Arquitetura | Formação fora de `main.jsx` e carregada sob demanda | contrato e testes próprios da rota | Validado localmente |
| Manutenção | `main.jsx` reduzido para 65.935 bytes e 2.039 linhas | medição do candidato integrado | Validado localmente |
| Desempenho | CSS inicial separado, sete folhas de rota consolidadas e perfil lazy | 181,3/32,5 KiB inicial; 236,5/43,0 KiB total | Validado localmente |
| Formação | fundação iniciante, componentes, tipologias, siglas e atalho experiente | testes de conteúdo e navegador | Validado localmente; piloto humano pendente |
| Hidrelétricas | conteúdo técnico corrigido e navegação local estável | testes unitários e Playwright desktop/mobile | Validado localmente; revisão técnica humana pendente |
| Avaliações | metadados pedagógicos e feedback de distratores em 213 questões | banco determinístico e contratos | Validado localmente; revisão psicométrica pendente |
| Acessibilidade | auditoria E2E sobre 13 rotas e cinco larguras | 29 cenários Playwright aprovados | Validado localmente; prova humana pendente |
| Qualidade | aplicação, PWA, tooling e dependências | 493 testes, PWA, 25 testes Python e auditoria sem CVEs conhecidos | Validado localmente |
| Publicação | identidade do artefato por SHA | workflow já existente | Pendente até conferência online |

## 1. Arquitetura e carregamento

- A tela Formação passou a residir em `src/formacao.jsx` e usa `lazy`.
- Pesquisa, estado sem resultado, limpeza do filtro, expansão de módulo e
  abertura de aula possuem testes próprios.
- A folha móvel sai do caminho bloqueante no desktop e é carregada quando a
  largura a torna necessária.
- CSS exclusivo de perfil, conta, histórico e erro foi retirado da
  inicialização.
- Sete folhas lazy foram consolidadas em um pacote de rota, melhorando
  compressão e cache sem remover regras.

O compositor ainda pode ser decomposto por domínios, mas qualquer extração deve
preservar os contratos de navegação, acessibilidade, offline e orçamento.

## 2. Orçamento e desempenho

| Métrica | Limite | Candidato final |
|---|---:|---:|
| CSS inicial bruto | 190 KiB | 181,3 KiB |
| CSS inicial compactado | 35 KiB | 32,5 KiB |
| CSS total bruto | 240 KiB | 236,5 KiB |
| CSS total compactado | 46 KiB | 43,0 KiB |
| JavaScript total bruto | 850 KiB | 710,6 KiB |
| JavaScript total compactado | 270 KiB | 237,4 KiB |

O artefato contém 35 chunks JavaScript. O CSS total continua próximo do limite
bruto; o limite não deve ser elevado para acomodar regressão sem uma análise
documentada de custo e benefício.

## 3. Formação e didática para iniciantes

A rota Formação agora explica, antes do percurso normativo:

- o caminho água → vazão e queda → turbina → gerador → rede;
- os principais componentes e sua função;
- tipologias e diferenças conceituais;
- siglas essenciais e limites de uso do material;
- um ponto de entrada para iniciantes e um atalho para quem já domina a base.

Nas aulas, siglas encontradas em título, parágrafos, blocos e tabelas são
deduplicadas. Em telas estreitas, o glossário também aparece em bloco expansível
acessível dentro do conteúdo, em vez de desaparecer com a coluna lateral.

## 4. Hidrelétricas e precisão técnica

O guia passou a explicitar:

- `P = ρ·g·Q·H·η`, usando queda líquida, perdas e rendimento global;
- que arranjo a fio d'água ou com reservatório não determina sozinho a magnitude
  do impacto;
- conexão à rede de distribuição ou transmissão conforme o ponto de acesso;
- separação entre o critério ambiental do IAT e a classificação setorial da
  ANEEL, sem misturar área de reservatório com potência instalada;
- fontes oficiais estáveis, sem afirmar situação operacional atual quando a
  evidência consultada não sustenta essa conclusão.

A navegação local materializa a geometria das seções antes do deslocamento,
mantém o título visível sob a barra fixa e foi testada em desktop e 390 px.

## 5. Avaliações e desenho pedagógico

As 213 questões receberam:

- objetivo observável;
- nível cognitivo;
- dificuldade estrutural e seus sinais;
- prioridade de remediação;
- feedback para cada distrator;
- estado interno explícito de revisão especializada pendente.

| Dimensão | Distribuição |
|---|---|
| Nível cognitivo | 4 recordar; 168 compreender; 32 aplicar; 9 analisar |
| Dificuldade estrutural | 162 introdutórias; 48 intermediárias; 3 avançadas |
| Prioridade de remediação | 72 regular; 73 média; 68 alta |

“Dificuldade” é classificação editorial da estrutura, não medida psicométrica.
A concentração em compreensão mostra que futuras expansões devem priorizar
aplicação, integração de evidências e justificativa, com qualidade e piloto,
em vez de apenas aumentar a quantidade.

## 6. Acessibilidade, contraste e navegação

O portão permanente percorre 13 rotas e verifica:

- exatamente um título principal visível;
- idioma e título do documento;
- nomes acessíveis em controles;
- alvos efetivos de pelo menos 44 × 44 px;
- campos móveis com pelo menos 16 px;
- identificadores duplicados, imagens sem texto alternativo e saltos de título;
- overflow horizontal, tela quebrada e erros de runtime.

Contrastes problemáticos em avaliações, navegação móvel, navegação do guia e
ações de primeiro acesso foram reforçados. A bateria final aprovou 29 cenários
em desktop e nas larguras 320, 360, 390 e 430 px; um caso exclusivamente móvel
foi corretamente ignorado no projeto desktop.

A inspeção manual encontrou uma rota incorreta no botão de fundamentos. O erro
foi corrigido e a regressão agora cobre clique, destino e recarga direta.

Automação não substitui leitor de tela real, zoom a 200%, dispositivo físico,
baixa conectividade nem teste com pessoas com deficiência.

## 7. Bateria final

Passaram no candidato integrado:

```powershell
pnpm test
pnpm build
pnpm audit --prod
pnpm test:e2e:artifact
pnpm test:e2e:pwa:local
python -B -m unittest tools/test_tooling.py
```

Resultados:

- 60 arquivos e 493 testes de aplicação aprovados;
- todos os gates encadeados de conteúdo, segurança, privacidade, fontes, mídia,
  CSS, pedagogia e smoke aprovados;
- 29 cenários Playwright aprovados e um skip intencional;
- um cenário PWA/offline aprovado;
- 25 testes das ferramentas Python aprovados;
- nenhuma vulnerabilidade conhecida nas dependências de produção;
- `git diff --check` sem erro de whitespace.

## 8. Portões humanos não delegáveis

1. **Normativo:** confirmar fonte oficial, vigência, transição, competência e
   aplicação das 60 referências e de qualquer conclusão sensível.
2. **Técnico:** revisar casos, rubricas, feedbacks e exemplos com profissionais
   habilitados nos domínios envolvidos.
3. **Editorial:** revisar clareza, ambiguidade, pistas de resposta e linguagem.
4. **Psicométrico:** pilotar, medir dificuldade e discriminação reais e calibrar
   critérios antes de interpretar desempenho.
5. **Acessibilidade e usabilidade:** testar tecnologias assistivas, zoom,
   dispositivos e pessoas representativas.
6. **Institucional:** aprovar finalidade, governança e limites antes de tratar a
   plataforma como treinamento oficial, certificação ou suporte a processo real.

## Conclusão

O candidato avança de forma mensurável rumo à meta 10/10: reduz acoplamento e
custo inicial, melhora o ponto de entrada do leigo, corrige conteúdo técnico,
torna a avaliação inspecionável e amplia a prova automatizada de acessibilidade.
A formulação responsável é:

> **Academia IAT em evolução para a meta 10/10, com candidato local de
> 10/08/2026 integralmente validado e aguardando publicação verificável.**
