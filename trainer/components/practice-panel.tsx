"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnswerWorkspace } from "@/components/answer-workspace";
import { CommonMistakeAlert } from "@/components/common-mistake-alert";
import { ExamQuestionBlock } from "@/components/exam-question-block";
import { ExamShortcutTip } from "@/components/exam-shortcut-tip";
import { QuizModePanel } from "@/components/quiz-mode-panel";
import { StepByStepSolution } from "@/components/step-by-step-solution";
import { useProgress } from "@/components/progress-provider";
import { categoryDefinitions, studyQuestions } from "@/lib/study-data";
import { CategorySlug, ProgressRating, StudyQuestion } from "@/lib/types";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export function PracticePanel() {
  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | "all">(
    "all",
  );
  const [timedMode, setTimedMode] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [sessionQuestions, setSessionQuestions] = useState<StudyQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const { progress, toggleCompleted, toggleReview, setRating } = useProgress();

  const started = sessionQuestions.length > 0;
  const current = sessionQuestions[index];

  const progressLabel = useMemo(() => {
    if (!started) {
      return "0 / 0";
    }
    return `${index + 1} / ${sessionQuestions.length}`;
  }, [index, sessionQuestions.length, started]);

  const startSession = () => {
    const base =
      selectedCategory === "all"
        ? studyQuestions
        : studyQuestions.filter((question) => question.category === selectedCategory);

    const randomized = shuffle(base);
    setSessionQuestions(randomized);
    setIndex(0);
    setRevealed(false);

    if (timedMode) {
      const safeMinutes = Number.isFinite(timerMinutes)
        ? Math.min(90, Math.max(5, timerMinutes))
        : 25;
      setTimeLeft(safeMinutes * 60);
    } else {
      setTimeLeft(null);
    }
  };

  const goNext = useCallback(() => {
    if (!started) {
      return;
    }
    setIndex((previous) => (previous + 1) % sessionQuestions.length);
    setRevealed(false);
  }, [sessionQuestions.length, started]);

  const applyRating = (rating: ProgressRating) => {
    if (!current) {
      return;
    }
    setRating(current.id, rating);
    toggleCompleted(current.id);
  };

  useEffect(() => {
    if (!started || !timedMode || timeLeft === null) {
      return;
    }

    if (timeLeft <= 0) {
      return;
    }

    const id = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous === null) {
          return previous;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [started, timedMode, timeLeft]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!started || !current) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
        return;
      }

      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        goNext();
      }
      if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        setRevealed((previous) => !previous);
      }
      if (event.key === "1") {
        event.preventDefault();
        setRating(current.id, "understood");
      }
      if (event.key === "2") {
        event.preventDefault();
        setRating(current.id, "almost");
      }
      if (event.key === "3") {
        event.preventDefault();
        setRating(current.id, "need-review");
      }
      if (event.key.toLowerCase() === "c") {
        event.preventDefault();
        toggleCompleted(current.id);
      }
      if (event.key.toLowerCase() === "f") {
        event.preventDefault();
        toggleReview(current.id);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    current,
    goNext,
    sessionQuestions.length,
    setRating,
    started,
    toggleCompleted,
    toggleReview,
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <header className="rounded-3xl border border-slate-200 bg-white/90 p-7 dark:border-slate-700 dark:bg-slate-900/90">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Practice mode
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-300">
          Random practice by category or mixed mode. Reveal answers only after your
          attempt. Keyboard shortcuts: N next, R reveal, 1/2/3 self-rating,
          C complete, F flag review.
        </p>
      </header>

      <div className="mt-6 space-y-6">
        <QuizModePanel
          categories={categoryDefinitions}
          selectedCategory={selectedCategory}
          timedMode={timedMode}
          timerMinutes={timerMinutes}
          onCategoryChange={setSelectedCategory}
          onTimedChange={setTimedMode}
          onTimerMinutesChange={setTimerMinutes}
          onStart={startSession}
        />

        {started && current ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Session progress {progressLabel}
                </p>
                <h2 className="mt-1 text-4xl font-semibold text-slate-900 dark:text-slate-100">
                  {current.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {timedMode && timeLeft !== null ? (
                  <span
                  className={`rounded-lg px-3 py-1.5 text-base font-semibold ${
                      timeLeft <= 60
                        ? "bg-rose-600 text-white"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {formatTime(Math.max(0, timeLeft))}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-base font-semibold text-white hover:bg-blue-700"
                >
                  Next question
                </button>
              </div>
            </div>

            <div className="mt-4">
              <ExamQuestionBlock text={current.question} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {current.category}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {current.difficulty}
              </span>
              {current.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-300 px-2 py-1 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-5">
              <AnswerWorkspace
                key={current.id}
                questionId={current.id}
                moduleName={
                  categoryDefinitions.find((c) => c.slug === current.category)?.title ??
                  current.category
                }
                moduleFormulas={
                  categoryDefinitions.find((c) => c.slug === current.category)
                    ?.keyFormulas ?? current.formulasNeeded
                }
                questionFormulas={current.formulasNeeded}
                category={current.category}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRevealed((previous) => !previous)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {revealed ? "Hide answer" : "Reveal answer"}
              </button>

              <button
                type="button"
                onClick={() => toggleCompleted(current.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  progress.completed.includes(current.id)
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
                }`}
              >
                {progress.completed.includes(current.id)
                  ? "Completed"
                  : "Mark completed"}
              </button>

              <button
                type="button"
                onClick={() => toggleReview(current.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  progress.review.includes(current.id)
                    ? "bg-amber-600 text-white"
                    : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
                }`}
              >
                {progress.review.includes(current.id) ? "Needs review" : "Flag review"}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyRating("understood")}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Understood
              </button>
              <button
                type="button"
                onClick={() => applyRating("almost")}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Almost
              </button>
              <button
                type="button"
                onClick={() => applyRating("need-review")}
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Need review
              </button>
            </div>

            {revealed ? (
              <div className="mt-5 space-y-4">
                <StepByStepSolution
                  steps={current.steps}
                  finalAnswer={current.finalAnswer}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <CommonMistakeAlert mistake={current.commonMistake} />
                  <ExamShortcutTip
                    shortcut={current.examShortcut}
                    memorize={current.memorizeThis}
                  />
                </div>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
