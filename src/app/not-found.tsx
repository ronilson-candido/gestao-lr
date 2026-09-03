import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <div className="text-center">
        <p className="text-sm font-semibold text-brand-700">404</p>
        <h1 className="mt-2 text-3xl font-bold text-brand-900">
          Página não encontrada
        </h1>
        <p className="mt-2 text-sm text-brand-600">
          O endereço acessado não existe ou você não tem permissão.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Link href="/dashboard">
            <Button>Ir para o dashboard</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline">Entrar</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
