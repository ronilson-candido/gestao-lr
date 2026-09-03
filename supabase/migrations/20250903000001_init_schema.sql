-- ============================================================================
-- Migration 001: Schema inicial
-- ============================================================================
-- Tabelas: profiles, banks, clients, operations, observations
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- busca textual avançada

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfil de usuários (1:1 com auth.users).';

-- ----------------------------------------------------------------------------
-- banks
-- ----------------------------------------------------------------------------
CREATE TABLE public.banks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.banks IS 'Tabela de referência de bancos (portabilidade/origem).';

-- Valores iniciais — taxonomia, não dados de cliente.
INSERT INTO public.banks (name) VALUES
  ('Bradesco'),
  ('Caixa'),
  ('Itaú'),
  ('Banco do Brasil'),
  ('Santander'),
  ('Porto Seguro'),
  ('BMG'),
  ('Pan'),
  ('C6 Bank'),
  ('Inter')
ON CONFLICT (name) DO NOTHING;

-- ----------------------------------------------------------------------------
-- clients
-- ----------------------------------------------------------------------------
CREATE TABLE public.clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL CHECK (length(trim(name)) >= 3),
  cpf         TEXT NOT NULL UNIQUE CHECK (length(regexp_replace(cpf, '\D', '', 'g')) = 11),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  updated_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.clients IS 'Clientes cadastrados no sistema.';
COMMENT ON COLUMN public.clients.cpf IS 'CPF armazenado apenas com dígitos (11 chars).';

CREATE INDEX idx_clients_name_trgm ON public.clients USING GIN (name gin_trgm_ops);
CREATE INDEX idx_clients_cpf ON public.clients (cpf);
CREATE INDEX idx_clients_created_at ON public.clients (created_at DESC);

-- ----------------------------------------------------------------------------
-- operations
-- ----------------------------------------------------------------------------
CREATE TABLE public.operations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  bank_id             UUID NOT NULL REFERENCES public.banks(id) ON DELETE RESTRICT,
  origin_bank_id      UUID NOT NULL REFERENCES public.banks(id) ON DELETE RESTRICT,
  amount              NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  installments        INTEGER NOT NULL CHECK (installments > 0 AND installments <= 360),
  installment_amount  NUMERIC(12,2) NOT NULL CHECK (installment_amount > 0),
  payment_status      TEXT NOT NULL DEFAULT 'pendente'
                        CHECK (payment_status IN ('pendente', 'pago')),
  payment_date        DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  updated_by          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  CONSTRAINT chk_payment_date_when_pago
    CHECK (
      (payment_status = 'pago' AND payment_date IS NOT NULL)
      OR (payment_status = 'pendente')
    )
);

COMMENT ON TABLE public.operations IS 'Operações de portabilidade/empréstimo de um cliente.';

CREATE INDEX idx_operations_client_id ON public.operations (client_id);
CREATE INDEX idx_operations_bank_id ON public.operations (bank_id);
CREATE INDEX idx_operations_origin_bank_id ON public.operations (origin_bank_id);
CREATE INDEX idx_operations_payment_status ON public.operations (payment_status);
CREATE INDEX idx_operations_created_at ON public.operations (created_at DESC);

-- ----------------------------------------------------------------------------
-- observations
-- ----------------------------------------------------------------------------
CREATE TABLE public.observations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (length(trim(content)) > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  updated_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.observations IS 'Observações cronológicas sobre um cliente (1:N).';

CREATE INDEX idx_observations_client_created
  ON public.observations (client_id, created_at DESC);
