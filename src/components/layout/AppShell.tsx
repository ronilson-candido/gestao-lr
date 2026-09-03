"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/operacoes", label: "Operações", icon: Briefcase },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-brand-900 text-white"
                : "text-brand-700 hover:bg-brand-100",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ profile }: { profile: { name: string; email: string } }) {
  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-brand-200 bg-white md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-brand-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-900 text-white">
          <Briefcase className="h-5 w-5" />
        </div>
        <span className="text-base font-bold text-brand-900">Gestão LR</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <NavList />
      </div>
      <div className="border-t border-brand-200 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-900">
            {profile.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-brand-900">
              {profile.name}
            </p>
            <p className="truncate text-xs text-brand-500">{profile.email}</p>
          </div>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}

export function MobileMenu({ profile }: { profile: { name: string; email: string } }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-md text-brand-700 hover:bg-brand-100"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex animate-fade-in">
          <div
            className="absolute inset-0 bg-brand-950/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex h-full w-72 max-w-[80%] flex-col bg-white shadow-xl animate-slide-in-from-bottom">
            <div className="flex h-16 items-center justify-between border-b border-brand-200 px-5">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-900 text-white">
                  <Briefcase className="h-5 w-5" />
                </div>
                <span className="text-base font-bold text-brand-900">
                  Gestão LR
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-brand-500 hover:bg-brand-100"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-brand-200 p-3">
              <div className="flex items-center gap-3 rounded-lg px-2 py-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-900">
                  {profile.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-900">
                    {profile.name}
                  </p>
                  <p className="truncate text-xs text-brand-500">
                    {profile.email}
                  </p>
                </div>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
