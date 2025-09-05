import { Plus, List, Search, Settings, BarChart3, Users, FileText } from 'lucide-react';

interface QuickActionsProps {
  onCreateBug: () => void;
  onViewBugs: () => void;
}

export function QuickActions({ onCreateBug, onViewBugs }: QuickActionsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
      <div className="space-y-3">
        <button
          onClick={onCreateBug}
          className="w-full flex items-center gap-3 p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
        >
          <div className="bg-blue-500 p-2 rounded-lg group-hover:bg-blue-600 transition-colors">
            <Plus className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Novo Bug</div>
            <div className="text-sm text-gray-600">Reportar um novo problema</div>
          </div>
        </button>

        <button
          onClick={onViewBugs}
          className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
        >
          <div className="bg-gray-500 p-2 rounded-lg group-hover:bg-gray-600 transition-colors">
            <List className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Ver Todos</div>
            <div className="text-sm text-gray-600">Lista completa de bugs</div>
          </div>
        </button>

        <button className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
          <div className="bg-green-500 p-2 rounded-lg group-hover:bg-green-600 transition-colors">
            <Search className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Buscar</div>
            <div className="text-sm text-gray-600">Encontrar bugs específicos</div>
          </div>
        </button>

        <button className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
          <div className="bg-indigo-500 p-2 rounded-lg group-hover:bg-indigo-600 transition-colors">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Relatórios</div>
            <div className="text-sm text-gray-600">Análises detalhadas</div>
          </div>
        </button>

        <button className="w-full flex items-center gap-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group">
          <div className="bg-orange-500 p-2 rounded-lg group-hover:bg-orange-600 transition-colors">
            <Users className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900">Equipe</div>
            <div className="text-sm text-gray-600">Gerenciar usuários</div>
          </div>
        </button>
      </div>
    </div>
  );
}