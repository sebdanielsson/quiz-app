import Link from "next/link";
import Image from "next/image";
import { Clock, HelpCircle, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Quiz, User as UserType } from "@/lib/db/schema";

interface QuizCardProps {
  quiz: Quiz & {
    questionCount: number;
    author: UserType | null;
  };
}

export function QuizCard({ quiz }: QuizCardProps) {
  const formatTime = (seconds: number) => {
    if (seconds === 0) return "No limit";
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m`;
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      {quiz.heroImageUrl && (
        <div className="relative aspect-video w-full">
          <Image src={quiz.heroImageUrl} alt={quiz.title} fill className="object-cover" />
        </div>
      )}
      {!quiz.heroImageUrl && (
        <CardHeader className="pt-6 flex-1 ">
          <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
          {quiz.description && (
            <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        <div className="text-muted-foreground flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <HelpCircle className="h-4 w-4" />
            {quiz.questionCount} questions
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTime(quiz.timeLimitSeconds)}
          </span>
        </div>
        {quiz.author && (
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <User className="h-4 w-4" />
            {quiz.author.displayName || quiz.author.name || "Unknown"}
          </div>
        )}
        <div className="flex gap-2">
          <Badge variant="secondary">
            {quiz.maxAttempts === 1 ? "1 attempt" : `${quiz.maxAttempts} attempts`}
          </Badge>
          {quiz.randomizeQuestions && <Badge variant="outline">Randomized</Badge>}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full mb-6">
          <Link href={`/quiz/${quiz.id}`}>View Quiz</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
