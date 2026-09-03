import { createClient } from "@/lib/supabase/server";
import type {
  ClientWithStats,
  ListClientsParams,
  ListClientsResult,
  ClientWithRelations,
  Bank,
} from "@/types/domain";

const DEFAULT_PAGE_SIZE = 20;

/**
 * Lista clientes com filtros, busca e paginação server-side.
 * Estratégia:
 * - search query: ilike em name OR cpf. (Busca por banco é feita via subquery em clients que
 *   possuem operações com o banco selecionado.)
 * - filtros bank_id/orig_bank_id: client.id IN (SELECT client_id FROM operations WHERE ...)
 * - payment_status: mesma ideia
 * - date_from/date_to: clients.created_at
 */
export async function listClients(
  params: ListClientsParams = {},
): Promise<ListClientsResult> {
  const supabase = await createClient();

  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("clients")
    .select(
      `
        id, name, cpf, created_at, updated_at, created_by, updated_by,
        operations:operations(count, payment_status)
      `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  // Filtro de busca textual
  if (params.q && params.q.trim().length > 0) {
    const q = params.q.trim();
    // CPF é armazenado só com dígitos; normaliza a busca.
    const qDigits = q.replace(/\D/g, "");
    if (qDigits.length > 0) {
      query = query.or(`name.ilike.%${q}%,cpf.ilike.%${qDigits}%`);
    } else {
      query = query.ilike("name", `%${q}%`);
    }
  }

  if (params.date_from) {
    query = query.gte("created_at", params.date_from);
  }
  if (params.date_to) {
    query = query.lte("created_at", `${params.date_to}T23:59:59.999Z`);
  }

  // Para filtros que envolvem operações, fazemos subquery separada para coletar IDs.
  let clientIdsFromOps: string[] | null = null;
  if (params.bank_id || params.origin_bank_id || params.payment_status) {
    let opsQuery = supabase.from("operations").select("client_id");
    if (params.bank_id) opsQuery = opsQuery.eq("bank_id", params.bank_id);
    if (params.origin_bank_id)
      opsQuery = opsQuery.eq("origin_bank_id", params.origin_bank_id);
    if (params.payment_status && params.payment_status !== "all")
      opsQuery = opsQuery.eq("payment_status", params.payment_status);

    const { data: ops } = await opsQuery;
    clientIdsFromOps = Array.from(new Set((ops ?? []).map((o) => o.client_id)));

    if (clientIdsFromOps.length === 0) {
      return {
        data: [],
        count: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }
    query = query.in("id", clientIdsFromOps);
  }

  const { data, count, error } = await query;
  if (error) {
    throw new Error("Não foi possível carregar os clientes.");
  }

  const total = count ?? 0;

  const mapped: ClientWithStats[] = (data ?? []).map((row) => {
    // row.operations é um array (count, payment_status) apenas se usarmos `count` separado.
    // Como pedimos só count, vem como objeto { count: N }.
    const opsCount = (row as unknown as { operations: { count: number }[] })
      .operations?.[0]?.count ?? 0;
    return {
      id: row.id,
      name: row.name,
      cpf: row.cpf,
      created_at: row.created_at,
      updated_at: row.updated_at,
      created_by: row.created_by,
      updated_by: row.updated_by,
      operations_count: opsCount,
      pending_operations: 0,
      paid_operations: 0,
    };
  });

  // Se a busca por status for feita, calculamos pendentes/pagos por cliente.
  if (mapped.length > 0 && params.payment_status) {
    const ids = mapped.map((c) => c.id);
    const { data: opsDetail } = await supabase
      .from("operations")
      .select("client_id, payment_status")
      .in("client_id", ids);
    const groups = new Map<string, { p: number; g: number }>();
    for (const o of opsDetail ?? []) {
      const g = groups.get(o.client_id) ?? { p: 0, g: 0 };
      if (o.payment_status === "pendente") g.p++;
      else g.g++;
      groups.set(o.client_id, g);
    }
    for (const c of mapped) {
      const g = groups.get(c.id);
      if (g) {
        c.pending_operations = g.p;
        c.paid_operations = g.g;
      }
    }
  }

  return {
    data: mapped,
    count: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getClientById(
  id: string,
): Promise<ClientWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select(
      `
      id, name, cpf, created_at, updated_at, created_by, updated_by,
      operations:operations(
        id, client_id, bank_id, origin_bank_id, amount, installments,
        installment_amount, payment_status, payment_date,
        created_at, updated_at, created_by, updated_by,
        bank:bank_id(id, name, active, created_at),
        origin_bank:origin_bank_id(id, name, active, created_at)
      ),
      observations:observations(
        id, client_id, content, created_at, updated_at, created_by, updated_by
      )
    `,
    )
    .eq("id", id)
    .order("created_at", { foreignTable: "operations", ascending: false })
    .order("created_at", { foreignTable: "observations", ascending: false })
    .single();

  if (error || !data) return null;

  return data as unknown as ClientWithRelations;
}

export async function listActiveBanks(): Promise<Bank[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("banks")
    .select("id, name, active, created_at")
    .eq("active", true)
    .order("name");
  if (error) return [];
  return (data ?? []) as Bank[];
}
