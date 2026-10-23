import React from 'react';
import { AppState } from '../types';

interface ArcOverlayProps {
  currentState: AppState;
  onSelectFlavor?: (flavor: string) => void;
  onToggleState: () => void;
}

export const ArcOverlay: React.FC<ArcOverlayProps> = ({
  onSelectFlavor,
  onToggleState,
}) => {
  const isBlueberry = false;

  // Semicircle geometry (viewBox 1000 x 700)
  // Center lowered slightly to cy = 690 so the top apex of the arc (270deg) rests cleanly at y=270, below the subtitle
  const cx = 500;
  const cy = 690;
  const r = 420;

  const getCoord = (deg: number, offsetRadius = 0) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: cx + (r + offsetRadius) * Math.cos(rad),
      y: cy + (r + offsetRadius) * Math.sin(rad),
    };
  };

  // State 1 Dots (5 subtle glowing nodes)
  const state1Angles = [196, 230, 270, 310, 344];

  // State 2 Flavors & Nodes
  const state2Nodes = [
    { label: 'KIWI', angle: 210, textAngle: -60, offset: 28 },
    { label: 'NARANJA', angle: 238, textAngle: -32, offset: 28 },
    { label: 'ARÁNDANO', angle: 270, textAngle: 0, offset: 32, active: true },
    { label: 'FRUTILLA', angle: 302, textAngle: 32, offset: 28 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 1000 700"
        className="w-full h-full max-w-[1440px] max-h-[900px] object-contain translate-y-6 sm:translate-y-4 md:translate-y-0"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Subtle glow filter for nodes */}
          <filter id="arcGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="activeNodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* The Main Arc Line (common to both states) */}
        <path
          d={`M ${getCoord(186).x} ${getCoord(186).y} A ${r} ${r} 0 0 1 ${getCoord(354).x} ${getCoord(354).y}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.32)"
          strokeWidth="1.5"
          className="transition-colors duration-1000"
        />

        {/* STATE 1: 5 Semi-translucent Circular Nodes */}
        <g
          className={`transition-opacity duration-400 ease-in-out ${
            !isBlueberry ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {state1Angles.map((angle, idx) => {
            const pt = getCoord(angle);
            return (
              <g key={`state1-dot-${idx}`} className="pointer-events-auto cursor-pointer" onClick={onToggleState}>
                {/* Soft outer glow circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="9"
                  fill="rgba(255, 255, 255, 0.22)"
                  filter="url(#arcGlow)"
                  className="transition-transform duration-300 hover:scale-125"
                />
                {/* Inner white circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6.5"
                  fill="rgba(255, 255, 255, 0.45)"
                  stroke="rgba(255, 255, 255, 0.7)"
                  strokeWidth="1"
                />
              </g>
            );
          })}
        </g>

        {/* STATE 2: Labeled Fruit Nodes (KIWI, NARANJA, ARÁNDANO, FRUTILLA) */}
        <g
          className={`transition-opacity duration-400 ease-in-out ${
            isBlueberry ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {state2Nodes.map((node) => {
            const dotPt = getCoord(node.angle);
            const textPt = getCoord(node.angle, node.offset);

            if (node.active) {
              // Active Center Node (ARÁNDANO)
              return (
                <g
                  key={node.label}
                  className="pointer-events-auto cursor-pointer"
                  onClick={() => onSelectFlavor?.(node.label)}
                >
                  {/* Outer active pulse/glow halo */}
                  <circle
                    cx={dotPt.x}
                    cy={dotPt.y}
                    r="12"
                    fill="rgba(255, 255, 255, 0.15)"
                    filter="url(#activeNodeGlow)"
                  />
                  {/* Solid White Center Node */}
                  <circle
                    cx={dotPt.x}
                    cy={dotPt.y}
                    r="6.5"
                    fill="#ffffff"
                    className="drop-shadow-md"
                  />
                  {/* Subtle Inner Pin */}
                  <circle cx={dotPt.x} cy={dotPt.y} r="2" fill="#2d3b4a" />

                  {/* Labeled Flavor: ARÁNDANO */}
                  <text
                    x={textPt.x}
                    y={textPt.y - 12}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="13"
                    fontWeight="600"
                    letterSpacing="0.18em"
                    className="select-none font-sans drop-shadow-sm uppercase"
                  >
                    {node.label}
                  </text>
                </g>
              );
            }

            // Inactive Flavor Nodes (KIWI, NARANJA, FRUTILLA)
            return (
              <g
                key={node.label}
                className="pointer-events-auto cursor-pointer opacity-75 hover:opacity-100 transition-opacity"
                onClick={() => onSelectFlavor?.(node.label)}
              >
                {/* Translucent Hollow Node */}
                <circle
                  cx={dotPt.x}
                  cy={dotPt.y}
                  r="7"
                  fill="rgba(255, 255, 255, 0.2)"
                  stroke="rgba(255, 255, 255, 0.7)"
                  strokeWidth="1.2"
                  filter="url(#arcGlow)"
                />
                <circle cx={dotPt.x} cy={dotPt.y} r="3" fill="rgba(255, 255, 255, 0.9)" />

                {/* Flavor Label */}
                <text
                  x={textPt.x}
                  y={textPt.y + (node.angle === 270 ? -12 : node.angle < 270 ? -6 : -6)}
                  textAnchor={node.angle < 250 ? 'end' : node.angle > 290 ? 'start' : 'middle'}
                  fill="rgba(255, 255, 255, 0.65)"
                  fontSize="11.5"
                  fontWeight="500"
                  letterSpacing="0.16em"
                  className="select-none font-sans drop-shadow-sm uppercase"
                  transform={
                    node.angle !== 270
                      ? `rotate(${node.angle < 270 ? -16 : 16}, ${textPt.x}, ${textPt.y})`
                      : undefined
                  }
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
