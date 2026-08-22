import{n as e}from"./rolldown-runtime-Bh1tDfsg.js";import{$ as t,A as n,Ft as r,Gt as i,Jt as a,P as o,U as s,X as c,_t as l,a as u,gt as d,k as f,kt as p,mt as m,ot as h,p as g,qt as _,r as v,s as y}from"./vendor-icons-C5r0xN4z.js";import{t as ee}from"./vendor-react-D6m9Rg4C.js";/* empty css                    */import{t as b}from"./NormativeAuthorityAxes-aUvFaCbM.js";var x=e(a(),1),S=ee(),C=Object.freeze({"--hcm-d055":.55,"--hcm-d07":.7,"--hcm-d1":1,"--hcm-d11":1.1,"--hcm-d115":1.15,"--hcm-d125":1.25,"--hcm-d13":1.3,"--hcm-d15":1.5,"--hcm-d16":1.6,"--hcm-d22":2.2,"--hcm-d24":2.4,"--hcm-d7":7,"--hcm-d9":9}),w=Object.freeze({.55:`--hcm-d055`,.7:`--hcm-d07`,1:`--hcm-d1`,1.1:`--hcm-d11`,1.15:`--hcm-d115`,1.25:`--hcm-d125`,1.3:`--hcm-d13`,1.5:`--hcm-d15`,1.6:`--hcm-d16`,2.2:`--hcm-d22`,2.4:`--hcm-d24`,7:`--hcm-d7`,9:`--hcm-d9`});function T(){let[e,t]=(0,x.useState)(!1);return(0,x.useEffect)(()=>{if(typeof window>`u`||typeof window.matchMedia!=`function`)return;let e=window.matchMedia(`(prefers-reduced-motion: reduce)`),n=()=>t(e.matches);return n(),e.addEventListener?.(`change`,n),()=>e.removeEventListener?.(`change`,n)},[]),e}function te(e){let[t,n]=(0,x.useState)(!0);return(0,x.useEffect)(()=>{if(typeof IntersectionObserver!=`function`||!e.current)return;let t=new IntersectionObserver(([e])=>n(e.isIntersecting),{rootMargin:`120px 0px`,threshold:.04});return t.observe(e.current),()=>t.disconnect()},[e]),t}function E(e){let t=100/e;return Object.fromEntries(Object.entries(C).map(([e,n])=>[e,`${Math.max(.18,n*t).toFixed(3)}s`]))}function D(e=100){let t=(0,x.useRef)(null),n=T(),r=te(t),[i,a]=(0,x.useState)(!0),[o,s]=(0,x.useState)(e);return(0,x.useEffect)(()=>{n&&a(!1)},[n]),{sceneRef:t,playing:i,setPlaying:a,speed:o,setSpeed:s,reducedMotion:n,motionActive:i&&r&&!n,surfaceStyle:E(o)}}function O({motion:e,context:t}){let r=`hcm-speed-${(0,x.useId)().replace(/:/g,``)}`,i=e.reducedMotion?`Movimento reduzido ativo`:e.motionActive?`${t} em movimento`:`${t} pausada`;return(0,S.jsxs)(`div`,{className:`hcm-toolbar`,children:[(0,S.jsxs)(`span`,{className:`hcm-motion-status`,role:`status`,"aria-live":`polite`,children:[(0,S.jsx)(`i`,{"aria-hidden":`true`}),i]}),(0,S.jsxs)(`div`,{className:`hcm-motion-controls`,children:[(0,S.jsxs)(`label`,{htmlFor:r,className:`hcm-speed-control`,children:[(0,S.jsxs)(`span`,{children:[`Velocidade visual `,(0,S.jsxs)(`strong`,{children:[e.speed,`%`]})]}),(0,S.jsx)(`input`,{id:r,type:`range`,min:`50`,max:`150`,step:`10`,value:e.speed,disabled:e.reducedMotion,"aria-valuetext":`${e.speed}% da velocidade visual`,onChange:t=>e.setSpeed(Number(t.target.value))})]}),(0,S.jsxs)(`button`,{type:`button`,className:`hcm-play`,disabled:e.reducedMotion,"aria-pressed":e.motionActive,"aria-label":e.motionActive?`Pausar ${t.toLowerCase()}`:`Reproduzir ${t.toLowerCase()}`,onClick:()=>e.setPlaying(e=>!e),children:[e.motionActive?(0,S.jsx)(n,{"aria-hidden":`true`}):(0,S.jsx)(f,{"aria-hidden":`true`}),e.motionActive?`Pausar`:`Reproduzir`]})]})]})}function k({dash:e,duration:t,className:n=``,style:r,...i}){let a=e.reduce((e,t)=>e+t,0),o=w[t]||w[1];return(0,S.jsx)(`path`,{...i,className:`${n} hcm-flow`.trim(),strokeDasharray:e.join(` `),style:{...r,"--hcm-dash-period":`${a}px`,"--hcm-flow-duration":`var(${o})`}})}function A(e){if(![`ArrowLeft`,`ArrowRight`,`Home`,`End`].includes(e.key))return;let t=[...e.currentTarget.querySelectorAll(`[role="tab"]`)],n=t.indexOf(document.activeElement);if(n<0)return;e.preventDefault();let r=n;e.key===`Home`&&(r=0),e.key===`End`&&(r=t.length-1),e.key===`ArrowLeft`&&(r=(n-1+t.length)%t.length),e.key===`ArrowRight`&&(r=(n+1)%t.length),t[r]?.focus(),t[r]?.click()}var j=`/academia-iat/`.replace(/\/$/,``),ne={"Peltonturbine-1.jpg":j+`/hidro/turbina-pelton.jpg`,"Francis_Turbine_complete.jpg":j+`/hidro/turbina-francis.jpg`,"Kaplan_turbine_bonneville.jpg":j+`/hidro/turbina-kaplan.jpg`},re=e=>ne[e],ie={"Peltonturbine-1.jpg":[587,800],"Francis_Turbine_complete.jpg":[456,461],"Kaplan_turbine_bonneville.jpg":[294,375]},M=e=>`https://commons.wikimedia.org/wiki/File:${e}`;function N({p:e}){return(0,S.jsxs)(`defs`,{children:[(0,S.jsxs)(`linearGradient`,{id:e+`-aco`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#eef3f5`}),(0,S.jsx)(`stop`,{offset:`0.42`,stopColor:`#adb9c0`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#586269`})]}),(0,S.jsxs)(`linearGradient`,{id:e+`-bronze`,x1:`0.1`,y1:`0`,x2:`0.9`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#9df0d2`}),(0,S.jsx)(`stop`,{offset:`0.45`,stopColor:`#43c294`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#186b50`})]}),(0,S.jsxs)(`linearGradient`,{id:e+`-agua`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#a6e0fb`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#2477ad`})]}),(0,S.jsxs)(`linearGradient`,{id:e+`-concreto`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#8d968f`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#5c645e`})]}),(0,S.jsxs)(`radialGradient`,{id:e+`-cubo`,cx:`0.34`,cy:`0.28`,r:`0.85`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#dde5e9`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#414f57`})]}),(0,S.jsx)(`filter`,{id:e+`-sombra`,x:`-30%`,y:`-30%`,width:`170%`,height:`170%`,children:(0,S.jsx)(`feDropShadow`,{dx:`2`,dy:`3`,stdDeviation:`2.2`,floodColor:`#06100d`,floodOpacity:`0.5`})})]})}function ae(){let e=Array.from({length:12},(e,t)=>t*30);return(0,S.jsxs)(`svg`,{viewBox:`0 0 300 220`,className:`turb-svg`,role:`img`,"aria-label":`Esquema de turbina Pelton`,children:[(0,S.jsx)(N,{p:`pel`}),(0,S.jsx)(`path`,{d:`M96 198 L292 198 L292 214 L96 214 Z`,fill:`url(#pel-agua)`,opacity:`0.55`}),(0,S.jsx)(`path`,{d:`M96 198 L292 198`,stroke:`#cfeaff`,strokeWidth:`2`,opacity:`0.5`}),(0,S.jsxs)(`g`,{className:`hcm-pelton-rotor`,"data-rotor":`pelton`,children:[(0,S.jsx)(`g`,{filter:`url(#pel-sombra)`,children:(0,S.jsx)(`circle`,{cx:`178`,cy:`112`,r:`41`,fill:`url(#pel-aco)`,stroke:`#48545b`,strokeWidth:`1.6`})}),(0,S.jsx)(`g`,{stroke:`#7f8c93`,strokeWidth:`3`,opacity:`0.75`,children:(0,S.jsx)(`path`,{d:`M178 73 L178 151 M139 112 L217 112 M150 84 L206 140 M206 84 L150 140`})}),(0,S.jsx)(`circle`,{cx:`178`,cy:`112`,r:`27`,fill:`none`,stroke:`#93a0a7`,strokeWidth:`1`,opacity:`0.6`}),e.map(e=>(0,S.jsxs)(`g`,{transform:`rotate(${e} 178 112)`,children:[(0,S.jsx)(`path`,{d:`M178 38 c -12 0 -19 6 -19 13 c 0 8 8 15 19 15 c 11 0 19 -7 19 -15 c 0 -7 -7 -13 -19 -13 Z`,fill:`url(#pel-bronze)`,stroke:`#14584180`,strokeWidth:`1.2`}),(0,S.jsx)(`path`,{d:`M178 39 L178 65`,stroke:`#0d4634`,strokeWidth:`1.4`,opacity:`0.85`}),(0,S.jsx)(`path`,{d:`M170 44 c -5 2 -7 7 -6 12`,stroke:`#e7fff5`,strokeWidth:`1.6`,fill:`none`,opacity:`0.65`})]},e)),(0,S.jsx)(`circle`,{cx:`178`,cy:`112`,r:`15`,fill:`url(#pel-cubo)`,stroke:`#3c484f`,strokeWidth:`1.4`}),(0,S.jsx)(`circle`,{cx:`178`,cy:`112`,r:`4`,fill:`#2b353b`})]}),(0,S.jsx)(`g`,{filter:`url(#pel-sombra)`,children:(0,S.jsx)(`path`,{d:`M4 92 L40 92 L60 102 L72 107 L72 119 L60 124 L40 134 L4 134 Z`,fill:`url(#pel-aco)`,stroke:`#48545b`,strokeWidth:`1.4`})}),(0,S.jsx)(`path`,{d:`M36 102 L60 110 L60 116 L36 124 Z`,fill:`#5a666d`}),(0,S.jsx)(`rect`,{x:`2`,y:`90`,width:`7`,height:`46`,rx:`2`,fill:`#8f9ba1`,stroke:`#48545b`,strokeWidth:`1.2`}),(0,S.jsx)(`path`,{d:`M10 98 L34 98`,stroke:`#eaf2f5`,strokeWidth:`1.6`,opacity:`0.5`}),(0,S.jsx)(`path`,{d:`M74 113 L106 113`,stroke:`#5fc3ea`,strokeWidth:`9`,strokeLinecap:`round`,opacity:`0.35`}),(0,S.jsx)(k,{d:`M74 113 L106 113`,stroke:`#8fdcff`,strokeWidth:`9`,strokeLinecap:`round`,className:`jet-anim`,dash:[8,10],duration:1}),(0,S.jsx)(k,{className:`pelton-deflete`,dash:[4,10],duration:.55,d:`M112 106 q-16 -12 -32 -16`,stroke:`#bfe6ff`,strokeWidth:`3`,fill:`none`,strokeLinecap:`round`}),(0,S.jsx)(k,{className:`pelton-deflete`,dash:[4,10],duration:.55,d:`M112 120 q-16 12 -32 16`,stroke:`#bfe6ff`,strokeWidth:`3`,fill:`none`,strokeLinecap:`round`}),(0,S.jsx)(`text`,{x:`8`,y:`84`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`bocal / injetor`}),(0,S.jsx)(`text`,{x:`294`,y:`26`,textAnchor:`end`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`conchas (dupla colher)`})]})}function oe(){let e=[[`M223 131 A78 78 0 0 1 123 177`,24],[`M123 177 A78 78 0 0 1 77 77`,19],[`M77 77 A78 78 0 0 1 177 31`,15],[`M177 31 A78 78 0 0 1 227 90`,11]];return(0,S.jsxs)(`svg`,{viewBox:`0 0 300 220`,className:`turb-svg`,role:`img`,"aria-label":`Esquema de turbina Francis`,children:[(0,S.jsx)(N,{p:`fra`}),(0,S.jsx)(`path`,{d:`M222 117 L298 104 L298 150 L228 146 Z`,fill:`url(#fra-aco)`,stroke:`#4a565d`,strokeWidth:`1.4`}),e.map(([e,t],n)=>(0,S.jsx)(`path`,{d:e,fill:`none`,stroke:`#7d8990`,strokeWidth:t+3,strokeLinecap:`round`},n)),e.map(([e,t],n)=>(0,S.jsx)(`path`,{d:e,fill:`none`,stroke:`url(#fra-agua)`,strokeWidth:t,strokeLinecap:`round`},`i`+n)),(0,S.jsx)(k,{className:`fr-radial`,dash:[12,20],duration:1.6,d:`M223 131 A78 78 0 0 1 123 177 A78 78 0 0 1 77 77 A78 78 0 0 1 177 31`,fill:`none`,stroke:`#e2f4ff`,strokeWidth:`4`,strokeLinecap:`round`}),Array.from({length:14},(e,t)=>t*25.7).map(e=>(0,S.jsx)(`g`,{transform:`rotate(${e} 150 104)`,children:(0,S.jsx)(`path`,{d:`M150 66 q6 4 5 11 q-1 6 -6 9 q4 -10 1 -20 Z`,fill:`#9fb0b8`,stroke:`#5d686f`,strokeWidth:`0.9`})},e)),(0,S.jsx)(`circle`,{cx:`150`,cy:`104`,r:`34`,fill:`#26343a`,opacity:`0.35`}),(0,S.jsx)(`rect`,{x:`145`,y:`14`,width:`11`,height:`80`,rx:`2`,fill:`url(#fra-aco)`,stroke:`#4a565d`,strokeWidth:`1.1`}),(0,S.jsx)(`g`,{className:`spin-slow`,children:Array.from({length:9},(e,t)=>t*40).map(e=>(0,S.jsx)(`g`,{transform:`rotate(${e} 150 104)`,children:(0,S.jsx)(`path`,{d:`M150 76 q13 8 14 20 q1 10 -8 16 q6 -14 -2 -24 q-4 -6 -10 -8 Z`,fill:`url(#fra-bronze)`,stroke:`#12684c`,strokeWidth:`0.9`})},e))}),(0,S.jsx)(`circle`,{cx:`150`,cy:`104`,r:`12`,fill:`url(#fra-cubo)`,stroke:`#3c484f`,strokeWidth:`1.2`}),(0,S.jsx)(`path`,{d:`M132 136 L168 136 L186 198 L114 198 Z`,fill:`url(#fra-agua)`,opacity:`0.85`}),(0,S.jsx)(`path`,{d:`M132 136 L114 198 M168 136 L186 198`,stroke:`#7d8990`,strokeWidth:`2.4`}),(0,S.jsx)(k,{className:`fr-axial`,dash:[8,14],duration:2.4,d:`M150 140 L150 194`,stroke:`#eaf7ff`,strokeWidth:`3`,strokeLinecap:`round`,fill:`none`}),(0,S.jsx)(`text`,{x:`206`,y:`90`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`caixa espiral`}),(0,S.jsx)(`path`,{d:`M62 40 L118 74`,stroke:`#8fa79a`,strokeWidth:`1.2`,opacity:`0.8`}),(0,S.jsx)(`text`,{x:`6`,y:`34`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`distribuidor`}),(0,S.jsx)(`text`,{x:`150`,y:`216`,textAnchor:`middle`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`tubo de sucção`})]})}function se(){let e=`M0 78 L118 78 Q 148 78 148 114 L148 150 Q 148 184 188 192 L300 198`;return(0,S.jsxs)(`svg`,{viewBox:`0 0 300 220`,className:`turb-svg`,role:`img`,"aria-label":`Esquema de turbina Kaplan`,children:[(0,S.jsx)(N,{p:`kap`}),(0,S.jsx)(`rect`,{x:`0`,y:`0`,width:`300`,height:`220`,fill:`url(#kap-concreto)`,opacity:`0.5`}),(0,S.jsx)(`path`,{d:e,fill:`none`,stroke:`#4e5751`,strokeWidth:`72`,strokeLinejoin:`round`}),(0,S.jsx)(`path`,{d:e,fill:`none`,stroke:`url(#kap-agua)`,strokeWidth:`58`,strokeLinejoin:`round`,opacity:`0.92`}),(0,S.jsx)(k,{className:`kp-fluxo`,dash:[9,13],duration:1.3,d:e,fill:`none`,stroke:`#eaf7ff`,strokeWidth:`3`,strokeLinecap:`round`,opacity:`0.9`}),(0,S.jsx)(`rect`,{x:`112`,y:`104`,width:`9`,height:`22`,rx:`2`,fill:`#9fb0b8`,stroke:`#5d686f`,strokeWidth:`0.9`}),(0,S.jsx)(`rect`,{x:`176`,y:`104`,width:`9`,height:`22`,rx:`2`,fill:`#9fb0b8`,stroke:`#5d686f`,strokeWidth:`0.9`}),(0,S.jsx)(`path`,{className:`kp-passo kp-passo--left`,d:`M144 140 q-16 -6 -34 -2 q3 11 15 15 q13 3 21 -4 Z`,fill:`url(#kap-bronze)`,stroke:`#12684c`,strokeWidth:`1.1`}),(0,S.jsx)(`path`,{className:`kp-passo kp-passo--right`,d:`M152 140 q16 -6 34 -2 q-3 11 -15 15 q-13 3 -21 -4 Z`,fill:`url(#kap-bronze)`,stroke:`#12684c`,strokeWidth:`1.1`}),(0,S.jsx)(`ellipse`,{cx:`148`,cy:`138`,rx:`13`,ry:`17`,fill:`url(#kap-cubo)`,stroke:`#3c484f`,strokeWidth:`1.4`}),(0,S.jsx)(k,{className:`hcm-kaplan-rotation`,dash:[5,7],duration:1.1,d:`M128 126 Q148 115 168 126`,fill:`none`,stroke:`#5ff2cd`,strokeWidth:`2`,strokeLinecap:`round`,opacity:`0.9`}),(0,S.jsx)(k,{className:`hcm-kaplan-rotation hcm-flow--reverse`,dash:[5,7],duration:1.1,d:`M128 155 Q148 166 168 155`,fill:`none`,stroke:`#5ff2cd`,strokeWidth:`2`,strokeLinecap:`round`,opacity:`0.9`}),(0,S.jsx)(`rect`,{x:`141`,y:`28`,width:`15`,height:`96`,rx:`2`,fill:`url(#kap-aco)`,stroke:`#4a565d`,strokeWidth:`1.1`}),(0,S.jsx)(`rect`,{x:`120`,y:`12`,width:`58`,height:`20`,rx:`4`,fill:`#c3ccc6`,stroke:`#4a565d`,strokeWidth:`1.2`}),(0,S.jsx)(`text`,{x:`149`,y:`26`,textAnchor:`middle`,fontSize:`10`,fill:`#2c3a33`,fontWeight:`700`,children:`gerador`}),(0,S.jsx)(`text`,{x:`6`,y:`26`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`fluxo axial`}),(0,S.jsx)(`path`,{d:`M232 106 L190 132`,stroke:`#8fa79a`,strokeWidth:`1.2`,opacity:`0.85`}),(0,S.jsx)(`text`,{x:`296`,y:`102`,textAnchor:`end`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`pás AJUSTÁVEIS`}),(0,S.jsx)(`text`,{x:`296`,y:`216`,textAnchor:`end`,fontSize:`10`,fill:`#a9bdb3`,children:`tubo de sucção`})]})}function ce(){return(0,S.jsxs)(`svg`,{viewBox:`0 0 300 220`,className:`turb-svg`,role:`img`,"aria-label":`Esquema de turbina bulbo`,children:[(0,S.jsx)(N,{p:`bul`}),(0,S.jsx)(`path`,{d:`M0 30 L300 30 L300 58 L0 58 Z`,fill:`url(#bul-concreto)`}),(0,S.jsx)(`path`,{d:`M0 178 L300 178 L300 210 L0 210 Z`,fill:`url(#bul-concreto)`}),(0,S.jsx)(`path`,{d:`M0 58 L300 58 L300 178 L0 178 Z`,fill:`url(#bul-agua)`,opacity:`0.75`}),(0,S.jsx)(k,{className:`bl-fluxo`,dash:[11,15],duration:1.25,d:`M4 92 Q 60 92 92 78 T 200 88 T 298 96`,fill:`none`,stroke:`#eaf7ff`,strokeWidth:`3.2`,strokeLinecap:`round`,opacity:`0.9`}),(0,S.jsx)(k,{className:`bl-fluxo`,dash:[11,15],duration:1.25,d:`M4 148 Q 60 148 92 158 T 200 148 T 298 140`,fill:`none`,stroke:`#eaf7ff`,strokeWidth:`3.2`,strokeLinecap:`round`,opacity:`0.9`}),(0,S.jsx)(`path`,{d:`M112 82 L106 30 L132 30 L128 82 Z`,fill:`url(#bul-aco)`,stroke:`#4a565d`,strokeWidth:`1.2`,opacity:`0.95`}),(0,S.jsx)(`g`,{filter:`url(#bul-sombra)`,children:(0,S.jsx)(`path`,{d:`M36 118 C 36 92 64 80 100 80 L148 80 C 172 80 188 96 196 112 L202 116 L202 120 L196 124 C 188 140 172 156 148 156 L100 156 C 64 156 36 144 36 118 Z`,fill:`url(#bul-aco)`,stroke:`#48545b`,strokeWidth:`1.6`})}),(0,S.jsx)(`path`,{d:`M52 104 C 62 92 82 88 104 88`,stroke:`#f2f8fa`,strokeWidth:`2.4`,fill:`none`,opacity:`0.55`}),(0,S.jsx)(`rect`,{x:`70`,y:`100`,width:`86`,height:`36`,rx:`6`,fill:`#22303a`,opacity:`0.92`}),(0,S.jsx)(`g`,{stroke:`#5fd7ae`,strokeWidth:`2`,opacity:`0.85`,fill:`none`,children:(0,S.jsx)(`path`,{d:`M82 108 L82 128 M92 106 L92 130 M102 108 L102 128`})}),(0,S.jsx)(`circle`,{className:`hcm-bulbo-generator`,cx:`120`,cy:`118`,r:`11`,fill:`url(#bul-cubo)`,stroke:`#5fd7ae`,strokeWidth:`1.2`}),(0,S.jsx)(`text`,{x:`137`,y:`122`,fontSize:`10`,fill:`#8fe3cf`,fontWeight:`700`,children:`gerador`}),(0,S.jsxs)(`g`,{className:`hcm-bulbo-rotor`,"data-rotor":`bulbo`,children:[(0,S.jsx)(`path`,{d:`M212 108 q4 -30 12 -40 q10 8 6 24 q-4 12 -12 18 Z`,fill:`url(#bul-bronze)`,stroke:`#12684c`,strokeWidth:`1.1`}),(0,S.jsx)(`path`,{d:`M212 128 q4 30 12 40 q10 -8 6 -24 q-4 -12 -12 -18 Z`,fill:`url(#bul-bronze)`,stroke:`#12684c`,strokeWidth:`1.1`}),(0,S.jsx)(`ellipse`,{cx:`211`,cy:`118`,rx:`10`,ry:`15`,fill:`url(#bul-cubo)`,stroke:`#3c484f`,strokeWidth:`1.3`})]}),(0,S.jsx)(`path`,{d:`M198 110 L204 110 M198 126 L204 126`,stroke:`#5d686f`,strokeWidth:`2`}),(0,S.jsx)(`text`,{x:`294`,y:`196`,textAnchor:`end`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`conjunto horizontal submerso`})]})}var P=[{id:`pelton`,nome:`Pelton`,camada:fe,Svg:ae,vazao:`Vazão baixa`,legenda:`Jato em pressão atmosférica: turbina de AÇÃO.`,foto:`Peltonturbine-1.jpg`,tipo:`Ação (impulso)`,faixa:`Quedas altas: acima de ~250 m`,usoPR:`UHE Gov. Parigot de Souza (Antonina): 4 unidades Pelton, com desnível de 754 m.`,partes:[[`Bocal e injetor`,`Concentram e regulam o jato de água.`],[`Conchas de dupla colher`,`Recebem o jato e desviam a água para os lados.`],[`Rotor, cubo e eixo`,`Giram como um único conjunto e transmitem torque ao gerador.`],[`Poço de descarga`,`Recebe a água já em pressão atmosférica.`]]},{id:`francis`,nome:`Francis`,camada:I,Svg:oe,vazao:`Vazão média`,legenda:`Fluxo radial que vira axial, sob pressão: turbina de REAÇÃO.`,foto:`Francis_Turbine_complete.jpg`,tipo:`Reação`,faixa:`Quedas médias: ~30 a 400 m`,usoPR:`UHE Foz do Areia (Pinhão): 4 Francis de 419 MW. Também Itaipu (20 unidades).`,partes:[[`Caixa espiral`,`Distribui a água ao redor de todo o rotor.`],[`Distribuidor`,`Palhetas móveis orientam e regulam o fluxo radial.`],[`Rotor Francis`,`Converte o fluxo radial em rotação e saída axial.`],[`Tubo de sucção`,`Recupera parte da energia e devolve a água a jusante.`]]},{id:`kaplan`,nome:`Kaplan`,camada:R,Svg:se,vazao:`Vazão alta`,legenda:`Hélice de passo variável: mantém rendimento com vazão variável.`,foto:`Kaplan_turbine_bonneville.jpg`,tipo:`Reação (pás ajustáveis)`,faixa:`Quedas baixas: ~10 a 70 m`,usoPR:`UHE Baixo Iguaçu (Capanema): 3 Kaplan de ~117 MW, a fio d'água.`,partes:[[`Conduto axial`,`Mantém a água aproximadamente paralela ao eixo.`],[`Distribuidor`,`Regula a vazão e prepara o giro antes do rotor.`],[`Pás ajustáveis`,`Mudam o passo para acompanhar a condição de vazão.`],[`Eixo e gerador`,`Levam o torque do rotor ao gerador acima.`]]},{id:`bulbo`,nome:`Bulbo`,Svg:ce,vazao:`Vazão muito alta`,legenda:`Conjunto horizontal submerso no próprio fluxo, para quedas muito baixas.`,foto:null,tipo:`Reação (horizontal)`,faixa:`Quedas muito baixas: abaixo de ~15 m`,usoPR:`Sem unidade em operação no PR; no Brasil é típica das UHEs do rio Madeira (RO).`,partes:[[`Carcaça hidrodinâmica`,`Abriga o gerador dentro do próprio canal.`],[`Gerador`,`Recebe o torque pelo eixo horizontal.`],[`Rotor axial`,`Trabalha submerso e alinhado ao fluxo.`],[`Suporte estrutural`,`Fixa o conjunto à estrutura civil.`]]}];function le(e){let t=String(e??``).trim().toLocaleLowerCase(`pt-BR`);return P.find(e=>e.id===t||e.nome.toLocaleLowerCase(`pt-BR`)===t)?.id}function ue({src:e,alt:t,w:n,h:r,credito:i,notas:a,children:o}){return(0,S.jsxs)(`figure`,{className:`tg-photo`,children:[a?.length?(0,S.jsx)(`p`,{className:`sr-only`,children:`Sobre a fotografia, a camada assinala: ${a.join(`; `)}.`}):null,(0,S.jsxs)(`div`,{className:`fa-palco`,style:{aspectRatio:`${n} / ${r}`},children:[(0,S.jsx)(`img`,{src:e,alt:t}),(0,S.jsxs)(`svg`,{className:`fa-camada`,viewBox:`0 0 ${n} ${r}`,"aria-hidden":`true`,preserveAspectRatio:`xMidYMid slice`,children:[(0,S.jsx)(`defs`,{children:(0,S.jsx)(`marker`,{id:`fa-ponta`,viewBox:`0 0 10 10`,refX:`8`,refY:`5`,markerWidth:`4.6`,markerHeight:`4.6`,orient:`auto-start-reverse`,children:(0,S.jsx)(`path`,{d:`M0 1 L9 5 L0 9 Z`,fill:`context-stroke`})})}),o]})]}),i]})}function F({x:e,y:t,texto:n,ancora:r,ate:i}){let a=n.length*6.2+16,o=r===`end`?e-a:e,s=r===`end`?e-8:e+8;return(0,S.jsxs)(`g`,{children:[i?(0,S.jsx)(`path`,{d:`M${r===`end`?o:o+a} ${t-3} L${i[0]} ${i[1]}`,stroke:`#eaf7ff`,strokeWidth:`1.3`,opacity:`0.9`,fill:`none`}):null,(0,S.jsx)(`rect`,{x:o,y:t-13,width:a,height:19,rx:7,fill:`#081813`,opacity:`0.82`}),(0,S.jsx)(`text`,{x:s,y:t+1,textAnchor:r===`end`?`end`:`start`,fontSize:`11.5`,fontWeight:`700`,fill:`#eaf7ff`,children:n})]})}var de=[{x:579,y:30,ancora:`end`,texto:`o jato bate na aresta divisora`,ate:[470,124]},{x:8,y:44,texto:`cubo e eixo`,ate:[176,330]},{x:8,y:772,texto:`concha em dupla colher`,ate:[258,690]}];function fe(){return(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`path`,{className:`fa-rot`,d:`M120 190 A 272 340 0 0 1 404 106`,markerEnd:`url(#fa-ponta)`}),(0,S.jsx)(`circle`,{className:`fa-alvo`,cx:`452`,cy:`150`,r:`46`}),(0,S.jsx)(k,{className:`fa-jato`,dash:[9,11],duration:.7,d:`M566 44 L470 128`,markerEnd:`url(#fa-ponta)`}),de.map(e=>(0,S.jsx)(F,{...e},e.texto))]})}fe.chapas=de;var pe=[{x:452,y:16,ancora:`end`,texto:`entrada sob pressão`,ate:[386,40]},{x:6,y:22,texto:`caixa espiral: a seção diminui`,ate:[248,86]},{x:6,y:400,texto:`eixo e gerador`,ate:[172,216]},{x:6,y:434,texto:`distribuidor (palhetas móveis)`,ate:[245,230]},{x:452,y:440,ancora:`end`,texto:`tubo de sucção`,ate:[356,338]}];function I(){return(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(k,{className:`fa-fluxo`,dash:[8,10],duration:1.5,d:`M424 12 L380 44`,markerEnd:`url(#fa-ponta)`}),(0,S.jsx)(`circle`,{className:`fa-alvo`,cx:`292`,cy:`210`,r:`60`}),(0,S.jsx)(`path`,{className:`fa-rot`,d:`M232 196 A 66 66 0 0 1 340 178`,markerEnd:`url(#fa-ponta)`}),(0,S.jsx)(k,{className:`fa-fluxo`,dash:[8,10],duration:1.5,d:`M330 300 L362 346`,markerEnd:`url(#fa-ponta)`}),pe.map(e=>(0,S.jsx)(F,{...e},e.texto))]})}I.chapas=pe;var L=[{x:4,y:22,texto:`eixo vertical`,ate:[126,58]},{x:290,y:22,ancora:`end`,texto:`fluxo axial desce`,ate:[252,106]},{x:4,y:360,texto:`pás do rotor`,ate:[112,202]}];function R(){return(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(k,{className:`fa-fluxo`,dash:[8,10],duration:1.5,d:`M62 112 C 74 158 92 178 118 192`,markerEnd:`url(#fa-ponta)`}),(0,S.jsx)(k,{className:`fa-fluxo`,dash:[8,10],duration:1.5,d:`M256 112 C 244 158 226 178 202 192`,markerEnd:`url(#fa-ponta)`}),(0,S.jsx)(`circle`,{className:`fa-alvo`,cx:`162`,cy:`186`,r:`34`}),(0,S.jsx)(`path`,{className:`fa-rot`,d:`M126 178 A 38 38 0 0 1 196 170`,markerEnd:`url(#fa-ponta)`}),L.map(e=>(0,S.jsx)(F,{...e},e.texto))]})}R.chapas=L;function me({selectedType:e,onSelectType:n}){let i=D(),[a,o]=(0,x.useState)(P[0].id),c=(0,x.useId)().replace(/:/g,``),l=e===void 0?void 0:le(e),u=l!==void 0,d=l||a,f=P.find(e=>e.id===d)||P[0];function p(e){u||o(e),n?.(e)}return(0,S.jsxs)(`div`,{ref:i.sceneRef,className:`turb-gallery hydro-motion-surface hcm-turbine-motion`,style:i.surfaceStyle,"data-motion-state":i.motionActive?`running`:`paused`,"data-playing":i.playing?`true`:`false`,children:[(0,S.jsx)(O,{motion:i,context:`Animação da turbina ${f.nome}`}),(0,S.jsx)(`div`,{className:`tg-tabs hcm-tabs`,role:`tablist`,"aria-label":`Tipo de turbina`,onKeyDown:A,children:P.map(e=>{let t=e.id===f.id;return(0,S.jsx)(`button`,{type:`button`,id:`${c}-tab-${e.id}`,role:`tab`,"aria-selected":t,"aria-controls":`${c}-panel`,tabIndex:t?0:-1,className:t?`active`:``,onClick:()=>p(e.id),children:e.nome},e.id)})}),(0,S.jsxs)(`div`,{id:`${c}-panel`,className:`tg-body`,role:`tabpanel`,"aria-labelledby":`${c}-tab-${f.id}`,children:[(0,S.jsxs)(`p`,{className:`hcm-current-state`,children:[(0,S.jsx)(`strong`,{children:`Em exibição:`}),` turbina `,f.nome,`. As linhas claras mostram o percurso da água; as peças móveis destacam como a energia chega ao eixo.`]}),(0,S.jsxs)(`figure`,{className:`tg-schema`,children:[(0,S.jsx)(f.Svg,{}),(0,S.jsxs)(`figcaption`,{children:[(0,S.jsxs)(`span`,{className:`tg-cap-t`,children:[`Esquema: `,f.nome,` (`,f.tipo.toLowerCase(),`)`]}),(0,S.jsx)(`span`,{className:`tg-cap-d`,children:f.legenda})]})]}),f.foto?(0,S.jsx)(ue,{src:re(f.foto),alt:`Foto real de turbina ${f.nome}`,w:ie[f.foto][0],h:ie[f.foto][1],notas:f.camada?.chapas?.map(e=>e.texto),credito:(0,S.jsxs)(`figcaption`,{children:[(0,S.jsx)(r,{size:13}),` Foto real anotada · `,(0,S.jsx)(`a`,{href:M(f.foto),target:`_blank`,rel:`noreferrer`,children:`Wikimedia Commons`}),` (licença livre)`]}),children:f.camada?(0,S.jsx)(f.camada,{}):null}):(0,S.jsxs)(`div`,{className:`tg-nophoto`,children:[(0,S.jsx)(t,{}),(0,S.jsx)(`p`,{children:`Sem foto de licença livre confirmada para bulbo: o esquema ao lado mostra o conjunto gerador submerso no próprio fluxo.`})]}),(0,S.jsxs)(`div`,{className:`tg-info`,children:[(0,S.jsxs)(`h3`,{children:[`Turbina `,f.nome]}),(0,S.jsxs)(`p`,{children:[(0,S.jsx)(`strong`,{children:f.tipo}),` · `,f.faixa,f.vazao?` · `+f.vazao:``]}),(0,S.jsxs)(`p`,{className:`tg-pr`,children:[(0,S.jsx)(s,{size:14}),` `,(0,S.jsx)(`strong`,{children:`No Paraná:`}),` `,f.usoPR]})]}),(0,S.jsxs)(`section`,{className:`hcm-equipment-key`,"aria-label":`Componentes da turbina ${f.nome}`,children:[(0,S.jsx)(`h3`,{children:`Como identificar os componentes`}),(0,S.jsx)(`ol`,{children:f.partes.map(([e,t],n)=>(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`span`,{"aria-hidden":`true`,children:n+1}),(0,S.jsxs)(`p`,{children:[(0,S.jsx)(`strong`,{children:e}),t]})]},e))})]})]})]})}function z({p:e}){return(0,S.jsxs)(`defs`,{children:[(0,S.jsxs)(`linearGradient`,{id:e+`-ceu`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#6ea9d6`}),(0,S.jsx)(`stop`,{offset:`0.6`,stopColor:`#a9cee3`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#cfe1da`})]}),(0,S.jsxs)(`linearGradient`,{id:e+`-agua`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#86ccf0`}),(0,S.jsx)(`stop`,{offset:`0.35`,stopColor:`#3f9fd4`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#17527a`})]}),(0,S.jsxs)(`linearGradient`,{id:e+`-rocha`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#6d5f4c`}),(0,S.jsx)(`stop`,{offset:`0.45`,stopColor:`#4e4536`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#2f2a22`})]}),(0,S.jsxs)(`linearGradient`,{id:e+`-mato`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#6d9179`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#41604b`})]}),(0,S.jsxs)(`linearGradient`,{id:e+`-concreto`,x1:`0`,y1:`0`,x2:`1`,y2:`0`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#dcdfd8`}),(0,S.jsx)(`stop`,{offset:`0.45`,stopColor:`#b7bcb4`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#7f8780`})]}),(0,S.jsxs)(`linearGradient`,{id:e+`-aco`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#5c676d`}),(0,S.jsx)(`stop`,{offset:`0.32`,stopColor:`#c2ccd1`}),(0,S.jsx)(`stop`,{offset:`0.52`,stopColor:`#93a0a7`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#3f484d`})]}),(0,S.jsx)(`marker`,{id:e+`-seta`,viewBox:`0 0 10 10`,refX:`8`,refY:`5`,markerWidth:`5`,markerHeight:`5`,orient:`auto-start-reverse`,children:(0,S.jsx)(`path`,{d:`M0 1 L9 5 L0 9 Z`,fill:`context-stroke`})}),(0,S.jsx)(`filter`,{id:e+`-sombra`,x:`-25%`,y:`-25%`,width:`160%`,height:`165%`,children:(0,S.jsx)(`feDropShadow`,{dx:`2`,dy:`4`,stdDeviation:`3`,floodColor:`#15201c`,floodOpacity:`0.45`})})]})}function B({x:e,y:t,texto:n,cor:r,ancora:i,pequena:a}){let o=n.length*(a?5.4:6.3)+(a?13:16),s=i===`end`?e-o:i===`middle`?e-o/2:e,c=i===`end`?e-8:i===`middle`?e:e+8;return(0,S.jsxs)(`g`,{className:`hcm-svg-label`,children:[(0,S.jsx)(`rect`,{x:s,y:t-(a?10:12),width:o,height:a?15:18,rx:a?6:7,fill:`#0f2119`,opacity:`0.85`}),(0,S.jsx)(`text`,{x:c,y:t+1,textAnchor:i===`middle`?`middle`:i===`end`?`end`:`start`,fontSize:a?9.5:11,fontWeight:`700`,fill:r||`#e7f3ec`,children:n})]})}function he(){let e=`M196 66 C 236 96, 250 152, 268 196`;return(0,S.jsxs)(`svg`,{viewBox:`0 0 460 250`,className:`arr-svg`,role:`img`,"aria-label":`Esquema de usina reversível com geração e bombeamento`,children:[(0,S.jsx)(z,{p:`rv`}),(0,S.jsx)(`rect`,{width:`460`,height:`250`,fill:`url(#rv-ceu)`}),(0,S.jsx)(`path`,{d:`M0 250 L460 250 L460 186 C 380 182 320 176 286 150 C 250 122 236 92 214 76 C 190 58 120 56 0 58 Z`,fill:`url(#rv-rocha)`}),(0,S.jsx)(`path`,{d:`M0 58 C 120 56 190 58 214 76 C 236 92 250 122 286 150 C 320 176 380 182 460 186 L460 196 C 378 192 316 186 280 158 C 244 130 230 100 208 84 C 186 68 118 66 0 68 Z`,fill:`url(#rv-mato)`,opacity:`0.95`}),(0,S.jsx)(`path`,{d:`M22 68 q7 -16 14 -3 q6 -12 12 3 Z M74 66 q6 -13 12 -2 q8 -18 15 2 Z M140 68 q8 -19 15 -3 q5 -9 10 3 Z`,fill:`#3d6b48`,opacity:`0.85`}),(0,S.jsx)(`path`,{d:`M338 182 q7 -16 14 -3 q6 -12 12 3 Z M392 184 q6 -13 12 -2 q8 -18 15 2 Z`,fill:`#3d6b48`,opacity:`0.8`}),(0,S.jsx)(`path`,{d:`M22 62 L206 62 L206 40 L22 40 Z`,fill:`#3a3327`}),(0,S.jsx)(`path`,{d:`M28 60 L200 60 L200 44 L28 44 Z`,fill:`url(#rv-agua)`}),(0,S.jsx)(`rect`,{x:`28`,y:`44`,width:`172`,height:`4`,fill:`#dff2ff`,opacity:`0.45`}),(0,S.jsx)(`path`,{d:`M22 62 L28 44 M206 62 L200 44`,stroke:`#8b8676`,strokeWidth:`3.5`,strokeLinecap:`round`}),(0,S.jsx)(`path`,{d:`M252 214 L452 214 L452 186 L252 186 Z`,fill:`#3a3327`}),(0,S.jsx)(`path`,{d:`M258 212 L446 212 L446 190 L258 190 Z`,fill:`url(#rv-agua)`}),(0,S.jsx)(`rect`,{x:`258`,y:`190`,width:`188`,height:`5`,fill:`#dff2ff`,opacity:`0.45`}),(0,S.jsx)(`path`,{d:e,stroke:`#2b2519`,strokeWidth:`20`,fill:`none`,strokeLinecap:`round`}),(0,S.jsx)(`path`,{d:e,stroke:`url(#rv-aco)`,strokeWidth:`14`,fill:`none`,strokeLinecap:`round`}),(0,S.jsx)(k,{className:`rv-gera`,dash:[10,12],duration:1.1,d:e,stroke:`#5ff2cd`,strokeWidth:`4.4`,fill:`none`,strokeLinecap:`round`}),(0,S.jsx)(k,{className:`rv-bombeia`,dash:[10,12],duration:1.6,d:`M268 196 C 250 152, 236 96, 196 66`,stroke:`#ffc94f`,strokeWidth:`4.4`,fill:`none`,strokeLinecap:`round`}),(0,S.jsx)(`ellipse`,{cx:`248`,cy:`150`,rx:`30`,ry:`24`,fill:`#1d1a12`,opacity:`0.75`}),(0,S.jsx)(`g`,{filter:`url(#rv-sombra)`,children:(0,S.jsx)(`circle`,{cx:`248`,cy:`150`,r:`19`,fill:`#2f8f70`,stroke:`#d9efe4`,strokeWidth:`1.8`})}),(0,S.jsxs)(`g`,{className:`hcm-reversible-rotor`,"data-rotor":`reversible`,children:[(0,S.jsx)(`path`,{d:`M248 136 C253 137 257 141 258 146 C253 145 249 144 246 141 Z`,fill:`#ffd479`}),(0,S.jsx)(`path`,{d:`M262 150 C261 155 257 159 252 160 C253 155 254 151 257 148 Z`,fill:`#ffd479`}),(0,S.jsx)(`path`,{d:`M248 164 C243 163 239 159 238 154 C243 155 247 156 250 159 Z`,fill:`#ffd479`}),(0,S.jsx)(`path`,{d:`M234 150 C235 145 239 141 244 140 C243 145 242 149 239 152 Z`,fill:`#ffd479`}),(0,S.jsx)(`circle`,{cx:`248`,cy:`150`,r:`4`,fill:`#fff0ba`})]}),(0,S.jsx)(B,{x:34,y:34,texto:`reservatório SUPERIOR`,cor:`#bfe6ff`}),(0,S.jsx)(B,{x:446,y:234,texto:`reservatório INFERIOR`,cor:`#bfe6ff`,ancora:`end`}),(0,S.jsx)(B,{x:286,y:140,texto:`bomba-turbina reversível`}),(0,S.jsxs)(`g`,{className:`rv-gera-rotulo`,children:[(0,S.jsx)(`path`,{d:`M64 104 L64 138`,stroke:`#37d39a`,strokeWidth:`4`,markerEnd:`url(#rv-seta)`}),(0,S.jsx)(B,{x:76,y:116,texto:`GERA na ponta (desce)`,cor:`#5ff2cd`})]}),(0,S.jsxs)(`g`,{className:`rv-bombeia-rotulo`,children:[(0,S.jsx)(`path`,{d:`M64 210 L64 176`,stroke:`#e5a000`,strokeWidth:`4`,markerEnd:`url(#rv-seta)`}),(0,S.jsx)(B,{x:76,y:198,texto:`BOMBEIA fora de ponta (sobe)`,cor:`#ffc94f`})]})]})}var ge=Object.freeze({generate:{label:`Geração`,description:`A água desce do reservatório superior e aciona a bomba-turbina para gerar energia.`},pump:{label:`Bombeamento`,description:`A máquina inverte o sentido e consome energia para devolver água ao reservatório superior.`}});function _e(){let e=D(),[t,n]=(0,x.useState)(`generate`),i=ge[t];return(0,x.useEffect)(()=>{if(!e.motionActive)return;let t=window.setInterval(()=>n(e=>e===`generate`?`pump`:`generate`),4500*(100/e.speed));return()=>window.clearInterval(t)},[e.motionActive,e.speed]),(0,S.jsxs)(`section`,{ref:e.sceneRef,className:`hydro-motion-surface hcm-reversible-motion`,style:e.surfaceStyle,"data-motion-state":e.motionActive?`running`:`paused`,"data-playing":e.playing?`true`:`false`,"data-reversible-mode":t,"aria-label":`Funcionamento da usina reversível`,children:[(0,S.jsx)(O,{motion:e,context:`Animação da usina reversível`}),(0,S.jsx)(`div`,{className:`hcm-phase-selector`,role:`group`,"aria-label":`Modo da usina reversível`,children:Object.entries(ge).map(([e,r])=>(0,S.jsx)(`button`,{type:`button`,className:t===e?`active`:``,"aria-pressed":t===e,onClick:()=>n(e),children:r.label},e))}),(0,S.jsxs)(`p`,{className:`hcm-current-state`,role:`status`,"aria-live":`polite`,children:[(0,S.jsxs)(`strong`,{children:[`Modo em destaque: `,i.label,`.`]}),` `,i.description]}),(0,S.jsxs)(`div`,{className:`prc-fotos`,children:[(0,S.jsxs)(`figure`,{children:[(0,S.jsx)(he,{}),(0,S.jsx)(`figcaption`,{children:`Ciclo diário: funciona como bateria hídrica, consome energia para estocar água no reservatório superior e gera na hora de ponta.`})]}),(0,S.jsxs)(`figure`,{children:[(0,S.jsx)(`img`,{src:j+`/hidro/reversivel-bath-county.jpg`,alt:`Bath County Pumped Storage Station: casa de força e subestação`}),(0,S.jsxs)(`figcaption`,{children:[(0,S.jsx)(r,{size:13}),` Foto real da usina · `,(0,S.jsx)(`a`,{href:M(`Bath_County_Pumped_Storage_Station.jpg`),target:`_blank`,rel:`noreferrer`,children:`Wikimedia Commons`}),` (licença livre)`]})]})]}),(0,S.jsxs)(`section`,{className:`hcm-equipment-key`,"aria-label":`Componentes do armazenamento por bombeamento`,children:[(0,S.jsx)(`h3`,{children:`Como ler o esquema`}),(0,S.jsxs)(`ol`,{children:[(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`span`,{"aria-hidden":`true`,children:`1`}),(0,S.jsxs)(`p`,{children:[(0,S.jsx)(`strong`,{children:`Reservatório superior`}),`Armazena água e energia potencial.`]})]}),(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`span`,{"aria-hidden":`true`,children:`2`}),(0,S.jsxs)(`p`,{children:[(0,S.jsx)(`strong`,{children:`Conduto reversível`}),`Leva água para baixo na geração e para cima no bombeamento.`]})]}),(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`span`,{"aria-hidden":`true`,children:`3`}),(0,S.jsxs)(`p`,{children:[(0,S.jsx)(`strong`,{children:`Bomba-turbina`}),`Opera nos dois sentidos dentro da casa de força.`]})]}),(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`span`,{"aria-hidden":`true`,children:`4`}),(0,S.jsxs)(`p`,{children:[(0,S.jsx)(`strong`,{children:`Reservatório inferior`}),`Recebe a água gerada e fornece água para o bombeamento.`]})]})]})]})]})}var ve=[{tipo:`UHE de acumulação`,criterio:`Acima de 30 MW · concessão (leilão) · situação passível de EIA/RIMA; confirmar estudo e rito no caso concreto · reservatório de regularização`,nome:`UHE Gov. Bento Munhoz da Rocha Netto (Foz do Areia)`,local:`Rio Iguaçu, Pinhão-PR`,dados:`1.676 MW · 4 turbinas Francis de 419 MW · barragem de 160 m · reservatório de ~165 km² · opera desde 1980 · maior usina da Copel`,site:`https://www.copel.com/site/copel-geracao/usinas/usina-governador-bento-munhoz-da-rocha-netto/`,siteLabel:`copel.com (página oficial da usina)`},{tipo:`UHE a fio d'água`,criterio:`Acima de 30 MW · pouca ou nenhuma regularização sazonal · geração mais dependente da vazão afluente`,nome:`UHE Baixo Iguaçu`,local:`Rio Iguaçu, Capanema / Capitão Leônidas Marques-PR`,dados:`350,2 MW · 3 unidades Kaplan segundo nota técnica da EPE. A fonte registra dados de projeto; confirme a situação operacional atual na base competente antes de citar em processo.`,site:`https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-292/topico-376/EPE-DEE-RE-066-2016-r0.pdf`,siteLabel:`epe.gov.br (nota técnica oficial; dados de projeto)`},{tipo:`UHE de queda alta (derivação)`,criterio:`Circuito longo de adução por túnel · queda elevada · turbinas Pelton`,nome:`UHE Gov. Pedro Viriato Parigot de Souza (Capivari-Cachoeira)`,local:`Antonina-PR (capta no rio Capivari e restitui no Cachoeira)`,dados:`260 MW de potência instalada, com quatro geradores de 62,5 MW segundo a Copel · desnível de 754 m, a maior queda do sul do país · mais de 50 anos de operação`,site:`https://www.copel.com/site/copel-geracao/usinas/usina-parigot-de-souza/`,siteLabel:`copel.com (página oficial da usina)`},{tipo:`PCH, Pequena Central Hidrelétrica`,criterioAmbiental:`IN IAT nº 09/2025, art. 2º: capacidade instalada superior a 5 MW e igual ou inferior a 30 MW, com reservatório de até 3 km², excluída a calha do leito regular. A restrição de área não se aplica aos aproveitamentos comprovadamente dimensionados para objetivos diferentes da geração de energia elétrica.`,criterioSetorial:`ANEEL: a página operacional consultada em 10/08/2026 usa potência superior a 5.000 kW e igual ou inferior a 30.000 kW. Confira o ato setorial aplicável e a situação concreta do empreendimento.`,criterioAlerta:`Não transporte a referência a 13 km² de uma página geral para o critério ambiental do IAT, nem a misture com o enquadramento setorial.`,nome:`PCH Bela Vista`,local:`Rio Chopim, Verê / São João-PR`,dados:`29,81 MW · inaugurada em outubro de 2021 (unidades em jun/jul/ago) · investimento de R$ 224 milhões da Copel`,site:`https://pchbelavista.com.br/`,siteLabel:`pchbelavista.com.br (site oficial)`},{tipo:`CGH, Central Geradora Hidrelétrica`,criterio:`Até 5 MW · registro/comunicação à ANEEL · rito proporcional ao porte`,nome:`CGH São Francisco de Sales`,local:`Rio São Francisco, Clevelândia-PR (comunidade Palmital)`,dados:`0,9 MW · empreendimento privado com barragem de derivação e canal adutor de 317 m · site relata obras iniciadas em 2021; confirme a situação operacional atual no SIGA/ANEEL`,site:`https://cghsaofranciscodesales.com.br/`,siteLabel:`cghsaofranciscodesales.com.br (site do empreendimento)`},{tipo:`UHE binacional`,criterio:`Empreendimento de tratado internacional · regime jurídico próprio`,nome:`Itaipu Binacional`,local:`Rio Paraná, Foz do Iguaçu-PR (Brasil/Paraguai)`,dados:`14.000 MW · 20 unidades geradoras Francis · líder mundial em produção acumulada de energia`,site:`https://www.itaipu.gov.br/`,siteLabel:`itaipu.gov.br (site oficial)`},{tipo:`Reversível (bombeamento)`,criterio:`Bombeia água a reservatório superior fora de ponta e turbina na ponta, a "bateria" hídrica`,reversivel:!0,nome:`Bath County Pumped Storage Station: exemplo fora do Paraná`,local:`Bath County, Virgínia, Estados Unidos`,dados:`Exemplo didático internacional de armazenamento por bombeamento. A fonte técnica abaixo explica a tecnologia; não atesta a situação operacional atual deste empreendimento, que deve ser conferida na agência ou operadora competente.`,site:`https://www.energy.gov/cmei/water/history-hydropower`,siteLabel:`energy.gov (fonte técnica oficial dos Estados Unidos)`}];function ye(){return(0,S.jsxs)(`div`,{className:`pr-cases`,children:[(0,S.jsxs)(`p`,{className:`prc-note`,children:[(0,S.jsx)(t,{size:15}),` Casos reais, com dados públicos coletados nas fontes indicadas em cada card, oficiais sempre que disponíveis. Confirme potência e situação operacional na fonte antes de citar em processo. O enquadramento ambiental segue o IAT e o POP; o enquadramento setorial segue a ANEEL. Leia cada eixo separadamente e confirme vigência e aplicação antes de decidir.`]}),(0,S.jsx)(`div`,{className:`prc-grid`,children:ve.map(e=>(0,S.jsxs)(`article`,{className:`prc-card`+(e.site?``:` prc-empty`)+(e.reversivel?` prc-wide`:``),children:[(0,S.jsx)(`span`,{className:`prc-tipo`,children:e.tipo}),(0,S.jsx)(`h3`,{children:e.nome}),e.criterio&&(0,S.jsxs)(`p`,{className:`prc-crit`,children:[(0,S.jsx)(m,{size:13}),` `,e.criterio]}),e.criterioAmbiental&&(0,S.jsxs)(`p`,{className:`prc-crit`,children:[(0,S.jsx)(m,{size:13}),(0,S.jsxs)(`span`,{children:[(0,S.jsx)(`strong`,{children:`Eixo ambiental IAT.`}),` `,e.criterioAmbiental]})]}),e.criterioSetorial&&(0,S.jsxs)(`p`,{className:`prc-crit`,children:[(0,S.jsx)(v,{size:13}),(0,S.jsxs)(`span`,{children:[(0,S.jsx)(`strong`,{children:`Eixo setorial ANEEL.`}),` `,e.criterioSetorial]})]}),e.criterioAlerta&&(0,S.jsxs)(`p`,{className:`prc-crit`,children:[(0,S.jsx)(t,{size:13}),(0,S.jsxs)(`span`,{children:[(0,S.jsx)(`strong`,{children:`Não misture os critérios.`}),` `,e.criterioAlerta]})]}),(0,S.jsxs)(`p`,{className:`prc-local`,children:[(0,S.jsx)(s,{size:13}),` `,e.local]}),(0,S.jsx)(`p`,{className:`prc-dados`,children:e.dados}),e.reversivel&&(0,S.jsx)(_e,{}),e.site&&(0,S.jsxs)(`a`,{className:`prc-site`,href:e.site,target:`_blank`,rel:`noreferrer`,children:[(0,S.jsx)(d,{size:14}),` `,e.siteLabel]})]},e.nome))})]})}var be=[[`Estudos e definição do aproveitamento`,`Inventário do trecho, partição de quedas e projeto do aproveitamento: potência, queda, vazão e arranjo.`],[`Registro na ANEEL`,`Registro do projeto conforme a REN nº 875/2020 (adequabilidade do sumário executivo, DRS) e obtenção do CEG, o código único do empreendimento.`],[`Outorga setorial`,`Até 5 MW: registro/comunicação. Acima de 5 MW: autorização da ANEEL (limite ampliado pela legislação setorial vigente). Grandes aproveitamentos: concessão mediante leilão.`],[`Conexão à rede`,`Parecer de acesso, projeto da linha/subestação e contratos de conexão e uso do sistema.`]],xe=[[`Consulta Prévia (obrigatória para CGH a partir de 1 MW, PCH e UHE)`,`Antes de formalizar: mapa da ADA, arranjo em KML/KMZ e memorial descritivo (art. 36 da IN IAT nº 09/2025). A manifestação orienta modalidade e estudo, vale 24 meses e não aprova viabilidade.`],[`Enquadramento`,`Potência, área de alagamento, IDA, supressão e sensibilidade orientam a modalidade (DLAM, LAC, LAS ou rito trifásico). O estudo aplicável (RAS/RDPA, PCA ou EIA/RIMA) deve ser confirmado pelo enquadramento, pelo Termo de Referência vigente e pelos atos do processo, sem inferência automática a partir de um dado isolado.`],[`Protocolo e análise`,`Formalização pelo SGA/eProtocolo com a documentação da fase; o IAT confere suficiência antes do mérito e diligencia lacunas.`],[`LP → LI → LO`,`LP atesta viabilidade e concepção; LI autoriza instalar conforme projeto (com autorizações florestais, de fauna e outorga/DRDH); LO verifica o instalado e fixa condicionantes de operação, e o PACUERA quando exigível.`],[`Intervenientes`,`IPHAN (patrimônio), gestor de UC afetada e demais órgãos manifestam-se no processo; o IAT verifica compatibilidade sem substituir a decisão de cada um.`]],Se=[[`Empreendedor`,`Decide investir, contrata estudos, protocola nos dois trilhos, mantém titularidade coerente entre ANEEL e IAT, responde exigências e cumpre condicionantes.`],[`Consultoria ambiental`,`Elabora memorial e estudos conforme os Termos de Referência, com ARTs; responde complementações técnicas e acompanha vistorias.`],[`IAT`,`Analisa, diligencia, licencia e fiscaliza o componente ambiental no Paraná; confere a existência e compatibilidade dos atos externos.`],[`ANEEL`,`Registra e outorga o aproveitamento energético, emite o CEG e regula a operação comercial.`],[`Órgãos intervenientes`,`IPHAN, gestores de UC e demais órgãos: manifestações específicas na sua competência, que integram o processo sem transferi-la.`]];function Ce({go:e}){return(0,S.jsxs)(`div`,{className:`lic-path`,children:[(0,S.jsxs)(`p`,{className:`prc-note`,children:[(0,S.jsx)(t,{size:15}),` Roteiro didático baseado no POP e na IN IAT nº 09/2025 (fluxo ambiental) e no regime setorial da ANEEL (fluxo energético). Os dois processos avançam em paralelo e precisam ser compatíveis: titularidade, arranjo e potência devem coincidir.`]}),(0,S.jsxs)(`div`,{className:`lic-cols`,children:[(0,S.jsxs)(`section`,{className:`lic-col lic-aneel`,children:[(0,S.jsxs)(`h3`,{children:[(0,S.jsx)(v,{size:17}),` Fluxo setorial · ANEEL`]}),(0,S.jsx)(`ol`,{children:be.map(([e,t],n)=>(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`span`,{children:n+1}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`strong`,{children:e}),(0,S.jsx)(`p`,{children:t})]})]},e))})]}),(0,S.jsxs)(`section`,{className:`lic-col lic-iat`,children:[(0,S.jsxs)(`h3`,{children:[(0,S.jsx)(m,{size:17}),` Fluxo ambiental · IAT`]}),(0,S.jsx)(`ol`,{children:xe.map(([e,t],n)=>(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`span`,{children:n+1}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`strong`,{children:e}),(0,S.jsx)(`p`,{children:t})]})]},e))})]})]}),(0,S.jsx)(`h3`,{className:`lic-papeis-h`,children:`Quem faz o quê`}),(0,S.jsx)(`div`,{className:`lic-papeis`,children:Se.map(([e,t])=>(0,S.jsxs)(`article`,{children:[(0,S.jsx)(`strong`,{children:e}),(0,S.jsx)(`p`,{children:t})]},e))}),(0,S.jsxs)(`div`,{className:`lic-cta`,children:[(0,S.jsx)(`p`,{children:`O detalhe de cada fase (documentos, critérios de suficiência e produtos) está nos módulos M03 a M05 da Formação e nas normas da Biblioteca.`}),(0,S.jsxs)(`button`,{className:`primary`,onClick:()=>e(`formacao`),children:[`Estudar as fases `,(0,S.jsx)(d,{size:15})]})]})]})}function we(){return(0,S.jsxs)(`svg`,{viewBox:`0 0 460 240`,className:`arr-svg`,role:`img`,"aria-label":`Arranjo pé de barragem`,children:[(0,S.jsx)(z,{p:`pb`}),(0,S.jsx)(`rect`,{width:`460`,height:`240`,fill:`url(#pb-ceu)`}),(0,S.jsx)(`path`,{d:`M0 96 L120 84 L210 96 L300 82 L392 96 L460 86 L460 118 L0 118 Z`,fill:`url(#pb-mato)`,opacity:`0.5`}),(0,S.jsx)(`path`,{d:`M0 240 L460 240 L460 196 L266 196 L226 212 L180 212 L180 118 L0 118 Z`,fill:`url(#pb-rocha)`}),(0,S.jsx)(`path`,{d:`M0 118 L180 118 L180 112 L0 112 Z`,fill:`#4c7a56`}),(0,S.jsx)(`path`,{d:`M266 196 L460 196 L460 190 L266 190 Z`,fill:`#4c7a56`}),(0,S.jsx)(`path`,{d:`M0 150 L180 150 L180 118 L0 118 Z`,fill:`url(#pb-agua)`}),(0,S.jsx)(`rect`,{x:`0`,y:`118`,width:`180`,height:`5`,fill:`#dff2ff`,opacity:`0.4`}),(0,S.jsxs)(`g`,{filter:`url(#pb-sombra)`,children:[(0,S.jsx)(`path`,{d:`M180 118 L180 205 L226 205 L212 118 Z`,fill:`url(#pb-concreto)`}),(0,S.jsx)(`path`,{d:`M178 116 L214 116 L215 124 L178 124 Z`,fill:`#e6e9e2`})]}),(0,S.jsx)(`g`,{stroke:`#959c94`,strokeWidth:`0.8`,opacity:`0.5`,children:(0,S.jsx)(`path`,{d:`M189 120 L192 205 M199 120 L204 205`})}),(0,S.jsx)(`path`,{d:`M186 130 L212 198`,stroke:`#2f373b`,strokeWidth:`11`,strokeLinecap:`round`}),(0,S.jsx)(`path`,{d:`M186 130 L212 198`,stroke:`url(#pb-aco)`,strokeWidth:`8`,strokeLinecap:`round`}),(0,S.jsx)(k,{className:`arr-fluxo`,dash:[10,14],duration:1.15,d:`M186 130 L212 198`,stroke:`#5ff2cd`,strokeWidth:`3.4`,strokeLinecap:`round`,fill:`none`}),(0,S.jsxs)(`g`,{filter:`url(#pb-sombra)`,children:[(0,S.jsx)(`path`,{d:`M212 176 L240 164 L268 176 L268 182 L240 171 L212 182 Z`,fill:`#93a29a`}),(0,S.jsx)(`rect`,{x:`214`,y:`180`,width:`52`,height:`28`,fill:`#e9ece6`,stroke:`#7d867f`,strokeWidth:`1.3`})]}),(0,S.jsx)(`rect`,{x:`214`,y:`180`,width:`52`,height:`28`,fill:`url(#pb-concreto)`,opacity:`0.3`}),(0,S.jsx)(`path`,{d:`M222 194 L258 194`,stroke:`#aab3ab`,strokeWidth:`1.6`}),(0,S.jsx)(`circle`,{cx:`240`,cy:`199`,r:`6`,fill:`#40525c`,stroke:`#dfe7e2`,strokeWidth:`1.2`}),(0,S.jsx)(`rect`,{x:`266`,y:`196`,width:`194`,height:`18`,fill:`url(#pb-agua)`}),(0,S.jsx)(`rect`,{x:`266`,y:`196`,width:`194`,height:`4`,fill:`#dff2ff`,opacity:`0.4`}),(0,S.jsx)(k,{className:`arr-fluxo`,dash:[10,14],duration:1.15,d:`M272 205 L454 205`,stroke:`#eaf7ff`,strokeWidth:`3`,strokeLinecap:`round`,fill:`none`,opacity:`0.95`}),(0,S.jsx)(B,{x:8,y:110,texto:`reservatório`,cor:`#bfe6ff`}),(0,S.jsx)(B,{x:172,y:232,texto:`barragem`,ancora:`end`}),(0,S.jsx)(B,{x:278,y:166,texto:`casa de força no pé`}),(0,S.jsx)(B,{x:452,y:232,texto:`restituição imediata`,cor:`#a9c6bb`,ancora:`end`})]})}function Te(){return(0,S.jsxs)(`svg`,{viewBox:`0 0 460 240`,className:`arr-svg`,role:`img`,"aria-label":`Arranjo de derivação`,children:[(0,S.jsx)(z,{p:`dv`}),(0,S.jsx)(`rect`,{width:`460`,height:`240`,fill:`url(#dv-ceu)`}),(0,S.jsx)(`path`,{d:`M0 62 L96 44 L188 66 L286 40 L380 66 L460 48 L460 240 L0 240 Z`,fill:`url(#dv-mato)`,opacity:`0.55`}),(0,S.jsx)(`path`,{d:`M0 240 L460 240 L460 132 C 360 128 300 150 236 150 C 170 150 120 122 0 118 Z`,fill:`url(#dv-rocha)`,opacity:`0.92`}),(0,S.jsx)(`path`,{d:`M0 90 Q120 70 200 96 T460 120`,fill:`none`,stroke:`#2b5e7f`,strokeWidth:`20`,strokeLinecap:`round`}),(0,S.jsx)(`path`,{d:`M0 90 Q120 70 200 96 T460 120`,fill:`none`,stroke:`url(#dv-agua)`,strokeWidth:`15`,strokeLinecap:`round`}),(0,S.jsxs)(`g`,{filter:`url(#dv-sombra)`,children:[(0,S.jsx)(`path`,{d:`M56 72 L78 72 L75 116 L59 116 Z`,fill:`url(#dv-concreto)`}),(0,S.jsx)(`path`,{d:`M56 72 L78 72 L78 78 L56 78 Z`,fill:`#eceee8`})]}),(0,S.jsx)(`path`,{d:`M76 100 C 150 112 250 118 320 150`,fill:`none`,stroke:`#2b2519`,strokeWidth:`15`,strokeLinecap:`round`}),(0,S.jsx)(`path`,{d:`M76 100 C 150 112 250 118 320 150`,fill:`none`,stroke:`url(#dv-aco)`,strokeWidth:`10`,strokeLinecap:`round`}),(0,S.jsx)(k,{className:`arr-fluxo`,dash:[10,14],duration:1.15,d:`M76 100 C 150 112 250 118 320 150`,fill:`none`,stroke:`#5ff2cd`,strokeWidth:`3.6`,strokeLinecap:`round`}),(0,S.jsx)(k,{className:`arr-fluxo-tvr`,dash:[5,20],duration:7,d:`M80 100 Q170 112 250 118 T460 126`,fill:`none`,stroke:`#a8cfe6`,strokeWidth:`2`,strokeLinecap:`round`,opacity:`0.85`}),(0,S.jsx)(`rect`,{x:`246`,y:`52`,width:`17`,height:`58`,rx:`3`,fill:`url(#dv-concreto)`,stroke:`#6f7772`,strokeWidth:`1.2`}),(0,S.jsx)(`rect`,{x:`248`,y:`70`,width:`13`,height:`38`,fill:`url(#dv-agua)`,opacity:`0.9`}),(0,S.jsxs)(`g`,{filter:`url(#dv-sombra)`,children:[(0,S.jsx)(`path`,{d:`M316 146 L344 134 L372 146 L372 152 L344 141 L316 152 Z`,fill:`#93a29a`}),(0,S.jsx)(`rect`,{x:`318`,y:`150`,width:`54`,height:`28`,fill:`#e9ece6`,stroke:`#7d867f`,strokeWidth:`1.3`})]}),(0,S.jsx)(`rect`,{x:`318`,y:`150`,width:`54`,height:`28`,fill:`url(#dv-concreto)`,opacity:`0.3`}),(0,S.jsx)(`circle`,{cx:`345`,cy:`169`,r:`6`,fill:`#40525c`,stroke:`#dfe7e2`,strokeWidth:`1.2`}),(0,S.jsx)(`path`,{d:`M372 166 Q420 178 460 170`,fill:`none`,stroke:`#2b5e7f`,strokeWidth:`15`,strokeLinecap:`round`}),(0,S.jsx)(`path`,{d:`M372 166 Q420 178 460 170`,fill:`none`,stroke:`url(#dv-agua)`,strokeWidth:`11`,strokeLinecap:`round`}),(0,S.jsx)(k,{className:`arr-fluxo`,dash:[10,14],duration:1.15,d:`M374 167 Q420 179 458 171`,fill:`none`,stroke:`#eaf7ff`,strokeWidth:`3`,strokeLinecap:`round`,opacity:`0.95`}),(0,S.jsx)(B,{x:8,y:40,texto:`açude de derivação`,cor:`#bfe6ff`}),(0,S.jsx)(B,{x:250,y:44,texto:`chaminé de equilíbrio`,cor:`#ffc94f`,ancora:`middle`}),(0,S.jsx)(B,{x:120,y:128,texto:`túnel + conduto forçado`}),(0,S.jsx)(B,{x:452,y:200,texto:`casa de força afastada`,ancora:`end`}),(0,S.jsx)(`path`,{d:`M300 210 L268 128`,stroke:`#8fb8d6`,strokeWidth:`1.2`,opacity:`0.9`}),(0,S.jsx)(B,{x:150,y:218,texto:`trecho de vazão reduzida (TVR) no leito natural`,cor:`#a9c6bb`})]})}function Ee(){let e=e=>(0,S.jsxs)(`g`,{children:[(0,S.jsx)(`rect`,{x:e,y:`38`,width:`212`,height:`196`,rx:`10`,fill:`#0f2119`,opacity:`0.35`}),(0,S.jsx)(`rect`,{x:e,y:`38`,width:`212`,height:`196`,rx:`10`,fill:`none`,stroke:`#5d7a6c`,strokeWidth:`1.2`})]});return(0,S.jsxs)(`svg`,{viewBox:`0 0 460 240`,className:`arr-svg`,role:`img`,"aria-label":`Comparação entre fio d'água e acumulação`,children:[(0,S.jsx)(z,{p:`fa`}),(0,S.jsx)(`rect`,{width:`460`,height:`240`,fill:`url(#fa-ceu)`}),e(8),e(240),(0,S.jsx)(`path`,{d:`M18 200 L214 200 L214 158 L18 158 Z`,fill:`url(#fa-rocha)`}),(0,S.jsx)(`path`,{d:`M20 152 L112 152 L112 134 L20 134 Z`,fill:`url(#fa-agua)`}),(0,S.jsx)(`rect`,{x:`20`,y:`134`,width:`92`,height:`3.5`,fill:`#dff2ff`,opacity:`0.45`}),(0,S.jsx)(`path`,{d:`M112 134 L112 190 L140 190 L132 134 Z`,fill:`url(#fa-concreto)`}),(0,S.jsx)(`path`,{d:`M138 174 L156 166 L174 174 L174 179 L156 170 L138 179 Z`,fill:`#93a29a`}),(0,S.jsx)(`rect`,{x:`140`,y:`177`,width:`34`,height:`18`,fill:`#e9ece6`,stroke:`#7d867f`,strokeWidth:`1.1`}),(0,S.jsx)(`path`,{d:`M174 186 L212 186`,stroke:`#2b5e7f`,strokeWidth:`11`,strokeLinecap:`round`}),(0,S.jsx)(`path`,{d:`M174 186 L212 186`,stroke:`url(#fa-agua)`,strokeWidth:`8`,strokeLinecap:`round`}),(0,S.jsx)(k,{className:`arr-fluxo`,dash:[10,14],duration:1.15,d:`M178 186 L208 186`,stroke:`#eaf7ff`,strokeWidth:`2.6`,strokeLinecap:`round`,fill:`none`}),(0,S.jsx)(`path`,{d:`M250 210 L446 210 L446 168 L250 168 Z`,fill:`url(#fa-rocha)`}),(0,S.jsx)(`path`,{d:`M252 150 L362 168 L362 110 L252 110 Z`,fill:`url(#fa-agua)`}),(0,S.jsx)(`rect`,{x:`252`,y:`110`,width:`110`,height:`4`,fill:`#dff2ff`,opacity:`0.5`}),(0,S.jsx)(`path`,{className:`hcm-accumulation-band`,d:`M252 132 L362 132`,stroke:`#ffc94f`,strokeWidth:`1.6`,strokeDasharray:`5 4`,opacity:`0.95`}),(0,S.jsx)(`path`,{d:`M362 104 L362 200 L396 200 L384 104 Z`,fill:`url(#fa-concreto)`}),(0,S.jsx)(`path`,{d:`M392 184 L410 176 L428 184 L428 189 L410 180 L392 189 Z`,fill:`#93a29a`}),(0,S.jsx)(`rect`,{x:`394`,y:`187`,width:`34`,height:`18`,fill:`#e9ece6`,stroke:`#7d867f`,strokeWidth:`1.1`}),(0,S.jsx)(`path`,{d:`M428 196 L450 196`,stroke:`#2b5e7f`,strokeWidth:`11`,strokeLinecap:`round`}),(0,S.jsx)(`path`,{d:`M428 196 L450 196`,stroke:`url(#fa-agua)`,strokeWidth:`8`,strokeLinecap:`round`}),(0,S.jsx)(k,{className:`arr-fluxo`,dash:[10,14],duration:1.6,d:`M430 196 L448 196`,stroke:`#eaf7ff`,strokeWidth:`2.6`,strokeLinecap:`round`,fill:`none`}),(0,S.jsx)(B,{x:20,y:62,texto:`FIO D'ÁGUA`,cor:`#bfe6ff`}),(0,S.jsx)(B,{x:20,y:84,texto:`reservatório mínimo`,cor:`#cfe0d6`,pequena:!0}),(0,S.jsx)(B,{x:20,y:210,texto:`gera conforme o rio`,cor:`#a9c6bb`,pequena:!0}),(0,S.jsx)(B,{x:20,y:228,texto:`alagamento menor`,cor:`#a9c6bb`,pequena:!0}),(0,S.jsx)(B,{x:252,y:62,texto:`ACUMULAÇÃO`,cor:`#5ff2cd`}),(0,S.jsx)(B,{x:252,y:84,texto:`estoca entre estações`,cor:`#cfe0d6`,pequena:!0}),(0,S.jsx)(B,{x:252,y:210,texto:`regulariza e firma energia`,cor:`#a9c6bb`,pequena:!0}),(0,S.jsx)(B,{x:252,y:228,texto:`deplecionamento (faixa)`,cor:`#ffc94f`,pequena:!0})]})}var V=Object.freeze([{id:`pe-barragem`,label:`Pé de barragem`,Svg:we,caption:`A queda vem só do barramento. O circuito é curto, a casa de força fica ao pé e a água retorna imediatamente ao rio.`,parts:[[`Reservatório`,`Mantém a água a montante da barragem.`],[`Barragem e tomada`,`Criam o desnível e conduzem a água ao circuito hidráulico.`],[`Casa de força`,`Abriga turbina, eixo e gerador junto ao pé da barragem.`],[`Restituição`,`Devolve a água ao rio logo depois da geração.`]]},{id:`derivacao`,label:`Derivação`,Svg:Te,caption:`Um circuito longo aproveita a queda do relevo, como na UHE Parigot de Souza. Parte do leito natural forma o trecho de vazão reduzida.`,parts:[[`Açude e tomada`,`Desviam parte da vazão do leito natural.`],[`Túnel e conduto forçado`,`Transportam a água até a casa de força afastada.`],[`Chaminé de equilíbrio`,`Amortece variações de pressão no circuito.`],[`TVR e restituição`,`O leito recebe vazão reduzida até a água retornar depois da usina.`]]},{id:`regularizacao`,label:`Fio d’água × acumulação`,Svg:Ee,caption:`No fio d’água, a geração acompanha mais de perto a vazão afluente. Na acumulação, o reservatório permite regularização; área e volume influenciam operação e impactos, mas não os definem sozinhos.`,parts:[[`Fio d’água`,`Tem reservatório mínimo e menor capacidade de regularização sazonal.`],[`Acumulação`,`Armazena água entre períodos e ajuda a firmar a geração.`],[`Faixa de deplecionamento`,`Indica a variação operacional do nível no reservatório.`],[`Casas de força`,`Convertem a energia hidráulica e restituem a água a jusante.`]]}]);function De(){let e=D(),[t,n]=(0,x.useState)(V[0].id),r=(0,x.useId)().replace(/:/g,``),i=V.find(e=>e.id===t)||V[0];return(0,S.jsxs)(`section`,{ref:e.sceneRef,className:`hydro-motion-surface hcm-arrangements`,style:e.surfaceStyle,"data-motion-state":e.motionActive?`running`:`paused`,"data-playing":e.playing?`true`:`false`,"aria-label":`Esquemas de arranjos hidrelétricos`,children:[(0,S.jsx)(O,{motion:e,context:`Animação do arranjo`}),(0,S.jsx)(`p`,{className:`sr-only`,children:`Área e volume do reservatório influenciam a operação e os impactos, mas não os definem sozinhos.`}),(0,S.jsx)(`div`,{className:`hcm-tabs hcm-arrangement-tabs`,role:`tablist`,"aria-label":`Tipo de arranjo`,onKeyDown:A,children:V.map(e=>{let t=e.id===i.id;return(0,S.jsx)(`button`,{type:`button`,id:`${r}-tab-${e.id}`,role:`tab`,"aria-selected":t,"aria-controls":`${r}-panel`,tabIndex:t?0:-1,className:t?`active`:``,onClick:()=>n(e.id),children:e.label},e.id)})}),(0,S.jsxs)(`div`,{id:`${r}-panel`,role:`tabpanel`,"aria-labelledby":`${r}-tab-${i.id}`,className:`hcm-arrangement-panel`,children:[(0,S.jsxs)(`p`,{className:`hcm-current-state`,children:[(0,S.jsxs)(`strong`,{children:[`Em exibição: `,i.label,`.`]}),` As linhas pontilhadas mostram o caminho e a velocidade relativa da água.`]}),(0,S.jsx)(`div`,{className:`arr-grid hcm-arrangement-stage`,children:(0,S.jsxs)(`figure`,{children:[(0,S.jsx)(i.Svg,{}),(0,S.jsx)(`figcaption`,{children:i.caption})]})}),(0,S.jsxs)(`section`,{className:`hcm-equipment-key`,"aria-label":`Componentes do arranjo ${i.label}`,children:[(0,S.jsx)(`h3`,{children:`Como identificar o arranjo`}),(0,S.jsx)(`ol`,{children:i.parts.map(([e,t],n)=>(0,S.jsxs)(`li`,{children:[(0,S.jsx)(`span`,{"aria-hidden":`true`,children:n+1}),(0,S.jsxs)(`p`,{children:[(0,S.jsx)(`strong`,{children:e}),t]})]},e))})]})]})]})}var Oe=`.hec-shell {
  --hec-cyan: #74dcff;
  --hec-water: #48bde6;
  --hec-green: #59e2ad;
  --hec-amber: #ffc768;
  margin: 0;
  overflow: hidden;
  border: 1px solid rgba(170, 221, 211, 0.3);
  border-radius: 16px;
  background: #071b21;
  color: #f4fbfa;
  box-shadow: 0 22px 60px rgba(1, 14, 17, 0.3);
  container-type: inline-size;
}

.hydro-hero--cutaway {
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
}

.hec-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 76px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.11);
  background: linear-gradient(100deg, #0a252b 0%, #0d302f 100%);
}

.hec-heading,
.hec-controls,
.hec-flow-control > span,
.hec-play,
.hec-layer-status,
.hec-layer-status span,
.hec-playback-status,
.hec-conversion,
.hec-conversion span,
.hec-stage-panel {
  display: flex;
  align-items: center;
}

.hec-heading {
  min-width: 0;
  gap: 11px;
}

.hec-heading > span {
  display: grid;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid rgba(116, 220, 255, 0.34);
  border-radius: 10px;
  background: rgba(72, 189, 230, 0.12);
  color: var(--hec-cyan);
}

.hec-heading svg {
  width: 21px;
}

.hec-heading h2 {
  margin: 0 0 2px;
  color: #fff;
  font-size: clamp(15px, 1.5vw, 19px);
  line-height: 1.2;
  letter-spacing: -0.015em;
}

.hec-heading p {
  margin: 0;
  color: #a9c5c4;
  font-size: 12px;
}

.hec-controls {
  flex: 0 0 auto;
  gap: 13px;
}

.hec-flow-control {
  display: grid;
  width: 174px;
  gap: 5px;
  color: #bfcecf;
  font-size: 11px;
  font-weight: 700;
}

.hec-flow-control > span {
  justify-content: space-between;
  gap: 12px;
}

.hec-flow-control strong {
  color: var(--hec-cyan);
}

.hec-flow-control input {
  width: 100%;
  min-height: 24px;
  margin: 0;
  accent-color: var(--hec-cyan);
}

.hec-play {
  justify-content: center;
  gap: 7px;
  min-width: 108px;
  min-height: 44px;
  padding: 8px 12px;
  border: 1px solid rgba(89, 226, 173, 0.48);
  border-radius: 8px;
  background: rgba(27, 99, 81, 0.42);
  color: #ebfff8;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.hec-play:hover:not(:disabled) {
  background: rgba(41, 133, 105, 0.58);
}

.hec-play:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.hec-play svg {
  width: 16px;
}

.hec-layer-status {
  justify-content: center;
  gap: 9px 18px;
  min-height: 34px;
  padding: 6px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: #092128;
  color: #b9cdcc;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.01em;
}

.hec-layer-status span {
  gap: 7px;
}

.hec-layer-status i,
.hec-playback-status i {
  display: block;
  flex: 0 0 auto;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.hec-layer-status__static {
  border: 1px solid #9bb3b5;
  background: #4d676a;
}

.hec-layer-status__motion,
.hec-playback-status i {
  background: var(--hec-green);
  box-shadow: 0 0 0 4px rgba(89, 226, 173, 0.13), 0 0 12px rgba(89, 226, 173, 0.7);
  animation: hec-status-pulse 1.35s ease-in-out infinite;
}

.hec-scene {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  contain: layout paint;
  background: radial-gradient(circle at 55% 54%, #254047, #071b21 72%);
}

.hec-scene::after {
  position: absolute;
  z-index: 2;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(2, 13, 16, 0.01) 54%, rgba(2, 13, 16, 0.24) 100%),
    linear-gradient(90deg, rgba(3, 17, 20, 0.1), transparent 13%, transparent 88%, rgba(3, 17, 20, 0.08));
  content: '';
  pointer-events: none;
}

.hec-static-base,
.hec-overlay,
.hec-leaders,
.hec-callouts {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hec-static-base {
  z-index: 0;
  display: block;
  object-fit: cover;
}

.hec-overlay {
  z-index: 1;
  pointer-events: none;
}

.hec-water-system,
.hec-machine-system,
.hec-electric-system {
  opacity: 0.43;
  transition: opacity 260ms ease, filter 260ms ease;
}

.hec-water-system.is-active,
.hec-machine-system.is-active,
.hec-electric-system.is-active {
  opacity: 1;
  filter: saturate(1.18);
}

.hec-water-aura,
.hec-tailrace-aura,
.hec-energy-aura,
.hec-shaft-light,
.hec-shaft-helix,
.hec-runner-orbit,
.hec-generator-core {
  fill: none;
  stroke-linecap: round;
}

.hec-reservoir-motion {
  fill: none;
  stroke: rgba(191, 242, 255, 0.88);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 42 25;
  filter: drop-shadow(0 0 7px rgba(72, 189, 230, 0.85));
  animation: hec-reservoir 2.4s ease-in-out infinite;
}

.hec-water-aura,
.hec-tailrace-aura {
  stroke: rgba(55, 183, 226, var(--hec-flow-strength));
  stroke-width: 25;
}

.hec-water-flow,
.hec-tailrace-flow,
.hec-water-packets,
.hec-tailrace-packets,
.hec-energy-flow,
.hec-energy-packets {
  fill: none;
  stroke-linecap: round;
}

.hec-water-flow,
.hec-tailrace-flow {
  stroke: #d4f8ff;
  stroke-width: 5;
  stroke-dasharray: 22 30;
  animation: hec-water-flow var(--hec-flow-duration) linear infinite;
}

.hec-water-packets,
.hec-tailrace-packets {
  stroke: #fff;
  stroke-width: 9;
  stroke-dasharray: 2 108;
  animation: hec-water-packets calc(var(--hec-flow-duration) * 1.3) linear infinite;
}

.hec-tailrace-aura {
  stroke-width: 21;
}

.hec-tailrace-flow,
.hec-tailrace-packets {
  animation-direction: reverse;
}

.hec-shaft-light {
  stroke: rgba(89, 226, 173, 0.82);
  stroke-width: 9;
  stroke-dasharray: 10 18;
  animation: hec-shaft-rise var(--hec-machine-duration) linear infinite;
}

.hec-shaft-helix {
  stroke: rgba(228, 255, 247, 0.92);
  stroke-width: 4;
  stroke-dasharray: 24 18;
  filter: drop-shadow(0 0 6px rgba(89, 226, 173, 0.85));
  animation: hec-shaft-helix var(--hec-machine-duration) linear infinite;
}

.hec-shaft-coupling {
  fill: rgba(7, 34, 35, 0.58);
  stroke: #bffff0;
  stroke-width: 3;
  transform-box: fill-box;
  transform-origin: center;
  animation: hec-coupling var(--hec-machine-duration) ease-in-out infinite alternate;
}

.hec-runner {
  animation: hec-spin var(--hec-machine-duration) linear infinite;
}

.hec-runner-ring {
  fill: rgba(5, 30, 34, 0.5);
  stroke: #d5fff4;
  stroke-width: 4;
}

.hec-runner-blade {
  fill: rgba(213, 255, 244, 0.96);
  filter: drop-shadow(0 0 4px rgba(89, 226, 173, 0.75));
}

.hec-runner-orbit {
  stroke: rgba(116, 255, 212, 0.82);
  stroke-width: 4;
  stroke-dasharray: 8 22;
  transform-box: fill-box;
  transform-origin: center;
  animation: hec-spin-reverse calc(var(--hec-machine-duration) * 1.35) linear infinite;
}

.hec-generator-field {
  fill: none;
  stroke: var(--hec-green);
  stroke-width: 3;
  stroke-dasharray: 34 18;
  opacity: 0.58;
  filter: drop-shadow(0 0 7px rgba(89, 226, 173, 0.78));
  animation: hec-field-rotate calc(var(--hec-machine-duration) * 2.6) linear infinite;
}

.hec-generator-core {
  stroke: #d9fff5;
  stroke-width: 5;
  stroke-dasharray: 6 9;
  transform-box: fill-box;
  transform-origin: center;
  animation: hec-spin var(--hec-machine-duration) linear infinite;
}

.hec-energy-aura {
  stroke: rgba(255, 199, 104, 0.4);
  stroke-width: 17;
}

.hec-energy-flow {
  stroke: #fff2ba;
  stroke-width: 4;
  stroke-dasharray: 12 23;
  animation: hec-energy-flow var(--hec-energy-duration) linear infinite;
}

.hec-energy-packets {
  stroke: #fff;
  stroke-width: 9;
  stroke-dasharray: 2 76;
  animation: hec-energy-packets calc(var(--hec-energy-duration) * 1.55) linear infinite;
}

.hec-transformer-pulse {
  fill: none;
  stroke: #ffe8a1;
  stroke-width: 3;
  stroke-linecap: round;
  opacity: 0.7;
  animation: hec-field-pulse 1.25s ease-in-out infinite;
}

.hec-stage-focus {
  fill: none;
  stroke: #fff;
  stroke-width: 3;
  filter: drop-shadow(0 0 8px rgba(89, 226, 173, 0.95));
  transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.hec-stage-focus__pulse {
  stroke: rgba(89, 226, 173, 0.82);
  stroke-width: 4;
  transform-box: fill-box;
  transform-origin: center;
  animation: hec-focus-pulse 1.55s ease-out infinite;
}

.hec-stage-focus__ring {
  fill: rgba(8, 73, 58, 0.18);
  stroke: #eafff8;
}

.hec-leaders {
  z-index: 3;
  overflow: visible;
  pointer-events: none;
}

.hec-leader {
  stroke: rgba(239, 255, 251, 0.7);
  stroke-width: 1.4;
  stroke-dasharray: 3 3;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.92));
  transition: opacity 220ms ease, stroke 220ms ease, stroke-width 220ms ease;
}

.hec-leader__anchor {
  fill: rgba(4, 25, 29, 0.72);
  stroke: rgba(235, 255, 250, 0.92);
  stroke-width: 2;
}

.hec-leader__core {
  fill: #eafff8;
}

.hec-leaders g[data-active='true'] .hec-leader {
  stroke: #71f1bd;
  stroke-width: 2.4;
  stroke-dasharray: none;
}

.hec-leaders g[data-active='true'] .hec-leader__anchor {
  fill: #167b5f;
  stroke: #fff;
  filter: drop-shadow(0 0 7px rgba(89, 226, 173, 0.95));
}

.hec-leaders g[data-active='true'] .hec-leader__core {
  fill: #fff;
}

.hec-leaders g[data-selected='true'] .hec-leader {
  stroke: #fff;
  stroke-width: 3.2;
  filter: drop-shadow(0 0 5px rgba(89, 226, 173, 0.95));
}

.hec-callouts {
  z-index: 5;
  pointer-events: none;
}

.hec-callout {
  position: absolute;
  top: var(--hec-label-y);
  left: clamp(70px, var(--hec-label-x), calc(100% - 70px));
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 44px;
  min-height: 44px;
  max-width: 142px;
  padding: 5px 7px 5px 5px;
  border: 1px solid rgba(239, 255, 251, 0.42);
  border-radius: 6px;
  background: rgba(3, 23, 27, 0.82);
  color: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  font: inherit;
  font-size: clamp(12px, 0.78vw, 13px);
  font-weight: 780;
  line-height: 1.12;
  text-align: left;
  text-shadow: 0 1px 3px #000;
  transform: translate(-50%, -50%);
  transition: border-color 180ms ease, background 180ms ease, box-shadow 180ms ease, transform 180ms ease;
  pointer-events: auto;
  cursor: pointer;
}

.hec-callout__number {
  display: grid;
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.76);
  border-radius: 50%;
  background: rgba(9, 54, 58, 0.9);
  color: var(--hec-cyan);
  font-size: 12px;
  font-weight: 900;
  text-shadow: none;
}

.hec-callout__label {
  display: block;
  min-width: 0;
}

.hec-callout[data-stage-active='true'] {
  border-color: rgba(117, 246, 198, 0.62);
  background: rgba(7, 58, 49, 0.9);
}

.hec-callout:hover,
.hec-callout[aria-pressed='true'] {
  border-color: rgba(117, 246, 198, 0.9);
  background: rgba(7, 73, 57, 0.94);
  box-shadow: 0 0 0 3px rgba(89, 226, 173, 0.14), 0 5px 18px rgba(0, 0, 0, 0.45);
  transform: translate(-50%, -50%) scale(1.04);
}

.hec-playback-status {
  position: absolute;
  z-index: 6;
  right: 10px;
  bottom: 10px;
  gap: 7px;
  min-height: 30px;
  padding: 5px 9px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 7px;
  background: rgba(4, 22, 26, 0.86);
  color: #f0fbf9;
  font-size: 13px;
  font-weight: 800;
  pointer-events: none;
}

.hec-conversion {
  position: absolute;
  z-index: 6;
  top: 9px;
  left: 50%;
  gap: 7px;
  padding: 6px 9px;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 7px;
  background: rgba(4, 22, 26, 0.82);
  color: #e9f6f4;
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.24);
  font-size: 11px;
  font-weight: 800;
  transform: translateX(-50%);
  pointer-events: none;
}

.hec-conversion span {
  gap: 4px;
}

.hec-conversion svg {
  width: 13px;
  height: 13px;
  color: var(--hec-cyan);
}

.hec-conversion span:last-child svg {
  color: var(--hec-amber);
}

.hec-conversion i {
  width: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.46);
}

.hec-equipment-key {
  display: none;
  padding: 10px 12px 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: #081f25;
}

.hec-equipment-key p {
  margin: 0 0 7px;
  color: #bcd1d0;
  font-size: 12.5px;
  font-weight: 800;
}

.hec-equipment-key ol {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 5px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.hec-equipment-key button {
  display: flex;
  width: 100%;
  min-height: 44px;
  align-items: center;
  gap: 7px;
  padding: 5px 7px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.035);
  color: #c3d5d4;
  font: inherit;
  font-size: 11px;
  font-weight: 730;
  line-height: 1.2;
  text-align: left;
}

.hec-equipment-key button > span {
  display: grid;
  flex: 0 0 23px;
  width: 23px;
  height: 23px;
  place-items: center;
  border-radius: 50%;
  background: rgba(116, 220, 255, 0.1);
  color: var(--hec-cyan);
  font-size: 11px;
  font-weight: 900;
}

.hec-equipment-key button[aria-pressed='true'] {
  border-color: rgba(89, 226, 173, 0.6);
  background: rgba(28, 117, 91, 0.34);
  color: #fff;
}

.hec-equipment-key button[data-stage-active='true']:not([aria-pressed='true']) {
  border-color: rgba(89, 226, 173, 0.3);
  background: rgba(28, 117, 91, 0.13);
}

.hec-tour {
  padding: 10px 13px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  background: #081f25;
}

.hec-tabs {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding-bottom: 7px;
  scrollbar-width: thin;
  scrollbar-color: rgba(116, 220, 255, 0.36) transparent;
}

.hec-tabs button {
  display: flex;
  flex: 1 0 auto;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 44px;
  padding: 6px 9px;
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.035);
  color: #a9c0c0;
  font: inherit;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.hec-tabs button:hover {
  border-color: rgba(116, 220, 255, 0.44);
  color: #fff;
}

.hec-tabs button[aria-selected='true'] {
  border-color: rgba(89, 226, 173, 0.66);
  background: rgba(28, 117, 91, 0.38);
  color: #fff;
}

.hec-tabs button span {
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.09);
  color: var(--hec-cyan);
  font-size: 11px;
}

.hec-stage-panel {
  position: relative;
  min-height: 68px;
  gap: 12px;
  overflow: hidden;
  padding: 10px 11px 13px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.035);
}

.hec-stage-panel > span {
  color: rgba(116, 220, 255, 0.5);
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.06em;
}

.hec-stage-panel strong {
  display: block;
  color: #f5fffc;
  font-size: 12px;
}

.hec-stage-panel p {
  margin: 3px 0 0;
  color: #afc4c4;
  font-size: 12.5px;
  line-height: 1.45;
}

.hec-stage-progress {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  background: rgba(255, 255, 255, 0.05);
}

.hec-stage-progress b {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, var(--hec-water), var(--hec-green));
  transform: scaleX(0);
  transform-origin: left;
  animation: hec-stage-progress 3.6s linear infinite;
}

.hec-note {
  display: block;
  margin-top: 7px;
  color: #829d9f;
  font-size: 12.5px;
  line-height: 1.4;
}

.hec-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
}

.hec-play:focus-visible,
.hec-flow-control input:focus-visible,
.hec-callout:focus-visible,
.hec-equipment-key button:focus-visible,
.hec-tabs button:focus-visible,
.hec-stage-panel:focus-visible {
  outline: 3px solid #fff;
  outline-offset: 2px;
}

.hec-shell[data-playing='false'] :is(
  .hec-layer-status__motion,
  .hec-playback-status i,
  .hec-reservoir-motion,
  .hec-water-flow,
  .hec-tailrace-flow,
  .hec-water-packets,
  .hec-tailrace-packets,
  .hec-shaft-light,
  .hec-shaft-helix,
  .hec-shaft-coupling,
  .hec-runner,
  .hec-runner-orbit,
  .hec-generator-field,
  .hec-generator-core,
  .hec-energy-flow,
  .hec-energy-packets,
  .hec-transformer-pulse,
  .hec-stage-focus__pulse,
  .hec-stage-progress b
) {
  animation-play-state: paused;
}

.hec-shell[data-tour-active='false'] .hec-stage-progress b {
  animation-play-state: paused;
}

.hec-shell[data-playing='false'] .hec-playback-status i {
  background: #9db0b1;
  box-shadow: none;
}

@keyframes hec-status-pulse {
  0%, 100% { opacity: 0.55; transform: scale(0.78); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes hec-reservoir {
  0%, 100% { opacity: 0.42; transform: translateX(-7px); }
  50% { opacity: 0.95; transform: translateX(8px); }
}

@keyframes hec-water-flow {
  to { stroke-dashoffset: -104; }
}

@keyframes hec-water-packets {
  to { stroke-dashoffset: -220; }
}

@keyframes hec-shaft-rise {
  to { stroke-dashoffset: 84; }
}

@keyframes hec-shaft-helix {
  to { stroke-dashoffset: -84; }
}

@keyframes hec-coupling {
  from { opacity: 0.46; transform: scaleX(0.82); }
  to { opacity: 1; transform: scaleX(1.1); }
}

@keyframes hec-spin {
  to { transform: rotate(360deg); }
}

@keyframes hec-spin-reverse {
  to { transform: rotate(-360deg); }
}

@keyframes hec-field-rotate {
  0% { opacity: 0.35; transform: rotate(0deg) scale(0.93); }
  50% { opacity: 0.9; transform: rotate(180deg) scale(1.04); }
  100% { opacity: 0.35; transform: rotate(360deg) scale(0.93); }
}

@keyframes hec-field-pulse {
  0%, 100% { opacity: 0.25; transform: translateY(2px); }
  50% { opacity: 0.95; transform: translateY(-3px); }
}

@keyframes hec-energy-flow {
  to { stroke-dashoffset: -105; }
}

@keyframes hec-energy-packets {
  to { stroke-dashoffset: -156; }
}

@keyframes hec-focus-pulse {
  0% { opacity: 0.85; transform: scale(0.62); }
  80%, 100% { opacity: 0; transform: scale(1.42); }
}

@keyframes hec-stage-progress {
  to { transform: scaleX(1); }
}

@media (min-width: 1700px) {
  .hydro-hero--cutaway {
    grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.72fr);
    align-items: start;
  }
}

@container (max-width: 950px) {
  .hec-equipment-key {
    display: block;
  }

  .hec-callouts,
  .hec-leaders {
    display: none;
  }
}

@media (max-width: 900px) {
  .hec-equipment-key {
    display: block;
  }

  .hec-callouts,
  .hec-leaders {
    display: none;
  }
}

@media (max-width: 760px) {
  .hec-toolbar {
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px;
  }

  .hec-heading {
    flex: 1 0 100%;
  }

  .hec-controls {
    width: 100%;
  }

  .hec-flow-control {
    flex: 1 1 auto;
    width: auto;
  }

  .hec-play {
    flex: 0 0 auto;
  }

  .hec-layer-status {
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 4px 14px;
    padding: 6px 12px;
  }

  .hec-conversion {
    display: none;
  }

  .hec-playback-status {
    right: 6px;
    bottom: 6px;
    min-height: 26px;
    padding: 4px 7px;
    font-size: 11px;
  }

  .hec-callout {
    min-height: 40px;
    padding: 4px;
    border-radius: 5px;
  }

  .hec-callout__number {
    flex-basis: 20px;
    width: 20px;
    height: 20px;
  }

  .hec-stage-panel {
    align-items: flex-start;
  }
}

@media (max-width: 430px) {
  .hec-shell {
    border-radius: 11px;
  }

  .hec-heading > span {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
  }

  .hec-heading h2 {
    font-size: 14px;
  }

  .hec-heading p {
    font-size: 11px;
  }

  .hec-play {
    min-width: 96px;
  }

  .hec-layer-status {
    align-items: flex-start;
    flex-direction: column;
    font-size: 11px;
  }

  .hec-equipment-key ol {
    gap: 4px;
  }

  .hec-equipment-key button {
    padding: 4px 5px;
    font-size: 13px;
  }

  .hec-callout {
    max-width: 105px;
    font-size: 11px;
  }

  .hec-stage-panel > span {
    font-size: 20px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hec-water-system,
  .hec-machine-system,
  .hec-electric-system,
  .hec-stage-focus,
  .hec-leader,
  .hec-callout {
    transition: none;
  }

  .hec-layer-status__motion,
  .hec-playback-status i,
  .hec-reservoir-motion,
  .hec-water-flow,
  .hec-tailrace-flow,
  .hec-water-packets,
  .hec-tailrace-packets,
  .hec-shaft-light,
  .hec-shaft-helix,
  .hec-shaft-coupling,
  .hec-runner,
  .hec-runner-orbit,
  .hec-generator-field,
  .hec-generator-core,
  .hec-energy-flow,
  .hec-energy-packets,
  .hec-transformer-pulse,
  .hec-stage-focus__pulse,
  .hec-stage-progress b {
    animation: none;
  }
}

@media print {
  .hec-shell {
    break-inside: avoid;
    box-shadow: none;
  }

  .hec-controls,
  .hec-playback-status,
  .hec-callouts,
  .hec-tabs,
  .hec-note {
    display: none;
  }

  .hec-equipment-key {
    display: block;
  }
}
`,ke=`/academia-iat/`.replace(/\/$/,``),H=`M322 315 C405 318 448 355 487 433 C548 556 629 703 797 750`,U=`M850 787 C934 852 1085 829 1328 774`,W=`M925 357 C1017 347 1064 338 1130 336 C1260 330 1337 234 1410 125`,G=Object.freeze([{id:`captacao`,label:`Captação`,component:`Reservatório e tomada d’água`,description:`A água alcança a tomada protegida por grades. As comportas permitem isolar o circuito para inspeção e manutenção.`,x:20,y:33,labelX:10.5,labelY:23,focusEquipmentId:`tomada`},{id:`aducao`,label:`Adução`,component:`Conduto forçado`,description:`O conduto leva a água sob pressão até a unidade geradora. O traçado e as perdas hidráulicas influenciam a energia disponível.`,x:36,y:57,labelX:23,labelY:55,focusEquipmentId:`conduto`},{id:`turbina`,label:`Rotação`,component:`Turbina`,description:`O escoamento transfere energia ao rotor da turbina. A seleção da máquina depende, entre outros fatores, da queda e da faixa de vazões.`,x:53.5,y:81,labelX:42.5,labelY:87,focusEquipmentId:`turbina`},{id:`eixo`,label:`Transmissão mecânica`,component:`Eixo`,description:`O eixo transmite a rotação da turbina ao rotor do gerador, mantendo os dois equipamentos mecanicamente acoplados.`,x:53.5,y:62,labelX:64,labelY:61,focusEquipmentId:`eixo`},{id:`gerador`,label:`Geração`,component:`Gerador`,description:`A rotação do conjunto produz energia elétrica no gerador por indução eletromagnética.`,x:53.5,y:39,labelX:43,labelY:31,focusEquipmentId:`gerador`},{id:`transformacao`,label:`Transformação`,component:`Transformador`,description:`O transformador adequa a tensão elétrica às condições definidas para a conexão do empreendimento.`,x:75,y:38,labelX:83,labelY:48,focusEquipmentId:`transformador`},{id:`rede`,label:`Conexão`,component:`Subestação e linhas`,description:`Equipamentos de manobra e proteção conduzem a energia ao ponto de conexão, em rede de distribuição ou transmissão conforme o acesso definido para o empreendimento.`,x:88,y:16,labelX:78.5,labelY:13,focusEquipmentId:`subestacao`},{id:`restituicao`,label:`Restituição`,component:`Canal de fuga`,description:`Depois de atravessar a turbina, a água segue pelo tubo de sucção e retorna ao rio a jusante pelo canal de fuga.`,x:74,y:87,labelX:82,labelY:85,focusEquipmentId:`canal-fuga`}]),K=Object.freeze([{id:`reservatorio`,name:`Reservatório a montante`,stageId:`captacao`,x:8,y:29,labelX:7,labelY:15},{id:`barragem`,name:`Barragem`,stageId:`captacao`,x:30,y:32,labelX:30,labelY:16},{id:`grade`,name:`Grade de proteção`,stageId:`captacao`,x:18.5,y:26,labelX:8.5,labelY:30},{id:`comporta`,name:`Comporta`,stageId:`captacao`,x:20,y:30.5,labelX:9.5,labelY:38},{id:`tomada`,name:`Tomada d’água`,stageId:`captacao`,x:20.5,y:35,labelX:11.5,labelY:46},{id:`conduto`,name:`Conduto forçado`,stageId:`aducao`,x:36,y:58,labelX:23,labelY:58},{id:`casa-forca`,name:`Casa de força`,stageId:`gerador`,x:47,y:27,labelX:42,labelY:19},{id:`ponte-rolante`,name:`Ponte rolante`,stageId:`gerador`,x:55,y:22,labelX:63,labelY:18},{id:`gerador`,name:`Gerador`,stageId:`gerador`,x:53.5,y:39,labelX:43,labelY:35},{id:`eixo`,name:`Eixo`,stageId:`eixo`,x:53.5,y:62,labelX:64,labelY:59},{id:`turbina`,name:`Turbina / rotor`,stageId:`turbina`,x:53.5,y:78,labelX:43,labelY:82},{id:`tubo-succao`,name:`Tubo de sucção`,stageId:`restituicao`,x:55,y:87,labelX:63,labelY:91},{id:`canal-fuga`,name:`Canal de fuga`,stageId:`restituicao`,x:70,y:87,labelX:81,labelY:85},{id:`transformador`,name:`Transformador`,stageId:`transformacao`,x:75,y:40,labelX:83,labelY:48},{id:`subestacao`,name:`Subestação`,stageId:`rede`,x:77,y:29,labelX:86.5,labelY:34},{id:`linhas`,name:`Linhas de transmissão`,stageId:`rede`,x:88,y:14,labelX:82.5,labelY:11}]);function Ae(){let[e,t]=(0,x.useState)(!1);return(0,x.useEffect)(()=>{if(typeof window>`u`||typeof window.matchMedia!=`function`)return;let e=window.matchMedia(`(prefers-reduced-motion: reduce)`),n=()=>t(e.matches);return n(),e.addEventListener?.(`change`,n),()=>e.removeEventListener?.(`change`,n)},[]),e}function je(e){let[t,n]=(0,x.useState)(!0);return(0,x.useEffect)(()=>{if(typeof IntersectionObserver!=`function`||!e.current)return;let t=new IntersectionObserver(([e])=>n(e.isIntersecting),{rootMargin:`120px 0px`,threshold:.05});return t.observe(e.current),()=>t.disconnect()},[e]),t}function Me({activeId:e,focusPoint:t,idPrefix:n}){let r=[`captacao`,`aducao`,`turbina`,`restituicao`].includes(e),i=[`turbina`,`eixo`,`gerador`].includes(e),a=[`gerador`,`transformacao`,`rede`].includes(e),o=`${n}-water-glow`,s=`${n}-energy-glow`,c=`${n}-rotor-glow`;return(0,S.jsxs)(`svg`,{className:`hec-overlay`,viewBox:`0 0 1600 900`,"aria-hidden":`true`,children:[(0,S.jsxs)(`defs`,{children:[(0,S.jsxs)(`filter`,{id:o,x:`-40%`,y:`-40%`,width:`180%`,height:`180%`,children:[(0,S.jsx)(`feGaussianBlur`,{stdDeviation:`5`,result:`blur`}),(0,S.jsxs)(`feMerge`,{children:[(0,S.jsx)(`feMergeNode`,{in:`blur`}),(0,S.jsx)(`feMergeNode`,{in:`SourceGraphic`})]})]}),(0,S.jsxs)(`filter`,{id:s,x:`-50%`,y:`-50%`,width:`200%`,height:`200%`,children:[(0,S.jsx)(`feGaussianBlur`,{stdDeviation:`4`,result:`blur`}),(0,S.jsxs)(`feMerge`,{children:[(0,S.jsx)(`feMergeNode`,{in:`blur`}),(0,S.jsx)(`feMergeNode`,{in:`SourceGraphic`})]})]}),(0,S.jsxs)(`radialGradient`,{id:c,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#d9fff5`,stopOpacity:`.95`}),(0,S.jsx)(`stop`,{offset:`.5`,stopColor:`#56e2b0`,stopOpacity:`.52`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#56e2b0`,stopOpacity:`0`})]})]}),(0,S.jsxs)(`g`,{className:`hec-water-system${r?` is-active`:``}`,"data-motion-layer":`agua`,children:[(0,S.jsxs)(`g`,{className:`hec-reservoir-motion`,children:[(0,S.jsx)(`path`,{d:`M36 281 Q100 264 164 281 T292 281`}),(0,S.jsx)(`path`,{d:`M55 302 Q115 286 175 302 T295 302`}),(0,S.jsx)(`path`,{d:`M82 323 Q132 310 182 323 T282 323`})]}),(0,S.jsx)(`path`,{className:`hec-water-aura`,d:H,style:{filter:`url(#${o})`}}),(0,S.jsx)(`path`,{className:`hec-water-flow`,d:H,style:{filter:`url(#${o})`}}),(0,S.jsx)(`path`,{className:`hec-water-packets`,d:H,style:{filter:`url(#${o})`}}),(0,S.jsx)(`path`,{className:`hec-tailrace-aura`,d:U,style:{filter:`url(#${o})`}}),(0,S.jsx)(`path`,{className:`hec-tailrace-flow`,d:U,style:{filter:`url(#${o})`}}),(0,S.jsx)(`path`,{className:`hec-tailrace-packets`,d:U,style:{filter:`url(#${o})`}})]}),(0,S.jsxs)(`g`,{className:`hec-machine-system${i?` is-active`:``}`,children:[(0,S.jsxs)(`g`,{"data-motion-layer":`eixo`,className:`hec-shaft-system`,children:[(0,S.jsx)(`path`,{className:`hec-shaft-light`,d:`M855 362 L855 696`,style:{filter:`url(#${o})`}}),(0,S.jsx)(`path`,{className:`hec-shaft-helix`,d:`M840 414 Q855 398 870 414 T840 446 T870 478 T840 510 T870 542 T840 574 T870 606 T840 638 T870 670`}),[430,500,570,640].map(e=>(0,S.jsx)(`ellipse`,{className:`hec-shaft-coupling`,cx:`855`,cy:e,rx:`20`,ry:`7`},e))]}),(0,S.jsxs)(`g`,{"data-motion-layer":`turbina`,className:`hec-runner-wrap`,children:[(0,S.jsxs)(`g`,{className:`hec-runner`,style:{transformOrigin:`855px 733px`},children:[(0,S.jsx)(`circle`,{cx:`855`,cy:`733`,r:`52`,fill:`url(#${c})`}),(0,S.jsx)(`circle`,{cx:`855`,cy:`733`,r:`29`,className:`hec-runner-ring`}),[0,60,120,180,240,300].map(e=>(0,S.jsx)(`path`,{d:`M855 703 C875 709 884 720 886 733 C871 726 860 727 855 733 Z`,className:`hec-runner-blade`,transform:`rotate(${e} 855 733)`},e))]}),(0,S.jsx)(`circle`,{className:`hec-runner-orbit`,cx:`855`,cy:`733`,r:`58`})]}),(0,S.jsxs)(`g`,{"data-motion-layer":`gerador`,className:`hec-generator-system`,children:[(0,S.jsxs)(`g`,{className:`hec-generator-field`,style:{transformOrigin:`855px 365px`},children:[(0,S.jsx)(`ellipse`,{cx:`855`,cy:`365`,rx:`63`,ry:`24`}),(0,S.jsx)(`ellipse`,{cx:`855`,cy:`365`,rx:`86`,ry:`34`}),(0,S.jsx)(`path`,{d:`M773 365 C796 327 914 327 937 365`}),(0,S.jsx)(`path`,{d:`M773 365 C796 403 914 403 937 365`})]}),(0,S.jsx)(`circle`,{className:`hec-generator-core`,cx:`855`,cy:`365`,r:`24`})]})]}),(0,S.jsxs)(`g`,{className:`hec-electric-system${a?` is-active`:``}`,"data-motion-layer":`energia`,children:[(0,S.jsx)(`path`,{className:`hec-energy-aura`,d:W,style:{filter:`url(#${s})`}}),(0,S.jsx)(`path`,{className:`hec-energy-flow`,d:W,style:{filter:`url(#${s})`}}),(0,S.jsx)(`path`,{className:`hec-energy-packets`,d:W,style:{filter:`url(#${s})`}}),(0,S.jsxs)(`g`,{className:`hec-transformer-pulse`,style:{filter:`url(#${s})`},children:[(0,S.jsx)(`path`,{d:`M1160 312 q20 -20 40 0 t40 0`}),(0,S.jsx)(`path`,{d:`M1154 325 q24 -25 48 0 t48 0`})]})]}),(0,S.jsxs)(`g`,{className:`hec-stage-focus`,"data-focus-equipment":t.id,transform:`translate(${t.x*16} ${t.y*9})`,children:[(0,S.jsx)(`circle`,{className:`hec-stage-focus__pulse`,r:`43`}),(0,S.jsx)(`circle`,{className:`hec-stage-focus__ring`,r:`22`}),(0,S.jsx)(`path`,{d:`M-31 0 H-20 M20 0 H31 M0 -31 V-20 M0 20 V31`})]})]})}function Ne({activeId:e,selectedEquipmentId:t}){return(0,S.jsx)(`svg`,{className:`hec-leaders`,viewBox:`0 0 1600 900`,"aria-hidden":`true`,children:K.map(n=>(0,S.jsxs)(`g`,{"data-active":n.stageId===e?`true`:`false`,"data-selected":n.id===t?`true`:`false`,children:[(0,S.jsx)(`line`,{className:`hec-leader`,x1:n.x*16,y1:n.y*9,x2:n.labelX*16,y2:n.labelY*9,vectorEffect:`non-scaling-stroke`}),(0,S.jsx)(`circle`,{className:`hec-leader__anchor`,cx:n.x*16,cy:n.y*9,r:`7`}),(0,S.jsx)(`circle`,{className:`hec-leader__core`,cx:n.x*16,cy:n.y*9,r:`3`})]},n.id))})}function Pe(){let e=Ae(),t=(0,x.useRef)(null),r=je(t),i=`hec-${(0,x.useId)().replace(/:/g,``)}`,[a,o]=(0,x.useState)({stageId:G[0].id,equipmentId:G[0].focusEquipmentId}),[s,c]=(0,x.useState)(!0),[l,u]=(0,x.useState)(!0),[d,p]=(0,x.useState)(72),m=a.stageId,h=a.equipmentId,g=G.findIndex(e=>e.id===m),_=G[g]||G[0],ee=K.find(({id:e})=>e===h)||K[0],b=s&&!e&&r,C=b&&l;(0,x.useEffect)(()=>{e&&c(!1)},[e]),(0,x.useEffect)(()=>{if(!C)return;let e=window.setInterval(()=>{o(e=>{let t=G[(G.findIndex(t=>t.id===e.stageId)+1)%G.length];return{stageId:t.id,equipmentId:t.focusEquipmentId}})},3600);return()=>window.clearInterval(e)},[C]);let w=e=>{let t=G.find(t=>t.id===e)||G[0];o({stageId:t.id,equipmentId:t.focusEquipmentId}),c(!1)},T=e=>{o({stageId:e.stageId,equipmentId:e.id}),c(!1)},te=e=>{if(![`ArrowLeft`,`ArrowRight`,`Home`,`End`].includes(e.key))return;let t=[...e.currentTarget.querySelectorAll(`[role="tab"]`)],n=t.indexOf(document.activeElement);if(n<0)return;e.preventDefault();let r=n;e.key===`Home`&&(r=0),e.key===`End`&&(r=t.length-1),e.key===`ArrowLeft`&&(r=(n-1+t.length)%t.length),e.key===`ArrowRight`&&(r=(n+1)%t.length),t[r].focus(),w(t[r].dataset.stageId)},E=Math.max(.72,2.55-d*.017),D={"--hec-flow-duration":`${E}s`,"--hec-machine-duration":`${Math.max(.78,E*.92)}s`,"--hec-energy-duration":`${Math.max(.6,E*.72)}s`,"--hec-flow-strength":`${.42+d/150}`},O=e?`Movimento reduzido ativo`:b?`Animação em movimento`:`Animação pausada`;return(0,S.jsxs)(`figure`,{className:`hec-shell`,style:D,"data-playing":b?`true`:`false`,"data-tour-active":C?`true`:`false`,"data-motion-preference":e?`reduced`:`full`,"aria-labelledby":`hec-title`,"aria-describedby":`hec-description hec-layer-description`,onPointerDown:()=>u(!1),onFocusCapture:()=>u(!1),children:[(0,S.jsx)(`style`,{children:Oe}),(0,S.jsxs)(`header`,{className:`hec-toolbar`,children:[(0,S.jsxs)(`div`,{className:`hec-heading`,children:[(0,S.jsx)(`span`,{"aria-hidden":`true`,children:(0,S.jsx)(y,{})}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h2`,{id:`hec-title`,children:`Usina hidrelétrica em operação`}),(0,S.jsx)(`p`,{children:`Observe o percurso animado e selecione cada equipamento.`})]})]}),(0,S.jsxs)(`div`,{className:`hec-controls`,children:[(0,S.jsxs)(`label`,{className:`hec-flow-control`,children:[(0,S.jsxs)(`span`,{children:[`Velocidade do fluxo `,(0,S.jsxs)(`strong`,{children:[d,`%`]})]}),(0,S.jsx)(`input`,{type:`range`,min:`35`,max:`100`,value:d,onChange:e=>p(Number(e.target.value)),"aria-valuetext":`${d}% da velocidade visual`,"aria-describedby":`hec-flow-note`})]}),(0,S.jsxs)(`button`,{type:`button`,className:`hec-play`,onClick:()=>{u(!0),c(e=>!e)},disabled:e,"aria-pressed":b,"aria-label":b?`Pausar animação didática`:`Reproduzir animação didática`,children:[b?(0,S.jsx)(n,{"aria-hidden":`true`}):(0,S.jsx)(f,{"aria-hidden":`true`}),(0,S.jsx)(`span`,{children:b?`Pausar`:`Reproduzir`})]})]})]}),(0,S.jsx)(`p`,{id:`hec-description`,className:`hec-visually-hidden`,children:`Corte de uma usina: a água sai do reservatório, atravessa a tomada e o conduto forçado, movimenta a turbina e o eixo, aciona o gerador, retorna ao rio e a energia segue pelo transformador e pela subestação até o ponto de conexão em rede de distribuição ou transmissão.`}),(0,S.jsxs)(`div`,{className:`hec-layer-status`,id:`hec-layer-description`,children:[(0,S.jsxs)(`span`,{children:[(0,S.jsx)(`i`,{className:`hec-layer-status__static`,"aria-hidden":`true`}),`Base ilustrada estática`]}),(0,S.jsxs)(`span`,{children:[(0,S.jsx)(`i`,{className:`hec-layer-status__motion`,"aria-hidden":`true`}),`Água, turbina, eixo, gerador e energia animados`]})]}),(0,S.jsxs)(`div`,{className:`hec-scene`,"data-stage":m,ref:t,children:[(0,S.jsx)(`img`,{className:`hec-static-base`,"data-visual-layer":`base-estatica`,src:`${ke}/hidro/usina-corte-realista.webp`,alt:``,"aria-hidden":`true`,width:`1600`,height:`900`,loading:`eager`,fetchPriority:`high`,decoding:`async`}),(0,S.jsx)(Me,{activeId:m,focusPoint:ee,idPrefix:i}),(0,S.jsx)(Ne,{activeId:m,selectedEquipmentId:h}),(0,S.jsxs)(`div`,{className:`hec-playback-status`,role:`status`,"aria-live":`polite`,children:[(0,S.jsx)(`i`,{"aria-hidden":`true`}),O]}),(0,S.jsx)(`div`,{className:`hec-callouts`,"aria-label":`Equipamentos identificados no corte técnico`,children:K.map((e,t)=>(0,S.jsxs)(`button`,{type:`button`,className:`hec-callout`,style:{"--hec-label-x":`${e.labelX}%`,"--hec-label-y":`${e.labelY}%`},"aria-label":`Localizar ${e.name}`,"aria-pressed":e.id===h,"aria-controls":`hec-stage-panel`,"data-stage-active":e.stageId===m?`true`:`false`,onClick:()=>T(e),children:[(0,S.jsx)(`span`,{className:`hec-callout__number`,"aria-hidden":`true`,children:t+1}),(0,S.jsx)(`span`,{className:`hec-callout__label`,children:e.name})]},e.id))}),(0,S.jsxs)(`div`,{className:`hec-conversion`,"aria-hidden":`true`,children:[(0,S.jsxs)(`span`,{children:[(0,S.jsx)(y,{}),` água`]}),(0,S.jsx)(`i`,{}),(0,S.jsx)(`span`,{children:`rotação`}),(0,S.jsx)(`i`,{}),(0,S.jsxs)(`span`,{children:[(0,S.jsx)(v,{}),` energia`]})]})]}),(0,S.jsxs)(`nav`,{className:`hec-equipment-key`,"aria-label":`Legenda dos equipamentos`,children:[(0,S.jsx)(`p`,{children:`Equipamentos: toque para localizar`}),(0,S.jsx)(`ol`,{children:K.map((e,t)=>(0,S.jsx)(`li`,{children:(0,S.jsxs)(`button`,{type:`button`,"aria-pressed":e.id===h,"aria-controls":`hec-stage-panel`,"data-stage-active":e.stageId===m?`true`:`false`,onClick:()=>T(e),children:[(0,S.jsx)(`span`,{"aria-hidden":`true`,children:t+1}),e.name]})},e.id))})]}),(0,S.jsxs)(`div`,{className:`hec-tour`,children:[(0,S.jsx)(`div`,{className:`hec-tabs`,role:`tablist`,"aria-label":`Etapas da geração`,onKeyDown:te,children:G.map((e,t)=>(0,S.jsxs)(`button`,{type:`button`,role:`tab`,id:`hec-tab-${e.id}`,"aria-selected":e.id===m,"aria-controls":`hec-stage-panel`,tabIndex:e.id===m?0:-1,"data-stage-id":e.id,onClick:()=>w(e.id),children:[(0,S.jsx)(`span`,{children:t+1}),e.label]},e.id))}),(0,S.jsxs)(`div`,{id:`hec-stage-panel`,className:`hec-stage-panel`,role:`tabpanel`,"aria-labelledby":`hec-tab-${_.id}`,"aria-live":C?`off`:`polite`,"aria-atomic":`true`,tabIndex:`0`,children:[(0,S.jsx)(`span`,{children:String(g+1).padStart(2,`0`)}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`strong`,{children:_.component}),(0,S.jsx)(`p`,{children:_.description})]}),(0,S.jsx)(`i`,{className:`hec-stage-progress`,"aria-hidden":`true`,children:(0,S.jsx)(`b`,{})})]}),(0,S.jsx)(`small`,{id:`hec-flow-note`,className:`hec-note`,children:`Representação didática, sem escala e sem vínculo com empreendimento específico. O controle altera somente a velocidade visual das camadas; não representa vazão ou desempenho de projeto.`})]})]})}var q=Object.freeze([{id:`hydro-principio`,label:`Princípio`},{id:`hydro-anatomia`,label:`Anatomia`},{id:`hydro-potencia`,label:`Potência`},{id:`hydro-competencias`,label:`Competências`},{id:`hydro-tipologias`,label:`Tipologias`},{id:`hydro-operacao`,label:`Operação`},{id:`hydro-barramentos`,label:`Barramentos`},{id:`hydro-turbinas`,label:`Turbinas`},{id:`hydro-casos`,label:`Casos do Paraná`},{id:`hydro-arranjos`,label:`Arranjos`},{id:`hydro-licenciamento`,label:`Licenciamento`}]);function Fe(e){return Math.min(100,Math.max(0,Math.round(e)))}function Ie(){return typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches}function Le(){let e=(0,x.useRef)(null),[t,n]=(0,x.useState)(()=>!Ie()),[r,i]=(0,x.useState)(1),[a,o]=(0,x.useState)(!0),[s,c]=(0,x.useState)(Ie);return(0,x.useEffect)(()=>{if(typeof window>`u`||typeof window.matchMedia!=`function`)return;let e=window.matchMedia(`(prefers-reduced-motion: reduce)`),t=()=>c(e.matches);return t(),e.addEventListener?.(`change`,t),()=>e.removeEventListener?.(`change`,t)},[]),(0,x.useEffect)(()=>{let t=e.current;if(!t||typeof IntersectionObserver>`u`)return;let n=new IntersectionObserver(([e])=>o(e.isIntersecting),{rootMargin:`120px 0px`,threshold:.01});return n.observe(t),()=>n.disconnect()},[]),{stageRef:e,playing:t,setPlaying:n,speed:r,setSpeed:i,inView:a,reducedMotion:s,active:t&&a&&!s,style:{"--hydro-motion-scale":(1/r).toFixed(3)}}}function Re({id:e,label:t,motion:r,activeDescription:i}){let a=i;return r.reducedMotion?a=`Movimento reduzido pelo dispositivo`:r.playing?r.inView||(a=`Pausada automaticamente fora da tela`):a=`Animação pausada`,(0,S.jsxs)(`div`,{className:`hydro-motion-controls`,"aria-label":`Controles da animação: ${t}`,children:[(0,S.jsxs)(`div`,{className:`hydro-motion-status`,role:`status`,"aria-live":`polite`,children:[(0,S.jsx)(`span`,{"aria-hidden":`true`}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`small`,{children:`Agora na cena`}),(0,S.jsx)(`strong`,{children:a})]})]}),(0,S.jsxs)(`button`,{type:`button`,className:`hydro-motion-toggle`,onClick:()=>r.setPlaying(e=>!e),"aria-pressed":r.playing,disabled:r.reducedMotion,children:[r.playing?(0,S.jsx)(n,{"aria-hidden":`true`}):(0,S.jsx)(f,{"aria-hidden":`true`}),r.playing?`Pausar`:`Reproduzir`]}),(0,S.jsxs)(`label`,{className:`hydro-motion-speed`,htmlFor:`${e}-speed`,children:[(0,S.jsxs)(`span`,{children:[`Velocidade `,(0,S.jsxs)(`strong`,{children:[r.speed.toFixed(2).replace(`.00`,``),`×`]})]}),(0,S.jsx)(`input`,{id:`${e}-speed`,type:`range`,min:`0.5`,max:`2`,step:`0.25`,value:r.speed,"aria-valuetext":`${r.speed.toFixed(2).replace(`.00`,``)} vezes a velocidade normal`,onChange:e=>r.setSpeed(Number(e.target.value)),disabled:r.reducedMotion})]})]})}function ze({sections:e,scrollY:t=0,viewportHeight:n=0,activationOffset:r=0}){let i=e.filter(e=>Number.isFinite(e.top)&&Number.isFinite(e.bottom));if(!i.length)return{activeId:q[0].id,progress:0};let a=t+r,o=i[0].id;for(let e of i){if(e.top>a)break;o=e.id}let s=i[0].top,c=Math.max(s+1,i.at(-1).bottom-n),l=Fe((a-s)/(c-s)*100);return{activeId:o,progress:l}}function Be(){let e=getComputedStyle(document.documentElement).getPropertyValue(`--top`).trim();return Number.parseFloat(e)||74}var J=0,Y=null;function Ve(e,t){let n=document.getElementById(e);if(!n)return;J&&window.cancelAnimationFrame(J),Y?.();let r=[...document.querySelectorAll(`.hydro-long-section`)],i=r.map(e=>[e,e.style.getPropertyValue(`content-visibility`)]),a=()=>{i.forEach(([e,t])=>{t?e.style.setProperty(`content-visibility`,t):e.style.removeProperty(`content-visibility`)}),Y===a&&(Y=null)};Y=a,r.forEach(e=>e.style.setProperty(`content-visibility`,`visible`)),document.documentElement.scrollHeight,n.scrollIntoView({block:`start`,inline:`nearest`,behavior:`auto`}),n.focus({preventScroll:!0});let o=120,s=0,c=0,l=()=>{J=0;let e=document.querySelector(`.hydro-guide-nav`),r=Be()+(e?.offsetHeight||0)+10,i=n.getBoundingClientRect().top-r;if(Math.abs(i)>1){let e=window.scrollY||document.documentElement.scrollTop||0;window.scrollTo({top:Math.max(0,e+i),behavior:`auto`}),c=0}else c+=1;--o,s+=1,s===4&&a(),o>0&&(s<60||c<12)?J=window.requestAnimationFrame(l):(a(),t?.())};J=window.requestAnimationFrame(l)}function He(){let e=(0,x.useRef)(null),t=(0,x.useRef)(null),n=(0,x.useRef)(()=>{}),[r,i]=(0,x.useState)({activeId:q[0].id,progress:0});(0,x.useEffect)(()=>{let e=0,r=()=>{e=0;let n=window.scrollY||document.documentElement.scrollTop||0,r=ze({sections:q.map(({id:e})=>{let t=document.getElementById(e);if(!t)return{id:e,top:NaN,bottom:NaN};let r=t.getBoundingClientRect();return{id:e,top:r.top+n,bottom:r.bottom+n}}),scrollY:n,viewportHeight:window.innerHeight,activationOffset:Be()+(document.querySelector(`.hydro-guide-nav`)?.offsetHeight||86)+10});t.current&&(r.activeId=t.current),i(e=>e.activeId===r.activeId&&e.progress===r.progress?e:r)},a=()=>{e||=window.requestAnimationFrame(r)};n.current=a;let o=()=>{t.current&&(t.current=null,a())},s=e=>{[`ArrowUp`,`ArrowDown`,`PageUp`,`PageDown`,`Home`,`End`,` `].includes(e.key)&&o()};return r(),window.addEventListener(`scroll`,a,{passive:!0}),window.addEventListener(`resize`,a),window.addEventListener(`wheel`,o,{passive:!0}),window.addEventListener(`touchstart`,o,{passive:!0}),window.addEventListener(`pointerdown`,o,{passive:!0}),window.addEventListener(`keydown`,s),()=>{window.removeEventListener(`scroll`,a),window.removeEventListener(`resize`,a),window.removeEventListener(`wheel`,o),window.removeEventListener(`touchstart`,o),window.removeEventListener(`pointerdown`,o),window.removeEventListener(`keydown`,s),e&&window.cancelAnimationFrame(e),n.current=()=>{}}},[]),(0,x.useEffect)(()=>{let t=e.current,n=t?.querySelector(`[data-hydro-nav-target="${r.activeId}"]`);if(!t||!n||typeof t.scrollTo!=`function`)return;let i=t.getBoundingClientRect(),a=n.getBoundingClientRect();if(!(a.left<i.left||a.right>i.right))return;let o=window.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches;t.scrollTo({left:Math.max(0,n.offsetLeft-(t.clientWidth-n.offsetWidth)/2),behavior:o?`auto`:`smooth`})},[r.activeId]);function a(e){if(![`ArrowLeft`,`ArrowRight`,`Home`,`End`].includes(e.key))return;let t=[...e.currentTarget.querySelectorAll(`[data-hydro-nav-target]`)],n=t.indexOf(document.activeElement);if(n<0)return;e.preventDefault();let r=n;e.key===`Home`&&(r=0),e.key===`End`&&(r=t.length-1),e.key===`ArrowLeft`&&(r=Math.max(0,n-1)),e.key===`ArrowRight`&&(r=Math.min(t.length-1,n+1)),t[r]?.focus()}return(0,S.jsxs)(`nav`,{className:`hydro-guide-nav`,"aria-label":`Seções deste guia`,onKeyDown:a,children:[(0,S.jsxs)(`div`,{className:`hydro-guide-nav__summary`,children:[(0,S.jsx)(`strong`,{children:`Neste guia`}),(0,S.jsxs)(`span`,{children:[r.progress,`% lido`]})]}),(0,S.jsx)(`div`,{className:`hydro-guide-nav__links`,ref:e,children:q.map(e=>(0,S.jsx)(`button`,{type:`button`,"data-hydro-nav-target":e.id,"aria-current":r.activeId===e.id?`location`:void 0,onClick:()=>{t.current=e.id,i(t=>({...t,activeId:e.id})),Ve(e.id,()=>{t.current===e.id&&n.current()})},children:e.label},e.id))}),(0,S.jsx)(`div`,{className:`hydro-guide-nav__progress`,role:`progressbar`,"aria-label":`Progresso de leitura deste guia`,"aria-valuemin":`0`,"aria-valuemax":`100`,"aria-valuenow":r.progress,children:(0,S.jsx)(`span`,{style:{width:`${r.progress}%`}})})]})}var X=[{id:`reservatorio`,nome:`Reservatório`,icon:l,resumo:`Massa de água represada que estoca energia potencial.`,detalhe:`Volume de água acumulado a montante da barragem. A diferença de nível entre a superfície do reservatório e o nível de água no canal de fuga, a jusante, é a queda bruta. A queda líquida disponível à turbina desconta as perdas hidráulicas. Reservatórios de acumulação podem regularizar vazões; arranjos a fio d'água têm pouca ou nenhuma regularização sazonal. Área e volume, isoladamente, não definem a operação nem a magnitude dos impactos.`},{id:`barragem`,nome:`Barragem / barramento`,icon:o,resumo:`Estrutura que barra o rio e cria a queda.`,detalhe:`Barra o curso d'água, eleva o nível a montante e sustenta a pressão da água. Pode ser de concreto estabilizado pelo peso próprio, em arco ou com contrafortes, ou de aterro em terra ou enrocamento. É a estrutura de maior responsabilidade estrutural e alvo central da segurança de barragens.`},{id:`vertedouro`,nome:`Vertedouro`,icon:y,resumo:`Extravasa com segurança as cheias.`,detalhe:`Órgão de descarga que verte o excedente de água nas cheias, protegendo a barragem do galgamento. Pode ter comportas ou ser de soleira livre. O dimensionamento parte da cheia de projeto; a energia da água vertida é dissipada em bacia de dissipação ou salto de esqui.`},{id:`tomada`,nome:`Tomada d'água`,icon:c,resumo:`Capta a água e protege com grades.`,detalhe:`Estrutura de captação que conduz a água do reservatório ao circuito de geração. Possui grades (trash racks) para reter detritos e comportas para bloqueio e manutenção. Sua cota define o nível mínimo operativo.`},{id:`conduto`,nome:`Conduto forçado / adução`,icon:i,resumo:`Leva a água sob pressão até a turbina.`,detalhe:`Tubulação (penstock) ou túnel que conduz a água sob pressão da tomada d'água até a turbina. Em circuitos longos, uma chaminé de equilíbrio (surge tank) absorve o golpe de aríete das manobras. Converte energia de posição em energia de pressão e velocidade.`},{id:`casa`,nome:`Casa de força`,icon:m,resumo:`Abriga turbinas e geradores.`,detalhe:`Edificação que abriga as unidades geradoras (turbina + gerador), sistemas de controle, regulação e os equipamentos auxiliares. Pode ser ao pé da barragem, abrigada, ao ar livre ou subterrânea, conforme o arranjo e a topografia.`},{id:`turbina`,nome:`Turbina + gerador`,icon:h,resumo:`Converte o movimento da água em eletricidade.`,detalhe:`A turbina transforma a energia hidráulica em energia mecânica de rotação; acoplada ao gerador, produz energia elétrica. O tipo (Pelton, Francis, Kaplan, bulbo) é escolhido pela queda e pela vazão do aproveitamento.`},{id:`fuga`,nome:`Tubo de sucção e canal de fuga`,icon:u,resumo:`Devolve a água ao rio a jusante.`,detalhe:`Após passar pela turbina, a água segue pelo tubo de sucção (que recupera parte da energia) e pelo canal de fuga de volta ao leito do rio, a jusante. A cota do canal de fuga fecha o cálculo da queda bruta; a queda líquida é a bruta menos as perdas de carga na tomada, na adução e no conduto forçado.`},{id:`subestacao`,nome:`Subestação e conexão`,icon:g,resumo:`Eleva a tensão e conecta ao sistema.`,detalhe:`A energia gerada passa pelos transformadores e equipamentos de manobra e proteção da subestação. A conexão pode integrar rede de distribuição ou de transmissão, conforme tensão e ponto de acesso definidos para o empreendimento. Os requisitos variam conforme a rede e o agente responsável; não presuma uma LDAT ou conexão direta ao Sistema Interligado Nacional sem conferir os atos e projetos do caso.`}],Ue=[{sigla:`MCH`,nome:`Microcentral Hidrelétrica`,faixa:`até 75 kW`,cor:`#7ec8a9`,nota:`Potência igual ou inferior a 75 kW. Confirmar potência, supressão, outorga, arranjo e intervenção em APP antes de definir entre DLAM, LAS ou outra modalidade. Erro recorrente: tratar como CGH sem verificar potência e características atuais.`},{sigla:`MGH`,nome:`Minigeradora Hidrelétrica`,faixa:`acima de 75 kW até 500 kW`,cor:`#37d39a`,nota:`Potência superior a 75 kW e até 500 kW. Confirmar IDA, supressão e alagamento para definir entre DLAM, LAC, LAS ou outra forma aplicável. Erro recorrente: aplicar licenciamento complexo sem avaliar o enquadramento.`},{sigla:`CGH`,nome:`Central Geradora Hidrelétrica`,faixa:`acima de 500 kW até 5 MW`,cor:`#2fb8c9`,nota:`Potência superior a 500 kW e até 5 MW. Confirmar se está abaixo ou acima de 1 MW, porque a Consulta Prévia é obrigatória a partir de 1 MW. Erro recorrente: exigir autorização ou concessão da ANEEL como se fosse PCH, sem verificar a regra setorial aplicável.`},{sigla:`PCH`,nome:`Pequena Central Hidrelétrica`,faixa:`acima de 5 MW até 30 MW`,cor:`#4cc4f5`,nota:`No eixo ambiental do IAT: potência superior a 5 MW e até 30 MW, com reservatório de até 3 km², ressalvada a exceção da IN. No eixo setorial, o art. 5º da REN ANEEL 875/2020, com redação da REN 1.070/2023, enquadra PCH pela faixa superior a 5 MW e até 30 MW, sem limite de área. A página geral Outorgas ainda cita 13 km², mas diverge do ato consolidado e da página operacional de 2026. Não misture os eixos e confirme o ato aplicável ao caso.`},{sigla:`UHE`,nome:`Usina Hidrelétrica`,faixa:`acima de 30 MW`,cor:`#9fb7ff`,nota:`No eixo ambiental do IAT: capacidade instalada superior a 30 MW, reservatório maior que 3 km² ou definição da ANEEL. O regime setorial distingue autorização e concessão por critérios próprios. O art. 10 da IN IAT nº 09/2025 enquadra a UHE entre as situações passíveis de EIA e RIMA e de audiência pública; o estudo e o rito aplicáveis devem ser confirmados no caso concreto. Erro recorrente: ignorar competência, delegação, processo federal ou o enquadramento ambiental vigente.`}],We=[{nome:`Fio d'água`,icon:y,desc:`Opera com pouca ou nenhuma regularização sazonal e geração mais dependente da vazão afluente. Pode envolver menor alagamento que uma alternativa de acumulação, mas isso não significa impacto automaticamente menor: avalie barramento, trecho de vazão reduzida, conectividade, sedimentos, fauna, usos da água e localização.`},{nome:`Acumulação / regularização`,icon:l,desc:`Armazena água para regularizar vazões entre períodos e ampliar a flexibilidade de geração. Pode ampliar alagamento, deplecionamento e deslocamentos, mas a natureza e a magnitude dos impactos dependem também da localização, do arranjo, da regra operativa e das medidas de controle.`},{nome:`Reversível (bombeamento)`,icon:_,desc:`Bombeia água para um reservatório superior nas horas de baixa demanda e turbina nas horas de pico. Funciona como uma "bateria" hídrica de grande porte para o sistema.`}],Z=[{nome:`Concreto estabilizado pelo peso próprio`,resiste:`Resiste pelo peso próprio`,onde:`Vales abertos, fundação rochosa`,svg:`peso-proprio`},{nome:`Concreto em arco`,resiste:`Transfere a carga às ombreiras`,onde:`Vales estreitos e rochosos`,svg:`arco`},{nome:`Contrafortes`,resiste:`Laje apoiada em contrafortes`,onde:`Economia de concreto em vãos`,svg:`contraforte`},{nome:`Terra (aterro)`,resiste:`Maciço de solo compactado com núcleo impermeável`,onde:`Vales largos, farto material local`,svg:`terra`},{nome:`Enrocamento`,resiste:`Maciço de rocha com face de concreto (CFRD) ou núcleo argiloso`,onde:`Boa disponibilidade de rocha`,svg:`enrocamento`},{nome:`CCR, concreto compactado a rolo`,resiste:`Concreto seco compactado em camadas, como um aterro`,onde:`Execução rápida de grandes volumes`,svg:`ccr`}],Ge=[{nome:`Pelton`,tipo:`Ação (impulso)`,queda:`Queda alta: acima de ~250 m`,vazao:`Vazão baixa`,nota:`Jatos d'água atingem conchas na periferia da roda. Típica de aproveitamentos de montanha.`,hMin:250,hMax:1800},{nome:`Francis`,tipo:`Reação`,queda:`Queda média: ~30 a 400 m`,vazao:`Vazão média`,nota:`A mais usada no Brasil. Água entra em espiral (caracol) e sai axialmente. Ampla faixa de aplicação.`,hMin:30,hMax:400},{nome:`Kaplan`,tipo:`Reação`,queda:`Queda baixa: ~10 a 70 m`,vazao:`Vazão alta`,nota:`Hélice com pás ajustáveis, mantém rendimento com vazão variável. Comum em grandes rios de planície.`,hMin:10,hMax:70},{nome:`Bulbo`,tipo:`Reação`,queda:`Queda muito baixa: abaixo de ~15 m`,vazao:`Vazão muito alta`,nota:`Unidade horizontal submersa. Típica de usinas a fio d'água em rios de grande vazão e pouca queda.`,hMin:2,hMax:15}];function Q(e){return!Number.isFinite(e)||e<0?null:e<=.075?{sigla:`MCH`,faixa:`até 75 kW`}:e<=.5?{sigla:`MGH`,faixa:`acima de 75 kW até 500 kW`}:e<=5?{sigla:`CGH`,faixa:`acima de 500 kW até 5 MW`}:e<=30?{sigla:`PCH`,faixa:`acima de 5 MW até 30 MW`}:{sigla:`UHE`,faixa:`acima de 30 MW`}}function $(e){return Number.isFinite(e)?Ge.filter(t=>e>=t.hMin&&e<=t.hMax).map(e=>e.nome):[]}function Ke({kind:e}){let t={className:`dm-agua`,fill:`url(#dm-agua-${e})`},n=`url(#dm-ponta-r-${e})`;return(0,S.jsxs)(`svg`,{viewBox:`0 0 120 70`,className:`dam-mini`,"aria-hidden":`true`,children:[(0,S.jsxs)(`defs`,{children:[(0,S.jsxs)(`linearGradient`,{id:`dm-ceu-${e}`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#6ea9d6`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#c6dce3`})]}),(0,S.jsxs)(`linearGradient`,{id:`dm-agua-${e}`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#8ed0f2`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#1c5f88`})]}),(0,S.jsxs)(`linearGradient`,{id:`dm-rocha-${e}`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#6d5f4c`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#2f2a22`})]}),(0,S.jsxs)(`linearGradient`,{id:`dm-conc-${e}`,x1:`0`,y1:`0`,x2:`1`,y2:`0`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#e0e3dc`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#87908a`})]}),(0,S.jsxs)(`linearGradient`,{id:`dm-terra-${e}`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#cbbb92`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#8a7a55`})]}),(0,S.jsxs)(`linearGradient`,{id:`dm-enroc-${e}`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#a2acb2`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#556069`})]}),(0,S.jsx)(`marker`,{id:`dm-ponta-${e}`,markerWidth:`5`,markerHeight:`5`,refX:`4`,refY:`2.5`,orient:`auto`,children:(0,S.jsx)(`path`,{d:`M0 0 L5 2.5 L0 5 Z`,fill:`#eaf7ff`})}),(0,S.jsx)(`marker`,{id:`dm-ponta-r-${e}`,markerWidth:`5`,markerHeight:`5`,refX:`4`,refY:`2.5`,orient:`auto`,children:(0,S.jsx)(`path`,{d:`M0 0 L5 2.5 L0 5 Z`,fill:`#ffd479`})})]}),e===`arco`?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`rect`,{x:`0`,y:`18`,width:`58`,height:`34`,fill:`url(#dm-agua-${e})`,opacity:`0.4`}),(0,S.jsx)(`rect`,{x:`58`,y:`18`,width:`62`,height:`34`,fill:`#7c6b52`,opacity:`0.55`}),(0,S.jsx)(`path`,{d:`M62 26 Q86 34 118 30 M64 44 Q88 38 118 42`,stroke:`#9c8a6c`,strokeWidth:`1`,fill:`none`,opacity:`0.7`}),(0,S.jsx)(`rect`,{x:`0`,y:`0`,width:`120`,height:`20`,fill:`url(#dm-rocha-${e})`}),(0,S.jsx)(`rect`,{x:`0`,y:`50`,width:`120`,height:`20`,fill:`url(#dm-rocha-${e})`}),(0,S.jsx)(`rect`,{x:`0`,y:`18`,width:`120`,height:`2.2`,fill:`#4c7a56`}),(0,S.jsx)(`rect`,{x:`0`,y:`50`,width:`120`,height:`2.2`,fill:`#4c7a56`})]}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`rect`,{width:`120`,height:`52`,fill:`url(#dm-ceu-${e})`}),(0,S.jsx)(`path`,{d:`M0 42 L26 34 L52 43 L78 32 L104 43 L120 36 L120 52 L0 52 Z`,fill:`#7d9d84`,opacity:`0.45`}),(0,S.jsx)(`rect`,{x:`0`,y:`52`,width:`120`,height:`18`,fill:`url(#dm-rocha-${e})`}),(0,S.jsx)(`rect`,{x:`0`,y:`52`,width:`120`,height:`2.4`,fill:`#4c7a56`})]}),(0,S.jsx)(`path`,{className:`dm-empuxo`,d:e===`arco`?`M30 35 L52 35`:`M30 41 L52 41`,stroke:`#eaf7ff`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:`url(#dm-ponta-${e})`}),e===`peso-proprio`&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`rect`,{x:`2`,y:`30`,width:`54`,height:`22`,...t}),(0,S.jsx)(`rect`,{x:`2`,y:`30`,width:`54`,height:`2`,fill:`#dff2ff`,opacity:`0.5`}),(0,S.jsx)(`path`,{d:`M56 52 L56 20 L78 52 Z`,fill:`url(#dm-conc-${e})`,stroke:`#5f6a63`,strokeWidth:`1`}),(0,S.jsx)(`path`,{d:`M54 18 L60 18 L60 23 L54 23 Z`,fill:`#eef1eb`,stroke:`#5f6a63`,strokeWidth:`0.8`}),(0,S.jsx)(`path`,{d:`M61 30 L61 52 M66 38 L66 52 M71 45 L71 52`,stroke:`#9aa39c`,strokeWidth:`0.7`,opacity:`0.8`}),(0,S.jsx)(`path`,{className:`dm-reacao`,d:`M64 30 L64 48`,stroke:`#ffd479`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:n})]}),e===`arco`&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`rect`,{x:`2`,y:`20`,width:`54`,height:`30`,...t}),(0,S.jsx)(`path`,{d:`M56 20 Q74 35 56 50 L62 50 Q80 35 62 20 Z`,fill:`url(#dm-conc-${e})`,stroke:`#5f6a63`,strokeWidth:`1`}),(0,S.jsx)(`path`,{d:`M54 16 L64 16 L64 22 L54 22 Z`,fill:`#8d7f66`}),(0,S.jsx)(`path`,{d:`M54 54 L64 54 L64 48 L54 48 Z`,fill:`#8d7f66`}),(0,S.jsx)(`path`,{className:`dm-reacao`,d:`M63 29 L70 20`,stroke:`#ffd479`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:n}),(0,S.jsx)(`path`,{className:`dm-reacao`,d:`M63 41 L70 50`,stroke:`#ffd479`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:n})]}),e===`contraforte`&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`rect`,{x:`2`,y:`30`,width:`54`,height:`22`,...t}),(0,S.jsx)(`rect`,{x:`2`,y:`30`,width:`54`,height:`2`,fill:`#dff2ff`,opacity:`0.5`}),(0,S.jsx)(`path`,{d:`M54 17 L60 16 L78 52 L70 52 Z`,fill:`url(#dm-conc-${e})`,stroke:`#5f6a63`,strokeWidth:`1`}),(0,S.jsx)(`path`,{d:`M62 52 L69 34 L72 34 L68 52 Z`,fill:`#9aa39c`,stroke:`#5f6a63`,strokeWidth:`0.7`}),(0,S.jsx)(`path`,{d:`M72 52 L75 42 L78 42 L77 52 Z`,fill:`#9aa39c`,stroke:`#5f6a63`,strokeWidth:`0.7`}),(0,S.jsx)(`path`,{className:`dm-reacao`,d:`M62 32 L71 49`,stroke:`#ffd479`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:n})]}),e===`terra`&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`rect`,{x:`2`,y:`34`,width:`48`,height:`18`,...t}),(0,S.jsx)(`rect`,{x:`2`,y:`34`,width:`48`,height:`2`,fill:`#dff2ff`,opacity:`0.5`}),(0,S.jsx)(`path`,{d:`M48 52 L62 24 L70 24 L88 52 Z`,fill:`url(#dm-terra-${e})`,stroke:`#7a6a45`,strokeWidth:`1`}),(0,S.jsx)(`path`,{d:`M63 24 L69 24 L74 52 L60 52 Z`,fill:`#6b5c3a`,opacity:`0.92`}),(0,S.jsxs)(`g`,{fill:`#a89868`,opacity:`0.5`,children:[(0,S.jsx)(`circle`,{cx:`55`,cy:`44`,r:`1.4`}),(0,S.jsx)(`circle`,{cx:`58`,cy:`36`,r:`1.1`}),(0,S.jsx)(`circle`,{cx:`79`,cy:`45`,r:`1.4`}),(0,S.jsx)(`circle`,{cx:`76`,cy:`38`,r:`1.1`})]}),(0,S.jsx)(`path`,{className:`dm-reacao`,d:`M66 32 L66 49`,stroke:`#ffd479`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:n})]}),e===`enrocamento`&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`rect`,{x:`2`,y:`34`,width:`48`,height:`18`,...t}),(0,S.jsx)(`rect`,{x:`2`,y:`34`,width:`48`,height:`2`,fill:`#dff2ff`,opacity:`0.5`}),(0,S.jsx)(`path`,{d:`M48 52 L62 24 L70 24 L88 52 Z`,fill:`url(#dm-enroc-${e})`,stroke:`#4e5860`,strokeWidth:`1`}),(0,S.jsx)(`path`,{d:`M48 52 L62 24 L65 24 L52 52 Z`,fill:`#dfe3dd`,stroke:`#5f6a63`,strokeWidth:`0.7`}),(0,S.jsx)(`g`,{fill:`#7b858c`,opacity:`0.75`,children:(0,S.jsx)(`path`,{d:`M68 34 l4 -3 l3 4 l-4 2 Z M74 42 l5 -3 l3 4 l-5 3 Z M66 44 l4 -3 l3 4 l-4 2 Z M78 48 l4 -3 l3 4 l-4 2 Z`})}),(0,S.jsx)(`path`,{className:`dm-reacao`,d:`M68 34 L68 49`,stroke:`#ffd479`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:n})]}),e===`ccr`&&(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(`rect`,{x:`2`,y:`30`,width:`54`,height:`22`,...t}),(0,S.jsx)(`rect`,{x:`2`,y:`30`,width:`54`,height:`2`,fill:`#dff2ff`,opacity:`0.5`}),(0,S.jsx)(`path`,{d:`M56 52 L56 20 L78 52 Z`,fill:`url(#dm-conc-${e})`,stroke:`#5f6a63`,strokeWidth:`1`}),(0,S.jsx)(`g`,{stroke:`#8f988f`,strokeWidth:`0.8`,opacity:`0.95`,children:(0,S.jsx)(`path`,{d:`M56 26 L60 26 M56 31 L63 31 M56 36 L67 36 M56 41 L70 41 M56 46 L74 46`})}),(0,S.jsx)(`path`,{d:`M54 18 L60 18 L60 23 L54 23 Z`,fill:`#eef1eb`,stroke:`#5f6a63`,strokeWidth:`0.8`}),(0,S.jsx)(`path`,{className:`dm-reacao`,d:`M63 30 L63 48`,stroke:`#ffd479`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:n})]})]})}function qe(){let[e,t]=(0,x.useState)(Z[0].svg),n=Le(),r=Z.find(t=>t.svg===e)||Z[0],i=(e,n)=>{let r=n;if(e.key===`ArrowRight`||e.key===`ArrowDown`)r=(n+1)%Z.length;else if(e.key===`ArrowLeft`||e.key===`ArrowUp`)r=(n-1+Z.length)%Z.length;else if(e.key===`Home`)r=0;else if(e.key===`End`)r=Z.length-1;else return;e.preventDefault(),t(Z[r].svg),e.currentTarget.parentElement?.querySelectorAll(`[role="tab"]`)[r]?.focus()};return(0,S.jsxs)(`div`,{className:`dam-explorer`,children:[(0,S.jsx)(Re,{id:`hydro-barramentos`,label:`Tipos de barramento`,motion:n,activeDescription:`${r.nome}: acompanhe o empuxo da água e a reação da estrutura`}),(0,S.jsx)(`div`,{className:`dam-selector`,role:`tablist`,"aria-label":`Escolha o tipo de barramento`,children:Z.map((n,r)=>(0,S.jsxs)(`button`,{id:`dam-tab-${n.svg}`,type:`button`,role:`tab`,"aria-selected":n.svg===e,"aria-controls":`dam-selected-panel`,tabIndex:n.svg===e?0:-1,className:n.svg===e?`active`:``,onClick:()=>t(n.svg),onKeyDown:e=>i(e,r),children:[(0,S.jsx)(`span`,{"aria-hidden":`true`,children:String(r+1).padStart(2,`0`)}),n.nome]},n.svg))}),(0,S.jsxs)(`article`,{id:`dam-selected-panel`,className:`dam-selected-panel`,role:`tabpanel`,"aria-labelledby":`dam-tab-${r.svg}`,children:[(0,S.jsxs)(`figure`,{ref:n.stageRef,className:`dam-stage hydro-motion-stage`,"data-playing":n.active?`true`:`false`,style:n.style,children:[(0,S.jsx)(Ke,{kind:r.svg}),(0,S.jsxs)(`figcaption`,{children:[(0,S.jsx)(`strong`,{children:r.nome}),(0,S.jsx)(`span`,{children:`Representação técnica ampliada, corte esquemático sem escala.`})]})]}),(0,S.jsxs)(`div`,{className:`dam-facts`,"aria-live":`polite`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`small`,{children:`Como recebe a ação da água`}),(0,S.jsx)(`strong`,{children:`Empuxo a montante`})]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`small`,{children:`Como a estrutura responde`}),(0,S.jsx)(`strong`,{children:r.resiste})]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`small`,{children:`Condição típica de implantação`}),(0,S.jsx)(`strong`,{children:r.onde})]})]}),(0,S.jsxs)(`div`,{className:`dam-force-legend`,"aria-label":`Legenda das forças`,children:[(0,S.jsxs)(`span`,{children:[(0,S.jsx)(`i`,{className:`dam-force-legend__water`}),` Água a montante`]}),(0,S.jsxs)(`span`,{children:[(0,S.jsx)(`i`,{className:`dam-force-legend__thrust`}),` Empuxo da água`]}),(0,S.jsxs)(`span`,{children:[(0,S.jsx)(`i`,{className:`dam-force-legend__reaction`}),` Reação da estrutura`]})]})]})]})}var Je=[{id:`reservatorio`,texto:`Reservatório`,x:16,y:232,ancora:`start`,guia:[96,240,120,286]},{id:`barragem`,texto:`Barragem`,x:262,y:214,ancora:`end`,guia:[232,222,268,292]},{id:`vertedouro`,texto:`Vertedouro`,x:360,y:250,ancora:`start`,guia:[356,244,318,300]},{id:`tomada`,texto:`Tomada d'água`,x:150,y:392,ancora:`end`,guia:[156,386,234,348]},{id:`conduto`,texto:`Conduto forçado`,x:348,y:350,ancora:`start`,guia:[344,356,396,380]},{id:`casa`,texto:`Casa de força`,x:600,y:306,ancora:`middle`,guia:[600,312,600,332]},{id:`turbina`,texto:`Turbina e gerador`,x:585,y:458,ancora:`middle`,guia:[585,446,585,414]},{id:`fuga`,texto:`Canal de fuga`,x:800,y:386,ancora:`middle`,guia:[800,392,800,406]},{id:`subestacao`,texto:`Subestação`,x:716,y:276,ancora:`start`,guia:[712,282,692,302]}],Ye=Object.freeze({reservatorio:{cx:126,cy:302,rx:112,ry:55},barragem:{cx:278,cy:338,rx:45,ry:92},vertedouro:{cx:316,cy:338,rx:35,ry:88},tomada:{cx:248,cy:344,rx:35,ry:34},conduto:{cx:412,cy:380,rx:150,ry:34},casa:{cx:600,cy:382,rx:78,ry:60},turbina:{cx:585,cy:398,rx:34,ry:31},fuga:{cx:772,cy:420,rx:122,ry:27},subestacao:{cx:690,cy:330,rx:45,ry:48}});function Xe({item:e,ativo:t,onSelect:n}){let r=e.texto.length*7.4+16,i=e.ancora===`end`?e.x-r:e.ancora===`middle`?e.x-r/2:e.x;return(0,S.jsxs)(`g`,{className:`cs-rotulo`+(t?` ativo`:``),onClick:()=>n(e.id),"aria-hidden":`true`,children:[(0,S.jsx)(`line`,{x1:e.guia[0],y1:e.guia[1],x2:e.guia[2],y2:e.guia[3]}),(0,S.jsx)(`rect`,{x:i,y:e.y-13,width:r,height:19,rx:9}),(0,S.jsx)(`text`,{x:e.x,y:e.y,textAnchor:e.ancora,children:e.texto})]})}function Ze({selected:e,onSelect:t}){let n=Le(),r=X.find(t=>t.id===e)||X[0],i=Ye[e]||Ye.reservatorio,a=(n,r,i)=>(0,S.jsx)(`button`,{className:`cs-hot`+(e===n?` active`:``),style:{left:`${r}%`,top:`${i}%`},onClick:()=>t(n),"aria-label":X.find(e=>e.id===n)?.nome,"aria-pressed":e===n,"aria-controls":`hydro-anatomia-detail`,children:(0,S.jsx)(`span`,{})},n);return(0,S.jsxs)(`div`,{className:`cross-explorer`,children:[(0,S.jsx)(Re,{id:`hydro-anatomia`,label:`Anatomia do arranjo`,motion:n,activeDescription:`${r.nome}: água, rotação e energia mostram o percurso associado`}),(0,S.jsxs)(`div`,{ref:n.stageRef,className:`cross-wrap hydro-motion-stage`,"data-playing":n.active?`true`:`false`,"data-selected":e,style:n.style,children:[(0,S.jsxs)(`svg`,{viewBox:`0 120 900 350`,className:`cross-svg`,role:`img`,"aria-label":`Corte esquemático de uma usina hidrelétrica. A água represada no reservatório entra pela tomada d'água, desce pelo conduto forçado até a casa de força, gira a turbina acoplada ao gerador e é restituída ao rio pelo canal de fuga. A diferença entre o nível do reservatório e o nível do canal de fuga é a queda bruta. O vertedouro escoa o excedente sem passar pela turbina.`,children:[(0,S.jsxs)(`defs`,{children:[(0,S.jsxs)(`linearGradient`,{id:`cs-ceu`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#6ea9d6`}),(0,S.jsx)(`stop`,{offset:`0.5`,stopColor:`#a6cbe1`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#cadfd9`})]}),(0,S.jsxs)(`linearGradient`,{id:`cs-agua`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#86ccf0`}),(0,S.jsx)(`stop`,{offset:`0.3`,stopColor:`#3f9fd4`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#164f74`})]}),(0,S.jsxs)(`linearGradient`,{id:`cs-agua-fuga`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#8ed2f4`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#276e9c`})]}),(0,S.jsxs)(`linearGradient`,{id:`cs-concreto`,x1:`0`,y1:`0`,x2:`1`,y2:`0`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#dcdfd8`}),(0,S.jsx)(`stop`,{offset:`0.42`,stopColor:`#b9bdb5`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#7f8780`})]}),(0,S.jsxs)(`linearGradient`,{id:`cs-concreto-topo`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#eceee8`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#c2c7bf`})]}),(0,S.jsxs)(`linearGradient`,{id:`cs-rocha`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#6d5f4c`}),(0,S.jsx)(`stop`,{offset:`0.4`,stopColor:`#544a3c`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#332e26`})]}),(0,S.jsxs)(`linearGradient`,{id:`cs-aco`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#5c676d`}),(0,S.jsx)(`stop`,{offset:`0.32`,stopColor:`#c2ccd1`}),(0,S.jsx)(`stop`,{offset:`0.5`,stopColor:`#93a0a7`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#3f484d`})]}),(0,S.jsxs)(`linearGradient`,{id:`cs-morro`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#8fae9b`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#6b8d79`})]}),(0,S.jsxs)(`linearGradient`,{id:`cs-encosta`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#6e9179`}),(0,S.jsx)(`stop`,{offset:`0.55`,stopColor:`#587a62`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#41604b`})]}),(0,S.jsxs)(`linearGradient`,{id:`cs-mata`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,S.jsx)(`stop`,{offset:`0`,stopColor:`#3f6b4a`}),(0,S.jsx)(`stop`,{offset:`1`,stopColor:`#2c4f36`})]}),(0,S.jsx)(`clipPath`,{id:`cs-recorte-rocha`,children:(0,S.jsx)(`path`,{d:`M0 470 L900 470 L900 340 L640 340 L560 420 L250 420 L250 300 L0 300 Z`})}),(0,S.jsx)(`clipPath`,{id:`cs-recorte-agua`,children:(0,S.jsx)(`rect`,{x:`0`,y:`250`,width:`250`,height:`120`})}),(0,S.jsx)(`filter`,{id:`cs-sombra`,x:`-20%`,y:`-20%`,width:`150%`,height:`160%`,children:(0,S.jsx)(`feDropShadow`,{dx:`3`,dy:`5`,stdDeviation:`4`,floodColor:`#16211c`,floodOpacity:`0.42`})})]}),(0,S.jsx)(`rect`,{width:`900`,height:`470`,fill:`url(#cs-ceu)`}),(0,S.jsx)(`path`,{d:`M0 214 L92 176 L150 200 L228 158 L300 196 L372 168 L448 202 L520 172 L604 204 L688 176 L768 206 L840 184 L900 208 L900 250 L0 250 Z`,fill:`url(#cs-morro)`,opacity:`0.5`}),(0,S.jsx)(`path`,{d:`M0 236 L74 208 L156 232 L236 198 L322 230 L404 206 L486 234 L566 208 L652 236 L740 212 L820 238 L900 220 L900 252 L0 252 Z`,fill:`url(#cs-morro)`,opacity:`0.82`}),(0,S.jsx)(`path`,{d:`M318 258 L360 236 L404 252 L462 230 L522 250 L588 232 L654 252 L722 234 L790 252 L858 238 L900 248 L900 272 L318 272 Z`,fill:`url(#cs-mata)`,opacity:`0.68`}),(0,S.jsx)(`path`,{d:`M320 288 Q 470 276, 620 292 T 900 284 L900 344 L320 344 Z`,fill:`#7d9d84`,opacity:`0.55`}),(0,S.jsx)(`path`,{d:`M320 312 Q 500 302, 680 316 T 900 308 L900 344 L320 344 Z`,fill:`#5f8468`,opacity:`0.7`}),(0,S.jsx)(`path`,{d:`M300 266 Q 480 258, 660 268 T 900 262 L900 420 L300 420 Z`,fill:`url(#cs-encosta)`}),(0,S.jsx)(`path`,{d:`M300 336 Q 470 328, 640 342 T 900 334 L900 420 L300 420 Z`,fill:`#4a6f55`,opacity:`0.45`}),(0,S.jsx)(`path`,{d:`M0 470 L900 470 L900 340 L640 340 L560 420 L250 420 L250 300 L0 300 Z`,fill:`url(#cs-rocha)`}),(0,S.jsxs)(`g`,{clipPath:`url(#cs-recorte-rocha)`,opacity:`0.55`,children:[(0,S.jsx)(`path`,{d:`M-20 332 Q 220 320, 460 344 T 920 336 L920 360 Q 460 368, 0 356 Z`,fill:`#7a6a54`,opacity:`0.5`}),(0,S.jsx)(`path`,{d:`M-20 386 Q 240 374, 500 398 T 920 388 L920 410 Q 500 420, 0 408 Z`,fill:`#453d31`,opacity:`0.6`}),(0,S.jsx)(`path`,{d:`M-20 432 Q 260 424, 520 442 T 920 434 L920 470 L-20 470 Z`,fill:`#2a251e`,opacity:`0.55`}),(0,S.jsx)(`path`,{d:`M60 452 L96 428 L134 452 Z M300 462 L336 440 L372 462 Z M700 456 L742 432 L784 456 Z`,fill:`#8a7a62`,opacity:`0.28`})]}),(0,S.jsx)(`path`,{d:`M640 340 L900 340 L900 330 L640 330 Z`,fill:`#4c7a56`}),(0,S.jsx)(`path`,{d:`M250 300 L250 288 L0 288 L0 300 Z`,fill:`#4c7a56`}),(0,S.jsxs)(`g`,{fill:`#3d6b48`,opacity:`0.92`,children:[(0,S.jsx)(`path`,{d:`M644 331 q6 -15 13 -3 q5 -18 12 -1 q7 -11 12 4 Z`}),(0,S.jsx)(`path`,{d:`M688 331 q8 -20 15 -4 q6 -12 11 4 Z`}),(0,S.jsx)(`path`,{d:`M726 331 q5 -12 11 -2 q7 -17 14 2 q6 -9 10 0 Z`}),(0,S.jsx)(`path`,{d:`M778 331 q7 -16 14 -3 q6 -11 11 3 Z`}),(0,S.jsx)(`path`,{d:`M818 331 q6 -13 12 -2 q8 -19 15 2 q5 -8 9 0 Z`}),(0,S.jsx)(`path`,{d:`M868 331 q7 -17 14 -2 q5 -10 10 2 Z`})]}),(0,S.jsxs)(`g`,{fill:`#3d6b48`,opacity:`0.85`,children:[(0,S.jsx)(`path`,{d:`M8 289 q7 -16 14 -3 q6 -12 12 3 Z`}),(0,S.jsx)(`path`,{d:`M56 289 q6 -13 12 -2 q8 -18 15 2 Z`}),(0,S.jsx)(`path`,{d:`M116 289 q8 -19 15 -3 q5 -9 10 3 Z`}),(0,S.jsx)(`path`,{d:`M182 289 q6 -14 13 -2 q7 -15 13 2 Z`})]}),(0,S.jsx)(`rect`,{x:`0`,y:`250`,width:`250`,height:`120`,fill:`url(#cs-agua)`}),(0,S.jsxs)(`g`,{clipPath:`url(#cs-recorte-agua)`,children:[(0,S.jsx)(`path`,{d:`M0 274 Q 62 268, 124 274 T 250 274`,stroke:`#bfe6ff`,strokeWidth:`1.6`,fill:`none`,opacity:`0.24`}),(0,S.jsx)(`path`,{d:`M0 296 Q 62 302, 124 296 T 250 296`,stroke:`#bfe6ff`,strokeWidth:`1.2`,fill:`none`,opacity:`0.16`}),(0,S.jsx)(`path`,{d:`M0 324 Q 62 318, 124 324 T 250 324`,stroke:`#bfe6ff`,strokeWidth:`1`,fill:`none`,opacity:`0.1`}),(0,S.jsx)(`rect`,{x:`0`,y:`250`,width:`250`,height:`9`,fill:`#dff2ff`,opacity:`0.34`})]}),(0,S.jsx)(`path`,{className:`cs-lamina`,d:`M0 250 Q 31 246, 62 250 T 125 250 T 188 250 T 250 250 T 312 250`,stroke:`#eaf7ff`,strokeWidth:`3`,fill:`none`}),(0,S.jsxs)(`g`,{filter:`url(#cs-sombra)`,children:[(0,S.jsx)(`path`,{d:`M250 250 L250 420 L320 420 L300 250 Z`,fill:`url(#cs-concreto)`}),(0,S.jsx)(`path`,{d:`M248 250 L302 250 L303 258 L248 258 Z`,fill:`url(#cs-concreto-topo)`})]}),(0,S.jsx)(`g`,{stroke:`#959c94`,strokeWidth:`0.9`,opacity:`0.5`,children:(0,S.jsx)(`path`,{d:`M262 252 L266 420 M275 252 L281 420 M288 252 L296 420`})}),(0,S.jsx)(`path`,{d:`M250 250 L250 420`,stroke:`#f0f2ec`,strokeWidth:`1.6`,opacity:`0.5`}),(0,S.jsx)(`path`,{d:`M300 250 C 314 292, 320 356, 320 420`,fill:`none`,stroke:`#6f7772`,strokeWidth:`3`,opacity:`0.75`}),(0,S.jsx)(`path`,{className:`cs-spill${e===`vertedouro`?` is-active`:``}`,d:`M300 260 C 318 300, 322 360, 320 418`,stroke:`#cfeaff`,strokeWidth:`8`,fill:`none`,strokeLinecap:`round`}),(0,S.jsx)(`ellipse`,{cx:`326`,cy:`418`,rx:`20`,ry:`6`,fill:`#dff2ff`,opacity:`0.4`}),(0,S.jsx)(`rect`,{x:`233`,y:`328`,width:`30`,height:`30`,rx:`2`,fill:`#4a5b55`,stroke:`#e6ece7`,strokeWidth:`1.6`}),(0,S.jsx)(`path`,{d:`M238 330 L238 356 M245 330 L245 356 M252 330 L252 356 M259 330 L259 356`,stroke:`#c9d6cf`,strokeWidth:`1.4`,opacity:`0.9`}),(0,S.jsx)(`path`,{d:`M234 338 L262 338 M234 348 L262 348`,stroke:`#c9d6cf`,strokeWidth:`1`,opacity:`0.55`}),(0,S.jsxs)(`g`,{filter:`url(#cs-sombra)`,children:[(0,S.jsx)(`path`,{d:`M348 358 L372 363 L366 386 L342 381 Z`,fill:`#8f978f`}),(0,S.jsx)(`path`,{d:`M452 380 L476 385 L470 408 L446 403 Z`,fill:`#8f978f`}),(0,S.jsx)(`path`,{d:`M258 343 L560 405`,stroke:`#2f373b`,strokeWidth:`18`,strokeLinecap:`round`}),(0,S.jsx)(`path`,{d:`M258 343 L560 405`,stroke:`url(#cs-aco)`,strokeWidth:`15`,strokeLinecap:`round`})]}),(0,S.jsx)(`path`,{d:`M262 340 L556 402`,stroke:`#e8f1f5`,strokeWidth:`1.8`,strokeLinecap:`round`,opacity:`0.45`}),(0,S.jsx)(`path`,{className:`cs-flow`,d:`M258 343 L560 405`,stroke:`#57d8bf`,strokeWidth:`5`,strokeLinecap:`round`,fill:`none`}),(0,S.jsxs)(`g`,{filter:`url(#cs-sombra)`,children:[(0,S.jsx)(`path`,{d:`M536 352 L600 330 L664 352 L664 360 L600 339 L536 360 Z`,fill:`#93a29a`}),(0,S.jsx)(`rect`,{x:`540`,y:`358`,width:`120`,height:`72`,fill:`#e9ece6`}),(0,S.jsx)(`rect`,{x:`540`,y:`358`,width:`120`,height:`72`,fill:`none`,stroke:`#7d867f`,strokeWidth:`1.6`})]}),(0,S.jsx)(`rect`,{x:`540`,y:`358`,width:`120`,height:`72`,fill:`url(#cs-concreto)`,opacity:`0.28`}),(0,S.jsx)(`rect`,{x:`540`,y:`404`,width:`120`,height:`4`,fill:`#aab3ab`}),(0,S.jsx)(`rect`,{x:`540`,y:`358`,width:`120`,height:`10`,fill:`#cdd4cc`,opacity:`0.7`}),(0,S.jsx)(`path`,{d:`M548 372 L652 372`,stroke:`#aab3ab`,strokeWidth:`2`}),(0,S.jsx)(`rect`,{x:`576`,y:`366`,width:`20`,height:`8`,rx:`1.5`,fill:`#8d968e`}),(0,S.jsxs)(`g`,{fill:`#c3cbc3`,children:[(0,S.jsx)(`rect`,{x:`546`,y:`378`,width:`9`,height:`22`,rx:`1`}),(0,S.jsx)(`rect`,{x:`645`,y:`378`,width:`9`,height:`22`,rx:`1`})]}),(0,S.jsx)(`path`,{d:`M560 396 Q 585 372, 610 396 Q 610 418, 585 420 Q 560 418, 560 396 Z`,fill:`#9aa6ad`,stroke:`#69747a`,strokeWidth:`1.4`}),(0,S.jsx)(`circle`,{cx:`585`,cy:`398`,r:`17`,fill:`#40525c`,stroke:`#dfe7e2`,strokeWidth:`2`}),(0,S.jsx)(`circle`,{className:`cs-turbine`,cx:`585`,cy:`398`,r:`10`,fill:`#5cc9f2`}),(0,S.jsx)(`path`,{className:`cs-turbine`,d:`M585 388 L585 408 M575 398 L595 398 M578 391 L592 405 M592 391 L578 405`,stroke:`#fff`,strokeWidth:`1.6`}),(0,S.jsx)(`rect`,{x:`581`,y:`368`,width:`8`,height:`16`,fill:`#b6c0b8`}),(0,S.jsx)(`rect`,{x:`568`,y:`356`,width:`34`,height:`14`,rx:`3`,fill:`#8d968e`,stroke:`#dfe7e2`,strokeWidth:`1.2`}),(0,S.jsx)(`circle`,{className:`cs-gerador`,cx:`585`,cy:`363`,r:`6.5`,fill:`#ffd479`,opacity:`0.9`}),(0,S.jsx)(`path`,{d:`M585 420 Q 585 442, 616 440 L648 428`,fill:`none`,stroke:`#7f8a84`,strokeWidth:`11`,strokeLinecap:`round`}),(0,S.jsx)(`rect`,{x:`640`,y:`405`,width:`260`,height:`30`,fill:`url(#cs-agua-fuga)`}),(0,S.jsx)(`rect`,{x:`640`,y:`405`,width:`260`,height:`5`,fill:`#dff2ff`,opacity:`0.35`}),(0,S.jsx)(`path`,{className:`cs-flow`,d:`M664 420 L890 420`,stroke:`#eaf7ff`,strokeWidth:`4`,strokeLinecap:`round`,fill:`none`,opacity:`0.9`}),(0,S.jsx)(`rect`,{x:`676`,y:`352`,width:`28`,height:`20`,rx:`2`,fill:`#8d968e`,stroke:`#5d665f`,strokeWidth:`1.2`}),(0,S.jsx)(`path`,{d:`M681 352 L681 344 M690 352 L690 342 M699 352 L699 344`,stroke:`#5d665f`,strokeWidth:`2`}),(0,S.jsxs)(`g`,{stroke:`#4b565c`,strokeWidth:`2.2`,fill:`none`,strokeLinecap:`round`,children:[(0,S.jsx)(`path`,{d:`M682 344 L690 296 L698 344`}),(0,S.jsx)(`path`,{d:`M674 316 L706 316 M678 300 L702 300`})]}),(0,S.jsxs)(`g`,{stroke:`#4b565c`,strokeWidth:`1.1`,fill:`none`,opacity:`0.9`,children:[(0,S.jsx)(`path`,{d:`M684 332 L696 332 M685 324 L695 324 M683 340 L697 340`}),(0,S.jsx)(`path`,{d:`M684 332 L690 324 L696 332 L690 340 Z`})]}),(0,S.jsx)(`path`,{d:`M690 300 C 760 290, 820 300, 880 285`,stroke:`#39444a`,strokeWidth:`1.5`,fill:`none`}),(0,S.jsx)(`path`,{className:`cs-energia`,d:`M690 300 C 760 290, 820 300, 880 285`,stroke:`#ffcf5f`,strokeWidth:`2.6`,fill:`none`,strokeLinecap:`round`}),(0,S.jsxs)(`g`,{children:[(0,S.jsx)(`line`,{x1:`130`,y1:`250`,x2:`130`,y2:`405`,stroke:`#0f2a22`,strokeWidth:`1.4`,strokeDasharray:`5 4`,opacity:`0.85`}),(0,S.jsx)(`path`,{d:`M124 254 L130 246 L136 254 M124 401 L130 409 L136 401`,stroke:`#0f2a22`,strokeWidth:`1.6`,fill:`none`,opacity:`0.85`}),(0,S.jsx)(`rect`,{x:`138`,y:`270`,width:`86`,height:`22`,rx:`7`,fill:`#0f2a22`,opacity:`0.86`}),(0,S.jsx)(`text`,{x:`146`,y:`285`,fontSize:`14`,fill:`#7ff0c4`,fontWeight:`700`,children:`H (queda)`})]}),(0,S.jsx)(`ellipse`,{className:`cs-focus-ring`,cx:i.cx,cy:i.cy,rx:i.rx,ry:i.ry,"aria-hidden":`true`}),Je.map(n=>(0,S.jsx)(Xe,{item:n,ativo:e===n.id,onSelect:t},n.id))]}),(0,S.jsxs)(`div`,{className:`cs-hots`,children:[a(`reservatorio`,13,49),a(`barragem`,31,59.7),a(`vertedouro`,34,65.1),a(`tomada`,27.5,65.1),a(`conduto`,45,75.8),a(`casa`,61.5,71.8),a(`turbina`,65,79.9),a(`fuga`,84,86.6),a(`subestacao`,77,53)]}),(0,S.jsxs)(`div`,{className:`cross-stage-label`,"aria-live":`polite`,children:[(0,S.jsx)(`small`,{children:`Equipamento em foco`}),(0,S.jsx)(`strong`,{children:r.nome})]})]}),(0,S.jsxs)(`div`,{className:`hydro-motion-legend`,"aria-label":`Camadas representadas na animação`,children:[(0,S.jsxs)(`span`,{children:[(0,S.jsx)(`i`,{className:`hydro-motion-legend__water`}),` Água sob pressão`]}),(0,S.jsxs)(`span`,{children:[(0,S.jsx)(`i`,{className:`hydro-motion-legend__rotation`}),` Rotação mecânica`]}),(0,S.jsxs)(`span`,{children:[(0,S.jsx)(`i`,{className:`hydro-motion-legend__energy`}),` Energia elétrica`]}),(0,S.jsxs)(`span`,{className:e===`vertedouro`?`is-active`:``,children:[(0,S.jsx)(`i`,{className:`hydro-motion-legend__spill`}),` Vertedouro de cheia`]})]}),(0,S.jsx)(`div`,{className:`cs-mobile-equipment`,"aria-label":`Equipamentos do corte`,children:X.map((n,r)=>(0,S.jsxs)(`button`,{type:`button`,className:n.id===e?`active`:``,onClick:()=>t(n.id),"aria-pressed":n.id===e,"aria-controls":`hydro-anatomia-detail`,children:[(0,S.jsx)(`span`,{"aria-hidden":`true`,children:String(r+1).padStart(2,`0`)}),n.nome]},n.id))})]})}function Qe(){let[e,t]=(0,x.useState)(120),[n,r]=(0,x.useState)(60),[i,a]=(0,x.useState)(90),o=9.81*e*n*(i/100),s=o/1e3,c=Q(s),l=$(n);return(0,S.jsxs)(`div`,{className:`power-calc`,children:[(0,S.jsxs)(`div`,{className:`pc-formula`,children:[(0,S.jsx)(v,{}),` `,(0,S.jsx)(`span`,{children:`P = ρ · g · Q · H · η`}),` `,(0,S.jsx)(`small`,{children:`densidade × constante física g × vazão turbinada × queda líquida × rendimento global`})]}),(0,S.jsxs)(`div`,{className:`pc-controls`,children:[(0,S.jsxs)(`label`,{children:[`Vazão turbinada, Q `,(0,S.jsxs)(`b`,{children:[e,` m³/s`]}),(0,S.jsx)(`input`,{type:`range`,min:`1`,max:`1500`,value:e,onChange:e=>t(+e.target.value)})]}),(0,S.jsxs)(`label`,{children:[`Queda líquida, H `,(0,S.jsxs)(`b`,{children:[n,` m`]}),(0,S.jsx)(`input`,{type:`range`,min:`2`,max:`800`,value:n,onChange:e=>r(+e.target.value)})]}),(0,S.jsxs)(`label`,{children:[`Rendimento, η `,(0,S.jsxs)(`b`,{children:[i,`%`]}),(0,S.jsx)(`input`,{type:`range`,min:`70`,max:`95`,value:i,onChange:e=>a(+e.target.value)})]})]}),(0,S.jsxs)(`div`,{className:`pc-out`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`span`,{children:`Potência estimada`}),(0,S.jsx)(`strong`,{children:s>=1?s.toFixed(1)+` MW`:Math.round(o)+` kW`})]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`span`,{children:`Faixas de turbina compatíveis somente pela queda`}),(0,S.jsx)(`strong`,{children:l.length?l.join(` ou `):`Fora das faixas ilustradas`})]}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`span`,{children:`Faixa didática por potência (POP)`}),(0,S.jsx)(`strong`,{children:c?.sigla}),(0,S.jsxs)(`small`,{children:[` · `,c?.faixa]})]})]}),(0,S.jsx)(`p`,{className:`pc-note`,children:`Estimativa didática, não enquadramento automático. A faixa MCH, MGH, CGH, PCH ou UHE reproduz apenas o recorte de potência do Quadro 8 do POP; não determina nem altera cadastro, registro ou ato setorial da ANEEL, modalidade ambiental ou suficiência documental. Nesta expressão, H é a queda líquida, depois das perdas hidráulicas, e η representa o rendimento global do conjunto, inclusive turbina e gerador. A potência real depende do arranjo e das curvas de operação.`}),(0,S.jsx)(`p`,{className:`pc-note`,children:`A lista de turbinas cruza somente a queda H com as faixas ilustradas acima. A vazão Q participa do cálculo de potência, mas não é usada para escolher a máquina. A seleção de projeto exige, entre outros dados, faixa operativa de vazões, rotação, cavitação e curvas do fabricante.`})]})}var $e=Object.freeze([{nome:`Bulbo`,min:2,max:15,sample:10},{nome:`Kaplan`,min:10,max:70,sample:40},{nome:`Francis`,min:30,max:400,sample:120},{nome:`Pelton`,min:250,max:800,sample:400}]);function et({selectedType:e,onSelectType:n}){let[r,i]=(0,x.useState)(60),a=$(r),o=$e.find(t=>t.nome.toLowerCase()===e)?.nome||`Francis`,s=e=>{let t=Number(e),r=$(t);i(t),!r.includes(o)&&r[0]&&n(r[0].toLowerCase())};return(0,S.jsxs)(`div`,{className:`turb-picker`,children:[(0,S.jsxs)(`label`,{className:`tp-slider`,children:[`Arraste a queda de projeto, H `,(0,S.jsxs)(`b`,{children:[r,` m`]}),(0,S.jsx)(`input`,{type:`range`,min:`2`,max:`800`,value:r,onChange:e=>s(e.target.value)})]}),(0,S.jsx)(`div`,{className:`tp-scale`,"aria-label":`Faixas ilustradas e turbina mostrada`,children:$e.map(e=>(0,S.jsxs)(`button`,{type:`button`,className:`tp-band`+(a.includes(e.nome)?` rec`:``)+(o===e.nome?` selected`:``),"aria-pressed":o===e.nome,onClick:()=>{i(e.sample),n(e.nome.toLowerCase())},children:[(0,S.jsx)(`span`,{className:`tp-name`,children:e.nome}),(0,S.jsxs)(`span`,{className:`tp-range`,children:[e.min,` a `,e.max,` m`]})]},e.nome))}),(0,S.jsxs)(`div`,{className:`tp-rec`,children:[(0,S.jsx)(t,{}),` Para `,r,` m, as faixas compatíveis por queda são`,` `,(0,S.jsx)(`strong`,{children:a.length?a.join(` e `):`nenhuma das faixas ilustradas`}),`. Esta triagem não usa vazão nem substitui o dimensionamento da máquina.`]}),(0,S.jsxs)(`p`,{className:`tp-selection`,role:`status`,children:[`Ilustração ampliada: `,(0,S.jsx)(`strong`,{children:o}),`.`]})]})}function tt({go:e}){let[n,r]=(0,x.useState)(`turbina`),[a,d]=(0,x.useState)(`francis`),f=(0,x.useMemo)(()=>X.find(e=>e.id===n)||X[0],[n]);return(0,S.jsxs)(`div`,{className:`page hydro-page`,children:[(0,S.jsxs)(`header`,{className:`page-header hydro-hero-head`,children:[(0,S.jsx)(`span`,{children:(0,S.jsx)(v,{})}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`small`,{className:`ph-kicker`,children:`Fundamentos de engenharia`}),(0,S.jsx)(`h1`,{children:`Como funciona uma hidrelétrica`}),(0,S.jsx)(`p`,{children:`Da água represada à energia na rede: princípios, tipos de usina, barramentos, turbinas e cada componente do arranjo.`})]})]}),(0,S.jsx)(He,{}),(0,S.jsxs)(`section`,{className:`hydro-hero hydro-hero--cutaway hydro-section hydro-section--intro`,id:`hydro-principio`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,S.jsx)(Pe,{}),(0,S.jsxs)(`div`,{className:`hydro-hero-copy`,children:[(0,S.jsx)(`h2`,{children:`O princípio: converter altura em energia`}),(0,S.jsxs)(`p`,{children:[`Uma hidrelétrica transforma a `,(0,S.jsx)(`strong`,{children:`energia potencial`}),` da água represada em `,(0,S.jsx)(`strong`,{children:`energia cinética`}),` ao descer pelo conduto, depois em `,(0,S.jsx)(`strong`,{children:`energia mecânica`}),` ao girar a turbina e, por fim, em `,(0,S.jsx)(`strong`,{children:`energia elétrica`}),` no gerador.`]}),(0,S.jsx)(`div`,{className:`energy-chain`,children:[`Potencial`,`Cinética`,`Mecânica`,`Elétrica`].map((e,t)=>(0,S.jsxs)(x.Fragment,{children:[(0,S.jsx)(`span`,{children:e}),t<3&&(0,S.jsx)(i,{})]},e))}),(0,S.jsxs)(`p`,{className:`hydro-two`,children:[`A potência hidráulica estimada segue `,(0,S.jsx)(`strong`,{children:`P = ρ · g · Q · H · η`}),`: vazão turbinada (Q), queda líquida disponível após as perdas (H), densidade da água (ρ), constante física g, correspondente à aceleração local, e rendimento global do conjunto (η). O valor de projeto depende das condições e curvas de operação.`]})]})]}),(0,S.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-anatomia`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,S.jsxs)(`div`,{className:`section-title`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h2`,{children:`Anatomia do arranjo`}),(0,S.jsx)(`p`,{children:`Clique em cada ponto do corte para entender a função.`})]}),(0,S.jsx)(c,{})]}),(0,S.jsxs)(`div`,{className:`cross-layout`,children:[(0,S.jsx)(Ze,{selected:n,onSelect:r}),(0,S.jsxs)(`aside`,{id:`hydro-anatomia-detail`,className:`cross-detail`,"aria-live":`polite`,children:[(0,S.jsxs)(`div`,{className:`cd-head`,children:[(0,S.jsx)(f.icon,{}),(0,S.jsx)(`h3`,{children:f.nome})]}),(0,S.jsx)(`p`,{className:`cd-resumo`,children:f.resumo}),(0,S.jsx)(`p`,{children:f.detalhe}),(0,S.jsx)(`div`,{className:`cd-nav`,"aria-label":`Selecionar componente`,children:X.map(e=>(0,S.jsx)(`button`,{type:`button`,className:e.id===n?`active`:``,"aria-pressed":e.id===n,onClick:()=>r(e.id),children:e.nome},e.id))})]},n)]})]}),(0,S.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-potencia`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,S.jsxs)(`div`,{className:`section-title`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h2`,{children:`A conta da potência`}),(0,S.jsx)(`p`,{children:`Ajuste vazão, queda e rendimento e compare a estimativa com as faixas didáticas do POP.`})]}),(0,S.jsx)(h,{})]}),(0,S.jsx)(Qe,{})]}),(0,S.jsx)(`div`,{className:`hydro-section hydro-long-section`,id:`hydro-competencias`,tabIndex:`-1`,"data-hydro-section":!0,children:(0,S.jsx)(b,{})}),(0,S.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-tipologias`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,S.jsxs)(`div`,{className:`section-title`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h2`,{children:`Faixas didáticas do eixo ambiental IAT`}),(0,S.jsx)(`p`,{children:`Quadro 8 do POP e IN IAT nº 09/2025: ponto de partida ambiental, sem substituir os eixos ANEEL e de recursos hídricos acima.`})]}),(0,S.jsx)(m,{})]}),(0,S.jsx)(`div`,{className:`pot-grid`,children:Ue.map(e=>(0,S.jsxs)(`article`,{className:`pot-card`,style:{"--pc":e.cor},children:[(0,S.jsx)(`div`,{className:`pot-sigla`,children:e.sigla}),(0,S.jsx)(`strong`,{children:e.nome}),(0,S.jsx)(`span`,{className:`pot-faixa`,children:e.faixa}),(0,S.jsx)(`p`,{children:e.nota})]},e.sigla))})]}),(0,S.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-operacao`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,S.jsxs)(`div`,{className:`section-title`,children:[(0,S.jsx)(`div`,{children:(0,S.jsx)(`h2`,{children:`Tipos por reservatório e operação`})}),(0,S.jsx)(l,{})]}),(0,S.jsx)(`div`,{className:`res-grid`,children:We.map(e=>(0,S.jsxs)(`article`,{className:`res-card`,children:[(0,S.jsx)(e.icon,{}),(0,S.jsx)(`strong`,{children:e.nome}),(0,S.jsx)(`p`,{children:e.desc})]},e.nome))})]}),(0,S.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-barramentos`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,S.jsxs)(`div`,{className:`section-title`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h2`,{children:`Tipos de barramento`}),(0,S.jsx)(`p`,{children:`A escolha depende do vale, da fundação e do material disponível.`})]}),(0,S.jsx)(o,{})]}),(0,S.jsx)(qe,{})]}),(0,S.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-turbinas`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,S.jsxs)(`div`,{className:`section-title`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h2`,{children:`Turbinas: faixas de aplicação`}),(0,S.jsx)(`p`,{children:`O projeto cruza queda e vazão; o seletor abaixo destaca somente as faixas de queda e explicita essa limitação.`})]}),(0,S.jsx)(u,{})]}),(0,S.jsx)(et,{selectedType:a,onSelectType:d}),(0,S.jsx)(me,{selectedType:a,onSelectType:d})]}),(0,S.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-casos`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,S.jsxs)(`div`,{className:`section-title`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h2`,{children:`Casos reais no Paraná`}),(0,S.jsx)(`p`,{children:`Um empreendimento verificado por tipo, com critérios e o site oficial de cada um.`})]}),(0,S.jsx)(s,{})]}),(0,S.jsx)(ye,{})]}),(0,S.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-arranjos`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,S.jsxs)(`div`,{className:`section-title`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h2`,{children:`Esquemas de arranjo`}),(0,S.jsx)(`p`,{children:`Três diagramas detalhados: como o arranjo físico muda o circuito, a operação e o impacto.`})]}),(0,S.jsx)(t,{})]}),(0,S.jsx)(De,{})]}),(0,S.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-licenciamento`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,S.jsxs)(`div`,{className:`section-title`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`h2`,{children:`Como solicitar a autorização para construir`}),(0,S.jsx)(`p`,{children:`Da ideia à operação: o caminho na ANEEL e no IAT, e o papel de cada ator.`})]}),(0,S.jsx)(h,{})]}),(0,S.jsx)(Ce,{go:e})]}),(0,S.jsxs)(`section`,{className:`hydro-cta`,children:[(0,S.jsxs)(`div`,{children:[(0,S.jsx)(p,{}),(0,S.jsxs)(`div`,{children:[(0,S.jsx)(`strong`,{children:`Do princípio à decisão`}),(0,S.jsx)(`p`,{children:`Entendido o empreendimento físico, veja como o POP conduz a análise de licenciamento etapa por etapa.`})]})]}),(0,S.jsxs)(`button`,{className:`primary`,onClick:()=>e(`formacao`),children:[`Ir para a formação `,(0,S.jsx)(i,{})]})]})]})}export{q as HYDRO_SECTIONS,He as HydroLocalNav,Qe as PowerCalc,ze as calculateHydroReadingState,tt as default,Q as faixaDidaticaPorPotencia,$ as turbinasCompativeisPorQueda};