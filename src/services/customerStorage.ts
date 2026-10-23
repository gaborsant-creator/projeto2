export interface RegisteredCustomer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  source: 'cadastro_site' | 'banner_site' | 'checkout_pedido';
  createdAt: string;
}

const STORAGE_KEY = 'frutella_clientes_cadastrados';

// Configuração opcional de Webhook de automação
const getEnvVar = (key: string): string => {
  try {
    return (import.meta as any).env?.[key] || '';
  } catch {
    return '';
  }
};

const ANTIGRAVITY_WEBHOOK_URL =
  getEnvVar('VITE_ANTIGRAVITY_WEBHOOK_URL') || getEnvVar('VITE_WEBHOOK_URL');

export const getStoredCustomers = (): RegisteredCustomer[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RegisteredCustomer[];
  } catch (err) {
    console.error('Erro ao ler clientes do armazenamento local:', err);
    return [];
  }
};

/**
 * Salva o cliente localmente no navegador
 */
export const saveCustomer = async (data: {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  source?: 'cadastro_site' | 'banner_site' | 'checkout_pedido';
}): Promise<RegisteredCustomer> => {
  const newCustomer: RegisteredCustomer = {
    id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: data.name.trim(),
    phone: data.phone.trim(),
    address: data.address?.trim() || '',
    notes: data.notes?.trim() || '',
    source: data.source || 'cadastro_site',
    createdAt: new Date().toISOString(),
  };

  // 1. Armazenamento local imediato (garantia de persistência)
  try {
    const existing = getStoredCustomers();
    const updated = [newCustomer, ...existing.filter((c) => c.phone !== newCustomer.phone)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('frutella:customer_registered', { detail: newCustomer }));
  } catch (err) {
    console.error('Erro ao salvar cliente localmente:', err);
  }

  // 2. Envio opcional para Webhook de automação se configurado
  if (ANTIGRAVITY_WEBHOOK_URL) {
    try {
      fetch(ANTIGRAVITY_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      }).catch((e) => console.warn('Webhook notice:', e));
    } catch (e) {
      console.warn('Erro no envio do webhook:', e);
    }
  }

  return newCustomer;
};

export const exportCustomersToCSV = (): void => {
  const list = getStoredCustomers();
  if (list.length === 0) {
    return;
  }

  const headers = ['ID', 'Nome', 'Telefone', 'Endereço', 'Observações', 'Origem', 'Data Cadastro'];
  const rows = list.map((c) => [
    c.id,
    `"${(c.name || '').replace(/"/g, '""')}"`,
    `"${(c.phone || '').replace(/"/g, '""')}"`,
    `"${(c.address || '').replace(/"/g, '""')}"`,
    `"${(c.notes || '').replace(/"/g, '""')}"`,
    c.source || 'cadastro_site',
    c.createdAt ? new Date(c.createdAt).toLocaleString('pt-BR') : '',
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `clientes_cantinho_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
