"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnswerWorkspace } from "@/components/answer-workspace";
import { CommonMistakeAlert } from "@/components/common-mistake-alert";
import { ExamQuestionBlock } from "@/components/exam-question-block";
import { ExamShortcutTip } from "@/components/exam-shortcut-tip";
import { FormulaBox } from "@/components/formula-box";
import { useI18n } from "@/components/i18n-provider";
import { MathText } from "@/components/math-text";
import { StepByStepSolution } from "@/components/step-by-step-solution";
import { useProgress } from "@/components/progress-provider";
import { categoryDefinitions, studyQuestions } from "@/lib/study-data";
import { ProgressRating, StudyQuestion } from "@/lib/types";

interface QuestionViewClientProps {
  question: StudyQuestion;
}

export function QuestionViewClient({ question }: QuestionViewClientProps) {
  const [showFormulas, setShowFormulas] = useState(true);
  const [showSolution, setShowSolution] = useState(true);

  const { progress, toggleCompleted, toggleReview, setRating } = useProgress();
  const { t, categoryTitle } = useI18n();

  const category = useMemo(
    () => categoryDefinitions.find((item) => item.slug === question.category),
    [question.category],
  );
  const questionTypePool = useMemo(
    () =>
      Array.from(new Set(studyQuestions.map((item) => item.subcategory)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [],
  );
  const formulaPool = useMemo(
    () =>
      Array.from(
        new Set(studyQuestions.flatMap((item) => item.formulasNeeded)),
      )
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [],
  );

  const selectedRating = progress.ratings[question.id];
  const isCompleted = progress.completed.includes(question.id);
  const isReview = progress.review.includes(question.id);
  const ratingLabels: Record<ProgressRating, string> = {
    understood: t("understood"),
    almost: t("almost"),
    "need-review": t("need_review"),
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <Link
        href={`/categories/${question.category}`}
        className="text-sm text-blue-700 underline decoration-blue-300 underline-offset-2 dark:text-blue-300"
      >
        {t("back_to_category")}
      </Link>

      <article className="mt-3 rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 sm:p-10">
        <header>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <span>{categoryTitle(question.category, category?.title ?? question.category)}</span>
            <span>•</span>
            <span>{question.subcategory}</span>
            <span>•</span>
            <span>{question.difficulty}</span>
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            {question.title}
          </h1>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {t("source_problem", {
              exam: question.sourceExam,
              problem: question.originalProblemNumber,
            })}
          </p>

          <div className="mt-4">
            <ExamQuestionBlock text={question.question} />
          </div>
        </header>

        <section className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("why_method_applies")}
            </h2>
            <div className="mt-2 text-base leading-relaxed text-slate-700 dark:text-slate-200">
              <MathText text={question.whyMethodApplies} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("pattern_hint")}
            </h2>
            <div className="mt-2 text-base leading-relaxed text-slate-700 dark:text-slate-200">
              <MathText text={question.patternHint} />
            </div>
          </div>
        </section>

        {question.alternativeMethodWarning ? (
          <section className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-100">
            <p className="font-semibold">{t("why_other_wrong")}</p>
            <p className="mt-1">{question.alternativeMethodWarning}</p>
          </section>
        ) : null}

        <section className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowFormulas((previous) => !previous)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {showFormulas ? t("hide_formulas") : t("show_formulas")}
          </button>
          <button
            type="button"
            onClick={() => setShowSolution((previous) => !previous)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {showSolution ? t("hide_full_solution") : t("show_full_solution")}
          </button>
        </section>

        {showFormulas ? (
          <div className="mt-4">
            <FormulaBox formulas={question.formulasNeeded} />
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <CommonMistakeAlert mistake={question.commonMistake} />
          <ExamShortcutTip
            shortcut={question.examShortcut}
            memorize={question.memorizeThis}
          />
        </div>

        {showSolution ? (
          <div className="mt-4">
            <StepByStepSolution
              steps={question.steps}
              finalAnswer={question.finalAnswer}
            />
          </div>
        ) : null}

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t("track_question")}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => toggleCompleted(question.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                isCompleted
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
              }`}
            >
              {isCompleted ? t("completed") : t("mark_completed")}
            </button>
            <button
              type="button"
              onClick={() => toggleReview(question.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                isReview
                  ? "bg-amber-600 text-white"
                  : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
              }`}
            >
              {isReview ? t("needs_review") : t("flag_review")}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(ratingLabels) as ProgressRating[]).map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setRating(question.id, rating)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  selectedRating === rating
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
                }`}
              >
                {ratingLabels[rating]}
              </button>
            ))}
          </div>
        </section>

        <div className="mt-5">
          <AnswerWorkspace
            key={question.id}
            questionId={question.id}
            questionText={question.question}
            expectedAnswer={question.finalAnswer}
            questionType={question.subcategory}
            formulasNeeded={question.formulasNeeded}
            questionTypePool={questionTypePool}
            formulaPool={formulaPool}
          />
        </div>
      </article>
    </main>
  );
}
