import { ItineraryModule } from "@/components/itinerary/ItineraryModule";

export default function ItinerarioPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-cyan-900 dark:text-cyan-50">
          📅 Itinerario
        </h2>
        <p className="text-sm text-cyan-800/60 dark:text-cyan-200/60">
          El plan día por día. Cualquiera puede agregar o editar actividades.
        </p>
      </div>
      <ItineraryModule />
    </div>
  );
}
