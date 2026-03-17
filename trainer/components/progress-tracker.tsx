"use client";

import { StudyQuestion } from "@/lib/types";
import { useProgress } from "@/components/progress-provider";

interface ProgressTrackerProps {
  questions: StudyQuestion[];
}

export function ProgressTracker({ questions }: ProgressTrackerProps) {
  const { progress } = useProgress();

  const total = questions.length;
  const completed = questions.filter((q) => progress.completed.includes(q.id)).length;
  const review = questions.filter((q) => progress.review.includes(q.id)).length;
  const understood = questions.filter(
    (q) => progress.ratings[q.id] === "understood",
  ).length;

  const progressPct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Progress overview
      </h2>
      <>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Completed</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {completed}/{total}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Need review</p>
            <p className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-300">
              {review}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">Understood</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
              {understood}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Goal progress (target: 30 points readiness)</span>
            <span>{progressPct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-blue-600 dark:bg-blue-400"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </>
    </section>
  );
}
