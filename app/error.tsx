"use client";

export default function Error({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">
          Não foi possível carregar os pedidos
        </h2>
        <p className="text-sm text-muted">
          Pode ter sido uma falha passageira de conexão com o banco. Tente
          novamente.
        </p>
      </div>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity"
      >
        Tentar novamente
      </button>
    </div>
  );
}
