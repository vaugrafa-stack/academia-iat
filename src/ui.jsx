// Componentes de apresentacao puros.
//
// Nao dependem de nada: recebem tudo por propriedade. E o modulo que
// faltava quando a primeira extracao levou o Suporte sem levar o
// PageHeader que ele usa, e o build passou mesmo assim.
import React, { useState } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';

export function PageHeader({title,subtitle,icon:Icon,kicker}){return <header className="page-header"><span><Icon/></span><div>{kicker&&<small className="ph-kicker">{kicker}</small>}<h1>{title}</h1><p>{subtitle}</p></div></header>}

export function Empty({text}){return <div className="empty-state"><BookOpen/><p>{text}</p></div>}

// Quadro ou tabela do POP. Veio de main.jsx quando a Biblioteca virou modulo
// proprio: a aula e a biblioteca renderizam a mesma tabela, entao a
// implementacao tem que ser uma so.
//
// Corta em 12 linhas por padrao porque quadro longo empurra o resto da pagina
// para fora da tela. Em `compact` (glossario filtrado) mostra tudo: la a lista
// JA e o resultado do filtro, e cortar de novo esconderia o que a pessoa
// acabou de procurar.
export function TableRenderer({ table, compact = false }) {
  const [all, setAll] = useState(false);
  const rows = compact || all ? table.rows : table.rows.slice(0, 12);
  return (
    <figure className="data-table">
      <figcaption>
        <span>
          {table.labelType} {table.labelNumber}
        </span>
        <strong>{table.title}</strong>
        <small>
          {table.rowCount} linhas × {table.columnCount} colunas
        </small>
      </figcaption>
      <div className="table-scroll">
        <table>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri} className={r.isHeader ? "header-row" : ""}>
                {r.cells.map((c, ci) => {
                  const Tag = r.isHeader ? "th" : "td";
                  return (
                    <Tag key={ci} scope={r.isHeader ? "col" : undefined}>
                      {c.text}
                    </Tag>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!compact && table.rows.length > 12 && (
        <button onClick={() => setAll((v) => !v)}>
          {all
            ? "Mostrar menos"
            : `Mostrar todas as ${table.rows.length} linhas`}
          <ChevronRight />
        </button>
      )}
    </figure>
  );
}
