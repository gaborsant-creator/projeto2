import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  Bike,
  AlertCircle,
  Plus,
  Search,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Copy,
  Check,
  RefreshCw,
  Eye,
  MapPin,
  Phone,
  BellRing,
  PieChart,
  ArrowLeft,
  XCircle,
  Download,
  Edit2,
  Trash2,
  Flame,
  CheckCircle,
  Power,
  SlidersHorizontal,
  X,
  FileText,
  LogOut,
  ShieldCheck,
  KeyRound,
  UserCheck,
  Calendar,
  Award,
  Sparkles,
  Moon,
  Sun,
  Upload,
  Camera,
  Image as ImageIcon,
  Loader2,
  Volume2,
  Layers,
} from 'lucide-react';
import {
  processAndUploadProductImage,
  downloadImage,
} from '../../services/imageUpload';
import {
  OrderRecord,
  CustomerRecord,
  CategoryRecord,
  getStoredProducts,
  saveStoredProducts,
  updateProduct,
  createProduct,
  deleteProduct,
  toggleProductActive,
  resetProductsToDefault,
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
  subscribeToOrders,
  fetchAllCustomers,
  saveCustomerAdmin,
  deleteCustomerAdmin,
  getStoreSettings,
  updateStoreSettings,
  StoreSettingsRecord,
  getAdminSession,
  logoutAdmin,
  AdminSession,
  AdminCredentials,
  updateAdminProfile,
  verifyAdminSession,
  getCustomerConsumptionHabits,
  CustomerConsumptionHabits,
  resolveProductImage,
  getStoredCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  syncCategoriesFromSupabase,
} from '../../services/storage';
import { MenuProduct, CategoryId } from '../../types';
import { CATEGORIES } from '../../data/menuData';
import { AdminLogin } from './AdminLogin';
import { playOrderNotificationSound, unlockAudio } from '../../services/sound';
import { CategoryIcon, CATEGORY_ICON_OPTIONS } from '../CategoryNav';

interface AdminDashboardProps {
  onBackToMenu: () => void;
}

const formatCurrency = (val: number): string => {
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToMenu }) => {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => getAdminSession());
  const [adminCreds, setAdminCreds] = useState<AdminCredentials>(() => {
    const s = getAdminSession();
    return { email: s?.email || '', name: s?.name || '' };
  });
  const [adminCredsForm, setAdminCredsForm] = useState({
    name: adminCreds.name || '',
    email: adminCreds.email || '',
    password: '',
  });
  const [adminCredsSuccessMsg, setAdminCredsSuccessMsg] = useState(false);
  const [testedSound, setTestedSound] = useState(false);

  const handleTestSound = async () => {
    await unlockAudio();
    await playOrderNotificationSound();
    setTestedSound(true);
    setTimeout(() => setTestedSound(false), 2000);
  };

  const [activeTab, setActiveTab] = useState<'orders' | 'pizzas' | 'categories' | 'customers' | 'settings'>('orders');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>(() => getStoredCategories());
  const [storeSettings, setStoreSettings] = useState<StoreSettingsRecord>(getStoreSettings());

  const [statusFilter, setStatusFilter] = useState<'all' | 'novo' | 'preparando' | 'entrega' | 'concluido' | 'cancelado'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [hasNewOrderAlert, setHasNewOrderAlert] = useState(false);

  // Modo Dark do Painel Administrativo
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cantinho_admin_theme');
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('cantinho_admin_theme', next ? 'dark' : 'light');
      } catch (e) {
        console.error('Erro ao salvar preferência de tema', e);
      }
      return next;
    });
  };

  // Estados de Edição/Criação de Pizza
  const [editingProduct, setEditingProduct] = useState<MenuProduct | null>(null);
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productForm, setProductForm] = useState<{
    name: string;
    description: string;
    price: string;
    category: CategoryId;
    image: string;
    featured: boolean;
    isCombo: boolean;
  }>({
    name: '',
    description: '',
    price: '',
    category: 'pizzas',
    image: '',
    featured: false,
    isCombo: false,
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadSuccess, setImageUploadSuccess] = useState<string | null>(null);
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
  const [isDragOverImage, setIsDragOverImage] = useState(false);
  const productImageFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Estados de Cadastro de Clientes
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerForm, setCustomerForm] = useState<{
    name: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
  }>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [selectedCustomerForHabits, setSelectedCustomerForHabits] = useState<CustomerRecord | null>(null);

  // Estados de Gerenciamento de Categorias
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    id: string;
    name: string;
    icon: string;
    order_index: number;
    active: boolean;
  }>({
    id: '',
    name: '',
    icon: 'pizza',
    order_index: 0,
    active: true,
  });

  // Carrega dados iniciais
  const refreshData = () => {
    setOrders(fetchAllOrders());
    setCustomers(fetchAllCustomers());
    setProducts(getStoredProducts());
    setCategories(getStoredCategories());
    setStoreSettings(getStoreSettings());
  };

  const selectedOrderRef = React.useRef<OrderRecord | null>(selectedOrder);
  useEffect(() => {
    selectedOrderRef.current = selectedOrder;
  }, [selectedOrder]);

  useEffect(() => {
    if (!adminSession) return;
    refreshData();

    // Inscrição oficial Realtime do Supabase: canal 'admin-orders'
    const sub = subscribeToOrders(
      (newOrder) => {
        setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
        setHasNewOrderAlert(true);
        playOrderNotificationSound();
      },
      (updatedOrder) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
        );
        if (selectedOrderRef.current && selectedOrderRef.current.id === updatedOrder.id) {
          setSelectedOrder(updatedOrder);
        }
      },
      (deletedId) => {
        setOrders((prev) => prev.filter((o) => o.id !== deletedId));
        if (selectedOrderRef.current && selectedOrderRef.current.id === deletedId) {
          setSelectedOrder(null);
        }
      }
    );

    const handleProductsUpdated = (e: any) => {
      if (e.detail) setProducts(e.detail);
    };
    const handleCategoriesUpdated = (e: any) => {
      if (e.detail) setCategories(e.detail);
      else setCategories(getStoredCategories());
    };
    const handleCustomerUpdated = () => {
      setCustomers(fetchAllCustomers());
    };

    window.addEventListener('cantinho:products_updated', handleProductsUpdated);
    window.addEventListener('cantinho:categories_updated', handleCategoriesUpdated);
    window.addEventListener('cantinho:customer_updated', handleCustomerUpdated);
    window.addEventListener('frutella:customer_registered', handleCustomerUpdated);

    return () => {
      sub.unsubscribe();
      window.removeEventListener('cantinho:products_updated', handleProductsUpdated);
      window.removeEventListener('cantinho:categories_updated', handleCategoriesUpdated);
      window.removeEventListener('cantinho:customer_updated', handleCustomerUpdated);
      window.removeEventListener('frutella:customer_registered', handleCustomerUpdated);
    };
  }, [adminSession]);

  // Valida a sessão no servidor ao abrir o painel e reage a logout/expiração
  useEffect(() => {
    let cancelled = false;
    if (getAdminSession()) {
      verifyAdminSession().then((valid) => {
        if (cancelled) return;
        if (!valid) {
          logoutAdmin();
          setAdminSession(null);
        } else {
          setAdminCreds({ email: valid.email, name: valid.name });
        }
      });
    }
    const onLoggedOut = () => setAdminSession(null);
    window.addEventListener('cantinho:admin_logged_out', onLoggedOut);
    return () => {
      cancelled = true;
      window.removeEventListener('cantinho:admin_logged_out', onLoggedOut);
    };
  }, []);

  // Estatísticas calculadas
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter((o) => (o.created_at || '').startsWith(todayStr));
    const activeOrders = orders.filter((o) => o.status === 'novo' || o.status === 'preparando' || o.status === 'entrega');
    const newCount = orders.filter((o) => o.status === 'novo').length;
    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelado')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalOrders: orders.length,
      todayOrdersCount: todayOrders.length,
      activeOrdersCount: activeOrders.length,
      newOrdersCount: newCount,
      totalRevenue,
      totalCustomers: customers.length,
      activeProductsCount: products.filter((p) => p.active !== false).length,
    };
  }, [orders, customers, products]);

  // Pedidos filtrados
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (o.customer_name || '').toLowerCase().includes(q);
        const matchPhone = (o.customer_phone || '').includes(q);
        const matchNumber = String(o.order_number).includes(q);
        const matchAddress = (o.customer_address || '').toLowerCase().includes(q);
        return matchName || matchPhone || matchNumber || matchAddress;
      }
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Produtos / Pizzas filtrados
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
      if (searchQuery.trim() && activeTab === 'pizzas') {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, productCategoryFilter, searchQuery, activeTab]);

  // Clientes filtrados
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!customerSearch.trim()) return true;
      const q = customerSearch.toLowerCase();
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q)
      );
    });
  }, [customers, customerSearch]);

  // Ações de Pedido
  const handleStatusChange = (orderId: string, nextStatus: OrderRecord['status']) => {
    const updated = updateOrderStatus(orderId, nextStatus);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Tem certeza que deseja excluir permanentemente este pedido?')) {
      deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    }
  };

  // Ações de Produtos / Pizzas
  const handleOpenEditProduct = (prod: MenuProduct) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price.toString(),
      category: prod.category,
      image: prod.image,
      featured: !!prod.featured,
      isCombo: !!prod.isCombo,
    });
    setImageUploadSuccess(null);
    setIsUploadingImage(false);
    setImageInputMode('upload');
  };

  const handleOpenNewProduct = () => {
    setIsNewProductModalOpen(true);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: 'pizzas',
      image: products[0]?.image || '',
      featured: false,
      isCombo: false,
    });
    setImageUploadSuccess(null);
    setIsUploadingImage(false);
    setImageInputMode('upload');
  };

  const processSelectedProductImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, escolha um arquivo de imagem válido (JPG, PNG, WEBP, etc).');
      return;
    }
    try {
      setIsUploadingImage(true);
      const res = await processAndUploadProductImage(file, productForm.name || 'pizza');
      setProductForm((prev) => ({ ...prev, image: res.url }));
      setImageUploadSuccess(`Foto atualizada com sucesso (${res.sizeKb} KB)`);
      setTimeout(() => setImageUploadSuccess(null), 4500);
    } catch (err: any) {
      console.error('Erro ao processar imagem:', err);
      alert('Não foi possível carregar a imagem selecionada: ' + (err?.message || 'Tente novamente.'));
    } finally {
      setIsUploadingImage(false);
      if (productImageFileInputRef.current) {
        productImageFileInputRef.current.value = '';
      }
    }
  };

  const handleProductImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedProductImageFile(file);
    }
  };

  const handleProductImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedProductImageFile(file);
    }
  };

  const handleExportCurrentImage = () => {
    if (!productForm.image) {
      alert('Nenhuma foto disponível para exportar.');
      return;
    }
    const cleanName = (productForm.name || 'pizza')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    downloadImage(productForm.image, `${cleanName}-foto.jpg`);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(productForm.price.replace(',', '.'));
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Por favor insira um preço válido maior que zero.');
      return;
    }
    if (!productForm.name.trim()) {
      alert('O nome do produto é obrigatório.');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: priceNum,
        category: productForm.category,
        image: productForm.image || editingProduct.image,
        featured: productForm.featured,
        isCombo: productForm.isCombo,
      });
      setEditingProduct(null);
    } else {
      createProduct({
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: priceNum,
        category: productForm.category,
        image: productForm.image || products[0]?.image || '',
        featured: productForm.featured,
        isCombo: productForm.isCombo,
        active: true,
      });
      setIsNewProductModalOpen(false);
    }
    setProducts(getStoredProducts());
  };

  const handleToggleProduct = (id: string) => {
    toggleProductActive(id);
    setProducts(getStoredProducts());
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir "${name}" do cardápio?`)) {
      deleteProduct(id);
      setProducts(getStoredProducts());
    }
  };

  const handleResetProducts = () => {
    if (confirm('Deseja restaurar todas as pizzas e produtos originais do cardápio?')) {
      const reset = resetProductsToDefault();
      setProducts(reset);
    }
  };

  // Ações de Categorias
  const handleOpenNewCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      id: '',
      name: '',
      icon: 'pizza',
      order_index: categories.length + 1,
      active: true,
    });
    setCategoryFormError(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryRecord) => {
    setEditingCategory(cat);
    setCategoryForm({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || 'pizza',
      order_index: cat.order_index ?? 0,
      active: cat.active !== false,
    });
    setCategoryFormError(null);
    setIsCategoryModalOpen(true);
  };

  const handleToggleCategoryActive = async (cat: CategoryRecord) => {
    try {
      const updated = await updateCategory(cat.id, { active: !cat.active });
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)));
    } catch (err: any) {
      alert(err?.message || 'Erro ao alterar status da categoria');
    }
  };

  const handleDeleteCategory = async (cat: CategoryRecord) => {
    const linkedCount = products.filter((p) => p.category === cat.id).length;
    const msg =
      linkedCount > 0
        ? `A categoria "${cat.name}" possui ${linkedCount} item(ns) vinculado(s) no cardápio.\n\nTem certeza que deseja excluí-la? Os produtos continuarão no sistema, mas você precisará reatribuir a categoria deles.`
        : `Deseja realmente excluir a categoria "${cat.name}"?`;
    if (!confirm(msg)) return;

    try {
      await deleteCategory(cat.id);
      setCategories((prev) => prev.filter((c) => c.id !== cat.id));
    } catch (err: any) {
      alert(err?.message || 'Erro ao excluir categoria');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryFormError(null);
    const nameTrim = categoryForm.name.trim();
    if (!nameTrim) {
      setCategoryFormError('Informe o nome da categoria.');
      return;
    }

    setIsSavingCategory(true);
    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, {
          name: nameTrim,
          icon: categoryForm.icon,
          order_index: Number(categoryForm.order_index) || 0,
          active: categoryForm.active,
        });
        setCategories((prev) => prev.map((c) => (c.id === editingCategory.id ? updated : c)));
      } else {
        let idSlug = categoryForm.id.trim().toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        if (!idSlug) {
          idSlug = nameTrim.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        }
        if (!idSlug) idSlug = `cat-${Date.now()}`;

        if (categories.some((c) => c.id === idSlug)) {
          setCategoryFormError(`Já existe uma categoria com o identificador "${idSlug}". Escolha outro nome ou altere o ID.`);
          setIsSavingCategory(false);
          return;
        }

        const created = await createCategory({
          id: idSlug,
          name: nameTrim,
          icon: categoryForm.icon,
          order_index: Number(categoryForm.order_index) || 0,
          active: categoryForm.active,
        });
        setCategories((prev) => [...prev, created]);
      }
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      setCategoryFormError(err?.message || 'Erro ao salvar categoria');
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Ações de Clientes
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim() || !customerForm.phone.trim()) {
      alert('Nome e Telefone são obrigatórios.');
      return;
    }
    saveCustomerAdmin({
      name: customerForm.name.trim(),
      phone: customerForm.phone.trim(),
      email: customerForm.email.trim(),
      address: customerForm.address.trim(),
      notes: customerForm.notes.trim(),
    });
    setCustomers(fetchAllCustomers());
    setIsCustomerModalOpen(false);
    setCustomerForm({ name: '', phone: '', email: '', address: '', notes: '' });
  };

  const handleDeleteCustomer = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o cadastro de ${name}?`)) {
      deleteCustomerAdmin(id);
      setCustomers(fetchAllCustomers());
    }
  };

  const handleExportCSV = () => {
    if (customers.length === 0) {
      alert('Nenhum cliente cadastrado para exportar.');
      return;
    }
    const headers = [
      'Nome',
      'Telefone',
      'Email',
      'Endereço',
      'Total de Pedidos',
      'Total Pizzas Pedidas',
      'Pizza Mais Pedida',
      'Dia que Mais Pede',
      'Total Gasto (R$)',
      'Data Cadastro',
    ];
    const rows = customers.map((c) => {
      const habits = getCustomerConsumptionHabits(c.phone, c.auth_user_id);
      return [
        `"${(c.name || '').replace(/"/g, '""')}"`,
        `"${(c.phone || '').replace(/"/g, '""')}"`,
        `"${(c.email || '').replace(/"/g, '""')}"`,
        `"${(c.address || '').replace(/"/g, '""')}"`,
        habits.totalOrders,
        habits.totalPizzas,
        `"${habits.favoritePizzaCount > 0 ? `${habits.favoritePizza} (${habits.favoritePizzaCount}x)` : 'Nenhuma'}"`,
        `"${habits.favoriteDayOfWeek}"`,
        habits.totalSpent.toFixed(2),
        c.created_at ? new Date(c.created_at).toLocaleString('pt-BR') : '',
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `clientes_pizzaria_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleStoreOpen = () => {
    const updated = updateStoreSettings({ is_open: !storeSettings.is_open });
    setStoreSettings(updated);
  };

  const handleAdminLogout = async () => {
    if (confirm('Deseja realmente sair do painel administrativo?')) {
      await logoutAdmin();
      setAdminSession(null);
    }
  };

  const handleUpdateCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPassword = adminCredsForm.password.trim();
    if (newPassword) {
      if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
        alert('A nova senha deve ter no mínimo 8 caracteres, com letras e números.');
        return;
      }
    }
    try {
      const updated = await updateAdminProfile({
        name: adminCredsForm.name.trim() || 'Administrador',
        password: newPassword || undefined,
      });
      setAdminSession(updated);
      setAdminCreds({ email: updated.email, name: updated.name });
      setAdminCredsForm((prev) => ({ ...prev, password: '' }));
      setAdminCredsSuccessMsg(true);
      setTimeout(() => setAdminCredsSuccessMsg(false), 3500);
    } catch (err: any) {
      alert(err?.message || 'Não foi possível atualizar as credenciais.');
    }
  };

  // Se o usuário não estiver autenticado, exibe a tela de login
  if (!adminSession) {
    return (
      <AdminLogin
        onLoginSuccess={(session) => {
          setAdminSession(session);
          refreshData();
        }}
        onBackToMenu={onBackToMenu}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col antialiased transition-colors duration-200 ${
        darkMode ? 'admin-dark bg-[#0D0F14] text-gray-100' : 'bg-[#F8F9FA] text-[#1F2937]'
      }`}
    >
      {/* TOPO / HEADER DO PAINEL */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMenu}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Voltar ao Cardápio Digital"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#8B0000] text-white flex items-center justify-center font-bold shadow-xs">
                <Flame className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-sm sm:text-base text-[#111827] tracking-tight">
                    Frutella Pizzas
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-[#8B0000] border border-rose-200">
                    Painel Admin
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 hidden sm:block">
                  Gestão Operacional · Pedidos, Cardápio & Clientes
                </p>
              </div>
            </div>
          </div>

          {/* Ações Rápidas do Topo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Status da Loja: Aberto / Fechado */}
            <button
              onClick={handleToggleStoreOpen}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                storeSettings.is_open
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
              title="Clique para alternar o status da pizzaria"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  storeSettings.is_open ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="hidden sm:inline">Pizzaria:</span>
              <span>{storeSettings.is_open ? 'Aberta para Pedidos' : 'Fechada'}</span>
            </button>

            {/* Alternar Modo Dark / Modo Claro */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-xs transition-all cursor-pointer ${
                darkMode
                  ? 'bg-amber-400/15 border-amber-400/30 text-amber-300 hover:bg-amber-400/25'
                  : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
              }`}
              title={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Dark'}
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Modo Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Modo Dark</span>
                </>
              )}
            </button>

            {/* Alerta de Novo Pedido */}
            {hasNewOrderAlert && (
              <button
                onClick={() => {
                  setHasNewOrderAlert(false);
                  setActiveTab('orders');
                  setStatusFilter('novo');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white animate-bounce shadow-md cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Novo Pedido!</span>
              </button>
            )}

            {/* Botão Voltar ao Cardápio */}
            <button
              onClick={onBackToMenu}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ver Cardápio</span>
              <span className="md:hidden">Cardápio</span>
            </button>

            {/* Usuário Admin & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-gray-900 leading-tight">
                  {adminSession.name || 'Administrador'}
                </span>
                <span className="text-[10px] text-gray-400 leading-none">
                  {adminSession.email}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Encerrar Sessão de Administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto border-t border-gray-100 pt-1 pb-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-[#8B0000] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Pedidos</span>
            {metrics.newOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white text-[#8B0000] animate-pulse">
                {metrics.newOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pizzas')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'pizzas'
                ? 'bg-[#8B0000] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Editar Cardápio & Pizzas</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-black/10">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-[#8B0000] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categorias</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-black/10">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'customers'
                ? 'bg-[#8B0000] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Cadastro de Clientes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-black/10">
              {customers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-[#8B0000] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Configurações</span>
          </button>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* BANNER DE NOVO PEDIDO RECEBIDO EM TEMPO REAL */}
        {hasNewOrderAlert && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 border border-amber-300/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <BellRing className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-lg">Novo Pedido Recebido em Tempo Real!</h3>
                <p className="text-xs text-amber-100">
                  Um novo pedido acabou de entrar no sistema e foi adicionado automaticamente ao painel.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => playOrderNotificationSound()}
                className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all cursor-pointer"
                title="Tocar som de alerta novamente"
              >
                Tocar Alerta
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasNewOrderAlert(false);
                  setActiveTab('orders');
                  setStatusFilter('novo');
                }}
                className="px-4 py-1.5 rounded-xl bg-white text-amber-950 hover:bg-amber-50 text-xs font-black shadow-md transition-all cursor-pointer"
              >
                Ver Pedidos Novos
              </button>
            </div>
          </div>
        )}

        {/* BARRA DE MÉTRICAS RÁPIDAS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Pedidos Ativos</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900">{metrics.activeOrdersCount}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {metrics.newOrdersCount} aguardando preparo
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Total de Pedidos</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900">{metrics.totalOrders}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{metrics.todayOrdersCount} pedidos hoje</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Faturamento</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-emerald-700">
              R$ {formatCurrency(metrics.totalRevenue)}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">Vendas acumuladas</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between text-gray-500 mb-1">
              <span className="text-xs font-semibold">Clientes da Base</span>
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-gray-900">{metrics.totalCustomers}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{products.length} itens no cardápio</p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ABA 1: RECEBER PEDIDOS EM TEMPO REAL */}
        {/* ============================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Controles de Filtros e Busca */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Filtro por Status */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {[
                  { id: 'all', label: 'Todos', count: orders.length },
                  { id: 'novo', label: 'Novos', count: orders.filter((o) => o.status === 'novo').length, highlight: true },
                  { id: 'preparando', label: 'No Forno', count: orders.filter((o) => o.status === 'preparando').length },
                  { id: 'entrega', label: 'Em Entrega', count: orders.filter((o) => o.status === 'entrega').length },
                  { id: 'concluido', label: 'Concluídos', count: orders.filter((o) => o.status === 'concluido').length },
                  { id: 'cancelado', label: 'Cancelados', count: orders.filter((o) => o.status === 'cancelado').length },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                      statusFilter === st.id
                        ? 'bg-[#8B0000] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{st.label}</span>
                    <span
                      className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                        statusFilter === st.id
                          ? 'bg-white text-[#8B0000]'
                          : st.highlight && st.count > 0
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {st.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Busca de Pedidos */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, tel ou #pedido..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:outline-hidden focus:border-[#8B0000]"
                />
              </div>
            </div>

            {/* Listagem de Pedidos */}
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <h3 className="font-bold text-gray-700 text-base">Nenhum pedido encontrado</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                  Assim que um cliente fizer um pedido pelo cardápio digital, ele aparecerá aqui instantaneamente com aviso sonoro.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => {
                  const isNovo = order.status === 'novo';
                  const isPreparando = order.status === 'preparando';
                  const isEntrega = order.status === 'entrega';
                  const isConcluido = order.status === 'concluido';
                  const isCancelado = order.status === 'cancelado';

                  return (
                    <div
                      key={order.id}
                      className={`rounded-2xl border transition-all shadow-xs flex flex-col justify-between overflow-hidden ${
                        darkMode
                          ? isNovo
                            ? 'border-amber-400 ring-2 ring-amber-400/20 bg-[#141724]'
                            : isPreparando
                            ? 'border-blue-500/50 bg-[#141724]'
                            : isEntrega
                            ? 'border-purple-500/50 bg-[#141724]'
                            : isConcluido
                            ? 'border-emerald-500/40 bg-[#141724]'
                            : 'border-gray-800 bg-[#141724] opacity-75'
                          : isNovo
                          ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20 bg-white'
                          : isPreparando
                          ? 'border-blue-300 bg-white'
                          : isEntrega
                          ? 'border-purple-300 bg-white'
                          : isConcluido
                          ? 'border-emerald-200 bg-emerald-50/10 bg-white'
                          : 'border-gray-200 bg-white opacity-75'
                      }`}
                    >
                      {/* Cabeçalho do Card */}
                      <div className={`p-4 border-b ${darkMode ? 'border-gray-800/80' : 'border-gray-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-sm font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              #{order.order_number}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                isNovo
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : isPreparando
                                  ? 'bg-blue-100 text-blue-800'
                                  : isEntrega
                                  ? 'bg-purple-100 text-purple-800'
                                  : isConcluido
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {isNovo && '● Novo Pedido'}
                              {isPreparando && '🔥 No Forno'}
                              {isEntrega && '🛵 A Caminho'}
                              {isConcluido && '✓ Concluído'}
                              {isCancelado && '✕ Cancelado'}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.created_at).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Dados do Cliente */}
                        <div className="space-y-1">
                          <p className={`font-bold text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {order.customer_name || 'Cliente'}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <a
                              href={`https://wa.me/55${order.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Olá ${order.customer_name}! Estamos acompanhando seu pedido #${order.order_number} no Cantinho das Pizzas.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{order.customer_phone}</span>
                            </a>
                          </div>
                          {order.customer_address && (
                            <p className="text-xs text-gray-400 flex items-start gap-1 line-clamp-2 mt-1">
                              <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400 mt-0.5" />
                              <span>{order.customer_address}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Itens do Pedido */}
                      <div className="p-4 flex-1 space-y-2">
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="text-xs flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <span className={`font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                                  {it.quantity}x {it.name}
                                </span>
                                {it.size && <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-[11px]`}> ({it.size})</span>}
                                {it.crust && <span className={`${darkMode ? 'text-amber-400' : 'text-amber-700'} text-[11px]`}> · Borda {it.crust}</span>}
                                {it.extras && it.extras.length > 0 && (
                                  <p className="text-[10px] text-gray-400">+ {it.extras.join(', ')}</p>
                                )}
                              </div>
                              <span className={`font-semibold tabular-nums ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                R$ {formatCurrency(it.price * it.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {order.notes && (
                          <div
                            className={`p-2 rounded-lg text-[11px] italic border ${
                              darkMode
                                ? 'bg-amber-950/25 border-amber-900/40 text-amber-200'
                                : 'bg-gray-50 text-gray-600 border-gray-100'
                            }`}
                          >
                            Obs: {order.notes}
                          </div>
                        )}
                      </div>

                      {/* Rodapé e Ações de Transição */}
                      <div
                        className={`p-4 border-t space-y-3 rounded-b-2xl ${
                          darkMode
                            ? 'bg-[#0e111a] border-gray-800/80 text-gray-200'
                            : 'bg-gray-50/70 border-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`uppercase font-bold text-[10px] tracking-wider ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            Pagamento ({order.payment_method?.toUpperCase()})
                          </span>
                          <span
                            className={`text-base font-black tabular-nums ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            R$ {formatCurrency(order.total)}
                          </span>
                        </div>

                        {/* Botões de Ação Rápida de Status */}
                        <div className="grid grid-cols-2 gap-2">
                          {isNovo && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'preparando')}
                              className="col-span-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <Flame className="w-3.5 h-3.5" />
                              <span>Colocar no Forno</span>
                            </button>
                          )}

                          {isPreparando && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'entrega')}
                              className="col-span-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <Bike className="w-3.5 h-3.5" />
                              <span>Despachar Entrega</span>
                            </button>
                          )}

                          {isEntrega && (
                            <button
                              onClick={() => handleStatusChange(order.id, 'concluido')}
                              className="col-span-2 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Marcar como Entregue</span>
                            </button>
                          )}

                          {isConcluido && (
                            <div className="col-span-2 py-1 text-center text-xs font-semibold text-emerald-400">
                              ✓ Pedido finalizado com sucesso
                            </div>
                          )}

                          {/* Ações secundárias */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className={`py-1.5 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                              darkMode
                                ? 'border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-gray-200'
                                : 'border-gray-200 bg-white hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            Detalhes
                          </button>

                          {!isCancelado ? (
                            <button
                              onClick={() => handleStatusChange(order.id, 'cancelado')}
                              className={`py-1.5 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                darkMode
                                  ? 'border-rose-900/60 bg-rose-950/30 hover:bg-rose-900/40 text-rose-300'
                                  : 'border-rose-200 bg-white hover:bg-rose-50 text-rose-600'
                              }`}
                            >
                              Cancelar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              Excluir
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 2: EDITAR PIZZAS & CARDÁPIO */}
        {/* ============================================================== */}
        {activeTab === 'pizzas' && (
          <div className="space-y-4">
            {/* Barra de Ações do Cardápio */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setProductCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    productCategoryFilter === 'all'
                      ? 'bg-[#8B0000] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Todas ({products.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setProductCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      productCategoryFilter === cat.id
                        ? 'bg-[#8B0000] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name} ({products.filter((p) => p.category === cat.id).length})
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleResetProducts}
                  className="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold transition-colors cursor-pointer"
                  title="Restaurar o cardápio padrão de fábrica"
                >
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                  Restaurar Padrão
                </button>
                <button
                  onClick={handleOpenNewProduct}
                  className="px-4 py-2 rounded-xl bg-[#8B0000] hover:bg-[#5E050B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Pizza / Item</span>
                </button>
              </div>
            </div>

            {/* Grid de Pizzas e Produtos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => {
                const isPaused = prod.active === false;

                return (
                  <div
                    key={prod.id}
                    className={`bg-white rounded-2xl border transition-all p-4 flex flex-col justify-between shadow-xs ${
                      isPaused ? 'border-gray-200 bg-gray-50/80 opacity-70' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      {/* Imagem + Badges */}
                      <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100 mb-3">
                        <img
                          src={resolveProductImage(prod.image, prod.id)}
                          alt={prod.name}
                          className={`w-full h-full object-cover transition-transform duration-300 ${
                            isPaused ? 'grayscale' : ''
                          }`}
                        />
                        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-black/60 text-white backdrop-blur-xs">
                            {categories.find((c) => c.id === prod.category)?.name || CATEGORIES.find((c) => c.id === prod.category)?.name || prod.category}
                          </span>
                          {prod.featured && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-500 text-white shadow-xs">
                              Destaque
                            </span>
                          )}
                          {prod.isCombo && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-600 text-white">
                              Combo
                            </span>
                          )}
                        </div>

                        {/* Status Disponível / Em Falta */}
                        <div className="absolute top-2 right-2">
                          <button
                            type="button"
                            onClick={() => handleToggleProduct(prod.id)}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase cursor-pointer border shadow-xs transition-colors ${
                              isPaused
                                ? 'bg-rose-100 text-rose-700 border-rose-300'
                                : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            }`}
                            title="Alternar entre Disponível ou Pausado (Em falta)"
                          >
                            {isPaused ? 'Em Falta' : 'Ativo'}
                          </button>
                        </div>
                      </div>

                      {/* Título e Descrição */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-base">{prod.name}</h4>
                        <span className="font-black text-[#8B0000] text-base tabular-nums shrink-0">
                          R$ {formatCurrency(prod.price)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>
                    </div>

                    {/* Botões de Ação */}
                    <div className="pt-4 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleProduct(prod.id)}
                        className={`text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors cursor-pointer ${
                          isPaused
                            ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                            : 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                        }`}
                      >
                        {isPaused ? 'Ativar no Cardápio' : 'Pausar (Em Falta)'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        {prod.image && (
                          <button
                            type="button"
                            onClick={() =>
                              downloadImage(
                                prod.image,
                                `${prod.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-foto.jpg`
                              )
                            }
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                            title="Exportar/Baixar foto desta pizza para o seu dispositivo"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditProduct(prod)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                          title="Editar Nome, Preço, Descrição e Foto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                          title="Excluir pizza do cardápio"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA: GERENCIAR CATEGORIAS */}
        {/* ============================================================== */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Topo / Barra de Ações de Categorias */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar categoria..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:outline-hidden focus:border-[#8B0000]"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <span className="text-xs text-gray-500 font-medium hidden md:inline">
                  {categories.filter((c) => c.active !== false).length} ativas de {categories.length} total
                </span>
                <button
                  onClick={handleOpenNewCategory}
                  className="px-4 py-2 rounded-xl bg-[#8B0000] hover:bg-[#5E050B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Categoria</span>
                </button>
              </div>
            </div>

            {/* Grid de Categorias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories
                .filter((cat) =>
                  !categorySearch ||
                  cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                  cat.id.toLowerCase().includes(categorySearch.toLowerCase())
                )
                .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
                .map((cat) => {
                  const linkedProductsCount = products.filter((p) => p.category === cat.id).length;
                  const isActive = cat.active !== false;

                  return (
                    <div
                      key={cat.id}
                      className={`bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-xs transition-all ${
                        isActive
                          ? 'border-gray-200 hover:border-gray-300'
                          : 'border-gray-200 bg-gray-50/70 opacity-75'
                      }`}
                    >
                      <div>
                        {/* Cabeçalho do Card */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-50 to-amber-50 border border-red-100/80 flex items-center justify-center text-[#8B0000] shadow-xs shrink-0">
                              <CategoryIcon iconKey={cat.icon || cat.id} className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-base leading-tight">
                                {cat.name}
                              </h4>
                              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-gray-100 text-gray-600">
                                #{cat.id}
                              </span>
                            </div>
                          </div>

                          {/* Badge / Botão Ativo */}
                          <button
                            type="button"
                            onClick={() => handleToggleCategoryActive(cat)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase cursor-pointer border shadow-xs transition-colors ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                            }`}
                            title="Clique para alternar visibilidade no cardápio"
                          >
                            {isActive ? 'Ativa' : 'Oculta'}
                          </button>
                        </div>

                        {/* Informações da Categoria */}
                        <div className="space-y-1.5 py-2 border-y border-gray-100 text-xs text-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Produtos vinculados:</span>
                            <span className="font-bold text-gray-800">
                              {linkedProductsCount} {linkedProductsCount === 1 ? 'item' : 'itens'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Ícone selecionado:</span>
                            <span className="font-semibold text-gray-700 capitalize flex items-center gap-1.5">
                              <CategoryIcon iconKey={cat.icon || cat.id} className="w-3.5 h-3.5 text-[#8B0000]" />
                              {cat.icon || cat.id}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Ordem na barra:</span>
                            <span className="font-semibold text-gray-700">
                              Posição #{cat.order_index ?? 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="pt-3 mt-3 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setProductCategoryFilter(cat.id);
                            setActiveTab('pizzas');
                          }}
                          className="text-xs font-semibold text-[#8B0000] hover:text-[#5E050B] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          Ver itens ({linkedProductsCount})
                          <ChevronRight className="w-3 h-3" />
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                            title="Editar Nome, Ícone e Ordem da Categoria"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-colors cursor-pointer"
                            title="Excluir Categoria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 3: CADASTRO DE CLIENTES */}
        {/* ============================================================== */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            {/* Topo da Aba de Clientes */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, telefone, email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:bg-white focus:outline-hidden focus:border-[#8B0000]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
                <button
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#8B0000] hover:bg-[#5E050B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Cliente</span>
                </button>
              </div>
            </div>

            {/* Tabela de Clientes */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Telefone / WhatsApp</th>
                      <th className="px-4 py-3 text-center">Pizzas Pedidas</th>
                      <th className="px-4 py-3">Pizza Mais Pedida</th>
                      <th className="px-4 py-3">Dia que Mais Pede</th>
                      <th className="px-4 py-3 text-right">Total Gasto</th>
                      <th className="px-4 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                          Nenhum cliente cadastrado ainda.
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((cust) => {
                        const habits = getCustomerConsumptionHabits(cust.phone, cust.auth_user_id);

                        return (
                          <tr key={cust.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              <div>
                                <p className="font-bold text-gray-900">{cust.name}</p>
                                {cust.email ? (
                                  <p className="text-[11px] text-gray-400">{cust.email}</p>
                                ) : (
                                  <p className="text-[10px] text-gray-400">
                                    Cadastrado em {new Date(cust.created_at).toLocaleDateString('pt-BR')}
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* Telefone & WhatsApp */}
                            <td className="px-4 py-3">
                              <a
                                href={`https://wa.me/55${cust.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                  `Olá ${cust.name}! Temos novidades especiais para você no Cantinho das Pizzas.`
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>{cust.phone}</span>
                              </a>
                            </td>

                            {/* Quantas pizzas já pediu */}
                            <td className="px-4 py-3 text-center">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                                <Flame className="w-3.5 h-3.5 text-amber-600" />
                                <span>{habits.totalPizzas} pizzas</span>
                              </span>
                            </td>

                            {/* Qual é a mais pedida */}
                            <td className="px-4 py-3">
                              {habits.favoritePizzaCount > 0 ? (
                                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-[#8B0000] border border-rose-200">
                                  <Award className="w-3.5 h-3.5 text-[#8B0000]" />
                                  <span className="max-w-[150px] truncate" title={habits.favoritePizza}>
                                    {habits.favoritePizza}
                                  </span>
                                  <span className="text-[10px] text-white font-extrabold bg-[#8B0000] px-1.5 py-0.2 rounded-full">
                                    {habits.favoritePizzaCount}x
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-300 text-xs italic">Nenhuma ainda</span>
                              )}
                            </td>

                            {/* Qual é o dia que o cliente mais pede */}
                            <td className="px-4 py-3">
                              {habits.favoriteDayCount > 0 ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                  <span>{habits.favoriteDayOfWeek}</span>
                                  <span className="text-[10px] text-blue-600 font-bold">
                                    ({habits.favoriteDayCount} {habits.favoriteDayCount === 1 ? 'ped.' : 'peds.'})
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-300 text-xs italic">Sem dados</span>
                              )}
                            </td>

                            {/* Total Gasto */}
                            <td className="px-4 py-3 text-right">
                              <span className="font-black text-gray-900 tabular-nums">
                                R$ {formatCurrency(habits.totalSpent)}
                              </span>
                            </td>

                            {/* Ações */}
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setSelectedCustomerForHabits(cust)}
                                  className="p-1.5 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
                                  title="Ver Raio-X Completo e Hábitos de Consumo"
                                >
                                  <PieChart className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setCustomerForm({
                                      name: cust.name,
                                      phone: cust.phone,
                                      email: cust.email || '',
                                      address: cust.address || '',
                                      notes: cust.notes || '',
                                    });
                                    setIsCustomerModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                                  title="Editar Cliente"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Excluir Cliente"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ABA 4: CONFIGURAÇÕES DA PIZZARIA */}
        {/* ============================================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="max-w-2xl bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Configurações Operacionais</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Ajuste os dados de contato, horário e taxa de entrega da pizzaria.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nome da Pizzaria
                </label>
                <input
                  type="text"
                  value={storeSettings.store_name}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({ ...prev, store_name: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  WhatsApp para Recebimento de Pedidos
                </label>
                <input
                  type="text"
                  value={storeSettings.phone_whatsapp}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({ ...prev, phone_whatsapp: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:bg-white"
                />
                <p className="text-[11px] text-gray-400 mt-1">Formato: 5511999999999 (com DDI e DDD)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Taxa Padrão de Entrega (R$)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    value={storeSettings.delivery_fee}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({
                        ...prev,
                        delivery_fee: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Status da Pizzaria
                  </label>
                  <select
                    value={storeSettings.is_open ? 'open' : 'closed'}
                    onChange={(e) =>
                      setStoreSettings((prev) => ({ ...prev, is_open: e.target.value === 'open' }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:bg-white"
                  >
                    <option value="open">Aberta (Aceitando Pedidos)</option>
                    <option value="closed">Fechada (Pausada)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Horário de Funcionamento Exibido
                </label>
                <input
                  type="text"
                  value={storeSettings.opening_hours}
                  onChange={(e) =>
                    setStoreSettings((prev) => ({ ...prev, opening_hours: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    updateStoreSettings(storeSettings);
                    alert('Configurações salvas com sucesso!');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#5E050B] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>

          {/* Card de Aparência / Modo Dark */}
          <div className="max-w-2xl bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    darkMode ? 'bg-amber-400/15 text-amber-300' : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Aparência do Painel</h3>
                  <p className="text-xs text-gray-500">
                    Alterne entre o tema escuro (Dark Mode) ou o tema claro do painel operacional.
                  </p>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  darkMode
                    ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                }`}
              >
                {darkMode ? 'Dark Ativo' : 'Claro Ativo'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div>
                <p className="text-xs font-bold text-gray-800">Modo Noturno (Dark Mode)</p>
                <p className="text-[11px] text-gray-400">
                  Ideal para a operação noturna da pizzaria, reduzindo o brilho da tela e o cansaço visual.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleDarkMode}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all shrink-0 ${
                  darkMode
                    ? 'bg-amber-400 text-gray-950 hover:bg-amber-300 shadow-md'
                    : 'bg-gray-900 text-white hover:bg-black shadow-xs'
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>{darkMode ? 'Desativar Modo Dark' : 'Ativar Modo Dark'}</span>
              </button>
            </div>
          </div>

          {/* Card de Notificações Sonoras e Alertas (Som de Pedidos) */}
          <div className="max-w-2xl bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    testedSound
                      ? 'bg-emerald-500 text-white animate-pulse'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}
                >
                  <BellRing className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Alerta Sonoro de Novos Pedidos</h3>
                  <p className="text-xs text-gray-500">
                    Campainha automática reproduzida para a cozinha e atendimento a cada novo pedido recebido.
                  </p>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  testedSound
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}
              >
                {testedSound ? 'Som Tocando' : 'Áudio Habilitado'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  Campainha de Notificação
                </p>
                <p className="text-[11px] text-gray-500 max-w-md">
                  Clique no botão para ouvir o som e garantir que o áudio do seu navegador esteja desbloqueado para tocar automaticamente quando chegar um pedido.
                </p>
              </div>

              <button
                type="button"
                onClick={handleTestSound}
                className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all shrink-0 shadow-xs ${
                  testedSound
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                <BellRing className={`w-4 h-4 ${testedSound ? 'animate-bounce' : ''}`} />
                <span>{testedSound ? 'Tocando Campainha...' : 'Testar Som Agora'}</span>
              </button>
            </div>
          </div>

          {/* Card de Segurança & Credenciais do Administrador */}
          <div className="max-w-2xl bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">Acesso de Administrador</h3>
                  <p className="text-xs text-gray-500">
                    Altere o nome e a senha de login para proteger o painel.
                  </p>
                </div>
              </div>

              <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Sessão Ativa
              </div>
            </div>

            {adminCredsSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Credenciais atualizadas com sucesso! Use a nova senha no próximo login.</span>
              </div>
            )}

            <form onSubmit={handleUpdateCreds} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Nome do Administrador
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gerente Geral"
                    value={adminCredsForm.name}
                    onChange={(e) =>
                      setAdminCredsForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    E-mail de Login
                  </label>
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={adminCreds.email}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nova Senha de Acesso (deixe em branco para manter a atual)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Nova senha (mínimo 8 caracteres, com letras e números)"
                    value={adminCredsForm.password}
                    onChange={(e) =>
                      setAdminCredsForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Credencial atual configurada: <span className="font-mono text-gray-600">{adminCreds.email}</span>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Salvar Novas Credenciais
                </button>

                <button
                  type="button"
                  onClick={handleAdminLogout}
                  className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                >
                  Encerrar Sessão
                </button>
              </div>
            </form>
          </div>
        </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* MODAL: EDITAR / CRIAR PIZZA */}
      {/* ============================================================== */}
      {(editingProduct || isNewProductModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900">
                {editingProduct ? `Editar: ${editingProduct.name}` : 'Nova Pizza / Item no Cardápio'}
              </h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsNewProductModalOpen(false);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nome da Pizza / Produto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Quatro Queijos Especial"
                  value={productForm.name}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#8B0000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="49,90"
                    value={productForm.price}
                    onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#8B0000]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Categoria *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, category: e.target.value as CategoryId }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#8B0000]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Descrição dos Ingredientes
                </label>
                <textarea
                  rows={2}
                  placeholder="Molho de tomate pelado, muçarela especial, orégano fresco..."
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#8B0000]"
                />
              </div>

              {/* Seção de Imagem / Foto da Pizza */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Foto da Pizza / Produto
                  </label>
                  <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        imageInputMode === 'upload'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      <Upload className="w-3 h-3 inline mr-1" />
                      Do Dispositivo
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        imageInputMode === 'url'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      Link / URL
                    </button>
                  </div>
                </div>

                {/* Input escondido para selecionar arquivo */}
                <input
                  ref={productImageFileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/avif"
                  className="hidden"
                  onChange={handleProductImageFileChange}
                />

                {/* Mensagem de sucesso */}
                {imageUploadSuccess && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{imageUploadSuccess}</span>
                  </div>
                )}

                {/* Modo Upload ou Exibição da Imagem Atual */}
                {productForm.image ? (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 group shadow-xs">
                    <div className="w-full h-44 relative bg-gray-950 flex items-center justify-center">
                      <img
                        src={resolveProductImage(productForm.image, editingProduct?.id)}
                        alt="Foto da Pizza"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {isUploadingImage && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                          <span className="text-xs font-bold">Otimizando foto da pizza...</span>
                        </div>
                      )}
                    </div>

                    {/* Barra de ações sobre a foto */}
                    <div className="p-2.5 bg-gray-900/90 backdrop-blur-md flex items-center justify-between gap-2 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => productImageFileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          title="Substituir foto enviando outro arquivo do seu aparelho"
                        >
                          <Camera className="w-3.5 h-3.5 text-[#8B0000]" />
                          Trocar Foto
                        </button>
                        <button
                          type="button"
                          onClick={handleExportCurrentImage}
                          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Baixar/exportar esta imagem para o seu computador ou celular"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-300" />
                          Exportar Foto
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setProductForm((prev) => ({ ...prev, image: '' }))}
                        className="p-1.5 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        title="Remover foto atual"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOverImage(true);
                    }}
                    onDragLeave={() => setIsDragOverImage(false)}
                    onDrop={handleProductImageDrop}
                    onClick={() => productImageFileInputRef.current?.click()}
                    className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                      isDragOverImage
                        ? 'border-[#8B0000] bg-red-50/50 scale-[1.01]'
                        : 'border-gray-300 hover:border-[#8B0000] bg-gray-50/60 hover:bg-red-50/20'
                    }`}
                  >
                    {isUploadingImage ? (
                      <div className="flex flex-col items-center gap-2 py-4">
                        <Loader2 className="w-8 h-8 animate-spin text-[#8B0000]" />
                        <span className="text-xs font-bold text-gray-700">Otimizando e preparando foto...</span>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-[#8B0000] shadow-xs">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">
                            Clique para escolher uma foto do seu dispositivo
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            ou arraste a foto da pizza aqui (JPG, PNG, WEBP)
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Compressão automática para alta velocidade
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Campo URL (visível quando selecionado o modo Link ou opcional) */}
                {imageInputMode === 'url' && (
                  <div className="pt-2 animate-in fade-in">
                    <input
                      type="text"
                      placeholder="https://exemplo.com/foto-pizza.jpg ou caminho relativo"
                      value={productForm.image}
                      onChange={(e) => setProductForm((prev) => ({ ...prev, image: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#8B0000]"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Dica: Você pode colar um link direto de imagem externa ou usar o botão "Do Dispositivo" para enviar do seu aparelho.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, featured: e.target.checked }))
                    }
                    className="rounded text-[#8B0000] focus:ring-[#8B0000]"
                  />
                  <span>Destaque na Vitrine</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={productForm.isCombo}
                    onChange={(e) =>
                      setProductForm((prev) => ({ ...prev, isCombo: e.target.checked }))
                    }
                    className="rounded text-[#8B0000] focus:ring-[#8B0000]"
                  />
                  <span>Marcar como Combo</span>
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setIsNewProductModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B0000] hover:bg-[#5E050B] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Adicionar ao Cardápio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NOVA / EDITAR CATEGORIA */}
      {/* ============================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-[#8B0000] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-gray-900">
                  {editingCategory ? `Editar Categoria: ${editingCategory.name}` : 'Nova Categoria'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(false);
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {categoryFormError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{categoryFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Açaí, Pizzas Especiais, Sobremesas..."
                  value={categoryForm.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategoryForm((prev) => ({
                      ...prev,
                      name: val,
                      id: editingCategory
                        ? prev.id
                        : val
                            .toLowerCase()
                            .normalize('NFD')
                            .replace(/[\u0300-\u036f]/g, '')
                            .replace(/[^a-z0-9_-]/g, '-')
                            .replace(/-+/g, '-')
                            .replace(/^-|-$/g, ''),
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#8B0000]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Identificador Único (Slug) {editingCategory ? '(fixo)' : '*'}
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingCategory}
                  placeholder="Ex: acai, sobremesas, bebidas"
                  value={categoryForm.id}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({
                      ...prev,
                      id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
                    }))
                  }
                  className={`w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono focus:outline-hidden focus:border-[#8B0000] ${
                    editingCategory ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                  }`}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Usado internamente para vincular os produtos e no banco de dados.
                </p>
              </div>

              {/* Seletor Visual de Ícone */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase">
                    Ícone da Categoria *
                  </label>
                  <span className="text-[11px] font-semibold text-[#8B0000] capitalize flex items-center gap-1">
                    Selecionado: {categoryForm.icon}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 rounded-2xl bg-gray-50 border border-gray-200">
                  {CATEGORY_ICON_OPTIONS.map((opt) => {
                    const isSelected = categoryForm.icon === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCategoryForm((prev) => ({ ...prev, icon: opt.id }))}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#8B0000] bg-white text-[#8B0000] ring-2 ring-[#8B0000]/25 shadow-xs font-bold'
                            : 'border-transparent hover:border-gray-200 hover:bg-white text-gray-700'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 transition-colors ${
                            isSelected
                              ? 'bg-[#8B0000] text-white shadow-xs'
                              : 'bg-white border border-gray-200 text-gray-600'
                          }`}
                        >
                          <CategoryIcon iconKey={opt.id} className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] truncate w-full">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Ordem de Exibição
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={categoryForm.order_index}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        order_index: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-[#8B0000]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Menor número aparece primeiro no cardápio.
                  </p>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700 mt-2 sm:mt-0 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 w-full">
                    <input
                      type="checkbox"
                      checked={categoryForm.active}
                      onChange={(e) =>
                        setCategoryForm((prev) => ({ ...prev, active: e.target.checked }))
                      }
                      className="rounded text-[#8B0000] focus:ring-[#8B0000]"
                    />
                    <span>Ativa no Cardápio Digital</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCategoryModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="px-5 py-2 rounded-xl bg-[#8B0000] hover:bg-[#5E050B] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingCategory ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>{editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: NOVO / EDITAR CLIENTE */}
      {/* ============================================================== */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-gray-900">Cadastrar / Editar Cliente</h3>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Telefone / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="(11) 99999-9999"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="cliente@exemplo.com"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Endereço</label>
                <input
                  type="text"
                  placeholder="Rua, número, bairro, apto"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Preferências, ponto de referência..."
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#8B0000] hover:bg-[#5E050B] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DRAWER / MODAL: DETALHES COMPLETOS DO PEDIDO */}
      {/* ============================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-mono font-black text-lg text-gray-900">
                  Pedido #{selectedOrder.order_number}
                </h3>
                <p className="text-xs text-gray-400">
                  {new Date(selectedOrder.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dados do Cliente */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-gray-900">{selectedOrder.customer_name}</span>
                <a
                  href={`https://wa.me/55${selectedOrder.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Olá ${selectedOrder.customer_name}! Estamos preparando seu pedido #${selectedOrder.order_number}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 hover:bg-emerald-200"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
              <p className="text-xs text-gray-600 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                <span>{selectedOrder.customer_address}</span>
              </p>
            </div>

            {/* Lista Detalhada de Itens */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Itens do Pedido</h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 text-xs flex items-center justify-between gap-3 bg-white">
                    <div>
                      <p className="font-bold text-gray-900">
                        {it.quantity}x {it.name}
                      </p>
                      <p className="text-gray-500 text-[11px]">
                        {it.size ? `Tamanho: ${it.size}` : ''}
                        {it.crust ? ` · Borda: ${it.crust}` : ''}
                      </p>
                      {it.extras && it.extras.length > 0 && (
                        <p className="text-amber-800 text-[10px]">Adicionais: {it.extras.join(', ')}</p>
                      )}
                    </div>
                    <span className="font-black text-gray-900 tabular-nums">
                      R$ {formatCurrency(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totalização */}
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>R$ {formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxa de Entrega</span>
                <span>R$ {formatCurrency(selectedOrder.delivery_fee)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Desconto {selectedOrder.coupon_code ? `(${selectedOrder.coupon_code})` : ''}</span>
                  <span>- R$ {formatCurrency(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-200">
                <span>Total a Pagar</span>
                <span className="text-[#8B0000]">R$ {formatCurrency(selectedOrder.total)}</span>
              </div>
              <p className="text-[11px] text-gray-400 text-right">
                Método: {selectedOrder.payment_method?.toUpperCase()}
              </p>
            </div>

            {/* Ações de Status */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                onClick={() => handleStatusChange(selectedOrder.id, 'cancelado')}
                className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
              >
                Cancelar Pedido
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange(selectedOrder.id, 'preparando')}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                >
                  No Forno
                </button>
                <button
                  onClick={() => handleStatusChange(selectedOrder.id, 'entrega')}
                  className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
                >
                  Em Entrega
                </button>
                <button
                  onClick={() => handleStatusChange(selectedOrder.id, 'concluido')}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: RAIO-X & HÁBITOS DE CONSUMO DO CLIENTE */}
      {/* ============================================================== */}
      {selectedCustomerForHabits && (() => {
        const habits = getCustomerConsumptionHabits(
          selectedCustomerForHabits.phone,
          selectedCustomerForHabits.auth_user_id
        );
        const cleanPhone = selectedCustomerForHabits.phone.replace(/\D/g, '');
        const clientOrders = orders.filter(
          (o) =>
            (selectedCustomerForHabits.auth_user_id && o.customer_user_id === selectedCustomerForHabits.auth_user_id) ||
            (cleanPhone && (o.customer_phone || '').replace(/\D/g, '') === cleanPhone)
        );

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
              {/* Topo do Modal */}
              <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B0000] to-[#5a050a] text-white flex items-center justify-center font-bold text-lg shadow-md">
                    {selectedCustomerForHabits.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">
                        {selectedCustomerForHabits.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                        Raio-X de Consumo
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                      <span>{selectedCustomerForHabits.phone}</span>
                      {selectedCustomerForHabits.email && <span>· {selectedCustomerForHabits.email}</span>}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomerForHabits(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3 CARDS DE DESTAQUE: QUANTAS PIZZAS, MAIS PEDIDA, DIA FAVORITO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Quantas pizzas já pediu */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs">
                  <div className="flex items-center justify-between text-amber-700 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total de Pizzas</span>
                    <Flame className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-2xl font-black text-amber-900">
                    {habits.totalPizzas}{' '}
                    <span className="text-xs font-semibold text-amber-700">unidades</span>
                  </p>
                  <p className="text-[11px] text-amber-700/80 mt-0.5">
                    Em {habits.totalOrders} {habits.totalOrders === 1 ? 'pedido' : 'pedidos'} realizados
                  </p>
                </div>

                {/* 2. Pizza Mais Pedida */}
                <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 shadow-2xs">
                  <div className="flex items-center justify-between text-[#8B0000] mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Mais Pedida</span>
                    <Award className="w-4 h-4 text-[#8B0000]" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-rose-950 truncate" title={habits.favoritePizza}>
                    {habits.favoritePizza}
                  </p>
                  <p className="text-[11px] text-[#8B0000] mt-0.5">
                    {habits.favoritePizzaCount > 0
                      ? `Pedida ${habits.favoritePizzaCount} vezes pelo cliente`
                      : 'Nenhum pedido ainda'}
                  </p>
                </div>

                {/* 3. Dia que mais pede */}
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 shadow-2xs">
                  <div className="flex items-center justify-between text-blue-700 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Dia Mais Frequente</span>
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-base sm:text-lg font-black text-blue-950">
                    {habits.favoriteDayOfWeek}
                  </p>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    {habits.favoriteDayCount > 0
                      ? `${habits.favoriteDayCount} pedidos neste dia da semana`
                      : 'Aguardando histórico'}
                  </p>
                </div>
              </div>

              {/* RANKING DE SABORES PEDIDOS PELO CLIENTE */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sabores Favoritos do Cliente</span>
                </h4>

                {habits.pizzaBreakdown.length === 0 ? (
                  <p className="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center">
                    Este cliente ainda não completou nenhum pedido.
                  </p>
                ) : (
                  <div className="space-y-2 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                    {habits.pizzaBreakdown.map((p, idx) => {
                      const percentage = Math.round((p.count / (habits.totalPizzas || 1)) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-800 flex items-center gap-1.5">
                              <span className="w-4 text-gray-400 font-mono text-[10px]">#{idx + 1}</span>
                              {p.name}
                            </span>
                            <span className="font-semibold text-gray-600 tabular-nums">
                              {p.count}x ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#8B0000]"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* DISTRIBUIÇÃO POR DIA DA SEMANA */}
              {habits.dayBreakdown.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Dias da Semana em que Mais Pede</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {habits.dayBreakdown.map((d, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-gray-100 bg-white text-xs flex items-center justify-between"
                      >
                        <span className="font-semibold text-gray-700">{d.day}</span>
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-[11px]">
                          {d.count} {d.count === 1 ? 'pedido' : 'pedidos'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HISTÓRICO RECENTE DE PEDIDOS */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Histórico de Pedidos ({clientOrders.length})</span>
                </h4>

                {clientOrders.length === 0 ? (
                  <p className="text-xs text-gray-400 italic bg-gray-50 p-4 rounded-xl text-center">
                    Nenhum pedido registrado para este telefone/cliente.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {clientOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 rounded-xl border border-gray-200 bg-white text-xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-gray-900">#{ord.order_number}</span>
                            <span className="text-[10px] text-gray-400">
                              {new Date(ord.created_at).toLocaleDateString('pt-BR', {
                                weekday: 'short',
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-gray-600 text-[11px] mt-0.5 truncate max-w-sm">
                            {ord.items.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-gray-900 block tabular-nums">
                            R$ {formatCurrency(ord.total)}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rodapé do Modal */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <a
                  href={`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
                    `Olá ${selectedCustomerForHabits.name}! Notamos que sua pizza favorita é a ${habits.favoritePizza}! Que tal aproveitar hoje no Cantinho das Pizzas?`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Ofertar Pizza Favorita no WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedCustomerForHabits(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
