import { useState, useEffect } from 'react';
import { Copy, Check, Share2, Users } from 'lucide-react';
import { API_CONFIG } from '../config/api';

export function SharedBinInfo() {
  const [binId, setBinId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Buscar o Bin ID real do localStorage
    const storedBinId = localStorage.getItem(API_CONFIG.BIN_ID_KEY);
    if (storedBinId && storedBinId !== API_CONFIG.SHARED_BIN_ID) {
      setBinId(storedBinId);
    }
  }, []);

  const copyToClipboard = async () => {
    if (binId) {
      try {
        await navigator.clipboard.writeText(binId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Erro ao copiar:', err);
      }
    }
  };

  const shareBinId = () => {
    if (binId) {
      const shareText = `🔗 Compartilhe este ID com seus amigos para sincronizar bugs:\n\n${binId}\n\nCole este ID na aplicação para conectar ao mesmo sistema!`;
      
      if (navigator.share) {
        navigator.share({
          title: 'ID de Sincronização - Bugs YBY',
          text: shareText
        });
      } else {
        // Fallback para copiar
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (!binId) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">
          ID de Sincronização Compartilhado
        </h3>
      </div>
      
      <div className="bg-white border border-blue-200 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Bin ID:</p>
            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded break-all">
              {binId}
            </code>
          </div>
          <div className="flex gap-2 ml-3">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar
                </>
              )}
            </button>
            <button
              onClick={shareBinId}
              className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </button>
          </div>
        </div>
      </div>

      <div className="text-sm text-blue-800">
        <p className="mb-2">
          <strong>📱 Para seus amigos:</strong>
        </p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Cole este ID na aplicação</li>
          <li>Os bugs serão sincronizados automaticamente</li>
          <li>Funciona em qualquer dispositivo</li>
        </ol>
      </div>
    </div>
  );
}
