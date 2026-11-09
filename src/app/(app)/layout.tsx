import Sidebar from "@/components/sidebar";
import AuthGuard from "@/components/auth-guard";
import TrialGuard from "@/components/trial-guard";
import IdleLogout from "@/components/idle-logout";
import RevisionNudge from "@/components/revision-nudge";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-screen">
      <AuthGuard />
      <TrialGuard />
      <IdleLogout />
      <RevisionNudge />
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}
