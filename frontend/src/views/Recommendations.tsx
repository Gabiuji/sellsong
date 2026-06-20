import React, { useState, useEffect } from "react";
import axios from "axios";

interface RecommendedTrack {
  spotifyTrackId: string;
  trackName: string;
  artistName: string;
  albumCover: string;
  votesCount: number;
  averageRating: number;
}

export default function Recommendations() {
  const [tracks, setTracks] = useState<RecommendedTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("@SellSong:token");
        const formattedToken = token?.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;

        const response = await axios.get(
          "http://localhost:3000/api/posts/recommendations/weekly",
          {
            headers: { Authorization: formattedToken },
          },
        );
        setTracks(response.data);
      } catch (error) {
        console.error("Erro ao buscar recomendações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-4 text-muted small">
        Calculando as tendências da semana...
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex align-items-center mb-4 border-bottom pb-2">
        <h5 className="fw-bold text-dark m-0">
          <i className="bi bi-fire text-danger me-2"></i>Recomendações da Semana
        </h5>
        <span className="badge bg-dark rounded-pill ms-2 xx-small text-uppercase tracking-wider">
          Últimos 7 dias
        </span>
      </div>

      <div className="d-flex flex-column gap-3">
        {tracks.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            Nenhuma música avaliada na última semana. Seja o primeiro a
            compartilhar uma review!
          </div>
        ) : (
          tracks.map((track, index) => (
            <div
              key={track.spotifyTrackId}
              className="d-flex align-items-center justify-content-between p-3 bg-light rounded-4 border"
            >
              <div className="d-flex align-items-center gap-3 text-truncate me-2">
                {/* Posição no Ranking */}
                <span
                  className="fw-black fs-5 text-muted-opacity me-1 text-center"
                  style={{ width: "24px" }}
                >
                  #{index + 1}
                </span>

                <img
                  src={track.albumCover || "https://via.placeholder.com/150"}
                  alt={track.trackName}
                  className="rounded-3 border shadow-xs"
                  style={{ width: "52px", height: "52px", objectFit: "cover" }}
                />

                <div className="text-truncate">
                  <span className="fw-bold text-dark d-block small text-truncate">
                    {track.trackName}
                  </span>
                  <span className="text-muted xx-small d-block text-truncate">
                    {track.artistName}
                  </span>
                </div>
              </div>

              {/* Métricas de Engajamento */}
              <div className="d-flex align-items-center gap-2 shrink-0">
                <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill text-xx-small px-2">
                  {track.votesCount} {track.votesCount === 1 ? "voto" : "votos"}
                </span>
                <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-1 x-small fw-bold">
                  ★ {track.averageRating.toFixed(1)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
