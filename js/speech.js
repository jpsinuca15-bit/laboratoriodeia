// TechFlow AI LAB - Voz de transferência (corrigido)
// Troca termos em inglês por pronúncia em português antes de falar.

const PT_PRONUNCIATION = [
  [/\bTechFlow AI\b/g, "TechFlow"],
  [/\bAI\b/g, "inteligência artificial"],
  [/\bIA\b/g, "inteligência artificial"],
  [/\bWhatsApp\b/gi, "uótsap"],
  [/\bCRM\b/g, "cê erre eme"],
  [/\bCEO\b/g, "presidente"],
  [/\blead\b/gi, "contato"],
  [/\bdashboard\b/gi, "painel"],
  [/\bdeploy\b/gi, "publicação"],
];

export function prepareSpeech(text = "") {
  let out = String(text)
    .replace(/[*#_`]/g, "")
    .replace(/•/g, "")
    .replace(/\p{Extended_Pictographic}/gu, "");
  for (const [pattern, spoken] of PT_PRONUNCIATION) out = out.replace(pattern, spoken);
  return out.replace(/\s+/g, " ").trim();
}

function pickPortugueseVoice() {
  const voices = window.speechSynthesis.getVoices();
  const pt = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith("pt"));
  if (!pt.length) return null;
  return (
    pt.find((v) => /brasil|brazil/i.test(v.lang) && /google|microsoft|natural/i.test(v.name)) ||
    pt.find((v) => /brasil|brazil|pt-br/i.test(v.lang)) ||
    pt[0]
  );
}

export const SpeechEngine = {
  speakTransfer(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(prepareSpeech(text));
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    const voice = pickPortugueseVoice();
    if (voice) utterance.voice = voice;
    window.speechSynthesis.speak(utterance);
  },
  stop() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  },
};

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

window.SpeechEngine = SpeechEngine;
