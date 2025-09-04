import { useState } from 'react';
import { Key, Share2, Check } from 'lucide-react';
import { apiService } from '../services/api';

export function UserBinSetup() {
  const [sharedBinId, setSharedBinId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [currentBinId, setCurrentBinId] = useState(apiService.getBinId() || '');

  const handleSetBinId = () => {
    if (sharedBinId.trim()) {
      apiService.setBinId(sharedBinId.trim());
      setCurrentBinId(sharedBinId.trim());
      setSharedBinId('');
      setIsConfigured(true);
      console.log('✅ Bin ID configurado pelo usuário:', sharedBinId.trim());
    }
  };

  // Se já tem Bin ID configurado, não mostrar
  if (currentBinId) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Key className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            🔗 Conectar ao Sistema Compartilhado
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            Para sincronizar seus bugs com a equipe, peça ao administrador o "Bin ID" e cole abaixo:
          </p>
          
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={sharedBinId}
              onChange={(e) => setSharedBinId(e.target.value)}
              placeholder="Cole aqui o Bin ID fornecido pelo admin"
              className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleSetBinId}
              disabled={!sharedBinId.trim()}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
            >
              <Share2 className="h-4 w-4" />
              Conectar
            </button>
          </div>
          
          {isConfigured && (
            <div className="mt-2 flex items-center gap-1 text-green-700 text-sm">
              <Check className="h-4 w-4" />
              Conectado com sucesso! Seus bugs serão sincronizados.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
