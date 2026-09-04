// Guia do empreendedor e da consultoria.
//
// Rota de consulta, e nao de treinamento: sem exercicio, sem questao, sem
// pontuacao e sem progresso. Quem chega aqui esta desenvolvendo um
// empreendimento e precisa de resposta, nao de percurso.
//
// A navegacao local repete a forma da aba de hidreletricas porque o problema e
// o mesmo, guia longo com secoes independentes, mas ela e deliberadamente mais
// simples: leva a secao e devolve o foco, sem barra de leitura nem calculo de
// secao ativa por rolagem. Aquela maquinaria existe la porque o guia e um
// percurso; aqui ela seria estado a manter sem pergunta que responda.
//
// As regras de conteudo estao no cabecalho de `empreendedorGuia.js`, e a
// primeira delas governa a secao de documentos: o POP nao cria exigencia.
import React from 'react';
import {
  AlertTriangle, Building2, CircleHelp, Compass, Droplets, ExternalLink,
  FileText, Landmark, Layers3, ListChecks, Scale, Users, Zap,
} from 'lucide-react';
import {
  CUSTA_PRAZO,
  EMPREENDEDOR_SECOES,
  MODALIDADES,
  ONDE_ESTA_A_EXIGENCIA,
  PAPEIS_EMPREENDIMENTO,
  TRILHO_AMBIENTAL,
  TRILHO_SETORIAL,
} from './empreendedorGuia.js';
import NormativeAuthorityAxes from './NormativeAuthorityAxes.jsx';
import './empreendedor.css';

function NavegacaoLocal() {
  const irPara = (id) => {
    const alvo = document.getElementById(id);
    if (!alvo) return;
    const reduzido = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    alvo.scrollIntoView({ block: 'start', behavior: reduzido ? 'auto' : 'smooth' });
    // O foco vai junto: sem isso, quem navega por teclado continua no topo e
    // a proxima tabulacao volta para o inicio do guia.
    alvo.focus({ preventScroll: true });
  };
  return (
    <nav className="emp-nav" aria-label="Seções deste guia">
      <span className="emp-nav-rotulo">Neste guia</span>
      <div className="emp-nav-links">
        {EMPREENDEDOR_SECOES.map((secao) => (
          <button key={secao.id} type="button" onClick={() => irPara(secao.id)}>
            {secao.rotulo}
          </button>
        ))}
      </div>
    </nav>
  );
}

function Secao({ id, titulo, resumo, icone: Icone, children }) {
  return (
    <section className="emp-secao" id={id} tabIndex="-1">
      <div className="section-title">
        <div>
          <h2>{titulo}</h2>
          {resumo && <p>{resumo}</p>}
        </div>
        <Icone aria-hidden="true" />
      </div>
      {children}
    </section>
  );
}

export default function GuiaEmpreendedor({ go }) {
  return (
    <div className="page emp-page">
      <header className="page-header">
        <span><Building2 /></span>
        <div>
          <small className="ph-kicker">Empreendedor e consultoria</small>
          <h1>Guia de quem desenvolve o empreendimento</h1>
          <p>
            Quem decide o quê, em que ordem os atos acontecem e onde está escrita cada
            exigência. Escrito do lado de quem apresenta, e não de quem analisa.
          </p>
        </div>
      </header>

      <div className="emp-aviso" role="note">
        <AlertTriangle size={18} aria-hidden="true" />
        <div>
          <strong>Leia antes de usar</strong>
          <p>
            Este é um ambiente independente de treinamento. Ele não é canal oficial, não
            substitui a orientação do órgão e não antecipa decisão de processo. O documento
            que organiza o método de análise é uma minuta pendente de validação técnica e
            institucional, e a vigência de cada norma citada precisa ser confirmada na fonte
            oficial, na data do seu protocolo.
          </p>
        </div>
      </div>

      <NavegacaoLocal />

      <Secao
        id="emp-competencias"
        titulo="Quem decide o quê"
        resumo="Três autoridades, três decisões diferentes. Nenhuma delas substitui a outra, e o que cada uma não decide está escrito junto."
        icone={Scale}
      >
        <NormativeAuthorityAxes />
      </Secao>

      <Secao
        id="emp-enquadramento"
        titulo="Duas réguas de enquadramento, e elas podem divergir"
        resumo="A faixa ambiental do IAT e a faixa setorial da ANEEL são critérios distintos, aplicados por autoridades distintas."
        icone={Compass}
      >
        <p className="emp-texto">
          O mesmo empreendimento tem um enquadramento ambiental e um enquadramento setorial.
          Eles usam a potência, mas não são a mesma régua, e podem levar a siglas diferentes
          para o mesmo projeto. Ler um pelo outro é a origem de boa parte das divergências que
          aparecem no processo.
        </p>
        <p className="emp-texto">
          O critério ambiental está na Instrução Normativa IAT nº 09/2025 e considera, além da
          potência, o reservatório. O critério setorial segue o regime da Resolução Normativa
          ANEEL nº 875/2020, com a redação dada pela Resolução Normativa ANEEL nº 1.070/2023.
          As faixas de cada eixo, com o ato e o endereço oficial, estão na seção anterior.
        </p>
        <p className="emp-texto emp-alerta">
          Não transporte um número encontrado em página geral para o critério do outro eixo.
          Confirme cada faixa no ato que a estabelece e na versão vigente na data do protocolo.
        </p>
      </Secao>

      <Secao
        id="emp-ordem"
        titulo="A ordem dos atos"
        resumo="Os dois trilhos correm em paralelo. A ordem dentro de cada um importa; entre eles, o que importa é a compatibilidade."
        icone={Layers3}
      >
        <div className="emp-trilhos">
          <section className="emp-trilho emp-trilho-setorial">
            <h3><Zap size={17} aria-hidden="true" /> Trilho setorial</h3>
            <ol>
              {TRILHO_SETORIAL.map((item, i) => (
                <li key={item.passo}>
                  <span aria-hidden="true">{i + 1}</span>
                  <div><strong>{item.passo}</strong><p>{item.detalhe}</p></div>
                </li>
              ))}
            </ol>
          </section>
          <section className="emp-trilho emp-trilho-ambiental">
            <h3><Landmark size={17} aria-hidden="true" /> Trilho ambiental</h3>
            <ol>
              {TRILHO_AMBIENTAL.map((item, i) => (
                <li key={item.passo}>
                  <span aria-hidden="true">{i + 1}</span>
                  <div><strong>{item.passo}</strong><p>{item.detalhe}</p></div>
                </li>
              ))}
            </ol>
          </section>
        </div>
        <h3 className="emp-sub">Quem faz o quê</h3>
        <div className="emp-papeis">
          {PAPEIS_EMPREENDIMENTO.map((p) => (
            <article key={p.papel}>
              <strong>{p.papel}</strong>
              <p>{p.faz}</p>
              <p className="emp-naofaz"><Users size={13} aria-hidden="true" /> {p.naoFaz}</p>
            </article>
          ))}
        </div>
      </Secao>

      <Secao
        id="emp-consulta"
        titulo="Consulta Prévia"
        resumo="A porta de entrada, e o ato mais mal compreendido do conjunto."
        icone={CircleHelp}
      >
        <p className="emp-texto">
          A Consulta Prévia acontece antes de formalizar o pedido de licença. Ela serve para
          orientar a modalidade e o estudo prováveis e para revelar restrições de sensibilidade
          antes de o estudo completo ser contratado. As condições e as peças de caracterização
          estão na Instrução Normativa IAT nº 09/2025.
        </p>
        <div className="emp-limite">
          <strong>O que a manifestação não faz</strong>
          <ul>
            <li>Não aprova a viabilidade ambiental do empreendimento.</li>
            <li>Não assegura prioridade sobre outro interessado.</li>
            <li>Não confere domínio nem direito sobre a área ou sobre o corpo hídrico.</li>
            <li>Tem prazo de validade próprio e não é prorrogável.</li>
          </ul>
        </div>
        <p className="emp-texto">
          Tratar a manifestação como aprovação antecipada é o erro que mais custa investimento
          nesta etapa, porque ele desloca a decisão de seguir para antes da análise que a
          sustenta.
        </p>
      </Secao>

      <Secao
        id="emp-modalidades"
        titulo="Modalidades e o que cada uma decide"
        resumo="O rito segue o enquadramento e a norma, e não a preferência pelo caminho mais curto."
        icone={FileText}
      >
        <div className="emp-modalidades">
          {MODALIDADES.map((m) => (
            <article key={m.sigla}>
              <span className="emp-sigla">{m.sigla}</span>
              <strong>{m.nome}</strong>
              <p>{m.serve}</p>
              <p className="emp-naofaz"><AlertTriangle size={13} aria-hidden="true" /> {m.limite}</p>
            </article>
          ))}
        </div>
      </Secao>

      <Secao
        id="emp-agua"
        titulo="O uso da água é um ato à parte"
        resumo="Dispensa, outorga preventiva e outorga de direito de uso são atos distintos, e a competência depende do domínio do corpo hídrico."
        icone={Droplets}
      >
        <p className="emp-texto">
          A regularização do uso da água segue a Lei Federal nº 9.433/1997 e as regras do gestor
          competente. Quem emite o ato depende do domínio do corpo hídrico: corpo de domínio da
          União segue o fluxo da agência nacional; corpo de domínio estadual segue o órgão gestor
          estadual. Identificar o domínio é o primeiro passo, e ele não se deduz do tamanho do rio.
        </p>
        <p className="emp-texto">
          A licença ambiental não substitui a outorga, e a outorga não substitui a licença. Os dois
          atos precisam existir e ser compatíveis entre si quanto a vazão, arranjo e operação
          pretendida.
        </p>
      </Secao>

      <Secao
        id="emp-documentos"
        titulo="Onde está escrita cada exigência"
        resumo="Este guia não lista o que você precisa entregar. Ele aponta a norma que estabelece a exigência, porque é ela que vale."
        icone={ListChecks}
      >
        <div className="emp-limite emp-limite-forte">
          <strong>Por que não há uma lista fechada aqui</strong>
          <p>
            O documento que organiza o método de análise não cria exigência: ele descreve o que o
            órgão confere. A obrigação nasce na norma, no anexo, no Termo de Referência da fase ou
            em condicionante anterior do próprio processo. Uma lista copiada para cá envelheceria
            sem aviso e passaria a valer como se fosse fonte. Confirme sempre a versão vigente na
            data do seu protocolo.
          </p>
        </div>
        <div className="emp-fontes">
          {ONDE_ESTA_A_EXIGENCIA.map((item) => (
            <article key={item.grupo}>
              <strong>{item.grupo}</strong>
              <p className="emp-fonte-norma">{item.fonte}</p>
              <p>{item.conteudo}</p>
            </article>
          ))}
        </div>
        <p className="emp-texto">
          Os endereços oficiais dos atos e o registro de referências estão na Biblioteca técnica,
          com a data em que cada link foi conferido.
        </p>
        <button className="secondary emp-ir" type="button" onClick={() => go('biblioteca')}>
          Abrir a Biblioteca técnica <ExternalLink size={15} aria-hidden="true" />
        </button>
      </Secao>

      <Secao
        id="emp-intervenientes"
        titulo="Intervenientes têm prazo próprio"
        resumo="Manifestação de outro órgão não está sob o seu controle nem sob o do órgão licenciador."
        icone={Users}
      >
        <p className="emp-texto">
          Patrimônio cultural, unidade de conservação afetada, município e demais órgãos
          manifestam-se dentro da própria competência. A afetação de unidade de conservação e de
          sua zona de amortecimento segue a Lei Federal nº 9.985/2000, o Decreto Federal nº
          4.340/2002 e a Resolução CONAMA nº 428/2010.
        </p>
        <p className="emp-texto">
          A consequência prática é de cronograma: acionar o interveniente tarde soma prazos em
          série, quando eles poderiam correr em paralelo. A manifestação de um órgão não transfere
          a competência de outro nem dispensa a decisão do licenciador.
        </p>
      </Secao>

      <Secao
        id="emp-depois"
        titulo="Depois da licença o processo continua"
        resumo="Condicionante é obrigação com prazo e evidência, e é ela que sustenta a renovação."
        icone={Building2}
      >
        <p className="emp-texto">
          A licença fixa condicionantes verificáveis. Cada uma tem prazo e precisa de evidência do
          cumprimento, e é esse acervo que a renovação examina. Condicionante cumprida sem registro
          equivale, na análise, a condicionante não cumprida.
        </p>
        <p className="emp-texto">
          Alteração de projeto, de titularidade ou de operação tem rito próprio e não se resolve por
          comunicação informal. Barragens seguem, ainda, a política nacional de segurança
          estabelecida pela Lei Federal nº 12.334/2010, alterada pela Lei Federal nº 14.066/2020,
          com plano de segurança e plano de ação de emergência conforme a classificação.
        </p>
      </Secao>

      <Secao
        id="emp-erros"
        titulo="O que mais custa prazo"
        resumo="Pontos em que a análise trava e o processo volta, vistos do lado de quem entrega."
        icone={AlertTriangle}
      >
        <div className="emp-erros">
          {CUSTA_PRAZO.map((item) => (
            <article key={item.erro}>
              <strong>{item.erro}</strong>
              <p>{item.efeito}</p>
            </article>
          ))}
        </div>
      </Secao>

      <section className="emp-cta">
        <div>
          <CircleHelp aria-hidden="true" />
          <div>
            <strong>Quer ver a análise por dentro?</strong>
            <p>
              A formação percorre o método que o órgão aplica em cada fase. Entender o que a análise
              procura é a forma mais direta de entregar um processo que não volta.
            </p>
          </div>
        </div>
        <button className="primary" type="button" onClick={() => go('formacao')}>
          Ver a formação
        </button>
      </section>
    </div>
  );
}
