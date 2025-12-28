export function formatSummary(text) {
  if (!text) return "";

  // Normalização
  let clean = text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b(é|né|tipo|mano|cara|pô|tá|cê|assim|então)\b/gi, "")
    .trim();

  // Quebra em frases
  const sentences =
    clean.match(/[^.!?]+[.!?]+/g) || [];

  if (sentences.length === 0) return clean;

  // Introdução
  const intro = sentences.slice(0, 3).join(" ");

  // Bloco principal
  const middle = sentences.slice(3, 12);

  // Conclusão
  const conclusion = sentences.slice(-3).join(" ");

  // 6️⃣ Montagem final
  return `
## 🧠 Resumo do vídeo

${intro}

## 🔹 Pontos principais
${middle.map(s => `- ${s.trim()}`).join("\n")}

## ✅ Conclusão
${conclusion}
`.trim();
}
