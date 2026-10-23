import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Banknote,
  QrCode,
  Phone,
  Ticket,
} from 'lucide-react';
import { CartItem } from '../types';
import { saveCustomer } from '../services/customerStorage';
import {
  createOrder,
  CustomerRecord,
  CouponRecord,
  fetchActiveCoupons,
  calculateCouponDiscount,
} from '../services/storage';
import { formatPhoneMask } from './CustomerRegisterModal';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  customer?: CustomerRecord | null;
  onOpenRegister?: () => void;
  appliedCoupon?: CouponRecord | null;
  onApplyCoupon?: (coupon: CouponRecord | null) => void;
}

export const Cart: React.FC<CartProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  customer,
  onOpenRegister,
  appliedCoupon,
  onApplyCoupon,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'cash'>('pix');
  const [customerName, setCustomerName] = useState(customer?.name || '');
  const [customerPhone, setCustomerPhone] = useState(customer?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(customer?.address || '');
  const [orderNumber, setOrderNumber] = useState<number>(1042);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Cupom manual no carrinho
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-preenche quando o cliente faz login
  React.useEffect(() => {
    if (customer) {
      if (!customerName) setCustomerName(customer.name);
      if (!customerPhone) setCustomerPhone(customer.phone);
      if (!customerAddress && customer.address) setCustomerAddress(customer.address);
    }
  }, [customer]);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitTotal * item.quantity,
    0
  );
  const deliveryFee = items.length > 0 ? 7.9 : 0;

  // Cálculo do desconto pelo cupom aplicado
  const discountCalc = appliedCoupon
    ? calculateCouponDiscount(appliedCoupon, subtotal, deliveryFee)
    : { valid: false, discount: 0 };

  const discount = discountCalc.valid ? discountCalc.discount : 0;
  const total = Math.max(0.01, Math.round((subtotal + deliveryFee - discount) * 100) / 100);

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleApplyCouponCode = async () => {
    if (!couponCodeInput.trim()) return;
    setCouponFeedback(null);

    const activeCoupons = await fetchActiveCoupons();
    const cleanCode = couponCodeInput.trim().toUpperCase();
    const found = activeCoupons.find((c) => c.code.toUpperCase() === cleanCode);

    if (!found) {
      setCouponFeedback({
        type: 'error',
        text: 'Cupom inválido ou expirado.',
      });
      return;
    }

    const calc = calculateCouponDiscount(found, subtotal, deliveryFee);
    if (!calc.valid) {
      setCouponFeedback({
        type: 'error',
        text: calc.message || 'Valor mínimo do pedido não atingido.',
      });
      return;
    }

    if (onApplyCoupon) {
      onApplyCoupon(found);
    }
    setCouponFeedback({
      type: 'success',
      text: `Cupom ${found.code} aplicado com sucesso!`,
    });
    setCouponCodeInput('');
  };

  const handleRemoveCoupon = () => {
    if (onApplyCoupon) {
      onApplyCoupon(null);
    }
    setCouponFeedback(null);
  };

  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setSubmitError('Por favor preencha seu nome, telefone e endereço completo.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const newOrderNumber = Math.floor(1000 + Math.random() * 9000);

    try {
      // 1. Grava o pedido de forma segura no histórico local
      await createOrder({
        order_number: newOrderNumber,
        customer_user_id: customer?.auth_user_id,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customer?.email,
        customer_address: customerAddress,
        coupon_code: appliedCoupon ? appliedCoupon.code : undefined,
        items: items.map((it) => ({
          product_id: it.product.id,
          name: it.product.name,
          quantity: it.quantity,
          size: it.size,
          crust: it.crust,
          price: it.unitTotal,
          extras: it.extras?.map((e) => e.name),
        })),
        subtotal: subtotal,
        delivery_fee: deliveryFee,
        discount: discount,
        total: total,
        status: 'novo',
        payment_method: paymentMethod,
        notes: `Pagamento via ${paymentMethod.toUpperCase()}${appliedCoupon ? ` | Cupom: ${appliedCoupon.code}` : ''}`,
      });

      // 2. Registra o cliente no storage local complementar
      saveCustomer({
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        notes: `Pedido #${newOrderNumber} (${items.length} itens, Total R$ ${formatCurrency(total)})`,
        source: 'checkout_pedido',
      });

      setOrderNumber(newOrderNumber);
      setStep('success');
      onClearCart();
    } catch (err: any) {
      console.error('Erro ao finalizar pedido:', err);
      setSubmitError(
        err?.message || 'Falha ao conectar com o banco de dados. O pedido não pôde ser gravado.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDrawer = () => {
    setStep('cart');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-xs transition-opacity"
      onClick={handleCloseDrawer}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#FFFFFF] h-full shadow-2xl flex flex-col justify-between text-[#171717] border-l border-[#E8E8E8]"
      >
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-[#E8E8E8] flex items-center justify-between bg-[#FFFFFF]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#171717]">
                {step === 'cart' && 'Seu Carrinho'}
                {step === 'checkout' && 'Finalizar Pedido'}
                {step === 'success' && 'Pedido Confirmado'}
              </h3>
              {step === 'cart' && (
                <span className="text-xs text-[#666666]">
                  {items.reduce((acc, i) => acc + i.quantity, 0)}{' '}
                  {items.reduce((acc, i) => acc + i.quantity, 0) === 1
                    ? 'item selecionado'
                    : 'itens selecionados'}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseDrawer}
            aria-label="Fechar carrinho"
            className="w-8 h-8 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center text-[#666666] hover:text-[#171717] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full border border-[#E8E8E8] flex items-center justify-center text-[#666666] mb-4">
                    <ShoppingBag className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  <h4 className="text-base font-bold text-[#171717]">
                    Seu carrinho está vazio
                  </h4>
                  <p className="text-xs text-[#666666] mt-1.5 max-w-xs leading-relaxed">
                    Explore nosso cardápio digital e adicione suas pizzas e combinações favoritas.
                  </p>
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="mt-6 px-6 py-2.5 rounded-full bg-[#8B0000] hover:bg-[#5E050B] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Ver Cardápio
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.cartItemId}
                      className="p-3.5 rounded-xl border border-[#E8E8E8] bg-[#FFFFFF] flex gap-3.5 items-start shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover shrink-0 bg-[#1e0a0d]"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-[#171717] truncate">
                            {item.product.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.cartItemId)}
                            aria-label="Remover produto"
                            className="text-[#666666] hover:text-[#8B0000] transition-colors cursor-pointer p-0.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-[11px] text-[#666666] mt-0.5">
                          Tam: {item.size} · Borda: {item.crust}
                        </p>

                        {item.extras.length > 0 && (
                          <p className="text-[11px] text-[#8B0000] mt-0.5">
                            + {item.extras.map((e) => e.name).join(', ')}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-bold text-[#171717] tabular-nums">
                            R$ {formatCurrency(item.unitTotal * item.quantity)}
                          </span>

                          <div className="flex items-center gap-2 border border-[#E8E8E8] rounded-full px-2 py-0.5">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.cartItemId, -1)}
                              className="w-6 h-6 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center text-[#171717] cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-[#171717] w-4 text-center tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.cartItemId, 1)}
                              className="w-6 h-6 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center text-[#171717] cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Seção de Cupom de Desconto */}
              {items.length > 0 && (
                <div className="mt-4 p-3.5 rounded-2xl bg-[#F8F6F4] border border-[#EAE6E2] space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#171717]">
                    <span className="flex items-center gap-1.5 text-[#8B0000]">
                      <Ticket className="w-3.5 h-3.5" />
                      Cupom de Desconto
                    </span>
                    {!customer && onOpenRegister && (
                      <button
                        type="button"
                        onClick={onOpenRegister}
                        className="text-[11px] text-[#8B0000] hover:underline font-semibold cursor-pointer"
                      >
                        Entrar p/ ver cupons ➔
                      </button>
                    )}
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <span className="font-bold">{appliedCoupon.code}</span>
                        <span className="text-[11px] text-emerald-600">({appliedCoupon.title})</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="Código do cupom (ex: BEMVINDO10)"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-[#DCD6D0] bg-white text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-[#8B0000]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCouponCode}
                        disabled={!couponCodeInput.trim()}
                        className="px-3.5 py-1.5 rounded-xl bg-[#8B0000] hover:bg-[#60030A] disabled:opacity-50 text-white text-xs font-semibold cursor-pointer transition-colors"
                      >
                        Aplicar
                      </button>
                    </div>
                  )}

                  {couponFeedback && (
                    <p
                      className={`text-[11px] ${
                        couponFeedback.type === 'success' ? 'text-emerald-700 font-medium' : 'text-rose-600'
                      }`}
                    >
                      {couponFeedback.text}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleFinishOrder} className="space-y-5">
              {!customer && onOpenRegister && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#8B0000] text-xs flex items-center justify-between">
                  <span>Já possui cadastro? Entre para preencher seus dados.</span>
                  <button
                    type="button"
                    onClick={onOpenRegister}
                    className="underline font-bold cursor-pointer shrink-0 ml-2"
                  >
                    Fazer Login
                  </button>
                </div>
              )}
              {submitError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  <p className="font-bold">Aviso de gravação do pedido:</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed">{submitError}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                  Seu Nome
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ex: Gabriel Santana"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8E8] focus:border-[#8B0000] focus:outline-none text-sm text-[#171717]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(formatPhoneMask(e.target.value))}
                  placeholder="(99) 99999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8E8] focus:border-[#8B0000] focus:outline-none text-sm text-[#171717] tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                  Endereço de Entrega
                </label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Rua, Número, Bairro e Complemento"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8E8] focus:border-[#8B0000] focus:outline-none text-sm text-[#171717]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-2">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-[#8B0000] bg-[#8B0000]/[0.05] text-[#8B0000]'
                        : 'border-[#E8E8E8] text-[#666666]'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>PIX</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#8B0000] bg-[#8B0000]/[0.05] text-[#8B0000]'
                        : 'border-[#E8E8E8] text-[#666666]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Cartão</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all ${
                      paymentMethod === 'cash'
                        ? 'border-[#8B0000] bg-[#8B0000]/[0.05] text-[#8B0000]'
                        : 'border-[#E8E8E8] text-[#666666]'
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span>Dinheiro</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="w-16 h-16 rounded-full bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8B0000]">
                Pedido #{orderNumber}
              </span>
              <h4 className="text-xl font-bold text-[#171717] mt-1">
                Pedido recebido com sucesso!
              </h4>
              <p className="text-xs text-[#666666] mt-2 max-w-xs leading-relaxed">
                Nossa cozinha artesanal já está preparando seu pedido. Tempo estimado de entrega: 30–40 min.
              </p>
              <button
                type="button"
                onClick={handleCloseDrawer}
                className="mt-7 px-7 py-3 rounded-full bg-[#8B0000] hover:bg-[#5E050B] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Voltar ao Cardápio
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && step !== 'success' && (
          <div className="p-6 border-t border-[#E8E8E8] bg-[#FAFAFA] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#666666]">
                <span>Subtotal</span>
                <span className="tabular-nums">R$ {formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Taxa de entrega</span>
                <span className="tabular-nums">R$ {formatCurrency(deliveryFee)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                  <span className="flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5" />
                    Desconto {appliedCoupon ? `(${appliedCoupon.code})` : ''}
                  </span>
                  <span className="tabular-nums">- R$ {formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#171717] pt-2 border-t border-[#E8E8E8]">
                <span>Total</span>
                <span className="text-[#8B0000] tabular-nums">
                  R$ {formatCurrency(total)}
                </span>
              </div>
            </div>

            {step === 'cart' ? (
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  className="w-full py-3.5 px-6 rounded-full bg-[#8B0000] hover:bg-[#5E050B] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <span>Finalizar Pedido</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCloseDrawer}
                  className="w-full py-2.5 px-6 rounded-full border border-[#E8E8E8] hover:border-[#171717] text-[#171717] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className={`w-full py-3.5 px-6 rounded-full bg-[#8B0000] hover:bg-[#5E050B] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-md ${
                    isSubmitting ? 'opacity-70 cursor-wait' : 'cursor-pointer'
                  }`}
                >
                  <span>{isSubmitting ? 'Processando Pedido...' : 'Confirmar e Pagar'}</span>
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep('cart')}
                  className="w-full py-2.5 px-6 rounded-full border border-[#E8E8E8] hover:border-[#171717] text-[#666666] hover:text-[#171717] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Voltar ao Carrinho
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
