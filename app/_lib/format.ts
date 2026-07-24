export function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function fullName(firstName: string, lastName: string): string {
  return [firstName, lastName].filter(Boolean).join(" ") || "—";
}

export function formatRelativeMinutes(fetchedAt: number): string {
  const minutes = Math.floor((Date.now() - fetchedAt) / 60000);
  if (minutes < 1) return "agora mesmo";
  if (minutes === 1) return "há 1 minuto";
  if (minutes < 60) return `há ${minutes} minutos`;

  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "há 1 hora";
  return `há ${hours} horas`;
}
