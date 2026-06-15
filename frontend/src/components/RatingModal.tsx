import React, { useState } from "react";
import axios from "axios";

interface TrackData {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
}

interface RatingModalProps {
  track: TrackData | null;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function RatingModal({
  track,
  onClose,
  onPostCreated,
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(5.0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  if (!track) return null;

  const artistName = track.artists.map((a) => a.name).join(", ");
  const albumCover = track.album.images[0]?.url || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("@SellSong:token");
    const formattedToken = token?.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;

    try {
      await axios.post(
        "http://localhost:3000/api/posts",
        {
          spotifyTrackId: track.id,
          trackName: track.name,
          artistName,
          albumCover,
          rating,
          review,
        },
        { headers: { Authorization: formattedToken } },
      );

      onPostCreated(); // Avisa o feed para se atualizar
      onClose(); // Fecha o modal
    } catch (error) {
      console.error("Erro ao compartilhar review:", error);
      alert("Erro ao publicar sua avaliação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow rounded-4 p-2">
          <div className="modal-header border-0 pb-0">
            <h6 className="modal-title fw-bold text-dark">
              Compartilhar Avaliação
            </h6>
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={onClose}
            ></button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="modal-body d-flex flex-column gap-3"
          >
            {/* Bloco da música selecionada */}
            <div className="d-flex align-items-center gap-3 bg-light p-2 rounded-3 border">
              <img
                src={albumCover}
                alt={track.name}
                className="rounded-2 shadow-xs"
                style={{ width: "56px", height: "56px", objectFit: "cover" }}
              />
              <div className="text-truncate">
                <strong className="d-block text-dark small text-truncate">
                  {track.name}
                </strong>
                <span className="text-muted xx-small d-block text-truncate">
                  {artistName}
                </span>
              </div>
            </div>

            {/* Seletor de Nota (Estilo Letterboxd de 0.5 a 5 estrelas) */}
            <div>
              <label className="form-label small fw-semibold text-secondary mb-1">
                Sua nota:{" "}
                <span className="text-warning fw-bold">
                  ★ {rating.toFixed(1)}
                </span>
              </label>
              <input
                type="range"
                className="form-range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
              />
              <div className="d-flex justify-content-between xx-small text-muted px-1">
                <span>0.5</span>
                <span>2.5</span>
                <span>5.0</span>
              </div>
            </div>

            {/* Texto da Review */}
            <div>
              <label className="form-label small fw-semibold text-secondary mb-1">
                O que achou da faixa? (Opcional)
              </label>
              <textarea
                className="form-control form-control-sm rounded-3 shadow-none"
                rows={3}
                placeholder="Escreva sua review..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>

            {/* Botões */}
            <div className="d-flex justify-content-end gap-2 pt-2 border-top">
              <button
                type="button"
                className="btn btn-sm btn-light rounded-pill px-3 fw-semibold"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-primary rounded-pill px-4 fw-semibold shadow-sm"
                disabled={loading}
              >
                {loading ? "Compartilhando..." : "Publicar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
