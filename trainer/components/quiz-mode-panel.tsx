"use client";

import { CategoryDefinition, CategorySlug } from "@/lib/types";

interface QuizModePanelProps {
  categories: CategoryDefinition[];
  selectedCategory: CategorySlug | "all";
  timedMode: boolean;
  timerMinutes: number;
  onCategoryChange: (value: CategorySlug | "all") => void;
  onTimedChange: (value: boolean) => void;
  onTimerMinutesChange: (value: number) => void;
  onStart: () => void;
}

export function QuizModePanel({
  categories,
  selectedCategory,
  timedMode,
  timerMinutes,
  onCategoryChange,
  onTimedChange,
  onTimerMinutesChange,
  onStart,
}: QuizModePanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Practice mode setup
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Choose a category or train mixed. Enable timer for exam pressure.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Mode
          <select
            value={selectedCategory}
            onChange={(event) =>
              onCategoryChange(event.target.value as CategorySlug | "all")
            }
            className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="all">Mixed all categories</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.title}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-end gap-2 rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm font-medium text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
          <input
            type="checkbox"
            checked={timedMode}
            onChange={(event) => onTimedChange(event.target.checked)}
            className="h-4 w-4"
          />
          Timed mode
        </label>

        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Timer (minutes)
          <input
            type="number"
            min={5}
            max={90}
            value={timerMinutes}
            onChange={(event) => onTimerMinutesChange(Number(event.target.value))}
            disabled={!timedMode}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Start training
      </button>
    </section>
  );
}
