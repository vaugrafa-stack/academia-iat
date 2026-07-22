// Carimbo de build usado no rodape do certificado (rastreabilidade da emissao)
export default {
  define: {
    __BUILD_STAMP__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
};
