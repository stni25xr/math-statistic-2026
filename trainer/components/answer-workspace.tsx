"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { MathText } from "@/components/math-text";
import { parseQuestionParts } from "@/lib/question-parts";

interface AnswerWorkspaceProps {
  questionId: string;
  questionText: string;
  expectedAnswer: string;
  questionType: string;
  formulasNeeded: string[];
  questionTypePool: string[];
  formulaPool: string[];
  onValidationChange?: (isValid: boolean) => void;
}

interface PartEntry {
  key: string;
  label: string;
  body: string;
  expected: string;
  expectedQuestionType: string;
  expectedFormula: string;
}

interface DraftState {
  answersByPart: Record<string, string>;
  selectedQuestionTypeByPart: Record<string, string>;
  selectedFormulaByPart: Record<string, string>;
}

interface TutorMessage {
  role: "user" | "assistant";
  content: string;
}

type SidePanel = "none" | "calculator" | "formulas" | "tables" | "ai";

const calcRows = [
  ["(", ")", "<-", "C", "AC"],
  ["7", "8", "9", "/", "sqrt"],
  ["4", "5", "6", "*", "^2"],
  ["1", "2", "3", "-", "^"],
  ["0", ".", "pi", "+", "="],
  ["ln", "log", "sin", "cos", "tan"],
  ["exp", "Ans", "%", "+/-", "Insert"],
] as const;

const mathSymbols: Array<{ label: string; token: string }> = [
  { label: "μ", token: "μ" },
  { label: "σ", token: "σ" },
  { label: "λ", token: "λ" },
  { label: "Φ", token: "Φ" },
  { label: "θ", token: "θ" },
  { label: "x̄", token: "x̄" },
  { label: "p̂", token: "p̂" },
  { label: "≤", token: " ≤ " },
  { label: "≥", token: " ≥ " },
  { label: "≠", token: " ≠ " },
  { label: "≈", token: " ≈ " },
  { label: "√", token: "√" },
  { label: "∞", token: "∞" },
];

const formulaSheetOverrides: Record<string, string> = {
  "Total success probability per question via total probability":
    "p = P(K) + P(G)P(R|G)",
  "Law of total probability for denominator": "P(B) = Σ P(B|A_k)P(A_k)",
  "Total probability denominator": "P(B) = Σ P(B|A_k)P(A_k)",
  "Total probability in denominator": "P(B) = Σ P(B|A_k)P(A_k)",
  "Bayes rule": "P(A|B) = P(B|A)P(A) / P(B)",
  "Bayes with prevalence":
    "P(D|+) = P(+|D)P(D) / [P(+|D)P(D) + P(+|D^c)P(D^c)]",
  "Two-branch denominator": "P(B) = P(B|A)P(A) + P(B|A^c)P(A^c)",
  "W=A-B is normal": "W = A - B",
  "mu_W=mu_A-mu_B": "μ_W = μ_A - μ_B",
  "var_W=var_A+var_B": "Var(W) = Var(A) + Var(B)",
  "Normal approximation: X approx N(np,np(1-p))": "X ≈ N(np, np(1-p))",
  "CLT/Binomial normal approximation: X approx N(np, np(1-p))":
    "X ≈ N(np, np(1-p))",
  "X ~ Bin(n,p) for count of correct answers": "X ~ Bin(n,p)",
  "P(X <= x) = Phi((x-mu)/sigma)": "P(X ≤ x) = Φ((x-μ)/σ)",
};

function storageKey(questionId: string): string {
  return `math-stat-2026-minimal-${questionId}`;
}

function loadDraft(questionId: string): DraftState {
  if (typeof window === "undefined") {
    return {
      answersByPart: {},
      selectedQuestionTypeByPart: {},
      selectedFormulaByPart: {},
    };
  }

  const raw = localStorage.getItem(storageKey(questionId));
  if (!raw) {
    return {
      answersByPart: {},
      selectedQuestionTypeByPart: {},
      selectedFormulaByPart: {},
    };
  }

  try {
    const parsed = JSON.parse(raw) as DraftState & {
      selectedByPart?: Record<string, string>;
    };
    return {
      answersByPart: parsed.answersByPart ?? {},
      selectedQuestionTypeByPart: parsed.selectedQuestionTypeByPart ?? {},
      selectedFormulaByPart: parsed.selectedFormulaByPart ?? parsed.selectedByPart ?? {},
    };
  } catch {
    return {
      answersByPart: {},
      selectedQuestionTypeByPart: {},
      selectedFormulaByPart: {},
    };
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

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function buildDropdownOptions(
  correct: string,
  pool: string[],
  seed: string,
): string[] {
  const normalized = correct.trim();
  const distractors = Array.from(
    new Set(
      pool
        .map((item) => item.trim())
        .filter((item) => item.length > 0 && item !== normalized),
    ),
  )
    .sort((a, b) => hashSeed(`${seed}-${a}`) - hashSeed(`${seed}-${b}`))
    .slice(0, 2);

  const options = [normalized, ...distractors].filter(
    (value, index, array) => value && array.indexOf(value) === index,
  );

  while (options.length < 3) {
    options.push(options.length === 1 ? "No match" : `Alternative ${options.length}`);
  }

  return options.slice(0, 3);
}

function toFormulaSheetText(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return trimmed;
  }

  const overridden = formulaSheetOverrides[trimmed];
  if (overridden) {
    return overridden;
  }

  return trimmed
    .replace(/\bmu\b/g, "μ")
    .replace(/\bsigma\b/g, "σ")
    .replace(/\blambda\b/g, "λ")
    .replace(/\bPhi\b/g, "Φ")
    .replace(/\btheta\b/g, "θ")
    .replace(/x_bar/g, "x̄")
    .replace(/p_hat/g, "p̂")
    .replace(/\bvar\b/g, "Var")
    .replace(/\bapprox\b/g, "≈")
    .replace(/\+\/-/g, "±")
    .replace(/<=/g, "≤")
    .replace(/>=/g, "≥")
    .replace(/!=/g, "≠")
    .replace(/sqrt\(/g, "√(")
    .replace(/\s+/g, " ")
    .trim();
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
  questionType,
  formulasNeeded,
  questionTypePool,
  formulaPool,
  onValidationChange,
}: AnswerWorkspaceProps) {
  const { t } = useI18n();
  const [basePrefix] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    const path = window.location.pathname;
    if (
      path === "/math-statistic-2026" ||
      path.startsWith("/math-statistic-2026/")
    ) {
      return "/math-statistic-2026";
    }
    return "";
  });

  const parsed = useMemo(() => parseQuestionParts(questionText), [questionText]);
  const normalizedFormulaPool = useMemo(
    () => formulaPool.map((item) => toFormulaSheetText(item)),
    [formulaPool],
  );
  const partEntries = useMemo<PartEntry[]>(() => {
    const formulaByPart = Array.from(
      { length: parsed.parts.length > 0 ? parsed.parts.length : 1 },
      (_, index) => toFormulaSheetText(formulasNeeded[index] ?? formulasNeeded[0] ?? ""),
    );
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
        expectedQuestionType: questionType,
        expectedFormula: formulaByPart[index] ?? "",
      }));
    }

    return [
      {
        key: "single",
        label: "Question",
        body: questionText,
        expected: expectedParts[0] ?? expectedAnswer,
        expectedQuestionType: questionType,
        expectedFormula: formulaByPart[0] ?? "",
      },
    ];
  }, [expectedAnswer, formulasNeeded, parsed.parts, questionText, questionType]);

  const hasSubparts = parsed.parts.length > 0;
  const initial = loadDraft(questionId);

  const [answersByPart, setAnswersByPart] = useState<Record<string, string>>(
    initial.answersByPart,
  );
  const [selectedQuestionTypeByPart, setSelectedQuestionTypeByPart] = useState<
    Record<string, string>
  >(initial.selectedQuestionTypeByPart);
  const [selectedFormulaByPart, setSelectedFormulaByPart] = useState<Record<string, string>>(
    initial.selectedFormulaByPart,
  );
  const [status, setStatus] = useState<"idle" | "pass" | "fail">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const [panel, setPanel] = useState<SidePanel>("none");
  const [activePart, setActivePart] = useState<string>(partEntries[0]?.key ?? "single");

  const [calcInput, setCalcInput] = useState("");
  const [calcResult, setCalcResult] = useState("");
  const [calcError, setCalcError] = useState("");
  const [aiMessages, setAiMessages] = useState<TutorMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const answerRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const aiScrollRef = useRef<HTMLDivElement | null>(null);

  const questionTypeOptionsByPart = useMemo(() => {
    const data: Record<string, string[]> = {};
    partEntries.forEach((part) => {
      data[part.key] = buildDropdownOptions(
        part.expectedQuestionType,
        questionTypePool,
        `${questionId}-${part.key}-type`,
      );
    });
    return data;
  }, [partEntries, questionId, questionTypePool]);

  const formulaOptionsByPart = useMemo(() => {
    const data: Record<string, string[]> = {};
    partEntries.forEach((part) => {
      data[part.key] = buildDropdownOptions(
        part.expectedFormula,
        normalizedFormulaPool,
        `${questionId}-${part.key}-formula`,
      );
    });
    return data;
  }, [normalizedFormulaPool, partEntries, questionId]);

  useEffect(() => {
    localStorage.setItem(
      storageKey(questionId),
      JSON.stringify({
        answersByPart,
        selectedQuestionTypeByPart,
        selectedFormulaByPart,
      } satisfies DraftState),
    );
  }, [answersByPart, questionId, selectedFormulaByPart, selectedQuestionTypeByPart]);

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
    const wrongQuestionType = partEntries.filter(
      (part) =>
        (selectedQuestionTypeByPart[part.key] ?? "") !== part.expectedQuestionType,
    );
    const wrongFormula = partEntries.filter(
      (part) => (selectedFormulaByPart[part.key] ?? "") !== part.expectedFormula,
    );

    const issues: string[] = [];
    if (missingTyped.length > 0) {
      issues.push(
        t("write_answer_for", {
          parts: missingTyped.map((item) => item.label).join(", "),
        }),
      );
    }
    if (wrongQuestionType.length > 0) {
      issues.push(
        t("pick_question_type_for", {
          parts: wrongQuestionType.map((item) => item.label).join(", "),
        }),
      );
    }
    if (wrongFormula.length > 0) {
      issues.push(
        t("pick_formula_for", {
          parts: wrongFormula.map((item) => item.label).join(", "),
        }),
      );
    }

    if (issues.length === 0) {
      setStatus("pass");
      setStatusMessage(t("continue_ok"));
      return;
    }

    setStatus("fail");
    setStatusMessage(issues.join(" "));
  };

  const resetWorkspace = () => {
    setAnswersByPart({});
    setSelectedQuestionTypeByPart({});
    setSelectedFormulaByPart({});
    setStatus("idle");
    setStatusMessage("");
    setCalcInput("");
    setCalcResult("");
    setCalcError("");
    setActivePart(partEntries[0]?.key ?? "single");
  };

  const sendAiMessage = async () => {
    const prompt = aiInput.trim();
    if (!prompt || aiLoading) {
      return;
    }

    const userMessage: TutorMessage = { role: "user", content: prompt };
    const nextMessages = [...aiMessages, userMessage];

    setAiMessages(nextMessages);
    setAiInput("");
    setAiLoading(true);
    setAiError("");

    try {
      const response = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId,
          questionText,
          formulasNeeded,
          questionType,
          conversation: nextMessages.slice(-8),
        }),
      });

      if (!response.ok) {
        throw new Error("AI request failed");
      }

      const data = (await response.json()) as { reply?: string };
      const reply = data.reply?.trim();

      if (!reply) {
        throw new Error("Empty AI reply");
      }

      setAiMessages((previous) => [
        ...previous,
        { role: "assistant", content: reply },
      ]);
    } catch {
      setAiError(t("ai_error"));
      setAiMessages((previous) => [
        ...previous,
        { role: "assistant", content: t("ai_error") },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!aiScrollRef.current) {
      return;
    }
    aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
  }, [aiLoading, aiMessages, panel]);

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
          {t("answer_workspace")}
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPanel("calculator")}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {t("calculator")}
          </button>
          <button
            type="button"
            onClick={() => setPanel("formulas")}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {t("formula_pdf")}
          </button>
          <button
            type="button"
            onClick={() => setPanel("tables")}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {t("table_pdf")}
          </button>
          <button
            type="button"
            onClick={() => setPanel("ai")}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {t("ai_tutor")}
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
              {hasSubparts
                ? t("sub_question", { label: part.label })
                : t("question")}
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              <MathText text={part.body} />
            </p>

            <label className="mt-3 block text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t("your_answer")}
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
                placeholder={t("your_answer")}
                className="mt-1 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>

            <label className="mt-3 block text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t("question_type_dropdown")}
              <select
                value={selectedQuestionTypeByPart[part.key] ?? ""}
                onChange={(event) => {
                  setSelectedQuestionTypeByPart((previous) => ({
                    ...previous,
                    [part.key]: event.target.value,
                  }));
                  resetStatus();
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">{t("choose_question_type")}</option>
                {questionTypeOptionsByPart[part.key].map((option) => (
                  <option key={`${part.key}-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-3 block text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t("formula_dropdown")}
              <select
                value={selectedFormulaByPart[part.key] ?? ""}
                onChange={(event) => {
                  setSelectedFormulaByPart((previous) => ({
                    ...previous,
                    [part.key]: event.target.value,
                  }));
                  resetStatus();
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">{t("choose_formula")}</option>
                {formulaOptionsByPart[part.key].map((option) => (
                  <option key={`${part.key}-formula-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </article>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          {t("math_symbols")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {mathSymbols.map((symbol) => (
            <button
              key={symbol.label}
              type="button"
              onClick={() => insertToActiveAnswer(symbol.token)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              {symbol.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-900/25">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={checkAnswers}
            className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
          >
            {t("check_answer")}
          </button>
          <button
            type="button"
            onClick={resetWorkspace}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {t("reset")}
          </button>
        </div>

        {status === "pass" ? (
          <span className="ml-2 rounded-lg bg-emerald-600 px-2 py-1 text-xs font-semibold text-white">
            {t("correct")}
          </span>
        ) : null}

        {status === "fail" ? (
          <span className="ml-2 rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white">
            {t("not_yet_correct")}
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
          <aside className="fixed inset-y-0 right-0 z-50 w-[70vw] max-w-[980px] min-w-[360px] border-l border-slate-300 bg-white p-4 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {panel === "calculator"
                  ? t("calculator")
                  : panel === "formulas"
                    ? t("formula_pdf")
                    : panel === "tables"
                      ? t("table_pdf")
                      : t("ai_tutor")}
              </p>
              <button
                type="button"
                onClick={() => setPanel("none")}
                className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {t("close")}
              </button>
            </div>

            {panel === "calculator" ? (
              <div className="mt-4">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {t("insert_note")}
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
                src={`${basePrefix}/references/MathStatFormulas.pdf#toolbar=1&navpanes=0&zoom=70`}
                className="mt-3 h-[calc(100vh-7rem)] w-full rounded-lg border border-slate-300 dark:border-slate-700"
              />
            ) : null}

            {panel === "tables" ? (
              <iframe
                title="Table reference PDF"
                src={`${basePrefix}/references/tables.pdf#toolbar=1&navpanes=0&zoom=70`}
                className="mt-3 h-[calc(100vh-7rem)] w-full rounded-lg border border-slate-300 dark:border-slate-700"
              />
            ) : null}

            {panel === "ai" ? (
              <div className="mt-3 flex h-[calc(100vh-7rem)] flex-col">
                <div
                  ref={aiScrollRef}
                  className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
                >
                  {aiMessages.length === 0 ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {t("ask_ai_placeholder")}
                    </p>
                  ) : (
                    aiMessages.map((message, index) => (
                      <div
                        key={`${message.role}-${index}`}
                        className={`rounded-lg px-3 py-2 text-sm ${
                          message.role === "user"
                            ? "ml-8 bg-blue-600 text-white"
                            : "mr-8 bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        }`}
                      >
                        <MathText text={message.content} />
                      </div>
                    ))
                  )}
                  {aiLoading ? (
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {t("thinking")}
                    </p>
                  ) : null}
                </div>

                {aiError ? (
                  <p className="mt-2 text-xs text-rose-700 dark:text-rose-300">{aiError}</p>
                ) : null}

                <div className="mt-2 flex gap-2">
                  <textarea
                    value={aiInput}
                    onChange={(event) => setAiInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void sendAiMessage();
                      }
                    }}
                    placeholder={t("ask_ai_placeholder")}
                    className="min-h-20 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => void sendAiMessage()}
                    disabled={aiLoading || !aiInput.trim()}
                    className={`h-fit rounded-lg px-3 py-2 text-sm font-semibold text-white ${
                      aiLoading || !aiInput.trim()
                        ? "cursor-not-allowed bg-slate-400"
                        : "bg-blue-700 hover:bg-blue-800"
                    }`}
                  >
                    {t("send")}
                  </button>
                </div>
              </div>
            ) : null}
          </aside>
        </>
      ) : null}
    </section>
  );
}
