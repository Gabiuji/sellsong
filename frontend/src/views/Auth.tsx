import React, { useState } from "react";
import api from "../services/api";

export default function Auth() {
  // Controla se a aba atual é Login (true) ou Cadastro (false)
  const [isLogin, setIsLogin] = useState(true);

  // Estados dos campos do formulário
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados de feedback visual
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Função para processar o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        // Fluxo de Login
        const response = await api.post("/auth/login", { email, password });
        const { token, user } = response.data;

        // Salva o Token JWT e os dados básicos no LocalStorage
        localStorage.setItem("@SellSong:token", token);
        localStorage.setItem("@SellSong:user", JSON.stringify(user));

        setSuccess(`Bem-vindo de volta, ${user.username}!`);

        // Simula o redirecionamento recarregando a página
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        // Fluxo de Cadastro
        await api.post("/auth/register", { username, email, password });
        setSuccess("Cadastro realizado com sucesso! Mudando para o Login...");

        // Limpa o campo de username e joga o usuário para a aba de login
        setUsername("");
        setIsLogin(true);
      }
    } catch (err: unknown) {
      console.error(err);

      // Tipagem segura para destrinchar erros do Axios sem usar "any"
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        setError(
          axiosError.response?.data?.error ||
            "Ocorreu um erro ao processar a requisição.",
        );
      } else {
        setError("Ocorreu um erro inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <div
        className="card shadow-lg border-0 rounded-4 p-4 p-md-5 bg-white"
        style={{ width: "100%", maxWidth: "450px" }}
      >
        {/* Cabeçalho / Logo */}
        <div className="text-center mb-4">
          <div className="display-4 text-primary mb-2">
            <i className="bi bi-music-note-beamed"></i>
          </div>
          <h2 className="fw-bold text-dark">SellSong</h2>
          <p className="text-secondary small">
            A rede social para os apaixonados por música
          </p>
        </div>

        {/* Alternador de Abas (Tabs) */}
        <div className="nav nav-pills nav-fill bg-light rounded-3 p-1 mb-4">
          <button
            className={`nav-link fw-semibold rounded-3 py-2 ${isLogin ? "active bg-primary text-white" : "text-secondary"}`}
            onClick={() => {
              setIsLogin(true);
              setError("");
              setSuccess("");
            }}
          >
            Entrar
          </button>
          <button
            className={`nav-link fw-semibold rounded-3 py-2 ${!isLogin ? "active bg-primary text-white" : "text-secondary"}`}
            onClick={() => {
              setIsLogin(false);
              setError("");
              setSuccess("");
            }}
          >
            Cadastrar
          </button>
        </div>

        {/* Alertas de Feedback */}
        {error && (
          <div
            className="alert alert-danger d-flex align-items-center small py-2 rounded-3"
            role="alert"
          >
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {success && (
          <div
            className="alert alert-success d-flex align-items-center small py-2 rounded-3"
            role="alert"
          >
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          {/* Campo Nome de Usuário (Apenas no Cadastro) */}
          {!isLogin && (
            <div className="mb-3">
              <label className="form-label small fw-medium text-secondary">
                Nome de usuário
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light text-secondary border-end-0">
                  <i className="bi bi-person"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0"
                  placeholder="ex: joaodamusica"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Campo Email */}
          <div className="mb-3">
            <label className="form-label small fw-medium text-secondary">
              E-mail
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary border-end-0">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control bg-light border-start-0"
                placeholder="seuemail@exemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="mb-4">
            <label className="form-label small fw-medium text-secondary">
              Senha
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-secondary border-end-0">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className="form-control bg-light border-start-0"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold rounded-3 d-flex justify-content-center align-items-center"
            disabled={loading}
          >
            {loading ? (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
            ) : null}
            {isLogin ? "Entrar" : "Criar Conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
