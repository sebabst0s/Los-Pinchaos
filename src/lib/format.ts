import { CURRENCY, CURRENCY_LOCALE } from "@/lib/constants";

const formatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number) {
  return formatter.format(amount);
}
