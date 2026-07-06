import type { BalanceEntry, DebtTransaction } from "@/lib/expenses";
import { formatCurrency } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";

export function BalanceSummary({
  balances,
  debts,
}: {
  balances: BalanceEntry[];
  debts: DebtTransaction[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl bg-white/60 p-4 shadow-sm dark:bg-white/10">
        <h3 className="mb-3 text-sm font-semibold text-cyan-900 dark:text-cyan-50">
          Balance por persona
        </h3>
        <ul className="flex flex-col gap-2">
          {balances.map((b) => (
            <li key={b.participantId} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-cyan-900 dark:text-cyan-50">
                <Avatar name={b.name} avatarUrl={b.avatarUrl} size={24} />
                {b.name}
              </span>
              <span className="flex items-center gap-2 text-xs text-cyan-800/50 dark:text-cyan-200/50">
                <span>
                  puso {formatCurrency(b.paid)} · le tocaba {formatCurrency(b.owed)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 font-semibold ${
                    b.balance > 0.5
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : b.balance < -0.5
                        ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        : "bg-cyan-900/10 text-cyan-800/60 dark:bg-white/10 dark:text-cyan-200/60"
                  }`}
                >
                  {b.balance > 0.5 ? "+" : ""}
                  {formatCurrency(b.balance)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-white/60 p-4 shadow-sm dark:bg-white/10">
        <h3 className="mb-3 text-sm font-semibold text-cyan-900 dark:text-cyan-50">
          Quién le debe a quién
        </h3>
        {debts.length === 0 ? (
          <p className="text-sm text-cyan-800/60 dark:text-cyan-200/60">
            Todos están al día 🎉
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {debts.map((d, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-xl bg-orange-50 px-3 py-2 text-sm dark:bg-orange-900/20"
              >
                <span className="text-cyan-900 dark:text-cyan-50">
                  {d.fromName} → {d.toName}
                </span>
                <span className="font-semibold text-orange-700 dark:text-orange-300">
                  {formatCurrency(d.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
