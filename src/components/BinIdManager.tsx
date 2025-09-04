import { useState } from 'react';
import { Copy, Check, Share2, Key } from 'lucide-react';
import { apiService } from '../services/api';
import { API_CONFIG } from '../config/api';

export function BinIdManager() {
  const [sharedBinId, setSharedBinId] = useState('');
  const [copied, setCopied] = useState(false);
  const [currentBinId, setCurrentBinId] = useState(apiService.getBinId() || '');

  const handleSetBinId = () => {
    if (sharedBinId.trim()) {
      apiService.setBinId(sharedBinId.trim());
      setCurrentBinId(sharedBinId.trim());
      setSharedBinId('');
      console.log('✅ Bin ID configurado:', sharedBinId.trim());
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Key className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">🔗 Gerenciar Bin ID Compartilhado</h3>
      </div>

      <div className="space-y-4">
        {/* Bin ID Atual */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bin ID Atual:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={currentBinId}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
            />
            <button
              onClick={() => copyToClipboard(currentBinId)}
              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        {/* Configurar Bin ID Compartilhado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Configurar Bin ID Compartilhado:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={sharedBinId}
              onChange={(e) => setSharedBinId(e.target.value)}
              placeholder="Cole aqui o Bin ID compartilhado"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSetBinId}
              disabled={!sharedBinId.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">📋 Como compartilhar dados:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li><strong>Admin:</strong> Copie o "Bin ID Atual" acima</li>
            <li><strong>Compartilhe</strong> este ID com seus amigos</li>
            <li><strong>Amigos:</strong> Cole o ID no campo "Configurar Bin ID Compartilhado"</li>
            <li><strong>Clique</strong> no botão verde para conectar</li>
            <li><strong>Pronto!</strong> Todos os dados serão sincronizados</li>
          </ol>
        </div>

        {/* Status */}
        <div className="text-xs text-gray-500">
          <p><strong>Status:</strong> {currentBinId ? 'Conectado ao Bin ID compartilhado' : 'Usando Bin ID local'}</p>
          <p><strong>Storage Key:</strong> {API_CONFIG.BIN_ID_KEY}</p>
        </div>
      </div>
    </div>
  );
}
