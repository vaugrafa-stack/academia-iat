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
import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, Building2, CircleHelp, Compass, Droplets, ExternalLink,
  FileText, Landmark, Layers3, ListChecks, Scale, Users, Zap,
} from 'lucide-react';
import {
  CUSTA_PRAZO,
  EMPREENDEDOR_SECOES,
  MODALIDADES,
  NAO_CONFUNDA,
  ONDE_ESTA_A_EXIGENCIA,
  PAPEIS_EMPREENDIMENTO,
  REVISAO_NORMATIVA,
  TRILHO_AMBIENTAL,
  TRILHO_SETORIAL,
} from './empreendedorGuia.js';
import NormativeAuthorityAxes from './NormativeAuthorityAxes.jsx';
import './empreendedor.css';

function NavegacaoLocal() {
  // A seção corrente precisa ser anunciada, e não apenas alcançada.
  //
  // A primeira versão desta navegação levava à seção e parava aí: sem
  // `aria-current`, quem usa leitor de tela ficava sem saber onde estava, e sem
  // estado visual ninguém via qual dos dez atalhos correspondia ao que está na
  // tela. O guia de hidrelétricas já resolvia isso; este ficou atrás.
  //
  // O observador é a régua honesta: marcar no clique mentiria assim que a
  // pessoa rolasse para outra seção.
  const [corrente, setCorrente] = useState(EMPREENDEDOR_SECOES[0].id);

  useEffect(() => {
    const alvos = EMPREENDEDOR_SECOES
      .map((secao) => document.getElementById(secao.id))
      .filter(Boolean);
    if (!alvos.length || typeof IntersectionObserver !== 'function') return undefined;
    const visiveis = new Map();
    const observador = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) visiveis.set(entrada.target.id, entrada.isIntersecting);
      const primeira = EMPREENDEDOR_SECOES.find((secao) => visiveis.get(secao.id));
      if (primeira) setCorrente(primeira.id);
    }, {
      // A faixa de leitura fica logo abaixo da barra fixa e da própria
      // navegação, e não no meio da tela: é ali que o olho está.
      rootMargin: '-140px 0px -55% 0px',
    });
    for (const alvo of alvos) observador.observe(alvo);
    return () => observador.disconnect();
  }, []);

  const irPara = (id) => {
    const alvo = document.getElementById(id);
    if (!alvo) return;
    const reduzido = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    alvo.scrollIntoView({ block: 'start', behavior: reduzido ? 'auto' : 'smooth' });
    // O foco vai junto: sem isso, quem navega por teclado continua no topo e
    // a proxima tabulacao volta para o inicio do guia.
    alvo.focus({ preventScroll: true });
    setCorrente(id);
  };

  return (
    <nav className="emp-nav" aria-label="Seções deste guia">
      <span className="emp-nav-rotulo">Neste guia</span>
      <div className="emp-nav-links">
        {EMPREENDEDOR_SECOES.map((secao) => (
          <button
            key={secao.id}
            type="button"
            data-emp-nav-target={secao.id}
            aria-current={corrente === secao.id ? 'location' : undefined}
            onClick={() => irPara(secao.id)}
          >
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
        resumo="Três eixos decisórios, competências diferentes. O que cada um não decide está escrito junto."
        icone={Scale}
      >
        {/* A versao anterior dizia "tres autoridades". Isso sugeria que IAT,
            ANEEL e ANA estariam sempre presentes como tres instituicoes
            distintas no mesmo processo, e nao estao: em rio de dominio
            estadual no Parana, o proprio IAT tambem exerce a gestao dos
            recursos hidricos. O eixo e a decisao; a autoridade depende da
            competencia e, na agua, do dominio do corpo hidrico. */}
        <p className="emp-texto">
          O licenciamento ambiental, a regulação do setor elétrico e a regularização do uso
          dos recursos hídricos são decisões distintas e precisam permanecer compatíveis. A
          autoridade responsável por cada eixo depende da competência administrativa e, no
          caso dos recursos hídricos, do domínio do corpo hídrico. No Paraná, o IAT exerce
          tanto o licenciamento ambiental estadual quanto a gestão dos recursos hídricos de
          domínio estadual, de modo que dois eixos podem ter a mesma autoridade.
        </p>
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
        resumo="Os dois trilhos correm em paralelo, e não são independentes: há fases do licenciamento ambiental que exigem ato do outro eixo já emitido."
        icone={Layers3}
      >
        {/* Dizer apenas "precisam ser compativeis" subestima a dependencia: a
            norma ambiental pede documento setorial e a outorga previa em fases
            determinadas, entao a ordem entre os trilhos tambem importa. */}
        <p className="emp-texto">
          Tratar os dois trilhos como independentes até o fim é o erro de planejamento mais
          caro desta etapa. A norma ambiental exige, em fases determinadas, a portaria de
          outorga prévia e documentos setoriais específicos. Levantar cedo o que cada fase
          pedirá do outro eixo evita somar prazos em série.
        </p>
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
          A Consulta Prévia de Viabilidade antecede a formalização do requerimento de licença
          para <strong>CGH com potência instalada igual ou superior a 1 MW, PCH e UHE</strong>.
          Ela não é etapa universal de toda MCH, MGH ou CGH. Sua finalidade é permitir a
          identificação de pedido de licenciamento incidente no eixo pretendido e de possíveis
          restrições ambientais, impeditivos e intervenientes.
        </p>
        <p className="emp-texto">
          Para a consulta, devem ser apresentados mapa da delimitação da ADA, mapa digital do
          arranjo em formato KML ou KMZ e Memorial Descritivo, conforme a Instrução Normativa
          IAT nº 09/2025. O enquadramento de modalidade e de estudo não se decide aqui: ele é
          disciplinado pela própria Instrução Normativa e pelo quadro de enquadramento.
        </p>
        <div className="emp-limite">
          <strong>O que a manifestação não faz</strong>
          <ul>
            <li>Não aprova a viabilidade ambiental do empreendimento.</li>
            <li>Não assegura prioridade no licenciamento nem no aproveitamento do potencial.</li>
            <li>Não confere domínio sobre os imóveis afetados.</li>
            <li>Vale 24 meses e não é prorrogável.</li>
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
        titulo="Atos ambientais e modalidades de licenciamento"
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
        <h3 className="emp-sub">Não confunda os documentos</h3>
        <p className="emp-texto">
          Entregar um no lugar do outro reabre a análise inteira. O conteúdo exigido de cada
          um está no Termo de Referência aplicável.
        </p>
        <div className="emp-tabela-envolucro">
          <table className="emp-tabela">
            <caption className="sr-only">Documentos do processo e a função de cada um</caption>
            <thead>
              <tr><th scope="col">Documento</th><th scope="col">Para que serve</th></tr>
            </thead>
            <tbody>
              {NAO_CONFUNDA.map((d) => (
                <tr key={d.documento}>
                  <th scope="row">{d.documento}</th>
                  <td>{d.serve}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
          competente. Identificar o domínio do corpo hídrico é o primeiro passo, e ele não se
          deduz do tamanho do rio. A terminologia muda com o domínio, e misturá-la é fonte de
          erro no próprio requerimento.
        </p>
        <div className="emp-dominios">
          <article>
            <strong>Corpo hídrico de domínio da União</strong>
            <p>
              Aplicam-se as regras da ANA. A Resolução ANA nº 286/2026 diferencia a Declaração
              de Reserva de Disponibilidade Hídrica, a outorga preventiva e a outorga de direito
              de uso. Para PCH e UHE, a Declaração é solicitada pela ANEEL à ANA, previamente à
              concessão ou à autorização. Para CGH, observe os procedimentos específicos de
              outorga previstos para aproveitamentos de capacidade reduzida.
            </p>
          </article>
          <article>
            <strong>Corpo hídrico de domínio estadual no Paraná</strong>
            <p>
              A competência de outorga é do IAT. Para novos empreendimentos sujeitos a
              licenciamento ambiental, o procedimento estadual trabalha, em regra, com Outorga
              Prévia e posterior Outorga de Direito, observadas as particularidades do
              aproveitamento hidrelétrico e a fase do empreendimento.
            </p>
          </article>
        </div>
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
              {item.atencao && (
                <p className="emp-fonte-atencao">
                  <AlertTriangle size={13} aria-hidden="true" /> {item.atencao}
                </p>
              )}
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
          cumprimento, e é esse acervo que a renovação examina.
        </p>
        {/* A versao anterior dizia que condicionante cumprida sem registro
            "equivale a nao cumprida". E categorico demais: confunde o fato com
            a possibilidade de reconhece-lo. */}
        <p className="emp-texto emp-alerta">
          <strong>O cumprimento precisa ser demonstrável.</strong> Executar materialmente a
          condicionante não dispensa apresentar a evidência exigida na licença ou tecnicamente
          necessária à verificação. Sem documentação suficiente, não é possível reconhecer com
          segurança o atendimento da obrigação.
        </p>
        <div className="emp-limite">
          <strong>Renovação, regularização, alteração e transferência</strong>
          <ul>
            <li>
              A renovação da Licença de Operação tem requerimento próprio e antecedência a
              observar. Ela examina condicionantes, programas, outorga e documentação setorial,
              e não equivale a um novo licenciamento.
            </li>
            <li>
              Alteração definitiva de projeto ou de operação pode exigir licenciamento próprio,
              e não se resolve por comunicação informal.
            </li>
            <li>
              Instalação ou operação irregular tem rito de regularização, previsto entre as
              modalidades da Instrução Normativa IAT nº 09/2025.
            </li>
            <li>
              Mudança societária não transfere automaticamente a titularidade ambiental, hídrica
              e setorial: cada eixo tem o seu ato de transferência.
            </li>
          </ul>
        </div>
        <p className="emp-texto">
          Barragens seguem, ainda, a política nacional de segurança estabelecida pela Lei Federal
          nº 12.334/2010, alterada pela Lei Federal nº 14.066/2020, com plano de segurança e plano
          de ação de emergência conforme a classificação.
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

      <footer className="emp-revisao">
        <p>
          <strong>Revisão normativa: {REVISAO_NORMATIVA}.</strong> ANEEL, recursos hídricos,
          legislação federal e procedimento estadual mudam com frequência. A data acima diz
          quando este conteúdo foi conferido, e não que ele continue vigente hoje: confirme
          cada norma na fonte oficial, na data do seu protocolo.
        </p>
      </footer>
    </div>
  );
}
