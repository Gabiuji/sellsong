import React, { useState } from "react";
import axios from "axios";

interface SystemUser {
  id: number;
  username: string;
  avatarUrl: string;
  bio: string;
  isFollowing: boolean;
  isFriend: boolean;
}

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("@SellSong:token");
  const formattedToken = token?.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);

    try {
      const response = await axios.get(
        "http://localhost:3000/api/users/search",
        {
          headers: { Authorization: formattedToken },
          params: { q: query },
        },
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetId: number) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/api/users/${targetId}/follow`,
        {},
        { headers: { Authorization: formattedToken } },
      );

      // Atualiza o estado local do card dinamicamente após clicar
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id === targetId) {
            const updatedFollowing = response.data.isFollowing;
            return {
              ...u,
              isFollowing: updatedFollowing,
              // Força o recálculo visual da amizade se necessário
              isFriend: updatedFollowing ? u.isFriend : false,
            };
          }
          return u;
        }),
      );
    } catch (error) {
      console.error("Erro ao alterar vinculo de follow:", error);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center mb-4 border-bottom pb-2">
        <h5 className="fw-bold text-dark m-0">
          <i className="bi bi-people-fill text-primary me-2"></i>Encontrar
          Amigos
        </h5>
      </div>

      <form onSubmit={handleSearch} className="input-group mb-4">
        <input
          type="text"
          className="form-control rounded-start-pill border-end-0 bg-light shadow-none ps-3 small"
          placeholder="Procure por um @username no sistema..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="btn btn-primary rounded-end-pill px-4 fw-semibold"
          disabled={loading}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      <div className="d-flex flex-column gap-3">
        {users.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            Digite o nome de outros perfis para criar sua rede de amigos.
          </div>
        ) : (
          users.map((item) => (
            <div
              key={item.id}
              className="d-flex align-items-center justify-content-between p-3 bg-light rounded-4 border"
            >
              <div className="d-flex align-items-center gap-3 text-truncate me-2">
                <img
                  src={
                    item.avatarUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${item.username}`
                  }
                  alt={item.username}
                  className="rounded-circle border bg-white"
                  style={{ width: "48px", height: "48px", objectFit: "cover" }}
                />
                <div className="text-truncate">
                  <span className="fw-bold text-dark d-block small">
                    @{item.username}
                  </span>
                  <span
                    className="text-muted xx-small text-truncate d-block"
                    style={{ maxWidth: "250px" }}
                  >
                    {item.bio || "Sem biografia ainda."}
                  </span>
                </div>
              </div>

              <div>
                {/* BOTÃO SOCIAL ADAPTÁVEL */}
                <button
                  className={`btn btn-xs rounded-pill px-3 fw-bold shadow-xs ${
                    item.isFriend
                      ? "btn-success" // Exibe verde com aperto de mão se forem amigos mútuos
                      : item.isFollowing
                        ? "btn-secondary" // Exibe cinza caso você já o siga
                        : "btn-outline-primary" // Exibe azul vazado se for alguém novo
                  }`}
                  onClick={() => handleFollowToggle(item.id)}
                >
                  {item.isFriend ? (
                    <>🤝 Amigos</>
                  ) : item.isFollowing ? (
                    <>Seguindo</>
                  ) : (
                    <>+ Seguir</>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
