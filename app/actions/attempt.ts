"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { quiz, quizAttempt, attemptAnswer, answer } from "@/lib/db/schema";
import type { Question, Answer } from "@/lib/db/schema";
import { auth } from "@/lib/auth/server";
import { eq, and, count } from "drizzle-orm";

interface SubmitAttemptData {
  quizId: string;
  answers: { questionId: string; answerId: string; displayOrder: number }[];
  totalTimeMs: number;
  timedOut: boolean;
}

export async function submitQuizAttempt(data: SubmitAttemptData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  // Get quiz to check max attempts
  const quizData = await db.query.quiz.findFirst({
    where: eq(quiz.id, data.quizId),
    with: {
      questions: {
        with: {
          answers: true,
        },
      },
    },
  });

  if (!quizData) {
    return { error: "Quiz not found" };
  }

  // Check attempt count
  const [{ attemptCount }] = await db
    .select({ attemptCount: count() })
    .from(quizAttempt)
    .where(and(eq(quizAttempt.quizId, data.quizId), eq(quizAttempt.userId, session.user.id)));

  if (attemptCount >= quizData.maxAttempts) {
    return { error: "Maximum attempts reached" };
  }

  // Calculate correct count
  let correctCount = 0;
  const answerResults: {
    questionId: string;
    answerId: string | null;
    isCorrect: boolean;
    displayOrder: number;
  }[] = [];

  for (const submittedAnswer of data.answers) {
    const question = quizData.questions.find((q: Question) => q.id === submittedAnswer.questionId);

    if (!question) continue;

    const selectedAnswer = question.answers.find((a: Answer) => a.id === submittedAnswer.answerId);

    const isCorrect = selectedAnswer?.isCorrect ?? false;
    if (isCorrect) correctCount++;

    answerResults.push({
      questionId: submittedAnswer.questionId,
      answerId: submittedAnswer.answerId || null,
      isCorrect,
      displayOrder: submittedAnswer.displayOrder,
    });
  }

  try {
    // Create attempt
    const [newAttempt] = await db
      .insert(quizAttempt)
      .values({
        quizId: data.quizId,
        userId: session.user.id,
        correctCount,
        totalQuestions: quizData.questions.length,
        totalTimeMs: data.totalTimeMs,
        timedOut: data.timedOut,
      })
      .returning();

    // Create attempt answers
    if (answerResults.length > 0) {
      await db.insert(attemptAnswer).values(
        answerResults.map((ar) => ({
          attemptId: newAttempt.id,
          questionId: ar.questionId,
          answerId: ar.answerId,
          isCorrect: ar.isCorrect,
          displayOrder: ar.displayOrder,
        })),
      );
    }

    revalidatePath(`/quiz/${data.quizId}`);

    return { attemptId: newAttempt.id };
  } catch (error) {
    console.error("Failed to submit attempt:", error);
    return { error: "Failed to submit attempt" };
  }
}
