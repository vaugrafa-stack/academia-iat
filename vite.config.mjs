// Carimbo de build usado no rodape do certificado (rastreabilidade da emissao).
// A base vem pelo NOME do repo (PAGES_REPO), sem barras: no Git Bash do
// Windows, qualquer valor comecando com / (em --base ou em env var) sofre
// conversao de caminho do MSYS (vira C:/Program Files/Git/...) e quebra o
// deploy. A barra e montada aqui, fora do alcance do shell.
export default {
  base: process.env.PAGES_REPO ? `/${process.env.PAGES_REPO}/` : '/',
  define: {
    __BUILD_STAMP__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
};
