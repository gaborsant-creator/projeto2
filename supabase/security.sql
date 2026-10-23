-- ============================================================================
-- SEGURANÇA DO BANCO (RLS) - Cantinho das Pizzas / Frutella
-- Execute no Supabase: SQL Editor > New query > colar > Run
--
-- Resultado:
--   * Catálogo (categorias, produtos, cupons, configurações): leitura pública,
--     escrita SOMENTE por administrador autenticado.
--   * Pedidos: qualquer cliente pode CRIAR (somente com status 'novo');
--     apenas o admin lê, altera e exclui.
--   * Clientes: cadastro público (insert); dados pessoais só o admin lê/edita/exclui.
--
-- "Administrador" = usuário do Supabase Auth com app_metadata.role = 'admin'
-- (app_metadata só pode ser alterado pelo servidor, nunca pelo próprio usuário).
-- ============================================================================

-- 1) Remove TODAS as políticas atuais do schema public
do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies where schemaname = 'public'
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

alter table public.categorias enable row level security;
alter table public.produtos enable row level security;
alter table public.configuracoes_da_loja enable row level security;
alter table public.cupons enable row level security;
alter table public.pedidos enable row level security;
alter table public.clientes enable row level security;

-- 2) Catálogo, configurações e cupons: leitura pública, escrita só admin
create policy "leitura publica" on public.categorias for select to anon, authenticated using (true);
create policy "admin escreve" on public.categorias for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "leitura publica" on public.produtos for select to anon, authenticated using (true);
create policy "admin escreve" on public.produtos for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "leitura publica" on public.configuracoes_da_loja for select to anon, authenticated using (true);
create policy "admin escreve" on public.configuracoes_da_loja for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "leitura publica" on public.cupons for select to anon, authenticated using (true);
create policy "admin escreve" on public.cupons for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 3) Pedidos: cliente cria (status 'novo'); só admin lê/edita/exclui
create policy "cliente cria pedido" on public.pedidos for insert to anon, authenticated
  with check (status = 'novo');
create policy "admin le pedidos" on public.pedidos for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admin atualiza pedidos" on public.pedidos for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admin exclui pedidos" on public.pedidos for delete to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 4) Clientes: cadastro público; dados pessoais só admin
create policy "cadastro publico" on public.clientes for insert to anon, authenticated
  with check (true);
create policy "admin le clientes" on public.clientes for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admin atualiza clientes" on public.clientes for update to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "admin exclui clientes" on public.clientes for delete to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- 5) Defesa em profundidade: remove privilégios de tabela que o anônimo não precisa
revoke insert, update, delete on public.categorias, public.produtos, public.configuracoes_da_loja, public.cupons from anon;
revoke select, update, delete on public.pedidos, public.clientes from anon;

-- ============================================================================
-- REVERTER (apenas se precisar voltar ao estado aberto - NÃO recomendado):
--   grant insert, update, delete on public.categorias, public.produtos,
--     public.configuracoes_da_loja, public.cupons to anon;
--   grant select, update, delete on public.pedidos, public.clientes to anon;
--   e recriar as políticas públicas antigas.
-- ============================================================================
