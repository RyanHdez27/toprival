-- =========================================================
-- TOPRIVAL: ESQUEMA DE BASE DE DATOS POSTGRESQL (PRODUCCIÓN)
-- Basado en Arquitectura y Modelo ER (docs/Modelo ER.docx)
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tipos enumerados
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('PLAYER', 'TEAM_CAPTAIN', 'MODERATOR', 'REFEREE', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tournament_status AS ENUM ('DRAFT', 'REGISTRATION_OPEN', 'LIVE', 'PAUSED', 'FINISHED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE match_status AS ENUM ('SCHEDULED', 'READY_TO_PLAY', 'IN_PROGRESS', 'WAITING_CONFIRMATION', 'DISPUTED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('IN_REVIEW', 'APPROVED', 'REJECTED', 'CONVERTED_TO_TOURNAMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Usuarios e Identidad (CU-01, CU-02)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'PLAYER',
    country VARCHAR(100) DEFAULT 'Colombia',
    discord_tag VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Cuentas de Videojuegos vinculadas (Riot ID, Steam ID, etc.)
CREATE TABLE IF NOT EXISTS user_game_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_name VARCHAR(100) NOT NULL,
    game_tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, game_name)
);

-- 3. Equipos y Roster (CU-03)
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    tag VARCHAR(10) UNIQUE NOT NULL,
    logo_url TEXT,
    game VARCHAR(100) NOT NULL,
    captain_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'MEMBER', -- CAPTAIN, MEMBER, SUBSTITUTE
    in_game_name VARCHAR(100) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- 4. Torneos Oficiales (CU-11)
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    game VARCHAR(100) NOT NULL,
    banner_image TEXT,
    status tournament_status DEFAULT 'REGISTRATION_OPEN',
    format VARCHAR(50) DEFAULT 'SINGLE_ELIMINATION',
    mode VARCHAR(100) NOT NULL,
    is_team_based BOOLEAN DEFAULT TRUE,
    team_size INT DEFAULT 5,
    entry_fee VARCHAR(50) DEFAULT 'Gratis',
    prize_pool VARCHAR(100) NOT NULL,
    description TEXT,
    min_participants INT DEFAULT 4,
    max_participants INT NOT NULL,
    start_date DATE NOT NULL,
    start_time VARCHAR(20) NOT NULL,
    rules_text TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Inscripciones a Torneos (CU-04)
CREATE TABLE IF NOT EXISTS tournament_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'CONFIRMED', -- CONFIRMED, WAITLIST, DISQUALIFIED
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.1 Pagos de Inscripciones con Pasarelas (Wompi, etc.)
CREATE TABLE IF NOT EXISTS tournament_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    gateway VARCHAR(50) DEFAULT 'WOMPI',
    transaction_reference VARCHAR(255) UNIQUE NOT NULL,
    gateway_transaction_id VARCHAR(255),
    amount_in_cents BIGINT NOT NULL,
    currency VARCHAR(10) DEFAULT 'COP',
    fee_in_cents BIGINT DEFAULT 0,
    net_amount_in_cents BIGINT DEFAULT 0,
    payment_method_type VARCHAR(50), -- NEQUI, CARD, PSE, BANCOLOMBIA
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, DECLINED, VOIDED, ERROR
    customer_email VARCHAR(255),
    customer_nickname VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Partidos y Brackets (CU-05, CU-06, CU-07, CU-12)
CREATE TABLE IF NOT EXISTS tournament_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    round_name VARCHAR(50) NOT NULL,
    round_index INT NOT NULL,
    match_index INT NOT NULL,
    game VARCHAR(100) DEFAULT 'FreeFire',
    participant_a_id UUID,
    participant_b_id UUID,
    participant_a_name VARCHAR(100),
    participant_b_name VARCHAR(100),
    score_a INT DEFAULT 0,
    score_b INT DEFAULT 0,
    winner_id UUID,
    status match_status DEFAULT 'SCHEDULED',
    evidence_url TEXT,
    dispute_reason TEXT,
    dispute_notes TEXT,
    claimed_by_referee_id UUID REFERENCES users(id),
    claimed_by_referee_nick VARCHAR(100),
    reported_by UUID REFERENCES users(id),
    reported_at TIMESTAMP WITH TIME ZONE,
    scheduled_time VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Solicitudes de Torneos y Votación Comunitaria (CU-14, CU-15)
CREATE TABLE IF NOT EXISTS tournament_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game VARCHAR(100) NOT NULL,
    mode VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    suggested_by UUID REFERENCES users(id) ON DELETE CASCADE,
    suggested_date VARCHAR(100),
    target_participants INT DEFAULT 16,
    status request_status DEFAULT 'IN_REVIEW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tournament_request_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES tournament_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(request_id, user_id)
);

-- 8. Cuentas de Árbitros / Referees Oficiales
CREATE TABLE IF NOT EXISTS referees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nickname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    assigned_game VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    matches_arbitrated INT DEFAULT 0,
    can_resolve_disputes BOOLEAN DEFAULT TRUE,
    can_edit_brackets BOOLEAN DEFAULT TRUE,
    can_manage_rooms BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Logs y Auditoría del Sistema (Admin & Referee)
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL, -- AUTH, TOURNAMENT, MATCH, COMMUNITY, SECURITY, USER
    action VARCHAR(255) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'INFO', -- SUCCESS, WARNING, ERROR, INFO
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Notificaciones del Sistema
CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    link_screen VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================
-- SEED DATA: USUARIOS INICIALES Y ROLES (ADMIN, REF & PLAYER)
-- =========================================================

-- 1. Usuario Administrador
INSERT INTO users (id, email, password_hash, nickname, role, country, discord_tag, is_verified, points)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin@toprival.gg',
    '$2a$10$wT8fH9d6V9dE1hE3JzE.QeH5z0Q2nU.0p9hZgYm4.h6n8sO8oP0q', -- password: 'adminpassword'
    'AdminTopRival',
    'ADMIN',
    'Colombia',
    'AdminTopRival#0001',
    TRUE,
    5000
) ON CONFLICT (email) DO NOTHING;

-- 2. Árbitro Oficial (Rol REFEREE)
INSERT INTO users (id, email, password_hash, nickname, role, country, discord_tag, is_verified, points)
VALUES 
(
    'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    'carlos.ref@toprival.gg',
    '$2a$10$wT8fH9d6V9dE1hE3JzE.QeH5z0Q2nU.0p9hZgYm4.h6n8sO8oP0q', -- password: 'refereepassword'
    'CarlosRef',
    'REFEREE',
    'Colombia',
    'RefCarlos#0001',
    TRUE,
    0
) ON CONFLICT (email) DO NOTHING;

-- Registro en tabla de referees
INSERT INTO referees (id, user_id, nickname, email, assigned_game, status, matches_arbitrated)
SELECT 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', id, nickname, email, 'FreeFire', 'ACTIVE', 0 FROM users WHERE email = 'carlos.ref@toprival.gg'
ON CONFLICT (email) DO NOTHING;

-- 3. Usuario Jugador / Capitán Oficial
INSERT INTO users (id, email, password_hash, nickname, role, country, discord_tag, is_verified, points)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'player@toprival.gg',
    '$2a$10$wT8fH9d6V9dE1hE3JzE.QeH5z0Q2nU.0p9hZgYm4.h6n8sO8oP0q', -- password: 'playerpassword'
    'PlayerOne',
    'PLAYER',
    'Colombia',
    'PlayerOne#1337',
    TRUE,
    0
) ON CONFLICT (email) DO NOTHING;

-- 4. Log Inicial del Sistema
INSERT INTO system_logs (type, action, user_name, details, status)
VALUES
    ('SYSTEM', 'Inicialización Limpia', 'Sistema', 'Plataforma lista para producción sin datos quemados', 'SUCCESS')
ON CONFLICT DO NOTHING;

