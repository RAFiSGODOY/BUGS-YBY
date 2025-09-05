import { Bug as BugType } from '../../types/Bug';
import { Bug, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface RecentActivityProps {
  bugs: BugType[];
}

export function RecentActivity({ bugs }: RecentActivityProps) {
  const recentBugs = bugs
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'alta':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'media':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'baixa':
        return <Bug className="h-4 w-4 text-blue-500" />;
      default:
        return <Bug className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade Recente</h3>
      <div className="space-y-4">
        {recentBugs.map((bug) => (
          <div key={bug.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0 mt-0.5">
              {bug.isFixed ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                getPriorityIcon(bug.priority)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {bug.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded capitalize">
                  {bug.category}
                </span>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(bug.createdAt)}
                </span>
              </div>
            </div>
            {bug.isFixed && (
              <div className="flex-shrink-0">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                  Corrigido
                </span>
              </div>
            )}
          </div>
        ))}
        
        {recentBugs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bug className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Nenhuma atividade recente</p>
          </div>
        )}
      </div>
    </div>
  );
}