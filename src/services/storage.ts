// ============================================================================
// SERVIÇO DE ARMAZENAMENTO & SINCRONIZAÇÃO SUPABASE (CANTINHO DAS PIZZAS)
// Integração em tempo real com Supabase (PostgreSQL + Realtime WebSockets)
// com cache local otimista e compatibilidade total de assinaturas
// ============================================================================

import { MenuProduct, CategoryId } from '../types';
import { MENU_PRODUCTS } from '../data/menuData';
import { supabase, ADMIN_SESSION_ONLY_FLAG } from './supabase';
import { seedDatabaseIfNeeded } from './seed';

// ============================================================================
// TIPOS E MODELOS DE DADOS
// ============================================================================

export interface CategoryRecord {
  id: string;
  name: string;
  order_index: number;
  active: boolean;
}

export interface ProductRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image: string;
  active: boolean;
  is_combo?: boolean;
  featured?: boolean;
  order_index?: number;
}

export interface ProductOptionRecord {
  id: string;
  category_id?: string;
  type: 'size' | 'crust' | 'extra';
  name: string;
  price: number;
  order_index?: number;
  active: boolean;
}

export interface CustomerRecord {
  id: string;
  auth_user_id?: string;
  email?: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  total_orders: number;
  source: 'cadastro_site' | 'banner_site' | 'checkout_pedido';
  created_at: string;
  updated_at?: string;
}

export interface CouponRecord {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'delivery';
  discount_value: number;
  min_order_value?: number;
  active: boolean;
  badge?: string;
  expires_at?: string;
  created_at?: string;
}

export interface OrderItem {
  product_id?: string;
  name: string;
  quantity: number;
  size?: string;
  crust?: string;
  price: number;
  extras?: string[];
}

export interface OrderRecord {
  id: string;
  order_number: number;
  customer_id?: string;
  customer_user_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  coupon_code?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  status: 'novo' | 'preparando' | 'entrega' | 'concluido' | 'cancelado';
  payment_method: 'pix' | 'card' | 'cash';
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface StoreSettingsRecord {
  id: string;
  store_name: string;
  phone_whatsapp: string;
  delivery_fee: number;
  is_open: boolean;
  opening_hours: string;
  address_display?: string;
}

// ============================================================================
// CHAVES DE ARMAZENAMENTO LOCAL (CACHE OTIMISTA)
// ============================================================================

const STORAGE_KEYS = {
  CUSTOMER_AUTH: 'cantinho_customer_auth_session',
  REGISTERED_CUSTOMERS: 'cantinho_registered_customers_db',
  ORDERS: 'cantinho_orders_db',
  COUPONS: 'cantinho_active_coupons_db',
  PRODUCTS: 'cantinho_products_db',
  SETTINGS: 'cantinho_store_settings_db',
};

// Remove segredos legados (senha/sessão de admin guardadas em texto no navegador)
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('cantinho_admin_credentials_db');
    localStorage.removeItem('cantinho_admin_auth_session');
    sessionStorage.removeItem('cantinho_admin_auth_session');
  } catch {}
}

// ============================================================================
// CONVERSORES & MAPEAMENTO SUPABASE <-> MODELOS TS
// ============================================================================

const mapSupabaseProductToMenuProduct = (row: any): MenuProduct => ({
  id: row.id,
  name: row.nome || row.name || 'Pizza Especial',
  description: row.descricao || row.description || '',
  price: Number(row.preco ?? row.price ?? 0),
  image: row.imagem || row.image || '',
  category: (row.categoria_id || row.category_id || 'pizzas') as CategoryId,
  featured: !!(row.destaque ?? row.featured),
  isCombo: !!(row.is_combo ?? row.isCombo),
  active: (row.ativo ?? row.active) !== false,
});

const mapMenuProductToSupabase = (prod: MenuProduct) => ({
  id: prod.id,
  nome: prod.name,
  descricao: prod.description || '',
  preco: prod.price,
  imagem: prod.image || '',
  categoria_id: prod.category || 'pizzas',
  destaque: !!prod.featured,
  is_combo: !!prod.isCombo,
  ativo: prod.active !== false,
  atualizado_em: new Date().toISOString(),
});

const mapSupabaseOrderToRecord = (row: any): OrderRecord => ({
  id: row.id,
  order_number: Number(row.numero_pedido ?? row.order_number ?? 0),
  customer_id: row.cliente_id || row.customer_id || undefined,
  customer_user_id: row.cliente_auth_id || row.customer_user_id || undefined,
  customer_name: row.cliente_nome || row.customer_name || 'Cliente',
  customer_phone: row.cliente_telefone || row.customer_phone || '',
  customer_email: row.cliente_email || row.customer_email || '',
  customer_address: row.cliente_endereco || row.customer_address || '',
  coupon_code: row.cupom_codigo || row.coupon_code || '',
  items: Array.isArray(row.itens) ? row.itens : Array.isArray(row.items) ? row.items : [],
  subtotal: Number(row.subtotal || 0),
  delivery_fee: Number(row.taxa_entrega ?? row.delivery_fee ?? 0),
  discount: Number(row.desconto ?? row.discount ?? 0),
  total: Number(row.total || 0),
  status: (row.status || 'novo') as OrderRecord['status'],
  payment_method: (row.metodo_pagamento || row.payment_method || 'pix') as OrderRecord['payment_method'],
  notes: row.observacoes || row.notes || '',
  created_at: row.criado_em || row.created_at || new Date().toISOString(),
  updated_at: row.atualizado_em || row.updated_at,
});

const mapOrderRecordToSupabase = (order: OrderRecord) => ({
  id: order.id,
  numero_pedido: order.order_number,
  cliente_id: order.customer_id || null,
  cliente_auth_id:
    order.customer_user_id && /^[0-9a-f-]{36}$/i.test(order.customer_user_id)
      ? order.customer_user_id
      : null,
  cliente_nome: order.customer_name,
  cliente_telefone: order.customer_phone,
  cliente_email: order.customer_email || null,
  cliente_endereco: order.customer_address,
  cupom_codigo: order.coupon_code || null,
  itens: order.items || [],
  subtotal: order.subtotal || 0,
  taxa_entrega: order.delivery_fee || 0,
  desconto: order.discount || 0,
  total: order.total || 0,
  status: order.status || 'novo',
  metodo_pagamento: order.payment_method || 'pix',
  observacoes: order.notes || '',
  criado_em: order.created_at || new Date().toISOString(),
  atualizado_em: order.updated_at || new Date().toISOString(),
});

const mapSupabaseCustomerToRecord = (row: any): CustomerRecord => ({
  id: row.id,
  auth_user_id: row.auth_user_id || undefined,
  name: row.nome || row.name || '',
  phone: row.telefone || row.phone || '',
  email: row.email || '',
  address: row.endereco || row.address || '',
  notes: row.observacoes || row.notes || '',
  total_orders: Number(row.total_pedidos ?? row.total_orders ?? 0),
  source: (row.origem || row.source || 'cadastro_site') as CustomerRecord['source'],
  created_at: row.criado_em || row.created_at || new Date().toISOString(),
  updated_at: row.atualizado_em || row.updated_at,
});

const mapCustomerRecordToSupabase = (cust: CustomerRecord) => ({
  id: cust.id,
  auth_user_id:
    cust.auth_user_id && /^[0-9a-f-]{36}$/i.test(cust.auth_user_id)
      ? cust.auth_user_id
      : null,
  nome: cust.name,
  telefone: cust.phone,
  email: cust.email || null,
  endereco: cust.address || '',
  observacoes: cust.notes || '',
  total_pedidos: cust.total_orders || 0,
  origem: cust.source || 'cadastro_site',
  criado_em: cust.created_at || new Date().toISOString(),
  atualizado_em: cust.updated_at || new Date().toISOString(),
});

const mapSupabaseSettingsToRecord = (row: any): StoreSettingsRecord => ({
  id: row.id || 'configuracao_principal',
  store_name: row.nome_loja || row.store_name || 'Cantinho das Pizzas',
  phone_whatsapp: row.telefone_whatsapp || row.phone_whatsapp || '5511999999999',
  delivery_fee: Number(row.taxa_entrega ?? row.delivery_fee ?? 7.9),
  is_open: (row.aberto ?? row.is_open) !== false,
  opening_hours:
    row.horario_funcionamento || row.opening_hours || 'Terça a Domingo: 18h às 23h30',
  address_display:
    row.endereco_exibicao || row.address_display || 'Rua das Pizzas, 100 - Forno a Lenha',
});

const mapStoreSettingsToSupabase = (settings: StoreSettingsRecord) => ({
  id: 'configuracao_principal',
  nome_loja: settings.store_name,
  telefone_whatsapp: settings.phone_whatsapp,
  taxa_entrega: settings.delivery_fee,
  aberto: settings.is_open,
  horario_funcionamento: settings.opening_hours,
  endereco_exibicao: settings.address_display || '',
  atualizado_em: new Date().toISOString(),
});

// ============================================================================
// 1. GESTÃO DE PRODUTOS / PIZZAS DO CARDÁPIO (SUPABASE: produtos)
// ============================================================================

export const getStoredProducts = (): MenuProduct[] => {
  if (typeof window === 'undefined') return MENU_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch (e) {
    console.warn('Erro ao ler produtos do armazenamento local:', e);
  }

  const initial = MENU_PRODUCTS.map((p) => ({
    ...p,
    active: p.active !== false,
  }));
  saveStoredProducts(initial);
  return initial;
};

export const saveStoredProducts = (products: MenuProduct[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('cantinho:products_updated', { detail: products }));
  } catch (e) {
    console.error('Erro ao salvar produtos no localStorage:', e);
  }
};

/**
 * Sincroniza produtos do Supabase (tabela produtos) para o cache local
 */
export const syncProductsFromSupabase = async (): Promise<MenuProduct[]> => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('ordem', { ascending: true });

    if (error) {
      console.warn('Aviso ao buscar produtos do Supabase:', error.message);
      return getStoredProducts();
    }

    if (data && data.length > 0) {
      const mapped = data.map(mapSupabaseProductToMenuProduct);
      saveStoredProducts(mapped);
      return mapped;
    } else {
      // Se a tabela produtos no Supabase estiver vazia, popula com o cardápio padrão
      const defaults = MENU_PRODUCTS.map((p, idx) => ({
        id: p.id,
        categoria_id: p.category,
        nome: p.name,
        descricao: p.description || '',
        preco: p.price,
        imagem: p.image || '',
        ativo: p.active !== false,
        destaque: !!p.featured,
        is_combo: !!p.isCombo,
        ordem: idx,
      }));

      await supabase.from('produtos').upsert(defaults);
      return getStoredProducts();
    }
  } catch (err) {
    console.error('Erro ao sincronizar produtos do Supabase:', err);
    return getStoredProducts();
  }
};

export const updateProduct = (
  id: string,
  updates: Partial<MenuProduct>
): MenuProduct => {
  const current = getStoredProducts();
  let updatedProduct: MenuProduct | null = null;

  const next = current.map((p) => {
    if (p.id === id) {
      updatedProduct = { ...p, ...updates };
      return updatedProduct;
    }
    return p;
  });

  if (!updatedProduct) {
    throw new Error('Produto não encontrado para atualização.');
  }

  saveStoredProducts(next);

  // Persiste no Supabase de forma assíncrona
  const supabasePayload: any = {
    atualizado_em: new Date().toISOString(),
  };
  if (updates.name !== undefined) supabasePayload.nome = updates.name;
  if (updates.description !== undefined) supabasePayload.descricao = updates.description;
  if (updates.price !== undefined) supabasePayload.preco = updates.price;
  if (updates.image !== undefined) supabasePayload.imagem = updates.image;
  if (updates.category !== undefined) supabasePayload.categoria_id = updates.category;
  if (updates.featured !== undefined) supabasePayload.destaque = updates.featured;
  if (updates.isCombo !== undefined) supabasePayload.is_combo = updates.isCombo;
  if (updates.active !== undefined) supabasePayload.ativo = updates.active;

  supabase
    .from('produtos')
    .update(supabasePayload)
    .eq('id', id)
    .then(({ error }) => {
      if (error) console.error('Erro ao atualizar produto no Supabase:', error.message);
    });

  return updatedProduct;
};

export const createProduct = (
  productData: Omit<MenuProduct, 'id'>
): MenuProduct => {
  const current = getStoredProducts();
  const newProduct: MenuProduct = {
    ...productData,
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    active: productData.active !== false,
  };

  const next = [newProduct, ...current];
  saveStoredProducts(next);

  // Persiste no Supabase
  supabase
    .from('produtos')
    .insert([mapMenuProductToSupabase(newProduct)])
    .then(({ error }) => {
      if (error) console.error('Erro ao criar produto no Supabase:', error.message);
    });

  return newProduct;
};

export const deleteProduct = (id: string): void => {
  const current = getStoredProducts();
  const next = current.filter((p) => p.id !== id);
  saveStoredProducts(next);

  // Deleta no Supabase
  supabase
    .from('produtos')
    .delete()
    .eq('id', id)
    .then(({ error }) => {
      if (error) console.error('Erro ao deletar produto no Supabase:', error.message);
    });
};

export const toggleProductActive = (id: string): MenuProduct => {
  const current = getStoredProducts();
  const prod = current.find((p) => p.id === id);
  if (!prod) throw new Error('Produto não encontrado');
  return updateProduct(id, { active: !prod.active });
};

export const resetProductsToDefault = (): MenuProduct[] => {
  const initial = MENU_PRODUCTS.map((p, idx) => ({
    ...p,
    active: true,
  }));
  saveStoredProducts(initial);

  const supabaseRows = initial.map((p, idx) => ({
    id: p.id,
    categoria_id: p.category,
    nome: p.name,
    descricao: p.description || '',
    preco: p.price,
    imagem: p.image || '',
    ativo: true,
    destaque: !!p.featured,
    is_combo: !!p.isCombo,
    ordem: idx,
  }));

  supabase
    .from('produtos')
    .upsert(supabaseRows)
    .then(({ error }) => {
      if (error) console.error('Erro ao resetar produtos no Supabase:', error.message);
    });

  return initial;
};

// ============================================================================
// 2. CATÁLOGO DE CUPONS ATIVOS (SUPABASE: cupons)
// ============================================================================

export const DEFAULT_COUPONS: CouponRecord[] = [
  {
    id: 'coup-1',
    code: 'BEMVINDO10',
    title: '10% OFF no Pedido',
    description: 'Válido para novos membros do Clube Cantinho em qualquer pizza ou esfiha.',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_value: 40,
    active: true,
    badge: '1º Pedido',
  },
  {
    id: 'coup-2',
    code: 'PIZZA20',
    title: 'R$ 20,00 OFF Especial',
    description: 'Desconto em pedidos acima de R$ 80,00 para celebrar com a família.',
    discount_type: 'fixed',
    discount_value: 20,
    min_order_value: 80,
    active: true,
    badge: 'Super Desconto',
  },
  {
    id: 'coup-3',
    code: 'FRETEGRATIS',
    title: 'Taxa de Entrega Grátis',
    description: 'Economize R$ 7,90 na entrega expressa direto do nosso forno a lenha.',
    discount_type: 'delivery',
    discount_value: 7.9,
    min_order_value: 50,
    active: true,
    badge: 'Frete Free',
  },
  {
    id: 'coup-4',
    code: 'QUARTADOFORNO',
    title: '15% OFF Forno a Lenha',
    description: 'Desconto saboroso para pedir nas noites de terça a quinta-feira.',
    discount_type: 'percentage',
    discount_value: 15,
    min_order_value: 60,
    active: true,
    badge: 'Semana Especial',
  },
  {
    id: 'coup-5',
    code: 'DOCESABOR',
    title: 'R$ 10,00 OFF Doces & Esfihas',
    description: 'Adoce seu momento com desconto em pizzas doces de Nutella e sobremesas.',
    discount_type: 'fixed',
    discount_value: 10,
    min_order_value: 45,
    active: true,
    badge: 'Doce Momento',
  },
];

export const fetchActiveCoupons = async (): Promise<CouponRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('cupons')
      .select('*')
      .eq('ativo', true);

    if (!error && data && data.length > 0) {
      const mapped = data.map((c) => ({
        id: c.id,
        code: c.codigo || c.code,
        title: c.titulo || c.title,
        description: c.descricao || c.description || '',
        discount_type: (c.tipo_desconto || c.discount_type || 'percentage') as CouponRecord['discount_type'],
        discount_value: Number(c.valor_desconto ?? c.discount_value ?? 0),
        min_order_value: Number(c.valor_minimo_pedido ?? c.min_order_value ?? 0),
        active: c.ativo !== false,
        badge: c.badge || '',
        expires_at: c.expira_em || c.expires_at,
        created_at: c.criado_em || c.created_at,
      }));
      localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(mapped));
      return mapped;
    }
  } catch (e) {
    console.warn('Erro ao consultar cupons do Supabase:', e);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COUPONS);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch {}

  return DEFAULT_COUPONS;
};

export const calculateCouponDiscount = (
  coupon: CouponRecord,
  subtotal: number,
  deliveryFee: number
): { valid: boolean; discount: number; message?: string } => {
  if (coupon.min_order_value && subtotal < coupon.min_order_value) {
    return {
      valid: false,
      discount: 0,
      message: `Pedido mínimo para este cupom é de R$ ${coupon.min_order_value.toFixed(2)}.`,
    };
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = Math.round((subtotal * (coupon.discount_value / 100)) * 100) / 100;
  } else if (coupon.discount_type === 'fixed') {
    discount = Math.min(coupon.discount_value, subtotal);
  } else if (coupon.discount_type === 'delivery') {
    discount = deliveryFee;
  }

  return {
    valid: true,
    discount: Math.min(discount, subtotal + deliveryFee),
  };
};

// ============================================================================
// 3. CLIENTES & AUTENTICAÇÃO (SUPABASE: clientes)
// ============================================================================

interface StoredCustomerAccount {
  customer: CustomerRecord;
  passwordHash: string;
}

const getStoredCustomerAccounts = (): StoredCustomerAccount[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTERED_CUSTOMERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCustomerAccounts = (accounts: StoredCustomerAccount[]) => {
  localStorage.setItem(STORAGE_KEYS.REGISTERED_CUSTOMERS, JSON.stringify(accounts));
};

export interface CustomerConsumptionHabits {
  totalPizzas: number;
  favoritePizza: string;
  favoritePizzaCount: number;
  favoriteDayOfWeek: string;
  favoriteDayCount: number;
  totalSpent: number;
  totalOrders: number;
  lastOrderDate?: string;
  pizzaBreakdown: { name: string; count: number }[];
  dayBreakdown: { day: string; count: number }[];
}

export const getCustomerConsumptionHabits = (
  customerPhone?: string,
  customerUserId?: string
): CustomerConsumptionHabits => {
  const cleanPhone = (customerPhone || '').replace(/\D/g, '');
  const allOrders = getStoredOrders().filter((o) => o.status !== 'cancelado');

  const customerOrders = allOrders.filter((o) => {
    if (customerUserId && o.customer_user_id === customerUserId) return true;
    if (cleanPhone && (o.customer_phone || '').replace(/\D/g, '') === cleanPhone) return true;
    return false;
  });

  const pizzaCounts: Record<string, number> = {};
  const dayCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  let totalPizzas = 0;
  let totalSpent = 0;
  let lastOrderDate: string | undefined;

  const dayNames = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ];

  customerOrders.forEach((order) => {
    totalSpent += order.total || 0;
    if (order.created_at) {
      const dt = new Date(order.created_at);
      if (!isNaN(dt.getTime())) {
        const dayIdx = dt.getDay();
        dayCounts[dayIdx] = (dayCounts[dayIdx] || 0) + 1;
        if (!lastOrderDate || new Date(order.created_at) > new Date(lastOrderDate)) {
          lastOrderDate = order.created_at;
        }
      }
    }

    if (Array.isArray(order.items)) {
      order.items.forEach((item) => {
        const qty = item.quantity || 1;
        totalPizzas += qty;
        const itemName = item.name ? item.name.trim() : 'Pizza Artesanal';
        pizzaCounts[itemName] = (pizzaCounts[itemName] || 0) + qty;
      });
    }
  });

  let favoritePizza = 'Nenhuma ainda';
  let favoritePizzaCount = 0;
  Object.entries(pizzaCounts).forEach(([name, count]) => {
    if (count > favoritePizzaCount) {
      favoritePizza = name;
      favoritePizzaCount = count;
    }
  });

  let favoriteDayOfWeek = 'Sem pedidos ainda';
  let favoriteDayCount = 0;
  Object.entries(dayCounts).forEach(([idxStr, count]) => {
    if (count > favoriteDayCount) {
      favoriteDayOfWeek = dayNames[parseInt(idxStr, 10)];
      favoriteDayCount = count;
    }
  });

  const pizzaBreakdown = Object.entries(pizzaCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const dayBreakdown = Object.entries(dayCounts)
    .map(([idxStr, count]) => ({ day: dayNames[parseInt(idxStr, 10)], count }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  return {
    totalPizzas,
    favoritePizza,
    favoritePizzaCount,
    favoriteDayOfWeek,
    favoriteDayCount,
    totalSpent,
    totalOrders: customerOrders.length,
    lastOrderDate,
    pizzaBreakdown,
    dayBreakdown,
  };
};

export const fetchAllCustomers = (): CustomerRecord[] => {
  const accounts = getStoredCustomerAccounts();
  const list = accounts.map((a) => a.customer);

  try {
    const rawOther = localStorage.getItem('frutella_clientes_cadastrados');
    if (rawOther) {
      const otherList: any[] = JSON.parse(rawOther);
      otherList.forEach((oc) => {
        const cleanPhone = (oc.phone || '').replace(/\D/g, '');
        if (cleanPhone && !list.some((c) => c.phone.replace(/\D/g, '') === cleanPhone)) {
          list.push({
            id: oc.id || `cust_${Date.now()}`,
            name: oc.name || '',
            phone: oc.phone || '',
            address: oc.address || '',
            notes: oc.notes || '',
            total_orders: 1,
            source: oc.source || 'checkout_pedido',
            created_at: oc.createdAt || new Date().toISOString(),
          });
        }
      });
    }
  } catch (e) {
    console.warn('Erro ao ler clientes adicionais:', e);
  }

  try {
    const orders = getStoredOrders();
    orders.forEach((ord) => {
      const cleanPhone = (ord.customer_phone || '').replace(/\D/g, '');
      if (cleanPhone && !list.some((c) => c.phone.replace(/\D/g, '') === cleanPhone)) {
        list.push({
          id: `cust_ord_${ord.id}`,
          auth_user_id: ord.customer_user_id,
          name: ord.customer_name || 'Cliente',
          phone: ord.customer_phone || '',
          email: ord.customer_email || '',
          address: ord.customer_address || '',
          notes: ord.notes || '',
          total_orders: 1,
          source: 'checkout_pedido',
          created_at: ord.created_at || new Date().toISOString(),
        });
      }
    });
  } catch (e) {
    console.warn('Erro ao ler clientes dos pedidos:', e);
  }

  // Dispara sincronização em segundo plano com o Supabase
  syncCustomersFromSupabase();

  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const syncCustomersFromSupabase = async (): Promise<CustomerRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('criado_em', { ascending: false });

    if (!error && data && data.length > 0) {
      const mapped = data.map(mapSupabaseCustomerToRecord);
      const accounts = getStoredCustomerAccounts();

      const mergedAccounts = [...accounts];
      mapped.forEach((c) => {
        const idx = mergedAccounts.findIndex(
          (a) => a.customer.id === c.id || a.customer.phone.replace(/\D/g, '') === c.phone.replace(/\D/g, '')
        );
        if (idx >= 0) {
          mergedAccounts[idx].customer = { ...mergedAccounts[idx].customer, ...c };
        } else {
          mergedAccounts.push({ customer: c, passwordHash: '123456' });
        }
      });

      saveCustomerAccounts(mergedAccounts);
      return mapped;
    }
  } catch (err) {
    console.warn('Aviso ao sincronizar clientes do Supabase:', err);
  }
  return [];
};

export const saveCustomerAdmin = (
  data: Partial<CustomerRecord> & { name: string; phone: string }
): CustomerRecord => {
  const cleanPhone = data.phone.replace(/\D/g, '');
  const accounts = getStoredCustomerAccounts();
  const existing = accounts.find((a) => a.customer.phone.replace(/\D/g, '') === cleanPhone);

  const customer: CustomerRecord = {
    id: existing ? existing.customer.id : `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    auth_user_id: existing ? existing.customer.auth_user_id : `cust_${Date.now()}`,
    email: data.email || existing?.customer.email || '',
    name: data.name.trim(),
    phone: data.phone.trim(),
    address: data.address?.trim() || existing?.customer.address || '',
    notes: data.notes?.trim() || existing?.customer.notes || '',
    total_orders: data.total_orders !== undefined ? data.total_orders : existing?.customer.total_orders || 0,
    source: data.source || existing?.customer.source || 'cadastro_site',
    created_at: existing ? existing.customer.created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const nextAccounts = existing
    ? accounts.map((a) => (a.customer.phone.replace(/\D/g, '') === cleanPhone ? { ...a, customer } : a))
    : [...accounts, { customer, passwordHash: '123456' }];

  saveCustomerAccounts(nextAccounts);
  window.dispatchEvent(new CustomEvent('cantinho:customer_updated', { detail: customer }));

  // Persiste no Supabase
  supabase
    .from('clientes')
    .upsert([mapCustomerRecordToSupabase(customer)])
    .then(({ error }) => {
      if (error) console.error('Erro ao salvar cliente no Supabase:', error.message);
    });

  return customer;
};

export const deleteCustomerAdmin = (id: string): void => {
  const accounts = getStoredCustomerAccounts();
  const next = accounts.filter((a) => a.customer.id !== id && a.customer.auth_user_id !== id);
  saveCustomerAccounts(next);

  // Deleta no Supabase
  supabase
    .from('clientes')
    .delete()
    .eq('id', id)
    .then(({ error }) => {
      if (error) console.error('Erro ao deletar cliente no Supabase:', error.message);
    });
};

export const signUpCustomer = async (data: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  notes?: string;
}): Promise<{ customer: CustomerRecord; session?: any }> => {
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanPhone = data.phone.replace(/\D/g, '');

  const accounts = getStoredCustomerAccounts();
  const existingByEmail = accounts.find((a) => a.customer.email?.toLowerCase() === cleanEmail);
  const existingByPhone = accounts.find((a) => a.customer.phone.replace(/\D/g, '') === cleanPhone);

  if (existingByEmail) {
    throw new Error('Já existe uma conta cadastrada com este e-mail. Faça login.');
  }

  const newId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const customer: CustomerRecord = {
    id: newId,
    auth_user_id: newId,
    email: cleanEmail,
    name: data.name.trim(),
    phone: data.phone.trim(),
    address: data.address?.trim() || '',
    notes: data.notes?.trim() || '',
    total_orders: 0,
    source: 'cadastro_site',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const newAccounts = existingByPhone
    ? accounts.map((a) => (a.customer.phone.replace(/\D/g, '') === cleanPhone ? { customer, passwordHash: data.password } : a))
    : [...accounts, { customer, passwordHash: data.password }];

  saveCustomerAccounts(newAccounts);

  localStorage.setItem(STORAGE_KEYS.CUSTOMER_AUTH, JSON.stringify(customer));
  window.dispatchEvent(new CustomEvent('cantinho:customer_logged_in', { detail: customer }));

  // Salva no Supabase
  try {
    await supabase.from('clientes').upsert([mapCustomerRecordToSupabase(customer)]);
  } catch (err) {
    console.warn('Aviso ao sincronizar novo cliente no Supabase:', err);
  }

  return { customer, session: { user: { id: customer.id, email: customer.email } } };
};

export const signInCustomer = async (identifier: string, password?: string): Promise<CustomerRecord> => {
  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanPhoneDigits = identifier.replace(/\D/g, '');

  const accounts = getStoredCustomerAccounts();
  let match = accounts.find(
    (a) =>
      a.customer.email?.toLowerCase() === cleanIdentifier ||
      (cleanPhoneDigits.length >= 8 && a.customer.phone.replace(/\D/g, '') === cleanPhoneDigits)
  );

  // Se não encontrar no cache local, tenta buscar no Supabase
  if (!match) {
    try {
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .or(`email.eq.${cleanIdentifier},telefone.ilike.%${cleanPhoneDigits}%`)
        .limit(1)
        .maybeSingle();

      if (data) {
        const found = mapSupabaseCustomerToRecord(data);
        match = { customer: found, passwordHash: password || '123456' };
        saveCustomerAccounts([...accounts, match]);
      }
    } catch {}
  }

  if (!match) {
    throw new Error('Nenhum cadastro encontrado com este e-mail ou telefone.');
  }

  if (password && match.passwordHash && match.passwordHash !== password) {
    throw new Error('Senha incorreta. Verifique e tente novamente.');
  }

  localStorage.setItem(STORAGE_KEYS.CUSTOMER_AUTH, JSON.stringify(match.customer));
  window.dispatchEvent(new CustomEvent('cantinho:customer_logged_in', { detail: match.customer }));

  return match.customer;
};

export const signOutCustomer = async (): Promise<void> => {
  localStorage.removeItem(STORAGE_KEYS.CUSTOMER_AUTH);
  window.dispatchEvent(new CustomEvent('cantinho:customer_logged_out'));
};

export const getCurrentCustomer = async (): Promise<CustomerRecord | null> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMER_AUTH);
    return raw ? (JSON.parse(raw) as CustomerRecord) : null;
  } catch {
    return null;
  }
};

export const updateCustomerProfile = async (
  customerId: string,
  updates: Partial<CustomerRecord>
): Promise<CustomerRecord> => {
  const accounts = getStoredCustomerAccounts();
  let updatedCustomer: CustomerRecord | null = null;

  const nextAccounts = accounts.map((acc) => {
    if (acc.customer.id === customerId || (acc.customer.auth_user_id && acc.customer.auth_user_id === customerId)) {
      updatedCustomer = {
        ...acc.customer,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return { ...acc, customer: updatedCustomer };
    }
    return acc;
  });

  if (!updatedCustomer) {
    const current = await getCurrentCustomer();
    if (current && (current.id === customerId || current.auth_user_id === customerId)) {
      updatedCustomer = { ...current, ...updates, updated_at: new Date().toISOString() };
    } else {
      throw new Error('Cliente não encontrado para atualização.');
    }
  }

  saveCustomerAccounts(nextAccounts);
  localStorage.setItem(STORAGE_KEYS.CUSTOMER_AUTH, JSON.stringify(updatedCustomer));
  window.dispatchEvent(new CustomEvent('cantinho:customer_updated', { detail: updatedCustomer }));

  // Atualiza no Supabase
  try {
    await supabase
      .from('clientes')
      .upsert([mapCustomerRecordToSupabase(updatedCustomer)]);
  } catch (err) {
    console.warn('Erro ao atualizar perfil do cliente no Supabase:', err);
  }

  return updatedCustomer;
};

// ============================================================================
// 4. PEDIDOS & SUPABASE REALTIME (SUPABASE: pedidos)
// ============================================================================

export const getStoredOrders = (): OrderRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const fetchAllOrders = (): OrderRecord[] => {
  // Dispara sincronização em segundo plano para manter atualizado sem travar a renderização inicial
  syncOrdersFromSupabase();

  return getStoredOrders().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const saveStoredOrders = (orders: OrderRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Erro ao salvar pedidos localmente:', e);
  }
};

export const syncOrdersFromSupabase = async (): Promise<OrderRecord[]> => {
  // Somente o admin lê todos os pedidos (RLS). Para clientes, mantém o cache local intacto.
  if (!getAdminSession()) return getStoredOrders();
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) {
      console.warn('Aviso ao sincronizar pedidos do Supabase:', error.message);
      return getStoredOrders();
    }

    if (data) {
      const mapped = data.map(mapSupabaseOrderToRecord);
      saveStoredOrders(mapped);
      return mapped;
    }
  } catch (err) {
    console.error('Erro ao sincronizar pedidos do Supabase:', err);
  }
  return getStoredOrders();
};

export const createOrder = async (
  orderData: Omit<OrderRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<OrderRecord> => {
  const orders = getStoredOrders();
  const nextOrderNumber =
    orders.length > 0 ? Math.max(...orders.map((o) => o.order_number || 0)) + 1 : 1001;

  const newOrder: OrderRecord = {
    ...orderData,
    id: `ped_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    order_number: orderData.order_number || nextOrderNumber,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  saveStoredOrders([newOrder, ...orders]);

  if (orderData.customer_phone) {
    const accounts = getStoredCustomerAccounts();
    const cleanPhone = orderData.customer_phone.replace(/\D/g, '');
    const updated = accounts.map((acc) => {
      if (acc.customer.phone.replace(/\D/g, '') === cleanPhone) {
        return {
          ...acc,
          customer: {
            ...acc.customer,
            total_orders: (acc.customer.total_orders || 0) + 1,
          },
        };
      }
      return acc;
    });
    saveCustomerAccounts(updated);
  }

  // Notifica cross-tab e local imediatamente com garantia total
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('cantinho_admin_orders_bus');
      bc.postMessage({ type: 'NEW_ORDER', order: newOrder });
      bc.close();
    }
  } catch {}

  window.dispatchEvent(new CustomEvent('cantinho:order_created', { detail: newOrder }));

  // Persiste no Supabase. O insert anônimo não pede retorno (RLS: só o admin lê pedidos).
  try {
    const payload = mapOrderRecordToSupabase(newOrder);
    const { error } = await supabase.from('pedidos').insert([payload]);

    if (error) {
      console.warn('Aviso ao inserir pedido no Supabase:', error.message);
    }
  } catch (err) {
    console.error('Erro ao conectar pedido com Supabase:', err);
  }

  return newOrder;
};

export const updateOrderStatus = (
  orderId: string,
  status: OrderRecord['status']
): OrderRecord | null => {
  const orders = getStoredOrders();
  let updatedOrder: OrderRecord | null = null;

  const next = orders.map((o) => {
    if (o.id === orderId) {
      updatedOrder = {
        ...o,
        status,
        updated_at: new Date().toISOString(),
      };
      return updatedOrder;
    }
    return o;
  });

  if (updatedOrder) {
    saveStoredOrders(next);

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('cantinho_admin_orders_bus');
        bc.postMessage({ type: 'UPDATE_ORDER', order: updatedOrder });
        bc.close();
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('cantinho:order_updated', { detail: updatedOrder }));

    // Atualiza no Supabase
    supabase
      .from('pedidos')
      .update({
        status,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', orderId)
      .then(({ error }) => {
        if (error) console.error('Erro ao atualizar status do pedido no Supabase:', error.message);
      });
  }
  return updatedOrder;
};

export const deleteOrder = (orderId: string): void => {
  const orders = getStoredOrders();
  const next = orders.filter((o) => o.id !== orderId);
  saveStoredOrders(next);

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('cantinho_admin_orders_bus');
      bc.postMessage({ type: 'DELETE_ORDER', orderId });
      bc.close();
    }
  } catch {}

  window.dispatchEvent(new CustomEvent('cantinho:order_deleted', { detail: orderId }));

  // Deleta no Supabase
  supabase
    .from('pedidos')
    .delete()
    .eq('id', orderId)
    .then(({ error }) => {
      if (error) console.error('Erro ao deletar pedido no Supabase:', error.message);
    });
};

export const clearAllOrders = (): void => {
  saveStoredOrders([]);
  window.dispatchEvent(new CustomEvent('cantinho:orders_cleared'));
};

export const fetchCustomerOrders = async (phone: string, userId?: string): Promise<OrderRecord[]> => {
  const cleanPhone = phone.replace(/\D/g, '');

  try {
    let query = supabase.from('pedidos').select('*');
    if (userId) {
      query = query.or(`cliente_auth_id.eq.${userId},cliente_telefone.ilike.%${cleanPhone}%`);
    } else {
      query = query.ilike('cliente_telefone', `%${cleanPhone}%`);
    }

    const { data, error } = await query.order('criado_em', { ascending: false });
    if (!error && data && data.length > 0) {
      return data.map(mapSupabaseOrderToRecord);
    }
  } catch (err) {
    console.warn('Aviso ao consultar pedidos do cliente no Supabase:', err);
  }

  const orders = getStoredOrders();
  return orders
    .filter((o) => {
      if (userId && o.customer_user_id === userId) return true;
      if (cleanPhone && o.customer_phone.replace(/\D/g, '') === cleanPhone) return true;
      return false;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

/**
 * Inscrição em tempo real com múltiplas camadas de garantia:
 * 1. WebSockets oficiais do Supabase Realtime (postgres_changes em pedidos)
 * 2. BroadcastChannel cross-tab instantâneo no mesmo navegador ('cantinho_admin_orders_bus')
 * 3. CustomEvents locais na mesma janela ('cantinho:order_created')
 * 4. Polling inteligente em background (a cada 4s) para sincronização e reconexão automática
 */
export const subscribeToOrders = (
  onInsert?: (order: OrderRecord) => void,
  onUpdate?: (order: OrderRecord) => void,
  onDelete?: (orderId: string) => void
): { unsubscribe: () => void } => {
  const knownOrderIds = new Set<string>(getStoredOrders().map((o) => o.id));

  const handleInsert = (order: OrderRecord) => {
    if (!order || !order.id) return;
    const isNew = !knownOrderIds.has(order.id);
    knownOrderIds.add(order.id);

    const current = getStoredOrders();
    if (!current.some((o) => o.id === order.id)) {
      saveStoredOrders([order, ...current]);
    }

    if (isNew && onInsert) {
      onInsert(order);
    }
  };

  const handleUpdate = (order: OrderRecord) => {
    if (!order || !order.id) return;
    knownOrderIds.add(order.id);
    const current = getStoredOrders();
    const next = current.map((o) => (o.id === order.id ? { ...o, ...order } : o));
    saveStoredOrders(next);
    if (onUpdate) onUpdate(order);
  };

  const handleDelete = (orderId: string) => {
    if (!orderId) return;
    knownOrderIds.delete(orderId);
    const current = getStoredOrders();
    const next = current.filter((o) => o.id !== orderId);
    saveStoredOrders(next);
    if (onDelete) onDelete(orderId);
  };

  // 1. Supabase Realtime WebSocket (canal com id único para evitar colisão no React StrictMode)
  const channelId = `admin-orders-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const channel = supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'pedidos' },
      (payload) => {
        if (payload.new) {
          handleInsert(mapSupabaseOrderToRecord(payload.new));
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'pedidos' },
      (payload) => {
        if (payload.new) {
          handleUpdate(mapSupabaseOrderToRecord(payload.new));
        }
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'pedidos' },
      (payload) => {
        if (payload.old && (payload.old as any).id) {
          handleDelete((payload.old as any).id);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        syncOrdersFromSupabase().then((orders) => {
          orders.forEach((o) => knownOrderIds.add(o.id));
        });
      }
    });

  // 2. BroadcastChannel para comunicação instantânea entre abas no mesmo navegador
  let bc: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel('cantinho_admin_orders_bus');
      bc.onmessage = (event) => {
        const data = event.data;
        if (!data) return;
        if (data.type === 'NEW_ORDER' && data.order) {
          handleInsert(data.order);
        } else if (data.type === 'UPDATE_ORDER' && data.order) {
          handleUpdate(data.order);
        } else if (data.type === 'DELETE_ORDER' && data.orderId) {
          handleDelete(data.orderId);
        }
      };
    } catch {}
  }

  // 3. CustomEvents locais na mesma janela
  const onLocalCreated = (e: any) => {
    if (e.detail) handleInsert(e.detail);
  };
  const onLocalUpdated = (e: any) => {
    if (e.detail) handleUpdate(e.detail);
  };
  const onLocalDeleted = (e: any) => {
    if (e.detail) handleDelete(e.detail);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('cantinho:order_created', onLocalCreated);
    window.addEventListener('cantinho:order_updated', onLocalUpdated);
    window.addEventListener('cantinho:order_deleted', onLocalDeleted);
  }

  // 4. Polling de sincronização em segundo plano a cada 4 segundos
  const pollInterval = setInterval(async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .order('criado_em', { ascending: false })
        .limit(30);

      if (!error && data) {
        const mappedOrders = data.map(mapSupabaseOrderToRecord);
        mappedOrders.forEach((order) => {
          if (!knownOrderIds.has(order.id)) {
            // Novo pedido detectado que ainda não estava na lista!
            handleInsert(order);
          }
        });
      }
    } catch {}
  }, 4000);

  return {
    unsubscribe: () => {
      clearInterval(pollInterval);
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('cantinho:order_created', onLocalCreated);
        window.removeEventListener('cantinho:order_updated', onLocalUpdated);
        window.removeEventListener('cantinho:order_deleted', onLocalDeleted);
      }
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.warn('Aviso ao cancelar canal realtime:', err);
      }
    },
  };
};

// ============================================================================
// 5. CONFIGURAÇÕES DA LOJA (SUPABASE: configurações_da_loja)
// ============================================================================

export const DEFAULT_STORE_SETTINGS: StoreSettingsRecord = {
  id: 'configuracao_principal',
  store_name: 'Cantinho das Pizzas',
  phone_whatsapp: '5511999999999',
  delivery_fee: 7.9,
  is_open: true,
  opening_hours: 'Terça a Domingo: 18h às 23h30',
  address_display: 'Rua das Pizzas, 100 - Forno a Lenha',
};

export const getStoreSettings = (): StoreSettingsRecord => {
  // Sincroniza em segundo plano
  syncSettingsFromSupabase();

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Erro ao ler configurações:', e);
  }
  return DEFAULT_STORE_SETTINGS;
};

export const syncSettingsFromSupabase = async (): Promise<StoreSettingsRecord> => {
  try {
    const { data, error } = await supabase
      .from('configuracoes_da_loja')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const mapped = mapSupabaseSettingsToRecord(data);
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(mapped));
      return mapped;
    }
  } catch (err) {
    console.warn('Aviso ao sincronizar configurações da loja do Supabase:', err);
  }
  return DEFAULT_STORE_SETTINGS;
};

export const updateStoreSettings = (
  settings: Partial<StoreSettingsRecord>
): StoreSettingsRecord => {
  const current = getStoreSettings();
  const next = { ...current, ...settings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(next));

  // Persiste no Supabase (tabela configuracoes_da_loja)
  supabase
    .from('configuracoes_da_loja')
    .upsert([mapStoreSettingsToSupabase(next)])
    .then(({ error }) => {
      if (error) console.error('Erro ao atualizar configurações no Supabase:', error.message);
    });

  return next;
};

// ============================================================================
// 6. AUTENTICAÇÃO E SESSÃO DO ADMINISTRADOR
// ============================================================================

export interface AdminSession {
  email: string;
  name: string;
  role: 'admin';
  loggedInAt: string;
}

export interface AdminCredentials {
  email: string;
  name: string;
}

const ADMIN_ROLE = 'admin';
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 60_000;
const LOGIN_ATTEMPTS_KEY = 'cantinho_admin_login_attempts';

const userToAdminSession = (user: any, loggedInAt?: string): AdminSession | null => {
  if (!user || user.app_metadata?.role !== ADMIN_ROLE) return null;
  return {
    email: user.email || '',
    name: user.user_metadata?.name || 'Administrador',
    role: 'admin',
    loggedInAt: loggedInAt || user.last_sign_in_at || new Date().toISOString(),
  };
};

/**
 * Leitura síncrona da sessão persistida pelo Supabase Auth (apenas para decidir
 * o que renderizar). A autorização real é feita pelo banco via RLS (JWT).
 */
export const getAdminSession = (): AdminSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    for (const store of [window.sessionStorage, window.localStorage]) {
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
          const parsed = JSON.parse(store.getItem(key) || 'null');
          const session = userToAdminSession(parsed?.user);
          if (session) return session;
        }
      }
    }
  } catch {
    return null;
  }
  return null;
};

/** Valida a sessão no servidor do Supabase (token válido e papel admin). */
export const verifyAdminSession = async (): Promise<AdminSession | null> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return userToAdminSession(data.user);
  } catch {
    return null;
  }
};

const readLoginAttempts = (): { count: number; lockedUntil: number } => {
  try {
    const raw = sessionStorage.getItem(LOGIN_ATTEMPTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { count: 0, lockedUntil: 0 };
};

export const loginAdmin = async (
  email: string,
  password: string,
  rememberMe: boolean = true
): Promise<AdminSession> => {
  const attempts = readLoginAttempts();
  if (attempts.lockedUntil > Date.now()) {
    const secs = Math.ceil((attempts.lockedUntil - Date.now()) / 1000);
    throw new Error(`Muitas tentativas. Aguarde ${secs}s para tentar novamente.`);
  }

  const registerFailure = () => {
    const count = attempts.count + 1;
    const lockedUntil = count >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOGIN_LOCK_MS : 0;
    sessionStorage.setItem(
      LOGIN_ATTEMPTS_KEY,
      JSON.stringify({ count: lockedUntil ? 0 : count, lockedUntil })
    );
  };

  // Define onde o token será guardado (lembrar neste navegador ou só nesta aba)
  if (rememberMe) {
    sessionStorage.removeItem(ADMIN_SESSION_ONLY_FLAG);
  } else {
    sessionStorage.setItem(ADMIN_SESSION_ONLY_FLAG, '1');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error || !data.user) {
    registerFailure();
    // Mensagem genérica: não revela se o e-mail existe
    throw new Error('E-mail ou senha incorretos.');
  }

  const session = userToAdminSession(data.user, new Date().toISOString());
  if (!session) {
    // Usuário autenticado, mas sem permissão de administrador
    await supabase.auth.signOut();
    registerFailure();
    throw new Error('Esta conta não tem permissão de administrador.');
  }

  sessionStorage.removeItem(LOGIN_ATTEMPTS_KEY);
  window.dispatchEvent(new CustomEvent('cantinho:admin_logged_in', { detail: session }));
  return session;
};

export const logoutAdmin = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.warn('Erro ao encerrar sessão do admin:', e);
  }
  sessionStorage.removeItem(ADMIN_SESSION_ONLY_FLAG);
  window.dispatchEvent(new CustomEvent('cantinho:admin_logged_out'));
};

/** Atualiza nome e/ou senha do admin logado (Supabase Auth). */
export const updateAdminProfile = async (updates: {
  name?: string;
  password?: string;
}): Promise<AdminSession> => {
  const payload: { password?: string; data?: Record<string, string> } = {};
  if (updates.password) payload.password = updates.password;
  if (updates.name) payload.data = { name: updates.name };

  const { data, error } = await supabase.auth.updateUser(payload);
  if (error || !data.user) {
    throw new Error(error?.message || 'Não foi possível atualizar as credenciais.');
  }
  const session = userToAdminSession(data.user);
  if (!session) throw new Error('Sessão de administrador inválida.');
  return session;
};

// Se a sessão for encerrada/expirar em qualquer aba, avisa o painel
if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      window.dispatchEvent(new CustomEvent('cantinho:admin_logged_out'));
    }
  });
}

// ============================================================================
// INICIALIZAÇÃO AUTOMÁTICA EM SEGUNDO PLANO NO BROWSER
// ============================================================================

if (typeof window !== 'undefined') {
  // Dispara verificação de seed e sincronização com o Supabase na carga do módulo
  setTimeout(async () => {
    try {
      await seedDatabaseIfNeeded();
    } catch {}
    syncProductsFromSupabase();
    syncSettingsFromSupabase();
  }, 100);
}
