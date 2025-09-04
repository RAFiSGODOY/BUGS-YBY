import { useState, useEffect } from 'react';
import { Check, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { API_CONFIG } from '../config/api';

interface ConnectToSharedBinProps {
  onConnect: (binId: string) => void;
}

export function ConnectToSharedBin({ onConnect }: ConnectToSharedBinProps) {
  const [binId, setBinId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Verificar se já está conectado
    const storedBinId = localStorage.getItem(API_CONFIG.BIN_ID_KEY);
    if (storedBinId && storedBinId !== API_CONFIG.SHARED_BIN_ID) {
      setBinId(storedBinId);
      setIsConnected(true);
    }
  }, []);

  const handleConnect = () => {
    if (!binId.trim()) {
      setError('Por favor, insira um ID válido');
      return;
    }

    if (binId.length < 10) {
      setError('ID muito curto. Verifique se copiou corretamente');
      return;
    }

    // Salvar o Bin ID
    localStorage.setItem(API_CONFIG.BIN_ID_KEY, binId);
    setIsConnected(true);
    setError('');
    
    // Notificar o componente pai
    onConnect(binId);
  };

  const handleDisconnect = () => {
    localStorage.removeItem(API_CONFIG.BIN_ID_KEY);
    setBinId('');
    setIsConnected(false);
    setError('');
  };

  if (isConnected) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Wifi className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">
            Conectado à Sincronização
          </h3>
        </div>
        
        <div className="bg-white border border-green-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-600 mb-1">Bin ID Conectado:</p>
          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded break-all">
            {binId}
          </code>
        </div>

        <div className="flex items-center gap-2 text-sm text-green-800">
          <Check className="h-4 w-4" />
          <span>Seus bugs serão sincronizados automaticamente!</span>
        </div>

        <button
          onClick={handleDisconnect}
          className="mt-3 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
        >
          Desconectar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <WifiOff className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-900">
          Conectar à Sincronização
        </h3>
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cole o ID de Sincronização que seu amigo compartilhou:
        </label>
        <input
          type="text"
          value={binId}
          onChange={(e) => setBinId(e.target.value)}
          placeholder="Cole aqui o ID de sincronização..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleConnect}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Conectar e Sincronizar
      </button>

      <div className="mt-3 text-xs text-yellow-800">
        <p><strong>💡 Dica:</strong> Peça para seu amigo compartilhar o ID de sincronização com você!</p>
      </div>
    </div>
  );
}
