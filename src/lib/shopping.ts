import type { ExpenseCategory, ShoppingCategory } from "@/lib/database.types";

// Categoría de gasto que se usa al crear automáticamente el gasto
// asociado a un ítem de compras marcado como "comprado".
const SHOPPING_TO_EXPENSE_CATEGORY: Record<ShoppingCategory, ExpenseCategory> = {
  comida: "comida",
  bebidas: "comida",
  insumos_playa: "otros",
  otros: "otros",
};

export function expenseCategoryForShoppingItem(
  category: ShoppingCategory
): ExpenseCategory {
  return SHOPPING_TO_EXPENSE_CATEGORY[category];
}
