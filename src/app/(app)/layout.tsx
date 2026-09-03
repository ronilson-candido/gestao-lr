import { Sidebar, MobileMenu } from "@/components/layout/AppShell";
import { requireProfile } from "@/lib/auth-helpers";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  const profileProps = { name: profile.name, email: profile.email };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-50">
      <Sidebar profile={profileProps} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-brand-200 bg-white px-4 md:hidden">
          <h1 className="text-base font-bold text-brand-900">Gestão LR</h1>
          <MobileMenu profile={profileProps} />
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="container-app py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
