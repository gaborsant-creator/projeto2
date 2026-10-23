import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { BANNER_IMAGE } from '../data/menuData';

interface SpecialBannerProps {
  onViewCombos: () => void;
}

export const SpecialBanner: React.FC<SpecialBannerProps> = ({ onViewCombos }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="w-full my-14 sm:my-16">
      <div className="relative w-full rounded-2xl overflow-hidden bg-[#210407] border border-[#8B0000]/25 shadow-[0_10px_30px_rgba(94,5,11,0.12)] min-h-[280px] sm:min-h-[320px] md:min-h-[340px] flex items-center">
        {/* Background Gastronomic Image */}
        {!imgError && (
          <img
            src={BANNER_IMAGE}
            alt="Pizzas artesanais acompanhadas de tomates frescos e folhas de manjericão"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="absolute inset-0 w-full h-full object-cover object-right"
          />
        )}

        {/* Measured Gradient Scrim for High-Contrast Typography on the Left */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(28,3,6,0.96) 0%, rgba(44,5,10,0.92) 42%, rgba(44,5,10,0.45) 68%, rgba(28,3,6,0.05) 100%)',
          }}
        />

        {/* Mobile additional readability overlay */}
        <div className="absolute inset-0 bg-black/35 sm:bg-transparent pointer-events-none" />

        {/* Left Content Column */}
        <div className="relative z-10 w-full md:w-3/5 px-6 sm:px-10 md:px-14 py-8 sm:py-12 flex flex-col items-start text-left">
          <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
            COMBINAÇÕES ESPECIAIS
          </span>

          <h2 className="mt-2.5 text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold font-inter text-white leading-[1.12] tracking-tight">
            Pizzas que
            <br />
            combinam com você
          </h2>

          <p className="mt-3.5 text-xs sm:text-sm text-white/80 font-light leading-relaxed max-w-md">
            Experimente nossas combinações exclusivas e descubra novos sabores a cada mordida.
          </p>

          <button
            type="button"
            onClick={onViewCombos}
            className="mt-6 inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-white/45 hover:border-white bg-white/5 hover:bg-[#8B0000] text-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer group whitespace-nowrap"
          >
            <span>VER COMBINAÇÕES</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
