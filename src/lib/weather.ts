import { DESTINATION, TRIP_DAYS } from "@/lib/constants";

export interface DayForecast {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number | null;
}

// Tabla WMO simplificada (https://open-meteo.com/en/docs) -> emoji + texto en español.
const WEATHER_CODE_MAP: Record<number, { icon: string; label: string }> = {
  0: { icon: "☀️", label: "Despejado" },
  1: { icon: "🌤️", label: "Mayormente despejado" },
  2: { icon: "⛅", label: "Parcialmente nublado" },
  3: { icon: "☁️", label: "Nublado" },
  45: { icon: "🌫️", label: "Niebla" },
  48: { icon: "🌫️", label: "Niebla" },
  51: { icon: "🌦️", label: "Llovizna leve" },
  53: { icon: "🌦️", label: "Llovizna" },
  55: { icon: "🌦️", label: "Llovizna intensa" },
  56: { icon: "🌧️", label: "Llovizna helada" },
  57: { icon: "🌧️", label: "Llovizna helada" },
  61: { icon: "🌧️", label: "Lluvia leve" },
  63: { icon: "🌧️", label: "Lluvia" },
  65: { icon: "🌧️", label: "Lluvia intensa" },
  66: { icon: "🌧️", label: "Lluvia helada" },
  67: { icon: "🌧️", label: "Lluvia helada" },
  71: { icon: "🌨️", label: "Nevada leve" },
  73: { icon: "🌨️", label: "Nevada" },
  75: { icon: "🌨️", label: "Nevada intensa" },
  77: { icon: "🌨️", label: "Granizo de nieve" },
  80: { icon: "🌦️", label: "Chubascos leves" },
  81: { icon: "🌦️", label: "Chubascos" },
  82: { icon: "⛈️", label: "Chubascos intensos" },
  85: { icon: "🌨️", label: "Chubascos de nieve" },
  86: { icon: "🌨️", label: "Chubascos de nieve" },
  95: { icon: "⛈️", label: "Tormenta" },
  96: { icon: "⛈️", label: "Tormenta con granizo" },
  99: { icon: "⛈️", label: "Tormenta con granizo" },
};

export function describeWeatherCode(code: number) {
  return WEATHER_CODE_MAP[code] ?? { icon: "🌡️", label: "Sin datos" };
}

export async function getTripForecast(): Promise<DayForecast[] | null> {
  const startDate = TRIP_DAYS[0];
  const endDate = TRIP_DAYS[TRIP_DAYS.length - 1];

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(DESTINATION.latitude));
  url.searchParams.set("longitude", String(DESTINATION.longitude));
  url.searchParams.set(
    "daily",
    "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max"
  );
  url.searchParams.set("timezone", DESTINATION.timezone);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);

  try {
    const res = await fetch(url.toString(), {
      // El pronóstico cambia de a poco: alcanza con refrescar cada 30 min.
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const days: string[] = data?.daily?.time ?? [];
    if (days.length === 0) return null;

    return days.map((date: string, i: number) => ({
      date,
      weatherCode: data.daily.weathercode[i],
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
      precipitationProbability:
        data.daily.precipitation_probability_max?.[i] ?? null,
    }));
  } catch {
    return null;
  }
}
