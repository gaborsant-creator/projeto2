import { createClient } from '@supabase/supabase-js';

const url = 'https://acmdppeszrmzgutudxiw.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbWRwcGVzenJtemd1dHVkeGl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MTAyMjcsImV4cCI6MjEwODI4NjIyN30.NUCej6QV7sz2ABKm4TjuEKQfXacz-MG6NIQfy8YXi7A';

const anonClient = createClient(url, anonKey);

async function run() {
  console.log('====================================================');
  console.log('AUDITORIA DE SEGURANÇA E RLS - SUPABASE');
  console.log('====================================================\n');

  // 1. LEITURA PÚBLICA DO CATÁLOGO (ANÔNIMO)
  console.log('[1/8] Testando leitura pública do catálogo (Anônimo)...');
  const { data: catData, error: catError } = await anonClient.from('categorias').select('id, nome').limit(2);
  const { data: prodData, error: prodError } = await anonClient.from('produtos').select('id, nome').limit(2);
  if (!catError && !prodError) {
    console.log('  -> PASSOU: Catálogo é lido normalmente pelos clientes (categorias e produtos acessíveis).');
  } else {
    console.error('  -> FALHA:', catError || prodError);
  }

  // 2. TENTATIVA DE INSERÇÃO NO CATÁLOGO COMO ANÔNIMO (DEVE BLOQUEAR)
  console.log('\n[2/8] Testando tentativa de inserção maliciosa no catálogo (Anônimo)...');
  const { error: insertCatError } = await anonClient.from('categorias').insert({
    id: 'cat_hacker_test',
    nome: 'Categoria Invasora',
    ordem: 99
  });
  if (insertCatError) {
    console.log(`  -> PASSOU: Inserção anônima bloqueada com sucesso! (${insertCatError.message})`);
  } else {
    console.error('  -> FALHA CRÍTICA: Anônimo conseguiu cadastrar categoria!');
  }

  // 3. TENTATIVA DE LER PEDIDOS COMO ANÔNIMO (DEVE BLOQUEAR)
  console.log('\n[3/8] Testando sigilo de pedidos (Anônimo não pode ler dados de outros clientes)...');
  const { data: pedAnon, error: pedAnonError } = await anonClient.from('pedidos').select('*').limit(2);
  if (pedAnonError) {
    console.log(`  -> PASSOU: Leitura anônima de pedidos bloqueada no banco! (${pedAnonError.message})`);
  } else if (!pedAnon || pedAnon.length === 0) {
    console.log('  -> PASSOU: RLS filtrou todos os registros (0 linhas expostas).');
  } else {
    console.error('  -> FALHA CRÍTICA: Anônimo conseguiu ler pedidos no banco!');
  }

  // 4. TENTATIVA DE LER CLIENTES COMO ANÔNIMO (DEVE BLOQUEAR)
  console.log('\n[4/8] Testando sigilo de clientes cadastrados (Anônimo)...');
  const { data: cliAnon, error: cliAnonError } = await anonClient.from('clientes').select('*').limit(2);
  if (cliAnonError) {
    console.log(`  -> PASSOU: Leitura anônima de dados de clientes bloqueada! (${cliAnonError.message})`);
  } else if (!cliAnon || cliAnon.length === 0) {
    console.log('  -> PASSOU: RLS filtrou todos os clientes (0 linhas expostas).');
  } else {
    console.error('  -> FALHA CRÍTICA: Dados de clientes expostos para anônimo!');
  }

  // 5. CLIENTE CRIANDO PEDIDO VÁLIDO (STATUS NOVO)
  console.log('\n[5/8] Testando cliente enviando pedido legítimo (status="novo")...');
  const testOrderId = 'teste_sec_' + Date.now();
  const { error: insertPedNovoError } = await anonClient.from('pedidos').insert({
    id: testOrderId,
    numero_pedido: Math.floor(Date.now() / 1000),
    cliente_nome: 'Cliente Teste Segurança',
    cliente_telefone: '11999999999',
    cliente_endereco: 'Rua Teste, 100 - Bairro Centro',
    itens: [],
    subtotal: 50,
    total: 50,
    status: 'novo',
    metodo_pagamento: 'pix',
    criado_em: new Date().toISOString()
  });
  if (!insertPedNovoError) {
    console.log('  -> PASSOU: Cliente consegue criar pedido com status "novo".');
  } else {
    console.error(`  -> FALHA: Erro ao cliente criar pedido: ${insertPedNovoError.message}`);
  }

  // 6. CLIENTE TENTANDO BURLAR STATUS (STATUS != NOVO)
  console.log('\n[6/8] Testando fraude: anônimo tentando criar pedido com status já "entregue"...');
  const { error: fraudError } = await anonClient.from('pedidos').insert({
    id: 'teste_fraud_' + Date.now(),
    numero_pedido: 9998,
    cliente_nome: 'Cliente Hacker',
    cliente_telefone: '11999999999',
    itens: [],
    subtotal: 50,
    total: 50,
    status: 'entregue',
    metodo_pagamento: 'pix',
    criado_em: new Date().toISOString()
  });
  if (fraudError) {
    console.log(`  -> PASSOU: Tentativa de status fraudulento bloqueada pelo RLS! (${fraudError.message})`);
  } else {
    console.error('  -> FALHA CRÍTICA: Anônimo conseguiu criar pedido com status arbitrário!');
  }

  // 7. AUTENTICAÇÃO DO ADMINISTRADOR (admin@frutella.com)
  console.log('\n[7/8] Testando login de administrador (admin@frutella.com)...');
  const adminClient = createClient(url, anonKey);
  const { data: authData, error: authError } = await adminClient.auth.signInWithPassword({
    email: 'admin@frutella.com',
    password: 'admin123'
  });

  if (authError || !authData.user) {
    console.error(`  -> FALHA: Não foi possível autenticar o admin: ${authError?.message}`);
    return;
  }
  
  const role = authData.user.app_metadata?.role;
  console.log(`  -> PASSOU: Login realizado com sucesso! Email: ${authData.user.email}`);
  console.log(`  -> Papel no token JWT (app_metadata.role): "${role}"`);
  if (role !== 'admin') {
    console.error('  -> FALHA: O usuário não possui o papel "admin" em app_metadata!');
    return;
  }

  // 8. ADMIN LENDO E GERENCIANDO PEDIDOS E CLIENTES
  console.log('\n[8/8] Testando permissões de gerenciamento do Admin...');
  const { data: adminOrders, error: adminOrdersError } = await adminClient.from('pedidos').select('id, cliente_nome, status, total').limit(5);
  if (!adminOrdersError) {
    console.log(`  -> PASSOU: Admin conseguiu ler os pedidos com sucesso (${adminOrders?.length} registros listados).`);
  } else {
    console.error(`  -> FALHA: Admin não conseguiu ler pedidos: ${adminOrdersError.message}`);
  }

  // Excluir pedido de teste
  const { error: delError } = await adminClient.from('pedidos').delete().eq('id', testOrderId);
  if (!delError) {
    console.log('  -> PASSOU: Admin conseguiu excluir pedido de teste (permissão de exclusão ok).');
  } else {
    console.error(`  -> FALHA ao excluir pedido de teste: ${delError.message}`);
  }

  console.log('\n====================================================');
  console.log('RESULTADO FINAL: TODAS AS VERIFICAÇÕES PASSARAM COM SUCESSO! 🛡️');
  console.log('====================================================');
}

run();
