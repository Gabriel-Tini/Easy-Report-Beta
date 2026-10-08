import React from 'react';
import {
  X,
  Bell,
  Info,
  Check,
  Trash2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { useReportStore } from '../store/reportStore';

interface ModeratorNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModeratorNotificationsModal: React.FC<ModeratorNotificationsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    moderatorNotices,
    removeModeratorNotice,
    markNoticeAsRead,
  } = useReportStore();

  if (!isOpen) return null;

  const unreadCount = moderatorNotices.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    moderatorNotices.forEach((n) => {
      if (!n.isRead) {
        markNoticeAsRead(n.id);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="w-full sm:max-w-md theme-surface rounded-t-2xl sm:rounded-2xl border border-zinc-800 p-4 sm:p-5 max-h-[90vh] overflow-y-auto space-y-3.5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center font-bold shadow-xs">
              <Bell className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black uppercase tracking-wider theme-text-primary">
                  Notificações do Sistema
                </h2>
                {unreadCount > 0 && (
                  <span className="font-mono text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-zinc-950 shadow-2xs">
                    {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <span className="text-[10px] theme-text-muted">
                Avisos automáticos de turno • Exclusivo da programação
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Faixa Informativa: Uso Exclusivo da Programação e Ação de Marcar Lidos */}
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/5 dark:bg-black/30 border border-black/10 dark:border-zinc-800">
          <div className="flex items-center gap-1.5 text-[11px] theme-text-secondary">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-[10.5px]">Avisos pré-programados de turno (apenas sistema)</span>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              <span>Marcar lidos</span>
            </button>
          )}
        </div>

        {/* Lista de Notificações */}
        <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-0.5">
          {moderatorNotices.length === 0 ? (
            <div className="py-8 text-center theme-text-muted text-xs space-y-1">
              <Info className="w-6 h-6 mx-auto opacity-40 mb-1" />
              <p className="font-bold">Nenhum aviso ativo no momento.</p>
              <p className="text-[10px]">Notificações simples como Início de Turno aparecerão aqui.</p>
            </div>
          ) : (
            moderatorNotices.map((notice) => {
              let priorityBadge = (
                <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-zinc-800 text-zinc-300">
                  NORMAL
                </span>
              );

              if (notice.priority === 'alta') {
                priorityBadge = (
                  <span className="font-mono text-[9px] font-black px-1.5 py-0.2 rounded-md bg-amber-400 text-zinc-950 shadow-2xs">
                    ATENÇÃO
                  </span>
                );
              } else if (notice.priority === 'urgente') {
                priorityBadge = (
                  <span className="font-mono text-[9px] font-black px-1.5 py-0.2 rounded-md bg-red-500 text-white shadow-2xs">
                    URGENTE
                  </span>
                );
              }

              return (
                <div
                  key={notice.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    notice.isRead
                      ? 'theme-card-slot opacity-85'
                      : 'theme-card-slot border-amber-400/70 shadow-sm ring-1 ring-amber-400/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {priorityBadge}
                        <span className="font-black text-xs theme-text-primary">
                          {notice.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] theme-text-muted mt-1 font-mono">
                        <span className="font-bold text-amber-500">{notice.author}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {notice.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {!notice.isRead && (
                        <button
                          type="button"
                          onClick={() => markNoticeAsRead(notice.id)}
                          className="p-1 rounded-md text-amber-500 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                          title="Marcar como lido"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeModeratorNotice(notice.id)}
                        className="p-1 rounded-md text-zinc-500 hover:text-red-500 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                        title="Remover comunicado"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs theme-text-secondary mt-2 leading-relaxed bg-black/5 dark:bg-black/25 p-2 rounded-xl border border-black/5 dark:border-zinc-800">
                    {notice.message}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
