import React, { useState, useEffect } from "react";
import axios from "axios";

interface ProfileData {
  username: string;
  reviewCount: number;
  followersCount: number;
  followingCount: number;
  avatarUrl?: string;
  bio?: string;
}

interface ConnectionUser {
  id: number;
  username: string;
  avatarUrl: string;
}

interface ProfileWidgetProps {
  setActiveTab: (tab: "feed" | "settings" | "users" | "diary") => void;
}

export default function ProfileWidget({ setActiveTab }: ProfileWidgetProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  // Estados para os Modais Sociais
  const [modalType, setModalType] = useState<"followers" | "following" | null>(
    null,
  );
  const [connectionsList, setConnectionsList] = useState<ConnectionUser[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem("@SellSong:token");
  const formattedToken = token?.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`;

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!token) return;
      try {
        const response = await axios.get(
          "http://localhost:3000/api/users/profile",
          {
            headers: { Authorization: formattedToken },
          },
        );
        if (mounted) setProfile(response.data);
      } catch (error) {
        console.error("Erro ao carregar ProfileWidget:", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [formattedToken]);

  // Abre a lista social e carrega do back
  const handleOpenConnections = async (type: "followers" | "following") => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/users/connections",
        {
          headers: { Authorization: formattedToken },
        },
      );
      setConnectionsList(response.data[type] || []);
      setModalType(type);
      setCurrentPage(1); // Reinicia na primeira página
    } catch (error) {
      console.error(`Erro ao carregar ${type}:`, error);
    }
  };

  // Paginação estilo Carrossel/Abas
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = connectionsList.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(connectionsList.length / itemsPerPage);

  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 mb-3 bg-white">
      <div className="d-flex flex-column align-items-center text-center">
        <div className="mb-2">
          <img
            src={
              profile?.avatarUrl ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || "default"}`
            }
            alt="Avatar"
            className="rounded-circle border-2 p-1"
            style={{ width: "72px", height: "72px", objectFit: "cover" }}
          />
        </div>
        <h6 className="fw-bold text-dark mb-0">
          @{profile?.username || "carregando..."}
        </h6>
        <span className="text-muted x-small">Membro do SellSong</span>

        {profile?.bio && (
          <p
            className="text-muted xx-small mt-2 mb-0 px-2 text-truncate-2"
            style={{ maxWidth: "100%" }}
          >
            {profile.bio}
          </p>
        )}

        {/* PAINEL DE MÉTRICAS COMPACTO ATIVADO */}
        <div className="w-100 border-top mt-3 pt-3 d-flex justify-content-between align-items-center px-1">
          {/* REVIEWS -> REDIRECIONA PRO DIÁRIO */}
          <div
            className="text-center grow cursor-pointer hover-scale"
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTab("diary")}
          >
            <span className="fw-bold text-primary d-block small">
              {profile?.reviewCount ?? 0}
            </span>
            <span className="text-muted xx-small uppercase fw-bold">
              Reviews
            </span>
          </div>

          <div className="border-start" style={{ height: "24px" }}></div>

          {/* SEGUIDORES -> ABRE LISTA */}
          <div
            className="text-center grow cursor-pointer hover-scale"
            style={{ cursor: "pointer" }}
            onClick={() => handleOpenConnections("followers")}
          >
            <span className="fw-bold text-dark d-block small">
              {profile?.followersCount ?? 0}
            </span>
            <span className="text-muted xx-small uppercase fw-bold">
              Seguidores
            </span>
          </div>

          <div className="border-start" style={{ height: "24px" }}></div>

          {/* SEGUINDO -> ABRE LISTA */}
          <div
            className="text-center grow cursor-pointer hover-scale"
            style={{ cursor: "pointer" }}
            onClick={() => handleOpenConnections("following")}
          >
            <span className="fw-bold text-dark d-block small">
              {profile?.followingCount ?? 0}
            </span>
            <span className="text-muted xx-small uppercase fw-bold">
              Seguindo
            </span>
          </div>
        </div>
      </div>

      {/* MODAL SOCIAL DO PROFILE WIDGET */}
      {modalType && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-sm"
            style={{ maxWidth: "350px" }}
          >
            <div className="modal-content bg-dark text-white rounded-4 border-0 p-3">
              <div className="modal-header border-0 pb-1 pt-1 d-flex justify-content-between align-items-center">
                <h6 className="modal-title fw-bold">
                  {modalType === "followers"
                    ? "👥 Seus Seguidores"
                    : "🎵 Quem Você Segue"}
                </h6>
                <button
                  type="button"
                  className="btn-close btn-close-white shadow-none"
                  onClick={() => setModalType(null)}
                ></button>
              </div>

              <div
                className="modal-body py-2 d-flex flex-column gap-2 overflow-y-auto"
                style={{ maxHeight: "320px" }}
              >
                {connectionsList.length === 0 ? (
                  <div className="text-center py-4 text-white-50 x-small">
                    Nenhum registro encontrado.
                  </div>
                ) : (
                  currentItems.map((u) => (
                    <div
                      key={u.id}
                      className="d-flex align-items-center gap-3 p-2 rounded-3 bg-black bg-opacity-20 border border-secondary border-opacity-25"
                    >
                      <img
                        src={
                          u.avatarUrl ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username}`
                        }
                        alt={u.username}
                        className="rounded-circle border bg-white"
                        style={{
                          width: "32px",
                          height: "32px",
                          objectFit: "cover",
                        }}
                      />
                      <span className="fw-bold small text-truncate">
                        @{u.username}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* CARROSSEL / ABAS DE PAGINAÇÃO SE EXCEDER 10 */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center gap-1 mt-2 border-top border-secondary border-opacity-25 pt-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        className={`btn btn-xxs rounded px-2 py-0.5 fw-bold ${currentPage === page ? "btn-primary text-white" : "btn-outline-secondary text-white-50"}`}
                        style={{ fontSize: "0.65rem" }}
                        onClick={() => setCurrentPage(page)}
                      >
                        Pág. {page}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
