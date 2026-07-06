import { ShoppingModule } from "@/components/shopping/ShoppingModule";

export default function ComprasPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-cyan-900 dark:text-cyan-50">
          🛒 Compras
        </h2>
        <p className="text-sm text-cyan-800/60 dark:text-cyan-200/60">
          Lista compartida. Al marcar algo como comprado, se registra el gasto.
        </p>
      </div>
      <ShoppingModule />
    </div>
  );
}
