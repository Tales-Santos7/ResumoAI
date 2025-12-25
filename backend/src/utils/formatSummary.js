export function formatSummary(text) {
  if (!text) return "";

  // 1️⃣ Normalização
  let clean = text
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b(é|né|tipo|mano|cara|pô|tá|cê|assim|então)\b/gi, "")
    .trim();

  // 2️⃣ Quebra em frases
  const sentences =
    clean.match(/[^.!?]+[.!?]+/g) || [];

  if (sentences.length === 0) return clean;

  // 3️⃣ Introdução (primeiras ideias)
  const intro = sentences.slice(0, 3).join(" ");

  // 4️⃣ Bloco principal (meio do vídeo)
  const middle = sentences.slice(3, 12);

  // 5️⃣ Conclusão (final do vídeo)
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
