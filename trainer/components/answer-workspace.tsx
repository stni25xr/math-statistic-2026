"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BlockFormula } from "@/components/math-formula";
import { MathText } from "@/components/math-text";
import { normalizeLatex } from "@/lib/math-format";
import { CategorySlug } from "@/lib/types";

interface AnswerWorkspaceProps {
  questionId: string;
  moduleName: string;
  moduleFormulas: string[];
  questionFormulas: string[];
  category: CategorySlug;
  onValidationChange?: (isValid: boolean) => void;
}

interface ParameterEntry {
  id: string;
  name: string;
  value: string;
}

interface DraftState {
  attempt: string;
  parameters: ParameterEntry[];
  selectedFormulas: string[];
}

type ReferencePanel = "calculator" | "formulas" | "table";

interface ReferenceTable {
  title: string;
  note: string;
  headers: string[];
  rows: string[][];
}

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

const parameterTokenRegex =
  /\b(mu0|mu|sigma|lambda|theta|p_hat|p|q|n|m|s|x_bar)\b/gi;

function storageKey(questionId: string): string {
  return `math-stat-2026-answer-${questionId}`;
}

function emptyParameters(): ParameterEntry[] {
  return [{ id: crypto.randomUUID(), name: "", value: "" }];
}

function loadDraft(questionId: string): DraftState {
  if (typeof window === "undefined") {
    return { attempt: "", parameters: emptyParameters(), selectedFormulas: [] };
  }

  const raw = localStorage.getItem(storageKey(questionId));
  if (!raw) {
    return { attempt: "", parameters: emptyParameters(), selectedFormulas: [] };
  }

  try {
    const parsed = JSON.parse(raw) as DraftState;
    const parameters =
      parsed.parameters?.length && Array.isArray(parsed.parameters)
        ? parsed.parameters.map((entry) => ({
            id: entry.id || crypto.randomUUID(),
            name: entry.name || "",
            value: entry.value || "",
          }))
        : emptyParameters();

    return {
      attempt: parsed.attempt ?? "",
      parameters,
      selectedFormulas: Array.isArray(parsed.selectedFormulas)
        ? parsed.selectedFormulas
        : [],
    };
  } catch {
    return { attempt: "", parameters: emptyParameters(), selectedFormulas: [] };
  }
}

function normalizeParameterName(input: string): string {
  return input.trim().toLowerCase().replace(/\s+/g, "_");
}

function extractRequiredParameters(questionFormulas: string[]): string[] {
  const found = new Set<string>();
  const joined = questionFormulas.join(" ");

  let match = parameterTokenRegex.exec(joined);
  while (match) {
    found.add(normalizeParameterName(match[1]));
    match = parameterTokenRegex.exec(joined);
  }

  parameterTokenRegex.lastIndex = 0;
  return Array.from(found);
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

function getReferenceTable(category: CategorySlug): ReferenceTable | null {
  if (
    category === "standardization" ||
    category === "central-limit-theorem" ||
    category === "confidence-intervals"
  ) {
    return {
      title: "Standard normal quick table",
      note: "Useful for Z standardization, CLT approximations, and proportion CI.",
      headers: ["z", "0", "0.50", "1.00", "1.28", "1.64", "1.96", "2.33", "2.58"],
      rows: [
        ["Phi(z)", "0.500", "0.691", "0.841", "0.900", "0.950", "0.975", "0.990", "0.995"],
        ["P(Z>z)", "0.500", "0.309", "0.159", "0.100", "0.050", "0.025", "0.010", "0.005"],
      ],
    };
  }

  if (category === "hypothesis-tests") {
    return {
      title: "t critical values (common exam dfs)",
      note: "One-sided alpha=0.05 uses t0.95 row for your df.",
      headers: ["df", "t0.95", "t0.975", "t0.99", "t0.995"],
      rows: [
        ["16", "1.75", "2.12", "2.58", "2.92"],
        ["17", "1.74", "2.11", "2.58", "2.90"],
        ["18", "1.73", "2.10", "2.55", "2.88"],
        ["19", "1.73", "2.09", "2.54", "2.86"],
        ["20", "1.72", "2.09", "2.53", "2.85"],
      ],
    };
  }

  return null;
}

export function AnswerWorkspace({
  questionId,
  moduleName,
  moduleFormulas,
  questionFormulas,
  category,
  onValidationChange,
}: AnswerWorkspaceProps) {
  const initialDraft = loadDraft(questionId);
  const [attempt, setAttempt] = useState(initialDraft.attempt);
  const [parameters, setParameters] = useState<ParameterEntry>(
    initialDraft.parameters as unknown as ParameterEntry,
  );
  const [selectedFormulas, setSelectedFormulas] = useState<string[]>(
    initialDraft.selectedFormulas,
  );

  const [panel, setPanel] = useState<ReferencePanel>("calculator");
  const [formulaMenuOpen, setFormulaMenuOpen] = useState(false);

  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");
  const [calcError, setCalcError] = useState("");

  const [setupStatus, setSetupStatus] = useState<"idle" | "pass" | "fail">("idle");
  const [setupMessage, setSetupMessage] = useState("");

  const answerRef = useRef<HTMLTextAreaElement>(null);

  const requiredParameters = useMemo(
    () => extractRequiredParameters(questionFormulas),
    [questionFormulas],
  );

  const formulaOptions = useMemo(() => {
    const set = new Set<string>([...moduleFormulas, ...questionFormulas]);
    return Array.from(set);
  }, [moduleFormulas, questionFormulas]);

  const table = getReferenceTable(category);

  useEffect(() => {
    const payload: DraftState = {
      attempt,
      parameters: parameters as unknown as ParameterEntry[],
      selectedFormulas,
    };
    localStorage.setItem(storageKey(questionId), JSON.stringify(payload));
  }, [attempt, parameters, questionId, selectedFormulas]);

  useEffect(() => {
    if (!onValidationChange) {
      return;
    }
    onValidationChange(setupStatus === "pass");
  }, [onValidationChange, setupStatus]);

  const resetValidation = () => {
    if (setupStatus !== "idle") {
      setSetupStatus("idle");
      setSetupMessage("");
    }
  };

  const insertAtCursor = (token: string) => {
    const el = answerRef.current;
    if (!el) {
      setAttempt((previous) => `${previous}${token}`);
      resetValidation();
      return;
    }

    const start = el.selectionStart ?? attempt.length;
    const end = el.selectionEnd ?? attempt.length;
    const nextValue = `${attempt.slice(0, start)}${token}${attempt.slice(end)}`;

    setAttempt(nextValue);
    resetValidation();

    const cursor = start + token.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const updateParameter = (id: string, field: "name" | "value", value: string) => {
    setParameters((previous) =>
      (previous as unknown as ParameterEntry[]).map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ) as unknown as ParameterEntry,
    );
    resetValidation();
  };

  const addParameter = () => {
    setParameters((previous) =>
      ([
        ...(previous as unknown as ParameterEntry[]),
        { id: crypto.randomUUID(), name: "", value: "" },
      ] as unknown) as ParameterEntry,
    );
    resetValidation();
  };

  const removeParameter = (id: string) => {
    const entries = (parameters as unknown as ParameterEntry[]).filter(
      (entry) => entry.id !== id,
    );

    setParameters((entries.length ? entries : emptyParameters()) as unknown as ParameterEntry);
    resetValidation();
  };

  const toggleFormula = (formula: string) => {
    setSelectedFormulas((previous) => {
      const exists = previous.includes(formula);
      if (exists) {
        return previous.filter((item) => item !== formula);
      }
      return [...previous, formula];
    });
    resetValidation();
  };

  const checkSetup = () => {
    const filled = (parameters as unknown as ParameterEntry[])
      .filter((entry) => entry.name.trim() && entry.value.trim())
      .map((entry) => normalizeParameterName(entry.name));
    const filledSet = new Set<string>(filled);

    const missingParams = requiredParameters.filter((item) => !filledSet.has(item));
    const hasAtLeastOneParam = filledSet.size > 0;

    const requiredFormulaSet = new Set(questionFormulas);
    const selectedSet = new Set(selectedFormulas);

    const missingFormulas = questionFormulas.filter((formula) => !selectedSet.has(formula));
    const extraFormulas = selectedFormulas.filter(
      (formula) => !requiredFormulaSet.has(formula),
    );

    const parameterOk = hasAtLeastOneParam && missingParams.length === 0;
    const formulaOk =
      missingFormulas.length === 0 &&
      extraFormulas.length === 0 &&
      selectedSet.size === requiredFormulaSet.size;

    if (parameterOk && formulaOk) {
      setSetupStatus("pass");
      setSetupMessage("Correct setup. You can proceed to the next question.");
      return;
    }

    const reasons: string[] = [];

    if (!hasAtLeastOneParam) {
      reasons.push("Add at least one parameter entry.");
    }
    if (missingParams.length > 0) {
      reasons.push(`Missing parameters: ${missingParams.join(", ")}.`);
    }
    if (missingFormulas.length > 0) {
      reasons.push("Missing one or more required formulas.");
    }
    if (extraFormulas.length > 0) {
      reasons.push("You selected extra formulas that are not needed.");
    }

    setSetupStatus("fail");
    setSetupMessage(reasons.join(" "));
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

    if (key === "C" || key === "<-") {
      setCalcInput((previous) => previous.slice(0, -1));
      return;
    }

    if (key === "Insert") {
      const value = calcResult || calcInput;
      if (value) {
        insertAtCursor(value);
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

    if (
      key === "ln" ||
      key === "log" ||
      key === "sin" ||
      key === "cos" ||
      key === "tan" ||
      key === "exp"
    ) {
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
        Learning answer workspace
      </h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Fill parameters + select formulas correctly to unlock next question.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div>
          <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
            Write your answer directly
            <textarea
              ref={answerRef}
              value={attempt}
              onChange={(event) => {
                setAttempt(event.target.value);
                resetValidation();
              }}
              placeholder="Write your full reasoning and calculations here..."
              className="mt-2 min-h-56 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base leading-relaxed text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Quick commands (statistics + math)
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {quickSymbols.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => insertAtCursor(item.token)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/30">
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              Setup checkpoint before next question
            </h4>

            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-900 dark:text-blue-100">
                A) Parameters
              </p>
              {requiredParameters.length > 0 ? (
                <p className="mt-1 text-xs text-blue-900 dark:text-blue-100">
                  Expected: {requiredParameters.join(", ")}
                </p>
              ) : null}

              <div className="mt-2 space-y-2">
                {(parameters as unknown as ParameterEntry[]).map((entry) => (
                  <div key={entry.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                      value={entry.name}
                      onChange={(event) =>
                        updateParameter(entry.id, "name", event.target.value)
                      }
                      placeholder="name (e.g. mu)"
                      className="rounded-lg border border-blue-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none ring-blue-500 focus:ring dark:border-blue-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <input
                      value={entry.value}
                      onChange={(event) =>
                        updateParameter(entry.id, "value", event.target.value)
                      }
                      placeholder="value (e.g. 1)"
                      className="rounded-lg border border-blue-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none ring-blue-500 focus:ring dark:border-blue-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeParameter(entry.id)}
                      className="rounded-lg bg-slate-700 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addParameter}
                className="mt-2 rounded-lg border border-blue-400 px-2.5 py-1 text-xs font-semibold text-blue-900 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-100 dark:hover:bg-blue-900/40"
              >
                Add parameter
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-900 dark:text-blue-100">
                B) Choose correct formulas (multi-select)
              </p>
              <button
                type="button"
                onClick={() => setFormulaMenuOpen((previous) => !previous)}
                className="mt-2 rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-blue-900 dark:border-blue-700 dark:bg-slate-900 dark:text-blue-100"
              >
                {selectedFormulas.length} selected • Open formula dropdown
              </button>

              {formulaMenuOpen ? (
                <div className="mt-2 max-h-56 overflow-auto rounded-lg border border-blue-200 bg-white p-2 dark:border-blue-800 dark:bg-slate-900">
                  {formulaOptions.map((formula) => {
                    const selected = selectedFormulas.includes(formula);
                    return (
                      <label
                        key={formula}
                        className="mb-1 flex cursor-pointer items-start gap-2 rounded-md px-2 py-1 hover:bg-blue-50 dark:hover:bg-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleFormula(formula)}
                          className="mt-1"
                        />
                        <span className="text-sm text-slate-800 dark:text-slate-100">
                          <MathText text={formula} />
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={checkSetup}
                className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Check setup correctness
              </button>

              {setupStatus === "pass" ? (
                <span className="rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                  Correct
                </span>
              ) : null}

              {setupStatus === "fail" ? (
                <span className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white">
                  Not yet correct
                </span>
              ) : null}
            </div>

            {setupMessage ? (
              <p className="mt-2 text-sm text-blue-900 dark:text-blue-100">
                {setupMessage}
              </p>
            ) : null}
          </div>
        </div>

        <aside className="rounded-xl border border-slate-300 bg-slate-100 p-3 dark:border-slate-600 dark:bg-slate-800">
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-200 p-1 dark:bg-slate-700">
            <button
              type="button"
              onClick={() => setPanel("calculator")}
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                panel === "calculator"
                  ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                  : "text-slate-600 dark:text-slate-200"
              }`}
            >
              Calculator
            </button>
            <button
              type="button"
              onClick={() => setPanel("formulas")}
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                panel === "formulas"
                  ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                  : "text-slate-600 dark:text-slate-200"
              }`}
            >
              Formulas
            </button>
            <button
              type="button"
              onClick={() => setPanel("table")}
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                panel === "table"
                  ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100"
                  : "text-slate-600 dark:text-slate-200"
              }`}
            >
              Table
            </button>
          </div>

          {panel === "calculator" ? (
            <div className="mt-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                TI-style calculator
              </p>
              <div className="mt-2 rounded-lg border border-slate-300 bg-lime-100 p-2 font-mono text-xs text-slate-900 dark:border-slate-600 dark:bg-lime-900/40 dark:text-lime-100">
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
            </div>
          ) : null}

          {panel === "formulas" ? (
            <div className="mt-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {moduleName} formulas
              </p>
              <div className="mt-2 space-y-2">
                {moduleFormulas.map((formula) => (
                  <div
                    key={formula}
                    className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <BlockFormula latex={normalizeLatex(formula)} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {panel === "table" ? (
            <div className="mt-3">
              {table ? (
                <>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {table.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {table.note}
                  </p>
                  <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                    <table className="min-w-full border-collapse text-xs">
                      <thead>
                        <tr>
                          {table.headers.map((header) => (
                            <th
                              key={header}
                              className="border-b border-slate-200 px-2 py-1 text-left font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row, rowIndex) => (
                          <tr key={`${row[0]}-${rowIndex}`}>
                            {row.map((cell, cellIndex) => (
                              <td
                                key={`${cell}-${cellIndex}`}
                                className="border-b border-slate-100 px-2 py-1 text-slate-700 dark:border-slate-800 dark:text-slate-200"
                              >
                                <MathText text={cell} />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  No lookup table is needed for this module. Use formulas and
                  direct setup instead.
                </div>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
