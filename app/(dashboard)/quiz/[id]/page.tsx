import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { Clock, HelpCircle, Play, Pencil, Trash2, Users } from "lucide-react";
import { auth } from "@/lib/auth/server";
import { canEditQuiz } from "@/lib/auth/permissions";
import { getQuizById, getQuizLeaderboard, getUserAttemptCount } from "@/lib/db/queries/quiz";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QuizLeaderboard } from "@/components/quiz/quiz-leaderboard";
import { PaginationControls } from "@/components/layout/pagination-controls";
import { DeleteQuizButton } from "./delete-quiz-button";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function QuizDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam ?? "1", 10);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const quiz = await getQuizById(id);

  if (!quiz) {
    notFound();
  }

  const canEdit = canEditQuiz(session?.user, quiz.authorId);
  const userAttemptCount = session?.user ? await getUserAttemptCount(id, session.user.id) : 0;
  const attemptsRemaining = quiz.maxAttempts - userAttemptCount;
  const canPlay = attemptsRemaining > 0;

  const leaderboard = await getQuizLeaderboard(id, page);

  const formatTime = (seconds: number) => {
    if (seconds === 0) return "No time limit";
    if (seconds < 60) return `${seconds} seconds`;
    return `${Math.floor(seconds / 60)} minutes`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="relative">
        {quiz.heroImageUrl && (
          <div className="relative mb-6 aspect-[3/1] w-full overflow-hidden rounded-xl">
            <Image
              src={quiz.heroImageUrl}
              alt={quiz.title}
              fill
              className="object-cover"
              priority
            />
            <div className="from-background/80 absolute inset-0 bg-gradient-to-t to-transparent" />
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-muted-foreground max-w-2xl">{quiz.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                {quiz.questions.length} questions
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(quiz.timeLimitSeconds)}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {quiz.maxAttempts} {quiz.maxAttempts === 1 ? "attempt" : "attempts"}
              </Badge>
              {quiz.randomizeQuestions && <Badge variant="outline">Randomized</Badge>}
            </div>
          </div>

          <div className="flex gap-2">
            {canPlay ? (
              <Button asChild size="lg">
                <Link href={`/quiz/${id}/play`}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Quiz
                </Link>
              </Button>
            ) : (
              <Button disabled size="lg">
                No attempts remaining
              </Button>
            )}

            {canEdit && (
              <>
                <Button asChild variant="outline" size="lg">
                  <Link href={`/quiz/${id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <DeleteQuizButton quizId={id} />
              </>
            )}
          </div>
        </div>

        {session?.user && (
          <p className="text-muted-foreground mt-4 text-sm">
            You have used {userAttemptCount} of {quiz.maxAttempts} attempts
          </p>
        )}
      </div>

      <Separator />

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Top scores for this quiz</CardDescription>
        </CardHeader>
        <CardContent>
          <QuizLeaderboard entries={leaderboard.items} currentUserId={session?.user?.id} />
          <div className="mt-4">
            <PaginationControls
              currentPage={leaderboard.currentPage}
              totalPages={leaderboard.totalPages}
              baseUrl={`/quiz/${id}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
