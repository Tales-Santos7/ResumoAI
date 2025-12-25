import { Link } from "react-router-dom";

import "./SummaryPage.css";
import Header from "../components/Header/Header";

import { IoIosArrowBack } from "react-icons/io";

import { useState, useContext } from "react";
import { SummaryContext } from "../context/summaryContext";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function SummaryPage() {
  const { transcriptionText, videoSummary, url } = useContext(SummaryContext);

  const [showSummaryText, setShowSummaryText] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);

  function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }

  function normalizeYouTubeUrl(url) {
    try {
      if (!url || typeof url !== "string") throw new Error("URL inválida");
      const u = new URL(url);
      let videoId = "";
      const params = new URLSearchParams();

      if (u.hostname === "youtu.be") {
        videoId = u.pathname.slice(1);
      } else if (
        u.hostname.endsWith("youtube.com") &&
        (u.pathname === "/watch" || u.pathname === "/watch/")
      ) {
        videoId = u.searchParams.get("v");
      } else {
        const match = u.pathname.match(/^\/(?:embed|shorts|v)\/([^/?]+)/);
        if (match) videoId = match[1];
      }

      if (!videoId) return "";

      const t = u.searchParams.get("t") || u.searchParams.get("start");
      if (t) {
        const seconds = /^\d+m\d+s$/.test(t)
          ? t
              .split(/m|s/)
              .reduce((acc, v, i) => acc + +v * (i === 0 ? 60 : 1), 0)
          : parseInt(t, 10);
        params.set("start", seconds);
      }

      const list = u.searchParams.get("list");
      if (list) params.set("list", list);

      const query = params.toString();
      return `https://www.youtube.com/embed/${videoId}${
        query ? `?${query}` : ""
      }`;
    } catch (e) {
      console.error("URL inválida", e);
      return "";
    }
  }

  const embedUrl = normalizeYouTubeUrl(url);

  return (
    <div className="SummaryPage">
      <Header />
      <div className="main container">
        <Link to={"/"}>
          <IoIosArrowBack />
          <p>Voltar</p>
        </Link>

        <div className="content">
          <div className="leftSide">
            <div className="results">
              <div
                className="option"
                onClick={() => {
                  setShowSummaryText(true);
                  setShowTranscript(false);
                }}
              >
                <p>Resumo</p>
              </div>
              <div
                className="option"
                onClick={() => {
                  setShowSummaryText(false);
                  setShowTranscript(true);
                }}
              >
                <p>Transcrição</p>
              </div>
            </div>

            {showSummaryText && (
              <div className="text summaryText">
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {/* Como videoSummary agora é uma string, usamos direto */}
                    {typeof videoSummary === "string"
                      ? videoSummary
                      : "Não foi possível resumir o vídeo."}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {showTranscript && (
              <div className="text transcript">
                {transcriptionText ? (
                  transcriptionText.text
                    .split(/(?<=[.!?])\s+/)
                    .map((part, index) => (
                      <div className="transcriptPart" key={index}>
                        <p>{part}</p>
                      </div>
                    ))
                ) : (
                  <p>Não foi possível extrair a transcrição do vídeo.</p>
                )}
              </div>
            )}
          </div>

          {embedUrl ? (
            <iframe
              src={embedUrl}
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <p style={{ marginTop: "2em", color: "#f87171" }}>
              ⚠️ Não foi possível carregar o vídeo. Verifique a URL.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SummaryPage;
