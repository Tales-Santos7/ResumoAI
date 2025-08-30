import { YoutubeTranscript } from "youtube-transcript";
import "dotenv/config"; // Carrega variáveis do .env
import { GoogleGenAI } from "@google/genai"; // Importa o SDK

// 🔹 Função utilitária para normalizar URL curta do YouTube
function normalizeYoutubeUrl(url) {
  let videoId = null;
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split(/[?&]/)[0];
  } else if (url.includes("youtube.com/watch?v=")) {
    videoId = url.split("v=")[1].split(/[?&]/)[0];
  }
  if (!videoId) throw new Error("URL do YouTube inválida");
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export const Transcript = async (req, res) => {
  console.log("Recebido do front:", req.body);

  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, msg: "Informe a URL do vídeo." });
    }

    // Normaliza a URL
    const fixedUrl = normalizeYoutubeUrl(url);

    // Busca a transcrição
    const transcript = await YoutubeTranscript.fetchTranscript(fixedUrl);

    if (!transcript || transcript.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Não foi encontrada nenhuma transcrição para este vídeo.",
      });
    }

    const text = transcript.map(t => t.text).join(" ");

    return res.status(200).json({
      success: true,
      msg: "Sucesso ao extrair transcrição",
      url: fixedUrl,
      text,
      transcript
    });

  } catch (error) {
    console.error("Erro ao extrair transcrição:", error.message);

    let msg = "Não foi possível obter a transcrição.";
    if (error.message.includes("No transcript available")) {
      msg = "Este vídeo não tem transcrição disponível (legendas automáticas desativadas).";
    } else if (error.message.includes("Video unavailable")) {
      msg = "O vídeo não existe, está privado ou foi removido.";
    }

    return res.status(400).json({
      success: false,
      msg,
      error: error.message
    });
  }
};

export const SummarizeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        msg: "Informe o texto a ser resumido.",
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const textoLimitado = text.slice(0, 20000); // 🔹 evita texto gigante
    console.log("Tamanho do texto recebido:", text.length);

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [textoLimitado],
        },
      ],
      generationConfig: { temperature: 0.3 },
    });

    const candidates = response?.candidates;
    if (!candidates || !candidates[0]?.content?.parts) {
      console.error("Resposta inválida do Gemini:", response);
      return res.status(400).json({
        success: false,
        msg: "A IA não retornou um resumo válido.",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Sucesso ao resumir texto",
      response,
    });
  } catch (error) {
    console.error("Erro na IA:", error);
    return res.status(400).json({
      success: false,
      msg: "Falha ao tentar resumir texto",
      error: error.message,
    });
  }
};
