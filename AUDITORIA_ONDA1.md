# Auditoria multiagente do parque IAT, onda 1

Rodada em 15/08/2026 sobre `iat_training` 8b855e9, `iat_area_tecnica` 2759828 e
`iat_contas` a89a81c. Doze dimensões planejadas, quatro nesta onda, três
concluídas. Cada achado passou por um refutador instruído a derrubar na dúvida.

Status honesto do que está aqui:

- **verificado por mim**: reproduzi eu mesmo, fora do agente
- **confirmado**: sobreviveu à refutação adversarial
- **sem refutação**: o refutador caiu no limite de uso, o achado não foi contestado
- **refutado**: derrubado, e registro por que, porque a razão é útil

---

## 1. Bloqueia: empreendimento real nomeado, publicado no ar

**Verificado por mim.** A legenda `public/media/aula/pop-section-172.vtt`, linha 10,
diz: "O exemplo de peticionamento da UHE Segredo em 2026 demonstra que formulário,
relatório textual, licença e documentos técnicos podem ser reunidos no SEI/IBAMA".

Confirmei que está servindo agora em
`https://vaugrafa-stack.github.io/academia-iat/media/aula/pop-section-172.vtt`,
resposta 200 com a expressão presente.

A mesma frase está em quatro lugares: `src/data/pop-content.json`,
`src/data/pop-public-content.json` (o que o site importa), a questão q211 de
`src/data/question-bank.json`, e narrada no vídeo `pop-section-172.mp4`.

E a origem é o próprio POP: confirmei uma ocorrência de "UHE Segredo" no
`POP_DLE_HID_001_v1.9_Linguagem_Operacional_Revisada.docx`.

Isso viola a restrição 1, e viola de forma agravada: não é só o nome de um
empreendimento real, é o nome amarrado a um peticionamento concreto, com ano e
sistema. Nenhum portão pegou, porque a política editorial verifica vocabulário
abolido e não nome próprio de empreendimento.

**Conserto**: trocar por referência genérica no POP, por exemplo "um peticionamento
de RTAA em 2026", regerar a extração, a questão, a legenda e o vídeo da seção 172.
Depois acrescentar nome de empreendimento ao conjunto que a política editorial
verifica, senão volta na próxima versão do documento.

**Como saber que funcionou**: `grep -rn "UHE Segredo" src/data public/media` sem
resultado, e o portão editorial reprovando se alguém reintroduzir.

---

## 2. Bloqueia: o filtro de privacidade apaga o CPF em vez de pseudonimizar

**Sem refutação.** `iat_area_tecnica/iat_area/privacidade.py`, linha 1441.

`_resolver_sobreposicoes` ordena candidatos por prioridade e descarta com `continue`
todo candidato sobreposto a um já escolhido. `numero_processo` é PRESERVAR com
prioridade 94; `cpf` é PSEUDONIMIZAR com prioridade 88. Quando os dois casam no
mesmo trecho, o CPF não é rebaixado, ele **some**: não entra em achados, não entra
na contagem por decisão, não gera impressão HMAC e não vira token.

O agente reproduziu: `analisar("Processo 111.444.777-35")` devolve o texto idêntico
à entrada e lista de achados vazia. Um CPF válido colado à palavra Processo passa
inteiro, e o relatório diz que nada foi encontrado.

**Conserto**: impedir que um candidato PRESERVAR suprima candidato sobreposto de
decisão diferente. A prioridade deve desempatar entre candidatos de mesma decisão,
não entre decisões.

---

## 3. Bloqueia: o portão de saída aprova CNPJ, protocolo e coordenada

**Sem refutação.** `iat_area_tecnica/iat_area/validacao_saida.py`, linha 1379.

`_validar_texto_com_motor` só reprova achado cuja decisão seja diferente de
PRESERVAR. Mas `cnpj`, `numero_processo` e `coordenada` são PRESERVAR **por
projeto**, porque essa decisão foi desenhada para o fluxo de ENTRADA, onde o dado é
necessário para trabalhar. O portão de SAÍDA reaproveita a mesma decisão como se
significasse "publicável".

Resultado: um artefato de saída com CNPJ e número de protocolo é aprovado e grava
`passed: true`.

Essa é a mesma classe de erro do item 1: um critério correto num contexto usado como
se valesse no outro.

**Conserto**: separar "necessário na área técnica" de "publicável". No portão de
saída, reprovar também cnpj, numero_processo e coordenada, em vez de derivar
publicabilidade da decisão de entrada.

---

## 4. Bloqueia: nome de pessoa em autoria de DOCX não é detectado

**Sem refutação.** `iat_area_tecnica/iat_area/privacidade.py`, linha 413.

O portão de saída aceita `docProps/core.xml`, `word/people.xml` e
`word/comments*.xml` no pacote DOCX, e o extrator acumula o XML bruto, então o nome
do autor chega íntegro ao motor. Só que o motor reconhece nome apenas quando o
rótulo pertence ao conjunto nome, nome_completo, responsavel, proprietario, titular,
representante. Não existe padrão para `creator`, `lastModifiedBy`, `author` nem
`initials`.

Ou seja, o nome que o Word grava sozinho em todo documento é justamente o que passa.

**Conserto**: acrescentar creator, lastmodifiedby e author aos rótulos reconhecidos e
criar padrão para valor de atributo `author="..."`, com decisão PSEUDONIMIZAR. Ou
remover essas partes do pacote quando o DOCX for de saída.

---

## 5. Degrada: o orçamento do acervo ignora substituição

**Confirmado, com correção de escopo importante.**
`iat_training/tools/media-governance-lib.mjs`, linha 353.

`validateCycles` monta o mapa por ciclo só com `action === 'add'`, e
`validateCycleBudgets` percorre apenas esse mapa. Substituição não encosta em
`maxApprovedGrowthBytes` nem em `maxApprovedGrowthFiles`. E o registrador escolhe a
ação por presença no baseline, que já tem as 784 entradas do acervo: **toda
regeneração de videoaula nasce como replace e é, por construção, fora do orçamento**.

O refutador corrigiu dois números do achado original, e a correção importa:

- os 70 MB citados são o tamanho dos arquivos substituídos, não crescimento. Somando
  o delta contra o baseline, 114 dos 195 replaces ficaram **menores**, e o
  crescimento real é de 0,81 MB. O risco é de capacidade futura, não exposição atual.
- o conserto na forma proposta reprovaria o repositório na hora, porque jogaria 236
  itens contra um teto de 80 arquivos. Só serve contar o **delta em bytes**, com piso
  zero, sem somar ao contador de arquivos.

Com o conserto certo, o ciclo 2026-08 fecha em 14,2 MB contra 20 MB e o CI segue
verde. O freio que resta hoje é só o teto por arquivo, 6 MB por MP4, o que permitiria
aprovar cerca de 880 MB de crescimento em silêncio num repositório público.

---

## 6. Degrada: o piso de 11px só enxerga pixel

**Confirmado, reproduzido pelo refutador.**
`iat_training/tools/check-tipografia.mjs`, linha 36.

A regex exige dígito seguido de `px`. Toda declaração em `rem`, `em`, `%`, `clamp()`
ou `min()` é invisível. Hoje escapam 18 declarações, e uma delas é
`.vls-stage .vls-video::cue { font-size: 78% }`, o tamanho da **legenda do vídeo**,
que é exatamente o texto de leitura corrida que o portão existe para proteger.

O refutador reproduziu: baixando uma regra de `.72rem` para `.5rem`, que dá 8px, o
portão imprime "OK: 723 tamanhos declarados, nenhum abaixo de 11px" e sai com zero.

O autoteste embutido no arquivo usa só `9px` e um comentário, então ele atesta
apenas o caso que já funciona.

**Conserto**: normalizar rem por 16 antes de comparar, e tratar `em` e `%` como aviso
de revisão manual, porque dependem do pai e não são resolvíveis estaticamente. E
acrescentar `.6rem` ao conjunto que o autoteste exige acusar.

---

## 7. Degrada: cabeçalhos de segurança não saem nas respostas de recusa

**Sem refutação.** `iat_area_tecnica/iat_area/app.py`, linha 1059.

`CabecalhosDeSeguranca` é o primeiro middleware registrado. Como `add_middleware`
insere no início da lista, o primeiro registrado vira o **mais interno**. Tudo
registrado depois fica por fora dele: limite de corpo, correlação de requisição,
limite de entrada e recusa de origem cruzada.

Toda resposta que esses middlewares produzem em curto-circuito escapa do carimbo. O
agente mediu: `GET /api/saude` devolve os 8 cabeçalhos; `POST /auth/sair` com origem
estranha devolve 403 com apenas content-length e content-type.

O docstring de `cabecalhos.py` afirma o contrário, que carimba "em TODA resposta,
inclusive as respostas que ninguém lembra de testar". É documentação prometendo
garantia que o código não dá.

**Conserto**: registrar esse middleware por último, para virar o mais externo.

---

## 8. Degrada: recusa de origem cruzada não gera log

**Sem refutação.** `iat_area_tecnica/iat_area/app.py`, linha 1143.

Mesma causa raiz do item 7: ordem de registro. `recusar_escrita_de_origem_cruzada` e
`limitar_entrada_antes_do_parser` ficam por fora do correlacionador, então quando
respondem em curto-circuito o bloco que emite o log estruturado nunca roda.

A consequência é específica: **tentativa de escrita vinda de outro site é o único
sinal observável de CSRF neste desenho, e ela desaparece do log**. Dá para varrer
todos os POST da API por semanas sem deixar registro.

---

## 9. Degrada: a chave que assina resultados deriva do segredo OIDC

**Sem refutação.** `iat_area_tecnica/iat_area/config.py`, linha 305.

Sem `IAT_AREA_RESULT_HMAC_SECRET`, a chave é derivada deterministicamente do
`client_secret` do OIDC. Essa chave é a única coisa que separa manifesto de resultado
autêntico de forjado. E o worker chega ao mesmo valor lendo o segredo OIDC do
ambiente ou de um arquivo local.

Duas funções distintas passam a depender de um segredo só: autenticar no provedor de
identidade e assinar resultado. Comprometer um compromete o outro, e rotacionar um
obriga a rotacionar o outro.

**Conserto**: tornar a variável dedicada obrigatória quando uploads estiverem
habilitados, como já é a de privacidade, e remover a derivação.

---

## 10. Degrada: um anônimo bloqueia o login de todo mundo

**Sem refutação.** `iat_area_tecnica/iat_area/sessao.py`, linha 461.

O limite de logins em curso é global, sem recorte por origem ou IP: 256 estados
ativos ou 60 por minuto. `GET /auth/entrar` não exige autenticação e insere um estado
a cada chamada, removido só quando o callback consome ou quando vence em cinco
minutos.

Sessenta requisições por minuto de um único cliente que nunca conclui o fluxo mantêm
as contagens estouradas e fazem toda tentativa legítima receber 429.

**Conserto**: cota por chave de origem, mantendo o teto global só como limite de
crescimento do banco, bem acima da cota individual.

---

## 11. Incomoda: a limpeza de cookie é ignorada pelo navegador

**Refutado em parte, mas o defeito é real.** `iat_area_tecnica/iat_area/sessao.py`,
linha 554.

As três funções de limpeza chamam `delete_cookie` sem passar `secure`. O padrão do
Starlette é `secure=False`, então o Set-Cookie de remoção sai sem o atributo. Os três
cookies usam prefixo `__Host-` e `__Secure-`, e a regra de prefixo manda o navegador
**descartar por inteiro** qualquer Set-Cookie com esses prefixos que não venha
marcado Secure.

Ou seja, o navegador ignora a remoção em silêncio. O logout parece funcionar do lado
do servidor e o cookie permanece no cliente.

**Conserto**: passar `secure`, `httponly` e `samesite` nas três chamadas.

---

## 12. Incomoda: o varredor de metadado binário decodifica em latin1

**Sem refutação.** `iat_training/tools/check-public-editorial-policy.mjs`, linha 141.

A lista de marcadores inclui um termo acentuado, e a leitura faz
`.toString('latin1')`. Metadado de MP4, JPEG e XMP é UTF-8 por especificação. O
acento em UTF-8 vira dois bytes que em latin1 formam outra coisa, então o marcador
acentuado **nunca pode casar**.

O marcador sem acento continua funcionando, o que torna a falha parcial e silenciosa.

**Conserto**: duas passadas sobre o mesmo buffer, latin1 e utf8, ou normalizar os
marcadores tirando acento antes de comparar.

---

## 13. Incomoda: a tolerância de linha longa mede um terço do acervo

**Sem refutação.** `iat_training/tools/check-videoaulas.mjs`, linha 88.

`TOLERANCIA_LINHA_LONGA = 8` é comparada com uma contagem que só acumula aulas do
gerador 3. O manifesto tem 168 aulas: 118 no gerador 2 e 50 no 3. Hoje há 3 linhas
longas no subconjunto medido e 588 no legado, que ninguém conta.

Duas consequências: cabem 5 regressões de segmentação sem sinal nenhum; e quando as
118 restantes migrarem para o gerador 3, a mesma taxa projeta cerca de 10 linhas,
acima da tolerância, reprovando quem fizer a migração por um defeito que já existia.

É o mesmo padrão dos portões que corrigimos hoje: contagem absoluta que envelhece.

**Conserto**: tolerância como taxa por linha examinada, e imprimir sempre o número,
que hoje só aparece quando estoura.

---

## O que foi refutado, e por quê

**"O portão do chutador mede um chutador que não existe."** O achado propunha trocar
a margem de 1.10 pela simulação literal do chutador que escolhe a maior alternativa.
O refutador foi ler o arquivo e encontrou, nas linhas 107 a 112, o registro de que a
primeira versão do portão fazia exatamente isso e **foi rejeitada de propósito**, por
medir formato de array em vez de percepção de quem responde. O conserto proposto era
a versão que o dono já testou e descartou.

Esse é o achado mais instrutivo da rodada, e ele caiu. Vale como lembrete de que
número que parece arbitrário às vezes é decisão registrada logo acima.

---

## O que esta onda não cobriu

Uma das quatro dimensões, **veracidade da documentação**, não chegou a rodar. As oito
restantes ficaram para as próximas ondas: bugs de execução na Academia,
acessibilidade, desempenho e orçamento, qualidade didática, fidelidade normativa,
arquitetura e manutenção, operação e CI, e o painel Streamlit.

Cinco refutações caíram junto, todas de achados de segurança. Eles estão marcados
como "sem refutação" acima, e devem ser lidos com essa ressalva: são plausíveis e bem
fundamentados, com reprodução descrita, mas ninguém tentou derrubá-los.

---

## Causa raiz repetida

Três dos treze achados são a mesma coisa em lugares diferentes: **um critério correto
num contexto sendo reaproveitado como se valesse em outro**.

A decisão PRESERVAR, que é certa na entrada da Área Técnica, vira "publicável" no
portão de saída. A ordem de registro de middleware, que é natural ler como "primeiro
é o mais externo", significa o contrário. A contagem de aulas com vídeo, que media
uma coisa, passou a medir outra quando o acervo migrou de gerador pela metade.

Vale mais consertar essa classe do que os casos, e o jeito de consertar a classe é
fazer o portão dizer por escrito o que ele mede e sobre qual população, em vez de
guardar um número.
