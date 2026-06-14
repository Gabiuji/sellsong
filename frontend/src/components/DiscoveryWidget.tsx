export default function DiscoveryWidget() {
  return (
    <div className="d-flex flex-column gap-4">
      {/* Bloco 1: Top 10 da Comunidade (Seu insight semanal) */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center">
          <i className="bi bi-trophy-fill text-warning me-2"></i> Top da
          Comunidade
          <span className="badge bg-light text-muted ms-auto x-small fw-normal border">
            Semanal
          </span>
        </h6>

        <ul className="list-unstyled m-0 d-flex flex-column gap-2">
          <li className="d-flex align-items-center small p-2 rounded-3 bg-light-subtle">
            <span className="fw-bold text-secondary me-2">1.</span>
            <div className="text-truncate grow">
              <span className="fw-bold text-dark d-block text-truncate small">
                The Cure
              </span>
              <span className="text-muted x-small">Artista Desconhecida</span>
            </div>
            <span className="badge bg-warning-subtle text-warning fw-bold small">
              <i className="bi bi-star-fill"></i> 4.8
            </span>
          </li>
          <li className="d-flex align-items-center small p-2 rounded-3">
            <span className="fw-bold text-secondary me-2">2.</span>
            <div className="text-truncate grow">
              <span className="fw-bold text-dark d-block text-truncate small">
                Blinding Lights
              </span>
              <span className="text-muted x-small">The Weeknd</span>
            </div>
            <span className="badge bg-warning-subtle text-warning fw-bold small">
              <i className="bi bi-star-fill"></i> 4.5
            </span>
          </li>
        </ul>
      </div>

      {/* Bloco 2: Em alta no Spotify */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center">
          <i className="bi bi-spotify text-success me-2"></i> Em Alta no Spotify
        </h6>

        <ul className="list-unstyled m-0 d-flex flex-column gap-2">
          <li className="d-flex align-items-center gap-2">
            <div
              className="bg-dark rounded-2"
              style={{ width: "32px", height: "32px" }}
            ></div>
            <div className="text-truncate grow">
              <span className="fw-semibold text-dark text-truncate d-block small">
                Hit do Momento
              </span>
              <span className="text-muted x-small">Artista Global</span>
            </div>
            <i className="bi bi-graph-up text-success ms-auto"></i>
          </li>
        </ul>
      </div>
    </div>
  );
}
