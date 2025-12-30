import { db } from "@/lib/db";
import { quiz, question, answer, quizAttempt, user } from "@/lib/db/schema";
import type { Quiz, Question, Answer, User, QuizAttempt, AttemptAnswer } from "@/lib/db/schema";
import { eq, desc, count, sql, and, or, lte, isNull } from "drizzle-orm";

export const ITEMS_PER_PAGE = 30;

// Type for quiz with nested relations
export type QuizWithRelations = Quiz & {
  author: User;
  questions: (Question & {
    answers: Answer[];
  })[];
};

// Type for quiz attempt with nested relations
export type AttemptWithRelations = QuizAttempt & {
  quiz: Quiz;
  user: User;
  answers: (AttemptAnswer & {
    question: Question & {
      answers: Answer[];
    };
    answer: Answer | null;
  })[];
};

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

/**
 * Get paginated quizzes ordered by creation date (newest first)
 * If isAdmin is false, only shows quizzes where publishedAt is null or in the past
 */
export async function getQuizzes(
  page: number = 1,
  limit: number = ITEMS_PER_PAGE,
  isAdmin: boolean = false,
): Promise<
  PaginatedResult<
    typeof quiz.$inferSelect & { questionCount: number; author: typeof user.$inferSelect | null }
  >
> {
  const offset = (page - 1) * limit;

  // Build where clause for non-admins: only show published quizzes
  const publishedFilter = isAdmin
    ? undefined
    : or(isNull(quiz.publishedAt), lte(quiz.publishedAt, new Date()));

  // Get total count
  const [{ total }] = await db.select({ total: count() }).from(quiz).where(publishedFilter);

  // Get quizzes with question count and author
  const quizzes = await db
    .select({
      quiz: quiz,
      questionCount: sql<number>`(SELECT COUNT(*) FROM question WHERE question.quiz_id = ${quiz.id})`,
      author: user,
    })
    .from(quiz)
    .leftJoin(user, eq(quiz.authorId, user.id))
    .where(publishedFilter)
    .orderBy(desc(quiz.createdAt))
    .limit(limit)
    .offset(offset);

  const items = quizzes.map((q: { quiz: Quiz; questionCount: number; author: User }) => ({
    ...q.quiz,
    questionCount: q.questionCount,
    author: q.author,
  }));

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    totalCount: total,
    totalPages,
    currentPage: page,
    hasMore: page < totalPages,
  };
}

/**
 * Get a single quiz by ID with all questions and answers
 */
export async function getQuizById(quizId: string): Promise<QuizWithRelations | undefined> {
  const quizData = await db.query.quiz.findFirst({
    where: eq(quiz.id, quizId),
    with: {
      author: true,
      questions: {
        with: {
          answers: true,
        },
        orderBy: (questions: { order: unknown }, { asc }: { asc: (col: unknown) => unknown }) => [
          asc(questions.order),
        ],
      },
    },
  });

  return quizData as QuizWithRelations | undefined;
}

/**
 * Get quiz leaderboard (per-quiz)
 */
export async function getQuizLeaderboard(
  quizId: string,
  page: number = 1,
  limit: number = ITEMS_PER_PAGE,
) {
  const offset = (page - 1) * limit;

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(quizAttempt)
    .where(eq(quizAttempt.quizId, quizId));

  // Get leaderboard entries
  const entries = await db
    .select({
      attempt: quizAttempt,
      user: user,
    })
    .from(quizAttempt)
    .innerJoin(user, eq(quizAttempt.userId, user.id))
    .where(eq(quizAttempt.quizId, quizId))
    .orderBy(desc(quizAttempt.correctCount), quizAttempt.totalTimeMs)
    .limit(limit)
    .offset(offset);

  const totalPages = Math.ceil(total / limit);

  return {
    items: entries.map((e: { attempt: QuizAttempt; user: User }, index: number) => ({
      rank: offset + index + 1,
      ...e.attempt,
      user: e.user,
    })),
    totalCount: total,
    totalPages,
    currentPage: page,
    hasMore: page < totalPages,
  };
}

/**
 * Get global leaderboard (sum of correct answers across all quizzes)
 */
export async function getGlobalLeaderboard(page: number = 1, limit: number = ITEMS_PER_PAGE) {
  const offset = (page - 1) * limit;

  // Get total unique users with attempts
  const [{ total }] = await db
    .select({ total: sql<number>`COUNT(DISTINCT ${quizAttempt.userId})` })
    .from(quizAttempt);

  // Get aggregated leaderboard
  const entries = await db
    .select({
      userId: quizAttempt.userId,
      totalCorrect: sql<number>`SUM(${quizAttempt.correctCount})`,
      totalTimeMs: sql<number>`SUM(${quizAttempt.totalTimeMs})`,
      quizzesPlayed: sql<number>`COUNT(DISTINCT ${quizAttempt.quizId})`,
      user: user,
    })
    .from(quizAttempt)
    .innerJoin(user, eq(quizAttempt.userId, user.id))
    .groupBy(quizAttempt.userId)
    .orderBy(sql`SUM(${quizAttempt.correctCount}) DESC`, sql`SUM(${quizAttempt.totalTimeMs}) ASC`)
    .limit(limit)
    .offset(offset);

  const totalPages = Math.ceil(total / limit);

  return {
    items: entries.map(
      (
        e: {
          userId: string;
          totalCorrect: number;
          totalTimeMs: number;
          quizzesPlayed: number;
          user: User;
        },
        index: number,
      ) => ({
        rank: offset + index + 1,
        userId: e.userId,
        totalCorrect: e.totalCorrect,
        totalTimeMs: e.totalTimeMs,
        quizzesPlayed: e.quizzesPlayed,
        user: e.user,
      }),
    ),
    totalCount: total,
    totalPages,
    currentPage: page,
    hasMore: page < totalPages,
  };
}

/**
 * Get user's attempt count for a specific quiz
 */
export async function getUserAttemptCount(quizId: string, userId: string): Promise<number> {
  const [{ attemptCount }] = await db
    .select({ attemptCount: count() })
    .from(quizAttempt)
    .where(and(eq(quizAttempt.quizId, quizId), eq(quizAttempt.userId, userId)));

  return attemptCount;
}

/**
 * Get a specific attempt with all answers
 */
export async function getAttemptById(attemptId: string): Promise<AttemptWithRelations | undefined> {
  const attempt = await db.query.quizAttempt.findFirst({
    where: eq(quizAttempt.id, attemptId),
    with: {
      quiz: true,
      user: true,
      answers: {
        with: {
          question: {
            with: {
              answers: true,
            },
          },
          answer: true,
        },
        orderBy: (
          answers: { displayOrder: unknown },
          { asc }: { asc: (col: unknown) => unknown },
        ) => [asc(answers.displayOrder)],
      },
    },
  });

  return attempt as AttemptWithRelations | undefined;
}
