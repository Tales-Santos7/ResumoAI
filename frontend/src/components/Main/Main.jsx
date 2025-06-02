import "./Main.css";
import ApiFetch from "../../api/api";

import { FaLink } from "react-icons/fa";
import { useState, useContext } from "react";
import { SummaryContext } from "../../context/summaryContext";
import { useNavigate } from "react-router-dom";

function Main() {
  const navigate = useNavigate();

  const { setTranscriptionText, loading, setLoading, setVideoSummary, setUrl } =
    useContext(SummaryContext);

  const [inputUrl, setInputUrl] = useState("");
  const [validURL, setValidURL] = useState(false);

  function inputValue(url) {
    setInputUrl(url);
    checkURL(url);
  }

  function checkURL(url) {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    setValidURL(regex.test(url));
  }

  function cleanYouTubeUrl(url) {
    try {
      const u = new URL(url);
      let videoId = "";

      // Formato: youtu.be/VIDEO_ID
      if (u.hostname === "youtu.be") {
        videoId = u.pathname.slice(1).split("?")[0];

        // Formato: youtube.com/watch?v=VIDEO_ID
      } else if (u.hostname.includes("youtube.com")) {
        const vParam = u.searchParams.get("v");
        if (vParam) {
          videoId = vParam;
        } else {
          // Formatos: /embed/VIDEO_ID, /shorts/VIDEO_ID, /v/VIDEO_ID
          const match = u.pathname.match(/^\/(?:embed|shorts|v)\/([^/?]+)/);
          if (match) {
            videoId = match[1];
          }
        }
      }

      if (!videoId) throw new Error("ID do vídeo não encontrado");

      return `https://www.youtube.com/watch?v=${videoId}`;
    } catch (err) {
      console.warn("Erro ao limpar a URL:", err);
      return url;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validURL) {
      return alert("Insira uma URL válida do YouTube.");
    }

    const cleanedUrl = cleanYouTubeUrl(inputUrl);
    getVideoTranscription(cleanedUrl);
  }

  async function getVideoTranscription(url) {
    setLoading(true);
    try {
      setUrl(url);

      const responseTranscription = await ApiFetch("POST", "resume/url", {
        url,
      });

      if (!responseTranscription.success || !responseTranscription.text) {
        throw new Error(
          responseTranscription.msg || "Transcrição indisponível"
        );
      }

      setTranscriptionText(responseTranscription);

      const IAResult = await getVideoSummary(responseTranscription.text);

      if (
        !IAResult?.response?.candidates ||
        !IAResult.response.candidates[0]?.content?.parts
      ) {
        console.log("Resposta inesperada da IA:", IAResult);
        alert(
          "A IA não conseguiu gerar um resumo. Tente novamente mais tarde."
        );
        return;
      }

      setVideoSummary(IAResult.response.candidates[0].content.parts);
      navigate("/resumo");
    } catch (error) {
      console.error(error);
      alert(
        "Ocorreu um erro ao processar o vídeo. Verifique se ele possui transcrição automática."
      );
    } finally {
      setLoading(false);
    }
  }

  async function getVideoSummary(text) {
    try {
      const requestBody = {
        text: `Aqui está a transcrição de um vídeo no YouTube. Faça um resumo detalhado desse conteúdo:\n\n${text}`,
      };

      const response = await ApiFetch(
        "POST",
        "resume/summarizeText",
        requestBody
      );

      return response;
    } catch (error) {
      console.error(error);
      alert("Erro ao resumir o vídeo.");
    }
  }

  return (
    <main className="Main container">
      <div className="mainContainer">
        <h2>Resumos com IA</h2>
        <p>Resuma vídeos do YouTube em segundos</p>
        <form onSubmit={handleSubmit}>
          <div>
            <FaLink />
            <input
              type="text"
              placeholder="Cole a URL do vídeo do YouTube aqui"
              value={inputUrl}
              onChange={(e) => inputValue(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            style={validURL ? { backgroundColor: "var(--mainColor)" } : {}}
            disabled={loading}
          >
            {loading ? "Resumindo..." : "Resumir"}
          </button>
        </form>
        <p className="obs">
          OBS.: Alguns vídeos não podem ser resumidos ou transcritos, ainda
          estamos em fase BETA.
        </p>
      </div>
      <a href="https://talessantos-mu.vercel.app/" target="_blank">
        <div className="watermark">
          <img src="https://i.postimg.cc/qMk1TTKR/foto-tales.webp" alt="Criador" />
          <span>By Tales Santos</span>
        </div>
      </a>
    </main>
  );
}

export default Main;
