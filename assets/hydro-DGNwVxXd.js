import{n as e}from"./rolldown-runtime-CbXtAM7H.js";import{A as t,Gt as n,H as r,Kt as i,N as a,Ot as o,Pt as s,Q as c,Wt as l,a as u,at as d,gt as f,ht as p,k as m,pt as h,r as g,s as _}from"./vendor-icons-DOmMlzhV.js";import{t as v}from"./vendor-react-D5GZs-v_.js";/* empty css                    */import{t as ee}from"./NormativeAuthorityAxes-BmiXEYUk.js";var y=e(i(),1),b=v(),x=Object.freeze({"--hcm-d055":.55,"--hcm-d07":.7,"--hcm-d1":1,"--hcm-d11":1.1,"--hcm-d115":1.15,"--hcm-d125":1.25,"--hcm-d13":1.3,"--hcm-d15":1.5,"--hcm-d16":1.6,"--hcm-d22":2.2,"--hcm-d24":2.4,"--hcm-d7":7,"--hcm-d9":9}),S=Object.freeze({.55:`--hcm-d055`,.7:`--hcm-d07`,1:`--hcm-d1`,1.1:`--hcm-d11`,1.15:`--hcm-d115`,1.25:`--hcm-d125`,1.3:`--hcm-d13`,1.5:`--hcm-d15`,1.6:`--hcm-d16`,2.2:`--hcm-d22`,2.4:`--hcm-d24`,7:`--hcm-d7`,9:`--hcm-d9`});function C(){let[e,t]=(0,y.useState)(()=>typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches);return(0,y.useEffect)(()=>{if(typeof window>`u`||typeof window.matchMedia!=`function`)return;let e=window.matchMedia(`(prefers-reduced-motion: reduce)`),n=()=>t(e.matches);return n(),typeof e.addEventListener==`function`?(e.addEventListener(`change`,n),()=>e.removeEventListener(`change`,n)):(e.addListener?.(n),()=>e.removeListener?.(n))},[]),e}function w(e){let[t,n]=(0,y.useState)(!0);return(0,y.useEffect)(()=>{if(typeof IntersectionObserver!=`function`||!e.current)return;let t=new IntersectionObserver(([e])=>n(e.isIntersecting),{rootMargin:`120px 0px`,threshold:.04});return t.observe(e.current),()=>t.disconnect()},[e]),t}function T(e){let t=100/e;return Object.fromEntries(Object.entries(x).map(([e,n])=>[e,`${Math.max(.18,n*t).toFixed(3)}s`]))}function E(e=100){let t=(0,y.useRef)(null),n=C(),r=w(t),[i,a]=(0,y.useState)(!0),[o,s]=(0,y.useState)(e);return(0,y.useEffect)(()=>{n&&a(!1)},[n]),{sceneRef:t,playing:i,setPlaying:a,speed:o,setSpeed:s,reducedMotion:n,motionActive:i&&r&&!n,surfaceStyle:T(o)}}function D({motion:e,context:n}){let r=`hcm-speed-${(0,y.useId)().replace(/:/g,``)}`,i=e.reducedMotion?`Movimento reduzido ativo`:e.motionActive?`${n} em movimento`:`${n} pausada`;return(0,b.jsxs)(`div`,{className:`hcm-toolbar`,children:[(0,b.jsxs)(`span`,{className:`hcm-motion-status`,role:`status`,"aria-live":`polite`,children:[(0,b.jsx)(`i`,{"aria-hidden":`true`}),i]}),(0,b.jsxs)(`div`,{className:`hcm-motion-controls`,children:[(0,b.jsxs)(`label`,{htmlFor:r,className:`hcm-speed-control`,children:[(0,b.jsxs)(`span`,{children:[`Velocidade visual `,(0,b.jsxs)(`strong`,{children:[e.speed,`%`]})]}),(0,b.jsx)(`input`,{id:r,type:`range`,min:`50`,max:`150`,step:`10`,value:e.speed,disabled:e.reducedMotion,"aria-valuetext":`${e.speed}% da velocidade visual`,onChange:t=>e.setSpeed(Number(t.target.value))})]}),(0,b.jsxs)(`button`,{type:`button`,className:`hcm-play`,disabled:e.reducedMotion,"aria-pressed":e.motionActive,"aria-label":e.motionActive?`Pausar ${n.toLowerCase()}`:`Reproduzir ${n.toLowerCase()}`,onClick:()=>e.setPlaying(e=>!e),children:[e.motionActive?(0,b.jsx)(t,{"aria-hidden":`true`}):(0,b.jsx)(m,{"aria-hidden":`true`}),e.motionActive?`Pausar`:`Reproduzir`]})]})]})}function O({dash:e,duration:t,className:n=``,style:r,...i}){let a=e.reduce((e,t)=>e+t,0),o=S[t]||S[1];return(0,b.jsx)(`path`,{...i,className:`${n} hcm-flow`.trim(),strokeDasharray:e.join(` `),style:{...r,"--hcm-dash-period":`${a}px`,"--hcm-flow-duration":`var(${o})`}})}function k(e){if(![`ArrowLeft`,`ArrowRight`,`Home`,`End`].includes(e.key))return;let t=[...e.currentTarget.querySelectorAll(`[role="tab"]`)],n=t.indexOf(document.activeElement);if(n<0)return;e.preventDefault();let r=n;e.key===`Home`&&(r=0),e.key===`End`&&(r=t.length-1),e.key===`ArrowLeft`&&(r=(n-1+t.length)%t.length),e.key===`ArrowRight`&&(r=(n+1)%t.length),t[r]?.focus(),t[r]?.click()}var A=`/academia-iat/`.replace(/\/$/,``),j={"Peltonturbine-1.jpg":A+`/hidro/turbina-pelton.jpg`,"Francis_Turbine_complete.jpg":A+`/hidro/turbina-francis.jpg`,"Kaplan_turbine_bonneville.jpg":A+`/hidro/turbina-kaplan.jpg`},M=e=>j[e],N={"Peltonturbine-1.jpg":[587,800],"Francis_Turbine_complete.jpg":[456,461],"Kaplan_turbine_bonneville.jpg":[294,375]},P=e=>`https://commons.wikimedia.org/wiki/File:${e}`;function F({p:e}){return(0,b.jsxs)(`defs`,{children:[(0,b.jsxs)(`linearGradient`,{id:e+`-aco`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#eef3f5`}),(0,b.jsx)(`stop`,{offset:`0.42`,stopColor:`#adb9c0`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#586269`})]}),(0,b.jsxs)(`linearGradient`,{id:e+`-bronze`,x1:`0.1`,y1:`0`,x2:`0.9`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#9df0d2`}),(0,b.jsx)(`stop`,{offset:`0.45`,stopColor:`#43c294`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#186b50`})]}),(0,b.jsxs)(`linearGradient`,{id:e+`-agua`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#a6e0fb`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#2477ad`})]}),(0,b.jsxs)(`linearGradient`,{id:e+`-concreto`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#8d968f`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#5c645e`})]}),(0,b.jsxs)(`radialGradient`,{id:e+`-cubo`,cx:`0.34`,cy:`0.28`,r:`0.85`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#dde5e9`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#414f57`})]}),(0,b.jsx)(`filter`,{id:e+`-sombra`,x:`-30%`,y:`-30%`,width:`170%`,height:`170%`,children:(0,b.jsx)(`feDropShadow`,{dx:`2`,dy:`3`,stdDeviation:`2.2`,floodColor:`#06100d`,floodOpacity:`0.5`})})]})}function I(){let e=Array.from({length:12},(e,t)=>t*30);return(0,b.jsxs)(`svg`,{viewBox:`0 0 300 220`,className:`turb-svg`,role:`img`,"aria-label":`Esquema de turbina Pelton`,children:[(0,b.jsx)(F,{p:`pel`}),(0,b.jsx)(`path`,{d:`M96 198 L292 198 L292 214 L96 214 Z`,fill:`url(#pel-agua)`,opacity:`0.55`}),(0,b.jsx)(`path`,{d:`M96 198 L292 198`,stroke:`#cfeaff`,strokeWidth:`2`,opacity:`0.5`}),(0,b.jsxs)(`g`,{className:`hcm-pelton-rotor`,"data-rotor":`pelton`,children:[(0,b.jsx)(`g`,{filter:`url(#pel-sombra)`,children:(0,b.jsx)(`circle`,{cx:`178`,cy:`112`,r:`41`,fill:`url(#pel-aco)`,stroke:`#48545b`,strokeWidth:`1.6`})}),(0,b.jsx)(`g`,{stroke:`#7f8c93`,strokeWidth:`3`,opacity:`0.75`,children:(0,b.jsx)(`path`,{d:`M178 73 L178 151 M139 112 L217 112 M150 84 L206 140 M206 84 L150 140`})}),(0,b.jsx)(`circle`,{cx:`178`,cy:`112`,r:`27`,fill:`none`,stroke:`#93a0a7`,strokeWidth:`1`,opacity:`0.6`}),e.map(e=>(0,b.jsxs)(`g`,{transform:`rotate(${e} 178 112)`,children:[(0,b.jsx)(`path`,{d:`M178 38 c -12 0 -19 6 -19 13 c 0 8 8 15 19 15 c 11 0 19 -7 19 -15 c 0 -7 -7 -13 -19 -13 Z`,fill:`url(#pel-bronze)`,stroke:`#14584180`,strokeWidth:`1.2`}),(0,b.jsx)(`path`,{d:`M178 39 L178 65`,stroke:`#0d4634`,strokeWidth:`1.4`,opacity:`0.85`}),(0,b.jsx)(`path`,{d:`M170 44 c -5 2 -7 7 -6 12`,stroke:`#e7fff5`,strokeWidth:`1.6`,fill:`none`,opacity:`0.65`})]},e)),(0,b.jsx)(`circle`,{cx:`178`,cy:`112`,r:`15`,fill:`url(#pel-cubo)`,stroke:`#3c484f`,strokeWidth:`1.4`}),(0,b.jsx)(`circle`,{cx:`178`,cy:`112`,r:`4`,fill:`#2b353b`})]}),(0,b.jsx)(`g`,{filter:`url(#pel-sombra)`,children:(0,b.jsx)(`path`,{d:`M4 92 L40 92 L60 102 L72 107 L72 119 L60 124 L40 134 L4 134 Z`,fill:`url(#pel-aco)`,stroke:`#48545b`,strokeWidth:`1.4`})}),(0,b.jsx)(`path`,{d:`M36 102 L60 110 L60 116 L36 124 Z`,fill:`#5a666d`}),(0,b.jsx)(`rect`,{x:`2`,y:`90`,width:`7`,height:`46`,rx:`2`,fill:`#8f9ba1`,stroke:`#48545b`,strokeWidth:`1.2`}),(0,b.jsx)(`path`,{d:`M10 98 L34 98`,stroke:`#eaf2f5`,strokeWidth:`1.6`,opacity:`0.5`}),(0,b.jsx)(`path`,{d:`M74 113 L106 113`,stroke:`#5fc3ea`,strokeWidth:`9`,strokeLinecap:`round`,opacity:`0.35`}),(0,b.jsx)(O,{d:`M74 113 L106 113`,stroke:`#8fdcff`,strokeWidth:`9`,strokeLinecap:`round`,className:`jet-anim`,dash:[8,10],duration:1}),(0,b.jsx)(O,{className:`pelton-deflete`,dash:[4,10],duration:.55,d:`M112 106 q-16 -12 -32 -16`,stroke:`#bfe6ff`,strokeWidth:`3`,fill:`none`,strokeLinecap:`round`}),(0,b.jsx)(O,{className:`pelton-deflete`,dash:[4,10],duration:.55,d:`M112 120 q-16 12 -32 16`,stroke:`#bfe6ff`,strokeWidth:`3`,fill:`none`,strokeLinecap:`round`}),(0,b.jsx)(`text`,{x:`8`,y:`84`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`bocal / injetor`}),(0,b.jsx)(`text`,{x:`294`,y:`26`,textAnchor:`end`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`conchas (dupla colher)`})]})}function te(){let e=[[`M223 131 A78 78 0 0 1 123 177`,24],[`M123 177 A78 78 0 0 1 77 77`,19],[`M77 77 A78 78 0 0 1 177 31`,15],[`M177 31 A78 78 0 0 1 227 90`,11]];return(0,b.jsxs)(`svg`,{viewBox:`0 0 300 220`,className:`turb-svg`,role:`img`,"aria-label":`Esquema de turbina Francis`,children:[(0,b.jsx)(F,{p:`fra`}),(0,b.jsx)(`path`,{d:`M222 117 L298 104 L298 150 L228 146 Z`,fill:`url(#fra-aco)`,stroke:`#4a565d`,strokeWidth:`1.4`}),e.map(([e,t],n)=>(0,b.jsx)(`path`,{d:e,fill:`none`,stroke:`#7d8990`,strokeWidth:t+3,strokeLinecap:`round`},n)),e.map(([e,t],n)=>(0,b.jsx)(`path`,{d:e,fill:`none`,stroke:`url(#fra-agua)`,strokeWidth:t,strokeLinecap:`round`},`i`+n)),(0,b.jsx)(O,{className:`fr-radial`,dash:[12,20],duration:1.6,d:`M223 131 A78 78 0 0 1 123 177 A78 78 0 0 1 77 77 A78 78 0 0 1 177 31`,fill:`none`,stroke:`#e2f4ff`,strokeWidth:`4`,strokeLinecap:`round`}),Array.from({length:14},(e,t)=>t*25.7).map(e=>(0,b.jsx)(`g`,{transform:`rotate(${e} 150 104)`,children:(0,b.jsx)(`path`,{d:`M150 66 q6 4 5 11 q-1 6 -6 9 q4 -10 1 -20 Z`,fill:`#9fb0b8`,stroke:`#5d686f`,strokeWidth:`0.9`})},e)),(0,b.jsx)(`circle`,{cx:`150`,cy:`104`,r:`34`,fill:`#26343a`,opacity:`0.35`}),(0,b.jsx)(`rect`,{x:`145`,y:`14`,width:`11`,height:`80`,rx:`2`,fill:`url(#fra-aco)`,stroke:`#4a565d`,strokeWidth:`1.1`}),(0,b.jsx)(`g`,{className:`spin-slow`,children:Array.from({length:9},(e,t)=>t*40).map(e=>(0,b.jsx)(`g`,{transform:`rotate(${e} 150 104)`,children:(0,b.jsx)(`path`,{d:`M150 76 q13 8 14 20 q1 10 -8 16 q6 -14 -2 -24 q-4 -6 -10 -8 Z`,fill:`url(#fra-bronze)`,stroke:`#12684c`,strokeWidth:`0.9`})},e))}),(0,b.jsx)(`circle`,{cx:`150`,cy:`104`,r:`12`,fill:`url(#fra-cubo)`,stroke:`#3c484f`,strokeWidth:`1.2`}),(0,b.jsx)(`path`,{d:`M132 136 L168 136 L186 198 L114 198 Z`,fill:`url(#fra-agua)`,opacity:`0.85`}),(0,b.jsx)(`path`,{d:`M132 136 L114 198 M168 136 L186 198`,stroke:`#7d8990`,strokeWidth:`2.4`}),(0,b.jsx)(O,{className:`fr-axial`,dash:[8,14],duration:2.4,d:`M150 140 L150 194`,stroke:`#eaf7ff`,strokeWidth:`3`,strokeLinecap:`round`,fill:`none`}),(0,b.jsx)(`text`,{x:`206`,y:`90`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`caixa espiral`}),(0,b.jsx)(`path`,{d:`M62 40 L118 74`,stroke:`#8fa79a`,strokeWidth:`1.2`,opacity:`0.8`}),(0,b.jsx)(`text`,{x:`6`,y:`34`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`distribuidor`}),(0,b.jsx)(`text`,{x:`150`,y:`216`,textAnchor:`middle`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`tubo de sucção`})]})}function L(){let e=`M0 78 L118 78 Q 148 78 148 114 L148 150 Q 148 184 188 192 L300 198`;return(0,b.jsxs)(`svg`,{viewBox:`0 0 300 220`,className:`turb-svg`,role:`img`,"aria-label":`Esquema de turbina Kaplan`,children:[(0,b.jsx)(F,{p:`kap`}),(0,b.jsx)(`rect`,{x:`0`,y:`0`,width:`300`,height:`220`,fill:`url(#kap-concreto)`,opacity:`0.5`}),(0,b.jsx)(`path`,{d:e,fill:`none`,stroke:`#4e5751`,strokeWidth:`72`,strokeLinejoin:`round`}),(0,b.jsx)(`path`,{d:e,fill:`none`,stroke:`url(#kap-agua)`,strokeWidth:`58`,strokeLinejoin:`round`,opacity:`0.92`}),(0,b.jsx)(O,{className:`kp-fluxo`,dash:[9,13],duration:1.3,d:e,fill:`none`,stroke:`#eaf7ff`,strokeWidth:`3`,strokeLinecap:`round`,opacity:`0.9`}),(0,b.jsx)(`rect`,{x:`112`,y:`104`,width:`9`,height:`22`,rx:`2`,fill:`#9fb0b8`,stroke:`#5d686f`,strokeWidth:`0.9`}),(0,b.jsx)(`rect`,{x:`176`,y:`104`,width:`9`,height:`22`,rx:`2`,fill:`#9fb0b8`,stroke:`#5d686f`,strokeWidth:`0.9`}),(0,b.jsx)(`path`,{className:`kp-passo kp-passo--left`,d:`M144 140 q-16 -6 -34 -2 q3 11 15 15 q13 3 21 -4 Z`,fill:`url(#kap-bronze)`,stroke:`#12684c`,strokeWidth:`1.1`}),(0,b.jsx)(`path`,{className:`kp-passo kp-passo--right`,d:`M152 140 q16 -6 34 -2 q-3 11 -15 15 q-13 3 -21 -4 Z`,fill:`url(#kap-bronze)`,stroke:`#12684c`,strokeWidth:`1.1`}),(0,b.jsx)(`ellipse`,{cx:`148`,cy:`138`,rx:`13`,ry:`17`,fill:`url(#kap-cubo)`,stroke:`#3c484f`,strokeWidth:`1.4`}),(0,b.jsx)(O,{className:`hcm-kaplan-rotation`,dash:[5,7],duration:1.1,d:`M128 126 Q148 115 168 126`,fill:`none`,stroke:`#5ff2cd`,strokeWidth:`2`,strokeLinecap:`round`,opacity:`0.9`}),(0,b.jsx)(O,{className:`hcm-kaplan-rotation hcm-flow--reverse`,dash:[5,7],duration:1.1,d:`M128 155 Q148 166 168 155`,fill:`none`,stroke:`#5ff2cd`,strokeWidth:`2`,strokeLinecap:`round`,opacity:`0.9`}),(0,b.jsx)(`rect`,{x:`141`,y:`28`,width:`15`,height:`96`,rx:`2`,fill:`url(#kap-aco)`,stroke:`#4a565d`,strokeWidth:`1.1`}),(0,b.jsx)(`rect`,{x:`120`,y:`12`,width:`58`,height:`20`,rx:`4`,fill:`#c3ccc6`,stroke:`#4a565d`,strokeWidth:`1.2`}),(0,b.jsx)(`text`,{x:`149`,y:`26`,textAnchor:`middle`,fontSize:`10`,fill:`#2c3a33`,fontWeight:`700`,children:`gerador`}),(0,b.jsx)(`text`,{x:`6`,y:`26`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`fluxo axial`}),(0,b.jsx)(`path`,{d:`M232 106 L190 132`,stroke:`#8fa79a`,strokeWidth:`1.2`,opacity:`0.85`}),(0,b.jsx)(`text`,{x:`296`,y:`102`,textAnchor:`end`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`pás AJUSTÁVEIS`}),(0,b.jsx)(`text`,{x:`296`,y:`216`,textAnchor:`end`,fontSize:`10`,fill:`#a9bdb3`,children:`tubo de sucção`})]})}function ne(){return(0,b.jsxs)(`svg`,{viewBox:`0 0 300 220`,className:`turb-svg`,role:`img`,"aria-label":`Esquema de turbina bulbo`,children:[(0,b.jsx)(F,{p:`bul`}),(0,b.jsx)(`path`,{d:`M0 30 L300 30 L300 58 L0 58 Z`,fill:`url(#bul-concreto)`}),(0,b.jsx)(`path`,{d:`M0 178 L300 178 L300 210 L0 210 Z`,fill:`url(#bul-concreto)`}),(0,b.jsx)(`path`,{d:`M0 58 L300 58 L300 178 L0 178 Z`,fill:`url(#bul-agua)`,opacity:`0.75`}),(0,b.jsx)(O,{className:`bl-fluxo`,dash:[11,15],duration:1.25,d:`M4 92 Q 60 92 92 78 T 200 88 T 298 96`,fill:`none`,stroke:`#eaf7ff`,strokeWidth:`3.2`,strokeLinecap:`round`,opacity:`0.9`}),(0,b.jsx)(O,{className:`bl-fluxo`,dash:[11,15],duration:1.25,d:`M4 148 Q 60 148 92 158 T 200 148 T 298 140`,fill:`none`,stroke:`#eaf7ff`,strokeWidth:`3.2`,strokeLinecap:`round`,opacity:`0.9`}),(0,b.jsx)(`path`,{d:`M112 82 L106 30 L132 30 L128 82 Z`,fill:`url(#bul-aco)`,stroke:`#4a565d`,strokeWidth:`1.2`,opacity:`0.95`}),(0,b.jsx)(`g`,{filter:`url(#bul-sombra)`,children:(0,b.jsx)(`path`,{d:`M36 118 C 36 92 64 80 100 80 L148 80 C 172 80 188 96 196 112 L202 116 L202 120 L196 124 C 188 140 172 156 148 156 L100 156 C 64 156 36 144 36 118 Z`,fill:`url(#bul-aco)`,stroke:`#48545b`,strokeWidth:`1.6`})}),(0,b.jsx)(`path`,{d:`M52 104 C 62 92 82 88 104 88`,stroke:`#f2f8fa`,strokeWidth:`2.4`,fill:`none`,opacity:`0.55`}),(0,b.jsx)(`rect`,{x:`70`,y:`100`,width:`86`,height:`36`,rx:`6`,fill:`#22303a`,opacity:`0.92`}),(0,b.jsx)(`g`,{stroke:`#5fd7ae`,strokeWidth:`2`,opacity:`0.85`,fill:`none`,children:(0,b.jsx)(`path`,{d:`M82 108 L82 128 M92 106 L92 130 M102 108 L102 128`})}),(0,b.jsx)(`circle`,{className:`hcm-bulbo-generator`,cx:`120`,cy:`118`,r:`11`,fill:`url(#bul-cubo)`,stroke:`#5fd7ae`,strokeWidth:`1.2`}),(0,b.jsx)(`text`,{x:`137`,y:`122`,fontSize:`10`,fill:`#8fe3cf`,fontWeight:`700`,children:`gerador`}),(0,b.jsxs)(`g`,{className:`hcm-bulbo-rotor`,"data-rotor":`bulbo`,children:[(0,b.jsx)(`path`,{d:`M212 108 q4 -30 12 -40 q10 8 6 24 q-4 12 -12 18 Z`,fill:`url(#bul-bronze)`,stroke:`#12684c`,strokeWidth:`1.1`}),(0,b.jsx)(`path`,{d:`M212 128 q4 30 12 40 q10 -8 6 -24 q-4 -12 -12 -18 Z`,fill:`url(#bul-bronze)`,stroke:`#12684c`,strokeWidth:`1.1`}),(0,b.jsx)(`ellipse`,{cx:`211`,cy:`118`,rx:`10`,ry:`15`,fill:`url(#bul-cubo)`,stroke:`#3c484f`,strokeWidth:`1.3`})]}),(0,b.jsx)(`path`,{d:`M198 110 L204 110 M198 126 L204 126`,stroke:`#5d686f`,strokeWidth:`2`}),(0,b.jsx)(`text`,{x:`294`,y:`196`,textAnchor:`end`,fontSize:`11`,fill:`#dbe7e0`,fontWeight:`700`,children:`conjunto horizontal submerso`})]})}var R=[{id:`pelton`,nome:`Pelton`,camada:oe,Svg:I,vazao:`Vazão baixa`,legenda:`Jato em pressão atmosférica: turbina de AÇÃO.`,foto:`Peltonturbine-1.jpg`,tipo:`Ação (impulso)`,faixa:`Quedas altas: acima de ~250 m`,usoPR:`UHE Gov. Parigot de Souza (Antonina): 4 unidades Pelton, com desnível de 754 m.`,partes:[[`Bocal e injetor`,`Concentram e regulam o jato de água.`],[`Conchas de dupla colher`,`Recebem o jato e desviam a água para os lados.`],[`Rotor, cubo e eixo`,`Giram como um único conjunto e transmitem torque ao gerador.`],[`Poço de descarga`,`Recebe a água já em pressão atmosférica.`]]},{id:`francis`,nome:`Francis`,camada:ce,Svg:te,vazao:`Vazão média`,legenda:`Fluxo radial que vira axial, sob pressão: turbina de REAÇÃO.`,foto:`Francis_Turbine_complete.jpg`,tipo:`Reação`,faixa:`Quedas médias: ~30 a 400 m`,usoPR:`UHE Foz do Areia (Pinhão): 4 Francis de 419 MW. Também Itaipu (20 unidades).`,partes:[[`Caixa espiral`,`Distribui a água ao redor de todo o rotor.`],[`Distribuidor`,`Palhetas móveis orientam e regulam o fluxo radial.`],[`Rotor Francis`,`Converte o fluxo radial em rotação e saída axial.`],[`Tubo de sucção`,`Recupera parte da energia e devolve a água a jusante.`]]},{id:`kaplan`,nome:`Kaplan`,camada:ue,Svg:L,vazao:`Vazão alta`,legenda:`Hélice de passo variável: mantém rendimento com vazão variável.`,foto:`Kaplan_turbine_bonneville.jpg`,tipo:`Reação (pás ajustáveis)`,faixa:`Quedas baixas: ~10 a 70 m`,usoPR:`UHE Baixo Iguaçu (Capanema): 3 Kaplan de ~117 MW, a fio d'água.`,partes:[[`Conduto axial`,`Mantém a água aproximadamente paralela ao eixo.`],[`Distribuidor`,`Regula a vazão e prepara o giro antes do rotor.`],[`Pás ajustáveis`,`Mudam o passo para acompanhar a condição de vazão.`],[`Eixo e gerador`,`Levam o torque do rotor ao gerador acima.`]]},{id:`bulbo`,nome:`Bulbo`,Svg:ne,vazao:`Vazão muito alta`,legenda:`Conjunto horizontal submerso no próprio fluxo, para quedas muito baixas.`,foto:null,tipo:`Reação (horizontal)`,faixa:`Quedas muito baixas: abaixo de ~15 m`,usoPR:`Sem unidade em operação no PR; no Brasil é típica das UHEs do rio Madeira (RO).`,partes:[[`Carcaça hidrodinâmica`,`Abriga o gerador dentro do próprio canal.`],[`Gerador`,`Recebe o torque pelo eixo horizontal.`],[`Rotor axial`,`Trabalha submerso e alinhado ao fluxo.`],[`Suporte estrutural`,`Fixa o conjunto à estrutura civil.`]]}];function re(e){let t=String(e??``).trim().toLocaleLowerCase(`pt-BR`);return R.find(e=>e.id===t||e.nome.toLocaleLowerCase(`pt-BR`)===t)?.id}function ie({src:e,alt:t,w:n,h:r,credito:i,notas:a,children:o}){let s=`fa-ponta-${(0,y.useId)().replace(/:/g,``)}`,c=y.isValidElement(o)?y.cloneElement(o,{markerId:s}):o;return(0,b.jsxs)(`figure`,{className:`tg-photo`,children:[(0,b.jsxs)(`div`,{className:`fa-palco`,style:{aspectRatio:`${n} / ${r}`},children:[(0,b.jsx)(`img`,{src:e,alt:t,width:n,height:r,loading:`lazy`,decoding:`async`}),(0,b.jsxs)(`svg`,{className:`fa-camada`,viewBox:`0 0 ${n} ${r}`,"aria-hidden":`true`,preserveAspectRatio:`xMidYMid slice`,children:[(0,b.jsx)(`defs`,{children:(0,b.jsx)(`marker`,{id:s,viewBox:`0 0 10 10`,refX:`8`,refY:`5`,markerWidth:`4.6`,markerHeight:`4.6`,orient:`auto-start-reverse`,children:(0,b.jsx)(`path`,{d:`M0 1 L9 5 L0 9 Z`,fill:`context-stroke`})})}),c]})]}),a?.length?(0,b.jsxs)(`div`,{className:`fa-mobile-callouts`,"aria-label":`Pontos identificados na fotografia`,children:[(0,b.jsx)(`strong`,{children:`O que a foto identifica`}),(0,b.jsx)(`ul`,{children:a.map(e=>(0,b.jsx)(`li`,{children:e},e))})]}):null,i]})}function z({x:e,y:t,texto:n,ancora:r,ate:i}){let a=n.length*6.2+16,o=r===`end`?e-a:e,s=r===`end`?e-8:e+8;return(0,b.jsxs)(`g`,{children:[i?(0,b.jsx)(`path`,{d:`M${r===`end`?o:o+a} ${t-3} L${i[0]} ${i[1]}`,stroke:`#eaf7ff`,strokeWidth:`1.3`,opacity:`0.9`,fill:`none`}):null,(0,b.jsx)(`rect`,{x:o,y:t-13,width:a,height:19,rx:7,fill:`#081813`,opacity:`0.82`}),(0,b.jsx)(`text`,{x:s,y:t+1,textAnchor:r===`end`?`end`:`start`,fontSize:`11.5`,fontWeight:`700`,fill:`#eaf7ff`,children:n})]})}var ae=[{x:579,y:30,ancora:`end`,texto:`o jato bate na aresta divisora`,ate:[470,124]},{x:8,y:44,texto:`cubo e eixo`,ate:[176,330]},{x:8,y:772,texto:`concha em dupla colher`,ate:[258,690]}];function oe({markerId:e}){return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(`path`,{className:`fa-rot`,d:`M120 190 A 272 340 0 0 1 404 106`,markerEnd:`url(#${e})`}),(0,b.jsx)(`circle`,{className:`fa-alvo`,cx:`452`,cy:`150`,r:`46`}),(0,b.jsx)(O,{className:`fa-jato`,dash:[9,11],duration:.7,d:`M566 44 L470 128`,markerEnd:`url(#${e})`}),ae.map(e=>(0,b.jsx)(z,{...e},e.texto))]})}oe.chapas=ae;var se=[{x:452,y:16,ancora:`end`,texto:`entrada sob pressão`,ate:[386,40]},{x:6,y:22,texto:`caixa espiral: a seção diminui`,ate:[248,86]},{x:6,y:400,texto:`eixo e gerador`,ate:[172,216]},{x:6,y:434,texto:`distribuidor (palhetas móveis)`,ate:[245,230]},{x:452,y:440,ancora:`end`,texto:`tubo de sucção`,ate:[356,338]}];function ce({markerId:e}){return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(O,{className:`fa-fluxo`,dash:[8,10],duration:1.5,d:`M424 12 L380 44`,markerEnd:`url(#${e})`}),(0,b.jsx)(`circle`,{className:`fa-alvo`,cx:`292`,cy:`210`,r:`60`}),(0,b.jsx)(`path`,{className:`fa-rot`,d:`M232 196 A 66 66 0 0 1 340 178`,markerEnd:`url(#${e})`}),(0,b.jsx)(O,{className:`fa-fluxo`,dash:[8,10],duration:1.5,d:`M330 300 L362 346`,markerEnd:`url(#${e})`}),se.map(e=>(0,b.jsx)(z,{...e},e.texto))]})}ce.chapas=se;var le=[{x:4,y:22,texto:`eixo vertical`,ate:[126,58]},{x:290,y:22,ancora:`end`,texto:`fluxo axial desce`,ate:[252,106]},{x:4,y:360,texto:`pás do rotor`,ate:[112,202]}];function ue({markerId:e}){return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(O,{className:`fa-fluxo`,dash:[8,10],duration:1.5,d:`M62 112 C 74 158 92 178 118 192`,markerEnd:`url(#${e})`}),(0,b.jsx)(O,{className:`fa-fluxo`,dash:[8,10],duration:1.5,d:`M256 112 C 244 158 226 178 202 192`,markerEnd:`url(#${e})`}),(0,b.jsx)(`circle`,{className:`fa-alvo`,cx:`162`,cy:`186`,r:`34`}),(0,b.jsx)(`path`,{className:`fa-rot`,d:`M126 178 A 38 38 0 0 1 196 170`,markerEnd:`url(#${e})`}),le.map(e=>(0,b.jsx)(z,{...e},e.texto))]})}ue.chapas=le;function de({selectedType:e,onSelectType:t}){let n=E(),[i,a]=(0,y.useState)(R[0].id),o=(0,y.useId)().replace(/:/g,``),l=e===void 0?void 0:re(e),u=l!==void 0,d=l||i,f=R.find(e=>e.id===d)||R[0];function p(e){u||a(e),t?.(e)}return(0,b.jsxs)(`div`,{ref:n.sceneRef,className:`turb-gallery hydro-motion-surface hcm-turbine-motion`,style:n.surfaceStyle,"data-motion-state":n.motionActive?`running`:`paused`,"data-playing":n.playing?`true`:`false`,children:[(0,b.jsx)(D,{motion:n,context:`Animação da turbina ${f.nome}`}),(0,b.jsx)(`div`,{className:`tg-tabs hcm-tabs`,role:`tablist`,"aria-label":`Tipo de turbina`,onKeyDown:k,children:R.map(e=>{let t=e.id===f.id;return(0,b.jsx)(`button`,{type:`button`,id:`${o}-tab-${e.id}`,role:`tab`,"aria-selected":t,"aria-controls":`${o}-panel`,tabIndex:t?0:-1,className:t?`active`:``,onClick:()=>p(e.id),children:e.nome},e.id)})}),(0,b.jsxs)(`div`,{id:`${o}-panel`,className:`tg-body`,role:`tabpanel`,"aria-labelledby":`${o}-tab-${f.id}`,children:[(0,b.jsxs)(`p`,{className:`hcm-current-state`,children:[(0,b.jsx)(`strong`,{children:`Em exibição:`}),` turbina `,f.nome,`. As linhas claras mostram o percurso da água; as peças móveis destacam como a energia chega ao eixo.`]}),(0,b.jsxs)(`figure`,{className:`tg-schema`,children:[(0,b.jsx)(f.Svg,{}),(0,b.jsxs)(`figcaption`,{children:[(0,b.jsxs)(`span`,{className:`tg-cap-t`,children:[`Esquema: `,f.nome,` (`,f.tipo.toLowerCase(),`)`]}),(0,b.jsx)(`span`,{className:`tg-cap-d`,children:f.legenda})]})]}),f.foto?(0,b.jsx)(ie,{src:M(f.foto),alt:`Foto real de turbina ${f.nome}`,w:N[f.foto][0],h:N[f.foto][1],notas:f.camada?.chapas?.map(e=>e.texto),credito:(0,b.jsxs)(`figcaption`,{children:[(0,b.jsx)(s,{size:13}),` Foto real anotada · `,(0,b.jsx)(`a`,{href:P(f.foto),target:`_blank`,rel:`noreferrer`,children:`Wikimedia Commons`}),` (licença livre)`]}),children:f.camada?(0,b.jsx)(f.camada,{}):null}):(0,b.jsxs)(`div`,{className:`tg-nophoto`,children:[(0,b.jsx)(c,{}),(0,b.jsx)(`p`,{children:`Sem foto de licença livre confirmada para bulbo: o esquema ao lado mostra o conjunto gerador submerso no próprio fluxo.`})]}),(0,b.jsxs)(`div`,{className:`tg-info`,children:[(0,b.jsxs)(`h3`,{children:[`Turbina `,f.nome]}),(0,b.jsxs)(`p`,{children:[(0,b.jsx)(`strong`,{children:f.tipo}),` · `,f.faixa,f.vazao?` · `+f.vazao:``]}),(0,b.jsxs)(`p`,{className:`tg-pr`,children:[(0,b.jsx)(r,{size:14}),` `,(0,b.jsx)(`strong`,{children:`No Paraná:`}),` `,f.usoPR]})]}),(0,b.jsxs)(`section`,{className:`hcm-equipment-key`,"aria-label":`Componentes da turbina ${f.nome}`,children:[(0,b.jsx)(`h3`,{children:`Como identificar os componentes`}),(0,b.jsx)(`ol`,{children:f.partes.map(([e,t],n)=>(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`span`,{"aria-hidden":`true`,children:n+1}),(0,b.jsxs)(`p`,{children:[(0,b.jsx)(`strong`,{children:e}),t]})]},e))})]})]})]})}function B({p:e}){return(0,b.jsxs)(`defs`,{children:[(0,b.jsxs)(`linearGradient`,{id:e+`-ceu`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#6ea9d6`}),(0,b.jsx)(`stop`,{offset:`0.6`,stopColor:`#a9cee3`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#cfe1da`})]}),(0,b.jsxs)(`linearGradient`,{id:e+`-agua`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#86ccf0`}),(0,b.jsx)(`stop`,{offset:`0.35`,stopColor:`#3f9fd4`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#17527a`})]}),(0,b.jsxs)(`linearGradient`,{id:e+`-rocha`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#6d5f4c`}),(0,b.jsx)(`stop`,{offset:`0.45`,stopColor:`#4e4536`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#2f2a22`})]}),(0,b.jsxs)(`linearGradient`,{id:e+`-mato`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#6d9179`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#41604b`})]}),(0,b.jsxs)(`linearGradient`,{id:e+`-concreto`,x1:`0`,y1:`0`,x2:`1`,y2:`0`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#dcdfd8`}),(0,b.jsx)(`stop`,{offset:`0.45`,stopColor:`#b7bcb4`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#7f8780`})]}),(0,b.jsxs)(`linearGradient`,{id:e+`-aco`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#5c676d`}),(0,b.jsx)(`stop`,{offset:`0.32`,stopColor:`#c2ccd1`}),(0,b.jsx)(`stop`,{offset:`0.52`,stopColor:`#93a0a7`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#3f484d`})]}),(0,b.jsx)(`marker`,{id:e+`-seta`,viewBox:`0 0 10 10`,refX:`8`,refY:`5`,markerWidth:`5`,markerHeight:`5`,orient:`auto-start-reverse`,children:(0,b.jsx)(`path`,{d:`M0 1 L9 5 L0 9 Z`,fill:`context-stroke`})}),(0,b.jsx)(`filter`,{id:e+`-sombra`,x:`-25%`,y:`-25%`,width:`160%`,height:`165%`,children:(0,b.jsx)(`feDropShadow`,{dx:`2`,dy:`4`,stdDeviation:`3`,floodColor:`#15201c`,floodOpacity:`0.45`})})]})}function V({x:e,y:t,texto:n,cor:r,ancora:i,pequena:a}){let o=n.length*(a?5.4:6.3)+(a?13:16),s=i===`end`?e-o:i===`middle`?e-o/2:e,c=i===`end`?e-8:i===`middle`?e:e+8;return(0,b.jsxs)(`g`,{className:`hcm-svg-label`,children:[(0,b.jsx)(`rect`,{x:s,y:t-(a?10:12),width:o,height:a?15:18,rx:a?6:7,fill:`#0f2119`,opacity:`0.85`}),(0,b.jsx)(`text`,{x:c,y:t+1,textAnchor:i===`middle`?`middle`:i===`end`?`end`:`start`,fontSize:a?9.5:11,fontWeight:`700`,fill:r||`#e7f3ec`,children:n})]})}function fe(){let e=`M196 66 C 236 96, 250 152, 268 196`;return(0,b.jsxs)(`svg`,{viewBox:`0 0 460 250`,className:`arr-svg`,role:`img`,"aria-label":`Esquema de usina reversível com geração e bombeamento`,children:[(0,b.jsx)(B,{p:`rv`}),(0,b.jsx)(`rect`,{width:`460`,height:`250`,fill:`url(#rv-ceu)`}),(0,b.jsx)(`path`,{d:`M0 250 L460 250 L460 186 C 380 182 320 176 286 150 C 250 122 236 92 214 76 C 190 58 120 56 0 58 Z`,fill:`url(#rv-rocha)`}),(0,b.jsx)(`path`,{d:`M0 58 C 120 56 190 58 214 76 C 236 92 250 122 286 150 C 320 176 380 182 460 186 L460 196 C 378 192 316 186 280 158 C 244 130 230 100 208 84 C 186 68 118 66 0 68 Z`,fill:`url(#rv-mato)`,opacity:`0.95`}),(0,b.jsx)(`path`,{d:`M22 68 q7 -16 14 -3 q6 -12 12 3 Z M74 66 q6 -13 12 -2 q8 -18 15 2 Z M140 68 q8 -19 15 -3 q5 -9 10 3 Z`,fill:`#3d6b48`,opacity:`0.85`}),(0,b.jsx)(`path`,{d:`M338 182 q7 -16 14 -3 q6 -12 12 3 Z M392 184 q6 -13 12 -2 q8 -18 15 2 Z`,fill:`#3d6b48`,opacity:`0.8`}),(0,b.jsx)(`path`,{d:`M22 62 L206 62 L206 40 L22 40 Z`,fill:`#3a3327`}),(0,b.jsx)(`path`,{d:`M28 60 L200 60 L200 44 L28 44 Z`,fill:`url(#rv-agua)`}),(0,b.jsx)(`rect`,{x:`28`,y:`44`,width:`172`,height:`4`,fill:`#dff2ff`,opacity:`0.45`}),(0,b.jsx)(`path`,{d:`M22 62 L28 44 M206 62 L200 44`,stroke:`#8b8676`,strokeWidth:`3.5`,strokeLinecap:`round`}),(0,b.jsx)(`path`,{d:`M252 214 L452 214 L452 186 L252 186 Z`,fill:`#3a3327`}),(0,b.jsx)(`path`,{d:`M258 212 L446 212 L446 190 L258 190 Z`,fill:`url(#rv-agua)`}),(0,b.jsx)(`rect`,{x:`258`,y:`190`,width:`188`,height:`5`,fill:`#dff2ff`,opacity:`0.45`}),(0,b.jsx)(`path`,{d:e,stroke:`#2b2519`,strokeWidth:`20`,fill:`none`,strokeLinecap:`round`}),(0,b.jsx)(`path`,{d:e,stroke:`url(#rv-aco)`,strokeWidth:`14`,fill:`none`,strokeLinecap:`round`}),(0,b.jsx)(O,{className:`rv-gera`,dash:[10,12],duration:1.1,d:e,stroke:`#5ff2cd`,strokeWidth:`4.4`,fill:`none`,strokeLinecap:`round`}),(0,b.jsx)(O,{className:`rv-bombeia`,dash:[10,12],duration:1.6,d:`M268 196 C 250 152, 236 96, 196 66`,stroke:`#ffc94f`,strokeWidth:`4.4`,fill:`none`,strokeLinecap:`round`}),(0,b.jsx)(`ellipse`,{cx:`248`,cy:`150`,rx:`30`,ry:`24`,fill:`#1d1a12`,opacity:`0.75`}),(0,b.jsx)(`g`,{filter:`url(#rv-sombra)`,children:(0,b.jsx)(`circle`,{cx:`248`,cy:`150`,r:`19`,fill:`#2f8f70`,stroke:`#d9efe4`,strokeWidth:`1.8`})}),(0,b.jsxs)(`g`,{className:`hcm-reversible-rotor`,"data-rotor":`reversible`,children:[(0,b.jsx)(`path`,{d:`M248 136 C253 137 257 141 258 146 C253 145 249 144 246 141 Z`,fill:`#ffd479`}),(0,b.jsx)(`path`,{d:`M262 150 C261 155 257 159 252 160 C253 155 254 151 257 148 Z`,fill:`#ffd479`}),(0,b.jsx)(`path`,{d:`M248 164 C243 163 239 159 238 154 C243 155 247 156 250 159 Z`,fill:`#ffd479`}),(0,b.jsx)(`path`,{d:`M234 150 C235 145 239 141 244 140 C243 145 242 149 239 152 Z`,fill:`#ffd479`}),(0,b.jsx)(`circle`,{cx:`248`,cy:`150`,r:`4`,fill:`#fff0ba`})]}),(0,b.jsx)(V,{x:34,y:34,texto:`reservatório SUPERIOR`,cor:`#bfe6ff`}),(0,b.jsx)(V,{x:446,y:234,texto:`reservatório INFERIOR`,cor:`#bfe6ff`,ancora:`end`}),(0,b.jsx)(V,{x:286,y:140,texto:`bomba-turbina reversível`}),(0,b.jsxs)(`g`,{className:`rv-gera-rotulo`,children:[(0,b.jsx)(`path`,{d:`M64 104 L64 138`,stroke:`#37d39a`,strokeWidth:`4`,markerEnd:`url(#rv-seta)`}),(0,b.jsx)(V,{x:76,y:116,texto:`GERA na ponta (desce)`,cor:`#5ff2cd`})]}),(0,b.jsxs)(`g`,{className:`rv-bombeia-rotulo`,children:[(0,b.jsx)(`path`,{d:`M64 210 L64 176`,stroke:`#e5a000`,strokeWidth:`4`,markerEnd:`url(#rv-seta)`}),(0,b.jsx)(V,{x:76,y:198,texto:`BOMBEIA fora de ponta (sobe)`,cor:`#ffc94f`})]})]})}var H=Object.freeze({generate:{label:`Geração`,description:`A água desce do reservatório superior e aciona a bomba-turbina para gerar energia.`},pump:{label:`Bombeamento`,description:`A máquina inverte o sentido e consome energia para devolver água ao reservatório superior.`}});function pe(){let e=E(),[t,n]=(0,y.useState)(`generate`),[r,i]=(0,y.useState)(!0),a=H[t];return(0,y.useEffect)(()=>{if(!e.motionActive||!r)return;let t=window.setInterval(()=>n(e=>e===`generate`?`pump`:`generate`),4500*(100/e.speed));return()=>window.clearInterval(t)},[r,e.motionActive,e.speed]),(0,b.jsxs)(`section`,{ref:e.sceneRef,className:`hydro-motion-surface hcm-reversible-motion`,style:e.surfaceStyle,"data-motion-state":e.motionActive?`running`:`paused`,"data-playing":e.playing?`true`:`false`,"data-reversible-mode":t,"data-automatic-phase":r?`true`:`false`,"aria-label":`Funcionamento da usina reversível`,children:[(0,b.jsx)(D,{motion:e,context:`Animação da usina reversível`}),(0,b.jsx)(`div`,{className:`hcm-phase-selector`,role:`group`,"aria-label":`Modo da usina reversível`,children:Object.entries(H).map(([e,r])=>(0,b.jsx)(`button`,{type:`button`,className:t===e?`active`:``,"aria-pressed":t===e,onClick:()=>{i(!1),n(e)},children:r.label},e))}),(0,b.jsxs)(`p`,{className:`hcm-current-state`,role:`status`,"aria-live":`polite`,children:[(0,b.jsxs)(`strong`,{children:[`Modo em destaque: `,a.label,`.`]}),` `,a.description]}),(0,b.jsxs)(`div`,{className:`prc-fotos`,children:[(0,b.jsxs)(`figure`,{children:[(0,b.jsx)(fe,{}),(0,b.jsx)(`figcaption`,{children:`Ciclo diário: funciona como bateria hídrica, consome energia para estocar água no reservatório superior e gera na hora de ponta.`})]}),(0,b.jsxs)(`figure`,{children:[(0,b.jsx)(`img`,{src:A+`/hidro/reversivel-bath-county.jpg`,alt:`Bath County Pumped Storage Station: casa de força e subestação`,width:`1280`,height:`960`,loading:`lazy`,decoding:`async`}),(0,b.jsxs)(`figcaption`,{children:[(0,b.jsx)(s,{size:13}),` Foto real da usina · `,(0,b.jsx)(`a`,{href:P(`Bath_County_Pumped_Storage_Station.jpg`),target:`_blank`,rel:`noreferrer`,children:`Wikimedia Commons`}),` (licença livre)`]})]})]}),(0,b.jsxs)(`section`,{className:`hcm-equipment-key`,"aria-label":`Componentes do armazenamento por bombeamento`,children:[(0,b.jsx)(`h3`,{children:`Como ler o esquema`}),(0,b.jsxs)(`ol`,{children:[(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`span`,{"aria-hidden":`true`,children:`1`}),(0,b.jsxs)(`p`,{children:[(0,b.jsx)(`strong`,{children:`Reservatório superior`}),`Armazena água e energia potencial.`]})]}),(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`span`,{"aria-hidden":`true`,children:`2`}),(0,b.jsxs)(`p`,{children:[(0,b.jsx)(`strong`,{children:`Conduto reversível`}),`Leva água para baixo na geração e para cima no bombeamento.`]})]}),(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`span`,{"aria-hidden":`true`,children:`3`}),(0,b.jsxs)(`p`,{children:[(0,b.jsx)(`strong`,{children:`Bomba-turbina`}),`Opera nos dois sentidos dentro da casa de força.`]})]}),(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`span`,{"aria-hidden":`true`,children:`4`}),(0,b.jsxs)(`p`,{children:[(0,b.jsx)(`strong`,{children:`Reservatório inferior`}),`Recebe a água gerada e fornece água para o bombeamento.`]})]})]})]})]})}var me=[{tipo:`UHE de acumulação`,criterio:`Acima de 30 MW · concessão (leilão) · situação passível de EIA/RIMA; confirmar estudo e rito no caso concreto · reservatório de regularização`,nome:`UHE Gov. Bento Munhoz da Rocha Netto (Foz do Areia)`,local:`Rio Iguaçu, Pinhão-PR`,dados:`1.676 MW · 4 turbinas Francis de 419 MW · barragem de 160 m · reservatório de ~165 km² · opera desde 1980 · maior usina da Copel`,site:`https://www.copel.com/site/copel-geracao/usinas/usina-governador-bento-munhoz-da-rocha-netto/`,siteLabel:`copel.com (página oficial da usina)`},{tipo:`UHE a fio d'água`,criterio:`Acima de 30 MW · pouca ou nenhuma regularização sazonal · geração mais dependente da vazão afluente`,nome:`UHE Baixo Iguaçu`,local:`Rio Iguaçu, Capanema / Capitão Leônidas Marques-PR`,dados:`350,2 MW · 3 unidades Kaplan segundo nota técnica da EPE. A fonte registra dados de projeto; confirme a situação operacional atual na base competente antes de citar em processo.`,site:`https://www.epe.gov.br/sites-pt/publicacoes-dados-abertos/publicacoes/PublicacoesArquivos/publicacao-292/topico-376/EPE-DEE-RE-066-2016-r0.pdf`,siteLabel:`epe.gov.br (nota técnica oficial; dados de projeto)`},{tipo:`UHE de queda alta (derivação)`,criterio:`Circuito longo de adução por túnel · queda elevada · turbinas Pelton`,nome:`UHE Gov. Pedro Viriato Parigot de Souza (Capivari-Cachoeira)`,local:`Antonina-PR (capta no rio Capivari e restitui no Cachoeira)`,dados:`260 MW de potência instalada, com quatro geradores de 62,5 MW segundo a Copel · desnível de 754 m, a maior queda do sul do país · mais de 50 anos de operação`,site:`https://www.copel.com/site/copel-geracao/usinas/usina-parigot-de-souza/`,siteLabel:`copel.com (página oficial da usina)`},{tipo:`PCH, Pequena Central Hidrelétrica`,criterioAmbiental:`IN IAT nº 09/2025, art. 2º: capacidade instalada superior a 5 MW e igual ou inferior a 30 MW, com reservatório de até 3 km², excluída a calha do leito regular. A restrição de área não se aplica aos aproveitamentos comprovadamente dimensionados para objetivos diferentes da geração de energia elétrica.`,criterioSetorial:`ANEEL: a página operacional consultada em 10/08/2026 usa potência superior a 5.000 kW e igual ou inferior a 30.000 kW. Confira o ato setorial aplicável e a situação concreta do empreendimento.`,criterioAlerta:`Não transporte a referência a 13 km² de uma página geral para o critério ambiental do IAT, nem a misture com o enquadramento setorial.`,nome:`PCH Bela Vista`,local:`Rio Chopim, Verê / São João-PR`,dados:`29,81 MW · inaugurada em outubro de 2021 (unidades em jun/jul/ago) · investimento de R$ 224 milhões da Copel`,site:`https://pchbelavista.com.br/`,siteLabel:`pchbelavista.com.br (site oficial)`},{tipo:`CGH, Central Geradora Hidrelétrica`,criterio:`Até 5 MW · registro/comunicação à ANEEL · rito proporcional ao porte`,nome:`CGH São Francisco de Sales`,local:`Rio São Francisco, Clevelândia-PR (comunidade Palmital)`,dados:`0,9 MW · empreendimento privado com barragem de derivação e canal adutor de 317 m · site relata obras iniciadas em 2021; confirme a situação operacional atual no SIGA/ANEEL`,site:`https://cghsaofranciscodesales.com.br/`,siteLabel:`cghsaofranciscodesales.com.br (site do empreendimento)`},{tipo:`UHE binacional`,criterio:`Empreendimento de tratado internacional · regime jurídico próprio`,nome:`Itaipu Binacional`,local:`Rio Paraná, Foz do Iguaçu-PR (Brasil/Paraguai)`,dados:`14.000 MW · 20 unidades geradoras Francis · líder mundial em produção acumulada de energia`,site:`https://www.itaipu.gov.br/`,siteLabel:`itaipu.gov.br (site oficial)`},{tipo:`Reversível (bombeamento)`,criterio:`Bombeia água a reservatório superior fora de ponta e turbina na ponta, a "bateria" hídrica`,reversivel:!0,nome:`Bath County Pumped Storage Station: exemplo fora do Paraná`,local:`Bath County, Virgínia, Estados Unidos`,dados:`Exemplo didático internacional de armazenamento por bombeamento. A fonte técnica abaixo explica a tecnologia; não atesta a situação operacional atual deste empreendimento, que deve ser conferida na agência ou operadora competente.`,site:`https://www.energy.gov/cmei/water/history-hydropower`,siteLabel:`energy.gov (fonte técnica oficial dos Estados Unidos)`}];function he(){return(0,b.jsxs)(`div`,{className:`pr-cases`,children:[(0,b.jsxs)(`p`,{className:`prc-note`,children:[(0,b.jsx)(c,{size:15}),` Casos reais, com dados públicos coletados nas fontes indicadas em cada card, oficiais sempre que disponíveis. Confirme potência e situação operacional na fonte antes de citar em processo. O enquadramento ambiental segue o IAT e o POP; o enquadramento setorial segue a ANEEL. Leia cada eixo separadamente e confirme vigência e aplicação antes de decidir.`]}),(0,b.jsx)(`div`,{className:`prc-grid`,children:me.map(e=>(0,b.jsxs)(`article`,{className:`prc-card`+(e.site?``:` prc-empty`)+(e.reversivel?` prc-wide`:``),children:[(0,b.jsx)(`span`,{className:`prc-tipo`,children:e.tipo}),(0,b.jsx)(`h3`,{children:e.nome}),e.criterio&&(0,b.jsxs)(`p`,{className:`prc-crit`,children:[(0,b.jsx)(h,{size:13}),` `,e.criterio]}),e.criterioAmbiental&&(0,b.jsxs)(`p`,{className:`prc-crit`,children:[(0,b.jsx)(h,{size:13}),(0,b.jsxs)(`span`,{children:[(0,b.jsx)(`strong`,{children:`Eixo ambiental IAT.`}),` `,e.criterioAmbiental]})]}),e.criterioSetorial&&(0,b.jsxs)(`p`,{className:`prc-crit`,children:[(0,b.jsx)(g,{size:13}),(0,b.jsxs)(`span`,{children:[(0,b.jsx)(`strong`,{children:`Eixo setorial ANEEL.`}),` `,e.criterioSetorial]})]}),e.criterioAlerta&&(0,b.jsxs)(`p`,{className:`prc-crit`,children:[(0,b.jsx)(c,{size:13}),(0,b.jsxs)(`span`,{children:[(0,b.jsx)(`strong`,{children:`Não misture os critérios.`}),` `,e.criterioAlerta]})]}),(0,b.jsxs)(`p`,{className:`prc-local`,children:[(0,b.jsx)(r,{size:13}),` `,e.local]}),(0,b.jsx)(`p`,{className:`prc-dados`,children:e.dados}),e.reversivel&&(0,b.jsx)(pe,{}),e.site&&(0,b.jsxs)(`a`,{className:`prc-site`,href:e.site,target:`_blank`,rel:`noreferrer`,children:[(0,b.jsx)(p,{size:14}),` `,e.siteLabel]})]},e.nome))})]})}var ge=[[`Estudos e definição do aproveitamento`,`Inventário do trecho, partição de quedas e projeto do aproveitamento: potência, queda, vazão e arranjo.`],[`Registro na ANEEL`,`Registro do projeto conforme a REN nº 875/2020 (adequabilidade do sumário executivo, DRS) e obtenção do CEG, o código único do empreendimento.`],[`Outorga setorial`,`Até 5 MW: registro/comunicação. Acima de 5 MW: autorização da ANEEL (limite ampliado pela legislação setorial vigente). Grandes aproveitamentos: concessão mediante leilão.`],[`Conexão à rede`,`Parecer de acesso, projeto da linha/subestação e contratos de conexão e uso do sistema.`]],_e=[[`Consulta Prévia (obrigatória para CGH a partir de 1 MW, PCH e UHE)`,`Antes de formalizar: mapa da ADA, arranjo em KML/KMZ e memorial descritivo (art. 36 da IN IAT nº 09/2025). A manifestação orienta modalidade e estudo, vale 24 meses e não aprova viabilidade.`],[`Enquadramento`,`Potência, área de alagamento, IDA, supressão e sensibilidade orientam a modalidade (DLAM, LAC, LAS ou rito trifásico). O estudo aplicável (RAS/RDPA, PCA ou EIA/RIMA) deve ser confirmado pelo enquadramento, pelo Termo de Referência vigente e pelos atos do processo, sem inferência automática a partir de um dado isolado.`],[`Protocolo e análise`,`Formalização pelo SGA/eProtocolo com a documentação da fase; o IAT confere suficiência antes do mérito e diligencia lacunas.`],[`LP → LI → LO`,`LP atesta viabilidade e concepção; LI autoriza instalar conforme projeto (com autorizações florestais, de fauna e outorga/DRDH); LO verifica o instalado e fixa condicionantes de operação, e o PACUERA quando exigível.`],[`Intervenientes`,`IPHAN (patrimônio), gestor de UC afetada e demais órgãos manifestam-se no processo; o IAT verifica compatibilidade sem substituir a decisão de cada um.`]],ve=[[`Empreendedor`,`Decide investir, contrata estudos, protocola nos dois trilhos, mantém titularidade coerente entre ANEEL e IAT, responde exigências e cumpre condicionantes.`],[`Consultoria ambiental`,`Elabora memorial e estudos conforme os Termos de Referência, com ARTs; responde complementações técnicas e acompanha vistorias.`],[`IAT`,`Analisa, diligencia, licencia e fiscaliza o componente ambiental no Paraná; confere a existência e compatibilidade dos atos externos.`],[`ANEEL`,`Registra e outorga o aproveitamento energético, emite o CEG e regula a operação comercial.`],[`Órgãos intervenientes`,`IPHAN, gestores de UC e demais órgãos: manifestações específicas na sua competência, que integram o processo sem transferi-la.`]];function ye({go:e}){return(0,b.jsxs)(`div`,{className:`lic-path`,children:[(0,b.jsxs)(`p`,{className:`prc-note`,children:[(0,b.jsx)(c,{size:15}),` Roteiro didático baseado no POP e na IN IAT nº 09/2025 (fluxo ambiental) e no regime setorial da ANEEL (fluxo energético). Os dois processos avançam em paralelo e precisam ser compatíveis: titularidade, arranjo e potência devem coincidir.`]}),(0,b.jsxs)(`div`,{className:`lic-cols`,children:[(0,b.jsxs)(`section`,{className:`lic-col lic-aneel`,children:[(0,b.jsxs)(`h3`,{children:[(0,b.jsx)(g,{size:17}),` Fluxo setorial · ANEEL`]}),(0,b.jsx)(`ol`,{children:ge.map(([e,t],n)=>(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`span`,{children:n+1}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`strong`,{children:e}),(0,b.jsx)(`p`,{children:t})]})]},e))})]}),(0,b.jsxs)(`section`,{className:`lic-col lic-iat`,children:[(0,b.jsxs)(`h3`,{children:[(0,b.jsx)(h,{size:17}),` Fluxo ambiental · IAT`]}),(0,b.jsx)(`ol`,{children:_e.map(([e,t],n)=>(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`span`,{children:n+1}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`strong`,{children:e}),(0,b.jsx)(`p`,{children:t})]})]},e))})]})]}),(0,b.jsx)(`h3`,{className:`lic-papeis-h`,children:`Quem faz o quê`}),(0,b.jsx)(`div`,{className:`lic-papeis`,children:ve.map(([e,t])=>(0,b.jsxs)(`article`,{children:[(0,b.jsx)(`strong`,{children:e}),(0,b.jsx)(`p`,{children:t})]},e))}),(0,b.jsxs)(`div`,{className:`lic-cta`,children:[(0,b.jsx)(`p`,{children:`O detalhe de cada fase (documentos, critérios de suficiência e produtos) está nos módulos M03 a M05 da Formação e nas normas da Biblioteca.`}),(0,b.jsxs)(`button`,{className:`primary`,onClick:()=>e(`formacao`),children:[`Estudar as fases `,(0,b.jsx)(p,{size:15})]})]})]})}function be(){return(0,b.jsxs)(`svg`,{viewBox:`0 0 460 240`,className:`arr-svg`,role:`img`,"aria-label":`Arranjo pé de barragem`,children:[(0,b.jsx)(B,{p:`pb`}),(0,b.jsx)(`rect`,{width:`460`,height:`240`,fill:`url(#pb-ceu)`}),(0,b.jsx)(`path`,{d:`M0 96 L120 84 L210 96 L300 82 L392 96 L460 86 L460 118 L0 118 Z`,fill:`url(#pb-mato)`,opacity:`0.5`}),(0,b.jsx)(`path`,{d:`M0 240 L460 240 L460 196 L266 196 L226 212 L180 212 L180 118 L0 118 Z`,fill:`url(#pb-rocha)`}),(0,b.jsx)(`path`,{d:`M0 118 L180 118 L180 112 L0 112 Z`,fill:`#4c7a56`}),(0,b.jsx)(`path`,{d:`M266 196 L460 196 L460 190 L266 190 Z`,fill:`#4c7a56`}),(0,b.jsx)(`path`,{d:`M0 150 L180 150 L180 118 L0 118 Z`,fill:`url(#pb-agua)`}),(0,b.jsx)(`rect`,{x:`0`,y:`118`,width:`180`,height:`5`,fill:`#dff2ff`,opacity:`0.4`}),(0,b.jsxs)(`g`,{filter:`url(#pb-sombra)`,children:[(0,b.jsx)(`path`,{d:`M180 118 L180 205 L226 205 L212 118 Z`,fill:`url(#pb-concreto)`}),(0,b.jsx)(`path`,{d:`M178 116 L214 116 L215 124 L178 124 Z`,fill:`#e6e9e2`})]}),(0,b.jsx)(`g`,{stroke:`#959c94`,strokeWidth:`0.8`,opacity:`0.5`,children:(0,b.jsx)(`path`,{d:`M189 120 L192 205 M199 120 L204 205`})}),(0,b.jsx)(`path`,{d:`M186 130 L212 198`,stroke:`#2f373b`,strokeWidth:`11`,strokeLinecap:`round`}),(0,b.jsx)(`path`,{d:`M186 130 L212 198`,stroke:`url(#pb-aco)`,strokeWidth:`8`,strokeLinecap:`round`}),(0,b.jsx)(O,{className:`arr-fluxo`,dash:[10,14],duration:1.15,d:`M186 130 L212 198`,stroke:`#5ff2cd`,strokeWidth:`3.4`,strokeLinecap:`round`,fill:`none`}),(0,b.jsxs)(`g`,{filter:`url(#pb-sombra)`,children:[(0,b.jsx)(`path`,{d:`M212 176 L240 164 L268 176 L268 182 L240 171 L212 182 Z`,fill:`#93a29a`}),(0,b.jsx)(`rect`,{x:`214`,y:`180`,width:`52`,height:`28`,fill:`#e9ece6`,stroke:`#7d867f`,strokeWidth:`1.3`})]}),(0,b.jsx)(`rect`,{x:`214`,y:`180`,width:`52`,height:`28`,fill:`url(#pb-concreto)`,opacity:`0.3`}),(0,b.jsx)(`path`,{d:`M222 194 L258 194`,stroke:`#aab3ab`,strokeWidth:`1.6`}),(0,b.jsx)(`circle`,{cx:`240`,cy:`199`,r:`6`,fill:`#40525c`,stroke:`#dfe7e2`,strokeWidth:`1.2`}),(0,b.jsx)(`rect`,{x:`266`,y:`196`,width:`194`,height:`18`,fill:`url(#pb-agua)`}),(0,b.jsx)(`rect`,{x:`266`,y:`196`,width:`194`,height:`4`,fill:`#dff2ff`,opacity:`0.4`}),(0,b.jsx)(O,{className:`arr-fluxo`,dash:[10,14],duration:1.15,d:`M272 205 L454 205`,stroke:`#eaf7ff`,strokeWidth:`3`,strokeLinecap:`round`,fill:`none`,opacity:`0.95`}),(0,b.jsx)(V,{x:8,y:110,texto:`reservatório`,cor:`#bfe6ff`}),(0,b.jsx)(V,{x:172,y:232,texto:`barragem`,ancora:`end`}),(0,b.jsx)(V,{x:278,y:166,texto:`casa de força no pé`}),(0,b.jsx)(V,{x:452,y:232,texto:`restituição imediata`,cor:`#a9c6bb`,ancora:`end`})]})}function xe(){return(0,b.jsxs)(`svg`,{viewBox:`0 0 460 240`,className:`arr-svg`,role:`img`,"aria-label":`Arranjo de derivação`,children:[(0,b.jsx)(B,{p:`dv`}),(0,b.jsx)(`rect`,{width:`460`,height:`240`,fill:`url(#dv-ceu)`}),(0,b.jsx)(`path`,{d:`M0 62 L96 44 L188 66 L286 40 L380 66 L460 48 L460 240 L0 240 Z`,fill:`url(#dv-mato)`,opacity:`0.55`}),(0,b.jsx)(`path`,{d:`M0 240 L460 240 L460 132 C 360 128 300 150 236 150 C 170 150 120 122 0 118 Z`,fill:`url(#dv-rocha)`,opacity:`0.92`}),(0,b.jsx)(`path`,{d:`M0 90 Q120 70 200 96 T460 120`,fill:`none`,stroke:`#2b5e7f`,strokeWidth:`20`,strokeLinecap:`round`}),(0,b.jsx)(`path`,{d:`M0 90 Q120 70 200 96 T460 120`,fill:`none`,stroke:`url(#dv-agua)`,strokeWidth:`15`,strokeLinecap:`round`}),(0,b.jsxs)(`g`,{filter:`url(#dv-sombra)`,children:[(0,b.jsx)(`path`,{d:`M56 72 L78 72 L75 116 L59 116 Z`,fill:`url(#dv-concreto)`}),(0,b.jsx)(`path`,{d:`M56 72 L78 72 L78 78 L56 78 Z`,fill:`#eceee8`})]}),(0,b.jsx)(`path`,{d:`M76 100 C 150 112 250 118 320 150`,fill:`none`,stroke:`#2b2519`,strokeWidth:`15`,strokeLinecap:`round`}),(0,b.jsx)(`path`,{d:`M76 100 C 150 112 250 118 320 150`,fill:`none`,stroke:`url(#dv-aco)`,strokeWidth:`10`,strokeLinecap:`round`}),(0,b.jsx)(O,{className:`arr-fluxo`,dash:[10,14],duration:1.15,d:`M76 100 C 150 112 250 118 320 150`,fill:`none`,stroke:`#5ff2cd`,strokeWidth:`3.6`,strokeLinecap:`round`}),(0,b.jsx)(O,{className:`arr-fluxo-tvr`,dash:[5,20],duration:7,d:`M80 100 Q170 112 250 118 T460 126`,fill:`none`,stroke:`#a8cfe6`,strokeWidth:`2`,strokeLinecap:`round`,opacity:`0.85`}),(0,b.jsx)(`rect`,{x:`246`,y:`52`,width:`17`,height:`58`,rx:`3`,fill:`url(#dv-concreto)`,stroke:`#6f7772`,strokeWidth:`1.2`}),(0,b.jsx)(`rect`,{x:`248`,y:`70`,width:`13`,height:`38`,fill:`url(#dv-agua)`,opacity:`0.9`}),(0,b.jsxs)(`g`,{filter:`url(#dv-sombra)`,children:[(0,b.jsx)(`path`,{d:`M316 146 L344 134 L372 146 L372 152 L344 141 L316 152 Z`,fill:`#93a29a`}),(0,b.jsx)(`rect`,{x:`318`,y:`150`,width:`54`,height:`28`,fill:`#e9ece6`,stroke:`#7d867f`,strokeWidth:`1.3`})]}),(0,b.jsx)(`rect`,{x:`318`,y:`150`,width:`54`,height:`28`,fill:`url(#dv-concreto)`,opacity:`0.3`}),(0,b.jsx)(`circle`,{cx:`345`,cy:`169`,r:`6`,fill:`#40525c`,stroke:`#dfe7e2`,strokeWidth:`1.2`}),(0,b.jsx)(`path`,{d:`M372 166 Q420 178 460 170`,fill:`none`,stroke:`#2b5e7f`,strokeWidth:`15`,strokeLinecap:`round`}),(0,b.jsx)(`path`,{d:`M372 166 Q420 178 460 170`,fill:`none`,stroke:`url(#dv-agua)`,strokeWidth:`11`,strokeLinecap:`round`}),(0,b.jsx)(O,{className:`arr-fluxo`,dash:[10,14],duration:1.15,d:`M374 167 Q420 179 458 171`,fill:`none`,stroke:`#eaf7ff`,strokeWidth:`3`,strokeLinecap:`round`,opacity:`0.95`}),(0,b.jsx)(V,{x:8,y:40,texto:`açude de derivação`,cor:`#bfe6ff`}),(0,b.jsx)(V,{x:250,y:44,texto:`chaminé de equilíbrio`,cor:`#ffc94f`,ancora:`middle`}),(0,b.jsx)(V,{x:120,y:128,texto:`túnel + conduto forçado`}),(0,b.jsx)(V,{x:452,y:200,texto:`casa de força afastada`,ancora:`end`}),(0,b.jsx)(`path`,{d:`M300 210 L268 128`,stroke:`#8fb8d6`,strokeWidth:`1.2`,opacity:`0.9`}),(0,b.jsx)(V,{x:150,y:218,texto:`trecho de vazão reduzida (TVR) no leito natural`,cor:`#a9c6bb`})]})}function Se(){let e=e=>(0,b.jsxs)(`g`,{children:[(0,b.jsx)(`rect`,{x:e,y:`38`,width:`212`,height:`196`,rx:`10`,fill:`#0f2119`,opacity:`0.35`}),(0,b.jsx)(`rect`,{x:e,y:`38`,width:`212`,height:`196`,rx:`10`,fill:`none`,stroke:`#5d7a6c`,strokeWidth:`1.2`})]});return(0,b.jsxs)(`svg`,{viewBox:`0 0 460 240`,className:`arr-svg`,role:`img`,"aria-label":`Comparação entre fio d'água e acumulação`,children:[(0,b.jsx)(B,{p:`fa`}),(0,b.jsx)(`rect`,{width:`460`,height:`240`,fill:`url(#fa-ceu)`}),e(8),e(240),(0,b.jsx)(`path`,{d:`M18 200 L214 200 L214 158 L18 158 Z`,fill:`url(#fa-rocha)`}),(0,b.jsx)(`path`,{d:`M20 152 L112 152 L112 134 L20 134 Z`,fill:`url(#fa-agua)`}),(0,b.jsx)(`rect`,{x:`20`,y:`134`,width:`92`,height:`3.5`,fill:`#dff2ff`,opacity:`0.45`}),(0,b.jsx)(`path`,{d:`M112 134 L112 190 L140 190 L132 134 Z`,fill:`url(#fa-concreto)`}),(0,b.jsx)(`path`,{d:`M138 174 L156 166 L174 174 L174 179 L156 170 L138 179 Z`,fill:`#93a29a`}),(0,b.jsx)(`rect`,{x:`140`,y:`177`,width:`34`,height:`18`,fill:`#e9ece6`,stroke:`#7d867f`,strokeWidth:`1.1`}),(0,b.jsx)(`path`,{d:`M174 186 L212 186`,stroke:`#2b5e7f`,strokeWidth:`11`,strokeLinecap:`round`}),(0,b.jsx)(`path`,{d:`M174 186 L212 186`,stroke:`url(#fa-agua)`,strokeWidth:`8`,strokeLinecap:`round`}),(0,b.jsx)(O,{className:`arr-fluxo`,dash:[10,14],duration:1.15,d:`M178 186 L208 186`,stroke:`#eaf7ff`,strokeWidth:`2.6`,strokeLinecap:`round`,fill:`none`}),(0,b.jsx)(`path`,{d:`M250 210 L446 210 L446 168 L250 168 Z`,fill:`url(#fa-rocha)`}),(0,b.jsx)(`path`,{d:`M252 150 L362 168 L362 110 L252 110 Z`,fill:`url(#fa-agua)`}),(0,b.jsx)(`rect`,{x:`252`,y:`110`,width:`110`,height:`4`,fill:`#dff2ff`,opacity:`0.5`}),(0,b.jsx)(`path`,{className:`hcm-accumulation-band`,d:`M252 132 L362 132`,stroke:`#ffc94f`,strokeWidth:`1.6`,strokeDasharray:`5 4`,opacity:`0.95`}),(0,b.jsx)(`path`,{d:`M362 104 L362 200 L396 200 L384 104 Z`,fill:`url(#fa-concreto)`}),(0,b.jsx)(`path`,{d:`M392 184 L410 176 L428 184 L428 189 L410 180 L392 189 Z`,fill:`#93a29a`}),(0,b.jsx)(`rect`,{x:`394`,y:`187`,width:`34`,height:`18`,fill:`#e9ece6`,stroke:`#7d867f`,strokeWidth:`1.1`}),(0,b.jsx)(`path`,{d:`M428 196 L450 196`,stroke:`#2b5e7f`,strokeWidth:`11`,strokeLinecap:`round`}),(0,b.jsx)(`path`,{d:`M428 196 L450 196`,stroke:`url(#fa-agua)`,strokeWidth:`8`,strokeLinecap:`round`}),(0,b.jsx)(O,{className:`arr-fluxo`,dash:[10,14],duration:1.6,d:`M430 196 L448 196`,stroke:`#eaf7ff`,strokeWidth:`2.6`,strokeLinecap:`round`,fill:`none`}),(0,b.jsx)(V,{x:20,y:62,texto:`FIO D'ÁGUA`,cor:`#bfe6ff`}),(0,b.jsx)(V,{x:20,y:84,texto:`reservatório mínimo`,cor:`#cfe0d6`,pequena:!0}),(0,b.jsx)(V,{x:20,y:210,texto:`gera conforme o rio`,cor:`#a9c6bb`,pequena:!0}),(0,b.jsx)(V,{x:20,y:228,texto:`alagamento menor`,cor:`#a9c6bb`,pequena:!0}),(0,b.jsx)(V,{x:252,y:62,texto:`ACUMULAÇÃO`,cor:`#5ff2cd`}),(0,b.jsx)(V,{x:252,y:84,texto:`estoca entre estações`,cor:`#cfe0d6`,pequena:!0}),(0,b.jsx)(V,{x:252,y:210,texto:`regulariza e firma energia`,cor:`#a9c6bb`,pequena:!0}),(0,b.jsx)(V,{x:252,y:228,texto:`deplecionamento (faixa)`,cor:`#ffc94f`,pequena:!0})]})}var U=Object.freeze([{id:`pe-barragem`,label:`Pé de barragem`,Svg:be,caption:`A queda vem só do barramento. O circuito é curto, a casa de força fica ao pé e a água retorna imediatamente ao rio.`,parts:[[`Reservatório`,`Mantém a água a montante da barragem.`],[`Barragem e tomada`,`Criam o desnível e conduzem a água ao circuito hidráulico.`],[`Casa de força`,`Abriga turbina, eixo e gerador junto ao pé da barragem.`],[`Restituição`,`Devolve a água ao rio logo depois da geração.`]]},{id:`derivacao`,label:`Derivação`,Svg:xe,caption:`Um circuito longo aproveita a queda do relevo, como na UHE Parigot de Souza. Parte do leito natural forma o trecho de vazão reduzida.`,parts:[[`Açude e tomada`,`Desviam parte da vazão do leito natural.`],[`Túnel e conduto forçado`,`Transportam a água até a casa de força afastada.`],[`Chaminé de equilíbrio`,`Amortece variações de pressão no circuito.`],[`TVR e restituição`,`O leito recebe vazão reduzida até a água retornar depois da usina.`]]},{id:`regularizacao`,label:`Fio d’água × acumulação`,Svg:Se,caption:`No fio d’água, a geração acompanha mais de perto a vazão afluente. Na acumulação, o reservatório permite regularização; área e volume influenciam operação e impactos, mas não os definem sozinhos.`,parts:[[`Fio d’água`,`Tem reservatório mínimo e menor capacidade de regularização sazonal.`],[`Acumulação`,`Armazena água entre períodos e ajuda a firmar a geração.`],[`Faixa de deplecionamento`,`Indica a variação operacional do nível no reservatório.`],[`Casas de força`,`Convertem a energia hidráulica e restituem a água a jusante.`]]}]);function Ce(){let e=E(),[t,n]=(0,y.useState)(U[0].id),r=(0,y.useId)().replace(/:/g,``),i=U.find(e=>e.id===t)||U[0];return(0,b.jsxs)(`section`,{ref:e.sceneRef,className:`hydro-motion-surface hcm-arrangements`,style:e.surfaceStyle,"data-motion-state":e.motionActive?`running`:`paused`,"data-playing":e.playing?`true`:`false`,"aria-label":`Esquemas de arranjos hidrelétricos`,children:[(0,b.jsx)(D,{motion:e,context:`Animação do arranjo`}),(0,b.jsx)(`p`,{className:`sr-only`,children:`Área e volume do reservatório influenciam a operação e os impactos, mas não os definem sozinhos.`}),(0,b.jsx)(`div`,{className:`hcm-tabs hcm-arrangement-tabs`,role:`tablist`,"aria-label":`Tipo de arranjo`,onKeyDown:k,children:U.map(e=>{let t=e.id===i.id;return(0,b.jsx)(`button`,{type:`button`,id:`${r}-tab-${e.id}`,role:`tab`,"aria-selected":t,"aria-controls":`${r}-panel`,tabIndex:t?0:-1,className:t?`active`:``,onClick:()=>n(e.id),children:e.label},e.id)})}),(0,b.jsxs)(`div`,{id:`${r}-panel`,role:`tabpanel`,"aria-labelledby":`${r}-tab-${i.id}`,className:`hcm-arrangement-panel`,children:[(0,b.jsxs)(`p`,{className:`hcm-current-state`,children:[(0,b.jsxs)(`strong`,{children:[`Em exibição: `,i.label,`.`]}),` As linhas pontilhadas mostram o caminho e a velocidade relativa da água.`]}),(0,b.jsx)(`p`,{className:`hcm-mobile-scroll-hint`,children:`Deslize o diagrama para ler os rótulos sem reduzir o texto.`}),(0,b.jsx)(`div`,{className:`arr-grid hcm-arrangement-stage`,children:(0,b.jsxs)(`figure`,{children:[(0,b.jsx)(`div`,{className:`hcm-arrangement-canvas`,children:(0,b.jsx)(i.Svg,{})}),(0,b.jsx)(`figcaption`,{children:i.caption})]})}),(0,b.jsxs)(`section`,{className:`hcm-equipment-key`,"aria-label":`Componentes do arranjo ${i.label}`,children:[(0,b.jsx)(`h3`,{children:`Como identificar o arranjo`}),(0,b.jsx)(`ol`,{children:i.parts.map(([e,t],n)=>(0,b.jsxs)(`li`,{children:[(0,b.jsx)(`span`,{"aria-hidden":`true`,children:n+1}),(0,b.jsxs)(`p`,{children:[(0,b.jsx)(`strong`,{children:e}),t]})]},e))})]})]})]})}var we=`.hec-shell {
  --hec-cyan: #74dcff;
  --hec-water: #48bde6;
  --hec-green: #59e2ad;
  --hec-amber: #ffc768;
  margin: 0;
  overflow: hidden;
  border: 1px solid rgba(170, 221, 211, 0.3);
  border-radius: var(--raio-4);
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
  border-radius: var(--raio-3);
  background: rgba(72, 189, 230, 0.12);
  color: var(--hec-cyan);
}

.hec-heading svg {
  width: 21px;
}

.hec-heading h2 {
  margin: 0 0 2px;
  color: #fff;
  font-size:clamp(17px, 1.5vw, 21px);
  line-height: 1.2;
  letter-spacing: -0.015em;
}

.hec-heading p {
  margin: 0;
  color: #a9c5c4;
  font-size:var(--texto-2);
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
  font-size:var(--texto-1);
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
  border-radius: var(--raio-2);
  background: rgba(27, 99, 81, 0.42);
  color: #ebfff8;
  font: inherit;
  font-size:var(--texto-2);
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
  font-size:var(--texto-1);
  font-weight: 700;
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
  border-radius: var(--raio-2);
  background: rgba(3, 23, 27, 0.82);
  color: #fff;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  font: inherit;
  font-size:clamp(14px, 0.78vw, 15px);
  font-weight:800;
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
  font-size:var(--texto-2);
  font-weight: 800;
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
  border-radius: var(--raio-2);
  background: rgba(4, 22, 26, 0.86);
  color: #f0fbf9;
  font-size:var(--texto-3);
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
  border-radius: var(--raio-2);
  background: rgba(4, 22, 26, 0.82);
  color: #e9f6f4;
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.24);
  font-size:var(--texto-1);
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
  font-size:var(--texto-3);
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
  border-radius: var(--raio-2);
  background: rgba(255, 255, 255, 0.035);
  color: #c3d5d4;
  font: inherit;
  font-size:var(--texto-1);
  font-weight:700;
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
  font-size:var(--texto-1);
  font-weight: 800;
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
  border-radius: var(--raio-2);
  background: rgba(255, 255, 255, 0.035);
  color: #a9c0c0;
  font: inherit;
  font-size:var(--texto-1);
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
  font-size:var(--texto-1);
}

.hec-stage-panel {
  position: relative;
  min-height: 68px;
  gap: 12px;
  overflow: hidden;
  padding: 10px 11px 13px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--raio-2);
  background: rgba(255, 255, 255, 0.035);
}

.hec-stage-panel > span {
  color: rgba(116, 220, 255, 0.5);
  font-size:var(--titulo-3);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.06em;
}

.hec-stage-panel strong {
  display: block;
  color: #f5fffc;
  font-size:var(--texto-2);
}

.hec-stage-panel p {
  margin: 3px 0 0;
  color: #afc4c4;
  font-size:var(--texto-3);
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
  font-size:var(--texto-3);
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
    font-size:var(--texto-1);
  }

  .hec-callout {
    min-height: 40px;
    padding: 4px;
    border-radius: var(--raio-1);
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
    border-radius: var(--raio-3);
  }

  .hec-heading > span {
    width: 34px;
    height: 34px;
    flex-basis: 34px;
  }

  .hec-heading h2 {
    font-size:var(--texto-4);
  }

  .hec-heading p {
    font-size:var(--texto-1);
  }

  .hec-play {
    min-width: 96px;
  }

  .hec-layer-status {
    align-items: flex-start;
    flex-direction: column;
    font-size:var(--texto-1);
  }

  .hec-equipment-key ol {
    gap: 4px;
  }

  .hec-equipment-key button {
    padding: 4px 5px;
    font-size:var(--texto-3);
  }

  .hec-callout {
    max-width: 105px;
    font-size:var(--texto-1);
  }

  .hec-stage-panel > span {
    font-size:var(--titulo-1);
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
`,Te=`/academia-iat/`.replace(/\/$/,``),W=`M322 315 C405 318 448 355 487 433 C548 556 629 703 797 750`,G=`M850 787 C934 852 1085 829 1328 774`,K=`M925 357 C1017 347 1064 338 1130 336 C1260 330 1337 234 1410 125`,q=Object.freeze([{id:`captacao`,label:`Captação`,component:`Reservatório e tomada d’água`,description:`A água alcança a tomada protegida por grades. As comportas permitem isolar o circuito para inspeção e manutenção.`,x:20,y:33,labelX:10.5,labelY:23,focusEquipmentId:`tomada`},{id:`aducao`,label:`Adução`,component:`Conduto forçado`,description:`O conduto leva a água sob pressão até a unidade geradora. O traçado e as perdas hidráulicas influenciam a energia disponível.`,x:36,y:57,labelX:23,labelY:55,focusEquipmentId:`conduto`},{id:`turbina`,label:`Rotação`,component:`Turbina`,description:`O escoamento transfere energia ao rotor da turbina. A seleção da máquina depende, entre outros fatores, da queda e da faixa de vazões.`,x:53.5,y:81,labelX:42.5,labelY:87,focusEquipmentId:`turbina`},{id:`eixo`,label:`Transmissão mecânica`,component:`Eixo`,description:`O eixo transmite a rotação da turbina ao rotor do gerador, mantendo os dois equipamentos mecanicamente acoplados.`,x:53.5,y:62,labelX:64,labelY:61,focusEquipmentId:`eixo`},{id:`gerador`,label:`Geração`,component:`Gerador`,description:`A rotação do conjunto produz energia elétrica no gerador por indução eletromagnética.`,x:53.5,y:39,labelX:43,labelY:31,focusEquipmentId:`gerador`},{id:`transformacao`,label:`Transformação`,component:`Transformador`,description:`O transformador adequa a tensão elétrica às condições definidas para a conexão do empreendimento.`,x:75,y:38,labelX:83,labelY:48,focusEquipmentId:`transformador`},{id:`rede`,label:`Conexão`,component:`Subestação e linhas`,description:`Equipamentos de manobra e proteção conduzem a energia ao ponto de conexão, em rede de distribuição ou transmissão conforme o acesso definido para o empreendimento.`,x:88,y:16,labelX:78.5,labelY:13,focusEquipmentId:`subestacao`},{id:`restituicao`,label:`Restituição`,component:`Canal de fuga`,description:`Depois de atravessar a turbina, a água segue pelo tubo de sucção e retorna ao rio a jusante pelo canal de fuga.`,x:74,y:87,labelX:82,labelY:85,focusEquipmentId:`canal-fuga`}]),J=Object.freeze([{id:`reservatorio`,name:`Reservatório a montante`,stageId:`captacao`,x:8,y:29,labelX:7,labelY:15,description:`Armazena água a montante e mantém o desnível que fornece energia potencial ao aproveitamento.`},{id:`barragem`,name:`Barragem`,stageId:`captacao`,x:30,y:32,labelX:30,labelY:16,description:`Barra o curso d’água, eleva o nível a montante e contribui para formar a queda aproveitada pela usina.`},{id:`vertedouro`,name:`Vertedouro (via de cheia)`,stageId:`captacao`,x:34,y:36,labelX:38,labelY:45,description:`Conduz com segurança a água excedente das cheias sem passar pela turbina e ajuda a evitar o galgamento da barragem.`},{id:`grade`,name:`Grade de proteção`,stageId:`captacao`,x:18.5,y:26,labelX:8.5,labelY:30,description:`Retém detritos antes da tomada e protege o circuito hidráulico e a turbina.`},{id:`comporta`,name:`Comporta`,stageId:`captacao`,x:20,y:30.5,labelX:9.5,labelY:38,description:`Controla a passagem e permite isolar a tomada e o conduto para inspeção ou manutenção.`},{id:`tomada`,name:`Tomada d’água`,stageId:`captacao`,x:20.5,y:35,labelX:11.5,labelY:46,description:`Capta a água do reservatório e a direciona para o circuito de adução.`},{id:`conduto`,name:`Conduto forçado`,stageId:`aducao`,x:36,y:58,labelX:23,labelY:58,description:`Conduz a água sob pressão até a turbina; seu traçado e suas perdas influenciam a queda líquida disponível.`},{id:`casa-forca`,name:`Casa de força`,stageId:`gerador`,x:47,y:27,labelX:42,labelY:19,description:`Abriga as unidades geradoras, os sistemas auxiliares e os espaços necessários à operação e à manutenção.`},{id:`ponte-rolante`,name:`Ponte rolante`,stageId:`gerador`,x:55,y:22,labelX:63,labelY:18,description:`Movimenta componentes pesados da unidade geradora durante montagem, inspeção e manutenção.`},{id:`gerador`,name:`Gerador`,stageId:`gerador`,x:53.5,y:39,labelX:43,labelY:35,description:`Converte a rotação transmitida pelo eixo em energia elétrica por indução eletromagnética.`},{id:`eixo`,name:`Eixo`,stageId:`eixo`,x:53.5,y:62,labelX:64,labelY:59,description:`Acopla mecanicamente turbina e gerador e transmite o torque entre os dois equipamentos.`},{id:`turbina`,name:`Turbina / rotor`,stageId:`turbina`,x:53.5,y:78,labelX:43,labelY:82,description:`Recebe a energia do escoamento e a transforma em rotação mecânica.`},{id:`tubo-succao`,name:`Tubo de sucção`,stageId:`restituicao`,x:55,y:87,labelX:63,labelY:91,description:`Conduz a água que deixa a turbina, recupera parte da energia do escoamento e amplia a seção até a restituição.`},{id:`canal-fuga`,name:`Canal de fuga`,stageId:`restituicao`,x:70,y:87,labelX:81,labelY:85,description:`Devolve ao rio, a jusante, a água que atravessou a unidade geradora.`},{id:`transformador`,name:`Transformador`,stageId:`transformacao`,x:75,y:40,labelX:83,labelY:48,description:`Adequa a tensão produzida pelo gerador às condições definidas para a conexão elétrica.`},{id:`subestacao`,name:`Subestação`,stageId:`rede`,x:77,y:29,labelX:86.5,labelY:34,description:`Reúne equipamentos de manobra, proteção e medição que encaminham a energia ao ponto de conexão.`},{id:`linhas`,name:`Linhas de transmissão`,stageId:`rede`,x:88,y:14,labelX:82.5,labelY:11,description:`Transportam a energia da subestação até a rede de distribuição ou transmissão definida para o empreendimento.`}]);function Ee(){let[e,t]=(0,y.useState)(!1);return(0,y.useEffect)(()=>{if(typeof window>`u`||typeof window.matchMedia!=`function`)return;let e=window.matchMedia(`(prefers-reduced-motion: reduce)`),n=()=>t(e.matches);return n(),e.addEventListener?.(`change`,n),()=>e.removeEventListener?.(`change`,n)},[]),e}function De(e){let[t,n]=(0,y.useState)(!0);return(0,y.useEffect)(()=>{if(typeof IntersectionObserver!=`function`||!e.current)return;let t=new IntersectionObserver(([e])=>n(e.isIntersecting),{rootMargin:`120px 0px`,threshold:.05});return t.observe(e.current),()=>t.disconnect()},[e]),t}function Oe({activeId:e,focusPoint:t,idPrefix:n}){let r=[`captacao`,`aducao`,`turbina`,`restituicao`].includes(e),i=[`turbina`,`eixo`,`gerador`].includes(e),a=[`gerador`,`transformacao`,`rede`].includes(e),o=`${n}-water-glow`,s=`${n}-energy-glow`,c=`${n}-rotor-glow`;return(0,b.jsxs)(`svg`,{className:`hec-overlay`,viewBox:`0 0 1600 900`,"aria-hidden":`true`,children:[(0,b.jsxs)(`defs`,{children:[(0,b.jsxs)(`filter`,{id:o,x:`-40%`,y:`-40%`,width:`180%`,height:`180%`,children:[(0,b.jsx)(`feGaussianBlur`,{stdDeviation:`5`,result:`blur`}),(0,b.jsxs)(`feMerge`,{children:[(0,b.jsx)(`feMergeNode`,{in:`blur`}),(0,b.jsx)(`feMergeNode`,{in:`SourceGraphic`})]})]}),(0,b.jsxs)(`filter`,{id:s,x:`-50%`,y:`-50%`,width:`200%`,height:`200%`,children:[(0,b.jsx)(`feGaussianBlur`,{stdDeviation:`4`,result:`blur`}),(0,b.jsxs)(`feMerge`,{children:[(0,b.jsx)(`feMergeNode`,{in:`blur`}),(0,b.jsx)(`feMergeNode`,{in:`SourceGraphic`})]})]}),(0,b.jsxs)(`radialGradient`,{id:c,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#d9fff5`,stopOpacity:`.95`}),(0,b.jsx)(`stop`,{offset:`.5`,stopColor:`#56e2b0`,stopOpacity:`.52`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#56e2b0`,stopOpacity:`0`})]})]}),(0,b.jsxs)(`g`,{className:`hec-water-system${r?` is-active`:``}`,"data-motion-layer":`agua`,children:[(0,b.jsxs)(`g`,{className:`hec-reservoir-motion`,children:[(0,b.jsx)(`path`,{d:`M36 281 Q100 264 164 281 T292 281`}),(0,b.jsx)(`path`,{d:`M55 302 Q115 286 175 302 T295 302`}),(0,b.jsx)(`path`,{d:`M82 323 Q132 310 182 323 T282 323`})]}),(0,b.jsx)(`path`,{className:`hec-water-aura`,d:W,style:{filter:`url(#${o})`}}),(0,b.jsx)(`path`,{className:`hec-water-flow`,d:W,style:{filter:`url(#${o})`}}),(0,b.jsx)(`path`,{className:`hec-water-packets`,d:W,style:{filter:`url(#${o})`}}),(0,b.jsx)(`path`,{className:`hec-tailrace-aura`,d:G,style:{filter:`url(#${o})`}}),(0,b.jsx)(`path`,{className:`hec-tailrace-flow`,d:G,style:{filter:`url(#${o})`}}),(0,b.jsx)(`path`,{className:`hec-tailrace-packets`,d:G,style:{filter:`url(#${o})`}})]}),(0,b.jsxs)(`g`,{className:`hec-machine-system${i?` is-active`:``}`,children:[(0,b.jsxs)(`g`,{"data-motion-layer":`eixo`,className:`hec-shaft-system`,children:[(0,b.jsx)(`path`,{className:`hec-shaft-light`,d:`M855 362 L855 696`,style:{filter:`url(#${o})`}}),(0,b.jsx)(`path`,{className:`hec-shaft-helix`,d:`M840 414 Q855 398 870 414 T840 446 T870 478 T840 510 T870 542 T840 574 T870 606 T840 638 T870 670`}),[430,500,570,640].map(e=>(0,b.jsx)(`ellipse`,{className:`hec-shaft-coupling`,cx:`855`,cy:e,rx:`20`,ry:`7`},e))]}),(0,b.jsxs)(`g`,{"data-motion-layer":`turbina`,className:`hec-runner-wrap`,children:[(0,b.jsxs)(`g`,{className:`hec-runner`,style:{transformOrigin:`855px 733px`},children:[(0,b.jsx)(`circle`,{cx:`855`,cy:`733`,r:`52`,fill:`url(#${c})`}),(0,b.jsx)(`circle`,{cx:`855`,cy:`733`,r:`29`,className:`hec-runner-ring`}),[0,60,120,180,240,300].map(e=>(0,b.jsx)(`path`,{d:`M855 703 C875 709 884 720 886 733 C871 726 860 727 855 733 Z`,className:`hec-runner-blade`,transform:`rotate(${e} 855 733)`},e))]}),(0,b.jsx)(`circle`,{className:`hec-runner-orbit`,cx:`855`,cy:`733`,r:`58`})]}),(0,b.jsxs)(`g`,{"data-motion-layer":`gerador`,className:`hec-generator-system`,children:[(0,b.jsxs)(`g`,{className:`hec-generator-field`,style:{transformOrigin:`855px 365px`},children:[(0,b.jsx)(`ellipse`,{cx:`855`,cy:`365`,rx:`63`,ry:`24`}),(0,b.jsx)(`ellipse`,{cx:`855`,cy:`365`,rx:`86`,ry:`34`}),(0,b.jsx)(`path`,{d:`M773 365 C796 327 914 327 937 365`}),(0,b.jsx)(`path`,{d:`M773 365 C796 403 914 403 937 365`})]}),(0,b.jsx)(`circle`,{className:`hec-generator-core`,cx:`855`,cy:`365`,r:`24`})]})]}),(0,b.jsxs)(`g`,{className:`hec-electric-system${a?` is-active`:``}`,"data-motion-layer":`energia`,children:[(0,b.jsx)(`path`,{className:`hec-energy-aura`,d:K,style:{filter:`url(#${s})`}}),(0,b.jsx)(`path`,{className:`hec-energy-flow`,d:K,style:{filter:`url(#${s})`}}),(0,b.jsx)(`path`,{className:`hec-energy-packets`,d:K,style:{filter:`url(#${s})`}}),(0,b.jsxs)(`g`,{className:`hec-transformer-pulse`,style:{filter:`url(#${s})`},children:[(0,b.jsx)(`path`,{d:`M1160 312 q20 -20 40 0 t40 0`}),(0,b.jsx)(`path`,{d:`M1154 325 q24 -25 48 0 t48 0`})]})]}),(0,b.jsxs)(`g`,{className:`hec-stage-focus`,"data-focus-equipment":t.id,transform:`translate(${t.x*16} ${t.y*9})`,children:[(0,b.jsx)(`circle`,{className:`hec-stage-focus__pulse`,r:`43`}),(0,b.jsx)(`circle`,{className:`hec-stage-focus__ring`,r:`22`}),(0,b.jsx)(`path`,{d:`M-31 0 H-20 M20 0 H31 M0 -31 V-20 M0 20 V31`})]})]})}function ke({activeId:e,selectedEquipmentId:t}){return(0,b.jsx)(`svg`,{className:`hec-leaders`,viewBox:`0 0 1600 900`,"aria-hidden":`true`,children:J.map(n=>(0,b.jsxs)(`g`,{"data-active":n.stageId===e?`true`:`false`,"data-selected":n.id===t?`true`:`false`,children:[(0,b.jsx)(`line`,{className:`hec-leader`,x1:n.x*16,y1:n.y*9,x2:n.labelX*16,y2:n.labelY*9,vectorEffect:`non-scaling-stroke`}),(0,b.jsx)(`circle`,{className:`hec-leader__anchor`,cx:n.x*16,cy:n.y*9,r:`7`}),(0,b.jsx)(`circle`,{className:`hec-leader__core`,cx:n.x*16,cy:n.y*9,r:`3`})]},n.id))})}function Ae(){let e=Ee(),n=(0,y.useRef)(null),r=De(n),i=`hec-${(0,y.useId)().replace(/:/g,``)}`,a=`${i}-title`,o=`${i}-description`,s=`${i}-layer-description`,c=`${i}-flow-control`,l=`${i}-flow-note`,u=`${i}-stage-panel`,d=`${i}-equipment-description`,f=`${i}-stage-description`,p=e=>`${i}-tab-${e}`,[h,v]=(0,y.useState)({stageId:q[0].id,equipmentId:q[0].focusEquipmentId}),[ee,x]=(0,y.useState)(!0),[S,C]=(0,y.useState)(!0),[w,T]=(0,y.useState)(72),E=h.stageId,D=h.equipmentId,O=q.findIndex(e=>e.id===E),k=q[O]||q[0],A=J.find(({id:e})=>e===D)||J[0],j=ee&&!e&&r,M=j&&S;(0,y.useEffect)(()=>{e&&x(!1)},[e]),(0,y.useEffect)(()=>{if(!M)return;let e=window.setInterval(()=>{v(e=>{let t=q[(q.findIndex(t=>t.id===e.stageId)+1)%q.length];return{stageId:t.id,equipmentId:t.focusEquipmentId}})},3600);return()=>window.clearInterval(e)},[M]);let N=e=>{let t=q.find(t=>t.id===e)||q[0];v({stageId:t.id,equipmentId:t.focusEquipmentId}),x(!1)},P=e=>{v({stageId:e.stageId,equipmentId:e.id}),x(!1)},F=e=>{if(![`ArrowLeft`,`ArrowRight`,`Home`,`End`].includes(e.key))return;let t=[...e.currentTarget.querySelectorAll(`[role="tab"]`)],n=t.indexOf(document.activeElement);if(n<0)return;e.preventDefault();let r=n;e.key===`Home`&&(r=0),e.key===`End`&&(r=t.length-1),e.key===`ArrowLeft`&&(r=(n-1+t.length)%t.length),e.key===`ArrowRight`&&(r=(n+1)%t.length),t[r].focus(),N(t[r].dataset.stageId)},I=Math.max(.72,2.55-w*.017),te={"--hec-flow-duration":`${I}s`,"--hec-machine-duration":`${Math.max(.78,I*.92)}s`,"--hec-energy-duration":`${Math.max(.6,I*.72)}s`,"--hec-flow-strength":`${.42+w/150}`},L=e?`Movimento reduzido ativo`:j?`Animação em movimento`:`Animação pausada`;return(0,b.jsxs)(`figure`,{className:`hec-shell`,style:te,"data-playing":j?`true`:`false`,"data-tour-active":M?`true`:`false`,"data-motion-preference":e?`reduced`:`full`,"aria-labelledby":a,"aria-describedby":`${o} ${s}`,onPointerDown:()=>C(!1),onFocusCapture:()=>C(!1),children:[(0,b.jsx)(`style`,{children:we}),(0,b.jsxs)(`header`,{className:`hec-toolbar`,children:[(0,b.jsxs)(`div`,{className:`hec-heading`,children:[(0,b.jsx)(`span`,{"aria-hidden":`true`,children:(0,b.jsx)(_,{})}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`h2`,{id:a,children:`Funcionamento e anatomia de uma usina hidrelétrica`}),(0,b.jsx)(`p`,{children:`Acompanhe o percurso da água à rede e selecione cada equipamento para entender sua função no conjunto.`})]})]}),(0,b.jsxs)(`div`,{className:`hec-controls`,children:[(0,b.jsxs)(`label`,{className:`hec-flow-control`,htmlFor:c,children:[(0,b.jsxs)(`span`,{children:[`Velocidade do fluxo `,(0,b.jsxs)(`strong`,{children:[w,`%`]})]}),(0,b.jsx)(`input`,{id:c,type:`range`,min:`35`,max:`100`,value:w,onChange:e=>T(Number(e.target.value)),"aria-valuetext":`${w}% da velocidade visual`,"aria-describedby":l})]}),(0,b.jsxs)(`button`,{type:`button`,className:`hec-play`,onClick:()=>{C(!0),x(e=>!e)},disabled:e,"aria-pressed":j,"aria-label":j?`Pausar animação didática`:`Reproduzir animação didática`,children:[j?(0,b.jsx)(t,{"aria-hidden":`true`}):(0,b.jsx)(m,{"aria-hidden":`true`}),(0,b.jsx)(`span`,{children:j?`Pausar`:`Reproduzir`})]})]})]}),(0,b.jsx)(`p`,{id:o,className:`hec-visually-hidden`,children:`Corte interativo que reúne funcionamento e anatomia de uma usina: a água sai do reservatório, atravessa a tomada e o conduto forçado, movimenta a turbina e o eixo, aciona o gerador, retorna ao rio e a energia segue pelo transformador e pela subestação até o ponto de conexão em rede de distribuição ou transmissão.`}),(0,b.jsxs)(`div`,{className:`hec-layer-status`,id:s,children:[(0,b.jsxs)(`span`,{children:[(0,b.jsx)(`i`,{className:`hec-layer-status__static`,"aria-hidden":`true`}),`Base ilustrada estática`]}),(0,b.jsxs)(`span`,{children:[(0,b.jsx)(`i`,{className:`hec-layer-status__motion`,"aria-hidden":`true`}),`Água, turbina, eixo, gerador e energia animados`]})]}),(0,b.jsxs)(`div`,{className:`hec-scene`,"data-stage":E,ref:n,children:[(0,b.jsx)(`img`,{className:`hec-static-base`,"data-visual-layer":`base-estatica`,src:`${Te}/hidro/usina-corte-realista.webp`,alt:``,"aria-hidden":`true`,width:`1600`,height:`900`,loading:`eager`,fetchPriority:`high`,decoding:`async`}),(0,b.jsx)(Oe,{activeId:E,focusPoint:A,idPrefix:i}),(0,b.jsx)(ke,{activeId:E,selectedEquipmentId:D}),(0,b.jsxs)(`div`,{className:`hec-playback-status`,role:`status`,"aria-live":`polite`,children:[(0,b.jsx)(`i`,{"aria-hidden":`true`}),L]}),(0,b.jsx)(`div`,{className:`hec-callouts`,"aria-label":`Equipamentos identificados no corte técnico`,children:J.map((e,t)=>(0,b.jsxs)(`button`,{type:`button`,className:`hec-callout`,style:{"--hec-label-x":`${e.labelX}%`,"--hec-label-y":`${e.labelY}%`},"aria-label":`Localizar ${e.name}`,"aria-pressed":e.id===D,"aria-controls":u,"data-stage-active":e.stageId===E?`true`:`false`,onClick:()=>P(e),children:[(0,b.jsx)(`span`,{className:`hec-callout__number`,"aria-hidden":`true`,children:t+1}),(0,b.jsx)(`span`,{className:`hec-callout__label`,children:e.name})]},e.id))}),(0,b.jsxs)(`div`,{className:`hec-conversion`,"aria-hidden":`true`,children:[(0,b.jsxs)(`span`,{children:[(0,b.jsx)(_,{}),` água`]}),(0,b.jsx)(`i`,{}),(0,b.jsx)(`span`,{children:`rotação`}),(0,b.jsx)(`i`,{}),(0,b.jsxs)(`span`,{children:[(0,b.jsx)(g,{}),` energia`]})]})]}),(0,b.jsxs)(`nav`,{className:`hec-equipment-key`,"aria-label":`Legenda dos equipamentos`,children:[(0,b.jsx)(`p`,{children:`Equipamentos: toque para localizar`}),(0,b.jsx)(`ol`,{children:J.map((e,t)=>(0,b.jsx)(`li`,{children:(0,b.jsxs)(`button`,{type:`button`,"aria-pressed":e.id===D,"aria-controls":u,"data-stage-active":e.stageId===E?`true`:`false`,onClick:()=>P(e),children:[(0,b.jsx)(`span`,{"aria-hidden":`true`,children:t+1}),e.name]})},e.id))})]}),(0,b.jsxs)(`div`,{className:`hec-tour`,children:[(0,b.jsx)(`div`,{className:`hec-tabs`,role:`tablist`,"aria-label":`Etapas da geração`,onKeyDown:F,children:q.map((e,t)=>(0,b.jsxs)(`button`,{type:`button`,role:`tab`,id:p(e.id),"aria-selected":e.id===E,"aria-controls":u,tabIndex:e.id===E?0:-1,"data-stage-id":e.id,onClick:()=>N(e.id),children:[(0,b.jsx)(`span`,{children:t+1}),e.label]},e.id))}),(0,b.jsxs)(`div`,{id:u,className:`hec-stage-panel`,role:`tabpanel`,"aria-labelledby":p(k.id),"aria-describedby":`${d} ${f}`,"aria-live":M?`off`:`polite`,"aria-atomic":`true`,tabIndex:`0`,children:[(0,b.jsx)(`span`,{children:String(O+1).padStart(2,`0`)}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`strong`,{children:A.name}),(0,b.jsx)(`p`,{id:d,children:A.description}),(0,b.jsxs)(`p`,{id:f,children:[(0,b.jsxs)(`strong`,{children:[`Etapa `,k.label,`: `,k.component]}),k.description]})]}),(0,b.jsx)(`i`,{className:`hec-stage-progress`,"aria-hidden":`true`,children:(0,b.jsx)(`b`,{})})]}),(0,b.jsx)(`small`,{id:l,className:`hec-note`,children:`Representação didática, sem escala e sem vínculo com empreendimento específico. O controle altera somente a velocidade visual das camadas; não representa vazão ou desempenho de projeto.`})]})]})}var Y=Object.freeze([{id:`hydro-principio`,label:`Funcionamento`},{id:`hydro-potencia`,label:`Potência`},{id:`hydro-competencias`,label:`Competências`},{id:`hydro-tipologias`,label:`Tipologias`},{id:`hydro-operacao`,label:`Operação`},{id:`hydro-barramentos`,label:`Barramentos`},{id:`hydro-turbinas`,label:`Turbinas`},{id:`hydro-casos`,label:`Casos do Paraná`},{id:`hydro-arranjos`,label:`Arranjos`},{id:`hydro-licenciamento`,label:`Licenciamento`}]);function je(e){return Math.min(100,Math.max(0,Math.round(e)))}function Me(){return typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches}function Ne(){let e=(0,y.useRef)(null),[t,n]=(0,y.useState)(()=>!Me()),[r,i]=(0,y.useState)(1),[a,o]=(0,y.useState)(!0),[s,c]=(0,y.useState)(Me);return(0,y.useEffect)(()=>{if(typeof window>`u`||typeof window.matchMedia!=`function`)return;let e=window.matchMedia(`(prefers-reduced-motion: reduce)`),t=()=>c(e.matches);return t(),e.addEventListener?.(`change`,t),()=>e.removeEventListener?.(`change`,t)},[]),(0,y.useEffect)(()=>{let t=e.current;if(!t||typeof IntersectionObserver>`u`)return;let n=new IntersectionObserver(([e])=>o(e.isIntersecting),{rootMargin:`120px 0px`,threshold:.01});return n.observe(t),()=>n.disconnect()},[]),{stageRef:e,playing:t,setPlaying:n,speed:r,setSpeed:i,inView:a,reducedMotion:s,active:t&&a&&!s,style:{"--hydro-motion-scale":(1/r).toFixed(3)}}}function Pe({id:e,label:n,motion:r,activeDescription:i}){let a=i;return r.reducedMotion?a=`Movimento reduzido pelo dispositivo`:r.playing?r.inView||(a=`Pausada automaticamente fora da tela`):a=`Animação pausada`,(0,b.jsxs)(`div`,{className:`hydro-motion-controls`,"aria-label":`Controles da animação: ${n}`,children:[(0,b.jsxs)(`div`,{className:`hydro-motion-status`,role:`status`,"aria-live":`polite`,children:[(0,b.jsx)(`span`,{"aria-hidden":`true`}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`small`,{children:`Agora na cena`}),(0,b.jsx)(`strong`,{children:a})]})]}),(0,b.jsxs)(`button`,{type:`button`,className:`hydro-motion-toggle`,onClick:()=>r.setPlaying(e=>!e),"aria-pressed":r.playing,disabled:r.reducedMotion,children:[r.playing?(0,b.jsx)(t,{"aria-hidden":`true`}):(0,b.jsx)(m,{"aria-hidden":`true`}),r.playing?`Pausar`:`Reproduzir`]}),(0,b.jsxs)(`label`,{className:`hydro-motion-speed`,htmlFor:`${e}-speed`,children:[(0,b.jsxs)(`span`,{children:[`Velocidade `,(0,b.jsxs)(`strong`,{children:[r.speed.toFixed(2).replace(`.00`,``),`×`]})]}),(0,b.jsx)(`input`,{id:`${e}-speed`,type:`range`,min:`0.5`,max:`2`,step:`0.25`,value:r.speed,"aria-valuetext":`${r.speed.toFixed(2).replace(`.00`,``)} vezes a velocidade normal`,onChange:e=>r.setSpeed(Number(e.target.value)),disabled:r.reducedMotion})]})]})}function Fe({sections:e,scrollY:t=0,viewportHeight:n=0,activationOffset:r=0}){let i=e.filter(e=>Number.isFinite(e.top)&&Number.isFinite(e.bottom));if(!i.length)return{activeId:Y[0].id,progress:0};let a=t+r,o=i[0].id;for(let e of i){if(e.top>a)break;o=e.id}let s=i[0].top,c=Math.max(s+1,i.at(-1).bottom-n),l=je((a-s)/(c-s)*100);return{activeId:o,progress:l}}function Ie(){let e=getComputedStyle(document.documentElement).getPropertyValue(`--top`).trim();return Number.parseFloat(e)||74}var X=0,Z=null;function Le(e,t){let n=document.getElementById(e);if(!n)return;X&&window.cancelAnimationFrame(X),Z?.();let r=[...document.querySelectorAll(`.hydro-long-section`)],i=r.map(e=>[e,e.style.getPropertyValue(`content-visibility`)]),a=()=>{i.forEach(([e,t])=>{t?e.style.setProperty(`content-visibility`,t):e.style.removeProperty(`content-visibility`)}),Z===a&&(Z=null)};Z=a,r.forEach(e=>e.style.setProperty(`content-visibility`,`visible`)),document.documentElement.scrollHeight,n.scrollIntoView({block:`start`,inline:`nearest`,behavior:`auto`}),n.focus({preventScroll:!0});let o=120,s=0,c=0,l=()=>{X=0;let e=document.querySelector(`.hydro-guide-nav`),r=Ie()+(e?.offsetHeight||0)+10,i=n.getBoundingClientRect().top-r;if(Math.abs(i)>1){let e=window.scrollY||document.documentElement.scrollTop||0;window.scrollTo({top:Math.max(0,e+i),behavior:`auto`}),c=0}else c+=1;--o,s+=1,s===4&&a(),o>0&&(s<60||c<12)?X=window.requestAnimationFrame(l):(a(),t?.())};X=window.requestAnimationFrame(l)}function Re(){let e=(0,y.useRef)(null),t=(0,y.useRef)(null),n=(0,y.useRef)(()=>{}),[r,i]=(0,y.useState)({activeId:Y[0].id,progress:0});(0,y.useEffect)(()=>{let e=0,r=()=>{e=0;let n=window.scrollY||document.documentElement.scrollTop||0,r=Fe({sections:Y.map(({id:e})=>{let t=document.getElementById(e);if(!t)return{id:e,top:NaN,bottom:NaN};let r=t.getBoundingClientRect();return{id:e,top:r.top+n,bottom:r.bottom+n}}),scrollY:n,viewportHeight:window.innerHeight,activationOffset:Ie()+(document.querySelector(`.hydro-guide-nav`)?.offsetHeight||86)+10});t.current&&(r.activeId=t.current),i(e=>e.activeId===r.activeId&&e.progress===r.progress?e:r)},a=()=>{e||=window.requestAnimationFrame(r)};n.current=a;let o=()=>{t.current&&(t.current=null,a())},s=e=>{[`ArrowUp`,`ArrowDown`,`PageUp`,`PageDown`,`Home`,`End`,` `].includes(e.key)&&o()};return r(),window.addEventListener(`scroll`,a,{passive:!0}),window.addEventListener(`resize`,a),window.addEventListener(`wheel`,o,{passive:!0}),window.addEventListener(`touchstart`,o,{passive:!0}),window.addEventListener(`pointerdown`,o,{passive:!0}),window.addEventListener(`keydown`,s),()=>{window.removeEventListener(`scroll`,a),window.removeEventListener(`resize`,a),window.removeEventListener(`wheel`,o),window.removeEventListener(`touchstart`,o),window.removeEventListener(`pointerdown`,o),window.removeEventListener(`keydown`,s),e&&window.cancelAnimationFrame(e),n.current=()=>{}}},[]),(0,y.useEffect)(()=>{let t=e.current,n=t?.querySelector(`[data-hydro-nav-target="${r.activeId}"]`);if(!t||!n||typeof n.scrollIntoView!=`function`)return;let i=t.getBoundingClientRect(),a=n.getBoundingClientRect();if(!(a.left<i.left||a.right>i.right))return;let o=window.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches;n.scrollIntoView({block:`nearest`,inline:`center`,behavior:o?`auto`:`smooth`})},[r.activeId]);function a(e){if(![`ArrowLeft`,`ArrowRight`,`Home`,`End`].includes(e.key))return;let t=[...e.currentTarget.querySelectorAll(`[data-hydro-nav-target]`)],n=t.indexOf(document.activeElement);if(n<0)return;e.preventDefault();let r=n;e.key===`Home`&&(r=0),e.key===`End`&&(r=t.length-1),e.key===`ArrowLeft`&&(r=Math.max(0,n-1)),e.key===`ArrowRight`&&(r=Math.min(t.length-1,n+1)),t[r]?.focus()}return(0,b.jsxs)(`nav`,{className:`hydro-guide-nav`,"aria-label":`Seções deste guia`,onKeyDown:a,children:[(0,b.jsxs)(`div`,{className:`hydro-guide-nav__summary`,children:[(0,b.jsx)(`strong`,{children:`Neste guia`}),(0,b.jsxs)(`span`,{children:[r.progress,`% lido`]})]}),(0,b.jsx)(`div`,{className:`hydro-guide-nav__links`,ref:e,children:Y.map(e=>(0,b.jsx)(`button`,{type:`button`,"data-hydro-nav-target":e.id,"aria-current":r.activeId===e.id?`location`:void 0,onClick:()=>{t.current=e.id,i(t=>({...t,activeId:e.id})),Le(e.id,()=>{t.current===e.id&&n.current()})},children:e.label},e.id))}),(0,b.jsx)(`div`,{className:`hydro-guide-nav__progress`,role:`progressbar`,"aria-label":`Progresso de leitura deste guia`,"aria-valuemin":`0`,"aria-valuemax":`100`,"aria-valuenow":r.progress,children:(0,b.jsx)(`span`,{style:{width:`${r.progress}%`}})})]})}var ze=[{sigla:`MCH`,nome:`Microcentral Hidrelétrica`,faixa:`até 75 kW`,cor:`#7ec8a9`,nota:`Potência igual ou inferior a 75 kW. Confirmar potência, supressão, outorga, arranjo e intervenção em APP antes de definir entre DLAM, LAS ou outra modalidade. Erro recorrente: tratar como CGH sem verificar potência e características atuais.`},{sigla:`MGH`,nome:`Minigeradora Hidrelétrica`,faixa:`acima de 75 kW até 500 kW`,cor:`#37d39a`,nota:`Potência superior a 75 kW e até 500 kW. Confirmar IDA, supressão e alagamento para definir entre DLAM, LAC, LAS ou outra forma aplicável. Erro recorrente: aplicar licenciamento complexo sem avaliar o enquadramento.`},{sigla:`CGH`,nome:`Central Geradora Hidrelétrica`,faixa:`acima de 500 kW até 5 MW`,cor:`#2fb8c9`,nota:`Potência superior a 500 kW e até 5 MW. Confirmar se está abaixo ou acima de 1 MW, porque a Consulta Prévia é obrigatória a partir de 1 MW. Erro recorrente: exigir autorização ou concessão da ANEEL como se fosse PCH, sem verificar a regra setorial aplicável.`},{sigla:`PCH`,nome:`Pequena Central Hidrelétrica`,faixa:`acima de 5 MW até 30 MW`,cor:`#4cc4f5`,nota:`No eixo ambiental do IAT: potência superior a 5 MW e até 30 MW, com reservatório de até 3 km², ressalvada a exceção da IN. No eixo setorial, o art. 5º da REN ANEEL 875/2020, com redação da REN 1.070/2023, enquadra PCH pela faixa superior a 5 MW e até 30 MW, sem limite de área. A página geral Outorgas ainda cita 13 km², mas diverge do ato consolidado e da página operacional de 2026. Não misture os eixos e confirme o ato aplicável ao caso.`},{sigla:`UHE`,nome:`Usina Hidrelétrica`,faixa:`acima de 30 MW`,cor:`#9fb7ff`,nota:`No eixo ambiental do IAT: capacidade instalada superior a 30 MW, reservatório maior que 3 km² ou definição da ANEEL. O regime setorial distingue autorização e concessão por critérios próprios. O art. 10 da IN IAT nº 09/2025 enquadra a UHE entre as situações passíveis de EIA e RIMA e de audiência pública; o estudo e o rito aplicáveis devem ser confirmados no caso concreto. Erro recorrente: ignorar competência, delegação, processo federal ou o enquadramento ambiental vigente.`}],Be=[{nome:`Fio d'água`,icon:_,desc:`Opera com pouca ou nenhuma regularização sazonal e geração mais dependente da vazão afluente. Pode envolver menor alagamento que uma alternativa de acumulação, mas isso não significa impacto automaticamente menor: avalie barramento, trecho de vazão reduzida, conectividade, sedimentos, fauna, usos da água e localização.`},{nome:`Acumulação / regularização`,icon:f,desc:`Armazena água para regularizar vazões entre períodos e ampliar a flexibilidade de geração. Pode ampliar alagamento, deplecionamento e deslocamentos, mas a natureza e a magnitude dos impactos dependem também da localização, do arranjo, da regra operativa e das medidas de controle.`},{nome:`Reversível (bombeamento)`,icon:n,desc:`Bombeia água para um reservatório superior nas horas de baixa demanda e turbina nas horas de pico. Funciona como uma "bateria" hídrica de grande porte para o sistema.`}],Q=[{nome:`Concreto estabilizado pelo peso próprio`,resiste:`Leva a ação até a fundação pelo peso do maciço`,onde:`Vales abertos, fundação rochosa`,destaque:`Maciço de concreto`,vista:`Corte técnico`,svg:`peso-proprio`},{nome:`Concreto em arco`,resiste:`Transfere a ação lateralmente às ombreiras`,onde:`Vales estreitos e rochosos`,destaque:`Ombreiras rochosas`,vista:`Vista em planta`,svg:`arco`},{nome:`Contrafortes`,resiste:`A laje entrega a ação aos contrafortes e à fundação`,onde:`Economia de concreto em vãos`,destaque:`Laje e contrafortes`,vista:`Corte técnico`,svg:`contraforte`},{nome:`Terra (aterro)`,resiste:`O maciço compactado distribui a ação pela base`,onde:`Vales largos, farto material local`,destaque:`Núcleo impermeável`,vista:`Corte técnico`,svg:`terra`},{nome:`Enrocamento`,resiste:`O enrocamento distribui a ação e a face veda o reservatório`,onde:`Boa disponibilidade de rocha`,destaque:`Face de concreto e enrocamento`,vista:`Corte técnico`,svg:`enrocamento`},{nome:`CCR, concreto compactado a rolo`,resiste:`O maciço compactado em camadas leva a ação à fundação`,onde:`Execução rápida de grandes volumes`,destaque:`Camadas compactadas de CCR`,vista:`Corte técnico`,svg:`ccr`}],Ve=[{nome:`Pelton`,tipo:`Ação (impulso)`,queda:`Queda alta: acima de ~250 m`,vazao:`Vazão baixa`,nota:`Jatos d'água atingem conchas na periferia da roda. Típica de aproveitamentos de montanha.`,hMin:250,hMax:1800},{nome:`Francis`,tipo:`Reação`,queda:`Queda média: ~30 a 400 m`,vazao:`Vazão média`,nota:`A mais usada no Brasil. Água entra em espiral (caracol) e sai axialmente. Ampla faixa de aplicação.`,hMin:30,hMax:400},{nome:`Kaplan`,tipo:`Reação`,queda:`Queda baixa: ~10 a 70 m`,vazao:`Vazão alta`,nota:`Hélice com pás ajustáveis, mantém rendimento com vazão variável. Comum em grandes rios de planície.`,hMin:10,hMax:70},{nome:`Bulbo`,tipo:`Reação`,queda:`Queda muito baixa: abaixo de ~15 m`,vazao:`Vazão muito alta`,nota:`Unidade horizontal submersa. Típica de usinas a fio d'água em rios de grande vazão e pouca queda.`,hMin:2,hMax:15}];function He(e){return!Number.isFinite(e)||e<0?null:e<=.075?{sigla:`MCH`,faixa:`até 75 kW`}:e<=.5?{sigla:`MGH`,faixa:`acima de 75 kW até 500 kW`}:e<=5?{sigla:`CGH`,faixa:`acima de 500 kW até 5 MW`}:e<=30?{sigla:`PCH`,faixa:`acima de 5 MW até 30 MW`}:{sigla:`UHE`,faixa:`acima de 30 MW`}}function $(e){return Number.isFinite(e)?Ve.filter(t=>e>=t.hMin&&e<=t.hMax).map(e=>e.nome):[]}function Ue({kind:e}){let t={className:`dm-agua`,fill:`url(#dm-agua-${e})`},n=`url(#dm-ponta-r-${e})`;return(0,b.jsxs)(`svg`,{viewBox:`0 0 120 70`,className:`dam-mini`,"aria-hidden":`true`,children:[(0,b.jsxs)(`defs`,{children:[(0,b.jsxs)(`linearGradient`,{id:`dm-ceu-${e}`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#6ea9d6`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#c6dce3`})]}),(0,b.jsxs)(`linearGradient`,{id:`dm-agua-${e}`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#8ed0f2`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#1c5f88`})]}),(0,b.jsxs)(`linearGradient`,{id:`dm-rocha-${e}`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#6d5f4c`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#2f2a22`})]}),(0,b.jsxs)(`linearGradient`,{id:`dm-conc-${e}`,x1:`0`,y1:`0`,x2:`1`,y2:`0`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#e0e3dc`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#87908a`})]}),(0,b.jsxs)(`linearGradient`,{id:`dm-terra-${e}`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#cbbb92`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#8a7a55`})]}),(0,b.jsxs)(`linearGradient`,{id:`dm-enroc-${e}`,x1:`0`,y1:`0`,x2:`0`,y2:`1`,children:[(0,b.jsx)(`stop`,{offset:`0`,stopColor:`#a2acb2`}),(0,b.jsx)(`stop`,{offset:`1`,stopColor:`#556069`})]}),(0,b.jsx)(`marker`,{id:`dm-ponta-${e}`,markerWidth:`5`,markerHeight:`5`,refX:`4`,refY:`2.5`,orient:`auto`,children:(0,b.jsx)(`path`,{d:`M0 0 L5 2.5 L0 5 Z`,fill:`#eaf7ff`})}),(0,b.jsx)(`marker`,{id:`dm-ponta-r-${e}`,markerWidth:`5`,markerHeight:`5`,refX:`4`,refY:`2.5`,orient:`auto`,children:(0,b.jsx)(`path`,{d:`M0 0 L5 2.5 L0 5 Z`,fill:`#ffd479`})})]}),e===`arco`?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(`rect`,{x:`0`,y:`18`,width:`58`,height:`34`,fill:`url(#dm-agua-${e})`,opacity:`0.4`}),(0,b.jsx)(`rect`,{x:`58`,y:`18`,width:`62`,height:`34`,fill:`#7c6b52`,opacity:`0.55`}),(0,b.jsx)(`path`,{d:`M62 26 Q86 34 118 30 M64 44 Q88 38 118 42`,stroke:`#9c8a6c`,strokeWidth:`1`,fill:`none`,opacity:`0.7`}),(0,b.jsx)(`rect`,{x:`0`,y:`0`,width:`120`,height:`20`,fill:`url(#dm-rocha-${e})`}),(0,b.jsx)(`rect`,{x:`0`,y:`50`,width:`120`,height:`20`,fill:`url(#dm-rocha-${e})`}),(0,b.jsx)(`rect`,{x:`0`,y:`18`,width:`120`,height:`2.2`,fill:`#4c7a56`}),(0,b.jsx)(`rect`,{x:`0`,y:`50`,width:`120`,height:`2.2`,fill:`#4c7a56`})]}):(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(`rect`,{width:`120`,height:`52`,fill:`url(#dm-ceu-${e})`}),(0,b.jsx)(`path`,{d:`M0 42 L26 34 L52 43 L78 32 L104 43 L120 36 L120 52 L0 52 Z`,fill:`#7d9d84`,opacity:`0.45`}),(0,b.jsx)(`rect`,{x:`0`,y:`52`,width:`120`,height:`18`,fill:`url(#dm-rocha-${e})`}),(0,b.jsx)(`rect`,{x:`0`,y:`52`,width:`120`,height:`2.4`,fill:`#4c7a56`})]}),(0,b.jsx)(`path`,{className:`dm-empuxo`,d:e===`arco`?`M30 35 L52 35`:`M30 41 L52 41`,stroke:`#eaf7ff`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:`url(#dm-ponta-${e})`}),e===`peso-proprio`&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(`rect`,{x:`2`,y:`30`,width:`54`,height:`22`,...t}),(0,b.jsx)(`rect`,{x:`2`,y:`30`,width:`54`,height:`2`,fill:`#dff2ff`,opacity:`0.5`}),(0,b.jsx)(`path`,{d:`M56 52 L56 20 L78 52 Z`,fill:`url(#dm-conc-${e})`,stroke:`#5f6a63`,strokeWidth:`1`}),(0,b.jsx)(`path`,{d:`M54 18 L60 18 L60 23 L54 23 Z`,fill:`#eef1eb`,stroke:`#5f6a63`,strokeWidth:`0.8`}),(0,b.jsx)(`path`,{d:`M61 30 L61 52 M66 38 L66 52 M71 45 L71 52`,stroke:`#9aa39c`,strokeWidth:`0.7`,opacity:`0.8`}),(0,b.jsx)(`path`,{className:`dm-reacao`,d:`M64 30 L64 48`,stroke:`#ffd479`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:n})]}),e===`arco`&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(`rect`,{x:`2`,y:`20`,width:`54`,height:`30`,...t}),(0,b.jsx)(`path`,{d:`M56 20 Q74 35 56 50 L62 50 Q80 35 62 20 Z`,fill:`url(#dm-conc-${e})`,stroke:`#5f6a63`,strokeWidth:`1`}),(0,b.jsx)(`path`,{d:`M54 16 L64 16 L64 22 L54 22 Z`,fill:`#8d7f66`}),(0,b.jsx)(`path`,{d:`M54 54 L64 54 L64 48 L54 48 Z`,fill:`#8d7f66`}),(0,b.jsx)(`path`,{className:`dm-reacao`,d:`M63 29 L70 20`,stroke:`#ffd479`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:n}),(0,b.jsx)(`path`,{className:`dm-reacao`,d:`M63 41 L70 50`,stroke:`#ffd479`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:n})]}),e===`contraforte`&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(`rect`,{x:`2`,y:`30`,width:`54`,height:`22`,...t}),(0,b.jsx)(`rect`,{x:`2`,y:`30`,width:`54`,height:`2`,fill:`#dff2ff`,opacity:`0.5`}),(0,b.jsx)(`path`,{d:`M54 17 L60 16 L78 52 L70 52 Z`,fill:`url(#dm-conc-${e})`,stroke:`#5f6a63`,strokeWidth:`1`}),(0,b.jsx)(`path`,{d:`M62 52 L69 34 L72 34 L68 52 Z`,fill:`#9aa39c`,stroke:`#5f6a63`,strokeWidth:`0.7`}),(0,b.jsx)(`path`,{d:`M72 52 L75 42 L78 42 L77 52 Z`,fill:`#9aa39c`,stroke:`#5f6a63`,strokeWidth:`0.7`}),(0,b.jsx)(`path`,{className:`dm-reacao`,d:`M62 32 L71 49`,stroke:`#ffd479`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:n})]}),e===`terra`&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(`rect`,{x:`2`,y:`34`,width:`48`,height:`18`,...t}),(0,b.jsx)(`rect`,{x:`2`,y:`34`,width:`48`,height:`2`,fill:`#dff2ff`,opacity:`0.5`}),(0,b.jsx)(`path`,{d:`M48 52 L62 24 L70 24 L88 52 Z`,fill:`url(#dm-terra-${e})`,stroke:`#7a6a45`,strokeWidth:`1`}),(0,b.jsx)(`path`,{d:`M63 24 L69 24 L74 52 L60 52 Z`,fill:`#6b5c3a`,opacity:`0.92`}),(0,b.jsxs)(`g`,{fill:`#a89868`,opacity:`0.5`,children:[(0,b.jsx)(`circle`,{cx:`55`,cy:`44`,r:`1.4`}),(0,b.jsx)(`circle`,{cx:`58`,cy:`36`,r:`1.1`}),(0,b.jsx)(`circle`,{cx:`79`,cy:`45`,r:`1.4`}),(0,b.jsx)(`circle`,{cx:`76`,cy:`38`,r:`1.1`})]}),(0,b.jsx)(`path`,{className:`dm-reacao`,d:`M66 32 L66 49`,stroke:`#ffd479`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:n})]}),e===`enrocamento`&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(`rect`,{x:`2`,y:`34`,width:`48`,height:`18`,...t}),(0,b.jsx)(`rect`,{x:`2`,y:`34`,width:`48`,height:`2`,fill:`#dff2ff`,opacity:`0.5`}),(0,b.jsx)(`path`,{d:`M48 52 L62 24 L70 24 L88 52 Z`,fill:`url(#dm-enroc-${e})`,stroke:`#4e5860`,strokeWidth:`1`}),(0,b.jsx)(`path`,{d:`M48 52 L62 24 L65 24 L52 52 Z`,fill:`#dfe3dd`,stroke:`#5f6a63`,strokeWidth:`0.7`}),(0,b.jsx)(`g`,{fill:`#7b858c`,opacity:`0.75`,children:(0,b.jsx)(`path`,{d:`M68 34 l4 -3 l3 4 l-4 2 Z M74 42 l5 -3 l3 4 l-5 3 Z M66 44 l4 -3 l3 4 l-4 2 Z M78 48 l4 -3 l3 4 l-4 2 Z`})}),(0,b.jsx)(`path`,{className:`dm-reacao`,d:`M68 34 L68 49`,stroke:`#ffd479`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:n})]}),e===`ccr`&&(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(`rect`,{x:`2`,y:`30`,width:`54`,height:`22`,...t}),(0,b.jsx)(`rect`,{x:`2`,y:`30`,width:`54`,height:`2`,fill:`#dff2ff`,opacity:`0.5`}),(0,b.jsx)(`path`,{d:`M56 52 L56 20 L78 52 Z`,fill:`url(#dm-conc-${e})`,stroke:`#5f6a63`,strokeWidth:`1`}),(0,b.jsx)(`g`,{stroke:`#8f988f`,strokeWidth:`0.8`,opacity:`0.95`,children:(0,b.jsx)(`path`,{d:`M56 26 L60 26 M56 31 L63 31 M56 36 L67 36 M56 41 L70 41 M56 46 L74 46`})}),(0,b.jsx)(`path`,{d:`M54 18 L60 18 L60 23 L54 23 Z`,fill:`#eef1eb`,stroke:`#5f6a63`,strokeWidth:`0.8`}),(0,b.jsx)(`path`,{className:`dm-reacao`,d:`M63 30 L63 48`,stroke:`#ffd479`,strokeWidth:`2`,strokeLinecap:`round`,markerEnd:n})]})]})}function We(){let[e,t]=(0,y.useState)(Q[0].svg),n=Ne(),r=Q.find(t=>t.svg===e)||Q[0],i=(e,n)=>{let r=n;if(e.key===`ArrowRight`||e.key===`ArrowDown`)r=(n+1)%Q.length;else if(e.key===`ArrowLeft`||e.key===`ArrowUp`)r=(n-1+Q.length)%Q.length;else if(e.key===`Home`)r=0;else if(e.key===`End`)r=Q.length-1;else return;e.preventDefault(),t(Q[r].svg),e.currentTarget.parentElement?.querySelectorAll(`[role="tab"]`)[r]?.focus()};return(0,b.jsxs)(`div`,{className:`dam-explorer`,children:[(0,b.jsx)(Pe,{id:`hydro-barramentos`,label:`Tipos de barramento`,motion:n,activeDescription:`${r.nome}: acompanhe o empuxo da água e o caminho resistente da estrutura`}),(0,b.jsx)(`div`,{className:`dam-selector`,role:`tablist`,"aria-label":`Escolha o tipo de barramento`,children:Q.map((n,r)=>(0,b.jsxs)(`button`,{id:`dam-tab-${n.svg}`,type:`button`,role:`tab`,"aria-selected":n.svg===e,"aria-controls":`dam-selected-panel`,tabIndex:n.svg===e?0:-1,className:n.svg===e?`active`:``,onClick:()=>t(n.svg),onKeyDown:e=>i(e,r),children:[(0,b.jsx)(`span`,{"aria-hidden":`true`,children:String(r+1).padStart(2,`0`)}),n.nome]},n.svg))}),(0,b.jsxs)(`article`,{id:`dam-selected-panel`,className:`dam-selected-panel`,role:`tabpanel`,"aria-labelledby":`dam-tab-${r.svg}`,children:[(0,b.jsxs)(`figure`,{ref:n.stageRef,className:`dam-stage hydro-motion-stage`,"data-playing":n.active?`true`:`false`,style:n.style,children:[(0,b.jsx)(Ue,{kind:r.svg}),(0,b.jsx)(`span`,{className:`dam-stage-feature`,"aria-hidden":`true`,children:r.destaque}),(0,b.jsxs)(`figcaption`,{children:[(0,b.jsx)(`strong`,{children:r.nome}),(0,b.jsxs)(`span`,{children:[r.vista,` ampliada, representação esquemática sem escala.`]})]})]}),(0,b.jsxs)(`div`,{className:`dam-facts`,"aria-live":`polite`,children:[(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`small`,{children:`Elemento identificado no desenho`}),(0,b.jsx)(`strong`,{children:r.destaque})]}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`small`,{children:`Como recebe a ação da água`}),(0,b.jsx)(`strong`,{children:`Empuxo a montante`})]}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`small`,{children:`Caminho resistente simplificado`}),(0,b.jsx)(`strong`,{children:r.resiste})]}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`small`,{children:`Condição típica de implantação`}),(0,b.jsx)(`strong`,{children:r.onde})]})]}),(0,b.jsxs)(`div`,{className:`dam-force-legend`,"aria-label":`Legenda das forças`,children:[(0,b.jsxs)(`span`,{children:[(0,b.jsx)(`i`,{className:`dam-force-legend__water`}),` Água a montante`]}),(0,b.jsxs)(`span`,{children:[(0,b.jsx)(`i`,{className:`dam-force-legend__thrust`}),` Empuxo da água`]}),(0,b.jsxs)(`span`,{children:[(0,b.jsx)(`i`,{className:`dam-force-legend__reaction`}),` Caminho resistente / peso`]})]})]})]})}function Ge(){let[e,t]=(0,y.useState)(120),[n,r]=(0,y.useState)(60),[i,a]=(0,y.useState)(90),o=9.81*e*n*(i/100),s=o/1e3,c=He(s),l=$(n);return(0,b.jsxs)(`div`,{className:`power-calc`,children:[(0,b.jsxs)(`div`,{className:`pc-formula`,children:[(0,b.jsx)(g,{}),` `,(0,b.jsx)(`span`,{children:`P = ρ · g · Q · H · η`}),` `,(0,b.jsx)(`small`,{children:`densidade × constante física g × vazão turbinada × queda líquida × rendimento global`})]}),(0,b.jsxs)(`div`,{className:`pc-controls`,children:[(0,b.jsxs)(`label`,{children:[`Vazão turbinada, Q `,(0,b.jsxs)(`b`,{children:[e,` m³/s`]}),(0,b.jsx)(`input`,{type:`range`,min:`1`,max:`1500`,value:e,"aria-valuetext":`${e} metros cúbicos por segundo`,onChange:e=>t(+e.target.value)})]}),(0,b.jsxs)(`label`,{children:[`Queda líquida, H `,(0,b.jsxs)(`b`,{children:[n,` m`]}),(0,b.jsx)(`input`,{type:`range`,min:`2`,max:`800`,value:n,"aria-valuetext":`${n} metros`,onChange:e=>r(+e.target.value)})]}),(0,b.jsxs)(`label`,{children:[`Rendimento, η `,(0,b.jsxs)(`b`,{children:[i,`%`]}),(0,b.jsx)(`input`,{type:`range`,min:`70`,max:`95`,value:i,"aria-valuetext":`${i} por cento`,onChange:e=>a(+e.target.value)})]})]}),(0,b.jsxs)(`div`,{className:`pc-out`,children:[(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`span`,{children:`Potência estimada`}),(0,b.jsx)(`strong`,{children:s>=1?s.toFixed(1)+` MW`:Math.round(o)+` kW`})]}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`span`,{children:`Faixas de turbina compatíveis somente pela queda`}),(0,b.jsx)(`strong`,{children:l.length?l.join(` ou `):`Fora das faixas ilustradas`})]}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`span`,{children:`Faixa didática por potência (POP)`}),(0,b.jsx)(`strong`,{children:c?.sigla}),(0,b.jsxs)(`small`,{children:[` · `,c?.faixa]})]})]}),(0,b.jsx)(`p`,{className:`pc-note`,children:`Estimativa didática, não enquadramento automático. A faixa MCH, MGH, CGH, PCH ou UHE reproduz apenas o recorte de potência do Quadro 8 do POP; não determina nem altera cadastro, registro ou ato setorial da ANEEL, modalidade ambiental ou suficiência documental. Nesta expressão, H é a queda líquida, depois das perdas hidráulicas, e η representa o rendimento global do conjunto, inclusive turbina e gerador. A potência real depende do arranjo e das curvas de operação.`}),(0,b.jsx)(`p`,{className:`pc-note`,children:`A lista de turbinas cruza somente a queda H com as faixas ilustradas acima. A vazão Q participa do cálculo de potência, mas não é usada para escolher a máquina. A seleção de projeto exige, entre outros dados, faixa operativa de vazões, rotação, cavitação e curvas do fabricante.`})]})}var Ke=Object.freeze([{nome:`Bulbo`,min:2,max:15,sample:10},{nome:`Kaplan`,min:10,max:70,sample:40},{nome:`Francis`,min:30,max:400,sample:120},{nome:`Pelton`,min:250,max:800,sample:400}]);function qe({selectedType:e,onSelectType:t}){let[n,r]=(0,y.useState)(60),i=$(n),a=Ke.find(t=>t.nome.toLowerCase()===e)?.nome||`Francis`,o=e=>{let n=Number(e),i=$(n);r(n),!i.includes(a)&&i[0]&&t(i[0].toLowerCase())};return(0,b.jsxs)(`div`,{className:`turb-picker`,children:[(0,b.jsxs)(`label`,{className:`tp-slider`,children:[`Arraste a queda de projeto, H `,(0,b.jsxs)(`b`,{children:[n,` m`]}),(0,b.jsx)(`input`,{type:`range`,min:`2`,max:`800`,value:n,"aria-valuetext":`${n} metros`,onChange:e=>o(e.target.value)})]}),(0,b.jsx)(`div`,{className:`tp-scale`,"aria-label":`Faixas ilustradas e turbina mostrada`,children:Ke.map(e=>(0,b.jsxs)(`button`,{type:`button`,className:`tp-band`+(i.includes(e.nome)?` rec`:``)+(a===e.nome?` selected`:``),"aria-pressed":a===e.nome,onClick:()=>{r(e.sample),t(e.nome.toLowerCase())},children:[(0,b.jsx)(`span`,{className:`tp-name`,children:e.nome}),(0,b.jsxs)(`span`,{className:`tp-range`,children:[e.min,` a `,e.max,` m`]})]},e.nome))}),(0,b.jsxs)(`div`,{className:`tp-rec`,children:[(0,b.jsx)(c,{}),` Para `,n,` m, as faixas compatíveis por queda são`,` `,(0,b.jsx)(`strong`,{children:i.length?i.join(` e `):`nenhuma das faixas ilustradas`}),`. Esta triagem não usa vazão nem substitui o dimensionamento da máquina.`]}),(0,b.jsxs)(`p`,{className:`tp-selection`,role:`status`,children:[`Ilustração ampliada: `,(0,b.jsx)(`strong`,{children:a}),`.`]})]})}function Je({go:e}){let[t,n]=(0,y.useState)(`francis`);return(0,b.jsxs)(`div`,{className:`page hydro-page`,children:[(0,b.jsxs)(`header`,{className:`page-header hydro-hero-head`,children:[(0,b.jsx)(`span`,{children:(0,b.jsx)(g,{})}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`small`,{className:`ph-kicker`,children:`Fundamentos de engenharia`}),(0,b.jsx)(`h1`,{children:`Como funciona uma hidrelétrica`}),(0,b.jsx)(`p`,{children:`Da água represada à energia na rede: princípios, tipos de usina, barramentos, turbinas e cada componente do arranjo.`})]})]}),(0,b.jsx)(Re,{}),(0,b.jsxs)(`section`,{className:`hydro-hero hydro-hero--cutaway hydro-section hydro-section--intro`,id:`hydro-principio`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,b.jsx)(Ae,{}),(0,b.jsxs)(`div`,{className:`hydro-hero-copy`,children:[(0,b.jsx)(`h2`,{children:`O princípio: converter altura em energia`}),(0,b.jsxs)(`p`,{children:[`Uma hidrelétrica transforma a `,(0,b.jsx)(`strong`,{children:`energia potencial`}),` da água represada em `,(0,b.jsx)(`strong`,{children:`energia cinética`}),` ao descer pelo conduto, depois em `,(0,b.jsx)(`strong`,{children:`energia mecânica`}),` ao girar a turbina e, por fim, em `,(0,b.jsx)(`strong`,{children:`energia elétrica`}),` no gerador.`]}),(0,b.jsx)(`div`,{className:`energy-chain`,children:[`Potencial`,`Cinética`,`Mecânica`,`Elétrica`].map((e,t)=>(0,b.jsxs)(y.Fragment,{children:[(0,b.jsx)(`span`,{children:e}),t<3&&(0,b.jsx)(l,{})]},e))}),(0,b.jsxs)(`p`,{className:`hydro-two`,children:[`A potência hidráulica estimada segue `,(0,b.jsx)(`strong`,{children:`P = ρ · g · Q · H · η`}),`: vazão turbinada (Q), queda líquida disponível após as perdas (H), densidade da água (ρ), constante física g, correspondente à aceleração local, e rendimento global do conjunto (η). O valor de projeto depende das condições e curvas de operação.`]})]})]}),(0,b.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-potencia`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,b.jsxs)(`div`,{className:`section-title`,children:[(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`h2`,{children:`A conta da potência`}),(0,b.jsx)(`p`,{children:`Ajuste vazão, queda e rendimento e compare a estimativa com as faixas didáticas do POP.`})]}),(0,b.jsx)(d,{})]}),(0,b.jsx)(Ge,{})]}),(0,b.jsx)(`div`,{className:`hydro-section hydro-long-section`,id:`hydro-competencias`,tabIndex:`-1`,"data-hydro-section":!0,children:(0,b.jsx)(ee,{})}),(0,b.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-tipologias`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,b.jsxs)(`div`,{className:`section-title`,children:[(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`h2`,{children:`Faixas didáticas do eixo ambiental IAT`}),(0,b.jsx)(`p`,{children:`Quadro 8 do POP e IN IAT nº 09/2025: ponto de partida ambiental, sem substituir os eixos ANEEL e de recursos hídricos acima.`})]}),(0,b.jsx)(h,{})]}),(0,b.jsx)(`div`,{className:`pot-grid`,children:ze.map(e=>(0,b.jsxs)(`article`,{className:`pot-card`,style:{"--pc":e.cor},children:[(0,b.jsx)(`div`,{className:`pot-sigla`,children:e.sigla}),(0,b.jsx)(`strong`,{children:e.nome}),(0,b.jsx)(`span`,{className:`pot-faixa`,children:e.faixa}),(0,b.jsx)(`p`,{children:e.nota})]},e.sigla))})]}),(0,b.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-operacao`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,b.jsxs)(`div`,{className:`section-title`,children:[(0,b.jsx)(`div`,{children:(0,b.jsx)(`h2`,{children:`Tipos por reservatório e operação`})}),(0,b.jsx)(f,{})]}),(0,b.jsx)(`div`,{className:`res-grid`,children:Be.map(e=>(0,b.jsxs)(`article`,{className:`res-card`,children:[(0,b.jsx)(e.icon,{}),(0,b.jsx)(`strong`,{children:e.nome}),(0,b.jsx)(`p`,{children:e.desc})]},e.nome))})]}),(0,b.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-barramentos`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,b.jsxs)(`div`,{className:`section-title`,children:[(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`h2`,{children:`Tipos de barramento`}),(0,b.jsx)(`p`,{children:`A escolha depende do vale, da fundação e do material disponível.`})]}),(0,b.jsx)(a,{})]}),(0,b.jsx)(We,{})]}),(0,b.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-turbinas`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,b.jsxs)(`div`,{className:`section-title`,children:[(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`h2`,{children:`Turbinas: faixas de aplicação`}),(0,b.jsx)(`p`,{children:`O projeto cruza queda e vazão; o seletor abaixo destaca somente as faixas de queda e explicita essa limitação.`})]}),(0,b.jsx)(u,{})]}),(0,b.jsx)(qe,{selectedType:t,onSelectType:n}),(0,b.jsx)(de,{selectedType:t,onSelectType:n})]}),(0,b.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-casos`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,b.jsxs)(`div`,{className:`section-title`,children:[(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`h2`,{children:`Casos reais no Paraná`}),(0,b.jsx)(`p`,{children:`Um empreendimento verificado por tipo, com critérios e o site oficial de cada um.`})]}),(0,b.jsx)(r,{})]}),(0,b.jsx)(he,{})]}),(0,b.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-arranjos`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,b.jsxs)(`div`,{className:`section-title`,children:[(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`h2`,{children:`Esquemas de arranjo`}),(0,b.jsx)(`p`,{children:`Três diagramas detalhados: como o arranjo físico muda o circuito, a operação e o impacto.`})]}),(0,b.jsx)(c,{})]}),(0,b.jsx)(Ce,{})]}),(0,b.jsxs)(`section`,{className:`hydro-block hydro-section hydro-long-section`,id:`hydro-licenciamento`,tabIndex:`-1`,"data-hydro-section":!0,children:[(0,b.jsxs)(`div`,{className:`section-title`,children:[(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`h2`,{children:`Como solicitar a autorização para construir`}),(0,b.jsx)(`p`,{children:`Da ideia à operação: o caminho na ANEEL e no IAT, e o papel de cada ator.`})]}),(0,b.jsx)(d,{})]}),(0,b.jsx)(ye,{go:e})]}),(0,b.jsxs)(`section`,{className:`hydro-cta`,children:[(0,b.jsxs)(`div`,{children:[(0,b.jsx)(o,{}),(0,b.jsxs)(`div`,{children:[(0,b.jsx)(`strong`,{children:`Do princípio à decisão`}),(0,b.jsx)(`p`,{children:`Entendido o empreendimento físico, veja como o POP conduz a análise de licenciamento etapa por etapa.`})]})]}),(0,b.jsxs)(`button`,{className:`primary`,onClick:()=>e(`formacao`),children:[`Ir para a formação `,(0,b.jsx)(l,{})]})]})]})}export{Y as HYDRO_SECTIONS,Re as HydroLocalNav,Ge as PowerCalc,Fe as calculateHydroReadingState,Je as default,He as faixaDidaticaPorPotencia,$ as turbinasCompativeisPorQueda};