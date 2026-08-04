import { execFileSync } from 'node:child_process';

// Carimbo de build usado no rodape do certificado (rastreabilidade da emissao).
// A base vem pelo NOME do repo (PAGES_REPO), sem barras: no Git Bash do
// Windows, qualquer valor comecando com / (em --base ou em env var) sofre
// conversao de caminho do MSYS (vira C:/Program Files/Git/...) e quebra o
// deploy. A barra e montada aqui, fora do alcance do shell.
function resolveBuildStamp() {
  const ciSha = process.env.GITHUB_SHA?.trim();
  if (ciSha) return ciSha;

  try {
    const localSha = execFileSync('git', ['rev-parse', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return localSha ? `${localSha}-local` : 'local';
  } catch {
    return 'local';
  }
}

const buildStamp = resolveBuildStamp();

export default {
  base: process.env.PAGES_REPO ? `/${process.env.PAGES_REPO}/` : '/',
  plugins: [{
    name: 'academia-iat-csp-dev',
    apply: 'serve',
    transformIndexHtml(html) {
      return html.replace(
        "connect-src 'self' https://services.arcgisonline.com;",
        "connect-src 'self' https://services.arcgisonline.com ws://127.0.0.1:* ws://localhost:*;",
      );
    },
  }],
  define: {
    __BUILD_STAMP__: JSON.stringify(buildStamp),
  },
};
