import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quiz, quizAttempt, attemptAnswer } from "@/lib/db/schema";
import type { Question, Answer } from "@/lib/db/schema";
import { getApiContext, requirePermission, errorResponse, API_SCOPES } from "@/lib/auth/api";
import { eq, and, count, desc } from "drizzle-orm";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const submitAttemptSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answerId: z.string(),
      displayOrder: z.number(),
    }),
  ),
  totalTimeMs: z.number().int().min(0),
  timedOut: z.boolean().default(false),
});

/**
 * GET /api/quizzes/[id]/attempts
 * List attempts for a quiz (optionally filtered by user)
 * Requires: attempts:read permission
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const ctx = await getApiContext();
  const permError = requirePermission(ctx, API_SCOPES.ATTEMPTS_READ);
  if (permError) return permError;

  const { id } = await params;
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "30", 10)));
  const offset = (page - 1) * limit;

  try {
    // Build query conditions
    const conditions = userId
      ? and(eq(quizAttempt.quizId, id), eq(quizAttempt.userId, userId))
      : eq(quizAttempt.quizId, id);

    // Get total count
    const [{ total }] = await db.select({ total: count() }).from(quizAttempt).where(conditions);

    // Get attempts
    const attempts = await db.query.quizAttempt.findMany({
      where: conditions,
      with: {
        user: true,
      },
      orderBy: [desc(quizAttempt.completedAt)],
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      items: attempts,
      totalCount: total,
      totalPages,
      currentPage: page,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error("Failed to fetch attempts:", error);
    return errorResponse("Failed to fetch attempts", 500);
  }
}

/**
 * POST /api/quizzes/[id]/attempts
 * Submit a quiz attempt
 * Requires: attempts:write permission
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const ctx = await getApiContext();
  const permError = requirePermission(ctx, API_SCOPES.ATTEMPTS_WRITE);
  if (permError) return permError;

  const { id: quizId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  const parsed = submitAttemptSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return errorResponse(firstIssue?.message ?? "Validation failed", 400);
  }

  const data = parsed.data;

  // Get quiz to check max attempts
  const quizData = await db.query.quiz.findFirst({
    where: eq(quiz.id, quizId),
    with: {
      questions: {
        with: {
          answers: true,
        },
      },
    },
  });

  if (!quizData) {
    return errorResponse("Quiz not found", 404);
  }

  // Check attempt count
  const [{ attemptCount }] = await db
    .select({ attemptCount: count() })
    .from(quizAttempt)
    .where(and(eq(quizAttempt.quizId, quizId), eq(quizAttempt.userId, ctx!.user.id)));

  if (attemptCount >= quizData.maxAttempts) {
    return errorResponse("Maximum attempts reached", 400);
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
        quizId,
        userId: ctx!.user.id,
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

    return NextResponse.json(newAttempt, { status: 201 });
  } catch (error) {
    console.error("Failed to submit attempt:", error);
    return errorResponse("Failed to submit attempt", 500);
  }
}
