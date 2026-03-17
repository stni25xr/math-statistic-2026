import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-700/70 dark:bg-slate-950/85">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-wide text-slate-900 dark:text-slate-100"
        >
          Math Statistics Exam Trainer
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            href="/practice"
            className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Practice mode
          </Link>
          <Link
            href="/crash-plan"
            className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            3-day crash plan
          </Link>
        </nav>
      </div>
    </header>
  );
}
