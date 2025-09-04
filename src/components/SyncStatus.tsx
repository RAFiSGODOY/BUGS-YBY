import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface SyncStatusProps {
  isOnline: boolean;
  lastSync: Date | null;
  isSyncing: boolean;
  onSync: () => void;
  isAdmin?: boolean;
}

export function SyncStatus({ isOnline, lastSync, isSyncing, onSync, isAdmin = false }: SyncStatusProps) {
  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600';
    if (isSyncing) return 'text-blue-600';
    if (lastSync) return 'text-green-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <CloudOff className="h-4 w-4" />;
    if (isSyncing) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (lastSync) return <CheckCircle className="h-4 w-4" />;
    return <Cloud className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Sincronizando...';
    if (lastSync) {
      const minutesAgo = Math.floor((Date.now() - lastSync.getTime()) / 60000);
      if (minutesAgo < 1) return 'Sincronizado agora';
      if (minutesAgo === 1) return 'Sincronizado há 1 min';
      return `Sincronizado há ${minutesAgo} min`;
    }
    return 'Configurar API Key para sincronizar';
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>
      
      {isOnline && !isSyncing && isAdmin && (
        <button
          onClick={onSync}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
          title="Sincronizar agora"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}

      {!isOnline && (
        <div className="flex items-center gap-1 text-red-600">
          <AlertCircle className="h-3 w-3" />
          <span className="text-xs">Dados salvos localmente</span>
        </div>
      )}
    </div>
  );
}
