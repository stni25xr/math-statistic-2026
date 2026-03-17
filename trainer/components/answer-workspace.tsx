"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BlockFormula } from "@/components/math-formula";
import { MathText } from "@/components/math-text";
import { normalizeLatex } from "@/lib/math-format";
import { parseQuestionParts } from "@/lib/question-parts";
import { CategorySlug } from "@/lib/types";

interface AnswerWorkspaceProps {
  questionId: string;
  questionText: string;
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

interface PartEntry {
  key: string;
  label: string;
  body: string;
}

interface DraftState {
  letDefine: string;
  parameters: ParameterEntry[];
  selectedFormula: string;
  substituteByPart: Record<string, string>;
  computeByPart: Record<string, string>;
  answerByPart: Record<string, string>;
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

const fallbackFormulaDistractors = [
  "P(B) = sum_k P(B|A_k) P(A_k)",
  "Z = (X - mu)/sigma",
  "P(N(t)=k) = exp(-lambda t) * (lambda t)^k / k!",
  "p_hat +/- z * sqrt(p_hat(1-p_hat)/n)",
  "T = (X_bar - mu0)/(s/sqrt(n))",
];

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Math.random().toString(36).slice(2, 10)}`;
}

function storageKey(questionId: string): string {
  return `math-stat-2026-answer-${questionId}`;
}

function emptyParameters(): ParameterEntry[] {
  return [{ id: createId(), name: "", value: "" }];
}

function emptyDraft(): DraftState {
  return {
    letDefine: "",
    parameters: emptyParameters(),
    selectedFormula: "",
    substituteByPart: {},
    computeByPart: {},
    answerByPart: {},
  };
}

function loadDraft(questionId: string): DraftState {
  if (typeof window === "undefined") {
    return emptyDraft();
  }

  const raw = localStorage.getItem(storageKey(questionId));
  if (!raw) {
    return emptyDraft();
  }

  try {
    const parsed = JSON.parse(raw) as DraftState;
    const parameters =
      parsed.parameters?.length && Array.isArray(parsed.parameters)
        ? parsed.parameters.map((entry) => ({
            id: entry.id || createId(),
            name: entry.name || "",
            value: entry.value || "",
          }))
        : emptyParameters();

    return {
      letDefine: parsed.letDefine ?? "",
      parameters,
      selectedFormula: parsed.selectedFormula ?? "",
      substituteByPart: parsed.substituteByPart ?? {},
      computeByPart: parsed.computeByPart ?? {},
      answerByPart: parsed.answerByPart ?? {},
    };
  } catch {
    return emptyDraft();
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

function buildFormulaChoices(
  moduleFormulas: string[],
  questionFormulas: string[],
): { choices: string[]; correct: string } {
  const correct = questionFormulas[0] ?? moduleFormulas[0] ?? "Z = (X - mu)/sigma";

  const distractorPool = [
    ...moduleFormulas.filter((formula) => formula !== correct && !questionFormulas.includes(formula)),
    ...questionFormulas.filter((formula) => formula !== correct),
    ...fallbackFormulaDistractors.filter((formula) => formula !== correct),
  ];

  const uniqueDistractors: string[] = [];
  for (const item of distractorPool) {
    if (!uniqueDistractors.includes(item)) {
      uniqueDistractors.push(item);
    }
    if (uniqueDistractors.length === 2) {
      break;
    }
  }

  while (uniqueDistractors.length < 2) {
    uniqueDistractors.push(`Alternative formula ${uniqueDistractors.length + 1}`);
  }

  return {
    choices: [correct, ...uniqueDistractors],
    correct,
  };
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
  questionText,
  moduleName,
  moduleFormulas,
  questionFormulas,
  category,
  onValidationChange,
}: AnswerWorkspaceProps) {
  const parsedQuestion = useMemo(() => parseQuestionParts(questionText), [questionText]);

  const partEntries = useMemo<PartEntry[]>(() => {
    if (parsedQuestion.parts.length > 0) {
      return parsedQuestion.parts.map((part) => ({
        key: part.key,
        label: part.label,
        body: part.body,
      }));
    }

    return [
      {
        key: "single",
        label: "Question",
        body: questionText,
      },
    ];
  }, [parsedQuestion.parts, questionText]);

  const hasSubparts = parsedQuestion.parts.length > 0;

  const draft = loadDraft(questionId);
  const [letDefine, setLetDefine] = useState(draft.letDefine);
  const [parameters, setParameters] = useState<ParameterEntry[]>(draft.parameters);
  const [selectedFormula, setSelectedFormula] = useState(draft.selectedFormula);
  const [substituteByPart, setSubstituteByPart] = useState<Record<string, string>>(
    draft.substituteByPart,
  );
  const [computeByPart, setComputeByPart] = useState<Record<string, string>>(
    draft.computeByPart,
  );
  const [answerByPart, setAnswerByPart] = useState<Record<string, string>>(
    draft.answerByPart,
  );

  const [panel, setPanel] = useState<ReferencePanel>("calculator");
  const [formulaMenuOpen, setFormulaMenuOpen] = useState(false);
  const [activeFieldKey, setActiveFieldKey] = useState<string>("let");

  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");
  const [calcError, setCalcError] = useState("");

  const [setupStatus, setSetupStatus] = useState<"idle" | "pass" | "fail">("idle");
  const [setupMessage, setSetupMessage] = useState("");

  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>(
    {},
  );

  const requiredParameters = useMemo(
    () => extractRequiredParameters(questionFormulas),
    [questionFormulas],
  );

  const { choices: formulaChoices, correct: correctFormula } = useMemo(
    () => buildFormulaChoices(moduleFormulas, questionFormulas),
    [moduleFormulas, questionFormulas],
  );

  const table = getReferenceTable(category);

  const filledParameters = parameters
    .filter((entry) => entry.name.trim() && entry.value.trim())
    .map((entry) => normalizeParameterName(entry.name));
  const filledSet = new Set<string>(filledParameters);
  const missingParams = requiredParameters.filter((item) => !filledSet.has(item));
  const hasParam = filledSet.size > 0;

  const missingSubstitute = partEntries.filter(
    (part) => (substituteByPart[part.key] ?? "").trim().length < 6,
  );
  const missingCompute = partEntries.filter(
    (part) => (computeByPart[part.key] ?? "").trim().length < 4,
  );
  const missingAnswer = partEntries.filter(
    (part) => (answerByPart[part.key] ?? "").trim().length === 0,
  );

  const step1Ok = letDefine.trim().length > 0;
  const step2Ok = step1Ok && hasParam && missingParams.length === 0;
  const step3Ok = step2Ok && selectedFormula === correctFormula;
  const step4Ok = step3Ok && missingSubstitute.length === 0;
  const step5Ok = step4Ok && missingCompute.length === 0;
  const step6Ok = step5Ok && missingAnswer.length === 0;

  useEffect(() => {
    const payload: DraftState = {
      letDefine,
      parameters,
      selectedFormula,
      substituteByPart,
      computeByPart,
      answerByPart,
    };
    localStorage.setItem(storageKey(questionId), JSON.stringify(payload));
  }, [
    answerByPart,
    computeByPart,
    letDefine,
    parameters,
    questionId,
    selectedFormula,
    substituteByPart,
  ]);

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

  const registerInputRef = (key: string) => {
    return (el: HTMLInputElement | HTMLTextAreaElement | null) => {
      inputRefs.current[key] = el;
    };
  };

  const insertWithCursor = (
    currentValue: string,
    setter: (value: string) => void,
    inputKey: string,
    token: string,
  ) => {
    const el = inputRefs.current[inputKey];
    if (!el) {
      setter(`${currentValue}${token}`);
      return;
    }

    const start = el.selectionStart ?? currentValue.length;
    const end = el.selectionEnd ?? currentValue.length;
    const nextValue = `${currentValue.slice(0, start)}${token}${currentValue.slice(end)}`;

    setter(nextValue);

    const cursor = start + token.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  };

  const insertAtCursor = (token: string) => {
    const key = activeFieldKey;

    if (key === "let") {
      insertWithCursor(letDefine, setLetDefine, key, token);
      resetValidation();
      return;
    }

    if (key.startsWith("substitute-")) {
      const partKey = key.replace("substitute-", "");
      const current = substituteByPart[partKey] ?? "";
      insertWithCursor(
        current,
        (value) => setSubstituteByPart((previous) => ({ ...previous, [partKey]: value })),
        key,
        token,
      );
      resetValidation();
      return;
    }

    if (key.startsWith("compute-")) {
      const partKey = key.replace("compute-", "");
      const current = computeByPart[partKey] ?? "";
      insertWithCursor(
        current,
        (value) => setComputeByPart((previous) => ({ ...previous, [partKey]: value })),
        key,
        token,
      );
      resetValidation();
      return;
    }

    if (key.startsWith("answer-")) {
      const partKey = key.replace("answer-", "");
      const current = answerByPart[partKey] ?? "";
      insertWithCursor(
        current,
        (value) => setAnswerByPart((previous) => ({ ...previous, [partKey]: value })),
        key,
        token,
      );
      resetValidation();
      return;
    }

    insertWithCursor(letDefine, setLetDefine, "let", token);
    resetValidation();
  };

  const updateParameter = (id: string, field: "name" | "value", value: string) => {
    setParameters((previous) =>
      previous.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    );
    resetValidation();
  };

  const addParameter = () => {
    setParameters((previous) => [...previous, { id: createId(), name: "", value: "" }]);
    resetValidation();
  };

  const removeParameter = (id: string) => {
    const entries = parameters.filter((entry) => entry.id !== id);
    setParameters(entries.length ? entries : emptyParameters());
    resetValidation();
  };

  const checkLearningSteps = () => {
    if (step1Ok && step2Ok && step3Ok && step4Ok && step5Ok && step6Ok) {
      setSetupStatus("pass");
      setSetupMessage("All steps are correct. You can proceed to the next question.");
      return;
    }

    const reasons: string[] = [];
    if (!step1Ok) {
      reasons.push("Let/define symbols: fill this section.");
    }
    if (!step2Ok) {
      if (!hasParam) {
        reasons.push("Given: add at least one parameter.");
      }
      if (missingParams.length > 0) {
        reasons.push(`Given: missing parameters ${missingParams.join(", ")}.`);
      }
    }
    if (!step3Ok) {
      reasons.push("Formula: choose the correct formula from the 3 options.");
    }
    if (!step4Ok) {
      reasons.push(
        `Substitute: complete ${missingSubstitute.map((item) => item.label).join(", ")}.`,
      );
    }
    if (!step5Ok) {
      reasons.push(
        `Compute: complete ${missingCompute.map((item) => item.label).join(", ")}.`,
      );
    }
    if (!step6Ok) {
      reasons.push(`Answer: complete ${missingAnswer.map((item) => item.label).join(", ")}.`);
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
      <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Learning flow
      </h3>
      <p className="mt-1 text-base text-slate-700 dark:text-slate-200">
        {"Let/define symbols -> Given -> Formula -> Substitute -> Compute -> Answer"}
      </p>
      {hasSubparts ? (
        <p className="mt-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
          Answer each sub-question separately.
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
        {[step1Ok, step2Ok, step3Ok, step4Ok, step5Ok, step6Ok].map((ok, idx) => (
          <span
            key={`step-${idx + 1}`}
            className={`rounded-full px-2.5 py-1 ${
              ok
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100"
            }`}
          >
            Step {idx + 1} {ok ? "done" : "pending"}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/30">
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              1) Let/define symbols
            </h4>
            <textarea
              ref={registerInputRef("let")}
              value={letDefine}
              onFocus={() => setActiveFieldKey("let")}
              onChange={(event) => {
                setLetDefine(event.target.value);
                resetValidation();
              }}
              placeholder="Example: Let D = has disease, D^c = healthy, + = positive test"
              className="mt-2 min-h-24 w-full rounded-xl border border-blue-300 bg-white px-4 py-3 text-base leading-relaxed text-slate-900 outline-none ring-blue-500 focus:ring dark:border-blue-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </section>

          <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/30">
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              2) Given
            </h4>
            {!step1Ok ? (
              <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                Complete step 1 first.
              </p>
            ) : null}
            {requiredParameters.length > 0 ? (
              <p className="mt-1 text-xs text-blue-900 dark:text-blue-100">
                Expected: {requiredParameters.join(", ")}
              </p>
            ) : null}

            <div className="mt-2 space-y-2">
              {parameters.map((entry) => (
                <div key={entry.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    value={entry.name}
                    disabled={!step1Ok}
                    onChange={(event) =>
                      updateParameter(entry.id, "name", event.target.value)
                    }
                    placeholder="name (e.g. p)"
                    className="rounded-lg border border-blue-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none ring-blue-500 focus:ring dark:border-blue-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <input
                    value={entry.value}
                    disabled={!step1Ok}
                    onChange={(event) =>
                      updateParameter(entry.id, "value", event.target.value)
                    }
                    placeholder="value (e.g. 0.05)"
                    className="rounded-lg border border-blue-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none ring-blue-500 focus:ring dark:border-blue-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    disabled={!step1Ok}
                    onClick={() => removeParameter(entry.id)}
                    className={`rounded-lg px-2 py-1 text-xs font-semibold text-white ${
                      step1Ok
                        ? "bg-slate-700 hover:bg-slate-800"
                        : "cursor-not-allowed bg-slate-400"
                    }`}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              disabled={!step1Ok}
              onClick={addParameter}
              className={`mt-2 rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                step1Ok
                  ? "border-blue-400 text-blue-900 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-100 dark:hover:bg-blue-900/40"
                  : "cursor-not-allowed border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              Add parameter
            </button>
          </section>

          <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/30">
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              3) Formula
            </h4>
            {!step2Ok ? (
              <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                Complete step 2 first.
              </p>
            ) : null}
            <button
              type="button"
              disabled={!step2Ok}
              onClick={() => setFormulaMenuOpen((previous) => !previous)}
              className={`mt-2 rounded-lg border px-3 py-2 text-sm font-semibold ${
                step2Ok
                  ? "border-blue-300 bg-white text-blue-900 dark:border-blue-700 dark:bg-slate-900 dark:text-blue-100"
                  : "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {selectedFormula ? "1 selected" : "0 selected"} • Open formula dropdown (3 options)
            </button>
            {formulaMenuOpen ? (
              <div className="mt-2 rounded-lg border border-blue-200 bg-white p-2 dark:border-blue-800 dark:bg-slate-900">
                {formulaChoices.map((formula, index) => (
                  <label
                    key={`${formula}-${index}`}
                    className="mb-1 flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 hover:bg-blue-50 dark:hover:bg-slate-800"
                  >
                    <input
                      type="radio"
                      name={`formula-choice-${questionId}`}
                      checked={selectedFormula === formula}
                      onChange={() => {
                        setSelectedFormula(formula);
                        resetValidation();
                      }}
                    />
                    <div className="text-sm text-slate-800 dark:text-slate-100">
                      <MathText text={formula} />
                    </div>
                  </label>
                ))}
              </div>
            ) : null}
          </section>

          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              4) Substitute • 5) Compute • 6) Answer
            </h4>
            {!step3Ok ? (
              <p className="mt-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                Complete step 3 first.
              </p>
            ) : null}

            <div className="mt-2 space-y-3">
              {partEntries.map((part) => {
                const substituteKey = `substitute-${part.key}`;
                const computeKey = `compute-${part.key}`;
                const answerKey = `answer-${part.key}`;

                return (
                  <div
                    key={part.key}
                    className="rounded-lg border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {hasSubparts ? `Sub-question ${part.label}` : "Question"}
                    </p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                      <MathText text={part.body} />
                    </p>

                    <label className="mt-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Substitute
                    </label>
                    <textarea
                      ref={registerInputRef(substituteKey)}
                      value={substituteByPart[part.key] ?? ""}
                      disabled={!step3Ok}
                      onFocus={() => setActiveFieldKey(substituteKey)}
                      onChange={(event) => {
                        setSubstituteByPart((previous) => ({
                          ...previous,
                          [part.key]: event.target.value,
                        }));
                        resetValidation();
                      }}
                      placeholder="Substitute numbers into the selected formula"
                      className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />

                    <label className="mt-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Compute
                    </label>
                    <textarea
                      ref={registerInputRef(computeKey)}
                      value={computeByPart[part.key] ?? ""}
                      disabled={!step4Ok}
                      onFocus={() => setActiveFieldKey(computeKey)}
                      onChange={(event) => {
                        setComputeByPart((previous) => ({
                          ...previous,
                          [part.key]: event.target.value,
                        }));
                        resetValidation();
                      }}
                      placeholder="Show your arithmetic/statistical computation"
                      className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />

                    <label className="mt-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Answer
                    </label>
                    <input
                      ref={registerInputRef(answerKey)}
                      value={answerByPart[part.key] ?? ""}
                      disabled={!step5Ok}
                      onFocus={() => setActiveFieldKey(answerKey)}
                      onChange={(event) => {
                        setAnswerByPart((previous) => ({
                          ...previous,
                          [part.key]: event.target.value,
                        }));
                        resetValidation();
                      }}
                      placeholder="Final result"
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Quick commands
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {quickSymbols.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    disabled={!step3Ok}
                    onClick={() => insertAtCursor(item.token)}
                    className={`rounded-lg border bg-white px-2.5 py-1 text-xs font-semibold ${
                      step3Ok
                        ? "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
                        : "cursor-not-allowed border-slate-300 text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-900/25">
            <button
              type="button"
              onClick={checkLearningSteps}
              className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              Check all learning steps
            </button>

            {setupStatus === "pass" ? (
              <span className="ml-2 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
                Correct
              </span>
            ) : null}

            {setupStatus === "fail" ? (
              <span className="ml-2 rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white">
                Not yet correct
              </span>
            ) : null}

            {setupMessage ? (
              <p className="mt-2 text-sm text-slate-800 dark:text-slate-100">
                {setupMessage}
              </p>
            ) : null}
          </section>
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
                  No lookup table is needed for this module. Use formulas and direct setup instead.
                </div>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
