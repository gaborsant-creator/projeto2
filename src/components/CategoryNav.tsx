import React, { useState, useEffect, useMemo } from 'react';
import { CategoryId } from '../types';
import { getStoredCategories, getStoredProducts, CategoryRecord } from '../services/storage';

interface CategoryNavProps {
  selectedCategory: CategoryId | null;
  onSelectCategory: (category: CategoryId | null) => void;
}

export interface CategoryIconOption {
  id: string;
  label: string;
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { id: 'pizza', label: 'Pizza' },
  { id: 'acai', label: 'Açaí' },
  { id: 'doce', label: 'Pizza Doce' },
  { id: 'esfiha', label: 'Esfiha' },
  { id: 'bebida', label: 'Bebidas' },
  { id: 'sobremesa', label: 'Sobremesas' },
  { id: 'hamburguer', label: 'Hambúrguer' },
  { id: 'combo', label: 'Combos / Fogo' },
  { id: 'cafe', label: 'Café' },
  { id: 'porcao', label: 'Porções / Fritas' },
  { id: 'star', label: 'Destaque / Especial' },
];

export const CategoryIcon: React.FC<{
  icon?: string;
  id?: string;
  isActive?: boolean;
  className?: string;
}> = ({
  icon,
  id,
  isActive = false,
  className = 'w-6 h-6 transition-all duration-300 ease-out group-hover:scale-110',
}) => {
  const strokeColor = isActive ? '#FFFFFF' : '#8B0000';
  const key = (icon || id || 'pizza').toLowerCase();

  if (key === 'acai' || key.includes('acai')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        {/* Tigela de Açaí */}
        <path d="M3 11c0 5 4 9 9 9s9-4 9-9H3Z" />
        <path d="M8.5 20h7" />
        {/* Colher inclinada */}
        <path d="m15.5 3.5 3.5-1.5" />
        <path d="M15.5 3.5a3 3 0 0 0-3 3v4.5" />
        {/* Frutas / bagas de açaí na cobertura */}
        <circle cx="7.5" cy="8.5" r="1.8" />
        <circle cx="11.5" cy="7.5" r="1.6" />
      </svg>
    );
  }

  if (key === 'pizzas' || key === 'pizza') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 11h.01" />
        <path d="M11 15h.01" />
        <path d="M16 16h.01" />
        <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
        <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
      </svg>
    );
  }

  if (key === 'pizzas-doces' || key === 'doce') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
        <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
        <path d="M13.5 11.5c.6-.8 1.6-.6 1.9.2s-.3 1.5-.9 1.8-1.5-.3-1-2Z" />
        <path d="M10 14.8c.4-.6 1.2-.5 1.4.1s-.2 1.1-.7 1.3-1.1-.2-.7-1.4Z" />
      </svg>
    );
  }

  if (key === 'esfihas' || key === 'esfiha') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.5c1.8 0 7.8 11.5 6.8 14.2s-4.2 3.3-6.8 3.3-5.8-.6-6.8-3.3S10.2 3.5 12 3.5Z" />
        <ellipse cx="12" cy="14" rx="3.5" ry="3" />
      </svg>
    );
  }

  if (key === 'bebidas' || key === 'bebida') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 10h10l-1 10H8L7 10Z" />
        <path d="M6 10h12" />
        <path d="m13 10 2-6h3" />
        <path d="M10 14h4" />
      </svg>
    );
  }

  if (key === 'sobremesas' || key === 'sobremesa') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
        <path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1" />
        <path d="M2 21h20" />
        <path d="M7 8v3" />
        <path d="M12 8v3" />
        <path d="M17 8v3" />
        <path d="M7 4h.01" />
        <path d="M12 4h.01" />
        <path d="M17 4h.01" />
      </svg>
    );
  }

  if (key === 'hamburguer') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11a8 8 0 0 1 16 0H4Z" />
        <rect width="18" height="2.5" x="3" y="13.5" rx="1.25" />
        <path d="M5 19a3 3 0 0 0 3 2h8a3 3 0 0 0 3-2H5Z" />
        <path d="M7 10v.01" />
        <path d="M12 8v.01" />
        <path d="M16 10v.01" />
      </svg>
    );
  }

  if (key === 'combo') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    );
  }

  if (key === 'cafe') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
        <line x1="6" x2="6" y1="2" y2="4" />
        <line x1="10" x2="10" y1="2" y2="4" />
        <line x1="14" x2="14" y1="2" y2="4" />
      </svg>
    );
  }

  if (key === 'porcao') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 11 2 10h10l2-10H5Z" />
        <path d="M8 11V4" />
        <path d="M12 11V3" />
        <path d="M16 11V5" />
      </svg>
    );
  }

  // Fallback: Estrela / Destaque
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const [categoriesList, setCategoriesList] = useState<CategoryRecord[]>(() => getStoredCategories());
  const [productsList, setProductsList] = useState(() => getStoredProducts());

  useEffect(() => {
    const handleCatsUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setCategoriesList(e.detail);
      }
    };

    const handleProdsUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setProductsList(e.detail);
      }
    };

    window.addEventListener('cantinho:categories_updated', handleCatsUpdated);
    window.addEventListener('cantinho:products_updated', handleProdsUpdated);

    return () => {
      window.removeEventListener('cantinho:categories_updated', handleCatsUpdated);
      window.removeEventListener('cantinho:products_updated', handleProdsUpdated);
    };
  }, []);

  const activeCategoriesWithCount = useMemo(() => {
    return categoriesList
      .filter((c) => c.active !== false)
      .sort((a, b) => a.order_index - b.order_index)
      .map((cat) => {
        const count = productsList.filter(
          (p) => p.category === cat.id && p.active !== false
        ).length;
        return {
          ...cat,
          count,
        };
      });
  }, [categoriesList, productsList]);

  return (
    <div className="w-full py-2 mb-8 sm:mb-12">
      <div className="flex items-center justify-start sm:justify-center gap-6 sm:gap-10 md:gap-12 lg:gap-16 overflow-x-auto pt-4 pb-4 px-4 no-scrollbar">
        {activeCategoriesWithCount.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(isActive ? null : cat.id)}
              className="group flex flex-col items-center text-center shrink-0 cursor-pointer focus:outline-none select-none transition-transform duration-300"
            >
              {/* Ícone circular com borda vinho e animação de elevação */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 transition-all duration-300 ease-out flex items-center justify-center mb-2.5 overflow-hidden ${
                  isActive
                    ? 'bg-[#8B0000] border-[#8B0000] shadow-[0_8px_22px_rgba(139,0,0,0.32)] scale-105 -translate-y-1'
                    : 'bg-white border-[#8B0000]/30 shadow-xs group-hover:border-[#8B0000] group-hover:bg-[#8B0000]/[0.06] group-hover:shadow-[0_8px_20px_rgba(139,0,0,0.14)] group-hover:-translate-y-1 group-hover:scale-105'
                }`}
              >
                <CategoryIcon icon={cat.icon} id={cat.id} isActive={isActive} />
              </div>

              {/* Nome da categoria */}
              <span
                className={`text-xs sm:text-[13px] font-semibold tracking-wide transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-[#8B0000]'
                    : 'text-[#171717] group-hover:text-[#8B0000]'
                }`}
              >
                {cat.name}
              </span>

              {/* Quantidade */}
              <span className="text-[11px] text-[#666666] group-hover:text-[#8B0000]/80 mt-0.5 tabular-nums transition-colors font-medium">
                ({cat.count})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
