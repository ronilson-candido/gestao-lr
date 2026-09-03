import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, User } from "lucide-react";
import { requireProfile } from "@/lib/auth-helpers";
import { getClientById, listActiveBanks } from "@/lib/queries/clients";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { OperationList } from "@/components/operations/OperationForm";
import { ObservationsPanel } from "@/components/observations/ObservationsPanel";
import { DeleteClientButton } from "@/components/clients/ClientForm";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { maskCPF } from "@/lib/validations/cpf";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Cliente ${id.slice(0, 8)}` };
}

export default async function ClientDetailPage({ params }: Props) {
  await requireProfile();
  const { id } = await params;

  const [client, banks] = await Promise.all([
    getClientById(id),
    listActiveBanks(),
  ]);

  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para clientes
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
              <User className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl">{client.name}</CardTitle>
              <p className="mt-1 font-mono text-sm text-brand-700">
                CPF: {maskCPF(client.cpf)}
              </p>
              <p className="mt-1 text-xs text-brand-500">
                Cadastrado em {formatDate(client.created_at)} •{" "}
                {formatDateTime(client.created_at)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/clientes/${client.id}/editar`}>
              <Button variant="outline" leftIcon={<Pencil className="h-4 w-4" />}>
                Editar cliente
              </Button>
            </Link>
            <DeleteClientButton clientId={client.id} name={client.name} />
          </div>
        </CardHeader>
      </Card>

      <OperationList
        clientId={client.id}
        banks={banks}
        operations={client.operations}
      />

      <ObservationsPanel
        clientId={client.id}
        observations={client.observations}
      />

      {client.operations.length === 0 && (
        <p className="text-center text-xs text-brand-400">
          <Badge variant="neutral">Última atualização: {formatDateTime(client.updated_at)}</Badge>
        </p>
      )}
    </div>
  );
}
