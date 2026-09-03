import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireProfile } from "@/lib/auth-helpers";
import { NewClientForm } from "@/components/clients/ClientForm";

export const metadata = {
  title: "Novo cliente",
};

export default async function NewClientPage() {
  await requireProfile();

  return (
    <div className="space-y-4">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para clientes
      </Link>
      <h1 className="text-2xl font-bold text-brand-900">Novo cliente</h1>
      <NewClientForm />
    </div>
  );
}
