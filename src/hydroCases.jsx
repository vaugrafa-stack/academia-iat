// Turbinas (esquema + foto real), casos reais do Parana e esquemas de arranjo.
// Fatos verificados na web em 2026-07-22; fotos: Wikimedia Commons (hotlink com credito).
import React, { useState } from 'react';
import { Mountain, Droplets, ExternalLink, MapPin, Zap, Factory, Waves, Info, Camera } from 'lucide-react';

// Fotos baixadas do Wikimedia Commons (licenca livre) e servidas localmente;
// o credito com link para a pagina do arquivo (e sua licenca) fica na legenda.
const BASE = ((import.meta.env.BASE_URL || '/').replace(/\/$/, ''));
const LOCAL_FOTO = {
  'Peltonturbine-1.jpg': BASE + '/hidro/turbina-pelton.jpg',
  'Francis_Turbine_complete.jpg': BASE + '/hidro/turbina-francis.jpg',
  'Kaplan_turbine_bonneville.jpg': BASE + '/hidro/turbina-kaplan.jpg',
};
const WM = (f) => LOCAL_FOTO[f];
const WMPAGE = (f) => `https://commons.wikimedia.org/wiki/File:${f}`;

/* ============ ESQUEMAS DE TURBINA (SVG detalhados) ============ */
function SvgPelton() {
  const conchas = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg viewBox="0 0 300 220" className="turb-svg" aria-label="Esquema de turbina Pelton">
      <circle cx="150" cy="110" r="66" fill="none" stroke="#3fe0a6" strokeWidth="3" />
      <circle cx="150" cy="110" r="12" fill="#3fe0a6" />
      <g className="spin-slow">
        {conchas.map((a) => (
          <g key={a} transform={`rotate(${a} 150 110)`}>
            <path d="M150 36 q-10 -12 -2 -20 q10 6 12 16 q-4 6 -10 4" fill="#37d39a" stroke="#2fa07a" strokeWidth="1.4" />
          </g>
        ))}
      </g>
      <rect x="10" y="98" width="66" height="14" rx="7" fill="#93a7af" />
      {/* O jato parava a 30 px da roda, entao a legenda dizia turbina de ACAO e
          o desenho mostrava agua que nunca encostava em concha nenhuma. Agora
          ele alcanca o ponto de impacto. */}
      <path d="M76 105 L128 105" stroke="#34a9e1" strokeWidth="8" strokeLinecap="round" className="jet-anim" strokeDasharray="8 10" />
      {/* Agua defletida. Pelton e turbina de acao: o jato bate na dupla colher,
          entrega a energia e SAI para os lados em pressao atmosferica. Sem esta
          saida, o desenho sugeria que a agua sumia dentro da roda, que e
          justamente a confusao entre acao e reacao. */}
      <path className="pelton-deflete" d="M132 100 q16 -14 30 -18" stroke="#8fd0ff" strokeWidth="3"
            fill="none" strokeLinecap="round" />
      <path className="pelton-deflete" d="M132 112 q16 14 30 18" stroke="#8fd0ff" strokeWidth="3"
            fill="none" strokeLinecap="round" />
      <polygon points="70,96 92,105 70,114" fill="#93a7af" />
      <text x="14" y="88" fontSize="11" fill="#bcd0c7" fontWeight="700">bocal / injetor</text>
      <text x="292" y="40" textAnchor="end" fontSize="11" fill="#bcd0c7" fontWeight="700">conchas (dupla colher)</text>
    </svg>
  );
}
function SvgFrancis() {
  return (
    <svg viewBox="0 0 300 220" className="turb-svg" aria-label="Esquema de turbina Francis">
      <path d="M150 110 m66 0 a66 66 0 1 1 -18 -46" fill="none" stroke="#4cc4f5" strokeWidth="16" strokeLinecap="round" opacity=".85" />
      {/* Fluxo radial na caixa espiral. A legenda promete fluxo radial que vira
          axial sob pressao, e a caixa era um arco parado: o desenho nao mostrava
          nem o radial nem a virada. */}
      <path className="fr-radial" d="M150 110 m66 0 a66 66 0 1 1 -18 -46" fill="none"
            stroke="#bfe3ff" strokeWidth="4" strokeLinecap="round" />
      <text x="212" y="52" fontSize="11" fill="#bcd0c7" fontWeight="700">caixa espiral</text>
      {Array.from({ length: 10 }, (_, i) => i * 36).map((a) => (
        <g key={a} transform={`rotate(${a} 150 110)`}>
          <rect x="146" y="58" width="7" height="16" rx="3" fill="#37d39a" transform="rotate(24 150 66)" />
        </g>
      ))}
      <g className="spin-slow">
        {Array.from({ length: 9 }, (_, i) => i * 40).map((a) => (
          <g key={a} transform={`rotate(${a} 150 110)`}>
            <path d="M150 78 q16 14 6 30 l-8 -4 q6 -12 -4 -22 Z" fill="#3fe0a6" />
          </g>
        ))}
        <circle cx="150" cy="110" r="14" fill="#2fa07a" />
      </g>
      <text x="52" y="52" fontSize="11" fill="#bcd0c7" fontWeight="700">distribuidor (palhetas)</text>
      <rect x="142" y="150" width="16" height="46" fill="#8fd0ff" opacity=".8" />
      <path d="M142 196 q8 12 16 0" fill="#8fd0ff" opacity=".8" />
      {/* A saida axial pelo tubo de succao, que e a segunda metade da frase
          radial vira axial. Desce, porque a agua sai por baixo do rotor. */}
      <path className="fr-axial" d="M150 152 L150 198" stroke="#dff1ff" strokeWidth="3"
            strokeLinecap="round" fill="none" />
      <text x="166" y="182" fontSize="11" fill="#bcd0c7" fontWeight="700">tubo de sucção</text>
    </svg>
  );
}
function SvgKaplan() {
  return (
    <svg viewBox="0 0 300 220" className="turb-svg" aria-label="Esquema de turbina Kaplan">
      <path d="M40 40 L120 70 L120 150 L40 180 Z" fill="#bfe3ff" opacity=".7" />
      {/* O rotulo dizia fluxo axial sobre um poligono imovel. */}
      <path className="kp-fluxo" d="M46 74 L118 92 M46 110 L118 110 M46 146 L118 128"
            stroke="#dff1ff" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <text x="42" y="32" fontSize="11" fill="#bcd0c7" fontWeight="700">fluxo axial</text>
      <rect x="120" y="96" width="90" height="28" rx="6" fill="#93a7af" />
      <g className="spin-slow" style={{ transformOrigin: '150px 110px' }}>
        {[0, 90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a} 150 110)`}>
            {/* Passo variavel, que e a razao de existir da Kaplan e o que a
                legenda promete. As pas eram fixas, entao o desenho ficava
                indistinguivel de uma helice comum: o unico sinal de ajuste
                eram duas setas amarelas paradas ao lado. A oscilacao lenta em
                torno do proprio eixo mostra a pa mudando de angulo, e o periodo
                e longo de proposito, porque o ajuste acompanha a vazao do rio e
                nao o giro do rotor. */}
            <path className="kp-passo" d="M150 110 q34 -10 52 -34 q10 18 -6 34 q-22 12 -46 0 Z" fill="#37d39a" stroke="#2fa07a" strokeWidth="1.2" opacity=".92" />
          </g>
        ))}
        <circle cx="150" cy="110" r="16" fill="#2fa07a" />
      </g>
      <path d="M212 96 l20 -12 M212 124 l20 12" stroke="#f3bd4f" strokeWidth="3" />
      <text x="196" y="76" fontSize="11" fill="#bcd0c7" fontWeight="700">pás AJUSTÁVEIS</text>
    </svg>
  );
}
function SvgBulbo() {
  return (
    <svg viewBox="0 0 300 220" className="turb-svg" aria-label="Esquema de turbina bulbo">
      <path d="M10 70 L290 70 M10 160 L290 160" stroke="#9fb5aa" strokeWidth="2" />
      <path d="M10 78 L290 78" stroke="#8fd0ff" strokeWidth="10" opacity=".7" className="jet-anim" strokeDasharray="14 16" />
      {/* A legenda diz conjunto horizontal SUBMERSO no proprio fluxo, e so a
          linha de cima corria: a agua passava por cima do bulbo e nada por
          baixo, entao ele parecia apoiado no fundo em vez de imerso. As duas
          linhas contornam a carcaca e voltam a se juntar depois do rotor, que e
          o que submerso quer dizer aqui. */}
      <path className="bl-fluxo" d="M10 100 Q70 100 92 112 T196 118 T290 108" fill="none"
            stroke="#bfe3ff" strokeWidth="3.2" strokeLinecap="round" opacity=".85" />
      <path className="bl-fluxo" d="M10 148 Q70 148 92 136 T196 132 T290 144" fill="none"
            stroke="#bfe3ff" strokeWidth="3.2" strokeLinecap="round" opacity=".85" />
      <ellipse cx="130" cy="118" rx="66" ry="30" fill="#93a7af" />
      <text x="96" y="122" fontSize="12" fill="#8fe3cf" fontWeight="700">GERADOR</text>
      <g className="spin-slow" style={{ transformOrigin: '208px 118px' }}>
        {[0, 120, 240].map((a) => (
          <g key={a} transform={`rotate(${a} 208 118)`}>
            <path d="M208 118 q22 -8 34 -24 q8 14 -4 26 q-16 8 -30 -2 Z" fill="#37d39a" stroke="#2fa07a" strokeWidth="1.2" />
          </g>
        ))}
        <circle cx="208" cy="118" r="10" fill="#2fa07a" />
      </g>
    </svg>
  );
}

export const TURBINES_RICH = [
  { nome: 'Pelton', Svg: SvgPelton, vazao: 'Vazão baixa', legenda: "Jato em pressão atmosférica: turbina de AÇÃO.", foto: 'Peltonturbine-1.jpg', tipo: 'Ação (impulso)', faixa: 'Quedas altas: acima de ~250 m', usoPR: 'UHE Gov. Parigot de Souza (Antonina): 4 unidades Pelton, com desnível de 754 m.' },
  { nome: 'Francis', Svg: SvgFrancis, vazao: 'Vazão média', legenda: "Fluxo radial que vira axial, sob pressão: turbina de REAÇÃO.", foto: 'Francis_Turbine_complete.jpg', tipo: 'Reação', faixa: 'Quedas médias: ~30 a 400 m', usoPR: 'UHE Foz do Areia (Pinhão): 4 Francis de 419 MW. Também Itaipu (20 unidades).' },
  { nome: 'Kaplan', Svg: SvgKaplan, vazao: 'Vazão alta', legenda: "Hélice de passo variável: mantém rendimento com vazão variável.", foto: 'Kaplan_turbine_bonneville.jpg', tipo: 'Reação (pás ajustáveis)', faixa: 'Quedas baixas: ~10 a 70 m', usoPR: 'UHE Baixo Iguaçu (Capanema): 3 Kaplan de ~117 MW, a fio d\'água.' },
  { nome: 'Bulbo', Svg: SvgBulbo, vazao: 'Vazão muito alta', legenda: "Conjunto horizontal submerso no próprio fluxo, para quedas muito baixas.", foto: null, tipo: 'Reação (horizontal)', faixa: 'Quedas muito baixas: abaixo de ~15 m', usoPR: 'Sem unidade em operação no PR; no Brasil é típica das UHEs do rio Madeira (RO).' },
];

export function TurbineGallery() {
  const [i, setI] = useState(0);
  const t = TURBINES_RICH[i];
  return (
    <div className="turb-gallery">
      <div className="tg-tabs">{TURBINES_RICH.map((x, k) => (
        <button key={x.nome} className={k === i ? 'active' : ''} onClick={() => setI(k)}>{x.nome}</button>
      ))}</div>
      <div className="tg-body">
        <figure className="tg-schema"><t.Svg /><figcaption><span className="tg-cap-t">Esquema: {t.nome} ({t.tipo.toLowerCase()})</span><span className="tg-cap-d">{t.legenda}</span></figcaption></figure>
        {t.foto ? (
          <figure className="tg-photo">
            <img src={WM(t.foto)} alt={`Foto real de turbina ${t.nome}`} />
            <figcaption><Camera size={13} /> Foto real · <a href={WMPAGE(t.foto)} target="_blank" rel="noreferrer">Wikimedia Commons</a> (licença livre)</figcaption>
          </figure>
        ) : (
          <div className="tg-nophoto"><Info /><p>Sem foto de licença livre confirmada para bulbo: o esquema ao lado mostra o conjunto gerador submerso no próprio fluxo.</p></div>
        )}
        <div className="tg-info">
          <h3>Turbina {t.nome}</h3>
          <p><strong>{t.tipo}</strong> · {t.faixa}{t.vazao ? ' · ' + t.vazao : ''}</p>
          <p className="tg-pr"><MapPin size={14} /> <strong>No Paraná:</strong> {t.usoPR}</p>
        </div>
      </div>
    </div>
  );
}

/* ============ REVERSÍVEL: esquema animado (não há caso no PR) ============ */
function SvgReversivel() {
  return (
    <svg viewBox="0 0 460 250" className="arr-svg" aria-label="Esquema de usina reversível (bombeamento)">
      <rect width="460" height="250" fill="#1a2620" />
      <path d="M40 60 L200 60 L200 44 L40 44 Z" fill="#bfe3ff" stroke="#7db8e8" />
      <text x="46" y="36" fontSize="12" fontWeight="800" fill="#4cc4f5">reservatório SUPERIOR</text>
      <path d="M260 210 L440 210 L440 192 L260 192 Z" fill="#bfe3ff" stroke="#7db8e8" />
      <text x="300" y="238" fontSize="12" fontWeight="800" fill="#4cc4f5">reservatório INFERIOR</text>
      <path d="M198 58 C 240 90, 250 150, 268 198" stroke="#93a7af" strokeWidth="12" fill="none" strokeLinecap="round" />
      {/* Reversivel e uma usina de DOIS regimes que se revezam, e o desenho
          mostrava um so: um fluxo unico descendo para sempre, com as duas setas
          de legenda paradas. Assim ela ficava indistinguivel de uma usina
          comum, e a palavra reversivel nao aparecia em lugar nenhum do desenho.

          Agora os dois se alternam no mesmo conduto, em contrafase: enquanto um
          corre, o outro apaga. O ciclo e longo porque o que se alterna aqui e
          ponta e fora de ponta, que e questao de horas, nao de segundos. */}
      <path className="rv-gera" d="M198 58 C 240 90, 250 150, 268 198" stroke="#57d8bf" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="10 12" />
      <path className="rv-bombeia" d="M268 198 C 250 150, 240 90, 198 58" stroke="#f4c05a" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="10 12" />
      <circle cx="252" cy="150" r="20" fill="#2fa07a" />
      <path d="M252 138 l6 8 h-4 v8 h-4 v-8 h-4 Z" fill="#f3bd4f" />
      <text x="280" y="146" fontSize="12" fontWeight="700" fill="#bcd0c7">bomba-turbina</text>
      <text x="280" y="161" fontSize="12" fontWeight="700" fill="#bcd0c7">reversível</text>
      {/* As legendas acendem junto do regime que esta ativo, para o leitor ligar
          a seta ao fluxo em vez de ler os dois como se fossem simultaneos. */}
      <g className="rv-gera-rotulo">
        <path d="M120 96 l0 34" stroke="#37d39a" strokeWidth="4" markerEnd="url(#seta1)" />
        <text x="130" y="112" fontSize="11.5" fill="#37d39a" fontWeight="800">GERA na ponta (desce)</text>
      </g>
      <g className="rv-bombeia-rotulo">
        <path d="M96 176 l0 -34" stroke="#e5a000" strokeWidth="4" />
        <text x="106" y="168" fontSize="11.5" fill="#f4c05a" fontWeight="800">BOMBEIA fora de ponta (sobe)</text>
      </g>
    </svg>
  );
}

/* ============ CASOS REAIS NO PARANÁ (verificados) ============ */
export const PR_CASES = [
  { tipo: 'UHE de acumulação', criterio: 'Acima de 30 MW · concessão (leilão) · situação passível de EIA/RIMA; confirmar estudo e rito no caso concreto · reservatório de regularização',
    nome: 'UHE Gov. Bento Munhoz da Rocha Netto (Foz do Areia)', local: 'Rio Iguaçu, Pinhão-PR', dados: '1.676 MW · 4 turbinas Francis de 419 MW · barragem de 160 m · reservatório de ~165 km² · opera desde 1980 · maior usina da Copel',
    site: 'https://www.copel.com/site/copel-geracao/usinas/usina-governador-bento-munhoz-da-rocha-netto/', siteLabel: 'copel.com (página oficial da usina)' },
  { tipo: 'UHE a fio d\'água', criterio: 'Acima de 30 MW · pouca ou nenhuma regularização sazonal · geração mais dependente da vazão afluente',
    nome: 'UHE Baixo Iguaçu', local: 'Rio Iguaçu, Capanema / Capitão Leônidas Marques-PR', dados: '350,2 MW · 3 unidades Kaplan segundo nota técnica da EPE. A fonte registra dados de projeto; confirme a situação operacional atual na base competente antes de citar em processo.',
    site: 'https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-292/topico-376/EPE-DEE-RE-066-2016-r0.pdf', siteLabel: 'epe.gov.br (nota técnica oficial; dados de projeto)' },
  { tipo: 'UHE de queda alta (derivação)', criterio: 'Circuito longo de adução por túnel · queda elevada · turbinas Pelton',
    nome: 'UHE Gov. Pedro Viriato Parigot de Souza (Capivari-Cachoeira)', local: 'Antonina-PR (capta no rio Capivari e restitui no Cachoeira)', dados: '260 MW de potência instalada, com quatro geradores de 62,5 MW segundo a Copel · desnível de 754 m, a maior queda do sul do país · mais de 50 anos de operação',
    site: 'https://www.copel.com/site/copel-geracao/usinas/usina-parigot-de-souza/', siteLabel: 'copel.com (página oficial da usina)' },
  { tipo: 'PCH, Pequena Central Hidrelétrica',
    criterioAmbiental: 'IN IAT nº 09/2025, art. 2º: capacidade instalada superior a 5 MW e igual ou inferior a 30 MW, com reservatório de até 3 km², excluída a calha do leito regular. A restrição de área não se aplica aos aproveitamentos comprovadamente dimensionados para objetivos diferentes da geração de energia elétrica.',
    criterioSetorial: 'ANEEL: a página operacional consultada em 10/08/2026 usa potência superior a 5.000 kW e igual ou inferior a 30.000 kW. Confira o ato setorial aplicável e a situação concreta do empreendimento.',
    criterioAlerta: 'Não transporte a referência a 13 km² de uma página geral para o critério ambiental do IAT, nem a misture com o enquadramento setorial.',
    nome: 'PCH Bela Vista', local: 'Rio Chopim, Verê / São João-PR', dados: '29,81 MW · inaugurada em outubro de 2021 (unidades em jun/jul/ago) · investimento de R$ 224 milhões da Copel',
    site: 'https://pchbelavista.com.br/', siteLabel: 'pchbelavista.com.br (site oficial)' },
  { tipo: 'CGH, Central Geradora Hidrelétrica', criterio: 'Até 5 MW · registro/comunicação à ANEEL · rito proporcional ao porte',
    nome: 'CGH São Francisco de Sales', local: 'Rio São Francisco, Clevelândia-PR (comunidade Palmital)', dados: '0,9 MW · empreendimento privado com barragem de derivação e canal adutor de 317 m · site relata obras iniciadas em 2021; confirme a situação operacional atual no SIGA/ANEEL',
    site: 'https://cghsaofranciscodesales.com.br/', siteLabel: 'cghsaofranciscodesales.com.br (site do empreendimento)' },
  { tipo: 'UHE binacional', criterio: 'Empreendimento de tratado internacional · regime jurídico próprio',
    nome: 'Itaipu Binacional', local: 'Rio Paraná, Foz do Iguaçu-PR (Brasil/Paraguai)', dados: '14.000 MW · 20 unidades geradoras Francis · líder mundial em produção acumulada de energia',
    site: 'https://www.itaipu.gov.br/', siteLabel: 'itaipu.gov.br (site oficial)' },
  { tipo: 'Reversível (bombeamento)', criterio: 'Bombeia água a reservatório superior fora de ponta e turbina na ponta, a "bateria" hídrica', reversivel: true,
    nome: 'Bath County Pumped Storage Station: exemplo fora do Paraná', local: 'Bath County, Virgínia, Estados Unidos', dados: 'Exemplo didático internacional de armazenamento por bombeamento. A fonte técnica abaixo explica a tecnologia; não atesta a situação operacional atual deste empreendimento, que deve ser conferida na agência ou operadora competente.',
    site: 'https://www.energy.gov/cmei/water/history-hydropower', siteLabel: 'energy.gov (fonte técnica oficial dos Estados Unidos)' },
];

export function PRCasesSection() {
  return (
    <div className="pr-cases">
      <p className="prc-note"><Info size={15} /> Casos reais, com dados públicos coletados nas fontes indicadas em cada card, oficiais sempre que disponíveis. Confirme potência e situação operacional na fonte antes de citar em processo. O enquadramento ambiental segue o IAT e o POP; o enquadramento setorial segue a ANEEL. Leia cada eixo separadamente e confirme vigência e aplicação antes de decidir.</p>
      <div className="prc-grid">{PR_CASES.map((c) => (
        <article key={c.nome} className={'prc-card' + (c.site ? '' : ' prc-empty') + (c.reversivel ? ' prc-wide' : '')}>
          <span className="prc-tipo">{c.tipo}</span>
          <h3>{c.nome}</h3>
          {c.criterio && <p className="prc-crit"><Factory size={13} /> {c.criterio}</p>}
          {c.criterioAmbiental && <p className="prc-crit"><Factory size={13} /><span><strong>Eixo ambiental IAT.</strong> {c.criterioAmbiental}</span></p>}
          {c.criterioSetorial && <p className="prc-crit"><Zap size={13} /><span><strong>Eixo setorial ANEEL.</strong> {c.criterioSetorial}</span></p>}
          {c.criterioAlerta && <p className="prc-crit"><Info size={13} /><span><strong>Não misture os critérios.</strong> {c.criterioAlerta}</span></p>}
          <p className="prc-local"><MapPin size={13} /> {c.local}</p>
          <p className="prc-dados">{c.dados}</p>
          {c.reversivel && <div className="prc-fotos">
            <figure><SvgReversivel /><figcaption>Ciclo diário: funciona como bateria hídrica, consome energia barata para estocar água no reservatório superior e gera na hora de ponta.</figcaption></figure>
            <figure><img src={BASE + '/hidro/reversivel-bath-county.jpg'} alt="Bath County Pumped Storage Station: casa de força e subestação" /><figcaption><Camera size={13} /> Foto real da usina · <a href={WMPAGE('Bath_County_Pumped_Storage_Station.jpg')} target="_blank" rel="noreferrer">Wikimedia Commons</a> (licença livre)</figcaption></figure>
          </div>}
          {c.site && <a className="prc-site" href={c.site} target="_blank" rel="noreferrer"><ExternalLink size={14} /> {c.siteLabel}</a>}
        </article>
      ))}</div>
    </div>
  );
}

/* ============ COMO SOLICITAR A AUTORIZAÇÃO (trilhas ANEEL x IAT) ============ */
const TRILHA_ANEEL = [
  ['Estudos e definição do aproveitamento', 'Inventário do trecho, partição de quedas e projeto do aproveitamento: potência, queda, vazão e arranjo.'],
  ['Registro na ANEEL', 'Registro do projeto conforme a REN nº 875/2020 (adequabilidade do sumário executivo, DRS) e obtenção do CEG, o código único do empreendimento.'],
  ['Outorga setorial', 'Até 5 MW: registro/comunicação. Acima de 5 MW: autorização da ANEEL (limite ampliado pela legislação setorial vigente). Grandes aproveitamentos: concessão mediante leilão.'],
  ['Conexão à rede', 'Parecer de acesso, projeto da linha/subestação e contratos de conexão e uso do sistema.'],
];
const TRILHA_IAT = [
  ['Consulta Prévia (obrigatória para CGH a partir de 1 MW, PCH e UHE)', 'Antes de formalizar: mapa da ADA, arranjo em KML/KMZ e memorial descritivo (art. 36 da IN IAT nº 09/2025). A manifestação orienta modalidade e estudo, vale 24 meses e não aprova viabilidade.'],
  ['Enquadramento', 'Potência, área de alagamento, IDA, supressão e sensibilidade orientam a modalidade (DLAM, LAC, LAS ou rito trifásico). O estudo aplicável (RAS/RDPA, PCA ou EIA/RIMA) deve ser confirmado pelo enquadramento, pelo Termo de Referência vigente e pelos atos do processo, sem inferência automática a partir de um dado isolado.'],
  ['Protocolo e análise', 'Formalização pelo SGA/eProtocolo com a documentação da fase; o IAT confere suficiência antes do mérito e diligencia lacunas.'],
  ['LP → LI → LO', 'LP atesta viabilidade e concepção; LI autoriza instalar conforme projeto (com autorizações florestais, de fauna e outorga/DRDH); LO verifica o instalado e fixa condicionantes de operação, e o PACUERA quando exigível.'],
  ['Intervenientes', 'IPHAN (patrimônio), gestor de UC afetada e demais órgãos manifestam-se no processo; o IAT verifica compatibilidade sem substituir a decisão de cada um.'],
];
const PAPEIS = [
  ['Empreendedor', 'Decide investir, contrata estudos, protocola nos dois trilhos, mantém titularidade coerente entre ANEEL e IAT, responde exigências e cumpre condicionantes.'],
  ['Consultoria ambiental', 'Elabora memorial e estudos conforme os Termos de Referência, com ARTs; responde complementações técnicas e acompanha vistorias.'],
  ['IAT', 'Analisa, diligencia, licencia e fiscaliza o componente ambiental no Paraná; confere a existência e compatibilidade dos atos externos.'],
  ['ANEEL', 'Registra e outorga o aproveitamento energético, emite o CEG e regula a operação comercial.'],
  ['Órgãos intervenientes', 'IPHAN, gestores de UC e demais órgãos: manifestações específicas na sua competência, que integram o processo sem transferi-la.'],
];
export function LicensingPath({ go }) {
  return (
    <div className="lic-path">
      <p className="prc-note"><Info size={15} /> Roteiro didático baseado no POP e na IN IAT nº 09/2025 (fluxo ambiental) e no regime setorial da ANEEL (fluxo energético). Os dois processos avançam em paralelo e precisam ser compatíveis: titularidade, arranjo e potência devem coincidir.</p>
      <div className="lic-cols">
        <section className="lic-col lic-aneel"><h3><Zap size={17} /> Fluxo setorial · ANEEL</h3><ol>{TRILHA_ANEEL.map(([t, d], i) => <li key={t}><span>{i + 1}</span><div><strong>{t}</strong><p>{d}</p></div></li>)}</ol></section>
        <section className="lic-col lic-iat"><h3><Factory size={17} /> Fluxo ambiental · IAT</h3><ol>{TRILHA_IAT.map(([t, d], i) => <li key={t}><span>{i + 1}</span><div><strong>{t}</strong><p>{d}</p></div></li>)}</ol></section>
      </div>
      <h3 className="lic-papeis-h">Quem faz o quê</h3>
      <div className="lic-papeis">{PAPEIS.map(([t, d]) => <article key={t}><strong>{t}</strong><p>{d}</p></article>)}</div>
      <div className="lic-cta"><p>O detalhe de cada fase (documentos, critérios de suficiência e produtos) está nos módulos M03 a M05 da Formação e nas normas da Biblioteca.</p><button className="primary" onClick={() => go('formacao')}>Estudar as fases <ExternalLink size={15} /></button></div>
    </div>
  );
}

/* ============ ESQUEMAS DE ARRANJO (substituem as figuras confusas) ============ */
function ArrPeBarragem() {
  return (
    <svg viewBox="0 0 460 240" className="arr-svg" aria-label="Arranjo pé de barragem">
      <rect width="460" height="240" fill="#1a2620" />
      <path d="M0 150 L180 150 L180 120 L0 120 Z" fill="#bfe3ff" />
      <path d="M180 120 L180 205 L225 205 L212 120 Z" fill="#8a9a93" stroke="#8399a0" strokeWidth="2" />
      <path d="M186 128 L212 200" stroke="#93a7af" strokeWidth="8" strokeLinecap="round" />
      {/* A agua estava parada dentro do conduto e do canal, e arranjo de pe de
          barragem se explica justamente pelo percurso curto: o que o desenho
          precisa mostrar e que a restituicao acontece logo ali. */}
      <path className="arr-fluxo" d="M186 128 L212 200" stroke="#57d8bf" strokeWidth="3.4"
            strokeLinecap="round" fill="none" />
      <rect x="214" y="178" width="52" height="30" fill="#fff" stroke="#3fe0a6" strokeWidth="2" />
      <path d="M214 178 L240 164 L266 178 Z" fill="#2fa07a" />
      <rect x="266" y="196" width="194" height="16" fill="#bfe3ff" />
      <path className="arr-fluxo" d="M272 204 L454 204" stroke="#dff1ff" strokeWidth="3"
            strokeLinecap="round" fill="none" opacity="0.95" />
      <text x="10" y="112" fontSize="12" fontWeight="700" fill="#3fe0a6">reservatório</text>
      <text x="164" y="228" fontSize="12" fontWeight="700" fill="#3fe0a6">barragem</text>
      <text x="276" y="170" fontSize="12" fontWeight="700" fill="#3fe0a6">casa de força no pé</text>
      <text x="330" y="228" fontSize="12" fill="#93aaa1">restituição imediata</text>
    </svg>
  );
}
function ArrDerivacao() {
  return (
    <svg viewBox="0 0 460 240" className="arr-svg" aria-label="Arranjo de derivação">
      <rect width="460" height="240" fill="#1a2620" />
      <path d="M0 90 Q120 70 200 96 T460 120" fill="none" stroke="#bfe3ff" strokeWidth="16" />
      <path d="M60 84 L74 108" stroke="#8399a0" strokeWidth="8" />
      <path d="M74 96 C160 96 260 96 330 150" fill="none" stroke="#93a7af" strokeWidth="9" strokeDasharray="2 0" />
      {/* O desvio leva a vazao cheia, e e por isso que ele existe. */}
      <path className="arr-fluxo" d="M74 96 C160 96 260 96 330 150" fill="none"
            stroke="#57d8bf" strokeWidth="3.6" strokeLinecap="round" />
      {/* Trecho de vazao reduzida, desenhado como o que ele e.
          O leito natural continuava com o mesmo traco grosso do rio cheio, e o
          arranjo de derivacao se explica exatamente pelo contrario: entre a
          tomada e a restituicao, o rio fica com uma fracao da vazao. O fluxo
          aqui e mais fino e MUITO mais lento que o do desvio, e o contraste
          entre os dois ritmos e a licao do desenho, nao enfeite. */}
      <path className="arr-fluxo-tvr" d="M78 100 Q170 112 250 118 T460 126" fill="none"
            stroke="#8fb8d6" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <circle cx="250" cy="96" r="10" fill="none" stroke="#f3bd4f" strokeWidth="3" />
      <text x="222" y="80" fontSize="11" fontWeight="700" fill="#f4c05a">chaminé de equilíbrio</text>
      <rect x="318" y="146" width="52" height="30" fill="#fff" stroke="#3fe0a6" strokeWidth="2" />
      <path d="M318 146 L344 132 L370 146 Z" fill="#2fa07a" />
      <path d="M370 164 Q420 176 460 168" fill="none" stroke="#bfe3ff" strokeWidth="12" />
      {/* Restituicao: a vazao desviada volta ao rio depois do TVR. */}
      <path className="arr-fluxo" d="M372 165 Q420 177 458 169" fill="none"
            stroke="#dff1ff" strokeWidth="3" strokeLinecap="round" opacity="0.95" />
      <text x="18" y="70" fontSize="12" fontWeight="700" fill="#3fe0a6">açude de derivação</text>
      <text x="120" y="128" fontSize="12" fontWeight="700" fill="#3fe0a6">túnel/canal + conduto forçado</text>
      <text x="300" y="200" fontSize="12" fontWeight="700" fill="#3fe0a6">casa de força afastada</text>
      <path d="M74 96 L318 161" fill="none" stroke="#3fe0a6" strokeWidth="1" strokeDasharray="4 4" />
      <text x="150" y="188" fontSize="11" fill="#93aaa1">trecho de vazão reduzida (TVR) no leito natural</text>
    </svg>
  );
}
function ArrFioAgua() {
  return (
    <svg viewBox="0 0 460 240" className="arr-svg" aria-label="Fio d'água vs acumulação">
      <rect width="460" height="240" fill="#1a2620" />
      <rect x="10" y="46" width="210" height="176" fill="#fff" stroke="#dce5e0" />
      <path d="M20 150 L110 150 L110 132 L20 132 Z" fill="#bfe3ff" />
      <path d="M110 132 L110 190 L138 190 L130 132 Z" fill="#8a9a93" stroke="#8399a0" strokeWidth="1.6" />
      <rect x="138" y="172" width="34" height="20" fill="#fff" stroke="#3fe0a6" strokeWidth="1.6" />
      <path d="M172 184 L212 184" stroke="#bfe3ff" strokeWidth="10" />
      {/* Fio d'agua gera conforme o rio, entao a agua atravessa sem parar. */}
      <path className="arr-fluxo" d="M176 184 L208 184" stroke="#dff1ff" strokeWidth="2.6"
            strokeLinecap="round" fill="none" />
      <text x="22" y="66" fontSize="12" fontWeight="800" fill="#4cc4f5">FIO D'ÁGUA</text>
      <text x="22" y="82" fontSize="10.5" fill="#bcd0c7">reservatório mínimo</text>
      <text x="22" y="96" fontSize="10.5" fill="#bcd0c7">gera conforme o rio</text>
      <text x="22" y="212" fontSize="10.5" fill="#93aaa1">alagamento pode ser menor · geração variável</text>
      <rect x="240" y="46" width="210" height="176" fill="#fff" stroke="#dce5e0" />
      <path d="M250 166 L360 166 L360 108 L250 128 Z" fill="#bfe3ff" />
      <path d="M360 108 L360 200 L392 200 L380 108 Z" fill="#8a9a93" stroke="#8399a0" strokeWidth="1.6" />
      <rect x="392" y="182" width="34" height="20" fill="#fff" stroke="#3fe0a6" strokeWidth="1.6" />
      <path d="M426 192 L450 192" stroke="#bfe3ff" strokeWidth="10" />
      <path d="M250 128 L360 108" stroke="#4cc4f5" strokeWidth="1.4" strokeDasharray="4 3" />
      <text x="252" y="66" fontSize="12" fontWeight="800" fill="#3fe0a6">ACUMULAÇÃO</text>
      <text x="252" y="82" fontSize="10.5" fill="#bcd0c7">estoca água entre estações</text>
      <text x="252" y="96" fontSize="10.5" fill="#bcd0c7">regulariza vazão e firma energia</text>
      <text x="252" y="212" fontSize="10.5" fill="#93aaa1">regularização · deplecionamento</text>
    </svg>
  );
}
export function ArrangementSchematics() {
  return (
    <div className="arr-grid">
      <figure><ArrPeBarragem /><figcaption>Pé de barragem: a queda vem só do barramento. Circuito curto, casa de força ao pé e restituição imediata ao rio.</figcaption></figure>
      <figure><ArrDerivacao /><figcaption>Derivação: circuito longo que aproveita a queda do relevo (caso da UHE Parigot de Souza), com açude, adução, chaminé de equilíbrio e trecho de vazão reduzida.</figcaption></figure>
      <figure><ArrFioAgua /><figcaption>Regularização: fio d'água (caso do Baixo Iguaçu) e acumulação (caso de Foz do Areia). Área e volume do reservatório influenciam a operação e os impactos, mas não os definem sozinhos; considere também arranjo, regra operativa, localização, conectividade e usos da água.</figcaption></figure>
    </div>
  );
}
