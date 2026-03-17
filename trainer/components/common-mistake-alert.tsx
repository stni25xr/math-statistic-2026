"use client";

import { useI18n } from "@/components/i18n-provider";

interface CommonMistakeAlertProps {
  mistake: string;
}

export function CommonMistakeAlert({
  mistake,
}: CommonMistakeAlertProps) {
  const { t } = useI18n();

  return (
    <aside className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
      <p className="font-semibold">{t("common_mistake")}</p>
      <p className="mt-1">{mistake}</p>
    </aside>
  );
}
