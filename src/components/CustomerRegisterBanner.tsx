import React, { useState } from 'react';
import { Sparkles, Phone, User, MapPin, CheckCircle2, Send, Ticket, ArrowRight } from 'lucide-react';
import { saveCustomer } from '../services/customerStorage';
import { formatPhoneMask } from './CustomerRegisterModal';
import { CustomerRecord } from '../services/storage';

interface CustomerRegisterBannerProps {
  onOpenRegister?: () => void;
  onOpenProfile?: () => void;
  customer?: CustomerRecord | null;
}

export const CustomerRegisterBanner: React.FC<CustomerRegisterBannerProps> = ({
  onOpenRegister,
  onOpenProfile,
  customer,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setLoading(true);
    await saveCustomer({
      name,
      phone,
      address,
      source: 'banner_site',
    });
    setLoading(false);
    setIsSuccess(true);
  };

  return (
    <div className="my-12 sm:my-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#2D0609] via-[#43090F] to-[#1F0407] p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-white/10">
      {/* Decorative background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#8B0000]/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[#E08B38]/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 text-amber-300 border border-white/15 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Clube de Vantagens Frutella
          </span>

          <h3 className="text-2xl sm:text-3xl font-bold font-inter tracking-tight text-white">
            Cadastre-se para Novidades & Ofertas Exclusivas
          </h3>

          <p className="text-xs sm:text-sm text-white/80 mt-2 leading-relaxed">
            Deixe seu nome e telefone para receber promoções especiais, cupons de primeira compra
            e atendimento prioritário da nossa pizzaria.
          </p>
        </div>

        <div className="w-full lg:max-w-md shrink-0">
          {customer ? (
            <div className="bg-white/95 rounded-2xl p-6 shadow-2xl text-[#171717] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center mb-3">
                <Ticket className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-[#171717]">
                Olá, {customer.name}!
              </h4>
              <p className="text-xs text-[#555555] mt-1 max-w-xs leading-relaxed">
                Você já faz parte do Clube Cantinho. Seus cupons exclusivos e histórico de pedidos estão disponíveis no seu perfil.
              </p>
              {onOpenProfile && (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="mt-4 w-full py-2.5 px-4 rounded-xl bg-[#8B0000] hover:bg-[#5E050B] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Ver Meus Cupons & Pedidos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : !isSuccess ? (
            <form
              onSubmit={handleSubmit}
              className="bg-white/95 rounded-2xl p-4 sm:p-5 shadow-2xl text-[#171717] flex flex-col gap-3"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu Nome Completo"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D9D9D9] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] focus:outline-none text-xs sm:text-sm text-[#171717]"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
                  placeholder="Telefone / WhatsApp (99) 99999-9999"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D9D9D9] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] focus:outline-none text-xs sm:text-sm text-[#171717] tabular-nums"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777777]">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Endereço (rua, número, bairro) - opcional"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D9D9D9] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] focus:outline-none text-xs sm:text-sm text-[#171717]"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim() || !phone.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-[#8B0000] hover:bg-[#5E050B] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Cadastrando...' : 'Quero me Cadastrar'}
              </button>

              {onOpenRegister && (
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="text-[11px] text-[#8B0000] font-semibold hover:underline text-center cursor-pointer"
                >
                  Prefere criar conta com senha? Clique aqui
                </button>
              )}
            </form>
          ) : (
            <div className="bg-white/95 rounded-2xl p-6 shadow-2xl text-[#171717] text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-[#171717]">
                Cadastro Realizado!
              </h4>
              <p className="text-xs text-[#555555] mt-1">
                Obrigado, <span className="font-semibold text-[#171717]">{name}</span>. Entraremos em contato em breve com você!
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setName('');
                  setPhone('');
                }}
                className="mt-3 text-[11px] font-semibold text-[#8B0000] hover:underline cursor-pointer"
              >
                Cadastrar outro número
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
