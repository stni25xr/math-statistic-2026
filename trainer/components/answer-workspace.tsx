"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BlockFormula } from "@/components/math-formula";
import { MathText } from "@/components/math-text";
import { normalizeLatex } from "@/lib/math-format";
import { parseQuestionParts } from "@/lib/question-parts";

interface AnswerWorkspaceProps {
  questionId: string;
  questionText: string;
  moduleName: string;
  questionFormulas: string[];
  onValidationChange?: (isValid: boolean) => void;
}

interface PartEntry {
  key: string;
  label: string;
  body: string;
}

interface DraftState {
  givenValues: Record<string, string>;
  substituteByPart: Record<string, string>;
  computeByPart: Record<string, string>;
  answerByPart: Record<string, string>;
  genericGiven: string;
}

const quickTokens: Array<{ label: string; token: string }> = [
  { label: "mu", token: "mu" },
  { label: "sigma", token: "sigma" },
  { label: "lambda", token: "lambda" },
  { label: "Phi", token: "Phi" },
  { label: "P()", token: "P()" },
  { label: "<=", token: " <= " },
  { label: ">=", token: " >= " },
  { label: "sqrt()", token: "sqrt()" },
  { label: "^2", token: "^2" },
  { label: "xbar", token: "x_bar" },
  { label: "phat", token: "p_hat" },
  { label: "H0", token: "H0" },
  { label: "H1", token: "H1" },
];

const parameterTokenRegex =
  /\b(mu0|mu|sigma|lambda|theta|p_hat|p|q|n|m|s|x_bar)\b/gi;

function storageKey(questionId: string): string {
  return `math-stat-2026-fillgap-${questionId}`;
}

function emptyDraft(): DraftState {
  return {
    givenValues: {},
    substituteByPart: {},
    computeByPart: {},
    answerByPart: {},
    genericGiven: "",
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
    return {
      givenValues: parsed.givenValues ?? {},
      substituteByPart: parsed.substituteByPart ?? {},
      computeByPart: parsed.computeByPart ?? {},
      answerByPart: parsed.answerByPart ?? {},
      genericGiven: parsed.genericGiven ?? "",
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

export function AnswerWorkspace({
  questionId,
  questionText,
  moduleName,
  questionFormulas,
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
  const requiredParameters = useMemo(
    () => extractRequiredParameters(questionFormulas),
    [questionFormulas],
  );
  const mainFormula = questionFormulas[0] ?? "Z = (X - mu)/sigma";

  const draft = loadDraft(questionId);
  const [givenValues, setGivenValues] = useState<Record<string, string>>(draft.givenValues);
  const [substituteByPart, setSubstituteByPart] = useState<Record<string, string>>(
    draft.substituteByPart,
  );
  const [computeByPart, setComputeByPart] = useState<Record<string, string>>(
    draft.computeByPart,
  );
  const [answerByPart, setAnswerByPart] = useState<Record<string, string>>(
    draft.answerByPart,
  );
  const [genericGiven, setGenericGiven] = useState(draft.genericGiven);

  const [status, setStatus] = useState<"idle" | "pass" | "fail">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [activeField, setActiveField] = useState<string>("generic-given");

  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>(
    {},
  );

  useEffect(() => {
    const payload: DraftState = {
      givenValues,
      substituteByPart,
      computeByPart,
      answerByPart,
      genericGiven,
    };

    localStorage.setItem(storageKey(questionId), JSON.stringify(payload));
  }, [
    answerByPart,
    computeByPart,
    genericGiven,
    givenValues,
    questionId,
    substituteByPart,
  ]);

  useEffect(() => {
    if (!onValidationChange) {
      return;
    }
    onValidationChange(status === "pass");
  }, [onValidationChange, status]);

  const setFieldRef = (key: string) => {
    return (el: HTMLInputElement | HTMLTextAreaElement | null) => {
      inputRefs.current[key] = el;
    };
  };

  const resetStatus = () => {
    if (status !== "idle") {
      setStatus("idle");
      setStatusMessage("");
    }
  };

  const insertToken = (token: string) => {
    const key = activeField;
    const el = inputRefs.current[key];

    const spliceValue = (
      value: string,
      setter: (next: string) => void,
      fallbackKey: string,
    ) => {
      const target = el ?? inputRefs.current[fallbackKey];
      if (!target) {
        setter(`${value}${token}`);
        return;
      }

      const start = target.selectionStart ?? value.length;
      const end = target.selectionEnd ?? value.length;
      const nextValue = `${value.slice(0, start)}${token}${value.slice(end)}`;
      setter(nextValue);

      const cursor = start + token.length;
      requestAnimationFrame(() => {
        target.focus();
        target.setSelectionRange(cursor, cursor);
      });
    };

    if (key === "generic-given") {
      spliceValue(genericGiven, setGenericGiven, "generic-given");
      resetStatus();
      return;
    }

    if (key.startsWith("given-")) {
      const param = key.replace("given-", "");
      const value = givenValues[param] ?? "";
      spliceValue(
        value,
        (next) => setGivenValues((previous) => ({ ...previous, [param]: next })),
        key,
      );
      resetStatus();
      return;
    }

    if (key.startsWith("substitute-")) {
      const partKey = key.replace("substitute-", "");
      const value = substituteByPart[partKey] ?? "";
      spliceValue(
        value,
        (next) =>
          setSubstituteByPart((previous) => ({
            ...previous,
            [partKey]: next,
          })),
        key,
      );
      resetStatus();
      return;
    }

    if (key.startsWith("compute-")) {
      const partKey = key.replace("compute-", "");
      const value = computeByPart[partKey] ?? "";
      spliceValue(
        value,
        (next) =>
          setComputeByPart((previous) => ({
            ...previous,
            [partKey]: next,
          })),
        key,
      );
      resetStatus();
      return;
    }

    if (key.startsWith("answer-")) {
      const partKey = key.replace("answer-", "");
      const value = answerByPart[partKey] ?? "";
      spliceValue(
        value,
        (next) =>
          setAnswerByPart((previous) => ({
            ...previous,
            [partKey]: next,
          })),
        key,
      );
      resetStatus();
      return;
    }

    spliceValue(genericGiven, setGenericGiven, "generic-given");
    resetStatus();
  };

  const missingGiven =
    requiredParameters.length > 0
      ? requiredParameters.filter((param) => !(givenValues[param] ?? "").trim())
      : genericGiven.trim()
        ? []
        : ["given"];

  const missingSubstitute = partEntries.filter(
    (part) => !(substituteByPart[part.key] ?? "").trim(),
  );
  const missingCompute = partEntries.filter(
    (part) => !(computeByPart[part.key] ?? "").trim(),
  );
  const missingAnswer = partEntries.filter((part) => !(answerByPart[part.key] ?? "").trim());

  const checkFillGaps = () => {
    const issues: string[] = [];

    if (missingGiven.length > 0) {
      if (requiredParameters.length > 0) {
        issues.push(`Fill Given values: ${missingGiven.join(", ")}.`);
      } else {
        issues.push("Fill Given values.");
      }
    }

    if (missingSubstitute.length > 0) {
      issues.push(`Fill Substitute for ${missingSubstitute.map((part) => part.label).join(", ")}.`);
    }

    if (missingCompute.length > 0) {
      issues.push(`Fill Compute for ${missingCompute.map((part) => part.label).join(", ")}.`);
    }

    if (missingAnswer.length > 0) {
      issues.push(`Fill Answer for ${missingAnswer.map((part) => part.label).join(", ")}.`);
    }

    if (issues.length === 0) {
      setStatus("pass");
      setStatusMessage("All gaps are correctly filled. You can continue.");
      return;
    }

    setStatus("fail");
    setStatusMessage(issues.join(" "));
  };

  return (
    <section className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Fill-the-gap trainer
      </h3>
      <p className="mt-1 text-base text-slate-700 dark:text-slate-200">
        {"Given -> Substitute -> Compute -> Answer"}
      </p>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Formula needed ({moduleName})
        </p>
        <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          <BlockFormula latex={normalizeLatex(mainFormula)} />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Given</p>
        {requiredParameters.length > 0 ? (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {requiredParameters.map((param) => {
              const key = `given-${param}`;
              return (
                <label key={param} className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {param}
                  <input
                    ref={setFieldRef(key)}
                    value={givenValues[param] ?? ""}
                    onFocus={() => setActiveField(key)}
                    onChange={(event) => {
                      setGivenValues((previous) => ({
                        ...previous,
                        [param]: event.target.value,
                      }));
                      resetStatus();
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="value"
                  />
                </label>
              );
            })}
          </div>
        ) : (
          <textarea
            ref={setFieldRef("generic-given")}
            value={genericGiven}
            onFocus={() => setActiveField("generic-given")}
            onChange={(event) => {
              setGenericGiven(event.target.value);
              resetStatus();
            }}
            className="mt-2 min-h-20 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            placeholder="Write known values from the question"
          />
        )}
      </div>

      <div className="mt-4 space-y-3">
        {partEntries.map((part) => {
          const substituteKey = `substitute-${part.key}`;
          const computeKey = `compute-${part.key}`;
          const answerKey = `answer-${part.key}`;

          return (
            <section
              key={part.key}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {hasSubparts ? `Sub-question ${part.label}` : "Question"}
              </p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                <MathText text={part.body} />
              </p>

              <div className="mt-3 grid gap-3">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Substitute
                  <textarea
                    ref={setFieldRef(substituteKey)}
                    value={substituteByPart[part.key] ?? ""}
                    onFocus={() => setActiveField(substituteKey)}
                    onChange={(event) => {
                      setSubstituteByPart((previous) => ({
                        ...previous,
                        [part.key]: event.target.value,
                      }));
                      resetStatus();
                    }}
                    className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Put numbers into the formula"
                  />
                </label>

                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Compute
                  <textarea
                    ref={setFieldRef(computeKey)}
                    value={computeByPart[part.key] ?? ""}
                    onFocus={() => setActiveField(computeKey)}
                    onChange={(event) => {
                      setComputeByPart((previous) => ({
                        ...previous,
                        [part.key]: event.target.value,
                      }));
                      resetStatus();
                    }}
                    className="mt-1 min-h-20 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Show the arithmetic/statistical computation"
                  />
                </label>

                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Answer
                  <input
                    ref={setFieldRef(answerKey)}
                    value={answerByPart[part.key] ?? ""}
                    onFocus={() => setActiveField(answerKey)}
                    onChange={(event) => {
                      setAnswerByPart((previous) => ({
                        ...previous,
                        [part.key]: event.target.value,
                      }));
                      resetStatus();
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-base text-slate-900 outline-none ring-blue-500 focus:ring dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    placeholder="Final answer"
                  />
                </label>
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          Quick tokens
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {quickTokens.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => insertToken(item.token)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <section className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-900/25">
        <button
          type="button"
          onClick={checkFillGaps}
          className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
        >
          Check gaps
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
      </section>
    </section>
  );
}
