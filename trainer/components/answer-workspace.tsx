"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MathText } from "@/components/math-text";
import { parseQuestionParts } from "@/lib/question-parts";

interface AnswerWorkspaceProps {
  questionId: string;
  questionText: string;
  expectedAnswer: string;
  onValidationChange?: (isValid: boolean) => void;
}

interface PartEntry {
  key: string;
  label: string;
  body: string;
  expected: string;
}

interface DraftState {
  answersByPart: Record<string, string>;
  selectedByPart: Record<string, string>;
}

type SidePanel = "none" | "calculator" | "formulas" | "tables";

const calcRows = [
  ["(", ")", "<-", "C", "AC"],
  ["7", "8", "9", "/", "sqrt"],
  ["4", "5", "6", "*", "^2"],
  ["1", "2", "3", "-", "^"],
  ["0", ".", "pi", "+", "="],
  ["ln", "log", "sin", "cos", "tan"],
  ["exp", "Ans", "%", "+/-", "Insert"],
] as const;

function storageKey(questionId: string): string {
  return `math-stat-2026-minimal-${questionId}`;
}

function loadDraft(questionId: string): DraftState {
  if (typeof window === "undefined") {
    return { answersByPart: {}, selectedByPart: {} };
  }

  const raw = localStorage.getItem(storageKey(questionId));
  if (!raw) {
    return { answersByPart: {}, selectedByPart: {} };
  }

  try {
    const parsed = JSON.parse(raw) as DraftState;
    return {
      answersByPart: parsed.answersByPart ?? {},
      selectedByPart: parsed.selectedByPart ?? {},
    };
  } catch {
    return { answersByPart: {}, selectedByPart: {} };
  }
}

function splitExpectedAnswer(expected: string, count: number): string[] {
  const pieces = expected
    .split(/;\s*|,\s*(?=[A-Za-zPp]|\d|\()/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (pieces.length >= count) {
    return pieces.slice(0, count);
  }

  return Array.from({ length: count }, () => expected.trim());
}

function buildChoices(correct: string): string[] {
  const normalized = correct.trim();
  const numberMatch = normalized.match(/-?\d+(?:\.\d+)?/);

  let optionB = "0";
  let optionC = "Not enough information";

  if (numberMatch) {
    const n = Number(numberMatch[0]);
    if (Number.isFinite(n)) {
      const up = (n * 1.1).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
      const down = (n * 0.9).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
      optionB = normalized.replace(numberMatch[0], up);
      optionC = normalized.replace(numberMatch[0], down);
    }
  }

  const unique = [normalized, optionB, optionC].filter(
    (value, index, array) => value && array.indexOf(value) === index,
  );

  while (unique.length < 3) {
    unique.push(`Alternative ${unique.length}`);
  }

  return unique.slice(0, 3);
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

  return `${Number(result.toFixed(10))}`;
}

export function AnswerWorkspace({
  questionId,
  questionText,
  expectedAnswer,
  onValidationChange,
}: AnswerWorkspaceProps) {
  const pathname = usePathname();
  const basePrefix = pathname.startsWith("/math-statistic-2026")
    ? "/math-statistic-2026"
    : "";

  const parsed = useMemo(() => parseQuestionParts(questionText), [questionText]);
  const partEntries = useMemo<PartEntry[]>(() => {
    const expectedParts = splitExpectedAnswer(
      expectedAnswer,
      parsed.parts.length > 0 ? parsed.parts.length : 1,
    );

    if (parsed.parts.length > 0) {
      return parsed.parts.map((part, index) => ({
        key: part.key,
        label: part.label,
        body: part.body,
        expected: expectedParts[index] ?? expectedAnswer,
      }));
    }

    return [
      {
        key: "single",
        label: "Question",
        body: questionText,
        expected: expectedParts[0] ?? expectedAnswer,
      },
    ];
  }, [expectedAnswer, parsed.parts, questionText]);

  const hasSubparts = parsed.parts.length > 0;
  const initial = loadDraft(questionId);

  const [answersByPart, setAnswersByPart] = useState<Record<string, string>>(
    initial.answersByPart,
  );
  const [selectedByPart, setSelectedByPart] = useState<Record<string, string>>(
    initial.selectedByPart,
  );
  const [status, setStatus] = useState<"idle" | "pass" | "fail">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const [panel, setPanel] = useState<SidePanel>("none");
  const [activePart, setActivePart] = useState<string>(partEntries[0]?.key ?? "single");

  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");
  const [calcError, setCalcError] = useState("");

  const answerRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});

  const optionsByPart = useMemo(() => {
    const data: Record<string, string[]> = {};
    partEntries.forEach((part) => {
      data[part.key] = buildChoices(part.expected);
    });
    return data;
  }, [partEntries]);

  useEffect(() => {
    localStorage.setItem(
      storageKey(questionId),
      JSON.stringify({ answersByPart, selectedByPart } satisfies DraftState),
    );
  }, [answersByPart, questionId, selectedByPart]);

  useEffect(() => {
    if (!onValidationChange) {
      return;
    }
    onValidationChange(status === "pass");
  }, [onValidationChange, status]);

  const resetStatus = () => {
    if (status !== "idle") {
      setStatus("idle");
      setStatusMessage("");
    }
  };

  const checkAnswers = () => {
    const missingTyped = partEntries.filter(
      (part) => !(answersByPart[part.key] ?? "").trim(),
    );
    const wrongSelect = partEntries.filter(
      (part) => (selectedByPart[part.key] ?? "") !== part.expected,
    );

    const issues: string[] = [];
    if (missingTyped.length > 0) {
      issues.push(`Write answer text for ${missingTyped.map((item) => item.label).join(", ")}.`);
    }
    if (wrongSelect.length > 0) {
      issues.push(`Pick correct dropdown answer for ${wrongSelect.map((item) => item.label).join(", ")}.`);
    }

    if (issues.length === 0) {
      setStatus("pass");
      setStatusMessage("Correct. You can continue.");
      return;
    }

    setStatus("fail");
    setStatusMessage(issues.join(" "));
  };

  const insertToActiveAnswer = (token: string) => {
    const key = activePart;
    const textarea = answerRefs.current[key];
    const current = answersByPart[key] ?? "";

    if (!textarea) {
      setAnswersByPart((previous) => ({ ...previous, [key]: `${current}${token}` }));
      resetStatus();
      return;
    }

    const start = textarea.selectionStart ?? current.length;
    const end = textarea.selectionEnd ?? current.length;
    const nextValue = `${current.slice(0, start)}${token}${current.slice(end)}`;

    setAnswersByPart((previous) => ({ ...previous, [key]: nextValue }));
    resetStatus();

    const cursor = start + token.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursor, cursor);
    });
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

  const handleCalc = (key: string) => {
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

    if (key === "C" || key === "<-") {
      setCalcInput((previous) => previous.slice(0, -1));
      return;
    }

    if (key === "Insert") {
      const value = calcResult || calcInput;
      if (value) {
        insertToActiveAnswer(value);
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

    if (["ln", "log", "sin", "cos", "tan", "exp"].includes(key)) {
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
    <section className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Answer workspace
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPanel("calculator")}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Calculator
          </button>
          <button
            type="button"
            onClick={() => setPanel("formulas")}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Formula PDF
          </button>
          <button
            type="button"
            onClick={() => setPanel("tables")}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Table PDF
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {partEntries.map((part) => (
          <article
            key={part.key}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {hasSubparts ? `Sub-question ${part.label}` : "Question"}
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              <MathText text={part.body} />
            </p>

            <label className="mt-3 block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Your answer
              <textarea
                ref={(el) => {
                  answerRefs.current[part.key] = el;
                }}
                value={answersByPart[part.key] ?? ""}
                onFocus={() => setActivePart(part.key)}
                onChange={(event) => {
                  setAnswersByPart((previous) => ({
                    ...previous,
                    [part.key]: event.target.value,
                  }));
                  resetStatus();
                }}
                placeholder="Write your answer here"
                className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>

            <label className="mt-3 block text-sm font-semibold text-slate-800 dark:text-slate-200">
              Answer dropdown
              <select
                value={selectedByPart[part.key] ?? ""}
                onChange={(event) => {
                  setSelectedByPart((previous) => ({
                    ...previous,
                    [part.key]: event.target.value,
                  }));
                  resetStatus();
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">Choose answer...</option>
                {optionsByPart[part.key].map((option) => (
                  <option key={`${part.key}-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-900/25">
        <button
          type="button"
          onClick={checkAnswers}
          className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Check answer
        </button>

        {status === "pass" ? (
          <span className="ml-2 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
            Correct
          </span>
        ) : null}

        {status === "fail" ? (
          <span className="ml-2 rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white">
            Not yet correct
          </span>
        ) : null}

        {statusMessage ? (
          <p className="mt-2 text-sm text-slate-800 dark:text-slate-100">{statusMessage}</p>
        ) : null}
      </div>

      {panel !== "none" ? (
        <>
          <button
            type="button"
            aria-label="Close side panel"
            onClick={() => setPanel("none")}
            className="fixed inset-0 z-40 bg-slate-900/35"
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-[min(92vw,420px)] border-l border-slate-300 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {panel === "calculator"
                  ? "Calculator"
                  : panel === "formulas"
                    ? "Formula PDF"
                    : "Table PDF"}
              </p>
              <button
                type="button"
                onClick={() => setPanel("none")}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            {panel === "calculator" ? (
              <div className="mt-4">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Insert sends result to the active answer field.
                </p>
                <div className="mt-2 rounded-lg border border-slate-300 bg-lime-100 p-2 font-mono text-xs text-slate-900 dark:border-slate-600 dark:bg-lime-900/40 dark:text-lime-100">
                  <div className="min-h-8 break-all">{calcInput || "0"}</div>
                  <div className="mt-1 border-t border-lime-300 pt-1 text-right text-sm font-semibold dark:border-lime-700">
                    {calcError ? `ERR: ${calcError}` : calcResult || "0"}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-5 gap-1.5">
                  {calcRows.flat().map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleCalc(key)}
                      className={`rounded-md px-2 py-2 text-xs font-semibold ${
                        key === "="
                          ? "bg-blue-700 text-white hover:bg-blue-800"
                          : key === "Insert"
                            ? "bg-emerald-700 text-white hover:bg-emerald-800"
                            : "bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {panel === "formulas" ? (
              <iframe
                title="Formula reference PDF"
                src={`${basePrefix}/references/MathStatFormulas.pdf#toolbar=1&navpanes=0`}
                className="mt-3 h-[calc(100vh-7rem)] w-full rounded-lg border border-slate-300 dark:border-slate-700"
              />
            ) : null}

            {panel === "tables" ? (
              <iframe
                title="Table reference PDF"
                src={`${basePrefix}/references/tables.pdf#toolbar=1&navpanes=0`}
                className="mt-3 h-[calc(100vh-7rem)] w-full rounded-lg border border-slate-300 dark:border-slate-700"
              />
            ) : null}
          </aside>
        </>
      ) : null}
    </section>
  );
}
