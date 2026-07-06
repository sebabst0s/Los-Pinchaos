import { ExpensesModule } from "@/components/expenses/ExpensesModule";

export default function GastosPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-cyan-900 dark:text-cyan-50">
          💸 Gastos
        </h2>
        <p className="text-sm text-cyan-800/60 dark:text-cyan-200/60">
          Registra gastos y mira quién le debe a quién.
        </p>
      </div>
      <ExpensesModule />
    </div>
  );
}
