"use client";

import { useMemo } from "react";
import type { Database } from "@/lib/database.types";

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

export function FloatingAvatars({
  participants,
}: {
  participants: Participant[];
}) {
  const items = useMemo(() => {
    const count = participants.length;
    if (count === 0) return [];

    const cols = Math.max(1, Math.ceil(Math.sqrt(count * 1.6)));
    const rows = Math.ceil(count / cols);

    return participants.map((p, i) => {
      const rng = mulberry32(hashSeed(p.id));
      const col = i % cols;
      const row = Math.floor(i / cols);
      const baseLeft = ((col + 0.5) / cols) * 100;
      const baseTop = ((row + 0.5) / rows) * 100;
      const jitterX = (rng() - 0.5) * (90 / cols);
      const jitterY = (rng() - 0.5) * (70 / rows);

      const left = Math.min(94, Math.max(4, baseLeft + jitterX));
      const top = Math.min(88, Math.max(6, baseTop + jitterY));
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

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {items.map((item) => (
        <div
          key={item.participant.id}
          className="splash-float-avatar absolute overflow-hidden rounded-full shadow-lg ring-2 ring-white/50 dark:ring-white/10"
          style={
            {
              left: `${item.left}%`,
              top: `${item.top}%`,
              width: `calc(clamp(2.75rem, 7vw, 4.5rem) * ${item.scale})`,
              height: `calc(clamp(2.75rem, 7vw, 4.5rem) * ${item.scale})`,
              "--float-x": `${item.driftX}rem`,
              "--float-y": `${item.driftY}rem`,
              "--float-r": `${item.rotate}deg`,
              "--float-dur": `${item.duration}s`,
              "--float-delay": `${item.delay}s`,
            } as React.CSSProperties
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
              style={{ fontSize: "clamp(0.9rem, 3vw, 1.5rem)" }}
            >
              {item.participant.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
