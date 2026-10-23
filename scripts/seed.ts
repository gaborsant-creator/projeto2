import { seedDatabaseIfNeeded } from '../src/services/seed';

console.log('🍕 Iniciando verificação e seed no Supabase...\n');

seedDatabaseIfNeeded()
  .then((res) => {
    console.log('\n--- RESUMO DO SEED ---');
    console.log(`Categorias: ${res.categoriesCount} (${res.categoriesSeeded ? 'Novas inseridas' : 'Existentes'})`);
    console.log(`Produtos:   ${res.productsCount} (${res.productsSeeded ? 'Novos inseridos' : 'Existentes'})`);
    console.log('Status:    ', res.message);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Falha fatal no script de seed:', err);
    process.exit(1);
  });
