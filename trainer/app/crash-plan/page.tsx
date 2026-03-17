import Link from "next/link";
import { DailyPlanCard } from "@/components/daily-plan-card";
import { categoryDefinitions, threeDayCrashPlan } from "@/lib/study-data";

const priorityOrder = [
  "standardization",
  "poisson-process",
  "bayes-total-probability",
  "combinatorics",
  "confidence-intervals",
  "hypothesis-tests",
  "central-limit-theorem",
  "maximum-likelihood-estimation",
] as const;

export default function CrashPlanPage() {
  const prioritizedCategories = priorityOrder
    .map((slug) => categoryDefinitions.find((category) => category.slug === slug))
    .filter(Boolean);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
          3-day crash plan
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Fast route to a 30-point exam result
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-700 dark:text-slate-300">
          This plan is optimized for high-yield methods seen repeatedly in your
          uploaded exams. Do not study by year. Study by method and pattern.
        </p>

        <section className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/30">
          <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            Priority order
          </h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-blue-900 dark:text-blue-100">
            {prioritizedCategories.map((category) => (
              <li key={category?.slug}>
                {category?.title}
                <span className="ml-2 text-blue-700 dark:text-blue-200">
                  ({category?.shortDescription})
                </span>
              </li>
            ))}
          </ol>
        </section>
      </header>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {threeDayCrashPlan.map((day) => (
          <DailyPlanCard key={day.day} day={day} />
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Last 24 hours checklist
        </h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
          <li>Do one timed mixed session in Practice Mode.</li>
          <li>Review every question marked &quot;Need review&quot;.</li>
          <li>Memorize z vs t decision rule and Bayes denominator structure.</li>
          <li>Sleep and keep formula sheet symbols clear: mu, sigma, p, lambda, Phi, CI, H0, H1.</li>
        </ul>
        <Link
          href="/practice"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Start timed practice
        </Link>
      </section>
    </main>
  );
}
