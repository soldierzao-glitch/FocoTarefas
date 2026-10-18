import { Section, Task, PomodoroSettings } from '../types';

export const INITIAL_SECTIONS: Section[] = [
  {
    id: 'sec-1',
    title: 'Prioridades de Hoje',
    createdAt: new Date().toISOString(),
    isCollapsed: false,
  },
  {
    id: 'sec-2',
    title: 'Projetos em Andamento',
    createdAt: new Date().toISOString(),
    isCollapsed: false,
  },
  {
    id: 'sec-3',
    title: 'Rotina & Hábitos de Foco',
    createdAt: new Date().toISOString(),
    isCollapsed: false,
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    sectionId: 'sec-1',
    title: 'Finalizar relatório de atividades da semana',
    completed: false,
    status: 'in_progress',
    notes: 'Já fiz: Coleta de dados e organização das métricas principais.\nFalta: Redigir o resumo executivo e exportar o documento.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'task-2',
    sectionId: 'sec-1',
    title: 'Revisar mensagens e responder pendências urgentes',
    completed: true,
    status: 'completed',
    notes: 'Respondido tudo que chegou até as 10h. Próxima checagem no fim do dia.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'task-3',
    sectionId: 'sec-1',
    title: 'Organizar pauta para alinhamento da tarde',
    completed: false,
    status: 'pending',
    notes: '',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'task-4',
    sectionId: 'sec-2',
    title: 'Planejar estrutura dos novos módulos do sistema',
    completed: false,
    status: 'in_progress',
    notes: 'Já fiz: Esboço conceitual no papel.\nFalta: Passar para o plano detalhado e listar dependências.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'task-5',
    sectionId: 'sec-2',
    title: 'Testar e validar integrações do banco de dados',
    completed: true,
    status: 'completed',
    notes: 'Testes executados com sucesso em ambiente de homologação.',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'task-6',
    sectionId: 'sec-3',
    title: 'Executar 1 bloco de foco no Pomodoro de 25 min',
    completed: false,
    status: 'pending',
    notes: 'Usar o cronômetro com alarme sonoro integrado.',
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    id: 'task-7',
    sectionId: 'sec-3',
    title: 'Leitura de 15 páginas do livro de aprimoramento',
    completed: true,
    status: 'completed',
    notes: 'Capítulo sobre gestão de tempo e priorização concluído.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
];

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  soundVolume: 0.75,
  soundType: 'alarm',
};
