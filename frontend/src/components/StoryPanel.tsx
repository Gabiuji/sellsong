import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CreateStoryModal from "./CreateStoryModal";

interface Story {
  id: number;
  trackName: string;
  artistName: string;
  albumCover: string;
  previewUrl: string | null;
  spotifyUrl: string | null;
  caption: string;
  genreTag: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    avatarUrl: string;
  };
}

export default function StoryPanel() {
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  // Estado para controlar a abertura do modal de criação
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const userStorage = localStorage.getItem("@SellSong:user");
  const loggedInUsername = userStorage ? JSON.parse(userStorage).username : "";

  const token = localStorage.getItem("@SellSong:token");
  const formattedToken = token?.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`;

  // Função isolada para busca de stories (permite Refresh)
  const fetchStoriesData = async () => {
    if (!formattedToken || formattedToken === "Bearer null") return;
    try {
      const response = await axios.get("http://localhost:3000/api/stories", {
        headers: { Authorization: formattedToken },
      });
      setStories(response.data);
    } catch (error) {
      console.error("Erro ao carregar stories:", error);
    }
  };

  // Função para deletar um story específico
  const handleDeleteStory = async (storyId: number) => {
    if (
      !window.confirm(
        "Tem certeza que deseja apagar a sua recomendação de hoje?",
      )
    )
      return;

    try {
      await axios.delete(`http://localhost:3000/api/stories/${storyId}`, {
        headers: { Authorization: formattedToken },
      });
      setActiveStory(null); // Fecha o modal
      fetchStoriesData(); // Dá refresh na lista
    } catch (error) {
      console.error("Erro ao deletar story:", error);
      alert("Não foi possível excluir o story.");
    }
  };

  useEffect(() => {
    if (!formattedToken || formattedToken === "Bearer null") return;
    let mounted = true;

    (async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/stories", {
          headers: { Authorization: formattedToken },
        });
        if (mounted) setStories(response.data);
      } catch (error) {
        console.error("Erro ao carregar stories:", error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [formattedToken]);

  // Gerencia o áudio de micro-audição ao abrir/fechar o story
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);

      if (activeStory?.previewUrl) {
        audioRef.current.src = activeStory.previewUrl;
        audioRef.current.volume = 0.4;
        audioRef.current.load(); // FORÇA O NAVEGADOR A RECARREGAR A NOVA MÚSICA

        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() =>
            console.log("Autoplay retido pelo browser. Aguardando clique."),
          );
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };
  }, [activeStory]);

  return (
    <div className="mb-4">
      {/* LISTA HORIZONTAL */}
      <div className="d-flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hidden align-items-start">
        <div
          className="d-flex flex-column align-items-center text-center cursor-pointer shrink-0"
          onClick={() => setShowCreateModal(true)}
          style={{ width: "72px", cursor: "pointer" }}
        >
          <div
            className="rounded-circle p-0.5 border-2 border-dashed mb-1 d-flex align-items-center justify-content-center bg-light-subtle"
            style={{
              borderColor: "var(--border-color) !important",
              width: "62px",
              height: "62px",
            }}
          >
            <i className="bi bi-plus-lg fs-3 text-muted"></i>
          </div>
          <span className="xx-small text-truncate w-100 text-muted uppercase fw-semibold">
            Seu Dia
          </span>
        </div>

        {stories.map((story) => (
          <div
            key={story.id}
            className="d-flex flex-column align-items-center text-center cursor-pointer shrink-0"
            onClick={() => setActiveStory(story)}
            style={{ width: "72px", cursor: "pointer" }}
          >
            <div
              className="rounded-circle p-0.5 border-2 mb-1"
              style={{ borderColor: "var(--accent-color) !important" }}
            >
              <img
                src={
                  story.author?.avatarUrl ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${story.author?.username}`
                }
                alt={story.author?.username}
                className="rounded-circle bg-white border border-dark"
                style={{ width: "56px", height: "56px", objectFit: "cover" }}
              />
            </div>
            <span className="xx-small text-truncate w-100 text-muted">
              @{story.author?.username}
            </span>
          </div>
        ))}
      </div>

      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* MODAL DE VISUALIZAÇÃO */}
      {activeStory && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(9, 7, 15, 0.85)" }}
          tabIndex={-1}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: "400px" }}
          >
            <div className="modal-content border-0 shadow-lg bg-dark rounded-4 p-3 position-relative overflow-hidden">
              <div
                className="progress mb-3 bg-secondary"
                style={{ height: "4px" }}
              >
                <div
                  className="progress-bar bg-light"
                  style={{
                    width: "100%",
                    animation: isPlaying
                      ? "storyProgress 30s linear forwards"
                      : "none",
                  }}
                ></div>
              </div>

              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <img
                    src={
                      activeStory.author?.avatarUrl ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${activeStory.author?.username}`
                    }
                    alt={activeStory.author?.username}
                    className="rounded-circle bg-white border"
                    style={{ width: "32px", height: "32px" }}
                  />
                  <span className="fw-bold text-white small">
                    @{activeStory.author?.username}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2">
                  {activeStory.author?.username === loggedInUsername && (
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger border-0 p-1 me-1 shadow-none"
                      onClick={() => handleDeleteStory(activeStory.id)}
                    >
                      <i className="bi bi-trash3-fill fs-5"></i>
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-close btn-close-white shadow-none"
                    onClick={() => setActiveStory(null)}
                  ></button>
                </div>
              </div>

              <div className="modal-body text-center p-0">
                {/* Capa do vinil com clique corrigido */}
                <div
                  className="position-relative d-inline-block my-3"
                  style={{ width: "180px", height: "180px" }}
                >
                  <img
                    src={
                      activeStory.albumCover ||
                      "https://via.placeholder.com/200"
                    }
                    alt={activeStory.trackName}
                    className={`rounded-circle shadow border-4 border-dark object-fit-cover ${isPlaying ? "animate-vinyl" : ""}`}
                    style={{
                      width: "180px",
                      height: "180px",
                      animationDuration: "6s",
                    }}
                  />

                  <div
                    className="position-absolute top-50 start-50 translate-middle rounded-circle bg-dark bg-opacity-75 d-flex align-items-center justify-content-center border-2 border-secondary shadow"
                    style={{
                      width: "48px",
                      height: "48px",
                      pointerEvents: "none",
                    }}
                  >
                    <i
                      className={`bi ${isPlaying ? "bi-pause-fill text-white" : "bi-play-fill text-info"} fs-3`}
                      style={{
                        pointerEvents: "none",
                        marginLeft: isPlaying ? "0px" : "2px",
                      }}
                    ></i>
                  </div>
                </div>

                {/* Garante a renderização completa */}
                <h5 className="fw-bold text-white m-0 text-truncate px-2">
                  {activeStory.trackName || "Faixa Desconhecida"}
                </h5>
                <p className="text-muted x-small mb-3 text-truncate">
                  {activeStory.artistName || "Artista Desconhecido"}
                </p>

                {activeStory.genreTag && (
                  <span className="badge bg-primary-subtle text-primary-emphasis rounded-pill px-2.5 py-1 xx-small mb-3 uppercase fw-bold">
                    🏷️ {activeStory.genreTag}
                  </span>
                )}

                <div className="bg-black bg-opacity-25 p-3 rounded-3 border border-secondary border-opacity-25 mt-2">
                  <p className="text-white-50 x-small m-0 text-start italic">
                    "{activeStory.caption || "Sem descrição."}"
                  </p>
                </div>

                {activeStory.spotifyUrl && (
                  <div className="mt-3">
                    <a
                      href={activeStory.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm w-100 rounded-pill d-flex align-items-center justify-content-center gap-2 fw-semibold shadow-sm transition"
                      style={{
                        backgroundColor: "#1DB954",
                        color: "#000",
                        fontSize: "0.75rem",
                      }}
                    >
                      <i className="bi bi-spotify fs-6"></i>
                      Ouvir no Spotify
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateStoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onStoryCreated={fetchStoriesData}
      />
    </div>
  );
}
