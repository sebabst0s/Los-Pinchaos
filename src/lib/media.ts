// Utilidades de audio/video para easter eggs y efectos de sonido.
// Todas las operaciones fallan en silencio si el archivo aún no existe
// (404) o el navegador bloquea la reproducción autónoma.

let activeAudio: HTMLAudioElement | null = null;

export function playSound(src: string) {
  const audio = new Audio(src);
  audio.play().catch(() => {});
}

// Como playSound, pero corta cualquier audio de este tipo que siga sonando
// antes de empezar el nuevo (para que los easter eggs no se pisen entre sí).
export function playExclusiveSound(src: string) {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  const audio = new Audio(src);
  activeAudio = audio;
  audio.play().catch(() => {
    if (activeAudio === audio) activeAudio = null;
  });
}

export function stopExclusiveSound() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
}

export async function fileExists(
  url: string,
  signal?: AbortSignal
): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", signal });
    return res.ok;
  } catch {
    return false;
  }
}
