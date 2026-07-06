import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityActionType, Database } from "@/lib/database.types";

// Inserta una fila en activity_log. La usan los módulos de gastos,
// compras, itinerario y fotos para alimentar el feed del header.
export async function logActivity(
  supabase: SupabaseClient<Database>,
  params: {
    participantId: string | null;
    actionType: ActivityActionType;
    description: string;
  }
) {
  const { error } = await supabase.from("activity_log").insert({
    participant_id: params.participantId,
    action_type: params.actionType,
    description: params.description,
  });

  if (error) {
    console.error("No se pudo registrar la actividad:", error.message);
  }
}
