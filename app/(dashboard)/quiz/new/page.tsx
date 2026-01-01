import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { canCreateQuiz } from "@/lib/rbac";
import { QuizForm } from "@/components/quiz/quiz-form";
import { createQuiz } from "@/app/actions/quiz";

export default async function NewQuizPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!canCreateQuiz(session.user)) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Quiz</h1>
        <p className="text-muted-foreground">Create a new quiz with questions and answers</p>
      </div>

      <QuizForm onSubmit={createQuiz} submitLabel="Create Quiz" />
    </div>
  );
}
