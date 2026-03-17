"use client";

import { useEffect, useMemo, useState } from "react";
import { BlockFormula } from "@/components/math-formula";
import { plainToLatex } from "@/lib/math-format";

interface AnswerWorkspaceProps {
  questionId: string;
}

interface DraftState {
  attempt: string;
  latex: string;
}

function storageKey(questionId: string): string {
  return `math-stat-2026-answer-${questionId}`;
}

function loadDraft(questionId: string): DraftState {
  if (typeof window === "undefined") {
    return { attempt: "", latex: "" };
  }

  const raw = localStorage.getItem(storageKey(questionId));
  if (!raw) {
    return { attempt: "", latex: "" };
  }

  try {
    const parsed = JSON.parse(raw) as DraftState;
    return {
      attempt: parsed.attempt ?? "",
      latex: parsed.latex ?? "",
    };
  } catch {
    return { attempt: "", latex: "" };
  }
}

export function AnswerWorkspace({ questionId }: AnswerWorkspaceProps) {
  const [attempt, setAttempt] = useState(() => loadDraft(questionId).attempt);
  const [latex, setLatex] = useState(() => loadDraft(questionId).latex);
  const [helperInput, setHelperInput] = useState("");
  const [helperOutput, setHelperOutput] = useState("");

  useEffect(() => {
    const payload: DraftState = { attempt, latex };
    localStorage.setItem(storageKey(questionId), JSON.stringify(payload));
  }, [attempt, latex, questionId]);

  const previewLines = useMemo(
    () => latex.split("\n").map((line) => line.trim()).filter(Boolean),
    [latex],
  );

  const convertWithHelper = () => {
    const converted = plainToLatex(helperInput);
    setHelperOutput(converted);
  };

  const insertConverted = () => {
    if (!helperOutput) {
      return;
    }

    setLatex((previous) => (previous ? `${previous}\n${helperOutput}` : helperOutput));
  };

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Your answer workspace
      </h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Write your own solution steps and formulas. Saved locally on your device.
      </p>

      <label className="mt-4 block text-sm font-semibold text-slate-800 dark:text-slate-200">
        1) Your written answer
        <textarea
          value={attempt}
          onChange={(event) => setAttempt(event.target.value)}
          placeholder="Write your full reasoning here..."
          className="mt-2 min-h-40 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base leading-relaxed text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>

      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/30">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          2) Formula helper (AI-style)
        </h4>
        <p className="mt-1 text-sm text-blue-900 dark:text-blue-100">
          Type plain math (example: N(mu,sigma^2), P(X&lt;=2), sqrt(n)) and
          convert.
        </p>

        <div className="mt-3 flex flex-col gap-2 md:flex-row">
          <input
            value={helperInput}
            onChange={(event) => setHelperInput(event.target.value)}
            placeholder="Example: X ~ N(mu,sigma^2)"
            className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500 focus:ring dark:border-blue-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={convertWithHelper}
            className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            Convert to LaTeX
          </button>
          <button
            type="button"
            onClick={insertConverted}
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Insert
          </button>
        </div>

        {helperOutput ? (
          <div className="mt-3 rounded-lg border border-blue-200 bg-white p-3 dark:border-blue-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Converted LaTeX
            </p>
            <code className="mt-1 block overflow-x-auto text-sm text-slate-700 dark:text-slate-200">
              {helperOutput}
            </code>
          </div>
        ) : null}
      </div>

      <label className="mt-4 block text-sm font-semibold text-slate-800 dark:text-slate-200">
        3) Formula editor (LaTeX)
        <textarea
          value={latex}
          onChange={(event) => setLatex(event.target.value)}
          placeholder="Write one LaTeX formula per line, e.g.\\nX \\sim \\mathcal{N}(\\mu,\\sigma^2)\\nP(X \\le 2)=\\Phi\\left(\\frac{2-\\mu}{\\sigma}\\right)"
          className="mt-2 min-h-32 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm leading-relaxed text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
        />
      </label>

      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-900/25">
        <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
          Live formula preview
        </h4>
        {previewLines.length === 0 ? (
          <p className="mt-2 text-sm text-emerald-900 dark:text-emerald-100">
            Add LaTeX above to preview your math setup.
          </p>
        ) : (
          <div className="mt-2 space-y-3">
            {previewLines.map((line, idx) => (
              <div
                key={`${line}-${idx}`}
                className="rounded-lg border border-emerald-200 bg-white p-3 dark:border-emerald-800 dark:bg-slate-900"
              >
                <BlockFormula latex={line} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
