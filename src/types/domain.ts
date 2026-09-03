export type PaymentStatus = "pendente" | "pago";

export type Profile = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type Bank = {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
};

export type Client = {
  id: string;
  name: string;
  cpf: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
};

export type Operation = {
  id: string;
  client_id: string;
  bank_id: string;
  origin_bank_id: string;
  amount: string; // numeric vem como string do Supabase
  installments: number;
  installment_amount: string;
  payment_status: PaymentStatus;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
};

export type Observation = {
  id: string;
  client_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string | null;
};

// Tipos compostos (com joins) para listagens e detalhes.
export type ClientWithStats = Client & {
  operations_count: number;
  pending_operations: number;
  paid_operations: number;
};

export type OperationWithBanks = Operation & {
  bank: Bank;
  origin_bank: Bank;
};

export type ClientWithRelations = Client & {
  operations: OperationWithBanks[];
  observations: Observation[];
};

export type ListClientsParams = {
  q?: string;
  bank_id?: string;
  origin_bank_id?: string;
  payment_status?: PaymentStatus | "all";
  date_from?: string;
  date_to?: string;
  page?: number;
  pageSize?: number;
};

export type ListClientsResult = {
  data: ClientWithStats[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
