/**
 * Audio feedback helper for Hamro Kirana Management.
 * 
 * Plays a modern POS double chime followed immediately by native Nepali voice:
 * "भुक्तानी भएको छ" (Payment received / Bhuktani bhayeko chha)
 */
export function playPaymentAudio(amount?: number, method?: "cash" | "qr" | "khata") {
  if (typeof window === "undefined") return;

  // 1. Play POS Tone Chime
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const now = ctx.currentTime;

      // First beep (880Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now);
      gain1.gain.setValueAtTime(0.18, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      // Second harmonic beep (1320Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1320, now + 0.1);
      gain2.gain.setValueAtTime(0.22, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.4);
    }
  } catch (err) {
    console.warn("Chime playback error:", err);
  }

  // 2. Play the native Nepali voice recording ONLY for QR payments
  if (method !== "qr") {
    return;
  }

  try {
    const voicePref = (typeof window !== "undefined" && localStorage.getItem("nepali_voice_gender")) || "female";
    const soundFile = voicePref === "male" ? "/payment-success-ne.mp3" : "/payment-success-ne-female.mp3";
    
    const nepaliAudio = new Audio(soundFile);
    nepaliAudio.volume = 1.0;
    
    // Play after the short chime rings
    setTimeout(() => {
      nepaliAudio.play().catch((err) => {
        console.warn("Audio file playback blocked, attempting TTS fallback:", err);
        // Fallback to SpeechSynthesis if browser audio element is restricted
        if ("speechSynthesis" in window) {
          const u = new SpeechSynthesisUtterance("भुक्तानी भएको छ");
          u.lang = "ne-NP";
          window.speechSynthesis.speak(u);
        }
      });
    }, 280);
  } catch (e) {
    console.warn("Nepali audio initialization failed", e);
  }
}
