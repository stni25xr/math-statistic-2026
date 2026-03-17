import { SolutionStep } from "@/lib/types";

interface StepByStepSolutionProps {
  steps: SolutionStep[];
  finalAnswer: string;
}

export function StepByStepSolution({
  steps,
  finalAnswer,
}: StepByStepSolutionProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Full step-by-step solution
      </h3>
      <ol className="mt-4 space-y-4">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"
          >
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {index + 1}. {step.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {step.detail}
            </p>
          </li>
        ))}
      </ol>
      <div className="mt-4 rounded-xl border-2 border-blue-500 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900 dark:border-blue-300 dark:bg-blue-900/30 dark:text-blue-100">
        Boxed final answer: {finalAnswer}
      </div>
    </section>
  );
}
