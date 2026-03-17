"use client";

import { useMemo, useState } from "react";
import { FormulaBox } from "@/components/formula-box";
import { useI18n } from "@/components/i18n-provider";
import { QuestionCard } from "@/components/question-card";
import { TopicFilterBar } from "@/components/topic-filter-bar";
import { CategoryDefinition, Difficulty, StudyQuestion } from "@/lib/types";

interface CategoryPageClientProps {
  category: CategoryDefinition;
  questions: StudyQuestion[];
}

export function CategoryPageClient({
  category,
  questions,
}: CategoryPageClientProps) {
  const { t, categoryTitle } = useI18n();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [selectedFormula, setSelectedFormula] = useState("all");
  const [showFormulas, setShowFormulas] = useState(true);
  const [showSolutions, setShowSolutions] = useState(false);
  const [oneAtATime, setOneAtATime] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);

  const formulaOptions = useMemo(() => {
    const formulas = new Set<string>();
    questions.forEach((question) => {
      question.formulasNeeded.forEach((formula) => formulas.add(formula));
    });
    return Array.from(formulas);
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return questions.filter((question) => {
      const matchesSearch =
        needle.length === 0 ||
        [question.title, question.question, question.tags.join(" "), question.subcategory]
          .join(" ")
          .toLowerCase()
          .includes(needle);

      const matchesDifficulty =
        difficulty === "all" || question.difficulty === difficulty;

      const matchesFormula =
        selectedFormula === "all" || question.formulasNeeded.includes(selectedFormula);

      return matchesSearch && matchesDifficulty && matchesFormula;
    });
  }, [difficulty, questions, search, selectedFormula]);

  const boundedIndex =
    filteredQuestions.length === 0
      ? 0
      : Math.min(questionIndex, filteredQuestions.length - 1);
  const currentQuestion = filteredQuestions[boundedIndex];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
          {t("category")}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {categoryTitle(category.slug, category.title)}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {category.explanation}
        </p>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t("how_identify_method")}
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
            {category.methodRecognition.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-4">
          <TopicFilterBar
            search={search}
            selectedDifficulty={difficulty}
            selectedFormula={selectedFormula}
            formulaOptions={formulaOptions}
            onSearchChange={(value) => {
              setSearch(value);
              setQuestionIndex(0);
            }}
            onDifficultyChange={(value) => {
              setDifficulty(value);
              setQuestionIndex(0);
            }}
            onFormulaChange={(value) => {
              setSelectedFormula(value);
              setQuestionIndex(0);
            }}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowFormulas((previous) => !previous)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {showFormulas ? t("hide_formulas") : t("show_formulas")}
            </button>
            <button
              type="button"
              onClick={() => setShowSolutions((previous) => !previous)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {showSolutions
                ? t("hide_solution_previews")
                : t("show_solution_previews")}
            </button>
            <button
              type="button"
              onClick={() => setOneAtATime((previous) => !previous)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {oneAtATime
                ? t("switch_full_list")
                : t("one_question_at_a_time")}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t("question_bank", { count: filteredQuestions.length })}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              {t("question_bank_subtitle")}
            </p>
            <div className="mt-4 space-y-4">
              {filteredQuestions.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {t("no_questions_match")}
                </p>
              ) : oneAtATime ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {t("question_x_of_y", {
                        x: boundedIndex + 1,
                        y: filteredQuestions.length,
                      })}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setQuestionIndex(
                            boundedIndex === 0
                              ? filteredQuestions.length - 1
                              : boundedIndex - 1,
                          )
                        }
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700"
                      >
                        {t("previous")}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setQuestionIndex(
                            (boundedIndex + 1) % filteredQuestions.length,
                          )
                        }
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        {t("next")}
                      </button>
                    </div>
                  </div>
                  {currentQuestion ? (
                    <QuestionCard
                      question={currentQuestion}
                      showSolutionPreview={showSolutions}
                      showFormulas={showFormulas}
                    />
                  ) : null}
                </>
              ) : (
                filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    showSolutionPreview={showSolutions}
                    showFormulas={showFormulas}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          {showFormulas ? <FormulaBox formulas={category.keyFormulas} /> : null}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("common_patterns")}
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
              {category.commonPatterns.map((pattern) => (
                <li key={pattern}>{pattern}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/30">
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              {t("common_mistakes")}
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900 dark:text-amber-100">
              {category.commonMistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}
