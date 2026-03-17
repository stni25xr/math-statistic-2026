import Link from "next/link";
import { CategoryDefinition } from "@/lib/types";

interface CategoryCardProps {
  category: CategoryDefinition;
  questionCount: number;
  completedCount: number;
}

export function CategoryCard({
  category,
  questionCount,
  completedCount,
}: CategoryCardProps) {
  const progressPct = questionCount
    ? Math.round((completedCount / questionCount) * 100)
    : 0;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900/80"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-300">
          {category.title}
        </h3>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {questionCount} Q
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {category.shortDescription}
      </p>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className="h-full rounded-full bg-blue-600 transition-all dark:bg-blue-400"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
