import "dotenv/config";
import { formatSummary } from "../utils/formatSummary.js";
import fetch from "node-fetch"; // garante compatibilidade em Node.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

function getVideoIdFromUrl(url) {
  try {
    // youtu.be/ID
    let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (match) return match[1];

    // youtube.com/watch?v=ID
    match = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (match) return match[1];

    // youtube.com/embed/ID ou youtube.com/shorts/ID
    match = url.match(/\/(embed|shorts)\/([a-zA-Z0-9_-]+)/);
    if (match) return match[2];

    return null;
  } catch {
    return null;
  }
}

// 🔹 NOVA VERSÃO: usa API externa (YouTube Scribe)
async function getVideoTranscript(videoId) {
  try {
    const response = await fetch(
      "https://www.youtube-transcript.io/api/transcripts",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${process.env.YOUTUBE_SCRIBE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: [videoId] }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Erro da API externa: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
   // console.log("Resposta bruta da API:", data);

    // ✅ A API retorna um ARRAY
    const item = data?.[0];

    if (!item?.text || item.text.trim().length === 0) {
      throw new Error("Nenhuma transcrição retornada pela API externa");
    }

    // ✅ Texto já vem pronto
    return item.text;
  } catch (error) {
    console.error("Erro ao obter transcrição via API externa:", error);
    throw new Error("Falha ao obter transcrição");
  }
}

export const Transcript = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url)
      return res
        .status(400)
        .json({ success: false, msg: "Informe a URL do vídeo" });

    const videoId = getVideoIdFromUrl(url);
    if (!videoId)
      return res.status(400).json({
        success: false,
        msg: "ID do vídeo inválido ou URL mal formatada.",
      });

    const text = await getVideoTranscript(videoId);

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        msg: "O vídeo não possui transcrição ou não foi possível extrair texto.",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "Sucesso ao extrair transcrição (API YouTube Transcript IO)",
      url,
      text,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: "Falha ao obter transcrição. Verifique a URL ou se o vídeo tem legendas disponíveis.",
      error: error.message,
    });
  }
};

export const SummarizeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.length < 50) {
      return res.status(400).json({
        success: false,
        msg: "Texto insuficiente para gerar resumo",
      });
    }

    // Limite de segurança (evita erro por texto gigante)
    const MAX_CHARS = 15000;
    const safeText = text.slice(0, MAX_CHARS);

    const prompt = `
Cria um resumo claro e bem estruturado em português brasileiro.
Usa Markdown.

Formato obrigatório:
## Resumo
(parágrafo curto)

## Pontos principais
- lista com bullets

## Conclusão
(frase objetiva)

Conteúdo:
${safeText}
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return res.status(200).json({
      success: true,
      msg: "Resumo gerado com Gemini IA",
      summary: response,
    });
  } catch (error) {
    console.error("Erro Gemini:", error);
    return res.status(500).json({
      success: false,
      msg: "Erro ao gerar resumo com Gemini",
    });
  }
};
