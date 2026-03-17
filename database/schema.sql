CREATE DATABASE IF NOT EXISTS barber_of_friends;
USE barber_of_friends;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  telefone VARCHAR(20) NOT NULL,
  idade TINYINT UNSIGNED,
  corte_favorito VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  status ENUM('pendente', 'confirmado', 'cancelado', 'atendido') DEFAULT 'pendente',
  preco DECIMAL(10,2) DEFAULT 35.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_agendamento_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_slot UNIQUE (data, hora)
);

CREATE TABLE IF NOT EXISTS configuracoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  dia_semana ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo') NOT NULL,
  abre TIME NOT NULL DEFAULT '09:00:00',
  fecha TIME NOT NULL DEFAULT '20:00:00',
  intervalo_minutos INT NOT NULL DEFAULT 60,
  preco_padrao DECIMAL(10,2) NOT NULL DEFAULT 35.00,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_config_dia UNIQUE (dia_semana)
);

INSERT INTO configuracoes (dia_semana, abre, fecha, intervalo_minutos, preco_padrao)
VALUES
  ('segunda', '09:00:00', '20:00:00', 60, 35.00),
  ('terca', '09:00:00', '20:00:00', 60, 35.00),
  ('quarta', '09:00:00', '20:00:00', 60, 35.00),
  ('quinta', '09:00:00', '20:00:00', 60, 35.00),
  ('sexta', '09:00:00', '20:00:00', 60, 35.00),
  ('sabado', '09:00:00', '20:00:00', 60, 35.00),
  ('domingo', '09:00:00', '20:00:00', 60, 35.00)
ON DUPLICATE KEY UPDATE
  abre = VALUES(abre),
  fecha = VALUES(fecha),
  intervalo_minutos = VALUES(intervalo_minutos),
  preco_padrao = VALUES(preco_padrao),
  ativo = TRUE;
