export interface BalanceEntry {
  participantId: string;
  name: string;
  avatarUrl: string | null;
  paid: number;
  owed: number;
  balance: number; // paid - owed. Positivo: el grupo le debe. Negativo: debe al grupo.
}

export interface DebtTransaction {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amount: number;
}

// Divide `amount` en partes iguales entre `count` personas, en enteros
// (CLP no usa decimales), repartiendo el resto de redondeo entre las
// primeras personas para que la suma siga dando exacto.
export function splitEqually(amount: number, count: number): number[] {
  if (count <= 0) return [];
  const base = Math.floor(amount / count);
  const remainder = Math.round(amount - base * count);
  return Array.from({ length: count }, (_, i) => base + (i < remainder ? 1 : 0));
}

export function computeBalances(
  participants: { id: string; name: string; avatar_url: string | null }[],
  expenses: { paid_by: string; amount: number }[],
  splits: { participant_id: string; amount: number }[]
): BalanceEntry[] {
  const paidMap = new Map<string, number>();
  const owedMap = new Map<string, number>();

  for (const e of expenses) {
    paidMap.set(e.paid_by, (paidMap.get(e.paid_by) ?? 0) + Number(e.amount));
  }
  for (const s of splits) {
    owedMap.set(
      s.participant_id,
      (owedMap.get(s.participant_id) ?? 0) + Number(s.amount)
    );
  }

  return participants.map((p) => {
    const paid = paidMap.get(p.id) ?? 0;
    const owed = owedMap.get(p.id) ?? 0;
    return {
      participantId: p.id,
      name: p.name,
      avatarUrl: p.avatar_url,
      paid,
      owed,
      balance: paid - owed,
    };
  });
}

// Algoritmo clásico de simplificación de deudas (estilo Splitwise):
// empareja al mayor deudor con el mayor acreedor hasta saldar todo,
// minimizando la cantidad de transferencias necesarias.
export function simplifyDebts(balances: BalanceEntry[]): DebtTransaction[] {
  const creditors = balances
    .filter((b) => b.balance > 0.5)
    .map((b) => ({ id: b.participantId, name: b.name, amount: b.balance }))
    .sort((a, b) => b.amount - a.amount);

  const debtors = balances
    .filter((b) => b.balance < -0.5)
    .map((b) => ({ id: b.participantId, name: b.name, amount: -b.balance }))
    .sort((a, b) => b.amount - a.amount);

  const transactions: DebtTransaction[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    if (amount > 0.5) {
      transactions.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amount: Math.round(amount),
      });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount <= 0.5) i++;
    if (creditor.amount <= 0.5) j++;
  }

  return transactions;
}
