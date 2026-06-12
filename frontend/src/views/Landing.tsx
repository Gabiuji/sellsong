interface LandingProps {
  onEnter: () => void;
}

export default function Landing({ onEnter }: LandingProps) {
  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* 1. CABEÇALHO (NAVBAR) */}
      <nav className="navbar navbar-expand-lg navbar-white bg-white shadow-sm sticky-top py-3">
        <div className="container">
          <span className="navbar-brand fw-bold text-primary d-flex align-items-center fs-3">
            <i className="bi bi-music-note-beamed me-2"></i> SellSong
          </span>
          <button
            className="btn btn-primary fw-semibold rounded-pill px-4 shadow-sm"
            onClick={onEnter}
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>Entrar no Sistema
          </button>
        </div>
      </nav>

      {/* 2. SEÇÃO HERO (APRESENTAÇÃO PRINCIPAL) */}
      <header className="py-5 my-auto bg-white border-bottom">
        <div className="container my-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6 text-center text-lg-start">
              <span className="badge bg-primary-subtle text-primary fw-semibold px-3 py-2 rounded-pill mb-3">
                🎵 A Rede Social dos Melômanos
              </span>
              <h1 className="display-4 fw-black text-dark mb-3 lh-sm">
                Conecte-se através do seu{" "}
                <span className="text-primary text-gradient">
                  gosto musical
                </span>
              </h1>
              <p className="lead text-secondary mb-4">
                Busque suas faixas favoritas direto do catálogo oficial do
                Spotify, avalie com estrelas, escreva resenhas profundas e
                descubra o que seus amigos estão ouvindo em tempo real.
              </p>
              <div className="d-grid gap-3 d-md-flex justify-content-md-center justify-content-lg-start">
                <button
                  className="btn btn-primary btn-lg px-5 rounded-pill shadow"
                  onClick={onEnter}
                >
                  Começar Agora
                </button>
                <a
                  href="#recursos"
                  className="btn btn-outline-secondary btn-lg px-4 rounded-pill"
                >
                  Saber Mais
                </a>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="position-relative d-inline-block">
                {/* Ícone Gigante flutuando com Bootstrap */}
                <div
                  className="text-primary animate-float"
                  style={{ fontSize: "12rem" }}
                >
                  <i className="bi bi-vinyl-fill"></i>
                </div>
                <div className="position-absolute top-0 start-100 translate-middle text-success fs-1">
                  <i className="bi bi-stars"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. SEÇÃO DE RECURSOS */}
      <section id="recursos" className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold text-dark">
              O que você pode fazer no SellSong?
            </h2>
            <p className="text-muted">
              A ferramentas ideais para organizar suas memórias musicais.
            </p>
          </div>

          <div className="row g-4">
            {/* Card 1 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 rounded-4 text-center">
                <div className="fs-1 text-success mb-3">
                  <i className="bi bi-spotify"></i>
                </div>
                <h4 className="fw-bold">Catálogo Spotify</h4>
                <p className="text-secondary small m-0">
                  Integração nativa com a API do Spotify. Ache qualquer música,
                  álbum ou artista instantaneamente de dentro do app.
                </p>
              </div>
            </div>
            {/* Card 2 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 rounded-4 text-center">
                <div className="fs-1 text-warning mb-3">
                  <i className="bi bi-star-fill"></i>
                </div>
                <h4 className="fw-bold">Resenhas Críticas</h4>
                <p className="text-secondary small m-0">
                  Dê notas de 1 a 5 estrelas e registre seus pensamentos e
                  sentimentos sobre as músicas que marcaram sua semana.
                </p>
              </div>
            </div>
            {/* Card 3 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4 rounded-4 text-center">
                <div className="fs-1 text-danger mb-3">
                  <i className="bi bi-people-fill"></i>
                </div>
                <h4 className="fw-bold">Rede de Amigos</h4>
                <p className="text-secondary small m-0">
                  Siga outros usuários, descubra novos gostos musicais no feed
                  global e expanda seus horizontes sonoros.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RODAPÉ */}
      <footer className="py-4 bg-dark text-white-50 mt-auto border-top border-secondary">
        <div className="container text-center small">
          <p className="m-0">
            &copy; 2026 SellSong. Todos os direitos reservados. Desenvolvido por
            {""}
          </p>
        </div>
      </footer>
    </div>
  );
}
