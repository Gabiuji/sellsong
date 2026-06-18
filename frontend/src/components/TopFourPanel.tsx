import React, { useState, useEffect } from "react";
import axios from "axios";

interface TopFourItem {
  id: number;
  position: number;
  spotifyTrackId: string;
  trackName: string;
  artistName: string;
  albumCover: string;
}

interface TopFourPanelProps {
  userId: number; // ID do dono do perfil que estamos visualizando
}

interface SearchTrack {
  id: string;
  name: string;
  artist?: string;
  artists?: string;
  albumCover?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrack: (track: SearchTrack) => void;
  position: number;
}

export default function TopFourPanel({ userId }: TopFourPanelProps) {
  const [slots, setSlots] = useState<{ [key: number]: TopFourItem | null }>({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [activePosition, setActivePosition] = useState<number | null>(null);

  const token = localStorage.getItem("@SellSong:token");
  const formattedToken = token?.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`;

  // Descobre quem está logado para saber se permite edição
  const userStorage = localStorage.getItem("@SellSong:user");
  const currentLoggedInId = userStorage ? JSON.parse(userStorage).id : null;
  const isOwner = Number(userId) === Number(currentLoggedInId);

  // Carrega os itens salvos do banco
  const fetchTopFour = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/top-four/${userId}`,
      );
      const initialSlots: { [key: number]: TopFourItem | null } = {
        1: null,
        2: null,
        3: null,
        4: null,
      };

      response.data.forEach((item: TopFourItem) => {
        initialSlots[item.position] = item;
      });

      setSlots(initialSlots);
    } catch (error) {
      console.error("Erro ao carregar Top 4:", error);
    }
  };

  useEffect(() => {
    const loadTopFour = async () => {
      await fetchTopFour();
    };

    loadTopFour();
  }, [userId]);

  const handleSlotClick = (position: number) => {
    if (!isOwner) return; // Visitantes não editam
    setActivePosition(position);
    setShowSearchModal(true);
  };

  // Callback acionado quando o usuário escolhe a música no modal de busca
  const handleTrackSelected = async (selectedTrack: SearchTrack) => {
    if (!activePosition) return;

    try {
      await axios.put(
        "http://localhost:3000/api/top-four",
        {
          position: activePosition,
          spotifyTrackId: selectedTrack.id,
          trackName: selectedTrack.name,
          artistName:
            selectedTrack.artist || selectedTrack.artists || "Desconhecido",
          albumCover: selectedTrack.albumCover || "",
        },
        { headers: { Authorization: formattedToken } },
      );

      setShowSearchModal(false);
      fetchTopFour(); // Recarrega o grid com a nova música salva
    } catch (error) {
      console.error("Erro ao salvar slot do Top 4:", error);
      alert("Não foi possível salvar o favorito.");
    }
  };

  return (
    <div className="bg-dark bg-opacity-50 p-4 rounded-4 border border-secondary border-opacity-25 my-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-star-fill text-warning"></i>
        <h6 className="m-0 text-white fw-bold uppercase tracking-wider small">
          Músicas Favoritas (Top 4)
        </h6>
      </div>

      {/* Grid de 4 Colunas responsivas */}
      <div className="row g-3">
        {[1, 2, 3, 4].map((pos) => {
          const item = slots[pos];

          return (
            <div key={pos} className="col-6 col-md-3">
              <div
                className={`position-relative rounded-3 overflow-hidden bg-black bg-opacity-40 border d-flex flex-column align-items-center justify-content-center text-center p-2 transition-all ${
                  isOwner ? "cursor-pointer hover-border-purple" : ""
                }`}
                style={{
                  height: "160px",
                  cursor: isOwner ? "pointer" : "default",
                  borderColor: item
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(255,255,255,0.05)",
                }}
                onClick={() => handleSlotClick(pos)}
              >
                {item ? (
                  <>
                    {/* Opacidade ajustada para dar mais vida à capa */}
                    <img
                      src={item.albumCover || "https://via.placeholder.com/150"}
                      alt={item.trackName}
                      className="w-100 h-100 object-fit-cover position-absolute top-0 start-0 opacity-75 transition-opacity img-hover-bright"
                      style={{ zIndex: 0 }}
                    />

                    {/* Película de gradiente preto transparente para garantir contraste legível do texto */}
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.3) 60%, rgba(0, 0, 0, 0.1) 100%)",
                        zIndex: 1,
                      }}
                    ></div>

                    {/* zIndex jogado para 2 para flutuar por cima da película */}
                    <div
                      className="position-relative p-2 d-flex flex-column justify-content-end h-100 w-100"
                      style={{ zIndex: 2 }}
                    >
                      <span
                        className="fw-bold text-white small text-truncate d-block"
                        style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.8)" }}
                      >
                        {item.trackName}
                      </span>
                      <span className="text-white-50 xx-small text-truncate d-block mt-0.5">
                        {item.artistName}
                      </span>
                    </div>

                    {isOwner && (
                      <div
                        className="position-absolute top-0 end-0 m-2 badge bg-dark bg-opacity-75 border border-secondary xx-small"
                        style={{ zIndex: 3 }} // Subiu para ficar visível sobre a arte
                      >
                        #{pos}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="d-flex flex-column align-items-center gap-1 text-muted py-4">
                    {isOwner ? (
                      <>
                        <i className="bi bi-plus-circle fs-4 text-secondary"></i>
                        <span className="xx-small text-uppercase fw-semibold tracking-wide">
                          Adicionar #{pos}
                        </span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-music-note fs-4 opacity-20"></i>
                        <span className="xx-small text-uppercase opacity-30">
                          Vazio
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reutilizando temporariamente o CreateStoryModal para buscar faixas, ou podemos injetar um modal dedicado */}
      {showSearchModal && (
        <SearchTopFourModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          onSelectTrack={handleTrackSelected}
          position={activePosition || 1}
        />
      )}
    </div>
  );
}
function SearchTopFourModal({
  isOpen,
  onClose,
  onSelectTrack,
  position,
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchTrack[]>([]);

  const token = localStorage.getItem("@SellSong:token");
  const formattedToken = token
    ? token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`
    : undefined;

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length < 2) return;

    try {
      // Passando q e type diretamente na URL da query string
      const response = await axios.get<SearchTrack[]>(
        `http://localhost:3000/api/spotify/search?q=${encodeURIComponent(val)}&type=track`,
        {
          headers: { Authorization: formattedToken }, // Garante a autenticação se sua rota exigir
        },
      );
      setResults(response.data);
    } catch (err) {
      console.error("Erro ao buscar músicas no Top 4:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark border-secondary border-opacity-50 text-white rounded-4 p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="m-0 fw-bold">
              Escolher música para o slot #{position}
            </h6>
            <button
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <input
            type="text"
            className="form-control form-control-sm bg-black text-white border-secondary mb-3 shadow-none"
            placeholder="Busque por música ou artista..."
            value={query}
            onChange={handleSearch}
          />
          <div className="overflow-y-auto" style={{ maxHeight: "250px" }}>
            {results.map((track) => (
              <div
                key={track.id}
                className="d-flex align-items-center gap-3 p-2 rounded cursor-pointer hover-bg-gray"
                onClick={() => onSelectTrack(track)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={track.albumCover}
                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                  className="rounded"
                />
                <div className="text-truncate">
                  <span className="d-block small fw-bold text-truncate">
                    {track.name}
                  </span>
                  <span className="x-small text-muted text-truncate">
                    {track.artist}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
