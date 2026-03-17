"use client";

import { useMemo, useState } from "react";
import { FormulaBox } from "@/components/formula-box";
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
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [selectedFormula, setSelectedFormula] = useState("all");
  const [showFormulas, setShowFormulas] = useState(true);
  const [showSolutions, setShowSolutions] = useState(false);

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

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
          Category
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {category.title}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {category.explanation}
        </p>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            How to identify the right method
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
            onSearchChange={setSearch}
            onDifficultyChange={setDifficulty}
            onFormulaChange={setSelectedFormula}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowFormulas((previous) => !previous)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {showFormulas ? "Hide formulas" : "Show formulas"}
            </button>
            <button
              type="button"
              onClick={() => setShowSolutions((previous) => !previous)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {showSolutions ? "Hide solution previews" : "Show solution previews"}
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Question bank ({filteredQuestions.length})
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Easy, medium, and exam-like drills from all uploaded exams, grouped
              by this method.
            </p>
            <div className="mt-4 space-y-4">
              {filteredQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  showSolutionPreview={showSolutions}
                  showFormulas={showFormulas}
                />
              ))}
              {filteredQuestions.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  No questions match these filters. Try a wider keyword or reset
                  formula filter.
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          {showFormulas ? <FormulaBox formulas={category.keyFormulas} /> : null}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Common patterns
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
              {category.commonPatterns.map((pattern) => (
                <li key={pattern}>{pattern}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/30">
            <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
              Common mistakes
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
