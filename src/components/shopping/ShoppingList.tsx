import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { SHOPPING_CATEGORIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";
import type { Database } from "@/lib/database.types";

type ShoppingItem = Database["public"]["Tables"]["shopping_items"]["Row"];
type Participant = Database["public"]["Tables"]["participants"]["Row"];
type Expense = Database["public"]["Tables"]["expenses"]["Row"];

export function ShoppingList({
  items,
  participantById,
  expenseById,
  onToggle,
}: {
  items: ShoppingItem[];
  participantById: Map<string, Participant>;
  expenseById: Map<string, Expense>;
  onToggle: (item: ShoppingItem) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-cyan-800/60 dark:text-cyan-200/60">
        La lista está vacía. ¡Agrega algo!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {SHOPPING_CATEGORIES.map(({ value, label }) => {
        const categoryItems = items.filter((i) => i.category === value);
        if (categoryItems.length === 0) return null;

        return (
          <div key={value}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-cyan-800/60 dark:text-cyan-200/60">
              {label}
            </h3>
            <ul className="flex flex-col gap-2">
              {categoryItems.map((item) => {
                const addedBy = participantById.get(item.added_by);
                const purchasedBy = item.purchased_by
                  ? participantById.get(item.purchased_by)
                  : undefined;
                const expense = item.expense_id
                  ? expenseById.get(item.expense_id)
                  : undefined;

                return (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-3 shadow-sm dark:bg-white/10"
                  >
                    <button
                      onClick={() => onToggle(item)}
                      aria-label={
                        item.is_purchased ? "Marcar como pendiente" : "Marcar como comprado"
                      }
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs transition ${
                        item.is_purchased
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-cyan-900/25 dark:border-cyan-100/25"
                      }`}
                    >
                      {item.is_purchased && "✓"}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          item.is_purchased
                            ? "text-cyan-900/50 line-through dark:text-cyan-50/40"
                            : "text-cyan-900 dark:text-cyan-50"
                        }`}
                      >
                        {item.name}
                      </p>

                      {item.is_purchased && purchasedBy ? (
                        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-cyan-800/60 dark:text-cyan-200/60">
                          <Avatar
                            name={purchasedBy.name}
                            avatarUrl={purchasedBy.avatar_url}
                            size={16}
                          />
                          Comprado por {purchasedBy.name}
                          {item.purchased_at && (
                            <>
                              {" · "}
                              {formatDistanceToNow(new Date(item.purchased_at), {
                                locale: es,
                                addSuffix: true,
                              })}
                            </>
                          )}
                          {expense && (
                            <Link
                              href="/gastos"
                              className="rounded-full bg-orange-100 px-2 py-0.5 font-semibold text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300"
                            >
                              {formatCurrency(Number(expense.amount))}
                            </Link>
                          )}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-cyan-800/50 dark:text-cyan-200/50">
                          Agregado por {addedBy?.name ?? "?"}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
