import Link from "next/link";

const SECTIONS = [
  {
    emoji: "💸",
    title: "Gastos",
    desc: "Cuotas compartidas estilo Splitwise",
    href: "/gastos",
  },
  {
    emoji: "🛒",
    title: "Compras",
    desc: "Lista compartida de compras",
    href: "/compras",
  },
  {
    emoji: "📅",
    title: "Itinerario",
    desc: "Plan día por día",
    href: "/itinerario",
  },
] as const;

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl bg-white/50 p-6 text-center shadow-sm dark:bg-white/5">
        <p className="text-2xl">🏖️ 🌅 🍹</p>
        <h2 className="mt-2 text-lg font-semibold text-cyan-900 dark:text-cyan-50">
          ¡Todo listo para el viaje!
        </h2>
        <p className="mt-1 text-sm text-cyan-800/60 dark:text-cyan-200/60">
          Gastos, compras e itinerario, todo compartido con el grupo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link key={s.title} href={s.href}>
            <div className="flex flex-col items-center gap-1 rounded-2xl bg-white/50 p-4 text-center shadow-sm transition hover:bg-white/70 dark:bg-white/5 dark:hover:bg-white/10">
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-sm font-semibold text-cyan-900 dark:text-cyan-50">
                {s.title}
              </span>
              <span className="text-xs text-cyan-800/60 dark:text-cyan-200/60">
                {s.desc}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
