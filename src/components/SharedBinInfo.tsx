import { useState, useEffect } from 'react';
import { Copy, Check, Share2, Users, Hash } from 'lucide-react';
import { API_CONFIG } from '../config/api';
import { formatInviteCode } from '../utils/inviteCode';

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

  const copyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(API_CONFIG.FIXED_INVITE_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const shareInviteCode = () => {
    const shareText = `🎯 Código de Convite - Bugs YBY\n\nDigite este código na aplicação:\n\n${formatInviteCode(API_CONFIG.FIXED_INVITE_CODE)}\n\n✨ Todos usam o mesmo código automaticamente!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Código de Convite - Bugs YBY',
        text: shareText
      });
    } else {
      // Fallback para copiar
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!binId) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Hash className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-green-900">
          Código de Convite Fixo
        </h3>
      </div>
      
      <div className="bg-white border border-green-200 rounded-lg p-4 mb-3">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Todos os usuários usam automaticamente:</p>
          <div className="text-3xl font-mono font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg mb-3">
            {formatInviteCode(API_CONFIG.FIXED_INVITE_CODE)}
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={copyInviteCode}
              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar Código
                </>
              )}
            </button>
            <button
              onClick={shareInviteCode}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </button>
          </div>
        </div>
      </div>

      <div className="text-sm text-green-800">
        <p className="mb-2">
          <strong>🎯 Super fácil para seus amigos:</strong>
        </p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Digite o código <strong>{formatInviteCode(API_CONFIG.FIXED_INVITE_CODE)}</strong> na aplicação</li>
          <li>Os bugs serão sincronizados automaticamente</li>
          <li>Mesmo código para todos - sem confusão!</li>
        </ol>
      </div>
    </div>
  );
}
