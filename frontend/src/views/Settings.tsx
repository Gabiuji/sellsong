import { useState, useEffect } from "react";
import axios from "axios";

interface ConnectionUser {
  id: number;
  username: string;
  avatarUrl: string;
  bio: string;
  isFriend?: boolean;
  isFollowingBack?: boolean;
}

export default function Settings() {
  const [subTab, setSubTab] = useState<"profile" | "network">("profile");

  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [followers, setFollowers] = useState<ConnectionUser[]>([]);
  const [following, setFollowing] = useState<ConnectionUser[]>([]);

  const token = localStorage.getItem("@SellSong:token");
  const formattedToken = token?.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`;

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/users/profile",
          {
            headers: { Authorization: formattedToken },
          },
        );
        setUsername(response.data.username || "");
        setBio(response.data.bio || "");
        setAvatarUrl(response.data.avatarUrl || "");
      } catch (error) {
        console.error("Erro ao carregar dados de configuração:", error);
      }
    };
    loadProfileData();
  }, [formattedToken]);

  useEffect(() => {
    if (subTab !== "network") return;

    const fetchConnectionsData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/users/connections",
          {
            headers: { Authorization: formattedToken },
          },
        );
        setFollowers(response.data.followers);
        setFollowing(response.data.following);
      } catch (error) {
        console.error("Erro ao carregar lista de conexões:", error);
      }
    };

    fetchConnectionsData();
  }, [subTab, formattedToken]);

  const refreshConnectionsAfterUnfollow = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/users/connections",
        {
          headers: { Authorization: formattedToken },
        },
      );
      setFollowers(response.data.followers);
      setFollowing(response.data.following);
    } catch (error) {
      console.error("Erro ao recarregar conexões:", error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await axios.put(
        "http://localhost:3000/api/users/profile",
        { bio, avatarUrl },
        { headers: { Authorization: formattedToken } },
      );
      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
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

  const handleUnfollow = async (targetId: number) => {
    try {
      await axios.post(
        `http://localhost:3000/api/users/${targetId}/follow`,
        {},
        {
          headers: { Authorization: formattedToken },
        },
      );
      refreshConnectionsAfterUnfollow();
    } catch (error) {
      console.error("Erro ao dar unfollow:", error);
    }
  };

  return (
    <div className="p-1">
      <div className="d-flex gap-3 mb-4 border-bottom pb-2">
        <button
          className={`btn btn-sm fw-bold p-0 pb-2 rounded-0 shadow-none bg-transparent border-0 ${
            subTab === "profile"
              ? "text-primary border-bottom border-2 border-primary"
              : "text-muted"
          }`}
          onClick={() => setSubTab("profile")}
        >
          <i className="bi bi-person-fill-gear me-1"></i> Editar Perfil
        </button>
        <button
          className={`btn btn-sm fw-bold p-0 pb-2 rounded-0 shadow-none bg-transparent border-0 ${
            subTab === "network"
              ? "text-primary border-bottom border-2 border-primary"
              : "text-muted"
          }`}
          onClick={() => setSubTab("network")}
        >
          <i className="bi bi-person-hearts me-1"></i> Gerenciar Conexões
        </button>
      </div>

      {subTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="d-flex flex-column gap-3">
          {message.text && (
            <div
              className={`alert alert-${message.type} small py-2 rounded-3`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          <div className="text-center bg-light p-3 rounded-4 mb-2">
            <img
              src={
                avatarUrl ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${username || "default"}`
              }
              alt="Preview"
              className="rounded-circle border border-3 bg-white shadow-sm p-1 mb-2"
              style={{ width: "90px", height: "90px", objectFit: "cover" }}
            />
            <span className="d-block text-muted x-small">@{username}</span>
          </div>

          <div>
            <label className="form-label small fw-semibold text-secondary mb-1">
              Foto de Perfil
            </label>
            <input
              type="file"
              className="form-control form-control-sm rounded-3 shadow-none"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onloadend = () => setAvatarUrl(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </div>

          <div>
            <label className="form-label small fw-semibold text-secondary mb-1">
              Descrição / Biografia
            </label>
            <textarea
              className="form-control form-control-sm rounded-3 shadow-none"
              rows={3}
              maxLength={160}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <div className="text-end xx-small text-muted mt-1">
              {bio?.length || 0}/160 caracteres
            </div>
          </div>

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
      )}

      {subTab === "network" && (
        <div className="d-flex flex-column gap-4">
          <div>
            <h6 className="fw-bold text-dark border-bottom pb-1 mb-3 small">
              <i className="bi bi-arrow-up-right-circle text-primary me-1"></i>{" "}
              Quem você segue
            </h6>
            <div className="d-flex flex-column gap-2">
              {following.length === 0 ? (
                <span className="text-muted xx-small text-center d-block py-2">
                  Você não está seguindo ninguém ainda.
                </span>
              ) : (
                following.map((u) => (
                  <div
                    key={u.id}
                    className="d-flex align-items-center justify-content-between p-2 bg-light rounded-3 border"
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate me-2">
                      <img
                        src={
                          u.avatarUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`
                        }
                        alt={u.username}
                        className="rounded-circle border bg-white"
                        style={{
                          width: "36px",
                          height: "36px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="text-truncate">
                        <span className="fw-bold text-dark d-block x-small">
                          @{u.username}
                        </span>
                        {u.isFriend && (
                          <span className="badge bg-success-subtle text-success-emphasis rounded-pill text-xx-small px-1.5">
                            🤝 Segue você
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className="btn btn-xxs btn-outline-danger rounded-pill px-2.5 fw-semibold"
                      onClick={() => handleUnfollow(u.id)}
                    >
                      Deixar de Seguir
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h6 className="fw-bold text-dark border-bottom pb-1 mb-3 small">
              <i className="bi bi-arrow-down-left-circle text-success me-1"></i>{" "}
              Seus seguidores
            </h6>
            <div className="d-flex flex-column gap-2">
              {followers.length === 0 ? (
                <span className="text-muted xx-small text-center d-block py-2">
                  Ninguém segue você ainda.
                </span>
              ) : (
                followers.map((u) => (
                  <div
                    key={u.id}
                    className="d-flex align-items-center justify-content-between p-2 bg-light rounded-3 border"
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate me-2">
                      <img
                        src={
                          u.avatarUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`
                        }
                        alt={u.username}
                        className="rounded-circle border bg-white"
                        style={{
                          width: "36px",
                          height: "36px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="text-truncate">
                        <span className="fw-bold text-dark d-block x-small">
                          @{u.username}
                        </span>
                        {u.isFollowingBack ? (
                          <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill text-xx-small px-1.5">
                            🤝 Amigos
                          </span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill text-xx-small px-1.5">
                            Você não segue de volta
                          </span>
                        )}
                      </div>
                    </div>
                    {u.isFollowingBack ? (
                      <button
                        className="btn btn-xxs btn-outline-secondary rounded-pill px-2.5"
                        onClick={() => handleUnfollow(u.id)}
                      >
                        Unfollow
                      </button>
                    ) : (
                      <button
                        className="btn btn-xxs btn-primary rounded-pill px-2.5 fw-bold"
                        onClick={() => handleUnfollow(u.id)}
                      >
                        + Seguir de volta
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
