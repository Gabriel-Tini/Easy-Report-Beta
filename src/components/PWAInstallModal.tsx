import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Share,
  PlusSquare,
  MoreVertical,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isIOS, isAndroid, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>(isIOS ? 'ios' : 'android');
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    setInstalling(true);
    const success = await install();
    setInstalling(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-zinc-900 border-t sm:border border-zinc-800 rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 max-h-[92vh] overflow-y-auto space-y-4 theme-modal-card">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center font-bold">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100 theme-text-primary">
                Baixar App no Celular
              </h2>
              <span className="text-[10px] text-zinc-400 theme-text-muted">
                Acesse direto da tela inicial sem precisar do link
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Se já estiver instalado em modo standalone */}
        {isInstalled && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>O aplicativo já está instalado e rodando em modo independente!</span>
          </div>
        )}

        {/* Botão de Instalação Direta (Android/Chrome/Edge quando suportado) */}
        {isInstallable && (
          <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300">
                Instalação Automática Disponível
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-[11px] text-zinc-300 theme-text-secondary">
              Seu navegador suporta instalação com 1 toque.
            </p>
            <button
              type="button"
              onClick={handleNativeInstall}
              disabled={installing}
              className="w-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs py-2.5 px-3 rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{installing ? 'Instalando...' : 'Instalar Agora no Aparelho'}</span>
            </button>
          </div>
        )}

        {/* Abas de Instrução por Sistema Operacional */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'android'
                ? 'bg-amber-400 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>Android (Chrome)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ios'
                ? 'bg-amber-400 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>iPhone / iOS (Safari)</span>
          </button>
        </div>

        {/* Conteúdo Android */}
        {activeTab === 'android' && (
          <div className="space-y-2.5 text-xs text-zinc-300 theme-text-secondary">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <span className="font-bold text-zinc-100 theme-text-primary block">
                    Abra o menu do Chrome
                  </span>
                  <span>
                    Toque no ícone de <strong>três pontinhos (⋮)</strong> no canto superior direito do navegador.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <span className="font-bold text-zinc-100 theme-text-primary block">
                    Selecione 'Instalar aplicativo'
                  </span>
                  <span>
                    Procure por <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <span className="font-bold text-zinc-100 theme-text-primary block">
                    Confirme a instalação
                  </span>
                  <span>
                    Toque em <strong>Instalar</strong>. O ícone aparecerá junto aos seus outros aplicativos na gaveta e tela de início.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo iOS (iPhone/iPad) */}
        {activeTab === 'ios' && (
          <div className="space-y-2.5 text-xs text-zinc-300 theme-text-secondary">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <span className="font-bold text-zinc-100 theme-text-primary block flex items-center gap-1.5">
                    Toque em Compartilhar no Safari
                    <Share className="w-3.5 h-3.5 text-sky-400" />
                  </span>
                  <span>
                    Na barra inferior do <strong>Safari</strong>, toque no ícone de <strong>Compartilhar</strong> (quadrado com seta apontando para cima).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <span className="font-bold text-zinc-100 theme-text-primary block flex items-center gap-1.5">
                    'Adicionar à Tela de Início'
                    <PlusSquare className="w-3.5 h-3.5 text-amber-400" />
                  </span>
                  <span>
                    Role o menu para baixo e toque na opção <strong>"Adicionar à Tela de Início"</strong>.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-zinc-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <span className="font-bold text-zinc-100 theme-text-primary block">
                    Toque em Adicionar
                  </span>
                  <span>
                    No canto superior direito da tela, toque em <strong>"Adicionar"</strong>. Pronto! O app fica como aplicativo nativo.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dica de Chão de Fábrica */}
        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400 theme-text-muted flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Após adicionar à tela inicial, o app abre instantaneamente em tela cheia e funciona mesmo sem sinal de internet na fábrica!
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-bold text-xs py-3 rounded-xl uppercase tracking-wider cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
