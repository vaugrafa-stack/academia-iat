// Roda, na ordem, os mesmos passos que o CI roda, e para no primeiro que
// reprovar.
//
// Existe por causa de duas publicacoes reprovadas em sequencia, ambas pela
// mesma razao de fundo: `pnpm test` passou, eu li isso como "esta pronto", e
// empurrei. Mas a suite NAO contem tudo o que o CI cobra.
//
// O primeiro commit caiu no orcamento de bundle, que so roda dentro do build.
// O segundo caiu no portao de acessibilidade do artefato, que so roda depois
// do build, contra um servidor de preview. Nos dois casos o portao existia,
// funcionava e apontou o defeito certo, que era real: seis miniaturas de
// barragem declarando o mesmo id de marcador. O que faltava era o portao estar
// no caminho que eu percorria antes de publicar.
//
// A licao nao e "lembrar de rodar mais coisas", porque isso depende de eu
// lembrar. E ter UM comando cuja definicao de pronto seja a mesma do CI:
//
//   npm run verificar
//
// Onde difere do CI, e por que:
//
// - Nao roda `pnpm audit`, que depende de rede, nem os passos de empacotar e
//   publicar, que dependem do ambiente do GitHub.
// - Sobe o preview aqui dentro, em vez de deixar o Playwright subir. O
//   playwright.config.mjs chama `pnpm exec vite preview`, e nem toda maquina
//   de desenvolvimento tem pnpm. Preferi absorver a diferenca aqui a mexer na
//   configuracao que o CI usa e que funciona la.
//
// O resto e o mesmo comando, na mesma ordem.

import { spawn, spawnSync } from 'node:child_process';
import process from 'node:process';

// PAGES_REPO muda a base do artefato de `/` para `/academia-iat/`. Sem ele, o
// preview serve na raiz enquanto o HTML aponta para o subcaminho, e os testes
// falham com 404 em todos os assets: um falso negativo que custa tempo e nao
// diz nada sobre o codigo. O CI define no nivel do job; aqui repetimos.
const REPO = process.env.PAGES_REPO || 'academia-iat';
const PORTA = Number(process.env.PLAYWRIGHT_PORT || 4174);
const BASE = `http://127.0.0.1:${PORTA}/${REPO}`;
const AMBIENTE = { ...process.env, PAGES_REPO: REPO };

const janela = process.platform === 'win32';

function passo(titulo, comando, argumentos, extra = {}) {
  process.stdout.write(`\n── ${titulo}\n`);
  const r = spawnSync(comando, argumentos, {
    stdio: 'inherit',
    shell: janela,
    env: { ...AMBIENTE, ...extra },
  });
  return r.status === 0;
}

async function esperarServidor(url, limiteMs = 60_000) {
  const fim = Date.now() + limiteMs;
  while (Date.now() < fim) {
    try {
      const r = await fetch(url, { redirect: 'manual' });
      if (r.status < 400) return true;
    } catch {
      // servidor ainda subindo
    }
    await new Promise((ok) => setTimeout(ok, 500));
  }
  return false;
}

// Antes do artefato: tudo o que nao precisa de servidor.
const ANTES = [
  ['Inventario, proveniencia e limites de midia', 'npm', ['run', 'check:media']],
  ['Portao premium', 'npm', ['run', 'audit:premium']],
  ['Compilar para o GitHub Pages', 'npm', ['run', 'build']],
  ['Suite de qualidade', 'npm', ['test']],
  ['Regressoes autocontidas do tooling', 'python', ['-B', '-m', 'unittest', 'tools/test_tooling.py']],
  ['Catalogo offline', 'node', ['tools/check-offline-packages.mjs']],
];

for (const [titulo, comando, argumentos] of ANTES) {
  if (!passo(titulo, comando, argumentos)) {
    console.error(`\nREPROVADO em: ${titulo}`);
    console.error('O CI vai reprovar do mesmo jeito. Corrija antes de publicar.');
    process.exit(1);
  }
}

process.stdout.write(`\n── Subindo o preview em ${BASE}\n`);
const servidor = spawn(
  'npx',
  ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PORTA), '--strictPort'],
  { stdio: 'ignore', shell: janela, env: AMBIENTE },
);

let saida = 0;
try {
  if (!(await esperarServidor(`${BASE}/`))) {
    console.error(`\nREPROVADO: o preview nao respondeu em ${BASE}/.`);
    console.error('Verifique se a porta esta livre e se o build gerou dist/.');
    process.exit(1);
  }
  const comServidor = { PLAYWRIGHT_BASE_URL: BASE };
  const artefato = passo(
    'Artefato em desktop e celular',
    'npm',
    ['run', 'test:e2e:artifact'],
    comServidor,
  );
  // A PWA sobe o proprio servidor pela playwright.pwa.config.mjs, entao nao
  // recebe PLAYWRIGHT_BASE_URL.
  const pwa = artefato && passo(
    'Instalacao, atualizacao e suporte offline da PWA',
    'npm',
    ['run', 'test:e2e:pwa'],
  );
  if (!artefato || !pwa) {
    console.error(`\nREPROVADO em: ${artefato ? 'PWA' : 'artefato em desktop e celular'}`);
    console.error('O CI vai reprovar do mesmo jeito. Corrija antes de publicar.');
    saida = 1;
  }
} finally {
  servidor.kill();
}

if (saida === 0) {
  console.log('\nOK: os 8 passos que o CI cobra passaram aqui.');
  console.log('Faltam so `pnpm audit`, que depende de rede, e o empacotamento do Pages.');
}
process.exit(saida);
