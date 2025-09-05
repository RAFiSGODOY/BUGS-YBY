-- Script SQL para configurar as tabelas no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Criar tabela de versões do app
CREATE TABLE IF NOT EXISTS app_versions (
    id BIGSERIAL PRIMARY KEY,
    version TEXT NOT NULL UNIQUE,
    is_current BOOLEAN DEFAULT false,
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT
);

-- 3. Atualizar tabela de bugs (adicionar novos campos)
-- Se a tabela já existe, apenas adicionar as colunas que não existem
DO $$ 
BEGIN
    -- Adicionar coluna version se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bugs' AND column_name='version') THEN
        ALTER TABLE bugs ADD COLUMN version TEXT NOT NULL DEFAULT '1.0.0';
    END IF;
    
    -- Adicionar coluna created_by se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bugs' AND column_name='created_by') THEN
        ALTER TABLE bugs ADD COLUMN created_by TEXT NOT NULL DEFAULT 'Usuário Desconhecido';
    END IF;
    
    -- Adicionar coluna last_modified_by se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bugs' AND column_name='last_modified_by') THEN
        ALTER TABLE bugs ADD COLUMN last_modified_by TEXT;
    END IF;
    
    -- Adicionar coluna last_modified_at se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bugs' AND column_name='last_modified_at') THEN
        ALTER TABLE bugs ADD COLUMN last_modified_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 4. Inserir usuários padrão
INSERT INTO users (id, name, email, role) VALUES
    ('admin', 'Administrador', 'admin@yby.com', 'admin'),
    ('rafael', 'Rafael', 'rafael@yby.com', 'user'),
    ('maria', 'Maria Silva', 'maria@yby.com', 'user'),
    ('joao', 'João Santos', 'joao@yby.com', 'user'),
    ('ana', 'Ana Costa', 'ana@yby.com', 'user'),
    ('pedro', 'Pedro Oliveira', 'pedro@yby.com', 'user'),
    ('carla', 'Carla Ferreira', 'carla@yby.com', 'user'),
    ('lucas', 'Lucas Almeida', 'lucas@yby.com', 'user'),
    ('julia', 'Julia Rodrigues', 'julia@yby.com', 'user'),
    ('bruno', 'Bruno Lima', 'bruno@yby.com', 'user'),
    ('fernanda', 'Fernanda Souza', 'fernanda@yby.com', 'user')
ON CONFLICT (id) DO NOTHING;

-- 5. Inserir versão inicial
INSERT INTO app_versions (version, is_current, created_by, description) VALUES
    ('1.0.0', true, 'admin', 'Versão inicial do sistema')
ON CONFLICT (version) DO NOTHING;

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_bugs_version ON bugs(version);
CREATE INDEX IF NOT EXISTS idx_bugs_created_by ON bugs(created_by);
CREATE INDEX IF NOT EXISTS idx_bugs_last_modified_by ON bugs(last_modified_by);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_app_versions_is_current ON app_versions(is_current);

-- 7. Habilitar RLS (Row Level Security) se necessário
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas de segurança (opcional)
-- CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
-- CREATE POLICY "Only admins can modify users" ON users FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE app_versions IS 'Histórico de versões do aplicativo';
COMMENT ON COLUMN bugs.version IS 'Versão do app quando o bug foi criado';
COMMENT ON COLUMN bugs.created_by IS 'Nome do usuário que criou o bug';
COMMENT ON COLUMN bugs.last_modified_by IS 'Nome do usuário que fez a última modificação';
COMMENT ON COLUMN bugs.last_modified_at IS 'Data e hora da última modificação';