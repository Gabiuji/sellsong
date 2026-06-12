import { useState } from "react";
import api from "../services/api";

interface Track {
  id: string;
  name: string;
  artists: string;
  albumName: string;
  albumCover: string;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estados do Modal - Agora com suporte a float (ex: 3.5)
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [review, setReview] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState({
    type: "",
    text: "",
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/spotify/search?q=${encodeURIComponent(query)}`,
      );
      setTracks(response.data);
    } catch (err: unknown) {
      console.error(err);
      setError(
        "Não foi possível buscar as músicas. Tente novamente mais tarde.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Função para calcular se o mouse está na metade esquerda ou direita da estrela
  const calculateRatingValue = (
    e: React.MouseEvent<HTMLElement>,
    starIndex: number,
  ) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left; // Posição X do clique dentro da estrela
    const isLeftHalf = x < rect.width / 2;

    return isLeftHalf ? starIndex - 0.5 : starIndex;
  };

  const handlePublishReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrack || rating === 0) {
      setFeedbackMessage({
        type: "danger",
        text: "Por favor, selecione uma nota de 0.5 a 5 estrelas.",
      });
      return;
    }

    setSubmitLoading(true);
    setFeedbackMessage({ type: "", text: "" });

    try {
      // Garanta que o objeto enviado possui EXATAMENTE estes nomes de propriedades:
      await api.post("/posts", {
        spotifyTrackId: selectedTrack.id || "",
        trackName: selectedTrack.name || "Música Desconhecida",
        artistName: selectedTrack.artists || "Artista Desconhecida",
        albumCover: selectedTrack.albumCover || "",
        rating: Number(rating.toFixed(1)),
        review: review || "", // Garante string vazia se o usuário não digitar nada
      });

      setFeedbackMessage({
        type: "success",
        text: "Sua avaliação estilo Letterboxd foi publicada com sucesso!",
      });

      setTimeout(() => {
        setSelectedTrack(null);
        setRating(0);
        setReview("");
        setFeedbackMessage({ type: "", text: "" });
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      setFeedbackMessage({
        type: "danger",
        text: "Erro ao salvar sua resenha. Tente novamente.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper para renderizar o ícone de estrela correto com base na nota atual (real ou hover)
  const renderStarIcon = (starIndex: number) => {
    const activeRating = hoverRating || rating;

    if (activeRating >= starIndex) {
      return "bi-star-fill text-warning"; // Estrela Cheia
    } else if (activeRating === starIndex - 0.5) {
      return "bi-star-half text-warning"; // Meia Estrela!
    } else {
      return "bi-star text-muted"; // Estrela Vazia
    }
  };

  return (
    <div className="container py-4">
      {/* CABEÇALHO */}
      <div className="text-center mb-5">
        <h2 className="fw-bold text-dark mb-2">
          <i className="bi bi-search text-primary me-2"></i>Descubra Novas
          Músicas
        </h2>
        <p className="text-secondary">
          Explore o catálogo global do Spotify e encontre a trilha sonora para
          sua próxima resenha.
        </p>
      </div>

      {/* BARRA DE PESQUISA */}
      <div className="row justify-content-center mb-5">
        <div className="col-md-8 col-lg-6">
          <form
            onSubmit={handleSearch}
            className="card p-2 shadow-sm border-0 rounded-pill bg-white"
          >
            <div className="input-group">
              <span className="input-group-text bg-transparent border-0 text-secondary fs-5 ps-3">
                <i className="bi bi-music-note"></i>
              </span>
              <input
                type="text"
                className="form-control bg-transparent border-0 shadow-none fs-5"
                placeholder="Nome da música, artista ou álbum..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4 fw-semibold"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="bi bi-search me-2"></i>
                )}
                Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-4 text-center p-3 shadow-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="d-flex justify-content-center my-5">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
          ></div>
        </div>
      )}

      {/* GRADE DE RESULTADOS */}
      {!loading && tracks.length > 0 && (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
          {tracks.map((track) => (
            <div className="col" key={track.id}>
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden bg-white track-card">
                <img
                  src={track.albumCover || "https://via.placeholder.com/300"}
                  className="card-img-top img-fluid"
                  alt={track.name}
                />
                <div className="card-body d-flex flex-column p-3">
                  <h5
                    className="card-title fw-bold text-dark text-truncate mb-1"
                    title={track.name}
                  >
                    {track.name}
                  </h5>
                  <p className="card-text text-secondary small text-truncate mb-2">
                    <i className="bi bi-person-circle me-1"></i>
                    {track.artists}
                  </p>
                  <p className="card-text text-muted x-small text-truncate mb-3">
                    <i className="bi bi-disc me-1"></i>
                    {track.albumName}
                  </p>

                  <button
                    className="btn btn-outline-primary btn-sm rounded-pill fw-semibold w-100 mt-auto py-2"
                    onClick={() => setSelectedTrack(track)}
                  >
                    <i className="bi bi-star-fill text-warning me-2"></i>Avaliar
                    Música
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🌟 MODAL FLUTUANTE LETTERBOXD-STYLE 🌟 */}
      {selectedTrack && (
        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
          }}
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
              <div className="modal-header border-0 bg-light p-3 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold text-dark m-0">
                  Nova Resenha Crítica
                </h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setSelectedTrack(null)}
                ></button>
              </div>

              <form onSubmit={handlePublishReview}>
                <div className="modal-body p-4">
                  {feedbackMessage.text && (
                    <div
                      className={`alert alert-${feedbackMessage.type} small rounded-3 py-2 mb-3`}
                    >
                      {feedbackMessage.text}
                    </div>
                  )}

                  <div className="d-flex align-items-center bg-light p-3 rounded-4 mb-4">
                    <img
                      src={selectedTrack.albumCover}
                      alt={selectedTrack.name}
                      className="rounded-3 shadow-sm me-3"
                      style={{
                        width: "64px",
                        height: "64px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="overflow-hidden">
                      <h6 className="fw-bold text-dark m-0 text-truncate">
                        {selectedTrack.name}
                      </h6>
                      <p className="text-secondary small m-0 text-truncate">
                        {selectedTrack.artists}
                      </p>
                    </div>
                  </div>

                  {/* SELETOR INTERATIVO DE MEIAS ESTRELAS */}
                  <div className="text-center mb-4">
                    <label className="form-label d-block small fw-bold text-secondary mb-2">
                      Sua nota para esta faixa (Deslize para meia-estrela):
                    </label>
                    <div className="fs-2 user-select-none">
                      {[1, 2, 3, 4, 5].map((starIndex) => (
                        <i
                          key={starIndex}
                          className={`bi px-1 ${renderStarIcon(starIndex)}`}
                          style={{ cursor: "pointer", display: "inline-block" }}
                          onClick={(e) =>
                            setRating(calculateRatingValue(e, starIndex))
                          }
                          onMouseMove={(e) =>
                            setHoverRating(calculateRatingValue(e, starIndex))
                          }
                          onMouseLeave={() => setHoverRating(0)}
                        />
                      ))}
                    </div>
                    {rating > 0 && (
                      <span className="badge bg-warning-subtle text-warning fw-bold mt-2 px-3 py-1 rounded-pill fs-6">
                        <i className="bi bi-star-fill me-1"></i>{" "}
                        {rating.toFixed(1)} / 5.0
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">
                      O que você achou dessa música? (Opcional)
                    </label>
                    <textarea
                      className="form-control bg-light border-0 rounded-3 p-3 text-dark shadow-none"
                      rows={4}
                      placeholder="Escreva sua crítica musical no estilo Letterboxd..."
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0 p-3 bg-light d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4 fw-semibold border"
                    onClick={() => setSelectedTrack(null)}
                    disabled={submitLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 fw-semibold"
                    disabled={submitLoading || rating === 0}
                  >
                    {submitLoading ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <i className="bi bi-send-fill me-2"></i>
                    )}
                    Publicar Resenha
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
