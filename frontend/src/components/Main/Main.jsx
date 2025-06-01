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
      const videoId =
        u.hostname === "youtu.be"
          ? u.pathname.slice(1)
          : u.searchParams.get("v");
      return `https://www.youtube.com/watch?v=${videoId}`;
    } catch {
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
      const responseJSON = await ApiFetch("POST", "resume/url", { url });

      if (responseJSON.success === false) {
        throw new Error("Erro ao se conectar à API");
      }

      const response = await responseJSON.json();

      if (!response.success || !response.text) {
        throw new Error(response.msg || "Transcrição indisponível");
      }

      setTranscriptionText(response);

      const IAResult = await getVideoSummary(response.text);
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

      const responseJSON = await ApiFetch(
        "POST",
        "resume/summarizeText",
        requestBody
      );

      if (responseJSON.success === false) {
        throw new Error("Erro ao se conectar à API");
      }

      return await responseJSON.json();
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
      </div>
    </main>
  );
}

export default Main;
