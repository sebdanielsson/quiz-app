import { z } from "zod";

export const answerSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Answer text is required"),
  isCorrect: z.boolean().default(false),
});

export const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Question text is required"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  answers: z
    .array(answerSchema)
    .min(2, "At least 2 answers are required")
    .max(6, "Maximum 6 answers allowed")
    .refine((answers) => answers.some((a) => a.isCorrect), {
      message: "At least one answer must be marked as correct",
    }),
});

export const quizSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  heroImageUrl: z.string().url().optional().or(z.literal("")),
  maxAttempts: z.coerce.number().int().min(1, "At least 1 attempt required").default(1),
  timeLimitSeconds: z.coerce.number().int().min(0, "Time limit cannot be negative").default(0),
  randomizeQuestions: z.boolean().default(true),
  randomizeAnswers: z.boolean().default(true),
  questions: z.array(questionSchema).min(1, "At least 1 question is required"),
});

export type QuizFormData = z.infer<typeof quizSchema>;
export type QuestionFormData = z.infer<typeof questionSchema>;
export type AnswerFormData = z.infer<typeof answerSchema>;
