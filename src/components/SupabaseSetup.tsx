import { Copy, Check, Database, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { SUPABASE_SETUP_INSTRUCTIONS } from '../config/supabase';

export function SupabaseSetup() {
  const [copied, setCopied] = useState(false);

  const copyInstructions = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SETUP_INSTRUCTIONS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-bold text-blue-900">
          Configuração do Supabase
        </h2>
      </div>

      <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono bg-gray-50 p-3 rounded border">
            {SUPABASE_SETUP_INSTRUCTIONS}
          </pre>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={copyInstructions}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiar Instruções
            </>
          )}
        </button>
        
        <a
          href="https://supabase.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir Supabase
        </a>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>💡 Dica:</strong> O Supabase é muito mais confiável que o JSONBin.io e oferece 
          sincronização em tempo real, backup automático e melhor performance!
        </p>
      </div>
    </div>
  );
}
