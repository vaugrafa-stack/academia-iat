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

// A conta opcional so existe quando o site e servido junto de um servico de
// conta na mesma origem. No GitHub Pages nao ha backend, e sondar `/api/saude`
// ali produz um 404 por carga: erro de console em toda visita, num site que
// tem portao justamente para nao ter erro de console. Por isso a decisao e de
// BUILD, e nao de execucao: quem sobe o servico constroi com
// `IAT_CONTA_REMOTA=1`, e a versao estatica nem carrega o codigo.
const contaRemota = process.env.IAT_CONTA_REMOTA === '1';

export default {
  base: process.env.PAGES_REPO ? `/${process.env.PAGES_REPO}/` : '/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'vendor-react';
          }
          if (/[\\/]node_modules[\\/]lucide-react[\\/]/.test(id)) {
            return 'vendor-icons';
          }
          return undefined;
        },
      },
    },
  },
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
    __CONTA_REMOTA__: JSON.stringify(contaRemota),
  },
};
