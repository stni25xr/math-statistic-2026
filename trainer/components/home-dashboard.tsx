"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CategoryCard } from "@/components/category-card";
import { useI18n } from "@/components/i18n-provider";
import { ProgressTracker } from "@/components/progress-tracker";
import {
  categoryDefinitions,
  categoryOrder,
  getQuestionsForCategory,
  studyQuestions,
} from "@/lib/study-data";
import { useProgress } from "@/components/progress-provider";

export function HomeDashboard() {
  const [search, setSearch] = useState("");
  const { progress } = useProgress();
  const { t } = useI18n();

  const orderedCategories = useMemo(
    () =>
      categoryOrder
        .map((slug) => categoryDefinitions.find((category) => category.slug === slug))
        .filter((category): category is (typeof categoryDefinitions)[number] =>
          Boolean(category),
        ),
    [],
  );

  const searchResults = useMemo(() => {
    const needle = search.trim().toLowerCase();

    if (!needle) {
      return [];
    }

    return studyQuestions
      .filter((question) => {
        const corpus = [
          question.title,
          question.question,
          question.tags.join(" "),
          question.formulasNeeded.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return corpus.includes(needle);
      })
      .slice(0, 8);
  }, [search]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-10">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
          {t("home_target")}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
          {t("app_name")}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300 sm:text-base">
          {t("home_subtitle")}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/practice"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t("start_training")}
          </Link>
        </div>

        <label className="mt-6 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("search_label")}
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("search_placeholder")}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
          />
        </label>

        {search ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("search_results", { count: searchResults.length })}
            </p>
            <ul className="mt-2 space-y-2">
              {searchResults.length === 0 ? (
                <li className="text-sm text-slate-600 dark:text-slate-300">
                  {t("no_match_try")}
                </li>
              ) : (
                searchResults.map((question) => (
                  <li key={question.id}>
                    <Link
                      href={`/questions/${question.id}`}
                      className="text-sm text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                    >
                      {question.title}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : null}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {t("topic_categories")}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {t("organized_by_type")}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {orderedCategories.map((category) => {
              const questions = getQuestionsForCategory(category.slug);
              const completedCount = questions.filter((question) =>
                progress.completed.includes(question.id),
              ).length;

              return (
                <CategoryCard
                  key={category.slug}
                  category={category}
                  questionCount={questions.length}
                  completedCount={completedCount}
                />
              );
            })}
          </div>
        </section>

        <div className="space-y-4">
          <ProgressTracker questions={studyQuestions} />
        </div>
      </div>
    </main>
  );
}
