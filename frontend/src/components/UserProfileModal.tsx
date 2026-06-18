import React, { useState, useEffect } from "react";
import axios from "axios";
import TopFourPanel from "./TopFourPanel";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number; // ID do usuário que queremos inspecionar
}

interface PublicProfileData {
  id: number;
  username: string;
  avatarUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  userId,
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchPublicProfile = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/users/public/${userId}`,
        );
        setProfile(response.data);
      } catch (error) {
        console.error("Erro ao carregar dados do perfil público:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(9, 7, 15, 0.9)" }}
      tabIndex={-1}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        style={{ maxWidth: "650px" }}
      >
        <div className="modal-content border-0 shadow-lg bg-dark text-white rounded-4 p-4 position-relative overflow-hidden">
          {/* Botão de Fechar Superior */}
          <div
            className="position-absolute top-0 end-0 m-3"
            style={{ zIndex: 10 }}
          >
            <button
              type="button"
              className="btn-close btn-close-white shadow-none"
              onClick={onClose}
            ></button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-purple" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : profile ? (
            <div className="modal-body p-0">
              {/* HEADER DO PERFIL DETALHADO */}
              <div className="d-flex flex-column flex-sm-row align-items-center gap-4 border-bottom border-secondary border-opacity-25 pb-4 mb-3">
                <img
                  src={
                    profile.avatarUrl ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${profile.username}`
                  }
                  alt={profile.username}
                  className="rounded-circle bg-white border border-secondary shadow-sm object-fit-cover"
                  style={{ width: "96px", height: "96px" }}
                />

                <div className="text-center text-sm-start grow">
                  <h4 className="fw-bold text-white mb-1">
                    @{profile.username}
                  </h4>
                  <p className="text-muted small mb-2 italic">
                    Membro do SellSong
                  </p>

                  {/* Contadores de Seguidores/Seguindo */}
                  <div className="d-flex justify-content-center justify-content-sm-start gap-4 my-2 text-white-50 small">
                    <div>
                      <strong className="text-white">
                        {profile.followersCount}
                      </strong>{" "}
                      seguidores
                    </div>
                    <div>
                      <strong className="text-white">
                        {profile.followingCount}
                      </strong>{" "}
                      seguindo
                    </div>
                  </div>
                </div>
              </div>

              {/* BIO / DESCRITIVO */}
              <div className="bg-black bg-opacity-20 p-3 rounded-3 border border-secondary border-opacity-25 my-3">
                <span className="xx-small text-muted fw-bold text-uppercase tracking-wider d-block mb-1">
                  Biografia
                </span>
                <p className="small text-white-50 m-0">"{profile.bio}"</p>
              </div>

              {/* COMPONENTE DOS 4 FAVORITOS INJETADO DINAMICAMENTE */}
              <div className="mt-2">
                <TopFourPanel userId={profile.id} />
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-danger">
              Não foi possível carregar os dados deste usuário.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
