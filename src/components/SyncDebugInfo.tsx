import { useState, useEffect } from 'react';
import { Clock, Wifi, Database, AlertCircle } from 'lucide-react';

interface SyncDebugInfoProps {
  isOnline: boolean;
  lastSync: Date | null;
  isSyncing: boolean;
  isAdmin: boolean;
}

export function SyncDebugInfo({ isOnline, lastSync, isSyncing, isAdmin }: SyncDebugInfoProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastLocalUpdate, setLastLocalUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simular lastLocalUpdate (em uma implementação real, isso viria do hook)
  useEffect(() => {
    const handleStorageChange = () => {
      setLastLocalUpdate(new Date());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!isAdmin) return null;

  const timeSinceLastSync = lastSync ? Math.floor((currentTime.getTime() - lastSync.getTime()) / 1000) : null;
  const timeSinceLastLocalUpdate = lastLocalUpdate ? Math.floor((currentTime.getTime() - lastLocalUpdate.getTime()) / 1000) : null;

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-4 w-4 text-gray-600" />
        <h4 className="font-medium text-gray-800 text-sm">Debug - Status da Sincronização</h4>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-1">
          <Wifi className={`h-3 w-3 ${isOnline ? 'text-green-600' : 'text-red-600'}`} />
          <span className={isOnline ? 'text-green-700' : 'text-red-700'}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Database className={`h-3 w-3 ${isSyncing ? 'text-blue-600 animate-pulse' : 'text-gray-600'}`} />
          <span className={isSyncing ? 'text-blue-700' : 'text-gray-700'}>
            {isSyncing ? 'Sincronizando' : 'Idle'}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-gray-600" />
          <span className="text-gray-700">
            Última sync: {timeSinceLastSync !== null ? `${timeSinceLastSync}s` : 'Nunca'}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-gray-600" />
          <span className="text-gray-700">
            Última mudança local: {timeSinceLastLocalUpdate !== null ? `${timeSinceLastLocalUpdate}s` : 'Nunca'}
          </span>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-600">
        <p><strong>Proteção contra conflitos:</strong> Sincronização pausada por 5s após mudanças locais</p>
        <p><strong>Prioridade:</strong> Mudanças locais têm prioridade sobre dados da nuvem</p>
      </div>
    </div>
  );
}
