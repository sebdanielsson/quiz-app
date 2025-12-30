import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { getQuizById, getUserAttemptCount } from "@/lib/db/queries/quiz";
import { QuizPlayer } from "@/components/quiz/quiz-player";
import { submitQuizAttempt } from "@/app/actions/attempt";

interface PageProps {
  params: Promise<{ id: string }>;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default async function PlayQuizPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const quiz = await getQuizById(id);

  if (!quiz) {
    notFound();
  }

  // Check if user can still attempt
  const attemptCount = await getUserAttemptCount(id, session.user.id);
  if (attemptCount >= quiz.maxAttempts) {
    redirect(`/quiz/${id}?error=no-attempts`);
  }

  // Prepare questions with display order
  let questions = quiz.questions.map((q, index) => ({
    id: q.id,
    text: q.text,
    imageUrl: q.imageUrl,
    answers: q.answers.map((a) => ({
      id: a.id,
      text: a.text,
      isCorrect: a.isCorrect,
    })),
    displayOrder: index,
  }));

  // Randomize questions if enabled
  if (quiz.randomizeQuestions) {
    questions = shuffleArray(questions).map((q, index) => ({
      ...q,
      displayOrder: index,
    }));
  }

  // Randomize answers within each question if enabled
  if (quiz.randomizeAnswers) {
    questions = questions.map((q) => ({
      ...q,
      answers: shuffleArray(q.answers),
    }));
  }

  return (
    <QuizPlayer
      quizId={quiz.id}
      quizTitle={quiz.title}
      questions={questions}
      timeLimitSeconds={quiz.timeLimitSeconds}
      onSubmit={submitQuizAttempt}
    />
  );
}
