import { useState } from "react";
import Landing from "./views/Landing";
import Auth from "./views/Auth";
import Search from "./views/Search"; // 1. Importe a Tela de Busca

interface User {
  id: number;
  username: string;
  email: string;
}

function App() {
  const [viewAuth, setViewAuth] = useState(false);
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
        {/* Topbar do Usuário */}
        <div className="bg-white shadow-sm border-bottom py-3 mb-4">
          <div className="container d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <span className="fs-3 fw-bold text-primary me-3">
                <i className="bi bi-music-note-beamed"></i>
              </span>
              <h5 className="fw-bold text-dark m-0">
                Olá, @{user.username}! 👋
              </h5>
            </div>
            <button
              className="btn btn-outline-danger btn-sm rounded-pill px-3"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-1"></i> Sair
            </button>
          </div>
        </div>

        {/* Tela de Busca ativa no painel principal */}
        <Search />
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
