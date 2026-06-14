import React, { useState } from "react";
import axios from "axios";

// Definição das interfaces para manter o TypeScript feliz
interface SearchResult {
  id: string;
  type: "track" | "album" | "artist";
  name: string;
  artist?: string;
  artists?: string; // Algumas rotas retornam plural
  album?: string;
  albumName?: string;
  albumCover?: string;
  avatar?: string;
  genres?: string;
  releaseDate?: string;
}

export default function Search() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"track" | "album" | "artist">(
    "track",
  );
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados para navegação de sub-telas (Funil)
  const [viewMode, setViewMode] = useState<
    "search" | "album-details" | "artist-details"
  >("search");
  const [selectedParentName, setSelectedParentName] = useState("");
  const [subResults, setSubResults] = useState<SearchResult[]>([]);

  //const token = localStorage.getItem("token");

  // Função principal de Busca
  // Função principal de Busca (Músicas, Álbuns, Artistas)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setViewMode("search");

    // 🌟 CAPTURA CORRETA: Puxa usando a chave exata do SellSong
    const rawToken = localStorage.getItem("@SellSong:token");

    if (!rawToken) {
      console.error("ERRO: Token não encontrado no LocalStorage.");
      setLoading(false);
      return;
    }

    const formattedToken = rawToken.startsWith("Bearer ")
      ? rawToken
      : `Bearer ${rawToken}`;

    try {
      const response = await axios.get(
        `http://localhost:3000/api/spotify/search`,
        {
          headers: { Authorization: formattedToken },
          params: { q: query, type: searchType },
        },
      );
      setResults(response.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para mergulhar nas faixas de um álbum (Drill-down)
  const fetchAlbumTracks = async (albumId: string, albumName: string) => {
    setLoading(true);
    const rawToken = localStorage.getItem("@SellSong:token"); // 🌟 Ajustado aqui também
    const formattedToken =
      rawToken &&
      (rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`);

    try {
      const response = await axios.get(
        `http://localhost:3000/api/spotify/albums/${albumId}/tracks`,
        {
          headers: { Authorization: formattedToken || "" },
        },
      );
      setSubResults(response.data);
      setSelectedParentName(albumName);
      setViewMode("album-details");
    } catch (error) {
      console.error("Erro ao buscar faixas do álbum:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para mergulhar nos álbuns de um artista (Drill-down)
  const fetchArtistAlbums = async (artistId: string, artistName: string) => {
    setLoading(true);
    const rawToken = localStorage.getItem("@SellSong:token"); // 🌟 Ajustado aqui também
    const formattedToken =
      rawToken &&
      (rawToken.startsWith("Bearer ") ? rawToken : `Bearer ${rawToken}`);

    try {
      const response = await axios.get(
        `http://localhost:3000/api/spotify/artists/${artistId}/albums`,
        {
          headers: { Authorization: formattedToken || "" },
        },
      );
      setSubResults(response.data);
      setSelectedParentName(artistName);
      setViewMode("artist-details");
    } catch (error) {
      console.error("Erro ao buscar álbuns do artista:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      {/* 1. SELETOR DE ABAS (TABS) */}
      {viewMode === "search" && (
        <div className="d-flex justify-content-center gap-2 mb-3">
          {(["track", "album", "artist"] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                searchType === type ? "btn-primary" : "btn-outline-secondary"
              }`}
              onClick={() => setSearchType(type)}
            >
              {type === "track" && <i className="bi bi-music-note me-1"></i>}
              {type === "album" && <i className="bi bi-disc me-1"></i>}
              {type === "artist" && <i className="bi bi-person-badge me-1"></i>}
              {type === "track"
                ? "Músicas"
                : type === "album"
                  ? "Álbuns"
                  : "Artistas"}
            </button>
          ))}
        </div>
      )}

      {/* 2. BARRA DE BUSCA FORMULÁRIO */}
      {viewMode === "search" && (
        <form onSubmit={handleSearch} className="mb-4">
          <div className="input-group bg-light rounded-pill p-1 border">
            <span className="input-group-text bg-transparent border-0 text-muted ps-3">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control bg-transparent border-0 shadow-none ps-2"
              placeholder={`Buscar ${searchType === "track" ? "música" : searchType === "album" ? "álbum" : "artista"}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary rounded-pill px-4 fw-semibold shadow-sm"
            >
              Buscar
            </button>
          </div>
        </form>
      )}

      {/* 3. BOTÃO VOLTAR (CASO ESTEJA EM SUB-TELAS) */}
      {viewMode !== "search" && (
        <div className="d-flex align-items-center mb-4 bg-light p-2 rounded-3">
          <button
            className="btn btn-sm btn-secondary rounded-pill me-3"
            onClick={() => setViewMode("search")}
          >
            <i className="bi bi-arrow-left me-1"></i> Voltar
          </button>
          <span className="text-dark fw-bold text-truncate">
            {viewMode === "album-details"
              ? `Faixas de: ${selectedParentName}`
              : `Álbuns de: ${selectedParentName}`}
          </span>
        </div>
      )}

      {loading && (
        <div className="text-center py-4 text-primary">
          <div
            className="spinner-border spinner-border-sm me-2"
            role="status"
          ></div>
          <span className="small fw-semibold">Consultando Spotify...</span>
        </div>
      )}

      {/* 4. RENDERIZAÇÃO DOS CARDS DINÂMICOS */}
      <div className="row g-3">
        {/* Renderiza resultados principais da busca */}
        {viewMode === "search" &&
          results.map((item) => (
            <div key={item.id} className="col-12 col-sm-6">
              <div className="card h-100 border-0 bg-light-subtle rounded-3 p-2 d-flex flex-row align-items-center gap-3 hover-shadow transition">
                <img
                  src={item.albumCover || item.avatar}
                  alt={item.name}
                  className={`object-fit-cover shadow-sm ${item.type === "artist" ? "rounded-circle" : "rounded-2"}`}
                  style={{ width: "56px", height: "56px" }}
                />
                <div className="text-truncate grow">
                  <span className="fw-bold text-dark d-block text-truncate small mb-0">
                    {item.name}
                  </span>
                  <span className="text-muted x-small text-truncate d-block">
                    {item.type === "track" && `${item.artist} • ${item.album}`}
                    {item.type === "album" && item.artist}
                    {item.type === "artist" && item.genres}
                  </span>
                </div>

                {/* Gatilhos de Ação baseados no Tipo */}
                {item.type === "track" && (
                  <button
                    className="btn btn-xs btn-primary rounded-pill fw-semibold shadow-xs"
                    onClick={() =>
                      /* Abre seu Modal de postar */ console.log(item)
                    }
                  >
                    Avaliar
                  </button>
                )}
                {item.type === "album" && (
                  <button
                    className="btn btn-xs btn-outline-primary rounded-pill fw-semibold"
                    onClick={() => fetchAlbumTracks(item.id, item.name)}
                  >
                    Ver Faixas
                  </button>
                )}
                {item.type === "artist" && (
                  <button
                    className="btn btn-xs btn-outline-primary rounded-pill fw-semibold"
                    onClick={() => fetchArtistAlbums(item.id, item.name)}
                  >
                    Álbuns
                  </button>
                )}
              </div>
            </div>
          ))}

        {/* Renderiza sub-telas de detalhe (Drill-down de Álbuns ou Artistas) */}
        {viewMode !== "search" &&
          subResults.map((subItem) => (
            <div key={subItem.id} className="col-12 col-sm-6">
              <div className="card h-100 border-0 bg-light-subtle rounded-3 p-2 d-flex flex-row align-items-center gap-3">
                <img
                  src={subItem.albumCover}
                  alt={subItem.name}
                  className="rounded-2 object-fit-cover shadow-sm"
                  style={{ width: "56px", height: "56px" }}
                />
                <div className="text-truncate grow">
                  <span className="fw-bold text-dark d-block text-truncate small mb-0">
                    {subItem.name}
                  </span>
                  <span className="text-muted x-small text-truncate d-block">
                    {viewMode === "album-details"
                      ? subItem.artists
                      : `Lançamento: ${subItem.releaseDate}`}
                  </span>
                </div>

                {/* No final do funil tudo vira uma música avaliável ou um álbum avaliável */}
                {viewMode === "album-details" ? (
                  <button
                    className="btn btn-xs btn-primary rounded-pill fw-semibold"
                    onClick={() =>
                      /* Gatilho do seu modal com subItem */ console.log(
                        subItem,
                      )
                    }
                  >
                    Avaliar
                  </button>
                ) : (
                  <button
                    className="btn btn-xs btn-outline-primary rounded-pill fw-semibold"
                    onClick={() => fetchAlbumTracks(subItem.id, subItem.name)}
                  >
                    Ver Faixas
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
