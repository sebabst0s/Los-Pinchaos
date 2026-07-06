import { TRIP_NAME, DESTINATION } from "@/lib/constants";
import { Countdown } from "@/components/header/Countdown";
import { WeatherWidget } from "@/components/header/WeatherWidget";
import { ActivityFeed } from "@/components/header/ActivityFeed";
import { ParticipantBadge } from "@/components/identity/ParticipantBadge";

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-cyan-900/10 bg-gradient-to-r from-cyan-100/90 via-amber-50/90 to-orange-100/90 backdrop-blur-md dark:border-cyan-100/10 dark:from-cyan-950/90 dark:via-cyan-900/90 dark:to-cyan-950/90">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-cyan-900 dark:text-cyan-50">
                🌊 {TRIP_NAME}
              </h1>
              <ParticipantBadge />
            </div>
            <p className="text-xs text-cyan-800/60 dark:text-cyan-200/60">
              {DESTINATION.name}
            </p>
          </div>
          <Countdown />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <WeatherWidget />
          <ActivityFeed />
        </div>
      </div>
    </header>
  );
}
