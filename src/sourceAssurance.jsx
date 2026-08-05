// Estado da fonte: versão do POP, arquivo de origem, data de extração e hash.
//
// Saiu de main.jsx junto com a extração da tela de aula. É usado nos dois
// lados da fronteira, no Início e dentro da aula, e componente compartilhado
// entre dois módulos não pode morar dentro de um deles.
//
// O que NÃO mudou: marcação, classes de estilo e texto. `popData` deixou de
// ser lido do escopo do módulo e passou a chegar por propriedade, que é a
// única diferença.
import React from "react";
import { ShieldCheck } from "lucide-react";

export default function SourceAssurance({ popData, lessonCount, compact = false }) {
  const op = popData.metadata?.operational || {};
  const sha = popData.source?.sha256 || popData.source?.hash || "";
  const sourceFileName =
    popData.source?.fileName || "Documento-fonte não identificado";
  const generated = popData.generatedAt ? new Date(popData.generatedAt) : null;
  const validDate = generated && !Number.isNaN(generated.getTime());
  return (
    <section
      className={"source-assurance " + (compact ? "compact" : "")}
      aria-label="Estado da fonte e da validação"
    >
      <ShieldCheck />
      <div>
        <small>FONTE DO PERCURSO</small>
        <strong>
          POP {op.version ? `v${op.version}` : "sem versão identificada"} ·{" "}
          {lessonCount} tópicos vinculados
        </strong>
        <span
          title={sourceFileName}
          aria-label={`Documento-fonte: ${sourceFileName}`}
        >
          {sourceFileName}
        </span>
      </div>
      <dl>
        <div>
          <dt>Extração</dt>
          <dd>
            {validDate
              ? generated.toLocaleDateString("pt-BR")
              : "data não registrada"}
          </dd>
        </div>
        <div>
          <dt>Integridade</dt>
          <dd>{sha ? `SHA-256 ${sha.slice(0, 10)}…` : "hash pendente"}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>Minuta técnica · validação institucional pendente</dd>
        </div>
      </dl>
    </section>
  );
}
