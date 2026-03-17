"use client";

import { ChangeEvent } from "react";
import { Difficulty } from "@/lib/types";

interface TopicFilterBarProps {
  search: string;
  selectedDifficulty: Difficulty | "all";
  selectedFormula: string;
  formulaOptions: string[];
  onSearchChange: (value: string) => void;
  onDifficultyChange: (value: Difficulty | "all") => void;
  onFormulaChange: (value: string) => void;
}

export function TopicFilterBar({
  search,
  selectedDifficulty,
  selectedFormula,
  formulaOptions,
  onSearchChange,
  onDifficultyChange,
  onFormulaChange,
}: TopicFilterBarProps) {
  const onDifficultySelect = (event: ChangeEvent<HTMLSelectElement>) => {
    onDifficultyChange(event.target.value as Difficulty | "all");
  };

  return (
    <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-3">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
        Search keyword
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="e.g. z-test, Poisson, Bayes"
          className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
        />
      </label>

      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
        Difficulty
        <select
          value={selectedDifficulty}
          onChange={onDifficultySelect}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="all">All</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="exam-like">Exam-like</option>
        </select>
      </label>

      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
        Filter by formula/topic
        <select
          value={selectedFormula}
          onChange={(event) => onFormulaChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
        >
          <option value="all">All formulas/topics</option>
          {formulaOptions.map((formula) => (
            <option key={formula} value={formula}>
              {formula}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
