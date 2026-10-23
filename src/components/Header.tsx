import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, User, Clock, Ticket, LogOut } from 'lucide-react';
import { AppState } from '../types';
import { CustomerRecord, signOutCustomer } from '../services/storage';

interface HeaderProps {
  currentState: AppState;
  onOpenCart: () => void;
  onOpenMenuModal: (tab: 'inicio' | 'produtos' | 'sobre' | 'contato') => void;
  onOpenRegister?: () => void;
  onOpenProfile?: (tab?: 'orders' | 'profile' | 'coupons') => void;
  customer?: CustomerRecord | null;
  cartCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentState,
  onOpenCart,
  onOpenMenuModal,
  onOpenRegister,
  onOpenProfile,
  customer,
  cartCount,
}) => {
  const isLightBg = currentState === 'calabresa';
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="relative z-40 w-full px-6 md:px-12 pt-6 pb-4 select-none">
      <div className="max-w-7xl mx-auto relative flex items-center justify-between min-h-[44px]">
        {/* Left Slot: Logo Frutella */}
        <div className="flex items-center z-10">
          <div
            onClick={() => onOpenMenuModal('inicio')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            {/* Delicate two-leaf sprout icon */}
            <svg
              className={`w-5 h-5 transition-all duration-300 group-hover:scale-110 ${
                isLightBg ? 'text-[#8B0000]' : 'text-white'
              }`}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 3c-1.5 3-4.5 5.5-8 6 1.5 5.5 5.5 8.5 8 9 2.5-.5 6.5-3.5 8-9-3.5-.5-6.5-3-8-6z"
                opacity="0.3"
              />
              <path d="M12 2C9.5 5 6 7 2 7.5c1.5 6 6 9.5 10 10.5 4-1 8.5-4.5 10-10.5C18 7 14.5 5 12 2zm-1.5 13.8c-2.4-.8-5.3-3.2-6.5-6.8 2.6-.4 5-1.7 6.5-3.6v10.4zm3 0V5.4c1.5 1.9 3.9 3.2 6.5 3.6-1.2 3.6-4.1 6-6.5 6.8z" />
            </svg>
            <span
              className={`font-sans text-xl font-normal tracking-normal transition-colors duration-300 ${
                isLightBg ? 'text-[#171717]' : 'text-white'
              }`}
            >
              frutella
            </span>
          </div>
        </div>

        {/* Center Navigation */}
        <div className="hidden md:flex absolute inset-x-0 items-center justify-center pointer-events-none">
          <nav
            className={`flex items-center gap-8 text-sm font-normal tracking-wide pointer-events-auto transition-colors duration-300 ${
              isLightBg ? 'text-[#171717]/85' : 'text-white/90'
            }`}
          >
            <button
              onClick={() => onOpenMenuModal('inicio')}
              className={`transition-colors cursor-pointer ${
                isLightBg ? 'hover:text-[#8B0000]' : 'hover:text-white'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => onOpenMenuModal('produtos')}
              className={`transition-colors cursor-pointer ${
                isLightBg ? 'hover:text-[#8B0000]' : 'hover:text-white'
              }`}
            >
              Produtos
            </button>
            <button
              onClick={() => onOpenMenuModal('sobre')}
              className={`transition-colors cursor-pointer ${
                isLightBg ? 'hover:text-[#8B0000]' : 'hover:text-white'
              }`}
            >
              Sobre
            </button>
            <button
              onClick={() => onOpenMenuModal('contato')}
              className={`transition-colors cursor-pointer ${
                isLightBg ? 'hover:text-[#8B0000]' : 'hover:text-white'
              }`}
            >
              Contato
            </button>
          </nav>
        </div>

        {/* Right Slot: Profile/Account + Cart + COMPRE AGORA */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 md:gap-5 z-20">
          {/* User Account / Profile & Order History */}
          <div ref={userMenuRef} className="relative flex items-center">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              aria-label={customer ? 'Meu Perfil e Histórico de Pedidos' : 'Minha Conta'}
              title={
                customer
                  ? `Minha Conta (${customer.name || 'Cliente'}) - Histórico de Pedidos e Perfil`
                  : 'Minha Conta ou Cadastro'
              }
              className={`relative flex items-center justify-center p-1.5 rounded-full transition-all cursor-pointer ${
                isLightBg
                  ? 'text-[#171717]/85 hover:text-[#8B0000] hover:bg-black/5'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              } ${isUserMenuOpen ? (isLightBg ? 'bg-black/10 text-[#8B0000]' : 'bg-white/20 text-white') : ''}`}
            >
              <User className="w-4 h-4" />
              {customer && (
                <span
                  className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 border border-white shadow-xs"
                  title="Cadastrado / Conectado"
                />
              )}
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 text-left z-50 animate-in fade-in zoom-in-95 duration-150">
                {customer ? (
                  <>
                    {/* Header Info Logged */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-[#FAFAFA] rounded-t-2xl">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Cadastrado
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Minha Conta</span>
                      </div>
                      <p className="text-sm font-bold text-[#171717] truncate">
                        {customer.name || 'Cliente Frutella'}
                      </p>
                      {customer.phone && (
                        <p className="text-xs text-[#666666] truncate mt-0.5">{customer.phone}</p>
                      )}
                    </div>

                    {/* Menu Options */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenProfile?.('orders');
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#171717] hover:text-[#8B0000] hover:bg-[#8B0000]/5 flex items-center gap-3 transition-colors cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-[#171717]">Histórico de Pedidos</p>
                          <p className="text-[11px] text-[#777777] font-normal truncate">Acompanhar e repetir pedidos</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenProfile?.('profile');
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#171717] hover:text-[#8B0000] hover:bg-[#8B0000]/5 flex items-center gap-3 transition-colors cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-[#171717]">Meu Perfil</p>
                          <p className="text-[11px] text-[#777777] font-normal truncate">Endereço e dados pessoais</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenProfile?.('coupons');
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#171717] hover:text-[#8B0000] hover:bg-[#8B0000]/5 flex items-center gap-3 transition-colors cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Ticket className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-[#171717]">Cupons & Ofertas</p>
                          <p className="text-[11px] text-[#777777] font-normal truncate">Descontos disponíveis</p>
                        </div>
                      </button>
                    </div>

                    <div className="border-t border-gray-100 pt-1 mt-1 px-1">
                      <button
                        type="button"
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await signOutCustomer();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sair da conta</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Header Info Guest */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-[#FAFAFA] rounded-t-2xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Clube Frutella</p>
                      <p className="text-xs font-bold text-[#171717] mt-0.5">Acesse sua conta ou cadastre-se</p>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenRegister?.();
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#171717] hover:text-[#8B0000] hover:bg-[#8B0000]/5 flex items-center gap-3 transition-colors cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-[#171717]">Cadastre-se ou Entre</p>
                          <p className="text-[11px] text-[#777777] font-normal truncate">Ganhe 10% OFF no primeiro pedido</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Shopping cart icon with badge */}
          <button
            onClick={onOpenCart}
            aria-label="Carrinho de Compras"
            className={`relative flex items-center gap-1.5 transition-colors cursor-pointer ${
              isLightBg
                ? 'text-[#171717]/85 hover:text-[#8B0000]'
                : 'text-white/85 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="-top-2 -right-2.5 text-[10px] font-bold leading-none px-1.5 py-0.5 rounded-full bg-[#8B0000] border border-white/40 text-white shadow-sm tabular-nums">
                {cartCount}
              </span>
            )}
          </button>

          {/* Pill Outline Button: COMPRE AGORA */}
          <button
            onClick={onOpenCart}
            className={`px-4 sm:px-5 py-2 rounded-full border text-xs font-semibold uppercase tracking-wider active:scale-95 transition-all duration-200 cursor-pointer shadow-sm whitespace-nowrap ${
              isLightBg
                ? 'border-[#8B0000]/75 hover:border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white'
                : `border-white/70 hover:border-white text-white hover:bg-white ${
                    currentState === 'frango' || currentState === 'mussarela'
                      ? 'hover:text-[#17110C]'
                      : 'hover:text-[#5c0c14]'
                  }`
            }`}
          >
            COMPRE AGORA
          </button>
        </div>
      </div>
    </header>
  );
};
