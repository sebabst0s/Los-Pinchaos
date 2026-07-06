"use client";

import { useEffect, useState } from "react";
import { Fredoka } from "next/font/google";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { GROUP_NAME, DESTINATION, TRIP_DAYS, TRIP_START } from "@/lib/constants";
import { FloatingAvatars } from "@/components/splash/FloatingAvatars";
import { playSound } from "@/lib/media";
import type { Database } from "@/lib/database.types";

const fredoka = Fredoka({ subsets: ["latin"], weight: ["600", "700"] });

type Participant = Database["public"]["Tables"]["participants"]["Row"];

export function SplashScreen() {
  const [dismissed, setDismissed] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("participants")
      .select("*")
      .then(({ data }) => {
        if (data) setParticipants(data);
      });
  }, []);

  if (dismissed) return null;

  const start = parseISO(TRIP_DAYS[0]);
  const end = parseISO(TRIP_DAYS[TRIP_DAYS.length - 1]);
  const dateRange = `${format(start, "d")}–${format(end, "d 'de' MMMM", { locale: es })}`;
  const destinationShort = DESTINATION.name.split(",")[0];

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden bg-gradient-to-br from-cyan-200 via-amber-50 to-orange-200 dark:from-cyan-950 dark:via-cyan-900 dark:to-orange-950">
      <FloatingAvatars participants={participants} />

      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="pointer-events-auto rounded-3xl bg-white/40 px-6 py-8 shadow-xl backdrop-blur-md dark:bg-black/20 sm:px-10 sm:py-10">
          <h1
            className={`${fredoka.className} text-4xl text-cyan-900 drop-shadow-sm dark:text-cyan-50 sm:text-6xl`}
          >
            {GROUP_NAME}
          </h1>
          <p className="mt-2 text-sm font-medium text-cyan-800/70 dark:text-cyan-200/70 sm:text-base">
            {dateRange} · {destinationShort} {TRIP_START.getFullYear()}
          </p>
          <button
            onClick={() => {
              playSound("/audio/continuar.mp3");
              setDismissed(true);
            }}
            className="mt-6 rounded-full bg-orange-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-orange-600 active:scale-95 sm:text-base"
          >
            Continuar 🌊
          </button>
        </div>
      </div>
    </div>
  );
}
