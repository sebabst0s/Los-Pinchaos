"use client";

import { useEffect, useMemo, useState } from "react";
import type { Database } from "@/lib/database.types";
import { fileExists, playExclusiveSound, stopExclusiveSound } from "@/lib/media";

type Participant = Database["public"]["Tables"]["participants"]["Row"];

// Paleta veraniega para las iniciales cuando todavía no hay foto real.
const COLORS = [
  { bg: "bg-teal-500", text: "text-white" },
  { bg: "bg-orange-500", text: "text-white" },
  { bg: "bg-amber-400", text: "text-amber-950" },
  { bg: "bg-rose-400", text: "text-rose-950" },
  { bg: "bg-cyan-600", text: "text-white" },
  { bg: "bg-yellow-400", text: "text-yellow-950" },
];

// Hash simple + PRNG determinístico: cada participante flota siempre
// con los mismos parámetros (no saltan de lugar en cada re-render),
// pero se ven distintos entre sí.
function hashSeed(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Media asociada a un participante para el easter egg (si existe el archivo).
type ParticipantMedia = { audioSrc?: string; videoSrc?: string };

export function FloatingAvatars({
  participants,
}: {
  participants: Participant[];
}) {
  const [mediaByParticipant, setMediaByParticipant] = useState<
    Record<string, ParticipantMedia>
  >({});
  const [openVideo, setOpenVideo] = useState<{
    name: string;
    src: string;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all(
      participants.map(async (p) => {
        const encodedName = encodeURIComponent(p.name);
        const audioUrl = `/audio/${encodedName}.mp3`;
        const videoUrl = `/video/${encodedName}.mp4`;
        const [hasAudio, hasVideo] = await Promise.all([
          fileExists(audioUrl, controller.signal),
          fileExists(videoUrl, controller.signal),
        ]);
        return {
          id: p.id,
          media: {
            audioSrc: hasAudio ? audioUrl : undefined,
            videoSrc: hasVideo ? videoUrl : undefined,
          } as ParticipantMedia,
        };
      })
    ).then((results) => {
      if (controller.signal.aborted) return;
      const next: Record<string, ParticipantMedia> = {};
      for (const r of results) next[r.id] = r.media;
      setMediaByParticipant(next);
    });

    return () => controller.abort();
  }, [participants]);

  const items = useMemo(() => {
    const count = participants.length;
    if (count === 0) return [];

    const cols = Math.max(1, Math.ceil(Math.sqrt(count * 1.3)));
    const rows = Math.ceil(count / cols);

    return participants.map((p, i) => {
      const rng = mulberry32(hashSeed(p.id));
      const col = i % cols;
      const row = Math.floor(i / cols);
      const baseLeft = ((col + 0.5) / cols) * 100;
      const baseTop = ((row + 0.5) / rows) * 100;
      const jitterX = (rng() - 0.5) * (60 / cols);
      const jitterY = (rng() - 0.5) * (50 / rows);

      const left = Math.min(92, Math.max(6, baseLeft + jitterX));
      const top = Math.min(86, Math.max(8, baseTop + jitterY));
      const scale = 0.75 + rng() * 0.6;
      const duration = 5 + rng() * 5;
      const delay = -rng() * duration;
      const driftX = (rng() * 2 - 1) * 1.4;
      const driftY = (rng() * 2 - 1) * 1.6;
      const rotate = (rng() * 2 - 1) * 10;
      const color = COLORS[Math.floor(rng() * COLORS.length)];

      return {
        participant: p,
        left,
        top,
        scale,
        duration,
        delay,
        driftX,
        driftY,
        rotate,
        color,
      };
    });
  }, [participants]);

  const handleAvatarActivate = (
    participantName: string,
    media: ParticipantMedia | undefined
  ) => {
    if (!media) return;
    if (media.videoSrc) {
      stopExclusiveSound();
      setOpenVideo({ name: participantName, src: media.videoSrc });
    } else if (media.audioSrc) {
      playExclusiveSound(media.audioSrc);
    }
  };

  const closeVideo = () => {
    setOpenVideo(null);
  };

  return (
    <>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {items.map((item) => {
          const media = mediaByParticipant[item.participant.id];
          const interactive = Boolean(media?.audioSrc || media?.videoSrc);

          return (
            <div
              key={item.participant.id}
              className={`splash-float-avatar absolute overflow-hidden rounded-full shadow-lg ring-2 ring-white/50 dark:ring-white/10 ${
                interactive ? "pointer-events-auto cursor-pointer" : ""
              }`}
              style={
                {
                  left: `${item.left}%`,
                  top: `${item.top}%`,
                  width: `calc(clamp(3.75rem, 11vw, 7rem) * ${item.scale})`,
                  height: `calc(clamp(3.75rem, 11vw, 7rem) * ${item.scale})`,
                  "--float-x": `${item.driftX}rem`,
                  "--float-y": `${item.driftY}rem`,
                  "--float-r": `${item.rotate}deg`,
                  "--float-dur": `${item.duration}s`,
                  "--float-delay": `${item.delay}s`,
                } as React.CSSProperties
              }
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              aria-hidden={interactive ? undefined : true}
              onClick={
                interactive
                  ? () => handleAvatarActivate(item.participant.name, media)
                  : undefined
              }
              onKeyDown={
                interactive
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleAvatarActivate(item.participant.name, media);
                      }
                    }
                  : undefined
              }
            >
              {item.participant.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.participant.avatar_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center font-bold ${item.color.bg} ${item.color.text}`}
                  style={{ fontSize: "clamp(1.1rem, 3.5vw, 2rem)" }}
                >
                  {item.participant.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {openVideo && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4"
          onClick={() => {
            stopExclusiveSound();
            closeVideo();
          }}
        >
          <div
            className="relative w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                stopExclusiveSound();
                closeVideo();
              }}
              aria-label="Cerrar video"
              className="absolute -top-10 right-0 text-2xl font-bold text-white/80 transition hover:text-white sm:-top-12"
            >
              ✕
            </button>
            <video
              src={openVideo.src}
              autoPlay
              controls
              playsInline
              className="w-full rounded-2xl shadow-2xl"
              onEnded={closeVideo}
              onError={closeVideo}
            />
          </div>
        </div>
      )}
    </>
  );
}
