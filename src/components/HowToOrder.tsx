import React from 'react';
import { ShoppingCart, CreditCard, Bike, ArrowRight, ArrowDown } from 'lucide-react';

export const HowToOrder: React.FC = () => {
  const steps = [
    {
      number: '1. Escolha',
      description: 'Veja nosso cardápio e escolha seu sabor favorito.',
      icon: (
        <svg
          className="w-6 h-6 text-[#8B0000]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 11h.01" />
          <path d="M11 15h.01" />
          <path d="M16 16h.01" />
          <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
          <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
        </svg>
      ),
    },
    {
      number: '2. Carrinho',
      description: 'Confira seus produtos e ajuste seu pedido.',
      icon: <ShoppingCart className="w-6 h-6 text-[#8B0000] stroke-[1.5]" />,
    },
    {
      number: '3. Pagamento',
      description: 'Escolha a forma de pagamento e finalize.',
      icon: <CreditCard className="w-6 h-6 text-[#8B0000] stroke-[1.5]" />,
    },
    {
      number: '4. Receba',
      description: 'Acompanhe seu pedido até chegar.',
      icon: <Bike className="w-6 h-6 text-[#8B0000] stroke-[1.5]" />,
    },
  ];

  return (
    <div className="w-full pt-4 pb-8 text-center">
      {/* Header */}
      <div className="mb-10 sm:mb-12">
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8B0000] block">
          É MUITO SIMPLES
        </span>
        <h2 className="mt-1.5 text-2xl sm:text-3xl md:text-4xl font-bold font-inter text-[#171717] tracking-tight">
          Como fazer seu pedido
        </h2>
      </div>

      {/* 4 Horizontal Steps on Desktop / Stacked on Mobile */}
      <div className="flex flex-col md:flex-row items-center justify-between max-w-5xl mx-auto gap-4 md:gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={step.number}>
            {/* Step Item */}
            <div className="flex flex-col items-center text-center max-w-[200px] px-2 group">
              <div className="w-16 h-16 rounded-full border border-[#8B0000]/35 bg-[#FFFFFF] group-hover:border-[#8B0000] group-hover:bg-[#8B0000]/[0.04] transition-all duration-300 flex items-center justify-center shadow-[0_2px_10px_rgba(139,0,0,0.05)]">
                {step.icon}
              </div>

              <h3 className="mt-4 text-sm sm:text-[15px] font-bold text-[#171717]">
                {step.number}
              </h3>

              <p className="mt-1.5 text-xs text-[#666666] leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Connecting Arrow between steps */}
            {idx < steps.length - 1 && (
              <div className="flex items-center justify-center py-1 md:py-0 md:-mt-10 text-[#8B0000]/45">
                <ArrowRight className="hidden md:block w-4 h-4" />
                <ArrowDown className="block md:hidden w-4 h-4" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
