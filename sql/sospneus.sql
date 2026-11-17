-- ============================================================================
-- SOS PNEUS & BORRACHARIA 24H — DDL & SEEDS (SQLite / Método ENDS)
-- Aviso: Dados 100% fictícios para demonstração de portfólio Nuvetec
-- ============================================================================

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  cargo TEXT NOT NULL DEFAULT 'operador_base' CHECK (cargo IN ('operador_base', 'socorrista')),
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pneus (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medida TEXT NOT NULL,
  aro INTEGER NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  tipo_terreno TEXT NOT NULL CHECK (tipo_terreno IN ('Urbano / Estrada', 'SUV / Highway', 'Carga / Utilitário')),
  indice_carga_vel TEXT NOT NULL,
  selo_inmetro TEXT NOT NULL DEFAULT 'Aprovado Inmetro (Ruído 70dB / Aderência B)',
  preco_unitario REAL NOT NULL CHECK (preco_unitario > 0),
  preco_kit4 REAL NOT NULL CHECK (preco_kit4 > 0),
  estoque INTEGER NOT NULL DEFAULT 8,
  aplicacao_carros TEXT NOT NULL,
  destaque INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chamados_socorro (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT NOT NULL UNIQUE,
  tipo_emergencia TEXT NOT NULL CHECK (tipo_emergencia IN ('Pneu Furado / Troca de Estepe', 'Pneu Rasgado (Levar Pneu Novo)', 'Vulcanização na Base', 'Bateria / Auxílio de Partida')),
  distancia_km REAL NOT NULL DEFAULT 5,
  tempo_chegada_min INTEGER NOT NULL DEFAULT 25,
  valor_total_estimado REAL NOT NULL,
  nome_motorista TEXT NOT NULL,
  telefone TEXT NOT NULL,
  localizacao_referencia TEXT NOT NULL,
  veiculo_medida TEXT NOT NULL,
  consentimento_lgpd INTEGER NOT NULL CHECK (consentimento_lgpd = 1),
  status TEXT NOT NULL DEFAULT 'Viatura Acionada' CHECK (status IN ('Viatura Acionada', 'Em Deslocamento', 'No Local', 'Concluído')),
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS solicitacoes_lgpd (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  protocolo TEXT NOT NULL UNIQUE,
  nome_titular TEXT NOT NULL,
  email_titular TEXT NOT NULL,
  tipo_direito TEXT NOT NULL CHECK (tipo_direito IN ('Confirmacao', 'Acesso', 'Correcao', 'Exclusao')),
  detalhes TEXT,
  status TEXT NOT NULL DEFAULT 'Recebido',
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_pneus_medida ON pneus(medida);
CREATE INDEX IF NOT EXISTS idx_pneus_aro ON pneus(aro);
CREATE INDEX IF NOT EXISTS idx_chamados_protocolo ON chamados_socorro(protocolo);
