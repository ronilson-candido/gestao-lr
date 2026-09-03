import Link from "next/link";
import {
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  UserPlus,
  Search,
} from "lucide-react";
import { requireProfile } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/operations/OperationCard";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils/format";
import { maskCPFPartial } from "@/lib/validations/cpf";
import type { Client, OperationWithBanks } from "@/types/domain";

export const metadata = {
  title: "Dashboard",
};

type Metrics = {
  total_clients: number;
  total_operations: number;
  pending_operations: number;
  paid_operations: number;
};

type RecentClient = Pick<Client, "id" | "name" | "cpf" | "created_at"> & {
  operations_count: number;
};

type RecentOp = OperationWithBanks & {
  client: Pick<Client, "id" | "name"> | null;
};

export default async function DashboardPage() {
  const profile = await requireProfile();

  const supabase = await createClient();

  const [
    { count: totalClients },
    { count: totalOperations },
    { count: pendingCount },
    { count: paidCount },
    { data: recentClientsRaw },
    { data: recentOpsRaw },
  ] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("operations").select("id", { count: "exact", head: true }),
    supabase
      .from("operations")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "pendente"),
    supabase
      .from("operations")
      .select("id", { count: "exact", head: true })
      .eq("payment_status", "pago"),
    supabase
      .from("clients")
      .select(
        "id, name, cpf, created_at, operations:operations(count)",
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("operations")
      .select(
        `id, client_id, bank_id, origin_bank_id, amount, installments,
         installment_amount, payment_status, payment_date,
         created_at, updated_at, created_by, updated_by,
         bank:bank_id(id, name, active, created_at),
         origin_bank:origin_bank_id(id, name, active, created_at),
         client:client_id(id, name)`,
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const metrics: Metrics = {
    total_clients: totalClients ?? 0,
    total_operations: totalOperations ?? 0,
    pending_operations: pendingCount ?? 0,
    paid_operations: paidCount ?? 0,
  };

  const recentClients: RecentClient[] = (recentClientsRaw ?? []).map(
    (row) => ({
      id: row.id,
      name: row.name,
      cpf: row.cpf,
      created_at: row.created_at,
      operations_count:
        (row as unknown as { operations: { count: number }[] }).operations?.[0]
          ?.count ?? 0,
    }),
  );

  const recentOps = (recentOpsRaw ?? []) as unknown as RecentOp[];

  const firstName = profile.name.split(" ")[0] || profile.name;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">
          Olá, {firstName}
        </h1>
        <p className="mt-1 text-sm text-brand-600">
          Resumo geral dos clientes e operações.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total de clientes"
          value={metrics.total_clients}
          icon={Users}
        />
        <MetricCard
          label="Total de operações"
          value={metrics.total_operations}
          icon={Briefcase}
        />
        <MetricCard
          label="Pendentes"
          value={metrics.pending_operations}
          icon={Clock}
          tone="warning"
        />
        <MetricCard
          label="Pagas"
          value={metrics.paid_operations}
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Clientes recentes</CardTitle>
            <Link href="/clientes">
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentClients.length === 0 ? (
              <EmptyDashboard hint="cliente" />
            ) : (
              <ul className="divide-y divide-brand-100">
                {recentClients.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/clientes/${c.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-brand-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-brand-900">
                          {c.name}
                        </p>
                        <p className="font-mono text-xs text-brand-500">
                          {maskCPFPartial(c.cpf)} • {formatDate(c.created_at)} •{" "}
                          {c.operations_count} operação
                          {c.operations_count === 1 ? "" : "es"}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Operações recentes</CardTitle>
            <Link href="/operacoes">
              <Button variant="ghost" size="sm">
                Ver todas
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentOps.length === 0 ? (
              <EmptyDashboard hint="operação" />
            ) : (
              <ul className="divide-y divide-brand-100">
                {recentOps.map((op) => (
                  <li key={op.id}>
                    <Link
                      href={`/clientes/${op.client_id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-brand-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-brand-900">
                          {op.client?.name ?? "—"}
                        </p>
                        <p className="text-xs text-brand-500">
                          {op.bank.name} ← {op.origin_bank.name} •{" "}
                          {formatCurrency(op.amount)} •{" "}
                          {op.installments}x
                        </p>
                      </div>
                      <StatusBadge status={op.payment_status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ações rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href="/clientes/novo">
            <Button leftIcon={<UserPlus className="h-4 w-4" />}>
              Novo cliente
            </Button>
          </Link>
          <Link href="/clientes">
            <Button variant="outline" leftIcon={<Search className="h-4 w-4" />}>
              Pesquisar clientes
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-600 bg-emerald-50"
      : tone === "warning"
        ? "text-amber-600 bg-amber-50"
        : "text-brand-700 bg-brand-100";

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
            {label}
          </p>
          <p className="text-2xl font-bold text-brand-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyDashboard({ hint }: { hint: string }) {
  return (
    <div className="px-5 py-8 text-center text-sm text-brand-500">
      Nenhum(a) {hint} cadastrado(a) ainda.
    </div>
  );
}
