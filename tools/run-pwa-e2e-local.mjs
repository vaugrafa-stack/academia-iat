// Atalho local, independente do shell, para reconstruir exatamente na base do
// GitHub Pages antes do ensaio PWA. O CI ja executa o mesmo build numa etapa
// anterior e usa diretamente `test:e2e:pwa` para nao compilar duas vezes.
import { spawnSync } from 'node:child_process';

const pnpmEntry = String(process.env.npm_execpath || '').trim();
const pnpm = pnpmEntry
  ? { command: process.execPath, prefix: [pnpmEntry], shell: false }
  : {
      command: process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm',
      prefix: [],
      shell: process.platform === 'win32',
    };
const environment = {
  ...process.env,
  PAGES_REPO: 'academia-iat',
  PWA_EXPECTED_BASE: '/academia-iat/',
};

function run(args) {
  const result = spawnSync(pnpm.command, [...pnpm.prefix, ...args], {
    cwd: process.cwd(),
    env: environment,
    stdio: 'inherit',
    shell: pnpm.shell,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(['build']);
run(['test:e2e:pwa']);
