-- ============================================================================
-- Migration 002: Row Level Security
-- ============================================================================
-- Estratégia: usuários autenticados têm acesso a todas as tabelas operacionais.
-- profiles: usuário só vê e edita o próprio.
-- banks: somente leitura para autenticados.
-- clients/operations/observations: SELECT/INSERT/UPDATE/DELETE para autenticados.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT/UPDATE por outros caminhos são feitos por trigger (service role bypassa RLS).

-- ----------------------------------------------------------------------------
-- banks
-- ----------------------------------------------------------------------------
ALTER TABLE public.banks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "banks_select_authenticated" ON public.banks
  FOR SELECT TO authenticated
  USING (active = true);

-- INSERT/UPDATE/DELETE em banks é administrativo (via SQL), não pela aplicação.

-- ----------------------------------------------------------------------------
-- clients
-- ----------------------------------------------------------------------------
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select_authenticated" ON public.clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "clients_insert_authenticated" ON public.clients
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "clients_update_authenticated" ON public.clients
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "clients_delete_authenticated" ON public.clients
  FOR DELETE TO authenticated
  USING (true);

-- ----------------------------------------------------------------------------
-- operations
-- ----------------------------------------------------------------------------
ALTER TABLE public.operations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "operations_select_authenticated" ON public.operations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "operations_insert_authenticated" ON public.operations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "operations_update_authenticated" ON public.operations
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "operations_delete_authenticated" ON public.operations
  FOR DELETE TO authenticated
  USING (true);

-- ----------------------------------------------------------------------------
-- observations
-- ----------------------------------------------------------------------------
ALTER TABLE public.observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "observations_select_authenticated" ON public.observations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "observations_insert_authenticated" ON public.observations
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "observations_update_authenticated" ON public.observations
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "observations_delete_authenticated" ON public.observations
  FOR DELETE TO authenticated
  USING (true);
