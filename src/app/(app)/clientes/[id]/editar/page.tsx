import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireProfile } from "@/lib/auth-helpers";
import { createClient as createSupabase } from "@/lib/supabase/server";
import { EditClientForm } from "@/components/clients/ClientForm";
import { maskCPF } from "@/lib/validations/cpf";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Editar cliente ${id.slice(0, 8)}` };
}

export default async function EditClientPage({ params }: Props) {
  await requireProfile();
  const { id } = await params;

  const supabase = await createSupabase();
  const { data: client } = await supabase
    .from("clients")
    .select("id, name, cpf")
    .eq("id", id)
    .single();

  if (!client) notFound();

  return (
    <div className="space-y-4">
      <Link
        href={`/clientes/${id}`}
        className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o cliente
      </Link>
      <h1 className="text-2xl font-bold text-brand-900">Editar cliente</h1>
      <p className="text-sm text-brand-600">CPF atual: {maskCPF(client.cpf)}</p>
      <EditClientForm
        clientId={client.id}
        initial={{ name: client.name, cpf: client.cpf }}
      />
    </div>
  );
}
