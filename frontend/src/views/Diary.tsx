import React, { useState, useEffect } from "react";
import axios from "axios";

interface MyPost {
  id: number;
  trackName: string;
  artistName: string;
  albumCover: string;
  rating: number;
  review?: string;
  createdAt: string;
}

export default function Diary() {
  const [myPosts, setMyPosts] = useState<MyPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para controlar qual post está sendo editado no momento
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editReview, setEditReview] = useState("");

  const token = localStorage.getItem("@SellSong:token");
  const formattedToken = token?.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`;

  const fetchDiary = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/posts/diary",
        {
          headers: { Authorization: formattedToken },
        },
      );
      setMyPosts(response.data);
    } catch (error) {
      console.error("Erro ao carregar diário:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDiaryData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/posts/diary",
          {
            headers: { Authorization: formattedToken },
          },
        );
        setMyPosts(response.data);
      } catch (error) {
        console.error("Erro ao carregar diário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiaryData();
  }, [formattedToken]); // Sincroniza baseado no token de autenticação

  // Mantemos uma versão isolada para re-chamada apenas após atualizações (updates)
  const refreshDiaryAfterUpdate = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/posts/diary",
        {
          headers: { Authorization: formattedToken },
        },
      );
      setMyPosts(response.data);
    } catch (error) {
      console.error("Erro ao recarregar diário:", error);
    }
  };

  const startEdit = (post: MyPost) => {
    setEditingId(post.id);
    setEditRating(post.rating);
    setEditReview(post.review || "");
  };

  const handleUpdate = async (id: number) => {
    try {
      await axios.put(
        `http://localhost:3000/api/posts/${id}`,
        { rating: editRating, review: editReview },
        { headers: { Authorization: formattedToken } },
      );
      setEditingId(null);
      refreshDiaryAfterUpdate(); // Atualiza o estado pontualmente sem disparar efeitos em cascata
    } catch (error) {
      console.error("Erro ao atualizar post:", error);
      alert("Erro ao salvar alterações.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-muted small">
        Carregando seu diário...
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex align-items-center mb-4 border-bottom pb-2">
        <h5 className="fw-bold text-dark m-0">
          <i className="bi bi-journal-album text-primary me-2"></i>Meu Diário de
          Músicas
        </h5>
      </div>

      <div className="d-flex flex-column gap-3">
        {myPosts.length === 0 ? (
          <div className="text-center py-4 text-muted small">
            Você ainda não fez nenhuma avaliação. Busque uma música para começar
            seu diário!
          </div>
        ) : (
          myPosts.map((post) => (
            <div key={post.id} className="p-3 bg-light rounded-4 border">
              <div className="d-flex gap-3 align-items-start">
                <img
                  src={post.albumCover}
                  alt={post.trackName}
                  className="rounded-2 object-fit-cover shadow-xs"
                  style={{ width: "56px", height: "56px" }}
                />
                <div className="text-truncate flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between">
                    <strong className="text-dark small text-truncate d-block me-2">
                      {post.trackName}
                    </strong>
                    <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-0.5 x-small fw-bold">
                      ★ {post.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-muted xx-small d-block text-truncate mb-2">
                    {post.artistName}
                  </span>

                  {editingId !== post.id && post.review && (
                    <p className="text-dark x-small m-0 bg-white p-2 rounded border-start border-primary border-2">
                      {post.review}
                    </p>
                  )}
                </div>
              </div>

              {/* FORMULÁRIO DE EDIÇÃO EXPANSÍVEL */}
              {editingId === post.id ? (
                <div className="mt-3 pt-3 border-top bg-white p-3 rounded-3 border">
                  <div className="mb-3">
                    <label className="form-label xx-small fw-bold text-secondary mb-1">
                      Alterar Nota:{" "}
                      <span className="text-warning">
                        ★ {editRating.toFixed(1)}
                      </span>
                    </label>
                    <input
                      type="range"
                      className="form-range form-range-sm"
                      min="0.5"
                      max="5.0"
                      step="0.5"
                      value={editRating}
                      onChange={(e) =>
                        setEditRating(parseFloat(e.target.value))
                      }
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label xx-small fw-bold text-secondary mb-1">
                      Editar Comentário:
                    </label>
                    <textarea
                      className="form-control form-control-sm x-small rounded-2 shadow-none"
                      rows={2}
                      value={editReview}
                      onChange={(e) => setEditReview(e.target.value)}
                    />
                  </div>
                  <div className="text-end d-flex justify-content-end gap-2 mt-2">
                    <button
                      className="btn btn-xxs btn-light rounded-pill px-2.5 fw-semibold"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      className="btn btn-xxs btn-primary rounded-pill px-3 fw-semibold"
                      onClick={() => handleUpdate(post.id)}
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-end mt-2">
                  <button
                    className="btn btn-xs btn-outline-secondary rounded-pill px-3 text-xx-small"
                    onClick={() => startEdit(post)}
                  >
                    <i className="bi bi-pencil-fill me-1"></i> Editar Review
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
