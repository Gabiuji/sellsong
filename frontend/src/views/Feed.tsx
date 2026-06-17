import React, { useState, useEffect } from "react";
import axios from "axios";

interface Post {
  id: number;
  trackName: string;
  artistName: string;
  albumCover: string;
  rating: number;
  review?: string;
  createdAt: string;
  author: {
    username: string;
    avatarUrl?: string;
  };
}

interface FeedProps {
  refreshTrigger: number; // Disparador para atualizar o feed quando um post novo for criado
}

export default function Feed({ refreshTrigger }: FeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      const token = localStorage.getItem("@SellSong:token");
      if (!token) return;

      try {
        const formattedToken = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;
        const response = await axios.get("http://localhost:3000/api/posts", {
          headers: { Authorization: formattedToken },
        });
        setPosts(response.data);
      } catch (error) {
        console.error("Erro ao carregar o feed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="text-center py-4 text-muted small">
        Carregando a timeline...
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3 mt-4">
      <div className="d-flex align-items-center mb-1">
        <h5 className="fw-bold text-dark m-0">Feed da sua Rede</h5>
        <span className="badge bg-primary rounded-pill ms-2 small">
          Novidades
        </span>
      </div>

      {posts.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-secondary bg-white">
          <i className="bi bi-chat-square-heart fs-2 text-muted mb-2"></i>
          <p className="m-0 small">
            As avaliações dos seus amigos e as suas aparecerão aqui em tempo
            real! Siga mais pessoas para povoar seu feed.
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="card border shadow-sm rounded-4 p-3 bg-white border"
          >
            {/* Cabeçalho do Post (Autor) */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <img
                src={
                  post.author.avatarUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${post.author.username}`
                }
                alt={post.author.username}
                className="rounded-circle border"
                style={{ width: "36px", height: "36px", objectFit: "cover" }}
              />
              <div>
                <span className="fw-bold text-dark d-block small">
                  @{post.author.username}
                </span>
                <span className="text-muted xx-small">
                  {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>

            {/* Conteúdo da Review da Música */}
            <div className="d-flex gap-3 bg-light p-2 rounded-3 border mb-2">
              <img
                src={post.albumCover}
                alt={post.trackName}
                className="rounded-2 shadow-xs"
                style={{ width: "64px", height: "64px", objectFit: "cover" }}
              />
              <div className="text-truncate grow">
                <div className="d-flex align-items-center justify-content-between">
                  <strong className="text-dark small text-truncate d-block me-2">
                    {post.trackName}
                  </strong>
                  <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-0.5 x-small fw-bold whitespace-nowrap">
                    ★ {post.rating.toFixed(1)}
                  </span>
                </div>
                <span className="text-muted xx-small d-block text-truncate mb-1">
                  {post.artistName}
                </span>
                {post.review && (
                  <p className="text-dark x-small m-0 text-truncate-2 p-1.5 rounded border-start border-primary border-2 mt-1">
                    {post.review}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
