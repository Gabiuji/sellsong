interface ProfileWidgetProps {
  username: string;
}

export default function ProfileWidget({ username }: ProfileWidgetProps) {
  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
      {/* Banner decorativo de fundo */}
      <div className="bg-primary bg-gradient" style={{ height: "70px" }}></div>

      <div className="card-body text-center position-relative pt-0">
        {/* Avatar flutuante sobre o banner */}
        <div
          className="position-absolute start-50 translate-middle"
          style={{ top: "0" }}
        >
          <div className="bg-white p-1 rounded-circle shadow-sm">
            <div
              className="bg-light rounded-circle d-flex align-items-center justify-content-center fw-bold text-primary fs-4"
              style={{ width: "64px", height: "64px" }}
            >
              {username.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "45px" }}>
          <h5 className="fw-bold text-dark mb-0">@{username}</h5>
          <p className="text-secondary small">Crítico Musical</p>
        </div>

        <hr className="my-3 text-muted opacity-25" />

        {/* Contadores Estilo Rede Social */}
        <div className="row g-0 text-center">
          <div className="col-4">
            <div className="fw-bold text-dark small">12</div>
            <div className="text-muted x-small text-uppercase">Resenhas</div>
          </div>
          <div className="col-4 border-start border-end">
            <div className="fw-bold text-dark small">148</div>
            <div className="text-muted x-small text-uppercase">Seguidores</div>
          </div>
          <div className="col-4">
            <div className="fw-bold text-dark small">205</div>
            <div className="text-muted x-small text-uppercase">Seguindo</div>
          </div>
        </div>
      </div>
    </div>
  );
}
