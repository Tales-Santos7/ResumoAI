import "./Main.css";
import ApiFetch from "../../api/api";
import { toast } from "react-toastify";
import { FaLink } from "react-icons/fa";
import { useState, useContext } from "react";
import { SummaryContext } from "../../context/summaryContext";
import { useNavigate } from "react-router-dom";
import { fetchTranscript } from "../../utils/youtubeTranscript"; // <- import novo

function Main() {
  const navigate = useNavigate();
  const { setTranscriptionText, loading, setLoading, setVideoSummary, setUrl } =
    useContext(SummaryContext);

  const [inputUrl, setInputUrl] = useState("");
  const [validURL, setValidURL] = useState(false);

  function inputValue(url) {
    setInputUrl(url);
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    setValidURL(regex.test(url));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (!validURL) return toast.error("Insira uma URL válida do YouTube.");

    setLoading(true);
    setUrl(inputUrl);

    try {
      // ✅ Busca transcrição direto no front-end
      const { text } = await fetchTranscript(inputUrl);

      if (!text || text.length < 100) {
        throw new Error(
          "Transcrição insuficiente para gerar resumo. Por favor tente outro vídeo."
        );
      }

      setTranscriptionText(text);

      // ✅ Chama a IA para resumir
      const requestBody = {
        text: `Aqui está a transcrição de um vídeo no YouTube. Faça um resumo detalhado desse conteúdo:\n\n${text}`,
      };
      const IAResult = await ApiFetch("POST", "resume/summarizeText", requestBody);

      if (!IAResult?.response?.candidates?.[0]?.content?.parts) {
        console.log("Resposta inesperada da IA:", IAResult);
        toast.error("A IA não conseguiu gerar um resumo. Tente novamente mais tarde.");
        return;
      }

      setVideoSummary(IAResult.response.candidates[0].content.parts);
      navigate("/resumo");

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Ocorreu um erro ao processar o vídeo.");
    } finally {
      setLoading(false);
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
          <img
            src="https://i.postimg.cc/qMk1TTKR/foto-tales.webp"
            alt="Criador"
          />
          <span>By Tales Santos</span>
        </div>
      </a>
    </main>
  );
}

export default Main;
