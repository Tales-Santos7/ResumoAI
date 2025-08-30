import { YoutubeTranscript } from "youtube-transcript";

export function normalizeYoutubeUrl(url) {
  let videoId = null;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      videoId = u.pathname.slice(1).split("?")[0];
    } else if (u.hostname.includes("youtube.com")) {
      videoId = u.searchParams.get("v");
      if (!videoId) {
        const match = u.pathname.match(/^\/(?:embed|shorts|v)\/([^/?]+)/);
        if (match) videoId = match[1];
      }
    }
    if (!videoId) throw new Error("ID do vídeo não encontrado");
  } catch {
    throw new Error("URL do YouTube inválida");
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export async function fetchTranscript(url) {
  const fixedUrl = normalizeYoutubeUrl(url);

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(fixedUrl);
    if (!transcript || transcript.length === 0) {
      throw new Error("Não foi encontrada transcrição para este vídeo.");
    }
    const text = transcript.map(t => t.text).join(" ");
    return { text, transcript };
  } catch (error) {
    console.error("Erro ao buscar transcrição:", error.message);
    throw error;
  }
}
