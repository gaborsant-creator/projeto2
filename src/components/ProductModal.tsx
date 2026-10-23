import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingCart, Check } from 'lucide-react';
import { MenuProduct, CartItemExtra } from '../types';

interface ProductModalProps {
  product: MenuProduct | null;
  onClose: () => void;
  onAddConfiguredToCart: (config: {
    product: MenuProduct;
    size: string;
    sizePriceDelta: number;
    crust: string;
    crustPrice: number;
    extras: CartItemExtra[];
    quantity: number;
    unitTotal: number;
  }) => void;
}

const SIZE_OPTIONS = [
  { label: 'Pequena (4 fatias)', value: 'Pequena', delta: -6.0 },
  { label: 'Média (6 fatias)', value: 'Média', delta: 0.0 },
  { label: 'Grande (8 fatias)', value: 'Grande', delta: 0.0 },
];

const CRUST_OPTIONS = [
  { label: 'Tradicional', value: 'Tradicional', price: 0.0 },
  { label: 'Catupiry', value: 'Catupiry', price: 8.0 },
  { label: 'Cheddar Cremoso', value: 'Cheddar', price: 8.0 },
];

const EXTRA_OPTIONS: CartItemExtra[] = [
  { name: 'Bacon', price: 6.0 },
  { name: 'Queijo', price: 5.0 },
  { name: 'Manjericão Fresco', price: 3.5 },
];

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddConfiguredToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('Grande');
  const [selectedCrust, setSelectedCrust] = useState<string>('Tradicional');
  const [selectedExtras, setSelectedExtras] = useState<CartItemExtra[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setSelectedSize('Grande');
      setSelectedCrust('Tradicional');
      setSelectedExtras([]);
      setQuantity(1);
      setAddedFeedback(false);
    }
  }, [product]);

  if (!product) return null;

  const isPizza = product.category === 'pizzas' || product.category === 'pizzas-doces';
  const sizeObj = SIZE_OPTIONS.find((s) => s.value === selectedSize) || SIZE_OPTIONS[2];
  const crustObj = CRUST_OPTIONS.find((c) => c.value === selectedCrust) || CRUST_OPTIONS[0];
  const extrasSum = selectedExtras.reduce((acc, item) => acc + item.price, 0);

  const unitTotal = isPizza
    ? Math.max(10, product.price + sizeObj.delta + crustObj.price + extrasSum)
    : product.price;
  const grandTotal = unitTotal * quantity;

  const toggleExtra = (extra: CartItemExtra) => {
    setSelectedExtras((prev) => {
      const exists = prev.some((e) => e.name === extra.name);
      if (exists) {
        return prev.filter((e) => e.name !== extra.name);
      }
      return [...prev, extra];
    });
  };

  const handleConfirmAdd = () => {
    onAddConfiguredToCart({
      product,
      size: isPizza ? selectedSize : 'Padrão',
      sizePriceDelta: isPizza ? sizeObj.delta : 0,
      crust: isPizza ? selectedCrust : 'Sem borda',
      crustPrice: isPizza ? crustObj.price : 0,
      extras: isPizza ? selectedExtras : [],
      quantity,
      unitTotal,
    });
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
      onClose();
    }, 650);
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#FFFFFF] border border-[#E8E8E8] rounded-2xl shadow-2xl text-[#171717]"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/45 hover:bg-black/65 text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Header */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#1e0a0d]">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-semibold block">
              Cardápio Artesanal Frutella
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white uppercase tracking-tight mt-0.5">
              {product.category === 'pizzas' ? `Pizza ${product.name}` : product.name}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <p className="text-sm text-[#666666] leading-relaxed border-b border-[#E8E8E8] pb-4">
            {product.description}
          </p>

          {/* Pizza Specific Options: Tamanho, Borda e Adicionais */}
          {isPizza && (
            <>
              {/* 1. Escolha o tamanho */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-3">
                  Escolha o tamanho:
                </h4>
                <div className="space-y-2">
                  {SIZE_OPTIONS.map((size) => {
                    const isSelected = selectedSize === size.value;
                    return (
                      <label
                        key={size.value}
                        onClick={() => setSelectedSize(size.value)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#8B0000] bg-[#8B0000]/[0.04]'
                            : 'border-[#E8E8E8] hover:border-[#8B0000]/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#8B0000]' : 'border-[#666666]'
                            }`}
                          >
                            {isSelected && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#8B0000]" />
                            )}
                          </span>
                          <span className="text-sm font-medium text-[#171717]">
                            {size.value}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-[#666666] tabular-nums">
                          {size.delta < 0
                            ? `- R$ ${formatCurrency(Math.abs(size.delta))}`
                            : 'Padrão'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 2. Borda */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-3">
                  Borda:
                </h4>
                <div className="space-y-2">
                  {CRUST_OPTIONS.map((crust) => {
                    const isSelected = selectedCrust === crust.value;
                    return (
                      <label
                        key={crust.value}
                        onClick={() => setSelectedCrust(crust.value)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#8B0000] bg-[#8B0000]/[0.04]'
                            : 'border-[#E8E8E8] hover:border-[#8B0000]/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#8B0000]' : 'border-[#666666]'
                            }`}
                          >
                            {isSelected && (
                              <span className="w-2.5 h-2.5 rounded-full bg-[#8B0000]" />
                            )}
                          </span>
                          <span className="text-sm font-medium text-[#171717]">
                            {crust.label}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[#8B0000] tabular-nums">
                          {crust.price > 0 ? `+ R$ ${formatCurrency(crust.price)}` : 'Sem custo'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 3. Adicionais */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717] mb-3">
                  Adicionais:
                </h4>
                <div className="space-y-2">
                  {EXTRA_OPTIONS.map((extra) => {
                    const isChecked = selectedExtras.some((e) => e.name === extra.name);
                    return (
                      <label
                        key={extra.name}
                        onClick={() => toggleExtra(extra)}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                          isChecked
                            ? 'border-[#8B0000] bg-[#8B0000]/[0.04]'
                            : 'border-[#E8E8E8] hover:border-[#8B0000]/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-[#8B0000] border-[#8B0000] text-white'
                                : 'border-[#666666] bg-white'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                          <span className="text-sm font-medium text-[#171717]">
                            {extra.name}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[#8B0000] tabular-nums">
                          + R$ {formatCurrency(extra.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* 4. Quantidade & Total */}
          <div className="pt-4 border-t border-[#E8E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#666666]">
                Quantidade:
              </span>
              <div className="flex items-center gap-3 border border-[#E8E8E8] rounded-full px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center text-[#171717] transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-bold text-[#171717] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center text-[#171717] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] uppercase tracking-wider text-[#666666] block">
                TOTAL
              </span>
              <span className="text-xl font-bold text-[#8B0000] tabular-nums">
                R$ {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Submit Button: [ ADICIONAR AO CARRINHO ] */}
          <button
            type="button"
            onClick={handleConfirmAdd}
            className={`w-full py-3.5 px-6 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer shadow-md ${
              addedFeedback
                ? 'bg-[#5E050B] text-white'
                : 'bg-[#8B0000] hover:bg-[#9E0B0B] active:bg-[#5E050B] text-white hover:-translate-y-0.5'
            }`}
          >
            {addedFeedback ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>ADICIONADO AO CARRINHO!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>ADICIONAR AO CARRINHO</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
