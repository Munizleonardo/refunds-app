"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { refreshRefundsSnapshot } from "../_lib/refunds-actions";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      // Invalidates the shared snapshot server-side, then re-renders so
      // this (and every other visitor's next request) gets the fresh pull.
      await refreshRefundsSnapshot();
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:py-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`}
      >
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </svg>
      {isPending ? "Atualizando..." : "Atualizar"}
    </button>
  );
}
