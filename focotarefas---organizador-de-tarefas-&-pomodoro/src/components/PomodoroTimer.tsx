import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  Bell,
  CheckCircle,
  Flame,
  Coffee,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { PomodoroMode, PomodoroSettings, Task } from '../types';
import { playAlarmSound, stopAlarmSound, playTone } from '../utils/audio';
import { sendNotification, requestNotificationPermission, getNotificationPermission } from '../utils/notifications';

interface PomodoroTimerProps {
  settings: PomodoroSettings;
  onUpdateSettings: (settings: PomodoroSettings) => void;
  activeTask?: Task | null;
  onClearActiveTask: () => void;
  onCompleteActiveTask?: (taskId: string) => void;
  onAlarmTriggered?: () => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  settings,
  onUpdateSettings,
  activeTask,
  onClearActiveTask,
  onCompleteActiveTask,
}) => {
  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(settings.focusDuration * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [cycleCount, setCycleCount] = useState<number>(1);
  const [isRinging, setIsRinging] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [notificationStatus, setNotificationStatus] = useState(getNotificationPermission());

  const timerRef = useRef<number | null>(null);

  // Get duration in seconds for current mode
  const getModeDuration = (targetMode: PomodoroMode): number => {
    switch (targetMode) {
      case 'focus':
        return settings.focusDuration * 60;
      case 'short_break':
        return settings.shortBreakDuration * 60;
      case 'long_break':
        return settings.longBreakDuration * 60;
    }
  };

  // Switch mode
  const switchMode = (newMode: PomodoroMode, autoStart: boolean = false) => {
    setIsRunning(false);
    stopAlarmSound();
    setIsRinging(false);
    setMode(newMode);
    const duration = getModeDuration(newMode);
    setTimeLeft(duration);

    if (autoStart) {
      setTimeout(() => setIsRunning(true), 200);
    }
  };

  // When timer finishes
  const handleTimerComplete = () => {
    setIsRunning(false);
    setIsRinging(true);

    // Play loud alarm sound
    if (settings.soundEnabled) {
      playAlarmSound(settings.soundType, settings.soundVolume, 8);
    }

    // Trigger browser notification
    const isFocus = mode === 'focus';
    const title = isFocus ? '⏰ Hora da Pausa!' : '🚀 Fim da Pausa - Hora de Focar!';
    const message = isFocus
      ? `Parabéns! Você completou um ciclo de foco. Descanse um pouco.`
      : `Sua pausa terminou! Prepare-se para retomar as atividades com energia.`;

    sendNotification(title, {
      body: message,
    });

    if (isFocus) {
      const nextCycle = cycleCount + 1;
      setCycleCount(nextCycle);
    }
  };

  // Stop alarm sound
  const handleDismissAlarm = (andSwitchNext: boolean = true) => {
    stopAlarmSound();
    setIsRinging(false);

    if (andSwitchNext) {
      if (mode === 'focus') {
        const nextMode = cycleCount % settings.longBreakInterval === 0 ? 'long_break' : 'short_break';
        switchMode(nextMode, false);
      } else {
        switchMode('focus', false);
      }
    }
  };

  // Tick effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, mode, cycleCount, settings]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (isRinging) {
      handleDismissAlarm(false);
    }
    const nextState = !isRunning;
    setIsRunning(nextState);
    if (nextState) {
      playTone(660, 'sine', 0.1, 0.1);
    } else {
      playTone(440, 'sine', 0.1, 0.1);
    }
  };

  // Reset
  const handleReset = () => {
    setIsRunning(false);
    stopAlarmSound();
    setIsRinging(false);
    setTimeLeft(getModeDuration(mode));
  };

  // Skip cycle
  const handleSkip = () => {
    if (mode === 'focus') {
      const nextMode = cycleCount % settings.longBreakInterval === 0 ? 'long_break' : 'short_break';
      switchMode(nextMode);
    } else {
      switchMode('focus');
    }
  };

  // Formatting MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentDuration = getModeDuration(mode);
  const progressPercent = Math.min(100, Math.max(0, ((currentDuration - timeLeft) / currentDuration) * 100));

  const handleRequestNotif = async () => {
    const granted = await requestNotificationPermission();
    setNotificationStatus(granted ? 'granted' : 'denied');
  };

  return (
    <div id="pomodoro-section" className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm transition-colors duration-200">
      {/* Alarm ringing alert banner */}
      {isRinging && (
        <div className="mb-4 p-4 rounded-xl bg-amber-400 text-neutral-950 font-bold flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="text-base font-extrabold uppercase tracking-wide">
                {mode === 'focus' ? 'ALERME: Bloco de Foco Finalizado!' : 'ALARME: Intervalo Concluído!'}
              </p>
              <p className="text-xs font-medium text-neutral-800">
                {mode === 'focus' ? 'Hora de descansar a mente.' : 'Hora de retornar às atividades com foco total.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDismissAlarm(true)}
              className="px-4 py-2 bg-neutral-950 text-white hover:bg-neutral-800 rounded-lg text-xs font-extrabold transition-all shadow-sm whitespace-nowrap"
            >
              Parar Alarme & Avançar
            </button>
            <button
              onClick={() => handleDismissAlarm(false)}
              className="px-3 py-2 bg-white/70 text-neutral-900 hover:bg-white rounded-lg text-xs font-bold transition-all"
            >
              Silenciar
            </button>
          </div>
        </div>
      )}

      {/* Header of Pomodoro block */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
              Temporizador Pomodoro
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Intervalos espaçados com alarme sonoro
            </p>
          </div>
        </div>

        {/* Top actions: Notification, Settings */}
        <div className="flex items-center gap-1.5">
          {notificationStatus !== 'granted' && (
            <button
              onClick={handleRequestNotif}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-amber-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs flex items-center gap-1"
              title="Permitir notificações do navegador"
            >
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px] font-medium">Notificações</span>
            </button>
          )}

          <button
            onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title={settings.soundEnabled ? 'Silenciar som do alarme' : 'Ativar som do alarme'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-500" />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
              showSettings ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white' : ''
            }`}
            title="Ajustar tempos e alarme"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode selection buttons */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-4">
        <button
          onClick={() => switchMode('focus')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-bold transition-all ${
            mode === 'focus'
              ? 'bg-amber-400 text-neutral-950 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Foco ({settings.focusDuration}m)</span>
        </button>

        <button
          onClick={() => switchMode('short_break')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-bold transition-all ${
            mode === 'short_break'
              ? 'bg-amber-400 text-neutral-950 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Pausa Curta ({settings.shortBreakDuration}m)</span>
        </button>

        <button
          onClick={() => switchMode('long_break')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-md text-xs font-bold transition-all ${
            mode === 'long_break'
              ? 'bg-amber-400 text-neutral-950 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Pausa Longa ({settings.longBreakDuration}m)</span>
        </button>
      </div>

      {/* Main Countdown Display */}
      <div className="flex flex-col items-center justify-center py-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl border border-neutral-200/80 dark:border-neutral-800 mb-4">
        <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-neutral-900 dark:text-white tabular-nums select-none">
          {timeFormatted}
        </div>

        {/* Cycle indicator */}
        <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <span>Ciclo {((cycleCount - 1) % settings.longBreakInterval) + 1} de {settings.longBreakInterval}</span>
          <span>·</span>
          <span>Total hoje: {cycleCount - 1} focos concluídos</span>
        </div>

        {/* Mini progress bar of current session */}
        <div className="w-48 sm:w-64 bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5 mt-3 overflow-hidden">
          <div
            className="h-full bg-amber-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Active Bound Task indicator (if any) */}
      {activeTask && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Target className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                Foco Vinculado à Tarefa:
              </span>
              <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {activeTask.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onCompleteActiveTask && !activeTask.completed && (
              <button
                onClick={() => onCompleteActiveTask(activeTask.id)}
                className="p-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 shadow-xs"
                title="Concluir esta tarefa com tique"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Concluir</span>
              </button>
            )}
            <button
              onClick={onClearActiveTask}
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded"
              title="Desvincular tarefa do temporizador"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Controls: Play/Pause, Reset, Skip */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleReset}
          className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Reiniciar tempo do bloco"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-sm font-extrabold shadow-sm transition-transform active:scale-95 ${
            isRunning
              ? 'bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-950'
              : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Iniciar Foco</span>
            </>
          )}
        </button>

        <button
          onClick={handleSkip}
          className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title="Pular para próximo intervalo"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
              Configurações de Intervalo & Som
            </span>
            <button
              onClick={() => playAlarmSound(settings.soundType, settings.soundVolume, 2)}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Ouvir Teste de Alarme</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label className="block text-neutral-500 dark:text-neutral-400 mb-1 font-medium">
                Foco (min)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={settings.focusDuration}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 25);
                  onUpdateSettings({ ...settings, focusDuration: val });
                  if (mode === 'focus' && !isRunning) setTimeLeft(val * 60);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white tabular-nums font-semibold"
              />
            </div>

            <div>
              <label className="block text-neutral-500 dark:text-neutral-400 mb-1 font-medium">
                Pausa Curta (min)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.shortBreakDuration}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 5);
                  onUpdateSettings({ ...settings, shortBreakDuration: val });
                  if (mode === 'short_break' && !isRunning) setTimeLeft(val * 60);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white tabular-nums font-semibold"
              />
            </div>

            <div>
              <label className="block text-neutral-500 dark:text-neutral-400 mb-1 font-medium">
                Pausa Longa (min)
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={settings.longBreakDuration}
                onChange={(e) => {
                  const val = Math.max(1, parseInt(e.target.value) || 15);
                  onUpdateSettings({ ...settings, longBreakDuration: val });
                  if (mode === 'long_break' && !isRunning) setTimeLeft(val * 60);
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white tabular-nums font-semibold"
              />
            </div>
          </div>

          {/* Sound Type & Volume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1 font-medium">
                Tipo do Som do Alarme
              </label>
              <select
                value={settings.soundType}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    soundType: e.target.value as 'alarm' | 'bell' | 'chime' | 'digital',
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-semibold"
              >
                <option value="alarm">Despertador Clássico (Mais Audível)</option>
                <option value="digital">Eletrônico Digital</option>
                <option value="bell">Sino Ressonante</option>
                <option value="chime">Chime Harmonioso</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-neutral-500 dark:text-neutral-400 mb-1 font-medium">
                Volume: {Math.round(settings.soundVolume * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, soundVolume: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
