interface StatCardProps {
  label: string;
  value: string;
  tone?: "default" | "danger";
}

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-4 py-3 sm:px-5 sm:py-4">
      <span className="text-xs text-muted sm:text-sm">{label}</span>
      <span
        className={`text-xl font-semibold sm:text-2xl ${
          tone === "danger" ? "text-danger" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
