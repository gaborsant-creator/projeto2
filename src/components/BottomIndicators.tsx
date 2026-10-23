import React from 'react';
import { AppState } from '../types';

interface BottomIndicatorsProps {
  currentState: AppState;
  activePageIndex?: number;
  onSelectPage?: (index: number) => void;
}

const SLIDE_ORDER: AppState[] = ['pizza', 'calabresa', 'frango', 'mussarela'];

export const BottomIndicators: React.FC<BottomIndicatorsProps> = ({
  currentState,
  activePageIndex,
  onSelectPage,
}) => {
  const isLightBg = currentState === 'calabresa';
  const resolvedIndex =
    activePageIndex !== undefined ? activePageIndex : SLIDE_ORDER.indexOf(currentState);

  return (
    <div className="hidden md:flex absolute bottom-6 md:bottom-8 inset-x-8 md:inset-x-12 z-35 items-center justify-between pointer-events-none transition-all duration-400 ease-out">
      {/* Bottom Left: 3 Pagination Dots (● ○ ○) */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {SLIDE_ORDER.map((_, idx) => {
          const isActive = idx === resolvedIndex;
          return (
            <button
              key={idx}
              onClick={() => onSelectPage?.(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                isActive
                  ? isLightBg
                    ? 'w-2.5 h-2.5 bg-[#8B0000] shadow-[0_0_8px_rgba(139,0,0,0.45)]'
                    : 'w-2.5 h-2.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                  : isLightBg
                  ? 'w-2 h-2 border border-[#8B0000]/50 bg-[#8B0000]/15 hover:bg-[#8B0000]/40'
                  : 'w-2 h-2 border border-white/50 bg-white/25 hover:bg-white/70'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
