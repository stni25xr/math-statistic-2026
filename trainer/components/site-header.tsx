"use client";

import Link from "next/link";
import { useAccessibility } from "@/components/accessibility-provider";
import { useI18n } from "@/components/i18n-provider";

export function SiteHeader() {
  const { dyslexiaMode, toggleDyslexiaMode } = useAccessibility();
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-700/70 dark:bg-slate-950/85">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-wide text-slate-900 dark:text-slate-100"
        >
          {t("app_name")}
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <button
            type="button"
            onClick={toggleDyslexiaMode}
            className={`rounded-md px-3 py-1.5 transition ${
              dyslexiaMode
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            {dyslexiaMode ? t("dyslexia_on") : t("dyslexia_off")}
          </button>
          <Link
            href="/"
            className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("nav_home")}
          </Link>
          <Link
            href="/practice"
            className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("nav_practice")}
          </Link>
          <Link
            href="/crash-plan"
            className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {t("nav_crash")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
