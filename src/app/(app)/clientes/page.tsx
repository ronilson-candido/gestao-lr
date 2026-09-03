import { Suspense } from "react";
import { requireProfile } from "@/lib/auth-helpers";
import { listActiveBanks, listClients } from "@/lib/queries/clients";
import { ClientsFilterBar } from "@/components/clients/ClientsFilterBar";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { Skeleton } from "@/components/ui/Skeleton";
import type { PaymentStatus } from "@/types/domain";

export const metadata = {
  title: "Clientes",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    bank?: string;
    origin?: string;
    status?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
};

export default async function ClientsPage({ searchParams }: Props) {
  await requireProfile();
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const banks = await listActiveBanks();
  const filters = {
    q: params.q?.trim() || undefined,
    bank_id: params.bank || undefined,
    origin_bank_id: params.origin || undefined,
    payment_status: (params.status as PaymentStatus | "all") || undefined,
    date_from: params.from || undefined,
    date_to: params.to || undefined,
    page,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-900">Clientes</h1>
        <p className="mt-1 text-sm text-brand-600">
          Pesquise, filtre e gerencie seus clientes.
        </p>
      </div>

      <ClientsFilterBar banks={banks} />

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <ClientsResult filters={filters} />
      </Suspense>
    </div>
  );
}

async function ClientsResult({
  filters,
}: {
  filters: Parameters<typeof listClients>[0];
}) {
  const result = await listClients(filters);
  return (
    <ClientsTable
      clients={result.data}
      page={result.page}
      totalPages={result.totalPages}
      totalCount={result.count}
    />
  );
}
