import { useState } from "react";
import Landing from "./views/Landing";
import Auth from "./views/Auth";
import Search from "./views/Search";
import Settings from "./views/Settings";
import ProfileWidget from "./components/ProfileWidget";
import DiscoveryWidget from "./components/DiscoveryWidget";
import UserSearch from "./components/UserSearch";

interface User {
  id: number;
  username: string;
  email: string;
}

function App() {
  const [viewAuth, setViewAuth] = useState(false);

  // 🌟 Estado que controla o que aparece na coluna do meio: "feed" ou "settings"
  const [activeTab, setActiveTab] = useState<"feed" | "settings" | "users">(
    "feed",
  );

  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem("@SellSong:token");
    const savedUser = localStorage.getItem("@SellSong:user");

    if (token && savedUser) {
      try {
        return JSON.parse(savedUser) as User;
      } catch (e) {
        console.error("Erro ao parsear usuário", e);
        localStorage.removeItem("@SellSong:token");
        localStorage.removeItem("@SellSong:user");
      }
    }
    return null;
  });

  const handleLogout = () => {
    localStorage.removeItem("@SellSong:token");
    localStorage.removeItem("@SellSong:user");
    setUser(null);
    setViewAuth(false);
  };

  // 1. Se logado, exibe o Dashboard contendo o visualizador de buscas do Spotify
  if (user) {
    return (
      <div className="bg-light min-vh-100">
        {/* TOPBAR GLOBAL */}
        <nav className="navbar navbar-expand-lg navbar-white bg-white shadow-sm border-bottom sticky-top py-2">
          <div className="container">
            {/* Clique na logo faz voltar para o Feed */}
            <span
              className="navbar-brand fw-bold text-primary fs-4 d-flex align-items-center m-0 user-select-none"
              style={{ cursor: "pointer" }}
              onClick={() => setActiveTab("feed")}
            >
              <i className="bi bi-music-note-beamed me-2"></i> SellSong
            </span>

            <div className="d-flex align-items-center gap-3 ms-auto">
              <span className="text-secondary small d-none d-sm-inline">
                Alinhado como <strong>@{user.username}</strong>
              </span>

              {/* 🌟 BOTÃO DINÂMICO DE CONFIGURAÇÕES */}
              <button
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                  activeTab === "settings"
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() =>
                  setActiveTab(activeTab === "feed" ? "settings" : "feed")
                }
              >
                {activeTab === "feed" ? (
                  <>
                    <i className="bi bi-gear-fill me-1"></i> Configurações
                  </>
                ) : (
                  <>
                    <i className="bi bi-house-door-fill me-1"></i> Ir para o
                    Feed
                  </>
                )}
              </button>

              <button
                className={`btn btn-sm rounded-pill px-3 fw-semibold me-2 ${
                  activeTab === "users"
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setActiveTab("users")}
              >
                <i className="bi bi-people-fill me-1"></i> Buscar Pessoas
              </button>

              <button
                className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right me-1"></i> Sair
              </button>
            </div>
          </div>
        </nav>

        {/* CONTAINER DO LAYOUT DE 3 COLUNAS */}
        <div className="container py-4">
          <div className="row g-4">
            {/* COLUNA ESQUERDA: Perfil e Atalhos */}
            <aside className="col-12 col-lg-3">
              <ProfileWidget />
            </aside>

            {/* COLUNA CENTRAL: Onde ocorre a alternância das telas */}
            <main className="col-12 col-md-8 col-lg-6">
              {activeTab === "feed" ? (
                <>
                  {/* BOX DE BUSCA MUSICAL */}
                  <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden p-2">
                    <Search />
                  </div>

                  {/* ESPAÇO RESERVADO PARA O FEED SOCIAL */}
                  <div className="mt-4">
                    <div className="d-flex align-items-center mb-3">
                      <h5 className="fw-bold text-dark m-0">
                        Feed da sua Rede
                      </h5>
                      <span className="badge bg-primary rounded-pill ms-2 small">
                        Novidades
                      </span>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-secondary bg-white">
                      <i className="bi bi-chat-square-heart fs-2 text-muted mb-2"></i>
                      <p className="m-0 small">
                        As avaliações dos seus amigos e as suas aparecerão aqui
                        em tempo real!
                      </p>
                    </div>
                  </div>
                </>
              ) : activeTab === "settings" ? (
                <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                  <Settings />
                </div>
              ) : (
                /* 🌟 TELA DE BUSCA DE PESSOAS / REDE SOCIAL */
                <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                  <UserSearch />
                </div>
              )}
            </main>

            {/* COLUNA DIREITA: Rankings e Descobertas */}
            <aside className="col-12 col-md-4 col-lg-3">
              <DiscoveryWidget />
            </aside>
          </div>
        </div>
      </div>
    );
  }

  if (viewAuth) {
    return (
      <div className="position-relative">
        <button
          className="btn btn-link text-secondary position-absolute top-0 start-0 m-3 text-decoration-none fw-semibold"
          onClick={() => setViewAuth(false)}
        >
          <i className="bi bi-arrow-left me-2"></i>Voltar ao início
        </button>
        <Auth />
      </div>
    );
  }

  return <Landing onEnter={() => setViewAuth(true)} />;
}

export default App;
