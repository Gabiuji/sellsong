import React from "react";

function App() {
  return (
    <div className="container vh-100 d-flex flex-column justify-content-center align-items-center text-center">
      <div
        className="card shadow-lg p-5 bg-white rounded-4"
        style={{ maxWidth: "500px" }}
      >
        <div className="display-1 text-primary mb-3">
          <i className="bi bi-music-note-beamed"></i>
        </div>
        <h1 className="fw-bold text-dark mb-2">SellSong Dockerizado</h1>
        <p className="text-muted fs-5 mb-4">
          A sua nova rede social musical orquestrada ponta a ponta.
        </p>
        <div className="badge bg-success px-3 py-2 fs-6 rounded-pill mb-3">
          <i className="bi bi-cpu-fill me-2"></i> React + Vite + TypeScript
        </div>
        <div className="text-secondary small">
          Pronto para consumir a API do Docker na porta 3000!
        </div>
      </div>
    </div>
  );
}

export default App;
