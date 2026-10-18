import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Pencil,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Archive,
} from 'lucide-react';
import { Section, Task, TaskFilter, TaskStatus } from '../types';
import { TaskItem } from './TaskItem';

interface SectionBlockProps {
  section: Section;
  tasks: Task[];
  filter: TaskFilter;
  searchQuery: string;
  activePomodoroTaskId?: string;
  onAddTask: (sectionId: string, title: string) => void;
  onToggleCompleteTask: (taskId: string) => void;
  onUpdateTaskNotes: (taskId: string, notes: string) => void;
  onUpdateTaskTitle: (taskId: string, title: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onSetAsActivePomodoro: (task: Task) => void;
  onUpdateSectionTitle: (sectionId: string, title: string) => void;
  onArchiveSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onMoveSection?: (sectionId: string, direction: 'up' | 'down') => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({
  section,
  tasks,
  filter,
  searchQuery,
  activePomodoroTaskId,
  onAddTask,
  onToggleCompleteTask,
  onUpdateTaskNotes,
  onUpdateTaskTitle,
  onUpdateTaskStatus,
  onDeleteTask,
  onSetAsActivePomodoro,
  onUpdateSectionTitle,
  onArchiveSection,
  onDeleteSection,
  onMoveSection,
  isFirst = false,
  isLast = false,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(section.title);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Section completion calculations
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const inProgressCount = tasks.filter((t) => !t.completed && t.status === 'in_progress').length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter tasks for display
  const filteredTasks = tasks.filter((task) => {
    // Filter by status
    if (filter === 'pending' && task.completed) return false;
    if (filter === 'completed' && !task.completed) return false;
    if (filter === 'in_progress' && (task.completed || task.status !== 'in_progress')) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchNotes = (task.notes || '').toLowerCase().includes(q);
      return matchTitle || matchNotes;
    }

    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(section.id, newTaskTitle.trim());
    setNewTaskTitle('');
  };

  const handleSaveSectionTitle = () => {
    if (editedTitle.trim() && editedTitle !== section.title) {
      onUpdateSectionTitle(section.id, editedTitle.trim());
    } else {
      setEditedTitle(section.title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDownTitle = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveSectionTitle();
    } else if (e.key === 'Escape') {
      setEditedTitle(section.title);
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xs overflow-hidden shadow-sm transition-all duration-200 mb-6">
      {/* 
        MANDATORY REQUIREMENT:
        "cada bloco tem seu título que fica enfatizado com letras maiores, letras pretas e fundo amarelo"
        "Adicione também um contador de tarefas concluídas ao lado de cada título"
      */}
      <div className="bg-amber-400 text-neutral-950 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        {/* Left Side: Yellow Background + Black Bold Larger Letters + Completed Counter */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-2 w-full max-w-md">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleSaveSectionTitle}
                onKeyDown={handleKeyDownTitle}
                autoFocus
                className="w-full px-3 py-1 rounded bg-white text-neutral-950 font-black text-lg md:text-xl border-2 border-neutral-900 focus:outline-none"
              />
              <button
                onClick={handleSaveSectionTitle}
                className="px-2.5 py-1 bg-neutral-950 text-white rounded font-bold text-xs hover:bg-neutral-800"
              >
                Salvar
              </button>
            </div>
          ) : (
            <div className="flex items-center flex-wrap gap-2.5 min-w-0">
              <h2
                onClick={() => setIsEditingTitle(true)}
                title="Clique para editar o título deste bloco"
                className="text-xl sm:text-2xl font-black text-black tracking-tight leading-tight cursor-pointer hover:opacity-85 transition-opacity"
              >
                {section.title}
              </h2>

              {/* Contador de tarefas concluídas ao lado do título */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-950/15 text-neutral-950 font-extrabold text-xs sm:text-sm tabular-nums whitespace-nowrap"
                title={`${completedCount} de ${totalCount} tarefas finalizadas nesta seção`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>
                  {completedCount}/{totalCount} concluídas ({percent}%)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Section Actions (Edit title, Move up/down, Collapse, Delete) */}
        <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
          {!isEditingTitle && (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="p-1.5 rounded-md text-neutral-900/80 hover:text-black hover:bg-neutral-950/10 transition-colors"
              title="Renomear seção"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}

          {onMoveSection && (
            <>
              <button
                disabled={isFirst}
                onClick={() => onMoveSection(section.id, 'up')}
                className={`p-1.5 rounded-md transition-colors ${
                  isFirst
                    ? 'opacity-30 cursor-not-allowed'
                    : 'text-neutral-900/80 hover:text-black hover:bg-neutral-950/10'
                }`}
                title="Mover seção para cima"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                disabled={isLast}
                onClick={() => onMoveSection(section.id, 'down')}
                className={`p-1.5 rounded-md transition-colors ${
                  isLast
                    ? 'opacity-30 cursor-not-allowed'
                    : 'text-neutral-900/80 hover:text-black hover:bg-neutral-950/10'
                }`}
                title="Mover seção para baixo"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Button to Finalize / Archive Block */}
          <button
            onClick={() => onArchiveSection(section.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-950/15 hover:bg-neutral-950/25 text-neutral-950 font-bold text-xs transition-colors"
            title="Finalizar este bloco e mover para a pasta 'Blocos Finalizados'"
          >
            <Archive className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Finalizar Bloco</span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md text-neutral-900/80 hover:text-black hover:bg-neutral-950/10 transition-colors"
            title={isCollapsed ? 'Expandir tarefas' : 'Recolher tarefas'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onDeleteSection(section.id)}
            className="p-1.5 rounded-md text-neutral-900/80 hover:text-red-950 hover:bg-red-500/20 transition-colors"
            title="Excluir seção"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual progress bar of this section */}
      <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Section Content */}
      {!isCollapsed && (
        <div className="p-4 sm:p-6 space-y-4">
          {/* Quick Task Input Form */}
          <form onSubmit={handleCreateTask} className="flex items-center gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder={`Adicionar nova tarefa em "${section.title}"...`}
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-neutral-950 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </form>

          {/* Task List */}
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
              <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500">
                {tasks.length === 0
                  ? 'Nenhuma tarefa cadastrada nesta seção ainda.'
                  : 'Nenhuma tarefa corresponde ao filtro atual.'}
              </p>
              {tasks.length === 0 && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  Digite o nome da tarefa acima e clique em "Adicionar".
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleCompleteTask}
                  onUpdateNotes={onUpdateTaskNotes}
                  onUpdateTitle={onUpdateTaskTitle}
                  onUpdateStatus={onUpdateTaskStatus}
                  onDeleteTask={onDeleteTask}
                  onSetAsActivePomodoro={onSetAsActivePomodoro}
                  isActivePomodoro={activePomodoroTaskId === task.id}
                />
              ))}
            </div>
          )}

          {/* Section footer stats info */}
          {tasks.length > 0 && (
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
              <div className="flex items-center gap-3">
                <span>Total: {totalCount}</span>
                <span>·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {completedCount} concluídas
                </span>
                {inProgressCount > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {inProgressCount} em andamento
                    </span>
                  </>
                )}
              </div>
              <span className="text-[11px] opacity-75">
                Tarefas concluídas continuam visíveis para controle
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
