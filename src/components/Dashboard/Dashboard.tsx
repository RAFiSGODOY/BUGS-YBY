import { useMemo, useState } from 'react';
import { Bug, CheckCircle, Clock, AlertTriangle, TrendingUp, Users, Calendar, Filter, Download, RefreshCw } from 'lucide-react';
import { Bug as BugType } from '../../types/Bug';
import { StatsCard } from './StatsCard';
import { ChartCard } from './ChartCard';
import { RecentActivity } from './RecentActivity';
import { QuickActions } from './QuickActions';
import { MetricsOverview } from './MetricsOverview';
import { AlertsPanel } from './AlertsPanel';

interface DashboardProps {
  bugs: BugType[];
  onCreateBug: () => void;
  onViewBugs: () => void;
}

export function Dashboard({ bugs, onCreateBug, onViewBugs }: DashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats = useMemo(() => {
    const total = bugs.length;
    const fixed = bugs.filter(bug => bug.isFixed).length;
    const pending = total - fixed;
    const highPriority = bugs.filter(bug => bug.priority === 'alta' && !bug.isFixed).length;
    const thisWeek = bugs.filter(bug => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return bug.createdAt >= weekAgo;
    }).length;
    
    const fixedThisWeek = bugs.filter(bug => {
      if (!bug.fixedAt) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return bug.fixedAt >= weekAgo;
    }).length;

    const categoryStats = bugs.reduce((acc, bug) => {
      acc[bug.category] = (acc[bug.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityStats = bugs.reduce((acc, bug) => {
      if (!bug.isFixed) {
        acc[bug.priority] = (acc[bug.priority] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      fixed,
      pending,
      highPriority,
      thisWeek,
      fixedThisWeek,
      fixRate: total > 0 ? Math.round((fixed / total) * 100) : 0,
      categoryStats,
      priorityStats
    };
  }, [bugs]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simular refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Visão geral do sistema de gerenciamento de bugs</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Atualizado em {new Date().toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Atualizar
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <Download className="h-4 w-4" />
                    Exportar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Panel */}
          <AlertsPanel bugs={bugs} />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total de Bugs"
              value={stats.total}
              icon={Bug}
              color="blue"
              trend={stats.thisWeek > 0 ? `+${stats.thisWeek} esta semana` : 'Nenhum esta semana'}
            />
            <StatsCard
              title="Bugs Corrigidos"
              value={stats.fixed}
              icon={CheckCircle}
              color="green"
              trend={`${stats.fixRate}% taxa de correção`}
            />
            <StatsCard
              title="Pendentes"
              value={stats.pending}
              icon={Clock}
              color="orange"
              trend={stats.highPriority > 0 ? `${stats.highPriority} alta prioridade` : 'Nenhum crítico'}
            />
            <StatsCard
              title="Corrigidos (7d)"
              value={stats.fixedThisWeek}
              icon={TrendingUp}
              color="purple"
              trend="Últimos 7 dias"
            />
          </div>

          {/* Performance Indicators and Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Indicadores de Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Taxa de Resolução</span>
                  <span className="text-lg font-bold text-green-600">{stats.fixRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.fixRate}%` }}
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-600">Bugs Críticos</span>
                  <span className={`text-lg font-bold ${stats.highPriority > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.highPriority}
                  </span>
                </div>
              </div>
            </div>

            <MetricsOverview bugs={bugs} />
          </div>

          {/* Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Distribuição por Categoria"
              data={stats.categoryStats}
              type="bar"
            />
            <ChartCard
              title="Prioridade dos Bugs Pendentes"
              data={stats.priorityStats}
              type="doughnut"
            />
          </div>

          {/* Activity and Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActions
              onCreateBug={onCreateBug}
              onViewBugs={onViewBugs}
            />
            <RecentActivity bugs={bugs.slice(0, 5)} />
          </div>

          {/* Summary Footer */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">Total de Bugs Reportados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.fixedThisWeek}</div>
                <div className="text-sm text-gray-600">Resolvidos Esta Semana</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Aguardando Correção</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}