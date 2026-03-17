import { notFound } from "next/navigation";
import { CategoryPageClient } from "@/components/category-page-client";
import {
  categoryDefinitions,
  categoryOrder,
  getCategoryBySlug,
  getQuestionsForCategory,
} from "@/lib/study-data";

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

  const orderedQuestionSet = getQuestionsForCategory(category.slug).sort(
    (a, b) => {
      const aCategoryIndex = categoryOrder.indexOf(a.category);
      const bCategoryIndex = categoryOrder.indexOf(b.category);
      return aCategoryIndex - bCategoryIndex;
    },
  );

  return <CategoryPageClient category={category} questions={orderedQuestionSet} />;
}
