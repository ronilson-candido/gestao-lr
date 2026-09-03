"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/format";
import { maskCPFPartial } from "@/lib/validations/cpf";
import type { ClientWithStats } from "@/types/domain";

type Props = {
  clients: ClientWithStats[];
  page: number;
  totalPages: number;
  totalCount: number;
};

function SummaryStatus({ client }: { client: ClientWithStats }) {
  if (client.operations_count === 0) {
    return <Badge variant="neutral">Sem operações</Badge>;
  }
  if (client.pending_operations > 0) {
    return (
      <Badge variant="warning">{client.pending_operations} pendente(s)</Badge>
    );
  }
  return (
    <Badge variant="success">{client.paid_operations} pago(s)</Badge>
  );
}

function buildPageHref(
  pathname: string,
  searchParams: URLSearchParams,
  page: number,
) {
  const params = new URLSearchParams(searchParams.toString());
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function ClientsTable({ clients, page, totalPages, totalCount }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (clients.length === 0) {
    return (
      <EmptyState
        title="Nenhum cliente encontrado"
        description="Tente ajustar os filtros ou cadastre um novo cliente."
        action={
          <Link href="/clientes/novo">
            <Button>Cadastrar primeiro cliente</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-brand-100">
            <thead className="bg-brand-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Cliente
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-600">
                  CPF
                </th>
                <th className="hidden px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-600 md:table-cell">
                  Cadastrado em
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Operações
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Status
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 bg-white">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-brand-50">
                  <td className="px-5 py-3 text-sm font-medium text-brand-900">
                    {c.name}
                  </td>
                  <td className="px-5 py-3 font-mono text-sm text-brand-700">
                    {maskCPFPartial(c.cpf)}
                  </td>
                  <td className="hidden px-5 py-3 text-sm text-brand-600 md:table-cell">
                    {formatDate(c.created_at)}
                  </td>
                  <td className="px-5 py-3 text-sm text-brand-700">
                    {c.operations_count}
                  </td>
                  <td className="px-5 py-3 text-sm">
                    <SummaryStatus client={c} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/clientes/${c.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Eye className="h-4 w-4" />}
                      >
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

      <Pagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pathname={pathname}
        buildHref={(p) => buildPageHref(pathname, searchParams, p)}
      />
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  totalCount,
  buildHref,
}: {
  page: number;
  totalPages: number;
  totalCount: number;
  pathname: string;
  buildHref: (page: number) => string;
}) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-brand-600">
        {totalCount} cliente{totalCount === 1 ? "" : "s"} encontrado
        {totalCount === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-2">
        <Link
          aria-disabled={page <= 1}
          href={buildHref(page - 1)}
          className={page <= 1 ? "pointer-events-none opacity-50" : ""}
        >
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Anterior
          </Button>
        </Link>
        <span className="text-sm text-brand-700">
          Página {page} de {Math.max(totalPages, 1)}
        </span>
        <Link
          aria-disabled={page >= totalPages}
          href={buildHref(page + 1)}
          className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
        >
          <Button
            variant="outline"
            size="sm"
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Próxima
          </Button>
        </Link>
      </div>
    </div>
  );
}
