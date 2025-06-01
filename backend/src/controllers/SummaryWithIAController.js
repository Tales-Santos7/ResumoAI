import { YoutubeTranscript } from "youtube-transcript";
import "dotenv/config"; // Carrega variáveis do .env
import { GoogleGenAI } from "@google/genai"; // Importa o SDK

export const Transcript = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res
        .status(400)
        .json({ success: false, msg: "Informe a url do video" });
    }

    //Extraindo transcrição do video
    const transcript = await YoutubeTranscript.fetchTranscript(url);

    //Junta o array em um unico texto
    const text = await transcript.map((item) => item.text).join(" ");

    return res.status(200).json({
      success: true,
      msg: "Sucesso ao extrair transcrição",
      url: url,
      text: text,
      transcript: transcript,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      msg: "URL, não compativel, verifique a url. Verifique também se a transcrição do video está ativada e que não seja conteúdo de uma live",
    });

    //ERRO DA URL NÂO ENCONTRADA
    //ERRO DA TRANSCRIÇÃO ESTÁ DESATIVADA NO VIDEO
  }
};

export const SummarizeText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res
        .status(400)
        .json({ success: false, msg: "Informe o texto a ser resumido" });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const textoLimitado = text.slice(0, 20000);
    console.log("Tamanho do texto recebido:", text.length);

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [textoLimitado], // ✅ Aqui está o ponto correto
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
