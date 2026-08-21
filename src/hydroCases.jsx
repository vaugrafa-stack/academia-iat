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
/* Material comum aos quatro esquemas.
   Os ids sao prefixados por turbina de proposito: id de SVG e global no
   documento, e as quatro convivem na mesma pagina. Quatro blocos com os
   mesmos nomes recriariam o defeito de id duplicado que ja custou uma
   correcao nas miniaturas de barragem. */
function DefsTurbina({ p }) {
  return (
    <defs>
      <linearGradient id={p + '-aco'} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#eef3f5" /><stop offset="0.42" stopColor="#adb9c0" />
        <stop offset="1" stopColor="#586269" />
      </linearGradient>
      <linearGradient id={p + '-bronze'} x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0" stopColor="#9df0d2" /><stop offset="0.45" stopColor="#43c294" />
        <stop offset="1" stopColor="#186b50" />
      </linearGradient>
      <linearGradient id={p + '-agua'} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#a6e0fb" /><stop offset="1" stopColor="#2477ad" />
      </linearGradient>
      <linearGradient id={p + '-concreto'} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#8d968f" /><stop offset="1" stopColor="#5c645e" />
      </linearGradient>
      <radialGradient id={p + '-cubo'} cx="0.34" cy="0.28" r="0.85">
        <stop offset="0" stopColor="#dde5e9" /><stop offset="1" stopColor="#414f57" />
      </radialGradient>
      <filter id={p + '-sombra'} x="-30%" y="-30%" width="170%" height="170%">
        <feDropShadow dx="2" dy="3" stdDeviation="2.2" floodColor="#06100d" floodOpacity="0.5" />
      </filter>
    </defs>
  );
}

function SvgPelton() {
  const conchas = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg viewBox="0 0 300 220" className="turb-svg" aria-label="Esquema de turbina Pelton">
      <DefsTurbina p="pel" />
      {/* Poco de descarga: a Pelton entrega em pressao atmosferica, entao a
          agua cai livre embaixo da roda. */}
      <path d="M96 198 L292 198 L292 214 L96 214 Z" fill="url(#pel-agua)" opacity="0.55" />
      <path d="M96 198 L292 198" stroke="#cfeaff" strokeWidth="2" opacity="0.5" />

      {/* Disco do rotor, com raios. As conchas eram manchas soltas FORA de um
          circulo vazio: nao havia roda, so um contorno e doze borroes. */}
      <g filter="url(#pel-sombra)">
        <circle cx="178" cy="112" r="41" fill="url(#pel-aco)" stroke="#48545b" strokeWidth="1.6" />
      </g>
      <g stroke="#7f8c93" strokeWidth="3" opacity="0.75">
        <path d="M178 73 L178 151 M139 112 L217 112 M150 84 L206 140 M206 84 L150 140" />
      </g>
      <circle cx="178" cy="112" r="27" fill="none" stroke="#93a0a7" strokeWidth="1" opacity="0.6" />

      {/* Conchas montadas na periferia, cada uma com a aresta divisora que da
          nome a dupla colher. */}
      <g className="spin-slow">
        {conchas.map((a) => (
          <g key={a} transform={`rotate(${a} 178 112)`}>
            <path d="M178 38 c -12 0 -19 6 -19 13 c 0 8 8 15 19 15 c 11 0 19 -7 19 -15 c 0 -7 -7 -13 -19 -13 Z"
                  fill="url(#pel-bronze)" stroke="#14584180" strokeWidth="1.2" />
            <path d="M178 39 L178 65" stroke="#0d4634" strokeWidth="1.4" opacity="0.85" />
            <path d="M170 44 c -5 2 -7 7 -6 12" stroke="#e7fff5" strokeWidth="1.6" fill="none" opacity="0.65" />
          </g>
        ))}
      </g>
      <circle cx="178" cy="112" r="15" fill="url(#pel-cubo)" stroke="#3c484f" strokeWidth="1.4" />
      <circle cx="178" cy="112" r="4" fill="#2b353b" />

      {/* Injetor com agulha: e a agulha que regula a vazao, e sem ela o bocal
          era um retangulo cinza com um triangulo na ponta. */}
      <g filter="url(#pel-sombra)">
        <path d="M4 92 L40 92 L60 102 L72 107 L72 119 L60 124 L40 134 L4 134 Z"
              fill="url(#pel-aco)" stroke="#48545b" strokeWidth="1.4" />
      </g>
      <path d="M36 102 L60 110 L60 116 L36 124 Z" fill="#5a666d" />
      <rect x="2" y="90" width="7" height="46" rx="2" fill="#8f9ba1" stroke="#48545b" strokeWidth="1.2" />
      <path d="M10 98 L34 98" stroke="#eaf2f5" strokeWidth="1.6" opacity="0.5" />

      {/* O jato alcanca a concha: a legenda diz turbina de ACAO e antes a agua
          parava a 30 px da roda. */}
      <path d="M74 113 L106 113" stroke="#5fc3ea" strokeWidth="9" strokeLinecap="round" opacity="0.35" />
      <path d="M74 113 L106 113" stroke="#8fdcff" strokeWidth="9" strokeLinecap="round"
            className="jet-anim" strokeDasharray="8 10" />
      {/* Agua defletida: bate na dupla colher, entrega a energia e sai para os
          lados. Sem isso o desenho sugeria que a agua sumia dentro da roda, que
          e a confusao entre acao e reacao. */}
      <path className="pelton-deflete" d="M112 106 q-16 -12 -32 -16" stroke="#bfe6ff" strokeWidth="3"
            fill="none" strokeLinecap="round" />
      <path className="pelton-deflete" d="M112 120 q-16 12 -32 16" stroke="#bfe6ff" strokeWidth="3"
            fill="none" strokeLinecap="round" />

      <text x="8" y="84" fontSize="11" fill="#dbe7e0" fontWeight="700">bocal / injetor</text>
      <text x="294" y="26" textAnchor="end" fontSize="11" fill="#dbe7e0" fontWeight="700">conchas (dupla colher)</text>
    </svg>
  );
}

function SvgFrancis() {
  const espiral = [
    ['M223 131 A78 78 0 0 1 123 177', 24],
    ['M123 177 A78 78 0 0 1 77 77', 19],
    ['M77 77 A78 78 0 0 1 177 31', 15],
    ['M177 31 A78 78 0 0 1 227 90', 11],
  ];
  return (
    <svg viewBox="0 0 300 220" className="turb-svg" aria-label="Esquema de turbina Francis">
      <DefsTurbina p="fra" />
      {/* Caixa espiral de verdade: a secao DIMINUI ao longo do caracol, porque
          a vazao vai sendo entregue ao distribuidor. Antes era um arco de
          espessura constante, que e um anel, nao um caracol. */}
      {/* A tubulacao de aducao encosta na boca do caracol; antes era uma placa
          cinza solta a direita, sem contato com nada. */}
      <path d="M222 117 L298 104 L298 150 L228 146 Z" fill="url(#fra-aco)" stroke="#4a565d" strokeWidth="1.4" />
      {espiral.map(([d, w], i) => (
        <path key={i} d={d} fill="none" stroke="#7d8990" strokeWidth={w + 3} strokeLinecap="round" />
      ))}
      {espiral.map(([d, w], i) => (
        <path key={'i' + i} d={d} fill="none" stroke="url(#fra-agua)" strokeWidth={w} strokeLinecap="round" />
      ))}
      {/* Fluxo radial na caixa espiral: a legenda promete radial que vira
          axial, e a caixa era um arco parado. */}
      <path className="fr-radial" d="M223 131 A78 78 0 0 1 123 177 A78 78 0 0 1 77 77 A78 78 0 0 1 177 31"
            fill="none" stroke="#e2f4ff" strokeWidth="4" strokeLinecap="round" />

      {/* Palhetas do distribuidor, em aerofolio e inclinadas: sao elas que dao
          a rotacao a agua antes do rotor. */}
      {Array.from({ length: 14 }, (_, i) => i * 25.7).map((a) => (
        <g key={a} transform={`rotate(${a} 150 104)`}>
          <path d="M150 66 q6 4 5 11 q-1 6 -6 9 q4 -10 1 -20 Z" fill="#9fb0b8" stroke="#5d686f" strokeWidth="0.9" />
        </g>
      ))}
      <circle cx="150" cy="104" r="34" fill="#26343a" opacity="0.35" />
      {/* Eixo atras do rotor, nao por cima: desenhado depois, ele virava um
          pirulito apoiado no cubo. */}
      <rect x="145" y="14" width="11" height="80" rx="2" fill="url(#fra-aco)" stroke="#4a565d" strokeWidth="1.1" />

      {/* Rotor Francis: pas curvas entre coroa e cinta, nao triangulos. */}
      <g className="spin-slow">
        {Array.from({ length: 9 }, (_, i) => i * 40).map((a) => (
          <g key={a} transform={`rotate(${a} 150 104)`}>
            <path d="M150 76 q13 8 14 20 q1 10 -8 16 q6 -14 -2 -24 q-4 -6 -10 -8 Z"
                  fill="url(#fra-bronze)" stroke="#12684c" strokeWidth="0.9" />
          </g>
        ))}
      </g>
      <circle cx="150" cy="104" r="12" fill="url(#fra-cubo)" stroke="#3c484f" strokeWidth="1.2" />
      

      {/* Tubo de succao conico: recupera energia cinetica alargando a secao.
          Era um retangulo azul de largura constante. */}
      <path d="M132 136 L168 136 L186 198 L114 198 Z" fill="url(#fra-agua)" opacity="0.85" />
      <path d="M132 136 L114 198 M168 136 L186 198" stroke="#7d8990" strokeWidth="2.4" />
      <path className="fr-axial" d="M150 140 L150 194" stroke="#eaf7ff" strokeWidth="3"
            strokeLinecap="round" fill="none" />

      <text x="206" y="90" fontSize="11" fill="#dbe7e0" fontWeight="700">caixa espiral</text>
      <path d="M62 40 L118 74" stroke="#8fa79a" strokeWidth="1.2" opacity="0.8" />
      <text x="6" y="34" fontSize="11" fill="#dbe7e0" fontWeight="700">distribuidor</text>
      <text x="150" y="216" textAnchor="middle" fontSize="11" fill="#dbe7e0" fontWeight="700">tubo de sucção</text>
    </svg>
  );
}

function SvgKaplan() {
  // Concreto, agua e fluxo sao tres espessuras do MESMO caminho. Na tentativa
  // anterior cada trecho era um poligono proprio, e bastava um controle fora
  // de lugar para a agua aparecer em pedacos soltos, com uma coluna descendo
  // ao lado de um cotovelo que nao a encontrava. Com uma geometria so, o
  // conduto e continuo por construcao.
  const CONDUTO = 'M0 78 L118 78 Q 148 78 148 114 L148 150 Q 148 184 188 192 L300 198';
  return (
    <svg viewBox="0 0 300 220" className="turb-svg" aria-label="Esquema de turbina Kaplan">
      <DefsTurbina p="kap" />
      <rect x="0" y="0" width="300" height="220" fill="url(#kap-concreto)" opacity="0.5" />
      <path d={CONDUTO} fill="none" stroke="#4e5751" strokeWidth="72" strokeLinejoin="round" />
      <path d={CONDUTO} fill="none" stroke="url(#kap-agua)" strokeWidth="58" strokeLinejoin="round" opacity="0.92" />
      {/* O rotulo dizia fluxo axial sobre um poligono imovel. */}
      <path className="kp-fluxo" d={CONDUTO} fill="none" stroke="#eaf7ff" strokeWidth="3"
            strokeLinecap="round" opacity="0.9" />

      {/* Distribuidor: as palhetas dao rotacao a agua antes do rotor. */}
      <rect x="112" y="104" width="9" height="22" rx="2" fill="#9fb0b8" stroke="#5d686f" strokeWidth="0.9" />
      <rect x="176" y="104" width="9" height="22" rx="2" fill="#9fb0b8" stroke="#5d686f" strokeWidth="0.9" />

      {/* Em corte, o rotor axial mostra o cubo de perfil e duas pas. A helice
          vista de frente que estava aqui pertencia a outra vista, e por isso o
          conjunto lia como ventilador encostado na parede. O passo variavel e
          a razao de existir da Kaplan: a oscilacao e lenta de proposito,
          porque o ajuste acompanha a vazao do rio, nao o giro do rotor. */}
      <path className="kp-passo" d="M144 140 q-16 -6 -34 -2 q3 11 15 15 q13 3 21 -4 Z"
            fill="url(#kap-bronze)" stroke="#12684c" strokeWidth="1.1" />
      <path className="kp-passo" d="M152 140 q16 -6 34 -2 q-3 11 -15 15 q-13 3 -21 -4 Z"
            fill="url(#kap-bronze)" stroke="#12684c" strokeWidth="1.1" />
      <ellipse cx="148" cy="138" rx="13" ry="17" fill="url(#kap-cubo)" stroke="#3c484f" strokeWidth="1.4" />

      <rect x="141" y="28" width="15" height="96" rx="2" fill="url(#kap-aco)" stroke="#4a565d" strokeWidth="1.1" />
      <rect x="120" y="12" width="58" height="20" rx="4" fill="#c3ccc6" stroke="#4a565d" strokeWidth="1.2" />
      <text x="149" y="26" textAnchor="middle" fontSize="10" fill="#2c3a33" fontWeight="700">gerador</text>

      <text x="6" y="26" fontSize="11" fill="#dbe7e0" fontWeight="700">fluxo axial</text>
      <path d="M232 106 L190 132" stroke="#8fa79a" strokeWidth="1.2" opacity="0.85" />
      <text x="296" y="102" textAnchor="end" fontSize="11" fill="#dbe7e0" fontWeight="700">pás AJUSTÁVEIS</text>
      <text x="296" y="216" textAnchor="end" fontSize="10" fill="#a9bdb3">tubo de sucção</text>
    </svg>
  );
}
function SvgBulbo() {
  return (
    <svg viewBox="0 0 300 220" className="turb-svg" aria-label="Esquema de turbina bulbo">
      <DefsTurbina p="bul" />
      <path d="M0 30 L300 30 L300 58 L0 58 Z" fill="url(#bul-concreto)" />
      <path d="M0 178 L300 178 L300 210 L0 210 Z" fill="url(#bul-concreto)" />
      <path d="M0 58 L300 58 L300 178 L0 178 Z" fill="url(#bul-agua)" opacity="0.75" />

      {/* As duas linhas contornam a carcaca e voltam a se juntar depois do
          rotor: e isso que submerso quer dizer aqui. Antes so a linha de cima
          corria, e o bulbo parecia apoiado no fundo. */}
      <path className="bl-fluxo" d="M4 92 Q 60 92 92 78 T 200 88 T 298 96" fill="none"
            stroke="#eaf7ff" strokeWidth="3.2" strokeLinecap="round" opacity="0.9" />
      <path className="bl-fluxo" d="M4 148 Q 60 148 92 158 T 200 148 T 298 140" fill="none"
            stroke="#eaf7ff" strokeWidth="3.2" strokeLinecap="round" opacity="0.9" />

      {/* Coluna de sustentacao: o bulbo nao flutua, ele e preso a estrutura. */}
      <path d="M112 82 L106 30 L132 30 L128 82 Z" fill="url(#bul-aco)" stroke="#4a565d" strokeWidth="1.2" opacity="0.95" />

      {/* Carcaca hidrodinamica: nariz arredondado a montante e afilamento a
          jusante. Era uma elipse cinza com a palavra GERADOR por cima. */}
      <g filter="url(#bul-sombra)">
        <path d="M36 118 C 36 92 64 80 100 80 L148 80 C 172 80 188 96 196 112 L202 116 L202 120 L196 124 C 188 140 172 156 148 156 L100 156 C 64 156 36 144 36 118 Z"
              fill="url(#bul-aco)" stroke="#48545b" strokeWidth="1.6" />
      </g>
      <path d="M52 104 C 62 92 82 88 104 88" stroke="#f2f8fa" strokeWidth="2.4" fill="none" opacity="0.55" />
      {/* Janela de corte mostrando o gerador dentro. */}
      <rect x="70" y="100" width="86" height="36" rx="6" fill="#22303a" opacity="0.92" />
      <g stroke="#5fd7ae" strokeWidth="2" opacity="0.85" fill="none">
        <path d="M82 108 L82 128 M92 106 L92 130 M102 108 L102 128" />
      </g>
      <circle cx="120" cy="118" r="11" fill="url(#bul-cubo)" stroke="#5fd7ae" strokeWidth="1.2" />
      <text x="137" y="122" fontSize="10" fill="#8fe3cf" fontWeight="700">gerador</text>

      {/* Em corte lateral o rotor axial mostra o cubo de perfil e duas pas,
          uma para cima e outra para baixo. A helice de frente que estava aqui
          pertencia a outra vista. */}
      <path d="M212 108 q4 -30 12 -40 q10 8 6 24 q-4 12 -12 18 Z"
            fill="url(#bul-bronze)" stroke="#12684c" strokeWidth="1.1" />
      <path d="M212 128 q4 30 12 40 q10 -8 6 -24 q-4 -12 -12 -18 Z"
            fill="url(#bul-bronze)" stroke="#12684c" strokeWidth="1.1" />
      <ellipse cx="211" cy="118" rx="10" ry="15" fill="url(#bul-cubo)" stroke="#3c484f" strokeWidth="1.3" />
      <path d="M198 110 L204 110 M198 126 L204 126" stroke="#5d686f" strokeWidth="2" />
      <text x="294" y="196" textAnchor="end" fontSize="11" fill="#dbe7e0" fontWeight="700">conjunto horizontal submerso</text>
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
/* Material e etiqueta comuns aos arranjos. Os ids levam prefixo porque id de
   SVG e global no documento e os quatro desenhos convivem na mesma pagina. */
function DefsArranjo({ p }) {
  return (
    <defs>
      <linearGradient id={p + '-ceu'} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6ea9d6" /><stop offset="0.6" stopColor="#a9cee3" />
        <stop offset="1" stopColor="#cfe1da" />
      </linearGradient>
      <linearGradient id={p + '-agua'} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#86ccf0" /><stop offset="0.35" stopColor="#3f9fd4" />
        <stop offset="1" stopColor="#17527a" />
      </linearGradient>
      <linearGradient id={p + '-rocha'} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6d5f4c" /><stop offset="0.45" stopColor="#4e4536" />
        <stop offset="1" stopColor="#2f2a22" />
      </linearGradient>
      <linearGradient id={p + '-mato'} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6d9179" /><stop offset="1" stopColor="#41604b" />
      </linearGradient>
      <linearGradient id={p + '-concreto'} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#dcdfd8" /><stop offset="0.45" stopColor="#b7bcb4" />
        <stop offset="1" stopColor="#7f8780" />
      </linearGradient>
      <linearGradient id={p + '-aco'} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5c676d" /><stop offset="0.32" stopColor="#c2ccd1" />
        <stop offset="0.52" stopColor="#93a0a7" /><stop offset="1" stopColor="#3f484d" />
      </linearGradient>
      {/* O markerEnd apontava para url(#seta1), que NAO estava definido em
          lugar nenhum do projeto: a ponta da seta nunca chegou a desenhar. */}
      <marker id={p + '-seta'} viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M0 1 L9 5 L0 9 Z" fill="context-stroke" />
      </marker>
      <filter id={p + '-sombra'} x="-25%" y="-25%" width="160%" height="165%">
        <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#15201c" floodOpacity="0.45" />
      </filter>
    </defs>
  );
}

/* Etiqueta com chapa propria. Os rotulos eram texto solto sobre o desenho, e
   em fundo claro sumiam ou cruzavam a tubulacao. */
function Etiqueta({ x, y, texto, cor, ancora, pequena }) {
  const largura = texto.length * (pequena ? 5.4 : 6.3) + (pequena ? 13 : 16);
  const bx = ancora === 'end' ? x - largura : ancora === 'middle' ? x - largura / 2 : x;
  const tx = ancora === 'end' ? x - 8 : ancora === 'middle' ? x : x + 8;
  return (
    <g>
      <rect x={bx} y={y - (pequena ? 10 : 12)} width={largura} height={pequena ? 15 : 18}
            rx={pequena ? 6 : 7} fill="#0f2119" opacity="0.85" />
      <text x={tx} y={y + 1} textAnchor={ancora === 'middle' ? 'middle' : ancora === 'end' ? 'end' : 'start'}
            fontSize={pequena ? 9.5 : 11} fontWeight="700" fill={cor || '#e7f3ec'}>{texto}</text>
    </g>
  );
}

function SvgReversivel() {
  const CONDUTO = 'M196 66 C 236 96, 250 152, 268 196';
  return (
    <svg viewBox="0 0 460 250" className="arr-svg" aria-label="Esquema de usina reversível (bombeamento)">
      <DefsArranjo p="rv" />
      <rect width="460" height="250" fill="url(#rv-ceu)" />
      {/* Os dois reservatorios eram retangulos azuis flutuando no vazio, sem
          chao, sem encosta e sem desnivel visivel a nao ser a posicao na tela.
          O que define a reversivel e o desnivel entre eles, entao o terreno
          precisa existir para que a altura signifique alguma coisa. */}
      <path d="M0 250 L460 250 L460 186 C 380 182 320 176 286 150 C 250 122 236 92 214 76 C 190 58 120 56 0 58 Z"
            fill="url(#rv-rocha)" />
      <path d="M0 58 C 120 56 190 58 214 76 C 236 92 250 122 286 150 C 320 176 380 182 460 186 L460 196 C 378 192 316 186 280 158 C 244 130 230 100 208 84 C 186 68 118 66 0 68 Z"
            fill="url(#rv-mato)" opacity="0.95" />
      <path d="M22 68 q7 -16 14 -3 q6 -12 12 3 Z M74 66 q6 -13 12 -2 q8 -18 15 2 Z M140 68 q8 -19 15 -3 q5 -9 10 3 Z"
            fill="#3d6b48" opacity="0.85" />
      <path d="M338 182 q7 -16 14 -3 q6 -12 12 3 Z M392 184 q6 -13 12 -2 q8 -18 15 2 Z"
            fill="#3d6b48" opacity="0.8" />

      {/* Reservatorio superior, em bacia escavada no planalto. */}
      <path d="M22 62 L206 62 L206 40 L22 40 Z" fill="#3a3327" />
      <path d="M28 60 L200 60 L200 44 L28 44 Z" fill="url(#rv-agua)" />
      <rect x="28" y="44" width="172" height="4" fill="#dff2ff" opacity="0.45" />
      <path d="M22 62 L28 44 M206 62 L200 44" stroke="#8b8676" strokeWidth="3.5" strokeLinecap="round" />

      {/* Reservatorio inferior, no fundo do vale. */}
      <path d="M252 214 L452 214 L452 186 L252 186 Z" fill="#3a3327" />
      <path d="M258 212 L446 212 L446 190 L258 190 Z" fill="url(#rv-agua)" />
      <rect x="258" y="190" width="188" height="5" fill="#dff2ff" opacity="0.45" />

      {/* Conduto escavado na rocha, e nao um tubo apoiado no ar. */}
      <path d={CONDUTO} stroke="#2b2519" strokeWidth="20" fill="none" strokeLinecap="round" />
      <path d={CONDUTO} stroke="url(#rv-aco)" strokeWidth="14" fill="none" strokeLinecap="round" />

      {/* Reversivel e uma usina de DOIS regimes que se revezam, e o desenho
          mostrava um so: um fluxo unico descendo para sempre, com as duas setas
          de legenda paradas. Assim ela ficava indistinguivel de uma usina
          comum, e a palavra reversivel nao aparecia em lugar nenhum do desenho.

          Agora os dois se alternam no mesmo conduto, em contrafase: enquanto um
          corre, o outro apaga. O ciclo e longo porque o que se alterna aqui e
          ponta e fora de ponta, que e questao de horas, nao de segundos. */}
      <path className="rv-gera" d={CONDUTO} stroke="#5ff2cd" strokeWidth="4.4" fill="none"
            strokeLinecap="round" strokeDasharray="10 12" />
      <path className="rv-bombeia" d="M268 196 C 250 152, 236 96, 196 66" stroke="#ffc94f" strokeWidth="4.4"
            fill="none" strokeLinecap="round" strokeDasharray="10 12" />

      {/* Caverna da bomba-turbina: o conjunto fica enterrado, nao pendurado. */}
      <ellipse cx="248" cy="150" rx="30" ry="24" fill="#1d1a12" opacity="0.75" />
      <g filter="url(#rv-sombra)">
        <circle cx="248" cy="150" r="19" fill="#2f8f70" stroke="#d9efe4" strokeWidth="1.8" />
      </g>
      <path d="M248 139 l7 9 h-4.5 v9 h-5 v-9 h-4.5 Z" fill="#ffd479" />

      <Etiqueta x={34} y={34} texto="reservatório SUPERIOR" cor="#bfe6ff" />
      <Etiqueta x={446} y={234} texto="reservatório INFERIOR" cor="#bfe6ff" ancora="end" />
      <Etiqueta x={286} y={140} texto="bomba-turbina reversível" />
      {/* As legendas acendem junto do regime que esta ativo, para o leitor ligar
          a seta ao fluxo em vez de ler os dois como se fossem simultaneos.
          Ficam a esquerda do conduto, que antes era atravessado pelo texto. */}
      <g className="rv-gera-rotulo">
        <path d="M64 104 L64 138" stroke="#37d39a" strokeWidth="4" markerEnd="url(#rv-seta)" />
        <Etiqueta x={76} y={116} texto="GERA na ponta (desce)" cor="#5ff2cd" />
      </g>
      <g className="rv-bombeia-rotulo">
        <path d="M64 210 L64 176" stroke="#e5a000" strokeWidth="4" markerEnd="url(#rv-seta)" />
        <Etiqueta x={76} y={198} texto="BOMBEIA fora de ponta (sobe)" cor="#ffc94f" />
      </g>
    </svg>
  );
}

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
      <DefsArranjo p="pb" />
      <rect width="460" height="240" fill="url(#pb-ceu)" />
      <path d="M0 96 L120 84 L210 96 L300 82 L392 96 L460 86 L460 118 L0 118 Z" fill="url(#pb-mato)" opacity="0.5" />
      <path d="M0 240 L460 240 L460 196 L266 196 L226 212 L180 212 L180 118 L0 118 Z" fill="url(#pb-rocha)" />
      <path d="M0 118 L180 118 L180 112 L0 112 Z" fill="#4c7a56" />
      <path d="M266 196 L460 196 L460 190 L266 190 Z" fill="#4c7a56" />

      <path d="M0 150 L180 150 L180 118 L0 118 Z" fill="url(#pb-agua)" />
      <rect x="0" y="118" width="180" height="5" fill="#dff2ff" opacity="0.4" />

      <g filter="url(#pb-sombra)">
        <path d="M180 118 L180 205 L226 205 L212 118 Z" fill="url(#pb-concreto)" />
        <path d="M178 116 L214 116 L215 124 L178 124 Z" fill="#e6e9e2" />
      </g>
      <g stroke="#959c94" strokeWidth="0.8" opacity="0.5">
        <path d="M189 120 L192 205 M199 120 L204 205" />
      </g>
      <path d="M186 130 L212 198" stroke="#2f373b" strokeWidth="11" strokeLinecap="round" />
      <path d="M186 130 L212 198" stroke="url(#pb-aco)" strokeWidth="8" strokeLinecap="round" />
      {/* A agua estava parada dentro do conduto e do canal, e arranjo de pe de
          barragem se explica justamente pelo percurso curto: o que o desenho
          precisa mostrar e que a restituicao acontece logo ali. */}
      <path className="arr-fluxo" d="M186 130 L212 198" stroke="#5ff2cd" strokeWidth="3.4"
            strokeLinecap="round" fill="none" />

      {/* Casa de forca com laje e volume, e nao caixa branca com telhado
          triangular verde. */}
      <g filter="url(#pb-sombra)">
        <path d="M212 176 L240 164 L268 176 L268 182 L240 171 L212 182 Z" fill="#93a29a" />
        <rect x="214" y="180" width="52" height="28" fill="#e9ece6" stroke="#7d867f" strokeWidth="1.3" />
      </g>
      <rect x="214" y="180" width="52" height="28" fill="url(#pb-concreto)" opacity="0.3" />
      <path d="M222 194 L258 194" stroke="#aab3ab" strokeWidth="1.6" />
      <circle cx="240" cy="199" r="6" fill="#40525c" stroke="#dfe7e2" strokeWidth="1.2" />

      <rect x="266" y="196" width="194" height="18" fill="url(#pb-agua)" />
      <rect x="266" y="196" width="194" height="4" fill="#dff2ff" opacity="0.4" />
      <path className="arr-fluxo" d="M272 205 L454 205" stroke="#eaf7ff" strokeWidth="3"
            strokeLinecap="round" fill="none" opacity="0.95" />

      <Etiqueta x={8} y={110} texto="reservatório" cor="#bfe6ff" />
      <Etiqueta x={172} y={232} texto="barragem" ancora="end" />
      <Etiqueta x={278} y={166} texto="casa de força no pé" />
      <Etiqueta x={452} y={232} texto="restituição imediata" cor="#a9c6bb" ancora="end" />
    </svg>
  );
}
function ArrDerivacao() {
  return (
    <svg viewBox="0 0 460 240" className="arr-svg" aria-label="Arranjo de derivação">
      <DefsArranjo p="dv" />
      <rect width="460" height="240" fill="url(#dv-ceu)" />
      <path d="M0 62 L96 44 L188 66 L286 40 L380 66 L460 48 L460 240 L0 240 Z" fill="url(#dv-mato)" opacity="0.55" />
      <path d="M0 240 L460 240 L460 132 C 360 128 300 150 236 150 C 170 150 120 122 0 118 Z"
            fill="url(#dv-rocha)" opacity="0.92" />

      {/* Leito natural. */}
      <path d="M0 90 Q120 70 200 96 T460 120" fill="none" stroke="#2b5e7f" strokeWidth="20" strokeLinecap="round" />
      <path d="M0 90 Q120 70 200 96 T460 120" fill="none" stroke="url(#dv-agua)" strokeWidth="15" strokeLinecap="round" />

      {/* Acude de derivacao. */}
      <g filter="url(#dv-sombra)">
        <path d="M56 72 L78 72 L75 116 L59 116 Z" fill="url(#dv-concreto)" />
        <path d="M56 72 L78 72 L78 78 L56 78 Z" fill="#eceee8" />
      </g>

      {/* Tunel e conduto ate a casa de forca afastada. */}
      <path d="M76 100 C 150 112 250 118 320 150" fill="none" stroke="#2b2519" strokeWidth="15" strokeLinecap="round" />
      <path d="M76 100 C 150 112 250 118 320 150" fill="none" stroke="url(#dv-aco)" strokeWidth="10" strokeLinecap="round" />
      {/* O desvio leva a vazao cheia, e e por isso que ele existe. */}
      <path className="arr-fluxo" d="M76 100 C 150 112 250 118 320 150" fill="none"
            stroke="#5ff2cd" strokeWidth="3.6" strokeLinecap="round" />

      {/* Trecho de vazao reduzida, desenhado como o que ele e.
          O leito natural continuava com o mesmo traco grosso do rio cheio, e o
          arranjo de derivacao se explica exatamente pelo contrario: entre a
          tomada e a restituicao, o rio fica com uma fracao da vazao. O fluxo
          aqui e mais fino e MUITO mais lento que o do desvio, e o contraste
          entre os dois ritmos e a licao do desenho, nao enfeite. */}
      <path className="arr-fluxo-tvr" d="M80 100 Q170 112 250 118 T460 126" fill="none"
            stroke="#a8cfe6" strokeWidth="2" strokeLinecap="round" opacity="0.85" />

      {/* Chamine de equilibrio: e um poco vertical, nao um circulo solto. */}
      <rect x="246" y="52" width="17" height="58" rx="3" fill="url(#dv-concreto)" stroke="#6f7772" strokeWidth="1.2" />
      <rect x="248" y="70" width="13" height="38" fill="url(#dv-agua)" opacity="0.9" />

      <g filter="url(#dv-sombra)">
        <path d="M316 146 L344 134 L372 146 L372 152 L344 141 L316 152 Z" fill="#93a29a" />
        <rect x="318" y="150" width="54" height="28" fill="#e9ece6" stroke="#7d867f" strokeWidth="1.3" />
      </g>
      <rect x="318" y="150" width="54" height="28" fill="url(#dv-concreto)" opacity="0.3" />
      <circle cx="345" cy="169" r="6" fill="#40525c" stroke="#dfe7e2" strokeWidth="1.2" />

      <path d="M372 166 Q420 178 460 170" fill="none" stroke="#2b5e7f" strokeWidth="15" strokeLinecap="round" />
      <path d="M372 166 Q420 178 460 170" fill="none" stroke="url(#dv-agua)" strokeWidth="11" strokeLinecap="round" />
      {/* Restituicao: a vazao desviada volta ao rio depois do TVR. */}
      <path className="arr-fluxo" d="M374 167 Q420 179 458 171" fill="none"
            stroke="#eaf7ff" strokeWidth="3" strokeLinecap="round" opacity="0.95" />

      <Etiqueta x={8} y={40} texto="açude de derivação" cor="#bfe6ff" />
      <Etiqueta x={250} y={44} texto="chaminé de equilíbrio" cor="#ffc94f" ancora="middle" />
      <Etiqueta x={120} y={128} texto="túnel + conduto forçado" />
      <Etiqueta x={452} y={200} texto="casa de força afastada" ancora="end" />
      <path d="M300 210 L268 128" stroke="#8fb8d6" strokeWidth="1.2" opacity="0.9" />
      <Etiqueta x={150} y={218} texto="trecho de vazão reduzida (TVR) no leito natural" cor="#a9c6bb" />
    </svg>
  );
}
function ArrFioAgua() {
  const painel = (x) => (
    <g>
      <rect x={x} y="38" width="212" height="196" rx="10" fill="#0f2119" opacity="0.35" />
      <rect x={x} y="38" width="212" height="196" rx="10" fill="none" stroke="#5d7a6c" strokeWidth="1.2" />
    </g>
  );
  return (
    <svg viewBox="0 0 460 240" className="arr-svg" aria-label="Fio d'água vs acumulação">
      <DefsArranjo p="fa" />
      <rect width="460" height="240" fill="url(#fa-ceu)" />
      {/* Os dois paineis eram retangulos BRANCOS numa pagina escura, e
          dominavam o desenho inteiro: o olho via duas folhas de papel antes de
          ver a diferenca entre os dois regimes, que e o assunto. */}
      {painel(8)}
      {painel(240)}

      {/* Fio d'agua: reservatorio raso, alagamento curto. */}
      <path d="M18 200 L214 200 L214 158 L18 158 Z" fill="url(#fa-rocha)" />
      <path d="M20 152 L112 152 L112 134 L20 134 Z" fill="url(#fa-agua)" />
      <rect x="20" y="134" width="92" height="3.5" fill="#dff2ff" opacity="0.45" />
      <path d="M112 134 L112 190 L140 190 L132 134 Z" fill="url(#fa-concreto)" />
      <path d="M138 174 L156 166 L174 174 L174 179 L156 170 L138 179 Z" fill="#93a29a" />
      <rect x="140" y="177" width="34" height="18" fill="#e9ece6" stroke="#7d867f" strokeWidth="1.1" />
      <path d="M174 186 L212 186" stroke="#2b5e7f" strokeWidth="11" strokeLinecap="round" />
      <path d="M174 186 L212 186" stroke="url(#fa-agua)" strokeWidth="8" strokeLinecap="round" />
      {/* Fio d'agua gera conforme o rio, entao a agua atravessa sem parar. */}
      <path className="arr-fluxo" d="M178 186 L208 186" stroke="#eaf7ff" strokeWidth="2.6"
            strokeLinecap="round" fill="none" />

      {/* Acumulacao: reservatorio fundo, com faixa de deplecionamento. */}
      <path d="M250 210 L446 210 L446 168 L250 168 Z" fill="url(#fa-rocha)" />
      <path d="M252 150 L362 168 L362 110 L252 110 Z" fill="url(#fa-agua)" />
      <rect x="252" y="110" width="110" height="4" fill="#dff2ff" opacity="0.5" />
      <path d="M252 132 L362 132" stroke="#ffc94f" strokeWidth="1.6" strokeDasharray="5 4" opacity="0.95" />
      <path d="M362 104 L362 200 L396 200 L384 104 Z" fill="url(#fa-concreto)" />
      <path d="M392 184 L410 176 L428 184 L428 189 L410 180 L392 189 Z" fill="#93a29a" />
      <rect x="394" y="187" width="34" height="18" fill="#e9ece6" stroke="#7d867f" strokeWidth="1.1" />
      <path d="M428 196 L450 196" stroke="#2b5e7f" strokeWidth="11" strokeLinecap="round" />
      <path d="M428 196 L450 196" stroke="url(#fa-agua)" strokeWidth="8" strokeLinecap="round" />

      <Etiqueta x={20} y={62} texto="FIO D'ÁGUA" cor="#bfe6ff" />
      <Etiqueta x={20} y={84} texto="reservatório mínimo" cor="#cfe0d6" pequena />
      <Etiqueta x={20} y={210} texto="gera conforme o rio" cor="#a9c6bb" pequena />
      <Etiqueta x={20} y={228} texto="alagamento menor" cor="#a9c6bb" pequena />
      <Etiqueta x={252} y={62} texto="ACUMULAÇÃO" cor="#5ff2cd" />
      <Etiqueta x={252} y={84} texto="estoca entre estações" cor="#cfe0d6" pequena />
      <Etiqueta x={252} y={210} texto="regulariza e firma energia" cor="#a9c6bb" pequena />
      <Etiqueta x={252} y={228} texto="deplecionamento (faixa)" cor="#ffc94f" pequena />
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
