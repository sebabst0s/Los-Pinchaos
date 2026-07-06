"use client";

import { useEffect, useState } from "react";
import { TRIP_START } from "@/lib/constants";

function getTimeLeft() {
  const diff = TRIP_START.getTime() - Date.now();
  if (diff <= 0) return null;

  const totalMinutes = Math.floor(diff / 1000 / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

export function Countdown() {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft>>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (timeLeft === null) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-3 text-orange-700 shadow-sm dark:bg-white/10 dark:text-orange-300">
        <span className="text-xl">🎉</span>
        <span className="font-semibold">¡Ya estamos en la playa!</span>
      </div>
    );
  }

  const units = [
    { label: "días", value: timeLeft.days },
    { label: "hs", value: timeLeft.hours },
    { label: "min", value: timeLeft.minutes },
  ];

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 shadow-sm dark:bg-white/10">
      <span className="text-xl">⏳</span>
      <div className="flex items-baseline gap-3">
        {units.map((u) => (
          <div key={u.label} className="flex items-baseline gap-1">
            <span className="text-lg font-bold tabular-nums text-cyan-900 dark:text-cyan-50">
              {u.value}
            </span>
            <span className="text-xs text-cyan-800/60 dark:text-cyan-200/60">
              {u.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
