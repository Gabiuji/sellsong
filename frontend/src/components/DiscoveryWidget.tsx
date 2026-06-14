import React, { useState, useEffect } from "react";
import axios from "axios";

interface PopularItem {
  id: string;
  trackName: string;
  artistName: string;
  albumCover: string;
  rating: number;
}

export default function DiscoveryWidget() {
  const [populars, setPopulars] = useState<PopularItem[]>([]);

  useEffect(() => {
    const fetchPopulars = async () => {
      const token = localStorage.getItem("@SellSong:token");
      if (!token) return;

      try {
        const formattedToken = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;
        const response = await axios.get(
          "http://localhost:3000/api/posts/popular",
          {
            headers: { Authorization: formattedToken },
          },
        );
        setPopulars(response.data);
      } catch (error) {
        console.error("Erro ao carregar DiscoveryWidget:", error);
      }
    };

    fetchPopulars();
  }, []);

  return (
    <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
      <h6 className="fw-bold text-dark mb-3">🔥 Bombando no App</h6>
      <div className="d-flex flex-column gap-3">
        {populars.length === 0 ? (
          <span className="text-muted x-small text-center py-2">
            Nenhuma review recente com nota alta.
          </span>
        ) : (
          populars.map((item) => (
            <div key={item.id} className="d-flex align-items-center gap-2">
              <img
                src={item.albumCover || "https://via.placeholder.com/40"}
                alt={item.trackName}
                className="rounded-2 object-fit-cover shadow-xs"
                style={{ width: "40px", height: "40px" }}
              />
              <div className="text-truncate grow">
                <span className="fw-semibold text-dark d-block text-truncate small lh-sm">
                  {item.trackName}
                </span>
                <span className="text-muted xx-small d-block text-truncate">
                  {item.artistName}
                </span>
              </div>
              <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-1 x-small fw-bold">
                ★ {item.rating}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
