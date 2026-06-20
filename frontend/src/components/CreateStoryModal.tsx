import React, { useState } from "react";
import axios from "axios";

// Ajustando a interface de faixas para bater exatamente com o que a rota do Spotify retorna
interface Track {
  id: string;
  name: string;
  artist?: string;
  artists?: string;
  album?: string;
  albumCover?: string;
  previewUrl?: string | null;
  spotifyUrl?: string;
}

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: () => void;
}

// Gêneros permitidos (sincronizado com o backend em src/controllers/storyController.ts)
const ALLOWED_GENRES = [
  "pop",
  "rock",
  "hip-hop",
  "r&b",
  "jazz",
  "classical",
  "electronic",
  "country",
  "reggae",
  "blues",
  "indie",
  "metal",
  "folk",
  "soul",
  "funk",
  "latin",
  "alternative",
  "outros",
] as const;

export default function CreateStoryModal({
  isOpen,
  onClose,
  onStoryCreated,
}: CreateStoryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [caption, setCaption] = useState("");
  const [genreTag, setGenreTag] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("@SellSong:token");
  const formattedToken = token?.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`;

  if (!isOpen) return null;

  const handleSearchTracks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setError("");
      // Batendo no endpoint oficial do backend para consultar o Spotify
      const response = await axios.get(
        `http://localhost:3000/api/spotify/search`,
        {
          headers: { Authorization: formattedToken },
          params: { q: searchQuery, type: "track" },
        },
      );
      setSearchResults(response.data);
    } catch (err: unknown) {
      console.error("Erro ao buscar músicas:", err);
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error || "Erro ao buscar faixas do Spotify.",
        );
      } else {
        setError("Erro ao buscar faixas do Spotify.");
      }
    }
  };

  const handlePublishStory = async () => {
    if (!selectedTrack || !caption.trim() || !genreTag.trim()) {
      setError("Preencha todos os campos antes de publicar.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(
        "http://localhost:3000/api/stories",
        {
          spotifyTrackId: selectedTrack.id,
          trackName: selectedTrack.name,
          artistName:
            selectedTrack.artist ||
            selectedTrack.artists ||
            "Artista Desconhecido",
          albumCover: selectedTrack.albumCover || "",
          previewUrl: previewUrl.trim() || selectedTrack.previewUrl || null,
          spotifyUrl: selectedTrack.spotifyUrl || null,
          caption,
          genreTag,
        },
        { headers: { Authorization: formattedToken } },
      );

      setCaption("");
      setGenreTag("");
      setPreviewUrl("");
      setSelectedTrack(null);
      setSearchResults([]);
      setSearchQuery("");
      onStoryCreated();
      onClose();
    } catch (err: unknown) {
      console.error("Erro ao publicar story:", err);
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error || "Erro interno ao publicar recomendação.",
        );
      } else {
        setError("Erro interno ao publicar recomendação.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(9, 7, 15, 0.8)" }}
      tabIndex={-1}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "480px" }}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 p-3">
          <div className="modal-header border-0 pb-1">
            <h5 className="modal-title fw-bold">🎵 Nova Recomendação Diária</h5>
            <button
              type="button"
              className="btn-close shadow-none"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body py-2">
            {error && (
              <div
                className="alert alert-danger py-2 small rounded-3"
                role="alert"
              >
                {error}
              </div>
            )}

            {!selectedTrack ? (
              <>
                <form
                  onSubmit={handleSearchTracks}
                  className="d-flex gap-2 mb-3"
                >
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-pill px-3 shadow-none"
                    placeholder="Busque a música do dia no Spotify..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-sm btn-primary rounded-pill px-3"
                  >
                    Buscar
                  </button>
                </form>

                <div className="overflow-y-auto" style={{ maxHeight: "240px" }}>
                  {searchResults.map((track) => (
                    <div
                      key={track.id}
                      className="d-flex align-items-center justify-content-between p-2 mb-2 rounded-3 bg-light border cursor-pointer hover-shadow transition"
                      onClick={() => setSelectedTrack(track)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center gap-2 text-truncate">
                        <img
                          src={
                            track.albumCover || "https://via.placeholder.com/40"
                          }
                          alt={track.name}
                          className="rounded border"
                          style={{
                            width: "40px",
                            height: "40px",
                            objectFit: "cover",
                          }}
                        />
                        <div className="text-truncate">
                          <span className="fw-bold d-block x-small text-truncate">
                            {track.name}
                          </span>
                          <span className="text-muted xx-small text-truncate">
                            {track.artist || track.artists}
                          </span>
                        </div>
                      </div>
                      <i className="bi bi-plus-circle text-primary fs-5 pe-2"></i>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light border">
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src={
                        selectedTrack.albumCover ||
                        "https://via.placeholder.com/50"
                      }
                      alt={selectedTrack.name}
                      className="rounded border"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                    <div>
                      <span className="fw-bold d-block small">
                        {selectedTrack.name}
                      </span>
                      <span className="text-muted x-small">
                        {selectedTrack.artist || selectedTrack.artists}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-link text-danger p-0 border-0 text-decoration-none x-small"
                    onClick={() => setSelectedTrack(null)}
                  >
                    Mudar
                  </button>
                </div>

                <div>
                  <label className="form-label xx-small fw-bold uppercase text-muted mb-2 tracking-wider d-block">
                    Gênero Musical
                  </label>

                  {/* CONTAINER EM GRID/FLEX PARA COMPACTAR OS BOTÕES LADO A LADO */}
                  <div
                    className="d-flex flex-wrap gap-1.5 overflow-y-auto pe-1"
                    style={{ maxHeight: "115px" }}
                  >
                    {ALLOWED_GENRES.map((genre) => {
                      const isSelected = genreTag === genre;
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => setGenreTag(isSelected ? "" : genre)} // Se clicar no já selecionado, desmarca
                          className={`btn btn-xs rounded-pill fw-semibold border transition-all text-capitalize px-2.5 py-1 ${
                            isSelected
                              ? "btn-primary border-primary text-white shadow-sm" // Destacado (Roxo/Azul do seu sistema)
                              : "bg-white bg-opacity-5 text-white-50 border-secondary border-opacity-10 hover-bg-purple-subtle" // Neutro escuro
                          }`}
                          style={{
                            fontSize: "0.7rem",
                            letterSpacing: "0.3px",
                          }}
                        >
                          {genre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="form-label xx-small fw-bold uppercase text-muted mb-1">
                    O que tem de especial hoje? (Opcional)
                  </label>
                  <textarea
                    className="form-control form-control-sm rounded-3 shadow-none"
                    rows={3}
                    maxLength={150}
                    placeholder="Por que essa faixa te define hoje? Descrição rápida..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                  <div className="text-end xx-small text-muted mt-1">
                    {caption.length}/150 caracteres
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer border-0 pt-2 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-sm btn-light rounded-pill px-3 fw-semibold"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary rounded-pill px-4 fw-semibold shadow-sm"
              disabled={loading || !selectedTrack}
              onClick={handlePublishStory}
            >
              {loading ? "Publicando..." : "Soltar Story"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
