import React from 'react';
import { AppState } from '../types';
import pepperoniSliceImg from '../assets/images/pepperoni_slice_png.png';
import basilLeafImg from '../assets/images/basil_leaf_png.png';
import frangoBowlImg from '../assets/images/frango_bowl_clean.png';
import shreddedChickenImg from '../assets/images/shredded_chicken_clean.png';
import catupiryDollopImg from '../assets/images/catupiry_dollop_clean.png';
import tomatoSliceImg from '../assets/images/tomato_slice_clean.png';
import cherryTomatoImg from '../assets/images/cherry_tomato_clean.png';
import mussarelaBowlImg from '../assets/images/mussarela_bowl_clean.png';
import tomatoSauceBowlImg from '../assets/images/tomato_sauce_bowl_clean.png';
import mussarelaBallSlicesImg from '../assets/images/mussarela_ball_slices_clean.png';
import halvedCherryTomatoesImg from '../assets/images/halved_cherry_tomatoes_clean.png';
import cherryTomatoVineImg from '../assets/images/cherry_tomato_vine_clean.png';

interface FloatingElementsProps {
  currentState: AppState;
}

export const FloatingElements: React.FC<FloatingElementsProps> = ({ currentState }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-25">
      {/* ============================================================== */}
      {/* STATE 1: PEPPERONI SLICES, BASIL LEAVES & CHILI CRUMBS */}
      {/* ============================================================== */}
      <div
        className={`absolute inset-0 transition-all duration-400 ease-out ${
          currentState === 'pizza'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Left Side: Top Basil Leaf */}
        <div
          className="absolute left-[1%] top-[8%] md:top-[10%] w-20 md:w-28 lg:w-32 animate-float-slow"
          style={{ transform: 'rotate(-12deg)' }}
        >
          <img
            src={basilLeafImg}
            alt="Folha de manjericão fresca"
            className="w-full h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Left Side: Pepperoni Slice 1 (Top Left) */}
        <div
          className="absolute left-[4%] md:left-[5%] top-[14%] md:top-[16%] w-24 md:w-32 lg:w-36 animate-float-mid"
          style={{ transform: 'rotate(-15deg)' }}
        >
          <img
            src={pepperoniSliceImg}
            alt="Fatia artesanal de calabresa"
            className="w-full h-auto drop-shadow-[0_14px_28px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Left Side: Mid Basil Leaf */}
        <div
          className="absolute left-[0.5%] top-[34%] md:top-[36%] w-18 md:w-24 lg:w-28 animate-float-reverse"
          style={{ transform: 'rotate(25deg)' }}
        >
          <img
            src={basilLeafImg}
            alt="Folha de manjericão"
            className="w-full h-auto drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Left Side: Pepperoni Slice 2 (Tilted Mid-Left) */}
        <div
          className="absolute left-[4%] md:left-[5%] top-[46%] md:top-[48%] w-20 md:w-28 lg:w-32 animate-float-slow"
          style={{ transform: 'rotate(-38deg) scaleY(0.85)' }}
        >
          <img
            src={pepperoniSliceImg}
            alt="Fatia de calabresa inclinada"
            className="w-full h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.55)]"
          />
        </div>

        {/* Left Side: Inward Leaf near Arc */}
        <div
          className="absolute left-[11%] md:left-[12%] top-[34%] md:top-[36%] w-16 md:w-22 lg:w-26 animate-float-mid"
          style={{ transform: 'rotate(15deg)' }}
        >
          <img
            src={basilLeafImg}
            alt="Folha aromática"
            className="w-full h-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]"
          />
        </div>

        {/* Right Side: Pepperoni Slice 3 (Upper Right) */}
        <div
          className="absolute right-[5%] md:right-[6.5%] top-[27%] md:top-[29%] w-24 md:w-32 lg:w-36 animate-float-reverse"
          style={{ transform: 'rotate(20deg)' }}
        >
          <img
            src={pepperoniSliceImg}
            alt="Fatia de pepperoni crocante"
            className="w-full h-auto drop-shadow-[0_14px_28px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Right Side: Basil Leaf pointing inwards */}
        <div
          className="absolute right-[0.5%] top-[16%] md:top-[18%] w-20 md:w-26 lg:w-30 animate-float-slow"
          style={{ transform: 'rotate(-45deg)' }}
        >
          <img
            src={basilLeafImg}
            alt="Folha de manjericão"
            className="w-full h-auto drop-shadow-[0_12px_22px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Right Side: Basil Leaf 2 (Mid Right) */}
        <div
          className="absolute right-[8%] md:right-[9.5%] top-[50%] md:top-[52%] w-16 md:w-22 lg:w-26 animate-float-mid"
          style={{ transform: 'rotate(-18deg)' }}
        >
          <img
            src={basilLeafImg}
            alt="Folha de manjericão fresca"
            className="w-full h-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* STATE 2: MARGHERITA ARTESANAL (Rodelas de tomate fresco, tomate cereja e manjericão) */}
      {/* ============================================================== */}
      <div
        className={`absolute inset-0 transition-all duration-400 ease-out ${
          currentState === 'calabresa'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Left Side: Top Basil Leaf */}
        <div
          className="absolute left-[1%] top-[8%] md:top-[10%] w-20 md:w-28 lg:w-32 animate-float-slow"
          style={{ transform: 'rotate(-14deg)' }}
        >
          <img
            src={basilLeafImg}
            alt="Folha de manjericão fresca"
            className="w-full h-auto drop-shadow-[0_12px_20px_rgba(0,0,0,0.18)]"
          />
        </div>

        {/* Left Side: Rodela de Tomate Fresco 1 (Top Left) */}
        <div
          className="absolute left-[4%] md:left-[5%] top-[15%] md:top-[17%] w-22 md:w-28 lg:w-32 animate-float-mid"
          style={{ transform: 'rotate(-18deg)' }}
        >
          <img
            src={tomatoSliceImg}
            alt="Rodela de tomate fresco"
            className="w-full h-auto drop-shadow-[0_14px_24px_rgba(139,0,0,0.2)]"
          />
        </div>

        {/* Left Side: Tomate Cereja Fresco (Mid Left) */}
        <div
          className="absolute left-[1.5%] md:left-[2.5%] top-[33%] md:top-[35%] w-16 md:w-20 lg:w-24 animate-float-reverse"
          style={{ transform: 'rotate(14deg)' }}
        >
          <img
            src={cherryTomatoImg}
            alt="Tomate cereja fresco"
            className="w-full h-auto drop-shadow-[0_12px_20px_rgba(139,0,0,0.22)]"
          />
        </div>

        {/* Left Side: Folha de Manjericão (Inward near Arc) */}
        <div
          className="absolute left-[11%] md:left-[12%] top-[34%] md:top-[36%] w-16 md:w-20 lg:w-24 animate-float-mid"
          style={{ transform: 'rotate(18deg)' }}
        >
          <img
            src={basilLeafImg}
            alt="Folha de manjericão aromática"
            className="w-full h-auto drop-shadow-[0_10px_18px_rgba(0,0,0,0.18)]"
          />
        </div>

        {/* Right Side: Rodela de Tomate Fresco 2 (Upper Right) */}
        <div
          className="absolute right-[5%] md:right-[6.5%] top-[26%] md:top-[28%] w-22 md:w-28 lg:w-34 animate-float-reverse"
          style={{ transform: 'rotate(24deg)' }}
        >
          <img
            src={tomatoSliceImg}
            alt="Rodela de tomate maduro"
            className="w-full h-auto drop-shadow-[0_14px_24px_rgba(139,0,0,0.2)]"
          />
        </div>

        {/* Right Side: Folha de Manjericão (Upper Far Right) */}
        <div
          className="absolute right-[0.5%] top-[15%] md:top-[17%] w-20 md:w-26 lg:w-30 animate-float-slow"
          style={{ transform: 'rotate(-42deg)' }}
        >
          <img
            src={basilLeafImg}
            alt="Folha de manjericão"
            className="w-full h-auto drop-shadow-[0_12px_20px_rgba(0,0,0,0.18)]"
          />
        </div>

        {/* Right Side: Tomate Cereja Fresco 2 (Lower Right) */}
        <div
          className="absolute right-[3.5%] md:right-[4.5%] top-[58%] md:top-[60%] w-16 md:w-20 lg:w-24 animate-float-slow"
          style={{ transform: 'rotate(-16deg)' }}
        >
          <img
            src={cherryTomatoImg}
            alt="Tomate cereja orgânico"
            className="w-full h-auto drop-shadow-[0_12px_20px_rgba(139,0,0,0.2)]"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* STATE 3: FRANGO COM CATUPIRY (Tigela de madeira com frango desfiado, gotas de catupiry e frango temperado) */}
      {/* ============================================================== */}
      <div
        className={`absolute inset-0 transition-all duration-400 ease-out ${
          currentState === 'frango'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Left Edge: Wooden bowl filled with seasoned shredded chicken (partially cropped at left edge like the reference) */}
        <div
          className="absolute -left-[6%] sm:-left-[4.5%] md:-left-[3.5%] top-[13%] md:top-[14%] w-32 sm:w-40 md:w-52 lg:w-60 animate-float-slow"
        >
          <img
            src={frangoBowlImg}
            alt="Tigela de madeira com frango desfiado temperado"
            className="w-full h-auto drop-shadow-[0_18px_34px_rgba(0,0,0,0.65)]"
          />
        </div>

        {/* Upper-Left (next to bowl): Shredded chicken piece 1 */}
        <div
          className="absolute left-[8.5%] md:left-[9.5%] top-[16%] md:top-[17%] w-16 sm:w-20 md:w-24 lg:w-28 animate-float-mid"
          style={{ transform: 'rotate(-16deg)' }}
        >
          <img
            src={shreddedChickenImg}
            alt="Frango desfiado temperado"
            className="w-full h-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Mid-Left: Creamy white Catupiry dollop */}
        <div
          className="absolute left-[10%] md:left-[11%] top-[32%] md:top-[33%] w-16 sm:w-20 md:w-24 lg:w-28 animate-float-reverse"
          style={{ transform: 'rotate(-20deg)' }}
        >
          <img
            src={catupiryDollopImg}
            alt="Gota cremosa de Catupiry"
            className="w-full h-auto drop-shadow-[0_14px_26px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Lower-Mid Left: Shredded chicken piece 2 */}
        <div
          className="absolute left-[4%] md:left-[5%] top-[44%] md:top-[45%] w-20 sm:w-24 md:w-32 lg:w-36 animate-float-slow"
          style={{ transform: 'rotate(24deg)' }}
        >
          <img
            src={shreddedChickenImg}
            alt="Pedaço de frango desfiado"
            className="w-full h-auto drop-shadow-[0_14px_26px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Mid-Upper Right: Creamy white Catupiry dollop */}
        <div
          className="absolute right-[5.5%] md:right-[6.5%] top-[25%] md:top-[26%] w-18 sm:w-22 md:w-28 lg:w-32 animate-float-reverse"
          style={{ transform: 'rotate(155deg) scaleX(-1)' }}
        >
          <img
            src={catupiryDollopImg}
            alt="Catupiry cremoso"
            className="w-full h-auto drop-shadow-[0_16px_28px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Mid-Right: Shredded chicken piece 3 */}
        <div
          className="absolute right-[2%] md:right-[3%] top-[39%] md:top-[40%] w-22 sm:w-28 md:w-34 lg:w-40 animate-float-mid"
          style={{ transform: 'rotate(-28deg)' }}
        >
          <img
            src={shreddedChickenImg}
            alt="Frango desfiado temperado"
            className="w-full h-auto drop-shadow-[0_14px_28px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* STATE 4: MUSSARELA (Tigela de mussarela ralada, bolas e fatias de mussarela fresca, tomates-cereja cortados e no ramo e tigela de molho especial) */}
      {/* ============================================================== */}
      <div
        className={`absolute inset-0 transition-all duration-400 ease-out ${
          currentState === 'mussarela'
            ? 'opacity-100 scale-100'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* Top-Left Edge: Wooden bowl filled with shredded mozzarella (partially cropped at left edge like the reference) */}
        <div
          className="absolute -left-[7%] sm:-left-[5.5%] md:-left-[4.5%] top-[2%] md:top-[3%] w-36 sm:w-44 md:w-56 lg:w-64 animate-float-slow"
        >
          <img
            src={mussarelaBowlImg}
            alt="Tigela de madeira com mussarela ralada"
            className="w-full h-auto drop-shadow-[0_18px_34px_rgba(0,0,0,0.7)]"
          />
        </div>

        {/* Mid-Left: Fresh white mozzarella ball & thick creamy slices */}
        <div
          className="absolute -left-[2%] sm:-left-[1.5%] md:-left-[1%] top-[30%] md:top-[31%] w-36 sm:w-44 md:w-56 lg:w-64 animate-float-mid"
          style={{ transform: 'rotate(-8deg)' }}
        >
          <img
            src={mussarelaBallSlicesImg}
            alt="Bola e fatias de mussarela fresca"
            className="w-full h-auto drop-shadow-[0_16px_30px_rgba(0,0,0,0.65)]"
          />
        </div>

        {/* Lower-Mid Left: Two halved juicy red cherry tomatoes */}
        <div
          className="absolute left-[4%] md:left-[5%] top-[48%] md:top-[49%] w-20 sm:w-24 md:w-28 lg:w-32 animate-float-reverse"
          style={{ transform: 'rotate(-18deg)' }}
        >
          <img
            src={halvedCherryTomatoesImg}
            alt="Tomates-cereja cortados ao meio"
            className="w-full h-auto drop-shadow-[0_14px_26px_rgba(0,0,0,0.65)]"
          />
        </div>

        {/* Top-Right Corner: Cluster of glossy red cherry tomatoes on the vine */}
        <div
          className="absolute -right-[3%] sm:-right-[2%] md:-right-[1.5%] -top-[1%] md:top-[0%] w-32 sm:w-40 md:w-48 lg:w-56 animate-float-slow"
          style={{ transform: 'rotate(-8deg)' }}
        >
          <img
            src={cherryTomatoVineImg}
            alt="Cacho de tomates-cereja frescos na rama"
            className="w-full h-auto drop-shadow-[0_18px_32px_rgba(0,0,0,0.65)]"
          />
        </div>

        {/* Upper-Mid Right Edge: Wooden bowl filled with rich red tomato sauce (partially cropped at right edge) */}
        <div
          className="absolute -right-[7%] sm:-right-[5.5%] md:-right-[4.5%] top-[20%] md:top-[21%] w-32 sm:w-40 md:w-48 lg:w-56 animate-float-reverse"
        >
          <img
            src={tomatoSauceBowlImg}
            alt="Tigela de madeira com molho de tomate especial"
            className="w-full h-auto drop-shadow-[0_18px_34px_rgba(0,0,0,0.7)]"
          />
        </div>

        {/* Mid-Right: Fresh white mozzarella ball & slice */}
        <div
          className="absolute right-[1%] md:right-[1.5%] top-[37%] md:top-[38%] w-34 sm:w-42 md:w-52 lg:w-60 animate-float-mid"
          style={{ transform: 'rotate(12deg) scaleX(-1)' }}
        >
          <img
            src={mussarelaBallSlicesImg}
            alt="Mussarela fresca cremosa"
            className="w-full h-auto drop-shadow-[0_16px_30px_rgba(0,0,0,0.65)]"
          />
        </div>
      </div>
    </div>
  );
};
