import React from 'react';
import { CheckCircle2, Clock, ListTodo, Search, X } from 'lucide-react';
import { TaskFilter } from '../types';

interface OverallProgressProps {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const OverallProgress: React.FC<OverallProgressProps> = ({
  totalTasks,
  completedTasks,
  inProgressTasks,
  pendingTasks,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 shadow-sm transition-colors duration-200">
      {/* Top row: Metrics and Percentage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Progresso Geral das Tarefas
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-400/20 text-amber-800 dark:text-amber-300">
              Controle Visual
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tabular-nums tracking-tight">
              {percentage}%
            </span>
            <span className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
              concluído ({completedTasks} de {totalTasks} tarefas)
            </span>
          </div>
        </div>

        {/* Small stats badges */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-xs">
          <div className="bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 rounded-lg p-2.5 flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
            <div>
              <p className="text-neutral-500 dark:text-neutral-400 text-[11px] leading-tight">Pendentes</p>
              <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">{pendingTasks}</p>
            </div>
          </div>

          <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-2.5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-[11px] leading-tight">Em Andamento</p>
              <p className="text-sm font-bold text-blue-700 dark:text-blue-300 tabular-nums">{inProgressTasks}</p>
            </div>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="text-emerald-600 dark:text-emerald-400 text-[11px] leading-tight">Concluídas</p>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{completedTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main visual progress bar */}
      <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-neutral-200 dark:border-neutral-700 mb-5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 transition-all duration-500 ease-out shadow-xs"
          style={{ width: `${Math.max(percentage, totalTasks > 0 ? 2 : 0)}%` }}
        />
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
        {/* Filter controls */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-x-auto">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Todas ({totalTasks})
          </button>
          <button
            onClick={() => onFilterChange('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              filter === 'pending'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Pendentes ({pendingTasks})
          </button>
          <button
            onClick={() => onFilterChange('in_progress')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              filter === 'in_progress'
                ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Em Andamento ({inProgressTasks})
          </button>
          <button
            onClick={() => onFilterChange('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              filter === 'completed'
                ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Concluídas ({completedTasks})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por tarefa ou observação..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
