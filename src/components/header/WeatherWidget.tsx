import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { TRIP_DAYS } from "@/lib/constants";
import { describeWeatherCode, getTripForecast } from "@/lib/weather";

export async function WeatherWidget() {
  const forecast = await getTripForecast();

  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-white/60 px-3 py-3 shadow-sm dark:bg-white/10">
      {TRIP_DAYS.map((day) => {
        const dayForecast = forecast?.find((f) => f.date === day);
        const label = format(parseISO(day), "EEE d", { locale: es });

        return (
          <div
            key={day}
            className="flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-center"
          >
            <span className="text-xs font-medium capitalize text-cyan-800/70 dark:text-cyan-200/70">
              {label}
            </span>
            {dayForecast ? (
              <>
                <span className="text-xl leading-none">
                  {describeWeatherCode(dayForecast.weatherCode).icon}
                </span>
                <span className="text-xs font-semibold text-cyan-900 dark:text-cyan-50">
                  {Math.round(dayForecast.tempMax)}°/{Math.round(dayForecast.tempMin)}°
                </span>
              </>
            ) : (
              <span className="text-xs text-cyan-800/40 dark:text-cyan-200/40">
                Próximamente
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
