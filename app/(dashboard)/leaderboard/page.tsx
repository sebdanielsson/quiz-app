import { headers } from "next/headers";
import { Trophy } from "lucide-react";
import { auth } from "@/lib/auth/server";
import { getGlobalLeaderboard } from "@/lib/db/queries/quiz";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlobalLeaderboard } from "@/components/quiz/global-leaderboard";
import { PaginationControls } from "@/components/layout/pagination-controls";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1", 10);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const leaderboard = await getGlobalLeaderboard(page);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold">Global Leaderboard</h1>
          <p className="text-muted-foreground">Top players across all quizzes</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
          <CardDescription>
            Ranked by total correct answers, with tie-breaker by total time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GlobalLeaderboard entries={leaderboard.items} currentUserId={session?.user?.id} />
          <div className="mt-4">
            <PaginationControls
              currentPage={leaderboard.currentPage}
              totalPages={leaderboard.totalPages}
              baseUrl="/leaderboard"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
