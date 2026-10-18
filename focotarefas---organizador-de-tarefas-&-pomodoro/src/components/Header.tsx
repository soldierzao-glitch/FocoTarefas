import React from 'react';
import { Sun, Moon, Plus, Bell, Volume2, Timer, Archive, LayoutDashboard } from 'lucide-react';
import { requestNotificationPermission, getNotificationPermission } from '../utils/notifications';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenNewSection: () => void;
  onScrollToPomodoro: () => void;
  pomodoroTimeLeft: string;
  isPomodoroRunning: boolean;
  onTestAlarm: () => void;
  currentTab: 'dashboard' | 'archived';
  onSelectTab: (tab: 'dashboard' | 'archived') => void;
  archivedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  onOpenNewSection,
  onScrollToPomodoro,
  pomodoroTimeLeft,
  isPomodoroRunning,
  onTestAlarm,
  currentTab,
  onSelectTab,
  archivedCount,
}) => {
  const [notifState, setNotifState] = React.useState(getNotificationPermission());

  const handleRequestNotif = async () => {
    const granted = await requestNotificationPermission();
    setNotifState(granted ? 'granted' : 'denied');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-black text-lg shadow-sm">
            ✓
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-neutral-900 dark:text-white leading-none">
              FocoTarefas
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              Organizador & Pomodoro
            </span>
          </div>
        </div>

        {/* Center / Navigation Bar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'dashboard'
                ? 'bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Tarefas Ativas</span>
          </button>

          <button
            onClick={() => onSelectTab('archived')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              currentTab === 'archived'
                ? 'bg-neutral-900 text-white dark:bg-amber-400 dark:text-neutral-950 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Blocos Finalizados</span>
            {archivedCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                currentTab === 'archived'
                  ? 'bg-amber-400 text-neutral-950 dark:bg-neutral-950 dark:text-white'
                  : 'bg-amber-400/30 text-amber-900 dark:text-amber-300'
              }`}>
                {archivedCount}
              </span>
            )}
          </button>

          {/* Pomodoro quick glance button */}
          <button
            onClick={onScrollToPomodoro}
            className={`hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isPomodoroRunning
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 animate-pulse'
                : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }`}
            title="Ir para o temporizador Pomodoro"
          >
            <Timer className="w-3.5 h-3.5" />
            <span className="font-mono tabular-nums">{pomodoroTimeLeft}</span>
          </button>

          {/* Test Sound Button */}
          <button
            onClick={onTestAlarm}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Testar som do alarme"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Testar Alarme</span>
          </button>

          {/* Notification permission button if not granted */}
          {notifState !== 'granted' && (
            <button
              onClick={handleRequestNotif}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Ativar notificações do navegador para os intervalos"
            >
              <Bell className="w-3.5 h-3.5 text-neutral-500" />
              <span>Ativar Notificações</span>
            </button>
          )}
        </div>

        {/* Actions Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 transition-colors"
            title={darkMode ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro (poupar a vista)'}
            aria-label="Alternar modo escuro"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>

          {/* Add Section Button */}
          <button
            onClick={onOpenNewSection}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-neutral-950 text-xs sm:text-sm font-bold shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Seção</span>
          </button>
        </div>
      </div>
    </header>
  );
};
