import Link from "next/link";
import { Eye } from "lucide-react";
import { requireProfile } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { StatusBadge } from "@/components/operations/OperationCard";
import type { OperationWithBanks, Client } from "@/types/domain";

export const metadata = {
  title: "Operações",
};

type OpRow = OperationWithBanks & { client: Pick<Client, "id" | "name"> };

type Props = {
  searchParams: Promise<{ status?: string; page?: string }>;
};

export default async function OperationsPage({ searchParams }: Props) {
  await requireProfile();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  let query = supabase
    .from("operations")
    .select(
      `
      id, client_id, bank_id, origin_bank_id, amount, installments,
      installment_amount, payment_status, payment_date,
      created_at, updated_at, created_by, updated_by,
      bank:bank_id(id, name, active, created_at),
      origin_bank:origin_bank_id(id, name, active, created_at),
      client:client_id(id, name)
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.status === "pendente" || params.status === "pago") {
    query = query.eq("payment_status", params.status);
  }

  const { data, count } = await query;
  const ops = (data ?? []) as unknown as OpRow[];
  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Operações</h1>
        <p className="mt-1 text-sm text-brand-600">
          Visão geral de todas as operações registradas.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <FilterLink current={params.status} value="" label="Todas" />
        <FilterLink current={params.status} value="pendente" label="Pendentes" />
        <FilterLink current={params.status} value="pago" label="Pagas" />
      </div>

      {ops.length === 0 ? (
        <EmptyState
          title="Nenhuma operação encontrada"
          description="Cadastre uma operação na página de um cliente."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-100">
              <thead className="bg-brand-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Cliente
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Banco
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Origem
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Valor
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Parcelas
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Status
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Pagamento
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-brand-600">
                    Cliente
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 bg-white">
                {ops.map((op) => (
                  <tr key={op.id} className="hover:bg-brand-50">
                    <td className="px-5 py-3 text-sm font-medium text-brand-900">
                      {op.client?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-brand-700">
                      {op.bank.name}
                    </td>
                    <td className="px-5 py-3 text-sm text-brand-700">
                      {op.origin_bank.name}
                    </td>
                    <td className="px-5 py-3 text-sm text-brand-700">
                      {formatCurrency(op.amount)}
                    </td>
                    <td className="px-5 py-3 text-sm text-brand-700">
                      {op.installments}x
                    </td>
                    <td className="px-5 py-3 text-sm">
                      <StatusBadge status={op.payment_status} />
                    </td>
                    <td className="px-5 py-3 text-sm text-brand-700">
                      {op.payment_date ? formatDate(op.payment_date) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/clientes/${op.client_id}`}>
                        <Button size="sm" variant="outline" leftIcon={<Eye className="h-4 w-4" />}>
                          Ver
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <p className="text-sm text-brand-600">
        {total} operação{total === 1 ? "" : "es"} • Página {page} de{" "}
        {Math.max(totalPages, 1)}
      </p>
    </div>
  );
}

function FilterLink({
  current,
  value,
  label,
}: {
  current?: string;
  value: string;
  label: string;
}) {
  const active = (current ?? "") === value;
  const href =
    value === "" ? "/operacoes" : `/operacoes?status=${value}`;
  return (
    <Link href={href}>
      <Button variant={active ? "primary" : "outline"} size="sm">
        {label}
      </Button>
    </Link>
  );
}
