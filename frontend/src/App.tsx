import { useState } from "react";
import Landing from "./views/Landing";
import Auth from "./views/Auth";

interface User {
  id: number;
  username: string;
  email: string;
}

function App() {
  // Controle para saber se o usuário clicou no botão "Entrar" da Landing Page
  const [viewAuth, setViewAuth] = useState(false);

  // Estado inicial que lê o LocalStorage
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
    setViewAuth(false); // Volta para a Landing Page ao deslogar
  };

  // FLUXO DE NAVEGAÇÃO CONDICIONAL:

  // CORAÇÃO 1: Se o usuário estiver logado, cai direto no Dashboard interno
  if (user) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center bg-white p-4 shadow-sm rounded-4 mb-4">
          <div>
            <h2 className="fw-bold text-dark m-0">Olá, @{user.username}! 👋</h2>
            <p className="text-muted m-0 small">{user.email}</p>
          </div>
          <button
            className="btn btn-outline-danger btn-sm rounded-pill px-3"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-1"></i> Sair
          </button>
        </div>

        <div className="alert alert-info rounded-4 p-4 text-center">
          <h4 className="fw-bold">🎉 Autenticação Dockerizada com Sucesso!</h4>
          <p className="m-0">
            O seu token JWT está salvo e o Axios o injetará de forma invisível
            nas próximas chamadas de API.
          </p>
        </div>
      </div>
    );
  }

  // CORAÇÃO 2: Se não estiver logado, mas clicou para entrar, exibe a tela de Login/Cadastro
  if (viewAuth) {
    return (
      <div className="position-relative">
        {/* Botão flutuante sutil para voltar para a Landing Page caso ele desista do login */}
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

  // CORAÇÃO 3: Estado padrão inicial — Landing Page corporativa
  return <Landing onEnter={() => setViewAuth(true)} />;
}

export default App;
