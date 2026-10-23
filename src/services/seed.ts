import { CATEGORIES, MENU_PRODUCTS } from '../data/menuData';
import { supabase } from './supabase';

export interface SeedResult {
  categoriesSeeded: boolean;
  categoriesCount: number;
  productsSeeded: boolean;
  productsCount: number;
  message: string;
}

/**
 * Verifica se as tabelas 'categorias' e 'produtos' no Supabase estão vazias
 * e insere os dados iniciais de src/data/menuData.ts caso estejam.
 */
export async function seedDatabaseIfNeeded(): Promise<SeedResult> {
  const result: SeedResult = {
    categoriesSeeded: false,
    categoriesCount: 0,
    productsSeeded: false,
    productsCount: 0,
    message: '',
  };

  try {
    // 1. Verificar tabela 'categorias'
    const { count: catCount, error: catError } = await supabase
      .from('categorias')
      .select('*', { count: 'exact', head: true });

    if (catError) {
      console.warn('Aviso ao consultar tabela categorias:', catError.message);
    }

    if (catCount === 0 || catCount === null) {
      console.log('Tabela categorias vazia. Inserindo categorias iniciais...');
      const categoryRows = CATEGORIES.map((c, index) => ({
        id: c.id,
        nome: c.name,
        ordem: index + 1,
        ativo: true,
      }));

      const { data: insertedCats, error: insertCatErr } = await supabase
        .from('categorias')
        .upsert(categoryRows, { onConflict: 'id' })
        .select();

      if (insertCatErr) {
        console.error('Erro ao inserir categorias:', insertCatErr.message);
      } else {
        result.categoriesSeeded = true;
        result.categoriesCount = insertedCats?.length || categoryRows.length;
        console.log(`✅ ${result.categoriesCount} categorias inseridas com sucesso.`);
      }
    } else {
      result.categoriesCount = catCount;
      console.log(`ℹ️ Tabela categorias já possui ${catCount} registros. Pulando seed.`);
    }

    // 2. Verificar tabela 'produtos'
    const { count: prodCount, error: prodError } = await supabase
      .from('produtos')
      .select('*', { count: 'exact', head: true });

    if (prodError) {
      console.warn('Aviso ao consultar tabela produtos:', prodError.message);
    }

    if (prodCount === 0 || prodCount === null) {
      console.log('Tabela produtos vazia. Inserindo produtos iniciais...');
      const productRows = MENU_PRODUCTS.map((p, index) => ({
        id: p.id,
        categoria_id: p.category,
        nome: p.name,
        descricao: p.description || '',
        preco: p.price,
        imagem: p.image || '',
        ativo: p.active !== false,
        destaque: !!p.featured,
        is_combo: !!p.isCombo,
        ordem: index,
      }));

      const { data: insertedProds, error: insertProdErr } = await supabase
        .from('produtos')
        .upsert(productRows, { onConflict: 'id' })
        .select();

      if (insertProdErr) {
        console.error('Erro ao inserir produtos:', insertProdErr.message);
      } else {
        result.productsSeeded = true;
        result.productsCount = insertedProds?.length || productRows.length;
        console.log(`✅ ${result.productsCount} produtos inseridos com sucesso.`);
      }
    } else {
      result.productsCount = prodCount;
      console.log(`ℹ️ Tabela produtos já possui ${prodCount} registros. Pulando seed.`);
    }

    result.message = 'Verificação e seed concluídos com sucesso.';
  } catch (err: any) {
    console.error('Erro durante a execução do seed:', err);
    result.message = `Erro: ${err?.message || 'Falha no seed'}`;
  }

  return result;
}
