"use client";

import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity";
import { useParticipant } from "@/lib/participant-context";
import { TRIP_DAYS } from "@/lib/constants";
import { ItineraryItemForm } from "@/components/itinerary/ItineraryItemForm";
import { ItineraryItemRow } from "@/components/itinerary/ItineraryItemRow";
import type { Database } from "@/lib/database.types";

type ItineraryItem = Database["public"]["Tables"]["itinerary_items"]["Row"];
type Participant = Database["public"]["Tables"]["participants"]["Row"];

export function ItineraryModule() {
  const { participant: me } = useParticipant();
  const [activeDay, setActiveDay] = useState<string>(TRIP_DAYS[0]);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const [itemsRes, participantsRes] = await Promise.all([
      supabase.from("itinerary_items").select("*").order("time", { ascending: true }),
      supabase.from("participants").select("*"),
    ]);

    setItems(itemsRes.data ?? []);
    setParticipants(participantsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    const supabase = createClient();
    const channel = supabase
      .channel("itinerary_module")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "itinerary_items" },
        fetchAll
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  async function handleAdd(values: {
    time: string | null;
    title: string;
    description: string | null;
  }) {
    if (!me) return;
    setSubmitting(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("itinerary_items")
      .insert({
        day: activeDay,
        time: values.time,
        title: values.title,
        description: values.description,
        created_by: me.id,
      })
      .select()
      .single();

    if (!error && data) {
      await logActivity(supabase, {
        participantId: me.id,
        actionType: "itinerary_item_added",
        description: `${me.name} agregó "${data.title}" al itinerario`,
      });
      setShowForm(false);
      fetchAll();
    }
    setSubmitting(false);
  }

  async function handleEdit(
    item: ItineraryItem,
    values: { time: string | null; title: string; description: string | null }
  ) {
    if (!me) return;
    const supabase = createClient();

    const { error } = await supabase
      .from("itinerary_items")
      .update({
        time: values.time,
        title: values.title,
        description: values.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (!error) {
      await logActivity(supabase, {
        participantId: me.id,
        actionType: "itinerary_item_updated",
        description: `${me.name} editó "${values.title}" en el itinerario`,
      });
      fetchAll();
    }
  }

  async function handleDelete(item: ItineraryItem) {
    if (!confirm(`¿Eliminar "${item.title}" del itinerario?`)) return;
    const supabase = createClient();
    await supabase.from("itinerary_items").delete().eq("id", item.id);
    fetchAll();
  }

  if (loading) {
    return <p className="text-center text-sm text-cyan-800/60">Cargando itinerario...</p>;
  }

  const participantById = new Map(participants.map((p) => [p.id, p]));
  const dayItems = items
    .filter((i) => i.day === activeDay)
    .sort((a, b) => {
      if (!a.time && !b.time) return 0;
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {TRIP_DAYS.map((day) => {
          const label = format(parseISO(day), "EEE d", { locale: es });
          const isActive = day === activeDay;
          return (
            <button
              key={day}
              onClick={() => {
                setActiveDay(day);
                setShowForm(false);
              }}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold capitalize transition ${
                isActive
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-white/60 text-cyan-800/70 hover:bg-white/80 dark:bg-white/10 dark:text-cyan-200/70"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {showForm ? (
        <ItineraryItemForm
          submitting={submitting}
          onCancel={() => setShowForm(false)}
          onSubmit={handleAdd}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          + Agregar actividad
        </button>
      )}

      <div className="flex flex-col gap-2">
        {dayItems.length === 0 ? (
          <p className="text-center text-sm text-cyan-800/60 dark:text-cyan-200/60">
            Todavía no hay planes para este día.
          </p>
        ) : (
          dayItems.map((item) => (
            <ItineraryItemRow
              key={item.id}
              item={item}
              createdBy={item.created_by ? participantById.get(item.created_by) : undefined}
              onSave={(values) => handleEdit(item, values)}
              onDelete={() => handleDelete(item)}
            />
          ))
        )}
      </div>
    </div>
  );
}
