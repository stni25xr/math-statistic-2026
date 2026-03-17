"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BlockFormula } from "@/components/math-formula";
import { plainToLatex } from "@/lib/math-format";

interface AnswerWorkspaceProps {
  questionId: string;
}

interface DraftState {
  attempt: string;
  latex: string;
}

type ActiveTarget = "attempt" | "latex";

const quickSymbols: Array<{ label: string; token: string }> = [
  { label: "mu", token: "mu" },
  { label: "sigma", token: "sigma" },
  { label: "lambda", token: "lambda" },
  { label: "Phi", token: "Phi" },
  { label: "P()", token: "P()" },
  { label: "<=", token: " <= " },
  { label: ">=", token: " >= " },
  { label: "!=", token: " != " },
  { label: "+/-", token: " +/- " },
  { label: "sqrt()", token: "sqrt()" },
  { label: "^2", token: "^2" },
  { label: "^3", token: "^3" },
  { label: "sum", token: "sum" },
  { label: "xbar", token: "x_bar" },
  { label: "phat", token: "p_hat" },
  { label: "H0", token: "H0" },
  { label: "H1", token: "H1" },
  { label: "alpha", token: "alpha" },
  { label: "beta", token: "beta" },
  { label: "N(mu,sigma^2)", token: "N(mu,sigma^2)" },
  { label: "CI", token: "CI" },
];

const calculatorRows = [
  ["(", ")", "<-", "C", "AC"],
  ["7", "8", "9", "/", "sqrt"],
  ["4", "5", "6", "*", "^2"],
  ["1", "2", "3", "-", "^"],
  ["0", ".", "pi", "+", "="],
  ["ln", "log", "sin", "cos", "tan"],
  ["exp", "Ans", "%", "+/-", "Insert"],
] as const;

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

function evaluateExpression(expression: string, ansValue: string): string {
  const raw = expression.trim();
  if (!raw) {
    return "";
  }

  if (/[^0-9A-Za-z+\-*/().,\s%^]/.test(raw)) {
    throw new Error("Unsupported character");
  }

  let normalized = raw;
  normalized = normalized.replace(/Ans/g, ansValue || "0");
  normalized = normalized.replace(/pi/gi, "Math.PI");
  normalized = normalized.replace(/sqrt\(/g, "Math.sqrt(");
  normalized = normalized.replace(/ln\(/g, "Math.log(");
  normalized = normalized.replace(/log\(/g, "Math.log10(");
  normalized = normalized.replace(/sin\(/g, "Math.sin(");
  normalized = normalized.replace(/cos\(/g, "Math.cos(");
  normalized = normalized.replace(/tan\(/g, "Math.tan(");
  normalized = normalized.replace(/exp\(/g, "Math.exp(");
  normalized = normalized.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
  normalized = normalized.replace(/\^/g, "**");

  const scrubbed = normalized.replace(
    /Math\.(PI|sqrt|log|log10|sin|cos|tan|exp)/g,
    "",
  );

  if (/[A-Za-z_]/.test(scrubbed)) {
    throw new Error("Unsupported function");
  }

  const result = Function(`"use strict"; return (${normalized});`)() as number;

  if (!Number.isFinite(result)) {
    throw new Error("Invalid result");
  }

  const rounded = Number(result.toFixed(10));
  return `${rounded}`;
}

export function AnswerWorkspace({ questionId }: AnswerWorkspaceProps) {
  const [attempt, setAttempt] = useState(() => loadDraft(questionId).attempt);
  const [latex, setLatex] = useState(() => loadDraft(questionId).latex);
  const [helperInput, setHelperInput] = useState("");
  const [helperOutput, setHelperOutput] = useState("");
  const [activeTarget, setActiveTarget] = useState<ActiveTarget>("attempt");

  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");
  const [calcError, setCalcError] = useState("");

  const answerRef = useRef<HTMLTextAreaElement>(null);
  const latexRef = useRef<HTMLTextAreaElement>(null);

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

  const insertAtCursor = (
    target: ActiveTarget,
    token: string,
    fallbackToEnd = true,
  ) => {
    const ref = target === "attempt" ? answerRef : latexRef;
    const current = target === "attempt" ? attempt : latex;
    const setter = target === "attempt" ? setAttempt : setLatex;

    const el = ref.current;
    if (!el) {
      setter((previous) => `${previous}${token}`);
      return;
    }

    const start = fallbackToEnd ? (el.selectionStart ?? current.length) : 0;
    const end = fallbackToEnd ? (el.selectionEnd ?? current.length) : 0;

    const nextValue = `${current.slice(0, start)}${token}${current.slice(end)}`;
    setter(nextValue);

    const cursor = start + token.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const insertIntoActive = (token: string) => {
    insertAtCursor(activeTarget, token);
  };

  const insertConverted = () => {
    if (!helperOutput) {
      return;
    }

    insertAtCursor("latex", helperOutput + "\n");
  };

  const runCalculator = () => {
    try {
      const value = evaluateExpression(calcInput, calcResult);
      setCalcResult(value);
      setCalcError("");
    } catch {
      setCalcError("Invalid expression");
    }
  };

  const handleCalcButton = (key: string) => {
    if (key === "=") {
      runCalculator();
      return;
    }

    if (key === "AC") {
      setCalcInput("");
      setCalcResult("");
      setCalcError("");
      return;
    }

    if (key === "C") {
      setCalcInput((previous) => previous.slice(0, -1));
      return;
    }

    if (key === "<-") {
      setCalcInput((previous) => previous.slice(0, -1));
      return;
    }

    if (key === "Insert") {
      const value = calcResult || calcInput;
      if (value) {
        insertIntoActive(value);
      }
      return;
    }

    if (key === "Ans") {
      setCalcInput((previous) => `${previous}${calcResult || "0"}`);
      return;
    }

    if (key === "sqrt") {
      setCalcInput((previous) => `${previous}sqrt(`);
      return;
    }

    if (key === "ln" || key === "log" || key === "sin" || key === "cos" || key === "tan" || key === "exp") {
      setCalcInput((previous) => `${previous}${key}(`);
      return;
    }

    if (key === "^2") {
      setCalcInput((previous) => `${previous}^2`);
      return;
    }

    if (key === "^") {
      setCalcInput((previous) => `${previous}^`);
      return;
    }

    if (key === "+/-") {
      setCalcInput((previous) => `${previous}-(`);
      return;
    }

    setCalcInput((previous) => `${previous}${key}`);
  };

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        Your answer workspace
      </h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Write your own steps and formulas. Use quick symbols and the side calculator.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            1) Your written answer
            <textarea
              ref={answerRef}
              value={attempt}
              onFocus={() => setActiveTarget("attempt")}
              onChange={(event) => setAttempt(event.target.value)}
              placeholder="Write your full reasoning here..."
              className="mt-2 min-h-44 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base leading-relaxed text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Quick commands for statistics math (insert at cursor)
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {quickSymbols.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => insertIntoActive(item.token)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Active field: {activeTarget === "attempt" ? "Written answer" : "LaTeX editor"}
            </p>
          </div>
        </div>

        <aside className="rounded-xl border border-slate-300 bg-slate-100 p-3 dark:border-slate-600 dark:bg-slate-800">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            TI-style calculator
          </p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Use for quick numeric checks. Press Insert to paste into your answer.
          </p>

          <div className="mt-3 rounded-lg border border-slate-300 bg-lime-100 p-2 font-mono text-xs text-slate-900 dark:border-slate-600 dark:bg-lime-900/40 dark:text-lime-100">
            <div className="min-h-8 break-all">{calcInput || "0"}</div>
            <div className="mt-1 border-t border-lime-300 pt-1 text-right text-sm font-semibold dark:border-lime-700">
              {calcError ? `ERR: ${calcError}` : calcResult || "0"}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {calculatorRows.flat().map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCalcButton(key)}
                className={`rounded-md px-2 py-2 text-xs font-semibold transition ${
                  key === "="
                    ? "bg-blue-700 text-white hover:bg-blue-800"
                    : key === "Insert"
                      ? "bg-emerald-700 text-white hover:bg-emerald-800"
                      : "bg-white text-slate-800 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </aside>
      </div>

      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/30">
        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          2) Formula helper (AI-style)
        </h4>
        <p className="mt-1 text-sm text-blue-900 dark:text-blue-100">
          Type plain math (example: N(mu,sigma^2), P(X&lt;=2), sqrt(n)) and convert.
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
          ref={latexRef}
          value={latex}
          onFocus={() => setActiveTarget("latex")}
          onChange={(event) => setLatex(event.target.value)}
          placeholder="Write one LaTeX formula per line, e.g.\nX \\sim \\mathcal{N}(\\mu,\\sigma^2)\nP(X \\le 2)=\\Phi\\left(\\frac{2-\\mu}{\\sigma}\\right)"
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
