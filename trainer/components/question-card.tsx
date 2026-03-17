"use client";

import Link from "next/link";
import { StudyQuestion } from "@/lib/types";
import { useProgress } from "@/components/progress-provider";

interface QuestionCardProps {
  question: StudyQuestion;
  showSolutionPreview?: boolean;
  showFormulas?: boolean;
}

export function QuestionCard({
  question,
  showSolutionPreview = false,
  showFormulas = false,
}: QuestionCardProps) {
  const { progress, toggleCompleted, toggleReview } = useProgress();

  const isCompleted = progress.completed.includes(question.id);
  const isReview = progress.review.includes(question.id);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {question.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {question.sourceExam} · Problem {question.originalProblemNumber}
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {question.difficulty}
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{question.question}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {question.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-slate-300 px-2 py-1 text-xs text-slate-600 dark:border-slate-600 dark:text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>

      {showFormulas ? (
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <p className="font-semibold">Formulas needed</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {question.formulasNeeded.map((formula) => (
              <li key={formula}>{formula}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {showSolutionPreview ? (
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-950 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-100">
          <p className="font-semibold">Method in one line</p>
          <p className="mt-1">{question.whyMethodApplies}</p>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => toggleCompleted(question.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isCompleted
              ? "bg-emerald-600 text-white"
              : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
          }`}
        >
          {isCompleted ? "Completed" : "Mark completed"}
        </button>

        <button
          type="button"
          onClick={() => toggleReview(question.id)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isReview
              ? "bg-amber-600 text-white"
              : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
          }`}
        >
          {isReview ? "Needs review" : "Flag review"}
        </button>

        <Link
          href={`/questions/${question.id}`}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Open question
        </Link>
      </div>
    </article>
  );
}
