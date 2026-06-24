import "./App.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useState } from "react";
import Landing from "./views/Landing";
import Auth from "./views/Auth";
import Search from "./views/Search";
import Settings from "./views/Settings";
import ProfileWidget from "./components/ProfileWidget";
import DiscoveryWidget from "./components/DiscoveryWidget";
import UserSearch from "./components/UserSearch";
import Feed from "./views/Feed";
import Diary from "./views/Diary";
import StoryPanel from "./components/StoryPanel";
import Recommendations from "./views/Recommendations";

interface User {
  id: number;
  username: string;
  email: string;
}

function App() {
  const [viewAuth, setViewAuth] = useState(false);

  // Estado que controla o que aparece na coluna do meio: "feed" ou "settings"
  const [activeTab, setActiveTab] = useState<
    "feed" | "settings" | "users" | "diary" | "recommendations"
  >("feed");

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

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("@SellSong:token");
    localStorage.removeItem("@SellSong:user");
    setUser(null);
    setViewAuth(false);
    window.location.reload();
  };

  // Estado de controle de atualização do feed: toda vez que um post novo for criado, incrementamos esse número para disparar o useEffect de atualização do feed
  const [refreshFeed, setRefreshFeed] = useState(0);
  const triggerFeedRefresh = () => setRefreshFeed((prev) => prev + 1);

  // Se logado, exibe o Dashboard contendo o visualizador de buscas do Spotify
  if (user) {
    return (
      <>
        <div className="bg-light min-vh-100">
          {/* 📱 TOPBAR GLOBAL RESPONSIVA */}
          <nav className="navbar navbar-white bg-white shadow-sm border-bottom sticky-top py-2">
            <div className="container">
              {/* BOTÃO DO MENU HAMBÚRGUER (Apenas visível em celulares/tablets) */}
              <button
                className="btn btn-link text-dark p-0 me-3 d-lg-none border-0 shadow-none"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#mobileMenu"
                aria-controls="mobileMenu"
              >
                <i className="bi bi-list fs-3"></i>
              </button>

              {/* Clique na logo faz voltar para o Feed */}
              <span
                className="navbar-brand fw-bold text-primary fs-4 d-flex align-items-center m-0 user-select-none"
                style={{ cursor: "pointer" }}
                onClick={() => setActiveTab("feed")}
              >
                <i className="bi bi-music-note-beamed me-2"></i> SellSong
              </span>

              {/* LINKS DA NAVBAR - Visíveis apenas em telas grandes (Desktops) */}
              <div className="d-none d-lg-flex align-items-center gap-2 ms-auto">
                <span className="text-secondary small me-2">
                  Alinhado como <strong>@{user.username}</strong>
                </span>

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
                  className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === "users" ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setActiveTab("users")}
                >
                  <i className="bi bi-people-fill me-1"></i> Buscar Pessoas
                </button>

                <button
                  className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === "diary" ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setActiveTab("diary")}
                >
                  <i className="bi bi-journal-album me-1"></i> Meu Diário
                </button>

                <button
                  className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === "recommendations" ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setActiveTab("recommendations")}
                >
                  <i className="bi bi-fire me-1"></i> Recomendações
                </button>

                <button
                  className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold ms-2"
                  onClick={() => setShowLogoutModal(true)}
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Sair
                </button>
              </div>

              {/* AVATAR RÁPIDO DO USUÁRIO NO TOPO (Apenas Mobile) */}
              <div className="d-flex d-lg-none ms-auto align-items-center">
                <span className="badge bg-secondary-subtle text-dark-emphasis rounded-pill small">
                  @{user.username}
                </span>
              </div>
            </div>
          </nav>

          {/* MENU LATERAL ESTILO TWITTER (Bootstrap Offcanvas) */}
          <div
            className="offcanvas offcanvas-start border-0 text-white shadow-lg"
            tabIndex={-1}
            id="mobileMenu"
            aria-labelledby="mobileMenuLabel"
            style={{ width: "290px", backgroundColor: "#131316" }}
          >
            {/* Cabeçalho do Menu */}
            <div className="offcanvas-header border-bottom border-secondary border-opacity-10 py-3">
              <h6
                className="offcanvas-title fw-bold text-primary d-flex align-items-center m-0"
                id="mobileMenuLabel"
              >
                <i className="bi bi-music-note-beamed me-2"></i> Navegação
              </h6>
              <button
                type="button"
                className="btn-close btn-close-white shadow-none small"
                data-bs-dismiss="offcanvas"
                aria-label="Close"
              ></button>
            </div>

            <div className="offcanvas-body d-flex flex-column justify-content-between p-3">
              <div>
                {/* Informações da Conta (Fundo adaptado para Dark Mode sutil) */}
                <div
                  className="mb-4 p-1 rounded-4"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                >
                  <ProfileWidget
                    setActiveTab={(tab) => {
                      setActiveTab(tab);
                    }}
                  />
                </div>

                {/* Lista de Navegação Principal (Estilo Pílulas do Twitter) */}
                <div className="d-flex flex-column gap-2">
                  <button
                    className={`btn btn-lg border-0 text-start w-100 rounded-pill py-2 px-3 fw-semibold d-flex align-items-center gap-3 transition-all ${
                      activeTab === "feed"
                        ? "btn-primary text-white"
                        : "text-white-50 bg-transparent hover-bg-white-opacity"
                    }`}
                    style={{ fontSize: "0.95rem" }}
                    onClick={() => setActiveTab("feed")}
                    data-bs-dismiss="offcanvas"
                  >
                    <i
                      className={`bi fs-5 ${activeTab === "feed" ? "bi-house-door-fill" : "bi-house-door"}`}
                    ></i>
                    Linha do Tempo
                  </button>

                  <button
                    className={`btn btn-lg border-0 text-start w-100 rounded-pill py-2 px-3 fw-semibold d-flex align-items-center gap-3 transition-all ${
                      activeTab === "diary"
                        ? "btn-primary text-white"
                        : "text-white-50 bg-transparent hover-bg-white-opacity"
                    }`}
                    style={{ fontSize: "0.95rem" }}
                    onClick={() => setActiveTab("diary")}
                    data-bs-dismiss="offcanvas"
                  >
                    <i
                      className={`bi fs-5 ${activeTab === "diary" ? "bi-journal-album" : "bi-journal-text"}`}
                    ></i>
                    Meu Diário
                  </button>

                  <button
                    className={`btn btn-lg border-0 text-start w-100 rounded-pill py-2 px-3 fw-semibold d-flex align-items-center gap-3 transition-all ${
                      activeTab === "recommendations"
                        ? "btn-primary text-white"
                        : "text-white-50 bg-transparent hover-bg-white-opacity"
                    }`}
                    style={{ fontSize: "0.95rem" }}
                    onClick={() => setActiveTab("recommendations")}
                    data-bs-dismiss="offcanvas"
                  >
                    <i
                      className={`bi fs-5 ${activeTab === "recommendations" ? "bi-fire text-danger" : "bi-fire"}`}
                    ></i>
                    Recomendações
                  </button>

                  <button
                    className={`btn btn-lg border-0 text-start w-100 rounded-pill py-2 px-3 fw-semibold d-flex align-items-center gap-3 transition-all ${
                      activeTab === "users"
                        ? "btn-primary text-white"
                        : "text-white-50 bg-transparent hover-bg-white-opacity"
                    }`}
                    style={{ fontSize: "0.95rem" }}
                    onClick={() => setActiveTab("users")}
                    data-bs-dismiss="offcanvas"
                  >
                    <i
                      className={`bi fs-5 ${activeTab === "users" ? "bi-people-fill" : "bi-people"}`}
                    ></i>
                    Buscar Pessoas
                  </button>

                  <button
                    className={`btn btn-lg border-0 text-start w-100 rounded-pill py-2 px-3 fw-semibold d-flex align-items-center gap-3 transition-all ${
                      activeTab === "settings"
                        ? "btn-primary text-white"
                        : "text-white-50 bg-transparent hover-bg-white-opacity"
                    }`}
                    style={{ fontSize: "0.95rem" }}
                    onClick={() => setActiveTab("settings")}
                    data-bs-dismiss="offcanvas"
                  >
                    <i
                      className={`bi fs-5 ${activeTab === "settings" ? "bi-gear-fill" : "bi-gear"}`}
                    ></i>
                    Configurações
                  </button>
                </div>
              </div>

              {/* Botão de Saída Confortável no Rodapé */}
              <div className="border-top border-secondary border-opacity-10 pt-3">
                <button
                  className="btn btn-sm btn-outline-danger w-100 rounded-pill fw-semibold py-2"
                  onClick={() => {
                    setShowLogoutModal(true);
                  }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>Sair da Conta
                </button>
              </div>
            </div>
          </div>

          {/* DESIGN DE GRID RESPONSIVO */}
          <div className="container py-4">
            <div className="row g-4">
              {/* COLUNA ESQUERDA: Fica oculta no mobile e surge em telas grandes (>= lg) */}
              <aside className="d-none d-lg-block col-lg-3">
                <ProfileWidget setActiveTab={setActiveTab} />
              </aside>

              {/* COLUNA CENTRAL: Ocupa a tela inteira (col-12) no celular e se ajusta no Desktop */}
              <main className="col-12 col-md-12 col-lg-6 px-2">
                {activeTab === "feed" ? (
                  <>
                    <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden p-2">
                      <Search onPostCreated={triggerFeedRefresh} />
                    </div>
                    <div className="my-3">
                      <StoryPanel />
                    </div>
                    <Feed refreshTrigger={refreshFeed} />
                  </>
                ) : activeTab === "settings" ? (
                  <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                    <Settings />
                  </div>
                ) : activeTab === "users" ? (
                  <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                    <UserSearch />
                  </div>
                ) : activeTab === "recommendations" ? (
                  <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                    <Recommendations />
                  </div>
                ) : (
                  <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
                    <Diary />
                  </div>
                )}
              </main>

              {/* COLUNA DIREITA (Bombando): Fica visível no Desktop, some no celular */}
              <aside className="d-none d-lg-block col-lg-3">
                <DiscoveryWidget />
              </aside>
            </div>
          </div>
        </div>

        {/* MODAL DE CONFIRMAÇÃO DE LOGOUT */}
        {showLogoutModal && (
          <div
            className="modal d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            tabIndex={-1}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: "380px" }}
            >
              <div className="modal-content border-0 shadow rounded-4 p-2">
                <div className="modal-header border-0 pb-1">
                  <h6 className="modal-title fw-bold text-dark">
                    Aviso de Saída
                  </h6>
                  <button
                    type="button"
                    className="btn-close shadow-none"
                    onClick={() => setShowLogoutModal(false)}
                  ></button>
                </div>

                <div className="modal-body py-2">
                  <p className="text-muted small m-0">
                    Você realmente deseja encerrar sua sessão no **SellSong**?
                  </p>
                </div>

                <div className="modal-footer border-0 pt-2 d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-light rounded-pill px-3 fw-semibold"
                    onClick={() => setShowLogoutModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger rounded-pill px-4 fw-semibold shadow-sm"
                    onClick={handleLogout}
                  >
                    Sair da Conta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
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
