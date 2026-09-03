"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, UserPlus, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import type { Bank } from "@/types/domain";

type Props = {
  banks: Bank[];
};

export function ClientsFilterBar({ banks }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get("q") ?? "";
  const initialBank = searchParams.get("bank") ?? "";
  const initialOrigin = searchParams.get("origin") ?? "";
  const initialStatus = searchParams.get("status") ?? "";
  const initialFrom = searchParams.get("from") ?? "";
  const initialTo = searchParams.get("to") ?? "";

  const [q, setQ] = React.useState(initialQ);

  // Debounce de 300ms para a busca textual.
  React.useEffect(() => {
    const handle = setTimeout(() => {
      if (q !== initialQ) applyParams({ q: q.trim() || null });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function applyParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") params.delete(k);
      else params.set(k, v);
    }
    // Sempre resetar para página 1 ao aplicar filtro.
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    setQ("");
    router.push(pathname);
  }

  const hasFilters =
    !!initialQ ||
    !!initialBank ||
    !!initialOrigin ||
    !!initialStatus ||
    !!initialFrom ||
    !!initialTo;

  return (
    <div className="space-y-3 rounded-xl border border-brand-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-5">
          <Label htmlFor="search">Pesquisar</Label>
          <div className="relative mt-1.5">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
            <Input
              id="search"
              placeholder="Nome, CPF ou banco..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="md:col-span-3">
          <Label htmlFor="bank">Banco (destino)</Label>
          <Select
            id="bank"
            defaultValue={initialBank}
            onChange={(e) =>
              applyParams({ bank: e.target.value || null })
            }
            className="mt-1.5"
          >
            <option value="">Todos</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="origin">Banco de origem</Label>
          <Select
            id="origin"
            defaultValue={initialOrigin}
            onChange={(e) =>
              applyParams({ origin: e.target.value || null })
            }
            className="mt-1.5"
          >
            <option value="">Todos</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            defaultValue={initialStatus}
            onChange={(e) =>
              applyParams({ status: e.target.value || null })
            }
            className="mt-1.5"
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-3">
          <Label htmlFor="from">Cadastrado de</Label>
          <Input
            id="from"
            type="date"
            defaultValue={initialFrom}
            onChange={(e) => applyParams({ from: e.target.value || null })}
            className="mt-1.5"
          />
        </div>
        <div className="md:col-span-3">
          <Label htmlFor="to">até</Label>
          <Input
            id="to"
            type="date"
            defaultValue={initialTo}
            onChange={(e) => applyParams({ to: e.target.value || null })}
            className="mt-1.5"
          />
        </div>
        <div className="flex items-end justify-end gap-2 md:col-span-6">
          {hasFilters && (
            <Button variant="ghost" onClick={clearAll} leftIcon={<X className="h-4 w-4" />}>
              Limpar filtros
            </Button>
          )}
          <Link href="/clientes/novo">
            <Button leftIcon={<UserPlus className="h-4 w-4" />}>Novo cliente</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
