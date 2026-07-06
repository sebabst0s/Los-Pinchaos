"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/activity";
import { splitEqually } from "@/lib/expenses";
import { expenseCategoryForShoppingItem } from "@/lib/shopping";
import { formatCurrency } from "@/lib/format";
import { useParticipant } from "@/lib/participant-context";
import { AddItemForm } from "@/components/shopping/AddItemForm";
import { ShoppingList } from "@/components/shopping/ShoppingList";
import { PurchaseAmountModal } from "@/components/shopping/PurchaseAmountModal";
import type { Database } from "@/lib/database.types";

type Participant = Database["public"]["Tables"]["participants"]["Row"];
type ShoppingItem = Database["public"]["Tables"]["shopping_items"]["Row"];
type Expense = Database["public"]["Tables"]["expenses"]["Row"];

export function ShoppingModule() {
  const { participant: me } = useParticipant();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingItem, setPendingItem] = useState<ShoppingItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const [participantsRes, itemsRes, expensesRes] = await Promise.all([
      supabase.from("participants").select("*").order("name"),
      supabase.from("shopping_items").select("*").order("created_at", { ascending: true }),
      supabase.from("expenses").select("*"),
    ]);

    setParticipants(participantsRes.data ?? []);
    setItems(itemsRes.data ?? []);
    setExpenses(expensesRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    const supabase = createClient();
    const channel = supabase
      .channel("shopping_module")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shopping_items" },
        fetchAll
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        fetchAll
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  async function handleConfirmPurchase(amount: number) {
    if (!pendingItem || !me) return;
    setSubmitting(true);
    const supabase = createClient();

    const { data: expense, error: expenseError } = await supabase
      .from("expenses")
      .insert({
        description: `Compra: ${pendingItem.name}`,
        amount,
        category: expenseCategoryForShoppingItem(pendingItem.category),
        paid_by: me.id,
      })
      .select()
      .single();

    if (expenseError || !expense) {
      alert("No se pudo crear el gasto asociado.");
      setSubmitting(false);
      return;
    }

    const shares = splitEqually(amount, participants.length);
    const { error: splitsError } = await supabase.from("expense_splits").insert(
      participants.map((p, i) => ({
        expense_id: expense.id,
        participant_id: p.id,
        amount: shares[i],
      }))
    );

    if (splitsError) {
      alert("El gasto se creó pero no se pudo dividir. Revisa el módulo de gastos.");
    }

    await supabase
      .from("shopping_items")
      .update({
        is_purchased: true,
        purchased_by: me.id,
        purchased_at: new Date().toISOString(),
        expense_id: expense.id,
      })
      .eq("id", pendingItem.id);

    await logActivity(supabase, {
      participantId: me.id,
      actionType: "shopping_item_purchased",
      description: `${me.name} compró "${pendingItem.name}" (${formatCurrency(amount)})`,
    });

    setSubmitting(false);
    setPendingItem(null);
    fetchAll();
  }

  async function handleUnmark(item: ShoppingItem) {
    const supabase = createClient();

    if (item.expense_id) {
      const linkedExpense = expenses.find((e) => e.id === item.expense_id);
      const amountLabel = linkedExpense
        ? ` de ${formatCurrency(Number(linkedExpense.amount))}`
        : "";
      const shouldDelete = confirm(
        `Este ítem tiene un gasto asociado${amountLabel}. ¿Quieres eliminarlo también?`
      );
      if (shouldDelete) {
        await supabase.from("expenses").delete().eq("id", item.expense_id);
      }
    }

    await supabase
      .from("shopping_items")
      .update({
        is_purchased: false,
        purchased_by: null,
        purchased_at: null,
        expense_id: null,
      })
      .eq("id", item.id);

    fetchAll();
  }

  function handleToggle(item: ShoppingItem) {
    if (item.is_purchased) {
      handleUnmark(item);
    } else {
      setPendingItem(item);
    }
  }

  if (loading) {
    return <p className="text-center text-sm text-cyan-800/60">Cargando lista...</p>;
  }

  const participantById = new Map(participants.map((p) => [p.id, p]));
  const expenseById = new Map(expenses.map((e) => [e.id, e]));
  const pendingCount = items.filter((i) => !i.is_purchased).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-white/60 p-4 text-center shadow-sm dark:bg-white/10">
        <p className="text-xs text-cyan-800/60 dark:text-cyan-200/60">Pendientes</p>
        <p className="text-xl font-bold text-cyan-900 dark:text-cyan-50">{pendingCount}</p>
      </div>

      <AddItemForm onAdded={fetchAll} />

      <ShoppingList
        items={items}
        participantById={participantById}
        expenseById={expenseById}
        onToggle={handleToggle}
      />

      {pendingItem && (
        <PurchaseAmountModal
          item={pendingItem}
          submitting={submitting}
          onConfirm={handleConfirmPurchase}
          onCancel={() => setPendingItem(null)}
        />
      )}
    </div>
  );
}
