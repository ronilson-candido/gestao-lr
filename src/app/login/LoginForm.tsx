"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2 } from "lucide-react";
import { signIn, resetPassword } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} className="w-full" leftIcon={!pending ? <LogIn className="h-4 w-4" /> : undefined}>
      {children}
    </Button>
  );
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  const [signInState, signInAction] = useActionState(signIn, undefined);
  const [resetState, resetAction] = useActionState(resetPassword, undefined);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta para continuar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {signInState?.error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {signInState.error}
          </div>
        )}
        <form action={signInAction} className="space-y-4">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="space-y-1.5">
            <Label htmlFor="email" required>
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" required>
              Senha
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <SubmitButton>Entrar</SubmitButton>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-brand-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-brand-500">ou</span>
          </div>
        </div>

        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-brand-700 hover:text-brand-900">
            Esqueci minha senha
          </summary>
          <form action={resetAction} className="mt-3 space-y-3">
            {resetState?.error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {resetState.error}
              </div>
            )}
            {resetState?.success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {resetState.success}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="reset-email">E-mail cadastrado</Label>
              <Input
                id="reset-email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />
            </div>
            <Button type="submit" variant="outline" size="sm" className="w-full" leftIcon={<Loader2 className="h-4 w-4" aria-hidden />}>
              Enviar link de recuperação
            </Button>
          </form>
        </details>

        <p className="text-center text-xs text-brand-500">
          <Link href="/" className="hover:text-brand-700">
            voltar ao início
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
