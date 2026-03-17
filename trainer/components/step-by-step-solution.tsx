import { SolutionStep } from "@/lib/types";
import { MathText } from "@/components/math-text";
import { BlockFormula } from "@/components/math-formula";
import { normalizeLatex } from "@/lib/math-format";

interface StepByStepSolutionProps {
  steps: SolutionStep[];
  finalAnswer: string;
}

export function StepByStepSolution({
  steps,
  finalAnswer,
}: StepByStepSolutionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
        Solution (logic-first)
      </h3>
      <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/30">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
          Use this structure
        </p>
        <p className="mt-1 text-sm text-blue-900 dark:text-blue-100">
          Let/define symbols → Given values → Formula needed → Substitute
          numbers → Compute → Final answer.
        </p>
      </div>

      <ol className="mt-4 space-y-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800"
          >
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {index + 1}. {step.title}
            </p>
            <div className="mt-3 text-lg leading-relaxed text-slate-700 dark:text-slate-300">
              <MathText text={step.detail} />
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-4 rounded-xl border-2 border-blue-500 bg-blue-50 px-4 py-3 text-blue-900 dark:border-blue-300 dark:bg-blue-900/30 dark:text-blue-100">
        <p className="text-base font-semibold">Boxed final answer</p>
        <div className="mt-2">
          <BlockFormula latex={normalizeLatex(finalAnswer)} />
        </div>
      </div>
    </section>
  );
}
