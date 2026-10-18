import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Flame,
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { playCheckSound, playUncheckSound } from '../utils/audio';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onUpdateNotes: (taskId: string, notes: string) => void;
  onUpdateTitle: (taskId: string, title: string) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onSetAsActivePomodoro: (task: Task) => void;
  isActivePomodoro?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onUpdateNotes,
  onUpdateTitle,
  onUpdateStatus,
  onDeleteTask,
  onSetAsActivePomodoro,
  isActivePomodoro = false,
}) => {
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(Boolean(task.notes && task.notes.length > 0));
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>(task.title);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  const handleToggle = () => {
    if (!task.completed) {
      playCheckSound(0.3);
    } else {
      playUncheckSound(0.2);
    }
    onToggleComplete(task.id);
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle !== task.title) {
      onUpdateTitle(task.id, editedTitle.trim());
    } else {
      setEditedTitle(task.title);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditedTitle(task.title);
      setIsEditingTitle(false);
    }
  };

  const insertNoteTemplate = (type: 'done' | 'pending') => {
    setIsNotesOpen(true);
    const prefix = type === 'done' ? 'Já fiz: ' : 'Falta: ';
    const currentNotes = task.notes || '';
    const newNotes = currentNotes.trim()
      ? `${currentNotes}\n${prefix}`
      : `${prefix}`;
    onUpdateNotes(task.id, newNotes);

    // If adding progress notes to a pending task, mark as in_progress
    if (task.status === 'pending' && !task.completed) {
      onUpdateStatus(task.id, 'in_progress');
    }
  };

  return (
    <div
      className={`group rounded-xl border transition-all duration-200 ${
        task.completed
          ? 'bg-neutral-50/70 dark:bg-neutral-900/40 border-neutral-200/60 dark:border-neutral-800/60'
          : isActivePomodoro
          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-xs'
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-xs'
      }`}
    >
      {/* Main Task Row */}
      <div className="p-3.5 flex items-start gap-3">
        {/* Tique / Checkbox Button */}
        <button
          type="button"
          onClick={handleToggle}
          className={`shrink-0 mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
              : 'border-neutral-300 dark:border-neutral-600 hover:border-amber-500 dark:hover:border-amber-400 bg-white dark:bg-neutral-800'
          }`}
          title={task.completed ? 'Desmarcar tarefa' : 'Marcar tarefa como feita'}
          aria-label={task.completed ? 'Desmarcar tarefa' : 'Marcar tarefa como feita'}
        >
          {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
        </button>

        {/* Task Content: Title and Status Info */}
        <div className="flex-1 min-w-0">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={handleKeyDown}
                autoFocus
                className="w-full px-2 py-1 text-sm rounded border border-amber-400 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              />
              <button
                onClick={handleSaveTitle}
                className="px-2 py-1 text-xs font-bold bg-amber-400 text-neutral-950 rounded hover:bg-amber-300"
              >
                Salvar
              </button>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <div
                onClick={() => !task.completed && setIsNotesOpen(true)}
                className="cursor-pointer select-text"
              >
                <p
                  className={`text-sm font-semibold leading-snug break-words transition-colors ${
                    task.completed
                      ? 'line-through text-neutral-400 dark:text-neutral-500'
                      : 'text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {task.title}
                </p>

                {/* Subtitle / Status tags */}
                <div className="flex items-center flex-wrap gap-2 mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {task.completed ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                      <span>Concluída</span>
                    </span>
                  ) : task.status === 'in_progress' ? (
                    <span className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Em andamento</span>
                    </span>
                  ) : (
                    <span className="text-neutral-400 dark:text-neutral-500">Pendente</span>
                  )}

                  {task.notes && (
                    <>
                      <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsNotesOpen(!isNotesOpen);
                        }}
                        className="text-neutral-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 text-[11px] font-medium"
                      >
                        <FileText className="w-3 h-3" />
                        <span>{isNotesOpen ? 'Ocultar notas' : 'Ver observações'}</span>
                      </button>
                    </>
                  )}

                  {isActivePomodoro && (
                    <>
                      <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                      <span className="text-amber-600 dark:text-amber-400 font-bold inline-flex items-center gap-1 text-[11px]">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>Foco Ativo</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Focus on Pomodoro button */}
                {!task.completed && (
                  <button
                    onClick={() => onSetAsActivePomodoro(task)}
                    className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                      isActivePomodoro
                        ? 'bg-amber-400 text-neutral-950 font-bold'
                        : 'text-neutral-500 hover:text-amber-600 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                    title="Focar nesta tarefa no cronômetro Pomodoro"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px] font-medium">Focar</span>
                  </button>
                )}

                {/* Toggle notes button */}
                <button
                  onClick={() => setIsNotesOpen(!isNotesOpen)}
                  className={`p-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                    isNotesOpen ? 'text-amber-600 dark:text-amber-400' : ''
                  }`}
                  title={isNotesOpen ? 'Recolher observações' : 'Adicionar ou ver observações'}
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>

                {/* Options menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 w-44 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-lg py-1 z-20 text-xs">
                      <button
                        onClick={() => {
                          setIsEditingTitle(true);
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar Título</span>
                      </button>

                      {/* Status switches */}
                      <button
                        onClick={() => {
                          onUpdateStatus(task.id, 'in_progress');
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-blue-600 dark:text-blue-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center gap-2"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Marcar Em Andamento</span>
                      </button>

                      <button
                        onClick={() => {
                          onDeleteTask(task.id);
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 border-t border-neutral-100 dark:border-neutral-700 mt-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir Tarefa</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Observations Area - Crucial Requirement */}
      {isNotesOpen && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/60 rounded-b-xl">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Observações & Andamento
            </span>

            {/* Quick Helper Buttons: "O que já fiz" / "O que falta" */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => insertNoteTemplate('done')}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                title="Inserir marcador de 'Já fiz'"
              >
                + Já fiz
              </button>
              <button
                type="button"
                onClick={() => insertNoteTemplate('pending')}
                className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
                title="Inserir marcador de 'Falta'"
              >
                + Falta
              </button>
            </div>
          </div>

          <textarea
            value={task.notes || ''}
            onChange={(e) => {
              onUpdateNotes(task.id, e.target.value);
              // If typing notes and task is pending, automatically transition to in_progress if not finished
              if (task.status === 'pending' && !task.completed && e.target.value.trim().length > 0) {
                onUpdateStatus(task.id, 'in_progress');
              }
            }}
            placeholder="Escreva aqui o que já foi feito e o que ainda falta para concluir a tarefa..."
            rows={3}
            className="w-full text-xs p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 font-normal leading-relaxed resize-y"
          />

          <div className="flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500 mt-1.5">
            <span>
              {task.completed
                ? 'Esta tarefa está marcada como concluída.'
                : task.notes?.trim()
                ? 'Em andamento · Notas salvas automaticamente'
                : 'Dica: use para anotar o status intermediário antes de concluir.'}
            </span>
            <button
              onClick={() => setIsNotesOpen(false)}
              className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium"
            >
              Recolher
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
