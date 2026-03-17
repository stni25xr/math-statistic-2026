"use client";

import { useState } from "react";
import { Locale, useI18n } from "@/components/i18n-provider";

const localeMeta: Record<Locale, { flag: string; label: string }> = {
  en: { flag: "🇬🇧", label: "English" },
  sv: { flag: "🇸🇪", label: "Svenska" },
  fr: { flag: "🇫🇷", label: "Français" },
};

export function LanguageSwitcherEdge() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-2 top-1/2 z-40 -translate-y-1/2">
      {open ? (
        <div className="mb-2 rounded-xl border border-slate-300 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t("language")}
          </p>
          <div className="space-y-1">
            {(Object.keys(localeMeta) as Locale[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setLocale(key);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  locale === key
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                <span>{localeMeta[key].flag}</span>
                <span>{localeMeta[key].label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="rounded-full border border-slate-300 bg-white p-3 text-2xl shadow-lg transition hover:scale-105 dark:border-slate-700 dark:bg-slate-900"
        aria-label={t("language")}
        title={t("language")}
      >
        {localeMeta[locale].flag}
      </button>
    </div>
  );
}
