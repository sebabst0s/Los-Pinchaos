// Configuración del viaje. Ajusta estos valores según el destino real.

export const TRIP_NAME = "Viaje a la Playa";
export const GROUP_NAME = "Los Pinchaos";

export const DESTINATION = {
  name: "Matanzas, Navidad, O'Higgins",
  latitude: -33.9636,
  longitude: -71.8756,
  timezone: "America/Santiago",
};

// Fechas del viaje (ISO, sin hora) — usadas para el itinerario y el splash.
export const TRIP_DAYS = ["2026-07-17", "2026-07-18", "2026-07-19"] as const;

// Fecha/hora de inicio del viaje para la cuenta regresiva del header.
export const TRIP_START = new Date("2026-07-17T00:00:00");

export const EXPENSE_CATEGORIES = [
  { value: "comida", label: "Comida" },
  { value: "alojamiento", label: "Alojamiento" },
  { value: "transporte", label: "Transporte" },
  { value: "actividades", label: "Actividades" },
  { value: "otros", label: "Otros" },
] as const;

export const SHOPPING_CATEGORIES = [
  { value: "comida", label: "Comida" },
  { value: "bebidas", label: "Bebidas" },
  { value: "insumos_playa", label: "Insumos playa" },
  { value: "otros", label: "Otros" },
] as const;

export const CURRENT_USER_STORAGE_KEY = "viaje-playa:participant-id";

export const CURRENCY = "CLP";
export const CURRENCY_LOCALE = "es-CL";
