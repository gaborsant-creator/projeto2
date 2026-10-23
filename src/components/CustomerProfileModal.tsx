import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  User,
  ShoppingBag,
  Ticket,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  Truck,
  Flame,
  AlertCircle,
  Copy,
  Check,
  LogOut,
  ChevronRight,
  Sparkles,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  CustomerRecord,
  CouponRecord,
  OrderRecord,
  fetchCustomerOrders,
  fetchActiveCoupons,
  updateCustomerProfile,
  signOutCustomer,
  subscribeToOrders,
} from '../services/storage';
import { CartItem } from '../types';
import { formatPhoneMask } from './CustomerRegisterModal';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerRecord | null;
  onCustomerUpdated?: (updated: CustomerRecord) => void;
  onLogout?: () => void;
  initialTab?: 'profile' | 'orders' | 'coupons';
  onApplyCouponToCart?: (coupon: CouponRecord) => void;
  onRepeatOrder?: (items: CartItem[]) => void;
  onOpenRegister?: () => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
  onCustomerUpdated,
  onLogout,
  initialTab = 'orders',
  onApplyCouponToCart,
  onRepeatOrder,
  onOpenRegister,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'coupons' | 'profile'>(initialTab);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Edição de perfil
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Feedback de cupom copiado
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Sincroniza formulário com dados do cliente
  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone ? formatPhoneMask(customer.phone) : '');
      setAddress(customer.address || '');
      setNotes(customer.notes || '');
    }
  }, [customer]);

  // Atualiza a aba inicial quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Carrega pedidos do cliente
  const loadOrders = useCallback(async () => {
    if (!customer?.phone && !customer?.auth_user_id) return;
    setLoadingOrders(true);
    try {
      const data = await fetchCustomerOrders(customer.phone, customer.auth_user_id);
      setOrders(data);
    } catch (err) {
      console.warn('Erro ao carregar histórico de pedidos:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [customer]);

  // Carrega cupons ativos
  const loadCoupons = useCallback(async () => {
    setLoadingCoupons(true);
    try {
      const data = await fetchActiveCoupons();
      setCoupons(data);
    } catch (err) {
      console.warn('Erro ao carregar cupons:', err);
    } finally {
      setLoadingCoupons(false);
    }
  }, []);

  // Executa carregamento quando o modal abre
  useEffect(() => {
    if (isOpen && customer) {
      loadOrders();
      loadCoupons();
    }
  }, [isOpen, customer, loadOrders, loadCoupons]);

  // Inscrição em tempo real para atualizações de status de pedidos
  useEffect(() => {
    if (!isOpen || !customer) return;

    const channel = subscribeToOrders(
      (newOrder) => {
        // Se for pedido deste cliente, adiciona no topo
        if (
          (newOrder.customer_user_id && newOrder.customer_user_id === customer.auth_user_id) ||
          newOrder.customer_phone === customer.phone
        ) {
          setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
        }
      },
      (updatedOrder) => {
        // Atualiza pedido existente em tempo real
        setOrders((prev) =>
          prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
        );
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [isOpen, customer]);

  if (!isOpen) return null;

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const updated = await updateCustomerProfile(customer.id, {
        name: name.trim(),
        phone: cleanPhone || customer.phone,
        address: address.trim(),
        notes: notes.trim(),
      });

      if (onCustomerUpdated) {
        onCustomerUpdated(updated);
      }
      setProfileSuccessMsg('Dados cadastrais atualizados com sucesso!');
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    } catch (err: any) {
      setProfileErrorMsg(err?.message || 'Falha ao salvar dados.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogoutClick = async () => {
    await signOutCustomer();
    if (onLogout) {
      onLogout();
    }
    onClose();
  };

  const formatPrice = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: OrderRecord['status']) => {
    switch (status) {
      case 'novo':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" />
            Recebido
          </span>
        );
      case 'preparando':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Flame className="w-3 h-3" />
            No Forno
          </span>
        );
      case 'entrega':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Truck className="w-3 h-3" />
            A Caminho
          </span>
        );
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Entregue
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white border border-[#E8E8E8] rounded-3xl shadow-2xl text-[#171717] overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Subtle decorative top bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#8B0000] via-[#C93B2B] to-[#8B0000] shrink-0" />

        {/* Header com avatar e saudações */}
        <div className="p-5 sm:p-6 border-b border-[#F0F0F0] flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center font-bold text-lg shadow-inner">
              {customer?.name ? customer.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold font-inter text-[#171717] tracking-tight">
                  {customer?.name || 'Área do Cliente'}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 border border-amber-500/20">
                  <Sparkles className="w-3 h-3" />
                  Clube Cantinho
                </span>
              </div>
              <p className="text-xs text-[#666666] flex items-center gap-2 mt-0.5">
                {customer?.email ? (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#999999]" />
                    {customer.email}
                  </span>
                ) : null}
                {customer?.phone ? (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#999999]" />
                    {formatPhoneMask(customer.phone)}
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {customer && (
              <button
                type="button"
                onClick={handleLogoutClick}
                title="Sair da conta"
                className="p-2 rounded-xl text-[#777777] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="w-9 h-9 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center text-[#666666] hover:text-[#171717] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Abas de Navegação */}
        {customer ? (
          <>
            <div className="flex items-center border-b border-[#F0F0F0] px-5 sm:px-6 bg-[#FAFAFA] shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'orders'
                    ? 'border-[#8B0000] text-[#8B0000]'
                    : 'border-transparent text-[#777777] hover:text-[#171717]'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Histórico de Pedidos</span>
                {orders.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-[#8B0000]/10 text-[#8B0000] font-bold">
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('coupons')}
                className={`py-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'coupons'
                    ? 'border-[#8B0000] text-[#8B0000]'
                    : 'border-transparent text-[#777777] hover:text-[#171717]'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Cupons & Ofertas</span>
                {coupons.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/15 text-amber-700 font-bold">
                    {coupons.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`py-3 px-3 sm:px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'border-[#8B0000] text-[#8B0000]'
                    : 'border-transparent text-[#777777] hover:text-[#171717]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Meus Dados</span>
              </button>
            </div>

            {/* Conteúdo das Abas */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {/* ABA 1: HISTÓRICO DE PEDIDOS */}
              {activeTab === 'orders' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-[#666666]">
                      Acompanhe em tempo real o status e detalhes dos seus pedidos anteriores.
                    </p>
                    <button
                      type="button"
                      onClick={loadOrders}
                      disabled={loadingOrders}
                      className="text-xs text-[#8B0000] hover:underline font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                      <span>Atualizar</span>
                    </button>
                  </div>

                  {loadingOrders ? (
                    <div className="py-12 text-center text-xs text-[#777777] flex flex-col items-center gap-2">
                      <div className="w-7 h-7 border-2 border-[#8B0000] border-t-transparent rounded-full animate-spin" />
                      <span>Buscando seus pedidos...</span>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-12 text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-2xl bg-[#F5F5F5] text-[#888888] flex items-center justify-center mb-3">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                      <h4 className="text-base font-bold text-[#171717]">Nenhum pedido realizado ainda</h4>
                      <p className="text-xs text-[#666666] mt-1 max-w-sm">
                        Quando você fizer um pedido pelo cardápio, ele aparecerá aqui com acompanhamento em tempo real!
                      </p>
                      <button
                        type="button"
                        onClick={onClose}
                        className="mt-4 px-5 py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#60030A] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                      >
                        Explorar o Cardápio
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="border border-[#EAEAEA] rounded-2xl p-4 sm:p-5 hover:border-[#8B0000]/30 transition-all bg-white shadow-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F2F2F2]">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#171717]">
                                Pedido #{order.order_number}
                              </span>
                              <span className="text-[11px] text-[#888888]">
                                • {formatDate(order.created_at)}
                              </span>
                            </div>
                            <div>{getStatusBadge(order.status)}</div>
                          </div>

                          {/* Itens do Pedido */}
                          <div className="py-3 space-y-1.5">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-start justify-between text-xs text-[#333333]"
                              >
                                <div>
                                  <span className="font-semibold text-[#171717]">
                                    {item.quantity}x
                                  </span>{' '}
                                  <span>{item.name}</span>
                                  {item.size && (
                                    <span className="text-[#666666] text-[11px]">
                                      {' '}
                                      ({item.size})
                                    </span>
                                  )}
                                  {item.crust && (
                                    <span className="text-[#888888] text-[10px] block pl-5">
                                      Borda: {item.crust}
                                    </span>
                                  )}
                                  {item.extras && item.extras.length > 0 && (
                                    <span className="text-[#888888] text-[10px] block pl-5">
                                      Extras: {item.extras.join(', ')}
                                    </span>
                                  )}
                                </div>
                                <span className="font-medium text-[#171717] tabular-nums">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Totais e Informações de Entrega */}
                          <div className="pt-3 border-t border-[#F2F2F2] flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="text-[11px] text-[#666666]">
                              <p className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-[#999999]" />
                                <span>{order.customer_address}</span>
                              </p>
                              {order.coupon_code && (
                                <p className="text-[#8B0000] font-semibold flex items-center gap-1 mt-0.5">
                                  <Ticket className="w-3 h-3" />
                                  <span>Cupom aplicado: {order.coupon_code}</span>
                                </p>
                              )}
                            </div>

                            <div className="text-right">
                              {order.discount > 0 && (
                                <p className="text-[11px] text-emerald-600">
                                  Desconto: -{formatPrice(order.discount)}
                                </p>
                              )}
                              <p className="text-sm font-bold text-[#171717] tabular-nums">
                                Total: {formatPrice(order.total)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA 2: CUPONS & OFERTAS */}
              {activeTab === 'coupons' && (
                <div>
                  <div className="mb-4">
                    <p className="text-xs text-[#666666]">
                      Aproveite cupons de desconto exclusivos para membros do Clube Cantinho. Copie o código ou aplique direto no seu carrinho!
                    </p>
                  </div>

                  {loadingCoupons ? (
                    <div className="py-12 text-center text-xs text-[#777777] flex flex-col items-center gap-2">
                      <div className="w-7 h-7 border-2 border-[#8B0000] border-t-transparent rounded-full animate-spin" />
                      <span>Carregando cupons disponíveis...</span>
                    </div>
                  ) : coupons.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#777777]">
                      Nenhum cupom ativo no momento. Fique atento às nossas notificações!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {coupons.map((coupon) => (
                        <div
                          key={coupon.id}
                          className="relative p-4 rounded-2xl border border-dashed border-[#8B0000]/40 bg-gradient-to-br from-[#FFF9F9] to-[#FFFFFF] hover:border-[#8B0000] transition-all flex flex-col justify-between shadow-xs group"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              {coupon.badge && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8B0000]/10 text-[#8B0000]">
                                  <Sparkles className="w-3 h-3" />
                                  {coupon.badge}
                                </span>
                              )}
                              <span className="text-[11px] font-bold text-[#8B0000] uppercase tracking-wider">
                                {coupon.discount_type === 'percentage'
                                  ? `${coupon.discount_value}% OFF`
                                  : coupon.discount_type === 'delivery'
                                  ? 'FRETE GRÁTIS'
                                  : `R$ ${coupon.discount_value.toFixed(2)} OFF`}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-[#171717]">{coupon.title}</h4>
                            <p className="text-xs text-[#666666] mt-1 leading-relaxed">
                              {coupon.description}
                            </p>

                            {coupon.min_order_value ? (
                              <p className="text-[10px] text-[#888888] mt-2 font-medium">
                                Pedido mínimo: {formatPrice(coupon.min_order_value)}
                              </p>
                            ) : null}
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#F0E0E0] flex items-center justify-between gap-2">
                            <div className="px-2.5 py-1 rounded-lg bg-white border border-[#E0E0E0] font-mono text-xs font-bold text-[#171717] tracking-wider select-all">
                              {coupon.code}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopyCoupon(coupon.code)}
                                title="Copiar código"
                                className="px-2.5 py-1.5 rounded-lg border border-[#E0E0E0] hover:bg-[#F5F5F5] text-xs font-semibold text-[#171717] transition-all cursor-pointer flex items-center gap-1"
                              >
                                {copiedCode === coupon.code ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-600 text-[11px]">Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-[#666666]" />
                                    <span className="text-[11px]">Copiar</span>
                                  </>
                                )}
                              </button>

                              {onApplyCouponToCart && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onApplyCouponToCart(coupon);
                                    onClose();
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#8B0000] hover:bg-[#60030A] text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                                >
                                  <span className="text-[11px]">Usar</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ABA 3: DADOS CADASTRAIS */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                  <p className="text-xs text-[#666666]">
                    Mantenha seus dados atualizados para agilizar futuras entregas de pizzas quentinhas.
                  </p>

                  {profileSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{profileSuccessMsg}</span>
                    </div>
                  )}

                  {profileErrorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{profileErrorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E0E0E0] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] focus:outline-none text-xs text-[#171717]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1">
                      E-mail (Login de Acesso)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        disabled
                        value={customer?.email || ''}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#EAEAEA] bg-[#F9F9F9] text-xs text-[#777777] cursor-not-allowed"
                      />
                    </div>
                    <span className="text-[10px] text-[#888888] mt-1 block">
                      O e-mail é o seu identificador de segurança.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1">
                      Telefone / WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E0E0E0] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] focus:outline-none text-xs text-[#171717] tabular-nums"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1">
                      Endereço Principal de Entrega
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Rua, número, complemento e bairro"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E0E0E0] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] focus:outline-none text-xs text-[#171717]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1">
                      Observações ou Preferências de Pedido
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Sem cebola, massa bem crocante"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] focus:outline-none text-xs text-[#171717]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#60030A] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                    >
                      {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        ) : (
          /* Quando o usuário ainda não está autenticado */
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center mb-4">
              <User className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold font-inter text-[#171717]">
              Acesse sua Conta do Clube Cantinho
            </h3>

            <p className="text-xs text-[#666666] mt-2 max-w-sm leading-relaxed">
              Cadastre-se com sua senha ou faça login para consultar seus pedidos em andamento, resgatar cupons de desconto exclusivos e salvar seu endereço.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenRegister) onOpenRegister();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-[#8B0000] hover:bg-[#60030A] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Cadastrar / Entrar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
