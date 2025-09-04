import { AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function SetupInstructions() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            🔧 Configure a Sincronização Online
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>Para sincronizar dados entre dispositivos:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>
                Crie uma conta gratuita em{' '}
                <a 
                  href="https://jsonbin.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                >
                  JSONBin.io <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>Gere uma API Key na seção "API Keys"</li>
              <li>Substitua a chave no arquivo de configuração:</li>
            </ol>
            
            <div className="bg-white border border-blue-300 rounded p-3 mt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">src/config/api.ts</span>
                <button
                  onClick={() => copyToClipboard('API_KEY: \'sua-chave-aqui\',')}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              <code className="text-xs text-gray-800">
                API_KEY: <span className="text-red-600">'sua-chave-aqui'</span>,
              </code>
            </div>
            
            <p className="text-xs text-blue-700 mt-2">
              💡 <strong>Dica:</strong> Após configurar, recarregue a página para ativar a sincronização.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
