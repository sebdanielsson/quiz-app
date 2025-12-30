import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { CheckCircle, XCircle, Clock, ArrowLeft, Trophy } from "lucide-react";
import { auth } from "@/lib/auth/server";
import { getAttemptById } from "@/lib/db/queries/quiz";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}

export default async function ResultsPage({ params, searchParams }: PageProps) {
  const { id: quizId } = await params;
  const { attemptId } = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!attemptId) {
    redirect(`/quiz/${quizId}`);
  }

  const attempt = await getAttemptById(attemptId);

  if (!attempt) {
    notFound();
  }

  // Verify the attempt belongs to the current user
  if (attempt.userId !== session.user.id) {
    redirect(`/quiz/${quizId}`);
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const percentage = Math.round((attempt.correctCount / attempt.totalQuestions) * 100);

  const getScoreMessage = (pct: number) => {
    if (pct === 100) return "Perfect score! 🎉";
    if (pct >= 80) return "Excellent work! 🌟";
    if (pct >= 60) return "Good job! 👍";
    if (pct >= 40) return "Keep practicing! 📚";
    return "Better luck next time! 💪";
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/quiz/${quizId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Quiz Results</h1>
          <p className="text-muted-foreground">{attempt.quiz.title}</p>
        </div>
      </div>

      {/* Score Card */}
      <Card>
        <CardContent className="py-6">
          <div className="space-y-4 text-center">
            <div className="bg-primary/10 inline-flex h-24 w-24 items-center justify-center rounded-full">
              <Trophy className="text-primary h-12 w-12" />
            </div>
            <div>
              <p className="text-4xl font-bold">
                {attempt.correctCount} / {attempt.totalQuestions}
              </p>
              <p className="text-muted-foreground text-lg">{percentage}% correct</p>
            </div>
            <p className="text-xl">{getScoreMessage(percentage)}</p>
            <div className="text-muted-foreground flex items-center justify-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatTime(attempt.totalTimeMs)}
              </span>
              {attempt.timedOut && <Badge variant="destructive">Timed out</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Question Review */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Question Review</h2>
        {attempt.answers.map((attemptAnswer, index) => {
          const question = attemptAnswer.question;
          const userAnswer = attemptAnswer.answer;
          const correctAnswer = question.answers.find((a) => a.isCorrect);

          return (
            <Card key={attemptAnswer.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base font-medium">
                    <span className="text-muted-foreground mr-2">Q{index + 1}.</span>
                    {question.text}
                  </CardTitle>
                  {attemptAnswer.isCorrect ? (
                    <CheckCircle className="h-5 w-5 shrink-0 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Your answer:</p>
                  <p
                    className={`text-sm ${
                      attemptAnswer.isCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {userAnswer?.text ?? "No answer (timed out)"}
                  </p>
                </div>
                {!attemptAnswer.isCorrect && correctAnswer && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">Correct answer:</p>
                    <p className="text-sm text-green-600">{correctAnswer.text}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button asChild className="flex-1">
          <Link href={`/quiz/${quizId}`}>Back to Quiz</Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/">Browse More Quizzes</Link>
        </Button>
      </div>
    </div>
  );
}
