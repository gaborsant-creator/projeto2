import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import { signUpCustomer, signInCustomer, CustomerRecord } from '../services/storage';
import { saveCustomer } from '../services/customerStorage';

interface CustomerRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAuthenticated?: (customer: CustomerRecord) => void;
  onOpenProfile?: () => void;
}

export const formatPhoneMask = (val: string): string => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export const CustomerRegisterModal: React.FC<CustomerRegisterModalProps> = ({
  isOpen,
  onClose,
  onCustomerAuthenticated,
  onOpenProfile,
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'signup') {
      if (!name.trim() || !phone.trim() || !email.trim() || !password) {
        setErrorMessage('Por favor preencha nome, e-mail, telefone e crie uma senha.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
        return;
      }

      setLoading(true);
      try {
        const { customer } = await signUpCustomer({
          name,
          email,
          phone,
          password,
          address,
          notes,
        });

        saveCustomer({
          name,
          phone,
          address,
          notes,
          source: 'cadastro_site',
        });

        if (onCustomerAuthenticated) {
          onCustomerAuthenticated(customer);
        }

        setIsSubmitted(true);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Falha ao realizar cadastro. Tente novamente.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!email.trim() || !password) {
        setErrorMessage('Informe seu e-mail e senha cadastrados.');
        return;
      }

      setLoading(true);
      try {
        const customer = await signInCustomer(email, password);
        if (onCustomerAuthenticated) {
          onCustomerAuthenticated(customer);
        }
        handleClose();
        if (onOpenProfile) {
          onOpenProfile();
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'E-mail ou senha incorretos.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setErrorMessage(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setAddress('');
    setNotes('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm transition-opacity"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white border border-[#E8E8E8] rounded-3xl shadow-2xl p-6 sm:p-8 text-[#171717] overflow-hidden max-h-[92vh] overflow-y-auto"
      >
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#8B0000] via-[#C93B2B] to-[#8B0000]" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar"
          className="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-[#F5F5F5] flex items-center justify-center text-[#666666] hover:text-[#171717] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>

            {/* Alternador de Modo: Cadastro vs Login */}
            <div className="flex items-center p-1 rounded-xl bg-[#F4F4F4] mb-4">
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-white text-[#8B0000] shadow-xs'
                    : 'text-[#666666] hover:text-[#171717]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar Conta</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-[#8B0000] shadow-xs'
                    : 'text-[#666666] hover:text-[#171717]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Já Tenho Conta</span>
              </button>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold font-inter text-[#171717] tracking-tight">
              {mode === 'signup' ? 'Cadastro do Cliente' : 'Entrar na Minha Conta'}
            </h3>

            <p className="text-xs text-[#666666] mt-1 leading-relaxed">
              {mode === 'signup'
                ? 'Cadastre-se com sua senha para acompanhar o histórico dos seus pedidos, salvar endereços e receber cupons exclusivos.'
                : 'Acesse seus pedidos, cupons ativos e dados de entrega.'}
            </p>

            {errorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1">
                    Nome Completo <span className="text-[#8B0000]">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E0E0E0] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] focus:outline-none text-xs text-[#171717]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1">
                  E-mail <span className="text-[#8B0000]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E0E0E0] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] focus:outline-none text-xs text-[#171717]"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1">
                    Telefone / WhatsApp <span className="text-[#8B0000]">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneMask(e.target.value))}
                      placeholder="(11) 99999-9999"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E0E0E0] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] focus:outline-none text-xs text-[#171717] tabular-nums"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#171717]">
                    Senha <span className="text-[#8B0000]">*</span>
                  </label>
                  {mode === 'signup' && (
                    <span className="text-[10px] text-[#888888]">Mínimo 6 caracteres</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[#E0E0E0] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] focus:outline-none text-xs text-[#171717]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#171717] p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1">
                      Endereço de Entrega <span className="text-[#888888] font-normal normal-case">(opcional)</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Rua, número, bairro e complemento"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#E0E0E0] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] focus:outline-none text-xs text-[#171717]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#171717] mb-1">
                      Pizza Favorita ou Observações <span className="text-[#888888] font-normal normal-case">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ex: Adoro massa fininha, prefiro sem cebola"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0E0E0] focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] focus:outline-none text-xs text-[#171717]"
                    />
                  </div>
                </>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#8B0000] hover:bg-[#60030A] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  {loading ? (
                    'Processando...'
                  ) : mode === 'signup' ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Cadastrar e Ativar Cupons</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Entrar na Minha Conta</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center pt-1">
                {mode === 'signup' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className="text-xs text-[#8B0000] hover:underline font-semibold cursor-pointer"
                  >
                    Já possui conta? Clique aqui para entrar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setErrorMessage(null);
                    }}
                    className="text-xs text-[#8B0000] hover:underline font-semibold cursor-pointer"
                  >
                    Novo por aqui? Crie sua conta com senha
                  </button>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-bold font-inter text-[#171717] tracking-tight">
              Conta Criada com Sucesso!
            </h3>

            <p className="text-xs text-[#666666] mt-2 max-w-xs leading-relaxed">
              Bem-vindo ao Clube Cantinho, <span className="font-semibold text-[#171717]">{name}</span>! Sua senha foi registrada e você já tem cupons especiais disponíveis.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5 w-full">
              {onOpenProfile && (
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onOpenProfile();
                  }}
                  className="flex-1 px-5 py-2.5 rounded-xl bg-[#8B0000] hover:bg-[#60030A] text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                >
                  Ver Meus Cupons & Perfil
                </button>
              )}

              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-5 py-2.5 rounded-xl border border-[#E0E0E0] hover:bg-[#F5F5F5] text-[#171717] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Continuar no Cardápio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
