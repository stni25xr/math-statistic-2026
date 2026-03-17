import { notFound } from "next/navigation";
import { CategoryPageClient } from "@/components/category-page-client";
import {
  categoryDefinitions,
  getCategoryBySlug,
  getQuestionsForCategory,
} from "@/lib/study-data";
import { sortQuestionsByExamOrder } from "@/lib/question-order";

export function generateStaticParams() {
  return categoryDefinitions.map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const orderedQuestionSet = sortQuestionsByExamOrder(
    getQuestionsForCategory(category.slug),
  );

  return <CategoryPageClient category={category} questions={orderedQuestionSet} />;
}
