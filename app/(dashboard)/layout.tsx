import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto py-6">{children}</main>
      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex h-14 items-center justify-center text-sm text-muted-foreground">
          <span>View source code on <a href="https://github.com/sebdanielsson/quiz-app" target="_blank" rel="noopener noreferrer" className="text-black dark:text-white">GitHub</a></span>
        </div>
      </footer>
    </div>
  );
}
