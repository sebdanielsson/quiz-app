import Link from "next/link";
import { Plus } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { canManageQuizzes } from "@/lib/auth/permissions";
import { getQuizzes } from "@/lib/db/queries/quiz";
import { Button } from "@/components/ui/button";
import { QuizCard } from "@/components/quiz/quiz-card";
import { PaginationControls } from "@/components/layout/pagination-controls";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const canCreate = canManageQuizzes(session?.user);
  const { items: quizzes, totalPages, currentPage } = await getQuizzes(page);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quizzes</h1>
          <p className="text-muted-foreground">
            Test your knowledge with our collection of quizzes
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/quiz/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Quiz
            </Link>
          </Button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-lg">No quizzes available yet.</p>
          {canCreate && (
            <Button asChild className="mt-4">
              <Link href="/quiz/new">Create the first quiz</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>

          <PaginationControls currentPage={currentPage} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
