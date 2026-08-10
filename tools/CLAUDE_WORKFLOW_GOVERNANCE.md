# Governança de relatórios agregados do Claude

## Regra fail-closed

Um workflow não constitui evidência apenas porque o orquestrador gravou
`status: completed`. Antes de usar seu resultado em uma decisão, publicação,
push, merge, aprovação técnica ou declaração de auditoria concluída, valide o
arquivo persistido:

```powershell
python tools/validate_claude_workflow.py `
  "C:\caminho\para\workflows\wf_exemplo.json"
```

Quando o workflow possuir uma flag de liberação e ela também precisar estar
aprovada:

```powershell
python tools/validate_claude_workflow.py `
  "C:\caminho\para\workflows\wf_exemplo.json" `
  --require-release-approved
```

Qualquer código de saída diferente de zero bloqueia a ação. Não contorne o
bloqueio lendo somente `result`, `status` ou uma mensagem final do agregador.

## O que é verificado

- status final do workflow;
- quantidade mínima ou exata de agentes;
- correspondência entre `agentCount` e os registros de progresso;
- ausência de agentes em erro, cancelados ou sem estado de sucesso;
- ausência de erro terminal mesmo quando a linha diz `completed`;
- identidade única dos agentes e das lentes exigidas;
- evidência de execução por tokens e chamadas de ferramenta;
- igualdade entre os totais agregados e a soma das linhas de agente;
- resultado agregado não vazio;
- cobertura específica definida em `claude_workflow_policy.json`;
- coerência entre uma liberação declarada e as evidências anteriores.

Falha de agente, resultado vazio, cobertura incompleta, relatório ilegível ou
política inválida são sempre bloqueios. Ausência de achados pode ser um resultado
válido, mas somente quando a cobertura de auditoria estiver comprovada.

## Incidente de referência

O relatório histórico `wf_a9b798ef-685.json` registrou cinco agentes em erro por
limite de sessão e, ainda assim, retornou `liberadoParaEmpurrar: true`. O arquivo
histórico permanece intacto como evidência do incidente. O validador o reprova
com `AGENT_FAILED` e `FALSE_GREEN_RELEASE`.

## Testes

```powershell
python -m unittest tools.test_tooling
```

As políticas são versionadas separadamente do código para permitir cobertura
específica por workflow sem alterar os relatórios históricos.
