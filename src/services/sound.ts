// ============================================================================
// SERVIÇO DE NOTIFICAÇÃO SONORA (WEB AUDIO API + HTML5 AUDIO FALLBACK)
// ============================================================================

let sharedAudioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

export const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    if (!sharedAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        sharedAudioCtx = new AudioCtxClass();
      }
    }
  } catch (err) {
    console.warn('Web Audio API não suportada neste navegador:', err);
  }
  return sharedAudioCtx;
};

export const unlockAudio = async (): Promise<boolean> => {
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    isAudioUnlocked = ctx.state === 'running';
    return isAudioUnlocked;
  } catch (err) {
    console.warn('Aviso ao desbloquear áudio:', err);
    return false;
  }
};

// Escuta qualquer interação do usuário (clique, toque ou tecla) para destravar o áudio imediatamente
if (typeof window !== 'undefined') {
  const autoUnlock = () => {
    unlockAudio().then((unlocked) => {
      if (unlocked) {
        window.removeEventListener('pointerdown', autoUnlock);
        window.removeEventListener('click', autoUnlock);
        window.removeEventListener('keydown', autoUnlock);
      }
    });
  };

  window.addEventListener('pointerdown', autoUnlock, { passive: true });
  window.addEventListener('click', autoUnlock, { passive: true });
  window.addEventListener('keydown', autoUnlock, { passive: true });
}

/**
 * Toca o som sintetizado de notificação de novo pedido (Tríade harmônica limpa e nítida: C5 -> E5 -> G5)
 * Estilo campainha de restaurante/delivery profissional.
 */
export const playOrderNotificationSound = async (): Promise<void> => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    const playTone = (freq: number, startDelay: number, duration: number, gainPeak: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Som mais encorpado e agradável que pure sine
      osc.frequency.setValueAtTime(freq, now + startDelay);

      gain.gain.setValueAtTime(0.001, now + startDelay);
      gain.gain.exponentialRampToValueAtTime(gainPeak, now + startDelay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + startDelay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + startDelay);
      osc.stop(now + startDelay + duration);
    };

    // Tom 1: C5 (523.25 Hz)
    playTone(523.25, 0.0, 0.28, 0.35);

    // Tom 2: E5 (659.25 Hz)
    playTone(659.25, 0.12, 0.28, 0.38);

    // Tom 3: G5 (783.99 Hz) mais brilhante
    playTone(783.99, 0.24, 0.45, 0.42);

    // Repetição eco suave para garantir que o pizzaiolo/atendente escute mesmo de longe
    playTone(659.25, 0.55, 0.22, 0.25);
    playTone(783.99, 0.68, 0.5, 0.38);
  } catch (err) {
    console.warn('Erro ao reproduzir som de notificação:', err);
  }
};

