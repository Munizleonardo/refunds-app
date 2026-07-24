import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-surface sm:px-6 sm:py-4">
      <div className="flex items-center gap-3">
        <Logo />
        <span className="text-lg font-semibold tracking-tight">Refunds</span>
      </div>
      <ThemeToggle />
    </header>
  );
}
