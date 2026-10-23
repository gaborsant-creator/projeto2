import React, { useState } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Flame,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { loginAdmin, AdminSession } from '../../services/storage';

interface AdminLoginProps {
  onLoginSuccess: (session: AdminSession) => void;
  onBackToMenu: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToMenu }) => {
  const [emailOrUser, setEmailOrUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!emailOrUser.trim() || !password) {
      setErrorMsg('Por favor, informe seu usuário/e-mail e senha.');
      return;
    }

    setIsLoading(true);
    try {
      const session = await loginAdmin(emailOrUser, password, rememberMe);
      onLoginSuccess(session);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F1115] flex flex-col justify-between items-center p-4 sm:p-6 text-white relative overflow-hidden select-none">
      {/* Luzes de Fundo Atmosféricas */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#8B0000]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Topo / Voltar */}
      <div className="w-full max-w-md flex items-center justify-between z-10 pt-2">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Voltar ao Cardápio</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Área Protegida</span>
        </div>
      </div>

      {/* Card Central de Login */}
      <div className="w-full max-w-md my-auto z-10">
        <div className="bg-[#181B20]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Cabeçalho do Card */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#8B0000] to-[#500307] text-white flex items-center justify-center shadow-lg border border-red-500/30">
              <Flame className="w-7 h-7 text-amber-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white pt-1">
              Acesso Administrativo
            </h1>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Painel de pedidos, clientes e cardápio restrito a administradores e gerentes.
            </p>
          </div>

          {/* Mensagem de Erro */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Formulário de Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Usuário / E-mail */}
            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="seu@email.com"
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] transition-colors"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                  Senha de Acesso
                </label>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-hidden focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Lembrar e Ações */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-gray-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-white/10 border-white/20 text-[#8B0000] focus:ring-0 cursor-pointer"
                />
                <span>Lembrar neste navegador</span>
              </label>

            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isLoading
                  ? 'bg-[#8B0000]/60 cursor-wait'
                  : 'bg-gradient-to-r from-[#8B0000] to-[#6d050a] hover:from-[#9c0202] hover:to-[#7f060d] active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Acessar Painel Admin</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Rodapé do Login */}
      <div className="text-center text-xs text-gray-500 py-3 z-10">
        Frutella Pizzas Artesanais · Controle de Acesso Restrito
      </div>
    </div>
  );
};
