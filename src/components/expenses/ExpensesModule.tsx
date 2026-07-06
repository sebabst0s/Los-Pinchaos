"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeBalances, simplifyDebts } from "@/lib/expenses";
import { formatCurrency } from "@/lib/format";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { BalanceSummary } from "@/components/expenses/BalanceSummary";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import type { Database } from "@/lib/database.types";

type Participant = Database["public"]["Tables"]["participants"]["Row"];
type Expense = Database["public"]["Tables"]["expenses"]["Row"];
type ExpenseSplit = Database["public"]["Tables"]["expense_splits"]["Row"];

export function ExpensesModule() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [splits, setSplits] = useState<ExpenseSplit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchAll = useCallback(async () => {
    const supabase = createClient();
    const [participantsRes, expensesRes, splitsRes] = await Promise.all([
      supabase.from("participants").select("*").order("name"),
      supabase.from("expenses").select("*").order("created_at", { ascending: false }),
      supabase.from("expense_splits").select("*"),
    ]);

    setParticipants(participantsRes.data ?? []);
    setExpenses(expensesRes.data ?? []);
    setSplits(splitsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    const supabase = createClient();
    const channel = supabase
      .channel("expenses_module")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        fetchAll
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expense_splits" },
        fetchAll
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  if (loading) {
    return <p className="text-center text-sm text-cyan-800/60">Cargando gastos...</p>;
  }

  const balances = computeBalances(participants, expenses, splits);
  const debts = simplifyDebts(balances);
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const perCapita = participants.length > 0 ? total / participants.length : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white/60 p-4 text-center shadow-sm dark:bg-white/10">
          <p className="text-xs text-cyan-800/60 dark:text-cyan-200/60">Total gastado</p>
          <p className="text-xl font-bold text-cyan-900 dark:text-cyan-50">
            {formatCurrency(total)}
          </p>
        </div>
        <div className="rounded-2xl bg-white/60 p-4 text-center shadow-sm dark:bg-white/10">
          <p className="text-xs text-cyan-800/60 dark:text-cyan-200/60">Per cápita</p>
          <p className="text-xl font-bold text-cyan-900 dark:text-cyan-50">
            {formatCurrency(perCapita)}
          </p>
        </div>
      </div>

      {showForm ? (
        <ExpenseForm
          participants={participants}
          onSaved={() => {
            setShowForm(false);
            fetchAll();
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          + Agregar gasto
        </button>
      )}

      <BalanceSummary balances={balances} debts={debts} />

      <div>
        <h3 className="mb-2 text-sm font-semibold text-cyan-900 dark:text-cyan-50">
          Historial
        </h3>
        <ExpenseList expenses={expenses} participants={participants} onDeleted={fetchAll} />
      </div>
    </div>
  );
}
