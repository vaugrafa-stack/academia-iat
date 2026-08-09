import React from "react";

// Estado compartilhado pelo painel e pela aula enquanto a mídia vinculada é
// conferida. Fica fora da rota lazy para o painel não carregar licao.jsx.
export default function VideoDataLoading() {
  return (
    <div className="route-loading video-data-loading" role="status" aria-live="polite">
      <span aria-hidden="true" />
      <div>
        <strong>Preparando o resumo em vídeo</strong>
        <small>Conferindo a mídia vinculada a esta aula…</small>
      </div>
    </div>
  );
}
