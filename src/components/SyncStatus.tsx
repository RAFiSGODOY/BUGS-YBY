import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle, Wifi } from 'lucide-react';

interface SyncStatusProps {
  isOnline: boolean;
  lastSync: Date | null;
  isSyncing: boolean;
  isAdmin?: boolean;
}

export function SyncStatus({ isOnline, lastSync, isSyncing, isAdmin = false }: SyncStatusProps) {
  const getStatusColor = () => {
    if (!isOnline) return 'text-red-600';
    if (isSyncing) return 'text-blue-600';
    if (lastSync) return 'text-green-600';
    return 'text-gray-600';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <CloudOff className="h-4 w-4" />;
    if (isSyncing) return <RefreshCw className="h-4 w-4 animate-spin" />;
    if (lastSync) return <Wifi className="h-4 w-4" />;
    return <Cloud className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isSyncing) return 'Sincronizando...';
    if (lastSync) {
      const secondsAgo = Math.floor((Date.now() - lastSync.getTime()) / 1000);
      if (secondsAgo < 5) return 'Tempo real ativo';
      if (secondsAgo < 60) return `Sincronizado há ${secondsAgo}s`;
      const minutesAgo = Math.floor(secondsAgo / 60);
      if (minutesAgo === 1) return 'Sincronizado há 1 min';
      return `Sincronizado há ${minutesAgo} min`;
    }
    return 'Configurando sincronização...';
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>
      
      {isOnline && lastSync && (
        <div className="flex items-center gap-1 text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs">Tempo real</span>
        </div>
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
