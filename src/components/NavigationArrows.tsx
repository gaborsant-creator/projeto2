import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AppState } from '../types';

interface NavigationArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  disabled?: boolean;
  currentState?: AppState;
}

export const NavigationArrows: React.FC<NavigationArrowsProps> = ({
  onPrev,
  onNext,
  disabled = false,
  currentState = 'pizza',
}) => {
  const isLightBg = currentState === 'calabresa';

  const buttonClasses = isLightBg
    ? 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-[#8B0000]/50 hover:border-[#8B0000] text-[#8B0000] flex items-center justify-center transition-all duration-300 hover:bg-[#8B0000]/10 active:scale-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-md backdrop-blur-[2px]'
    : 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border border-white/60 hover:border-white text-white flex items-center justify-center transition-all duration-300 hover:bg-white/15 active:scale-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg backdrop-blur-[2px]';

  return (
    <>
      {/* Left Arrow Button */}
      <div className="absolute left-[4%] sm:left-[5%] md:left-[6%] lg:left-[7%] top-[74%] md:top-[76%] -translate-y-1/2 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={onPrev}
          disabled={disabled}
          aria-label="Item anterior"
          className={buttonClasses}
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:-translate-x-0.5 stroke-[1.5]" />
        </button>
      </div>

      {/* Right Arrow Button */}
      <div className="absolute right-[4%] sm:right-[5%] md:right-[6%] lg:right-[7%] top-[74%] md:top-[76%] -translate-y-1/2 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={onNext}
          disabled={disabled}
          aria-label="Próximo item"
          className={buttonClasses}
        >
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-0.5 stroke-[1.5]" />
        </button>
      </div>
    </>
  );
};
