"use client";

import { useI18n } from "@/components/i18n-provider";

interface ExamShortcutTipProps {
  shortcut: string;
  memorize: string;
}

export function ExamShortcutTip({
  shortcut,
  memorize,
}: ExamShortcutTipProps) {
  const { t } = useI18n();

  return (
    <aside className="space-y-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100">
      <div>
        <p className="font-semibold">{t("exam_shortcut")}</p>
        <p className="mt-1">{shortcut}</p>
      </div>
      <div>
        <p className="font-semibold">{t("what_memorize")}</p>
        <p className="mt-1">{memorize}</p>
      </div>
    </aside>
  );
}
