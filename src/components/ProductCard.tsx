import React, { useState } from 'react';
import { Heart, ShoppingCart, Check } from 'lucide-react';
import { MenuProduct } from '../types';
import { resolveProductImage } from '../services/storage';

interface ProductCardProps {
  product: MenuProduct;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
  onSelectProduct: (product: MenuProduct) => void;
  onQuickAdd: (product: MenuProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onSelectProduct,
  onQuickAdd,
}) => {
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAdd(product);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1000);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(product.id);
  };

  const formattedPrice = product.price.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group bg-[#FFFFFF] border border-[#E8E8E8] rounded-xl overflow-hidden shadow-[0_2px_14px_rgba(0,0,0,0.035)] hover:shadow-[0_12px_28px_rgba(139,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1e0a0d]">
        {!imgError ? (
          <img
            src={resolveProductImage(product.image, product.id)}
            alt={product.name}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#5E050B] to-[#1e0a0d] text-white/80 text-sm font-medium px-4 text-center">
            {product.name}
          </div>
        )}

        {/* Subtle top gradient for heart icon legibility */}
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center transition-all duration-200 cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors duration-200 ${
              isFavorite
                ? 'fill-[#8B0000] text-[#8B0000] scale-110'
                : 'text-white/90 hover:text-white'
            }`}
          />
        </button>
      </div>

      {/* Card Information Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-[#FFFFFF]">
        <div>
          <h3 className="text-base sm:text-[17px] font-bold text-[#171717] group-hover:text-[#8B0000] transition-colors leading-snug">
            {product.name}
          </h3>
          <p className="text-xs sm:text-[13px] text-[#666666] leading-relaxed mt-1.5 line-clamp-2 min-h-[38px]">
            {product.description}
          </p>
        </div>

        <div className="mt-4 pt-1">
          {/* Price */}
          <div className="text-base sm:text-[17px] font-bold text-[#171717] mb-3.5 tabular-nums">
            R$ {formattedPrice}
          </div>

          {/* Action Button: [ 🛒 ADICIONAR ] */}
          <button
            type="button"
            onClick={handleQuickAddClick}
            className={`w-full py-2.5 px-4 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
              justAdded
                ? 'bg-[#5E050B] text-white shadow-sm'
                : 'bg-[#8B0000] hover:bg-[#9E0B0B] active:bg-[#5E050B] text-white shadow-[0_2px_8px_rgba(139,0,0,0.2)] hover:shadow-[0_5px_14px_rgba(139,0,0,0.3)] hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>ADICIONADO</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>ADICIONAR</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
