import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Settings() {
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Carrega os dados atuais do usuário ao entrar na página
  useEffect(() => {
    const loadProfileData = async () => {
      // Pega e formata o token de forma segura dentro do efeito colateral
      const token = localStorage.getItem("@SellSong:token");
      const formattedToken = token?.startsWith("Bearer ")
        ? token
        : `Bearer ${token}`;

      try {
        const response = await axios.get(
          "http://localhost:3000/api/users/profile",
          { headers: { Authorization: formattedToken } },
        );

        // Adicione o "||" para forçar string vazia caso venha null do banco
        setUsername(response.data.username || "");
        setBio(response.data.bio || "");
        setAvatarUrl(response.data.avatarUrl || "");
      } catch (error) {
        console.error("Erro ao carregar dados de configuração:", error);
      }
    };
    loadProfileData();
  }, []); // Limpamos a dependência para rodar uma única vez ao montar a tela

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação opcional de tamanho (ex: limite de 2MB para não sobrecarregar)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: "danger", text: "A imagem deve ter no máximo 2MB." });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // O reader.result conterá a string base64 pronta da imagem
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // 🌟 CORREÇÃO: Pega o token atualizado na hora do clique de salvar
    const token = localStorage.getItem("@SellSong:token");
    const formattedToken = token?.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;

    try {
      await axios.put(
        "http://localhost:3000/api/users/profile",
        { bio, avatarUrl },
        { headers: { Authorization: formattedToken } },
      );
      setMessage({ type: "success", text: "Perfil updated com sucesso!" });

      // Força um reload rápido após 1s para atualizar os Widgets laterais com a foto nova
      setTimeout(() => window.location.reload(), 1200);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      setMessage({
        type: "danger",
        text: "Erro ao atualizar as configurações.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <div className="d-flex align-items-center mb-4 border-bottom pb-2">
        <h5 className="fw-bold text-dark m-0">
          <i className="bi bi-gear-fill text-primary me-2"></i>Configurações da
          Conta
        </h5>
      </div>

      {message.text && (
        <div
          className={`alert alert-${message.type} small py-2 rounded-3`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="d-flex flex-column gap-3">
        {/* Preview do Avatar */}
        <div className="text-center bg-light p-3 rounded-4 mb-2">
          <img
            src={
              avatarUrl ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${username || "default"}`
            }
            alt="Preview do perfil"
            className="rounded-circle border-3 bg-white shadow-sm p-1 mb-2"
            style={{ width: "90px", height: "90px", objectFit: "cover" }}
          />
          <span className="d-block text-muted x-small">@{username}</span>
        </div>

        {/* Escolher Foto da própria máquina */}
        <div>
          <label className="form-label small fw-semibold text-secondary mb-1">
            Foto de Perfil
          </label>
          <input
            type="file"
            className="form-control form-control-sm rounded-3 shadow-none"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="form-text xx-small text-muted">
            Escolha um arquivo JPG, PNG ou SVG do seu computador. Se não
            escolher nenhum, seu avatar do Dicebear continuará ativo.
          </div>
        </div>

        {/* Descrição / Bio */}
        <div>
          <label className="form-label small fw-semibold text-secondary mb-1">
            Descrição / Biografia
          </label>
          <textarea
            className="form-control form-control-sm rounded-3 shadow-none"
            rows={3}
            maxLength={160}
            placeholder="Conte um pouco sobre seu gosto musical..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <div className="text-end xx-small text-muted mt-1">
            {bio?.length || 0}/160 caracteres
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="text-end mt-2">
          <button
            type="submit"
            className="btn btn-sm btn-primary rounded-pill px-4 fw-semibold shadow-sm"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
