/**
 * TechFlow - Módulo de Voz Focado em Transferências e Fechamento (speech.js)
 */

export const SpeechEngine = {
  speakTransfer(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    // Limpeza rigorosa para garantir leitura limpa e pausada sem repetir termos
    const cleanText = text
      .replace(/[*#_`]/g, "")
      .replace(/•/g, "")
      .replace(/🚀|😊|✦/g, "")
      .replace(/\s*AI\s*/gi, " ")
      .replace(/\s*A\.I\.\s*/gi, " ")
      .replace(/TechFlow/gi, "TechFlow")
      .replace(/WhatsApp/gi, "Guatsapi")
      .replace(/CRM/gi, "C-R-M");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "pt-BR";
    utterance.rate = 0.98; // Tom um pouco mais calmo e executivo
    utterance.pitch = 0.95; // Tom de voz mais encorpado e profissional

    const voices = window.speechSynthesis.getVoices();
    const ptVoices = voices.filter(
      (v) => v.lang === "pt-BR" || v.lang.startsWith("pt"),
    );

    if (ptVoices.length > 0) {
      const premiumVoice = ptVoices.find((v) =>
        /google|natural|microsoft|online/i.test(v.name),
      );
      utterance.voice = premiumVoice || ptVoices[0];
    }

    window.speechSynthesis.speak(utterance);
  },

  stop() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  },
};

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () =>
    window.speechSynthesis.getVoices();
}

window.SpeechEngine = SpeechEngine;
