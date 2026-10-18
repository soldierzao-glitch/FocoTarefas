import React, { useState } from 'react';
import {
  Archive,
  RotateCcw,
  Trash2,
  Check,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Section, Task } from '../types';

interface ArchivedSectionsViewProps {
  sections: Section[];
  tasks: Task[];
  onRestoreSection: (sectionId: string) => void;
  onPermanentlyDeleteSection: (sectionId: string) => void;
  onGoToActive: () => void;
}

export const ArchivedSectionsView: React.FC<ArchivedSectionsViewProps> = ({
  sections,
  tasks,
  onRestoreSection,
  onPermanentlyDeleteSection,
  onGoToActive,
}) => {
  const [search, setSearch] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  const filteredSections = sections.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const matchSection = s.title.toLowerCase().includes(q);
    const sectionTasks = tasks.filter((t) => t.sectionId === s.id);
    const matchTasks = sectionTasks.some(
      (t) => t.title.toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q)
    );
    return matchSection || matchTasks;
  });

  return (
    <div className="space-y-6">
      {/* Banner / Info Card */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center font-bold shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-neutral-900 dark:text-white">
                  Pasta de Blocos Finalizados
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 tabular-nums">
                  {sections.length} {sections.length === 1 ? 'bloco' : 'blocos'}
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                Aqui você consulta o histórico dos blocos que você já completou ou removeu da página inicial. Suas tarefas, tiques e observações ficam guardados aqui sem poluir sua dashboard.
              </p>
            </div>
          </div>

          <button
            onClick={onGoToActive}
            className="self-start sm:self-center px-4 py-2 text-xs font-bold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors whitespace-nowrap"
          >
            ← Voltar para Dashboard Ativa
          </button>
        </div>

        {/* Search */}
        {sections.length > 0 && (
          <div className="relative mt-4">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar em blocos finalizados ou observações antigas..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
            />
          </div>
        )}
      </div>

      {/* List of Archived Sections */}
      {filteredSections.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8">
          <Archive className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
            {sections.length === 0
              ? 'Nenhum bloco finalizado no momento'
              : 'Nenhum bloco corresponde à busca'}
          </h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 max-w-sm mx-auto">
            {sections.length === 0
              ? 'Quando você clicar na opção de finalizar ou arquivar um bloco na dashboard, ele virá para cá para preservar todo o seu histórico.'
              : 'Tente alterar os termos da busca.'}
          </p>
          {sections.length === 0 && (
            <button
              onClick={onGoToActive}
              className="mt-4 px-4 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg shadow-xs"
            >
              Ir para Minhas Tarefas Ativas
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSections.map((section) => {
            const sectionTasks = tasks.filter((t) => t.sectionId === section.id);
            const completedCount = sectionTasks.filter((t) => t.completed).length;
            const totalCount = sectionTasks.length;
            const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const isCollapsed = expandedSections[section.id] === false; // default expanded

            const formattedDate = section.archivedAt
              ? new Date(section.archivedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Data não informada';

            return (
              <div
                key={section.id}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs"
              >
                {/* Yellow Header with Black letters as requested! */}
                <div className="bg-amber-400 text-neutral-950 px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center flex-wrap gap-2.5 min-w-0">
                    <h3 className="text-lg sm:text-xl font-black text-black tracking-tight leading-tight">
                      {section.title}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-neutral-950/15 text-neutral-950 font-extrabold text-xs tabular-nums">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>
                        {completedCount}/{totalCount} concluídas ({percent}%)
                      </span>
                    </div>
                    <span className="text-xs text-neutral-900/70 font-medium">
                      · Finalizado em {formattedDate}
                    </span>
                  </div>

                  {/* Actions: Restore or Delete Permanently */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => onRestoreSection(section.id)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-950 text-white hover:bg-neutral-800 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Mover de volta para a tela inicial de tarefas ativas"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar para Dashboard</span>
                    </button>

                    <button
                      onClick={() => toggleExpand(section.id)}
                      className="p-1.5 rounded-md text-neutral-900/80 hover:text-black hover:bg-neutral-950/10 transition-colors"
                      title={isCollapsed ? 'Ver tarefas' : 'Ocultar tarefas'}
                    >
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => onPermanentlyDeleteSection(section.id)}
                      className="p-1.5 rounded-md text-neutral-900/80 hover:text-red-950 hover:bg-red-500/20 transition-colors"
                      title="Excluir definitivamente este bloco e seu histórico"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Content */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-6 space-y-3">
                    {sectionTasks.length === 0 ? (
                      <p className="text-xs text-neutral-400 italic">Nenhuma tarefa neste bloco.</p>
                    ) : (
                      <div className="space-y-2">
                        {sectionTasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex flex-col gap-1.5 text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                                  task.completed
                                    ? 'bg-emerald-500 text-white font-bold'
                                    : 'border border-neutral-300 dark:border-neutral-600 text-transparent'
                                }`}
                              >
                                ✓
                              </span>
                              <span
                                className={`font-semibold ${
                                  task.completed
                                    ? 'line-through text-neutral-400 dark:text-neutral-500'
                                    : 'text-neutral-800 dark:text-neutral-200'
                                }`}
                              >
                                {task.title}
                              </span>
                              {task.completed ? (
                                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 ml-auto">
                                  Concluída
                                </span>
                              ) : (
                                <span className="text-[11px] font-medium text-neutral-400 ml-auto">
                                  Pendente
                                </span>
                              )}
                            </div>

                            {task.notes && (
                              <div className="ml-7 mt-1 p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 text-neutral-600 dark:text-neutral-300 whitespace-pre-line leading-relaxed">
                                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-neutral-400 mb-0.5">
                                  <FileText className="w-3 h-3" />
                                  <span>Observações registradas:</span>
                                </div>
                                {task.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
