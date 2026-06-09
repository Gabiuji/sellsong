const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = "";
let tokenExpirationTime = 0;

// Função interna para obter o Token de Acesso do Spotify (Client Credentials Flow)
async function getSpotifyToken(): Promise<string> {
  const currentTime = Date.now();

  // Se o token já existe e ainda está válido (com margem de 1 minuto), reutiliza ele
  if (accessToken && currentTime < tokenExpirationTime - 60000) {
    return accessToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error(
      "As credenciais do Spotify não foram configuradas no arquivo .env",
    );
  }

  // O Spotify exige que as credenciais sejam enviadas codificadas em Base64 no Header
  const credentialsBase64 = Buffer.from(
    `${CLIENT_ID}:${CLIENT_SECRET}`,
  ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentialsBase64}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Erro detalhado do Spotify:", errorData);
    throw new Error("Falha ao autenticar com a API do Spotify");
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  accessToken = data.access_token;
  // Define o tempo exato em que o token vai expirar (expires_in costuma ser 3600 segundos)
  tokenExpirationTime = currentTime + data.expires_in * 1000;

  return accessToken;
}

// Função principal que será chamada pelas nossas rotas para buscar músicas
export async function searchTracks(query: string) {
  const token = await getSpotifyToken();

  // Faz a busca na API do Spotify limitando a 10 resultados do tipo "track" (música)
  const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar músicas no catálogo do Spotify");
  }

  const data = (await response.json()) as any;

  // Limpa o JSON gigante do Spotify devolvendo apenas o que o nosso Frontend vai precisar
  return data.tracks.items.map((track: any) => ({
    id: track.id,
    name: track.name,
    artist: track.artists.map((artist: any) => artist.name).join(", "),
    album: track.album.name,
    albumCover: track.album.images[0]?.url || "",
    durationMs: track.duration_ms,
    spotifyUrl: track.external_urls.spotify,
  }));
}
