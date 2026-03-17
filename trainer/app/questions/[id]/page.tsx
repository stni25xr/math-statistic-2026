import { notFound } from "next/navigation";
import { QuestionViewClient } from "@/components/question-view-client";
import { getQuestionById, studyQuestions } from "@/lib/study-data";

export function generateStaticParams() {
  return studyQuestions.map((question) => ({ id: question.id }));
}

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = getQuestionById(id);

  if (!question) {
    notFound();
  }

  return <QuestionViewClient question={question} />;
}
