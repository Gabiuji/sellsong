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

export default function ProfileWidget() {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("@SellSong:token");
      if (!token) return;

      try {
        const formattedToken = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;
        const response = await axios.get(
          "http://localhost:3000/api/users/profile",
          {
            headers: { Authorization: formattedToken },
          },
        );
        setProfile(response.data);
      } catch (error) {
        console.error("Erro ao carregar ProfileWidget:", error);
      }
    };

    fetchProfile();
  }, []);

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

        {/* Renderiza a biografia resumida se existir */}
        {profile?.bio && (
          <p
            className="text-muted xx-small mt-2 mb-0 px-2 text-truncate-2"
            style={{ maxWidth: "100%" }}
          >
            {profile.bio}
          </p>
        )}

        {/* 📊 PAINEL DE MÉTRICAS COMPACTO */}
        <div className="w-100 border-top mt-3 pt-3 d-flex justify-content-between align-items-center px-1">
          <div className="text-center grow">
            <span className="fw-bold text-primary d-block small">
              {profile?.reviewCount ?? 0}
            </span>
            <span className="text-muted xx-small uppercase fw-bold">
              Reviews
            </span>
          </div>

          <div className="border-start" style={{ height: "24px" }}></div>

          <div className="text-center grow">
            <span className="fw-bold text-dark d-block small">
              {profile?.followersCount ?? 0}
            </span>
            <span className="text-muted xx-small uppercase fw-bold">
              Seguidores
            </span>
          </div>

          <div className="border-start" style={{ height: "24px" }}></div>

          <div className="text-center grow">
            <span className="fw-bold text-dark d-block small">
              {profile?.followingCount ?? 0}
            </span>
            <span className="text-muted xx-small uppercase fw-bold">
              Seguindo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
