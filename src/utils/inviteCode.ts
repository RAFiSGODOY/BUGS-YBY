// Sistema de código de convite simples
// Converte Bin ID longo em código de 6 dígitos fácil de compartilhar

const INVITE_CODES_KEY = 'yby-invite-codes';

// Gerar código de convite único
export function generateInviteCode(binId: string): string {
  if (!binId) return '';
  
  // Verificar se já existe um código para este Bin ID
  const existingCodes = getInviteCodes();
  const existingCode = existingCodes[binId];
  if (existingCode) {
    return existingCode;
  }
  
  // Gerar novo código único
  let code: string;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    // Usar timestamp + random para garantir unicidade
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    code = (timestamp + random).slice(-6);
    attempts++;
  } while (isCodeInUse(code) && attempts < maxAttempts);
  
  // Salvar o mapeamento
  saveInviteCode(binId, code);
  return code;
}

// Decodificar código de convite para Bin ID
export function decodeInviteCode(inviteCode: string): string | null {
  if (!inviteCode || inviteCode.length !== 6) {
    return null;
  }
  
  const codes = getInviteCodes();
  for (const [binId, code] of Object.entries(codes)) {
    if (code === inviteCode) {
      return binId;
    }
  }
  
  return null;
}

// Verificar se um código já está em uso
function isCodeInUse(code: string): boolean {
  const codes = getInviteCodes();
  return Object.values(codes).includes(code);
}

// Obter todos os códigos de convite salvos
function getInviteCodes(): Record<string, string> {
  try {
    const stored = localStorage.getItem(INVITE_CODES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Salvar código de convite
function saveInviteCode(binId: string, code: string): void {
  const codes = getInviteCodes();
  codes[binId] = code;
  localStorage.setItem(INVITE_CODES_KEY, JSON.stringify(codes));
}

// Função para validar se um código de convite é válido
export function isValidInviteCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

// Função para formatar código de convite (adicionar espaços para facilitar leitura)
export function formatInviteCode(code: string): string {
  if (code.length === 6) {
    return `${code.slice(0, 3)} ${code.slice(3, 6)}`;
  }
  return code;
}
