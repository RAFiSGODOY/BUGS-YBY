import { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, Filter, PieChart, LineChart } from 'lucide-react';
import { Bug as BugType } from '../../../types/Bug';

interface ReportsViewProps {
  bugs: BugType[];
}

export function ReportsView({ bugs }: ReportsViewProps) {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [reportType, setReportType] = useState<'overview' | 'performance' | 'trends'>('overview');

  const getDateRangeData = () => {
    const now = new Date();
    const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    return bugs.filter(bug => bug.createdAt >= startDate);
  };

  const filteredBugs = getDateRangeData();

  const stats = {
    total: filteredBugs.length,
    fixed: filteredBugs.filter(bug => bug.isFixed).length,
    pending: filteredBugs.filter(bug => !bug.isFixed).length,
    highPriority: filteredBugs.filter(bug => bug.priority === 'alta').length,
    avgResolutionTime: (() => {
      const fixedBugs = filteredBugs.filter(bug => bug.isFixed && bug.fixedAt);
      if (fixedBugs.length === 0) return 0;
      
      const totalTime = fixedBugs.reduce((acc, bug) => {
        return acc + (bug.fixedAt!.getTime() - bug.createdAt.getTime());
      }, 0);
      
      return Math.round(totalTime / fixedBugs.length / (1000 * 60 * 60 * 24)); // days
    })()
  };

  const categoryStats = filteredBugs.reduce((acc, bug) => {
    acc[bug.category] = (acc[bug.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityStats = filteredBugs.reduce((acc, bug) => {
    acc[bug.priority] = (acc[bug.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const weeklyTrend = (() => {
    const weeks = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const weekBugs = bugs.filter(bug => 
        bug.createdAt >= weekStart && bug.createdAt < weekEnd
      );
      
      const weekFixed = bugs.filter(bug => 
        bug.fixedAt && bug.fixedAt >= weekStart && bug.fixedAt < weekEnd
      );
      
      weeks.push({
        week: `Sem ${i + 1}`,
        created: weekBugs.length,
        fixed: weekFixed.length
      });
    }
    
    return weeks;
  })();

  const exportReport = () => {
    const reportData = {
      period: dateRange,
      generatedAt: new Date().toISOString(),
      stats,
      categoryStats,
      priorityStats,
      weeklyTrend
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bug-report-${dateRange}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatórios e Análises</h2>
          <p className="text-gray-600">Insights detalhados sobre bugs e performance</p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          Exportar Relatório
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
              <option value="1y">Último ano</option>
            </select>
          </div>

          {/* Report Type */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overview">Visão Geral</option>
              <option value="performance">Performance</option>
              <option value="trends">Tendências</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Bugs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">No período selecionado</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Resolução</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.total > 0 ? Math.round((stats.fixed / stats.total) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">{stats.fixed} de {stats.total} resolvidos</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bugs Críticos</p>
              <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              <p className="text-xs text-gray-500 mt-1">Alta prioridade</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-purple-600">{stats.avgResolutionTime}</p>
              <p className="text-xs text-gray-500 mt-1">dias para resolução</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Distribuição por Categoria</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([category, count], index) => {
              const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-red-500'];
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                    <span className="text-sm text-gray-600 capitalize">{category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Distribuição por Prioridade</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(priorityStats).map(([priority, count]) => {
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              const colors = {
                alta: 'bg-red-500',
                media: 'bg-orange-500',
                baixa: 'bg-blue-500'
              };
              
              return (
                <div key={priority}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">{priority}</span>
                    <span className="font-medium">{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${colors[priority as keyof typeof colors]} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <LineChart className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tendência Semanal</h3>
        </div>
        <div className="space-y-4">
          {weeklyTrend.map((week, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 text-sm text-gray-600">{week.week}</div>
              <div className="flex-1 flex gap-2">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Criados</span>
                    <span>{week.created}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${Math.min((week.created / Math.max(...weeklyTrend.map(w => w.created))) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Resolvidos</span>
                    <span>{week.fixed}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min((week.fixed / Math.max(...weeklyTrend.map(w => w.fixed))) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}