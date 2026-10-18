import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';

interface NewSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSection: (title: string) => void;
}

export const NewSectionModal: React.FC<NewSectionModalProps> = ({
  isOpen,
  onClose,
  onCreateSection,
}) => {
  const [title, setTitle] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateSection(title.trim());
    setTitle('');
    onClose();
  };

  const suggestions = [
    'Prioridades do Dia',
    'Trabalho & Projetos',
    'Estudos & Leituras',
    'Finanças & Contas',
    'Casa & Organização',
    'Saúde & Treinos',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-bold">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
              Nova Seção de Tarefas
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Crie um novo bloco temático. O título terá destaque visual em amarelo com letras pretas para facilitar a sua organização.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Título da Seção
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Projetos da Semana, Estudos, etc."
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 text-sm font-medium"
            />
          </div>

          {/* Quick suggestions */}
          <div>
            <span className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Sugestões rápidas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setTitle(sug)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-amber-400 bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2 text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-lg shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Criar Bloco
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
