import React, { useState, useEffect } from 'react';
import {
  INITIAL_SECTIONS,
  INITIAL_TASKS,
  DEFAULT_POMODORO_SETTINGS,
} from './utils/initialData';
import { Section, Task, PomodoroSettings, TaskFilter, TaskStatus } from './types';
import { Header } from './components/Header';
import { OverallProgress } from './components/OverallProgress';
import { SectionBlock } from './components/SectionBlock';
import { ArchivedSectionsView } from './components/ArchivedSectionsView';
import { PomodoroTimer } from './components/PomodoroTimer';
import { NewSectionModal } from './components/NewSectionModal';
import { ConfirmModal } from './components/ConfirmModal';
import { playAlarmSound, stopAlarmSound } from './utils/audio';
import {
  Plus,
  Volume2,
  RotateCcw,
  Info,
  Archive,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  // Theme state with localStorage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('focotarefas_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Current tab: 'dashboard' (Active) or 'archived' (Blocos Finalizados)
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'archived'>('dashboard');

  // Toast feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sections state with localStorage
  const [sections, setSections] = useState<Section[]>(() => {
    const saved = localStorage.getItem('focotarefas_sections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_SECTIONS;
      }
    }
    return INITIAL_SECTIONS;
  });

  // Tasks state with localStorage
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('focotarefas_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_TASKS;
      }
    }
    return INITIAL_TASKS;
  });

  // Pomodoro settings state with localStorage
  const [pomodoroSettings, setPomodoroSettings] = useState<PomodoroSettings>(() => {
    const saved = localStorage.getItem('focotarefas_pomodoro_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_POMODORO_SETTINGS;
      }
    }
    return DEFAULT_POMODORO_SETTINGS;
  });

  // Active pomodoro task
  const [activePomodoroTaskId, setActivePomodoroTaskId] = useState<string | undefined>(undefined);

  // Filter and search state
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState<boolean>(false);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Sound test status
  const [isTestAlarmPlaying, setIsTestAlarmPlaying] = useState<boolean>(false);

  // Apply dark mode class to html, body, and keep state synced
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (darkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    localStorage.setItem('focotarefas_dark_mode', String(darkMode));
  }, [darkMode]);

  // Sync sections to localStorage
  useEffect(() => {
    localStorage.setItem('focotarefas_sections', JSON.stringify(sections));
  }, [sections]);

  // Sync tasks to localStorage
  useEffect(() => {
    localStorage.setItem('focotarefas_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem('focotarefas_pomodoro_settings', JSON.stringify(pomodoroSettings));
  }, [pomodoroSettings]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handlers for Tasks
  const handleAddTask = (sectionId: string, title: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      sectionId,
      title,
      completed: false,
      notes: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleToggleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            status: nextCompleted ? 'completed' : t.notes.trim() ? 'in_progress' : 'pending',
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleUpdateTaskNotes = (taskId: string, notes: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            notes,
            status: !t.completed && notes.trim() ? 'in_progress' : t.status,
          };
        }
        return t;
      })
    );
  };

  const handleUpdateTaskTitle = (taskId: string, title: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, title } : t))
    );
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status,
            completed: status === 'completed',
            completedAt: status === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (activePomodoroTaskId === taskId) {
      setActivePomodoroTaskId(undefined);
    }
  };

  // Handlers for Sections
  const handleCreateSection = (title: string) => {
    const newSection: Section = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title,
      createdAt: new Date().toISOString(),
      isCollapsed: false,
      isArchived: false,
    };
    setSections((prev) => [...prev, newSection]);
    setToastMessage(`Seção "${title}" criada com sucesso!`);
  };

  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, title } : s))
    );
  };

  // Archive section (Move to "Blocos Finalizados")
  const handleArchiveSection = (sectionId: string) => {
    const sec = sections.find((s) => s.id === sectionId);
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, isArchived: true, archivedAt: new Date().toISOString() }
          : s
      )
    );
    setToastMessage(
      `O bloco "${sec?.title || 'Selecionado'}" foi movido para a pasta "Blocos Finalizados".`
    );
  };

  // Restore section from "Blocos Finalizados"
  const handleRestoreSection = (sectionId: string) => {
    const sec = sections.find((s) => s.id === sectionId);
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, isArchived: false, archivedAt: undefined }
          : s
      )
    );
    setToastMessage(`O bloco "${sec?.title || 'Selecionado'}" retornou para a dashboard ativa!`);
  };

  // Permanently delete section
  const handleConfirmDeleteSection = () => {
    if (!sectionToDelete) return;
    const secId = sectionToDelete.id;
    setSections((prev) => prev.filter((s) => s.id !== secId));
    setTasks((prev) => prev.filter((t) => t.sectionId !== secId));
    setSectionToDelete(null);
    setToastMessage('Bloco excluído definitivamente.');
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    setSections((prev) => {
      const activeIndices = prev
        .map((s, idx) => (!s.isArchived ? idx : -1))
        .filter((idx) => idx !== -1);
      const currentIndexInActive = activeIndices.findIndex((idx) => prev[idx].id === sectionId);
      if (currentIndexInActive === -1) return prev;

      const targetIndexInActive = direction === 'up' ? currentIndexInActive - 1 : currentIndexInActive + 1;
      if (targetIndexInActive < 0 || targetIndexInActive >= activeIndices.length) return prev;

      const realCurrentIdx = activeIndices[currentIndexInActive];
      const realTargetIdx = activeIndices[targetIndexInActive];

      const copy = [...prev];
      const temp = copy[realCurrentIdx];
      copy[realCurrentIdx] = copy[realTargetIdx];
      copy[realTargetIdx] = temp;
      return copy;
    });
  };

  // Bind task to Pomodoro
  const handleSetAsActivePomodoro = (task: Task) => {
    setActivePomodoroTaskId(task.id);
    const el = document.getElementById('pomodoro-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Reset sample data confirmation
  const handleConfirmResetSampleData = () => {
    setSections(INITIAL_SECTIONS);
    setTasks(INITIAL_TASKS);
    setPomodoroSettings(DEFAULT_POMODORO_SETTINGS);
    setActivePomodoroTaskId(undefined);
    setIsResetConfirmOpen(false);
    setToastMessage('Exemplos padrão restaurados com sucesso.');
  };

  // Test Alarm Sound
  const handleTestAlarm = () => {
    if (isTestAlarmPlaying) {
      stopAlarmSound();
      setIsTestAlarmPlaying(false);
    } else {
      setIsTestAlarmPlaying(true);
      playAlarmSound(pomodoroSettings.soundType, pomodoroSettings.soundVolume, 4);
      setTimeout(() => {
        setIsTestAlarmPlaying(false);
      }, 5500);
    }
  };

  // Split active vs archived sections
  const activeSections = sections.filter((s) => !s.isArchived);
  const archivedSections = sections.filter((s) => s.isArchived);

  // Active tasks for overall progress calculation (only from active sections)
  const activeTasks = tasks.filter((t) => {
    const sec = sections.find((s) => s.id === t.sectionId);
    return sec && !sec.isArchived;
  });

  const activeTask = tasks.find((t) => t.id === activePomodoroTaskId) || null;

  // Counts for active dashboard progress
  const totalTasks = activeTasks.length;
  const completedTasks = activeTasks.filter((t) => t.completed).length;
  const inProgressTasks = activeTasks.filter((t) => !t.completed && t.status === 'in_progress').length;
  const pendingTasks = activeTasks.filter((t) => !t.completed && t.status !== 'in_progress').length;

  return (
    <div className={`${darkMode ? 'dark ' : ''}min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200`}>
      {/* Header with Dark Mode Toggle & Top Bar Contract */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onOpenNewSection={() => setIsNewSectionModalOpen(true)}
        onScrollToPomodoro={() => {
          const el = document.getElementById('pomodoro-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        pomodoroTimeLeft="25:00"
        isPomodoroRunning={false}
        onTestAlarm={handleTestAlarm}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        archivedCount={archivedSections.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Toast Feedback Notification */}
        {toastMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-neutral-900 dark:bg-amber-400 text-white dark:text-neutral-950 text-xs font-bold flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 dark:text-neutral-950" />
              <span>{toastMessage}</span>
            </div>
            {currentTab === 'dashboard' && archivedSections.length > 0 && (
              <button
                onClick={() => setCurrentTab('archived')}
                className="underline ml-3 hover:opacity-80"
              >
                Abrir Pasta de Finalizados
              </button>
            )}
          </div>
        )}

        {/* Test alarm banner if currently testing */}
        {isTestAlarmPlaying && (
          <div className="mb-6 p-4 rounded-xl bg-amber-400 text-neutral-950 font-bold flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 animate-bounce" />
              <div>
                <p className="text-sm font-black uppercase tracking-wide">
                  Testando Alarme Sonoro do Pomodoro
                </p>
                <p className="text-xs font-medium text-neutral-800">
                  O som está tocando perfeitamente. Toque no botão ao lado para silenciar.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                stopAlarmSound();
                setIsTestAlarmPlaying(false);
              }}
              className="px-4 py-2 bg-neutral-950 text-white rounded-lg text-xs font-extrabold hover:bg-neutral-800 transition-colors whitespace-nowrap"
            >
              Parar Som
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* View Switcher Bar for Mobile/Tablet */}
            <div className="md:hidden flex items-center gap-2 p-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  currentTab === 'dashboard'
                    ? 'bg-amber-400 text-neutral-950 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Tarefas Ativas ({activeSections.length})
              </button>
              <button
                onClick={() => setCurrentTab('archived')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  currentTab === 'archived'
                    ? 'bg-amber-400 text-neutral-950 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                📁 Blocos Finalizados ({archivedSections.length})
              </button>
            </div>

            {/* TAB 1: ACTIVE DASHBOARD */}
            {currentTab === 'dashboard' && (
              <>
                {/* Visual Overall Progress Bar & Filter Header */}
                <OverallProgress
                  totalTasks={totalTasks}
                  completedTasks={completedTasks}
                  inProgressTasks={inProgressTasks}
                  pendingTasks={pendingTasks}
                  filter={filter}
                  onFilterChange={setFilter}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />

                {/* List of Active Sections with Yellow Title Bar & Ticks */}
                <div className="space-y-6">
                  {activeSections.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8">
                      <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
                        Nenhum bloco ativo na dashboard
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-4">
                        {archivedSections.length > 0
                          ? `Você tem ${archivedSections.length} bloco(s) na pasta de Blocos Finalizados.`
                          : 'Crie seu primeiro bloco com título em destaque amarelo.'}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setIsNewSectionModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs shadow-sm inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Criar Nova Seção</span>
                        </button>
                        {archivedSections.length > 0 && (
                          <button
                            onClick={() => setCurrentTab('archived')}
                            className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-800 dark:text-neutral-200 font-bold text-xs"
                          >
                            Ver Blocos Finalizados
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    activeSections.map((section, idx) => {
                      const sectionTasks = tasks.filter((t) => t.sectionId === section.id);
                      return (
                        <SectionBlock
                          key={section.id}
                          section={section}
                          tasks={sectionTasks}
                          filter={filter}
                          searchQuery={searchQuery}
                          activePomodoroTaskId={activePomodoroTaskId}
                          onAddTask={handleAddTask}
                          onToggleCompleteTask={handleToggleCompleteTask}
                          onUpdateTaskNotes={handleUpdateTaskNotes}
                          onUpdateTaskTitle={handleUpdateTaskTitle}
                          onUpdateTaskStatus={handleUpdateTaskStatus}
                          onDeleteTask={handleDeleteTask}
                          onSetAsActivePomodoro={handleSetAsActivePomodoro}
                          onUpdateSectionTitle={handleUpdateSectionTitle}
                          onArchiveSection={handleArchiveSection}
                          onDeleteSection={() => setSectionToDelete(section)}
                          onMoveSection={handleMoveSection}
                          isFirst={idx === 0}
                          isLast={idx === activeSections.length - 1}
                        />
                      );
                    })
                  )}
                </div>

                {/* Bottom Section Actions: Add New Section & Restore Demo */}
                {activeSections.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => setIsNewSectionModalOpen(true)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border-2 border-dashed border-amber-400/80 hover:border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 text-neutral-900 dark:text-neutral-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <Plus className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Adicionar Mais uma Seção / Bloco</span>
                    </button>

                    <button
                      onClick={() => setIsResetConfirmOpen(true)}
                      className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 flex items-center gap-1.5 font-medium"
                      title="Restaurar dados iniciais de demonstração"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar exemplos iniciais</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: ARCHIVED SECTIONS (BLOCOS FINALIZADOS) */}
            {currentTab === 'archived' && (
              <ArchivedSectionsView
                sections={archivedSections}
                tasks={tasks}
                onRestoreSection={handleRestoreSection}
                onPermanentlyDeleteSection={(secId) => {
                  const sec = sections.find((s) => s.id === secId);
                  if (sec) setSectionToDelete(sec);
                }}
                onGoToActive={() => setCurrentTab('dashboard')}
              />
            )}
          </div>

          {/* Right Column: Pomodoro Widget & Guidance (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Pomodoro Timer with Audio Alarm */}
            <PomodoroTimer
              settings={pomodoroSettings}
              onUpdateSettings={setPomodoroSettings}
              activeTask={activeTask}
              onClearActiveTask={() => setActivePomodoroTaskId(undefined)}
              onCompleteActiveTask={(taskId) => {
                handleToggleCompleteTask(taskId);
              }}
            />

            {/* Folder Shortcut / Status Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <Archive className="w-4 h-4 text-amber-500" />
                  <span>Pasta: Blocos Finalizados</span>
                </span>
                <span className="font-bold text-neutral-700 dark:text-neutral-300 tabular-nums bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                  {archivedSections.length} {archivedSections.length === 1 ? 'bloco' : 'blocos'}
                </span>
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Quando concluir um projeto ou quiser limpar a tela inicial, clique em <strong>Finalizar Bloco</strong> no cabeçalho amarelo. O bloco e todo seu histórico irão para a pasta sem poluir sua dashboard.
              </p>
              <button
                onClick={() => setCurrentTab(currentTab === 'dashboard' ? 'archived' : 'dashboard')}
                className="w-full py-2 rounded-lg font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
              >
                {currentTab === 'dashboard' ? 'Abrir Pasta de Finalizados →' : '← Voltar para Dashboard'}
              </button>
            </div>

            {/* Visual Guide & Instructions Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs text-xs space-y-3">
              <div className="flex items-center gap-2 text-neutral-900 dark:text-white font-bold">
                <Info className="w-4 h-4 text-amber-500" />
                <span>Dicas de Produtividade:</span>
              </div>

              <ul className="space-y-2 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">✓</span>
                  <span>
                    <strong>Tique sem sumir:</strong> Tarefas marcadas continuam na lista para você visualizar o que já fez e o que falta.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">📝</span>
                  <span>
                    <strong>Observações:</strong> Se a tarefa estiver em andamento, anote o que já fez e o que falta antes de dar o tique final.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-amber-600 dark:text-amber-400">🔔</span>
                  <span>
                    <strong>Alarme sonoro:</strong> O alarme toca alto ao fim do tempo de foco para lembrá-lo de pausar e voltar com energia.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* New Section Modal */}
      <NewSectionModal
        isOpen={isNewSectionModalOpen}
        onClose={() => setIsNewSectionModalOpen(false)}
        onCreateSection={handleCreateSection}
      />

      {/* Confirm Permanent Delete Modal (Replaces window.confirm) */}
      <ConfirmModal
        isOpen={Boolean(sectionToDelete)}
        title="Excluir Bloco de Tarefas?"
        description={
          sectionToDelete
            ? `Deseja realmente excluir permanentemente a seção "${sectionToDelete.title}" e todas as suas tarefas? Essa ação não pode ser desfeita.`
            : ''
        }
        confirmLabel="Excluir Definitivamente"
        confirmVariant="danger"
        onConfirm={handleConfirmDeleteSection}
        onCancel={() => setSectionToDelete(null)}
      />

      {/* Confirm Reset Sample Data Modal (Replaces window.confirm) */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Restaurar Exemplos Iniciais?"
        description="Isso irá redefinir as seções e tarefas para os exemplos originais de demonstração. Deseja continuar?"
        confirmLabel="Restaurar Dados"
        confirmVariant="warning"
        onConfirm={handleConfirmResetSampleData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}
