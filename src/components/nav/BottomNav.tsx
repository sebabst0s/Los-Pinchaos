"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", emoji: "🏠", label: "Inicio", disabled: false },
  { href: "/gastos", emoji: "💸", label: "Gastos", disabled: false },
  { href: "/compras", emoji: "🛒", label: "Compras", disabled: false },
  { href: "/itinerario", emoji: "📅", label: "Itinerario", disabled: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-30 border-t border-cyan-900/10 bg-white/80 backdrop-blur-md dark:border-cyan-100/10 dark:bg-cyan-950/80">
      <div className="mx-auto flex max-w-5xl items-stretch justify-around">
        {ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const content = (
            <div
              className={`flex flex-col items-center gap-0.5 px-2 py-2.5 text-xs font-medium transition ${
                item.disabled
                  ? "text-cyan-800/30 dark:text-cyan-200/30"
                  : isActive
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-cyan-800/60 hover:text-cyan-900 dark:text-cyan-200/60 dark:hover:text-cyan-50"
              }`}
            >
              <span className="text-lg">{item.emoji}</span>
              {item.label}
            </div>
          );

          if (item.disabled) {
            return (
              <div key={item.href} className="flex-1 text-center">
                {content}
              </div>
            );
          }

          return (
            <Link key={item.href} href={item.href} className="flex-1 text-center">
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
