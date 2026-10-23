import React, { useState } from 'react';
import { X, Check, ShoppingBag, Plus, Minus } from 'lucide-react';
import { AppState } from '../types';
import pizzaImg from '../assets/images/pizza_isolated.png';
import tortaImg from '../assets/images/torta_isolated.png';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: AppState;
  onAddToCart: (item: { name: string; price: number; quantity: number; size: string }) => void;
}

export const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const isBlueberry = false;
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Média');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const productInfo = isBlueberry
    ? {
        name: 'Torta Artesanal de Arándano Frutella',
        category: 'Patisserie & Frutas Selecionadas',
        basePrice: 58.0,
        sizes: [
          { name: 'Individual (200g)', multiplier: 0.55 },
          { name: 'Média (500g)', multiplier: 1.0 },
          { name: 'Grande (1kg)', multiplier: 1.7 },
        ],
        description:
          'Massa sablée amanteigada com creme pâtissière leve e cobertura generosa de mirtilos frescos colhidos no ponto ideal de maturação.',
        image: tortaImg,
      }
    : {
        name: 'Pizza Artesanal de Calabresa Especial',
        category: 'Forno a Lenha & Fermentação Natural',
        basePrice: 68.0,
        sizes: [
          { name: 'Broto (4 fatias)', multiplier: 0.65 },
          { name: 'Média (6 fatias)', multiplier: 1.0 },
          { name: 'Grande (8 fatias)', multiplier: 1.35 },
        ],
        description:
          'Massa de fermentação lenta 48h, molho de tomates San Marzano, mozzarella artesanal fatiada, calabresa curada premium e orégano fresco.',
        image: pizzaImg,
      };

  const currentMultiplier =
    productInfo.sizes.find((s) => s.name === selectedSize)?.multiplier || 1.0;
  const unitPrice = productInfo.basePrice * currentMultiplier;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    onAddToCart({
      name: productInfo.name,
      price: unitPrice,
      quantity,
      size: selectedSize,
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity">
      <div className="relative w-full max-w-lg bg-[#181f29] border border-white/15 rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/30 border border-white/10 flex-shrink-0 flex items-center justify-center">
              <img
                src={productInfo.image}
                alt={productInfo.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-[11px] font-medium tracking-wider uppercase text-white/50">
                {productInfo.category}
              </span>
              <h3 className="font-display text-lg sm:text-xl font-medium text-white leading-tight">
                {productInfo.name}
              </h3>
              <p className="text-sm font-semibold text-emerald-400 mt-1">
                R$ {unitPrice.toFixed(2)}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
            {productInfo.description}
          </p>

          {/* Size Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
              Tamanho / Porção
            </label>
            <div className="grid grid-cols-3 gap-2">
              {productInfo.sizes.map((size) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size.name)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                    selectedSize === size.name
                      ? 'border-white bg-white/15 text-white'
                      : 'border-white/15 hover:border-white/40 text-white/70'
                  }`}
                >
                  {size.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
              Quantidade
            </span>
            <div className="flex items-center gap-3 bg-white/10 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Total & Submit Button */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs text-white/50 block">Subtotal</span>
              <span className="font-semibold text-xl text-white">
                R$ {totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleConfirm}
              disabled={isSuccess}
              className={`px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                isSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-slate-950 hover:bg-white/90 active:scale-95'
              }`}
            >
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Adicionado!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Adicionar ao Pedido
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
