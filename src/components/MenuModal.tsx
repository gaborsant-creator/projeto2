import React from 'react';
import { X, MapPin, Phone, Mail, Clock, Award, Sparkles } from 'lucide-react';
import { AppState } from '../types';

interface MenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'inicio' | 'produtos' | 'sobre' | 'contato';
  currentState: AppState;
  onSwitchState: (state: AppState) => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  currentState,
  onSwitchState,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#1a232f] border border-white/15 rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {activeTab === 'inicio' && (
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase font-medium tracking-widest text-white/50">
              Experiência Gastronômica
            </span>
            <h3 className="font-display text-2xl text-white">
              Da Fornalha Tradicional às Frutas Selecionadas
            </h3>
            <p className="text-sm text-white/75 leading-relaxed">
              Explore o contraste harmônico entre o calor da pizza artesanal clássica e a leveza refrescante das tortas e patisserie Frutella. Navegue utilizando as setas laterais ou o teclado para viver a rotação completa.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() => {
                  onSwitchState('pizza');
                  onClose();
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                  currentState === 'pizza'
                    ? 'border-white bg-white text-slate-950'
                    : 'border-white/20 hover:border-white/60 text-white'
                }`}
              >
                Slide 1: Calabresa
              </button>
              <button
                onClick={() => {
                  onSwitchState('calabresa');
                  onClose();
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                  currentState === 'calabresa'
                    ? 'border-white bg-white text-slate-950'
                    : 'border-white/20 hover:border-white/60 text-white'
                }`}
              >
                Slide 2: Margherita
              </button>
              <button
                onClick={() => {
                  onSwitchState('frango');
                  onClose();
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                  currentState === 'frango'
                    ? 'border-white bg-white text-slate-950'
                    : 'border-white/20 hover:border-white/60 text-white'
                }`}
              >
                Slide 3: Frango c/ Catupiry
              </button>
              <button
                onClick={() => {
                  onSwitchState('mussarela');
                  onClose();
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                  currentState === 'mussarela'
                    ? 'border-white bg-white text-slate-950'
                    : 'border-white/20 hover:border-white/60 text-white'
                }`}
              >
                Slide 4: Mussarela
              </button>
            </div>
          </div>
        )}

        {activeTab === 'produtos' && (
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase font-medium tracking-widest text-white/50">
              Cardápio Selecionado
            </span>
            <h3 className="font-display text-2xl text-white">
              Criações Exclusivas
            </h3>
            <div className="space-y-3 pt-1">
              <div
                onClick={() => {
                  onSwitchState('pizza');
                  onClose();
                }}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-medium text-white text-sm">
                    Pizza Artesanal de Calabresa
                  </h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    Massa maturada 48h com calabresa curada e orégano fresco
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-400">
                  R$ 49,90
                </span>
              </div>

              <div
                onClick={() => {
                  onSwitchState('calabresa');
                  onClose();
                }}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-medium text-white text-sm">
                    Pizza Margherita Artesanal
                  </h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    Molho de tomate artesanal, muçarela derretida, tomates frescos e manjericão
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-400">
                  R$ 46,90
                </span>
              </div>

              <div
                onClick={() => {
                  onSwitchState('frango');
                  onClose();
                }}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-medium text-white text-sm">
                    Pizza Frango com Catupiry
                  </h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    Frango desfiado temperado, muito catupiry e um toque especial de orégano
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-400">
                  R$ 52,90
                </span>
              </div>

              <div
                onClick={() => {
                  onSwitchState('mussarela');
                  onClose();
                }}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="font-medium text-white text-sm">
                    Pizza de Mussarela Clássica
                  </h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    Massa artesanal, molho especial e muita mussarela derretida
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-400">
                  R$ 44,90
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sobre' && (
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase font-medium tracking-widest text-white/50">
              Nossa Tradição & Conceito
            </span>
            <h3 className="font-display text-2xl text-white">
              A Arte do Equilíbrio
            </h3>
            <p className="text-sm text-white/75 leading-relaxed">
              Nascemos da paixão por alimentos autênticos. Dos ingredientes colhidos manualmente aos mestres pizzaiolos e confeiteiros dedicados à precisão de cada textura, crocância e aroma.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-white/80">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Ingredientes 100% Puros</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Sem Conservantes Artificiais</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contato' && (
          <div className="flex flex-col gap-4">
            <span className="text-xs uppercase font-medium tracking-widest text-white/50">
              Fale Conosco
            </span>
            <h3 className="font-display text-2xl text-white">
              Atendimento & Encomendas
            </h3>
            <div className="space-y-2.5 pt-1 text-sm text-white/80">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5">
                <Phone className="w-4 h-4 text-white/50" />
                <span>(11) 98765-4321 • WhatsApp</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5">
                <Mail className="w-4 h-4 text-white/50" />
                <span>pedidos@frutella-artisan.com.br</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5">
                <MapPin className="w-4 h-4 text-white/50" />
                <span>Alameda dos Sabores, 450 - Jardins, São Paulo</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5">
                <Clock className="w-4 h-4 text-white/50" />
                <span>Terça a Domingo: 12h00 às 23h30</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
