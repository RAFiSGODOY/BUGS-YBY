import { useState, useEffect } from 'react';
import { Check, AlertCircle, Wifi, WifiOff, Hash } from 'lucide-react';
import { API_CONFIG } from '../config/api';
import { formatInviteCode } from '../utils/inviteCode';

interface ConnectToSharedBinProps {
  onConnect: (binId: string) => void;
}

export function ConnectToSharedBin({ onConnect }: ConnectToSharedBinProps) {
  const [inviteCode, setInviteCode] = useState('');
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
    if (!inviteCode.trim()) {
      setError('Por favor, digite o código de convite');
      return;
    }

    // Remover espaços e caracteres não numéricos
    const cleanCode = inviteCode.replace(/\D/g, '');
    
    if (cleanCode !== API_CONFIG.FIXED_INVITE_CODE) {
      setError(`Código incorreto. Use: ${formatInviteCode(API_CONFIG.FIXED_INVITE_CODE)}`);
      return;
    }

    // Usar o código fixo para conectar
    // O sistema criará automaticamente o Bin ID na primeira sincronização
    localStorage.setItem(API_CONFIG.BIN_ID_KEY, API_CONFIG.SHARED_BIN_ID);
    setBinId(API_CONFIG.SHARED_BIN_ID);
    setIsConnected(true);
    setError('');
    
    // Notificar o componente pai
    onConnect(API_CONFIG.SHARED_BIN_ID);
  };

  const handleDisconnect = () => {
    localStorage.removeItem(API_CONFIG.BIN_ID_KEY);
    setBinId('');
    setInviteCode('');
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
          <p className="text-sm text-gray-600 mb-1">Conectado com sucesso!</p>
          <p className="text-xs text-gray-500">Seus bugs serão sincronizados automaticamente</p>
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
        <Hash className="h-5 w-5 text-yellow-600" />
        <h3 className="text-lg font-semibold text-yellow-900">
          Digite o Código de Convite
        </h3>
      </div>
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Digite o código de convite fixo:
        </label>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => {
            // Permitir apenas números e formatar automaticamente
            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
            setInviteCode(value);
          }}
          placeholder={formatInviteCode(API_CONFIG.FIXED_INVITE_CODE)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
        />
        <p className="text-xs text-gray-500 mt-1 text-center">
          Código correto: <strong>{formatInviteCode(API_CONFIG.FIXED_INVITE_CODE)}</strong>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={inviteCode.length !== 6}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Conectar e Sincronizar
      </button>

      <div className="mt-3 text-xs text-yellow-800">
        <p><strong>💡 Dica:</strong> Todos usam o mesmo código fixo!</p>
        <p className="mt-1">Código: <strong>{formatInviteCode(API_CONFIG.FIXED_INVITE_CODE)}</strong></p>
      </div>
    </div>
  );
}
