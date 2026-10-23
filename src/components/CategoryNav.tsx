import React from 'react';
import { CategoryId } from '../types';
import { CATEGORIES } from '../data/menuData';

interface CategoryNavProps {
  selectedCategory: CategoryId | null;
  onSelectCategory: (category: CategoryId | null) => void;
}

const CategoryIcon: React.FC<{ id: CategoryId; isActive: boolean }> = ({ id, isActive }) => {
  const strokeColor = isActive ? '#FFFFFF' : '#8B0000';
  const svgClass = "w-6 h-6 transition-all duration-300 ease-out group-hover:scale-110";

  switch (id) {
    case 'pizzas':
      return (
        <svg className={svgClass} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 11h.01" />
          <path d="M11 15h.01" />
          <path d="M16 16h.01" />
          <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
          <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
        </svg>
      );
    case 'pizzas-doces':
      return (
        <svg className={svgClass} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
          <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
          <path d="M13.5 11.5c.6-.8 1.6-.6 1.9.2s-.3 1.5-.9 1.8-1.5-.3-1-2Z" />
          <path d="M10 14.8c.4-.6 1.2-.5 1.4.1s-.2 1.1-.7 1.3-1.1-.2-.7-1.4Z" />
        </svg>
      );
    case 'esfihas':
      return (
        <svg className={svgClass} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3.5c1.8 0 7.8 11.5 6.8 14.2s-4.2 3.3-6.8 3.3-5.8-.6-6.8-3.3S10.2 3.5 12 3.5Z" />
          <ellipse cx="12" cy="14" rx="3.5" ry="3" />
        </svg>
      );
    case 'bebidas':
      return (
        <svg className={svgClass} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 10h10l-1 10H8L7 10Z" />
          <path d="M6 10h12" />
          <path d="m13 10 2-6h3" />
          <path d="M10 14h4" />
        </svg>
      );
    case 'sobremesas':
      return (
        <svg className={svgClass} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full py-2 mb-8 sm:mb-12">
      {/* 
        Container horizontal com padding vertical generoso (pt-4 pb-4) para 
        evitar que animações de elevação/hover (-translate-y-1 ou scale) 
        sejam cortadas pelo overflow horizontal do navegador.
      */}
      <div className="flex items-center justify-start sm:justify-center gap-6 sm:gap-10 md:gap-12 lg:gap-16 overflow-x-auto pt-4 pb-4 px-4 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(isActive ? null : cat.id)}
              className="group flex flex-col items-center text-center shrink-0 cursor-pointer focus:outline-none select-none transition-transform duration-300"
            >
              {/* Ícone circular com borda vinho e animação suave de hover */}
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 transition-all duration-300 ease-out flex items-center justify-center mb-2.5 overflow-hidden ${
                  isActive
                    ? 'bg-[#8B0000] border-[#8B0000] shadow-[0_8px_22px_rgba(139,0,0,0.32)] scale-105 -translate-y-1'
                    : 'bg-white border-[#8B0000]/30 shadow-xs group-hover:border-[#8B0000] group-hover:bg-[#8B0000]/[0.06] group-hover:shadow-[0_8px_20px_rgba(139,0,0,0.14)] group-hover:-translate-y-1 group-hover:scale-105'
                }`}
              >
                <CategoryIcon id={cat.id} isActive={isActive} />
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
