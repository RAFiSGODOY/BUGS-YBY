import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Bug as BugType } from '../../types/Bug';

interface MetricsOverviewProps {
  bugs: BugType[];
}

export function MetricsOverview({ bugs }: MetricsOverviewProps) {
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, direction: 'neutral' as const };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      direction: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const
    };
  };

  const thisWeek = bugs.filter(bug => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return bug.createdAt >= weekAgo;
  }).length;

  const lastWeek = bugs.filter(bug => {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return bug.createdAt >= twoWeeksAgo && bug.createdAt < weekAgo;
  }).length;

  const fixedThisWeek = bugs.filter(bug => {
    if (!bug.fixedAt) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return bug.fixedAt >= weekAgo;
  }).length;

  const fixedLastWeek = bugs.filter(bug => {
    if (!bug.fixedAt) return false;
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return bug.fixedAt >= twoWeeksAgo && bug.fixedAt < weekAgo;
  }).length;

  const newBugsTrend = calculateTrend(thisWeek, lastWeek);
  const fixedBugsTrend = calculateTrend(fixedThisWeek, fixedLastWeek);

  const avgResolutionTime = bugs
    .filter(bug => bug.isFixed && bug.fixedAt)
    .reduce((acc, bug) => {
      const resolutionTime = bug.fixedAt!.getTime() - bug.createdAt.getTime();
      return acc + resolutionTime;
    }, 0) / bugs.filter(bug => bug.isFixed).length;

  const avgDays = avgResolutionTime ? Math.round(avgResolutionTime / (1000 * 60 * 60 * 24)) : 0;

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral', isGoodTrend: boolean) => {
    if (direction === 'neutral') return 'text-gray-500';
    const isPositive = (direction === 'up' && isGoodTrend) || (direction === 'down' && !isGoodTrend);
    return isPositive ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Métricas Semanais</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Novos Bugs */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl font-bold text-gray-900">{thisWeek}</span>
            {getTrendIcon(newBugsTrend.direction)}
            <span className={`text-sm font-medium ${getTrendColor(newBugsTrend.direction, false)}`}>
              {newBugsTrend.value}%
            </span>
          </div>
          <div className="text-sm text-gray-600">Novos Bugs</div>
          <div className="text-xs text-gray-500 mt-1">vs. semana anterior</div>
        </div>

        {/* Bugs Corrigidos */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl font-bold text-gray-900">{fixedThisWeek}</span>
            {getTrendIcon(fixedBugsTrend.direction)}
            <span className={`text-sm font-medium ${getTrendColor(fixedBugsTrend.direction, true)}`}>
              {fixedBugsTrend.value}%
            </span>
          </div>
          <div className="text-sm text-gray-600">Bugs Corrigidos</div>
          <div className="text-xs text-gray-500 mt-1">vs. semana anterior</div>
        </div>

        {/* Tempo Médio de Resolução */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl font-bold text-gray-900">{avgDays}</span>
            <span className="text-sm text-gray-500">dias</span>
          </div>
          <div className="text-sm text-gray-600">Tempo Médio</div>
          <div className="text-xs text-gray-500 mt-1">de resolução</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="mt-6 space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Eficiência Semanal</span>
            <span className="font-medium">
              {thisWeek > 0 ? Math.round((fixedThisWeek / thisWeek) * 100) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${thisWeek > 0 ? Math.min((fixedThisWeek / thisWeek) * 100, 100) : 0}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}