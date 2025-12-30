import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { canManageQuizzes } from "@/lib/auth/permissions";
import { ApiKeyManager } from "@/components/settings/api-key-manager";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  // Only admins can access settings
  if (!canManageQuizzes(session.user)) {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-2">Manage your API keys and application settings.</p>
      </div>

      <div className="">
        <ApiKeyManager />
      </div>
    </div>
  );
}
