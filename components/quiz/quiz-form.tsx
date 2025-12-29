"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { QuestionField } from "./question-field";
import type { QuizFormData, QuestionFormData } from "@/lib/validations/quiz";

interface QuizFormProps {
  initialData?: QuizFormData & { id?: string };
  onSubmit: (data: QuizFormData) => Promise<{ error?: string }>;
  submitLabel?: string;
}

const defaultQuestion: QuestionFormData = {
  text: "",
  imageUrl: "",
  answers: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
};

export function QuizForm({
  initialData,
  onSubmit,
  submitLabel = "Create Quiz",
}: QuizFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<QuizFormData>({
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    heroImageUrl: initialData?.heroImageUrl ?? "",
    maxAttempts: initialData?.maxAttempts ?? 1,
    timeLimitSeconds: initialData?.timeLimitSeconds ?? 0,
    randomizeQuestions: initialData?.randomizeQuestions ?? true,
    questions: initialData?.questions ?? [{ ...defaultQuestion }],
  });

  const updateField = <K extends keyof QuizFormData>(
    field: K,
    value: QuizFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          ...defaultQuestion,
          answers: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
          ],
        },
      ],
    }));
  };

  const removeQuestion = (index: number) => {
    if (formData.questions.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (index: number, question: QuestionFormData) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? question : q)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onSubmit(formData);
      if (result?.error) {
        setError(result.error);
        console.error("Quiz form error:", result.error);
      }
    } catch (err) {
      // Log detailed error for debugging
      console.error("Quiz form submission error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quiz Details */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
          <CardDescription>
            Basic information about your quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Describe what this quiz is about"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroImageUrl">Hero Image URL</Label>
            <Input
              id="heroImageUrl"
              type="url"
              value={formData.heroImageUrl}
              onChange={(e) => updateField("heroImageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxAttempts">Max Attempts</Label>
              <Input
                id="maxAttempts"
                type="number"
                min={1}
                value={formData.maxAttempts}
                onChange={(e) =>
                  updateField("maxAttempts", parseInt(e.target.value) || 1)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeLimitSeconds">
                Time Limit (seconds, 0 = unlimited)
              </Label>
              <Input
                id="timeLimitSeconds"
                type="number"
                min={0}
                value={formData.timeLimitSeconds}
                onChange={(e) =>
                  updateField("timeLimitSeconds", parseInt(e.target.value) || 0)
                }
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="randomizeQuestions"
              checked={formData.randomizeQuestions}
              onCheckedChange={(checked) =>
                updateField("randomizeQuestions", checked)
              }
            />
            <Label htmlFor="randomizeQuestions">Randomize question order</Label>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Questions</h2>
          <Button type="button" onClick={addQuestion} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {formData.questions.map((question, index) => (
          <QuestionField
            key={index}
            index={index}
            question={question}
            onChange={(q) => updateQuestion(index, q)}
            onRemove={() => removeQuestion(index)}
            canRemove={formData.questions.length > 1}
          />
        ))}
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
