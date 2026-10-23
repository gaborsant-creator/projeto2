import React from 'react';
import { AppState } from '../types';
import pizzaMargheritaImg from '../assets/images/pizza_margherita_clean.png';
import pizzaCalabresaImg from '../assets/images/pizza_isolated.png';
import pizzaFrangoCatupiryImg from '../assets/images/pizza_frango_catupiry_v2.png';
import pizzaMussarelaImg from '../assets/images/pizza_mussarela_clean.png';

interface Product3DStageProps {
  currentState: AppState;
  rotationDeg: number;
  isAnimating: boolean;
  onProductClick?: () => void;
}

export const Product3DStage: React.FC<Product3DStageProps> = ({
  currentState,
  rotationDeg,
  onProductClick,
}) => {
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30 pointer-events-auto">
      {/* Product Disc Container */}
      <div
        className="w-[420px] sm:w-[540px] md:w-[620px] lg:w-[1008px] xl:w-[1094px] 2xl:w-[1176px] aspect-square flex items-center justify-center cursor-pointer select-none relative"
        onClick={onProductClick}
      >
        {/* 
          Steering wheel plane rotation container:
          Rotates around Z-axis like a car steering wheel (face always remains 100% frontal to camera)
        */}
        <div
          className="w-full h-full relative will-change-transform rounded-full"
          style={{
            transform: `rotate(${rotationDeg}deg)`,
            transition: 'transform 700ms cubic-bezier(0.42, 0, 0.58, 1)',
          }}
        >
          {/* ================= PRODUCT 1: CALABRESA PIZZA (FUNDO VERMELHO) ================= */}
          <div
            className={`absolute inset-0 w-full h-full rounded-full overflow-hidden ${
              currentState === 'pizza' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={pizzaCalabresaImg}
              alt="Pizza Artesanal de Calabresa"
              className="w-full h-full object-cover rounded-full pointer-events-none"
              draggable={false}
            />
          </div>

          {/* ================= PRODUCT 2: MARGHERITA PIZZA (FUNDO OFFWHITE) ================= */}
          <div
            className={`absolute inset-0 w-full h-full rounded-full overflow-hidden ${
              currentState === 'calabresa' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={pizzaMargheritaImg}
              alt="Pizza Artesanal Margherita"
              className="w-full h-full object-cover rounded-full pointer-events-none"
              draggable={false}
            />
          </div>

          {/* ================= PRODUCT 3: FRANGO COM CATUPIRY PIZZA (FUNDO MARROM ESCURO) ================= */}
          <div
            className={`absolute inset-0 w-full h-full rounded-full overflow-hidden ${
              currentState === 'frango' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={pizzaFrangoCatupiryImg}
              alt="Pizza Artesanal Frango com Catupiry"
              className="w-full h-full object-cover rounded-full pointer-events-none"
              draggable={false}
            />
          </div>

          {/* ================= PRODUCT 4: MUSSARELA PIZZA (FUNDO ESCURO) ================= */}
          <div
            className={`absolute inset-0 w-full h-full rounded-full overflow-hidden ${
              currentState === 'mussarela' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <img
              src={pizzaMussarelaImg}
              alt="Pizza Artesanal de Mussarela"
              className="w-full h-full object-cover rounded-full pointer-events-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
