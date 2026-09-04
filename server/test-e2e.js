/**
 * =========================================================================
 * TOPRIVAL ESPORTS PLATFORM — SUITE DE PRUEBAS END-TO-END (E2E) & SEGURIDAD
 * =========================================================================
 * Este script ejecuta el ciclo de vida completo de la plataforma conectándose
 * a la API real y validando todas las reglas de negocio, seguridad y roles.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m'
};

let passedTests = 0;
let failedTests = 0;

function logSection(title) {
  console.log(`\n${colors.cyan}${colors.bold}═════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold} 🔹 ${title}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}═════════════════════════════════════════════════════════════════${colors.reset}`);
}

function assert(condition, testName, details = '') {
  if (condition) {
    passedTests++;
    console.log(` ${colors.green}✔ PASS:${colors.reset} ${testName}`);
  } else {
    failedTests++;
    console.error(` ${colors.red}✘ FAIL:${colors.reset} ${testName} ${details ? `(${details})` : ''}`);
  }
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const response = await fetch(url, options);
  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }
  return { status: response.status, headers: response.headers, data };
}

async function runE2ETests() {
  console.log(`\n🎮 ${colors.bold}TOPRIVAL — SUITE DE PRUEBAS E2E Y AFINACIÓN DE SEGURIDAD${colors.reset}`);
  console.log(`📍 Endpoint objetivo: ${BASE_URL}\n`);

  let playerToken = null;
  let adminToken = null;
  let refereeToken = null;
  let createdTournamentId = null;
  let createdRefereeId = null;
  let testMatchId = null;
  let communityRequestId = null;

  try {
    // -------------------------------------------------------------
    // FASE 1: AFINACIÓN DE SEGURIDAD Y CABECERAS HTTP
    // -------------------------------------------------------------
    logSection('1. AFINACIÓN DE SEGURIDAD & CABECERAS (HELMET + RATE LIMIT)');

    const securityRes = await request('/tournaments');
    assert(securityRes.status === 200, 'Endpoint público responde 200 OK');
    
    // Validar cabeceras de Helmet
    const xContentType = securityRes.headers.get('x-content-type-options');
    const xFrameOptions = securityRes.headers.get('x-frame-options');
    assert(xContentType === 'nosniff', 'Cabecera X-Content-Type-Options activa (nosniff)');
    assert(xFrameOptions === 'SAMEORIGIN', 'Cabecera X-Frame-Options activa (SAMEORIGIN)');

    // Validar Rate Limiter en cabeceras
    const rateLimitHeader = securityRes.headers.get('ratelimit-limit') || securityRes.headers.get('x-ratelimit-limit');
    assert(!!rateLimitHeader, 'Rate Limiter activo reportando límites por IP');

    // -------------------------------------------------------------
    // FASE 2: BLINDAJE DE SUBIDA DE EVIDENCIAS (MULTER)
    // -------------------------------------------------------------
    logSection('2. BLINDAJE DE SUBIDA DE ARCHIVOS & EVIDENCIAS');

    // Test: Subida de archivo no permitido (.exe malicioso)
    const badFormData = new FormData();
    const badBlob = new Blob(['malicious-payload'], { type: 'application/x-msdownload' });
    badFormData.append('image', badBlob, 'hack.exe');

    const badUploadRes = await request('/upload', {
      method: 'POST',
      body: badFormData
    });
    assert(badUploadRes.status === 400, 'Rechazo exitoso (400) de archivo malicioso (.exe)');

    // Test: Subida de imagen legítima (PNG)
    const validFormData = new FormData();
    const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const pngBuffer = Buffer.from(pngBase64, 'base64');
    const goodBlob = new Blob([pngBuffer], { type: 'image/png' });
    validFormData.append('image', goodBlob, 'evidencia_victoria.png');

    const goodUploadRes = await request('/upload', {
      method: 'POST',
      body: validFormData
    });
    assert(goodUploadRes.status === 200 && goodUploadRes.data.url, 'Subida exitosa de evidencia PNG válida con URL generada');

    // -------------------------------------------------------------
    // FASE 3: VALIDACIÓN DE AUTENTICACIÓN & REGLAS DE REGISTRO
    // -------------------------------------------------------------
    logSection('3. FLUJO DE AUTENTICACIÓN & CONTROL DE ACCESO (RBAC)');

    const invalidEmailRes = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'correo-sin-arroba', nickname: 'TestUser', password: '123' })
    });
    assert(invalidEmailRes.status === 400, 'Validación rechaza formato de email inválido');

    const shortPasswordRes = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'valido@test.com', nickname: 'TestUser', password: '123' })
    });
    assert(shortPasswordRes.status === 400, 'Validación rechaza contraseña menor a 6 caracteres');

    const uniqueSuffix = Date.now().toString().slice(-6);
    const testPlayerEmail = `player_${uniqueSuffix}@toprival.gg`;
    const testPlayerNick = `Striker_${uniqueSuffix}`;

    const registerRes = await request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testPlayerEmail,
        nickname: testPlayerNick,
        password: 'playerpassword123'
      })
    });
    assert(registerRes.status === 201 && registerRes.data.token, `Registro exitoso de jugador (${testPlayerNick}) con JWT`);
    playerToken = registerRes.data ? registerRes.data.token : null;

    const loginRes = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testPlayerEmail,
        password: 'playerpassword123'
      })
    });
    assert(loginRes.status === 200 && loginRes.data.user.nickname === testPlayerNick, 'Inicio de sesión exitoso con credenciales');

    const badLoginRes = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testPlayerEmail,
        password: 'wrongpassword'
      })
    });
    assert(badLoginRes.status === 401, 'Rechazo de login (401) ante contraseña errónea');

    const unauthProfileRes = await request('/users/me');
    assert(unauthProfileRes.status === 401, 'Endpoint /api/users/me rechaza petición sin token (401)');

    const authProfileRes = await request('/users/me', {
      headers: { Authorization: `Bearer ${playerToken}` }
    });
    assert(authProfileRes.status === 200 && authProfileRes.data.email === testPlayerEmail, 'Endpoint /api/users/me responde con perfil autenticado');

    const updateProfileRes = await request('/users/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${playerToken}`
      },
      body: JSON.stringify({
        country: 'Argentina',
        discordTag: 'Striker#9999'
      })
    });
    assert(updateProfileRes.status === 200 && updateProfileRes.data.country === 'Argentina', 'Actualización de perfil persistida en BD');

    // -------------------------------------------------------------
    // FASE 4: CICLO SUPER ADMIN (TORNEO, BRACKET Y AUDITORÍA)
    // -------------------------------------------------------------
    logSection('4. FLUJO SUPER ADMIN (TORNEOS, BRACKET Y AUDITORÍA)');

    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@toprival.gg',
        password: 'adminpassword'
      })
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.data.user.role === 'ADMIN', 'Super Admin autenticado con permisos ADMIN');
    adminToken = adminLoginRes.data ? adminLoginRes.data.token : null;

    const metricsRes = await request('/admin/metrics', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(metricsRes.status === 200 && typeof metricsRes.data.totalUsers === 'number', 'Consulta de métricas ejecutivas de plataforma');

    const newTournament = {
      title: `Torneo E2E Championship ${uniqueSuffix}`,
      game: 'Valorant',
      mode: '5v5',
      prize: '$500 USD',
      entryFee: 'Gratis',
      maxParticipants: 16,
      startDate: '2026-09-15T20:00:00.000Z',
      bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'
    };

    const createTournRes = await request('/tournaments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(newTournament)
    });
    assert(createTournRes.status === 201 && createTournRes.data.id, 'Super Admin crea torneo oficial en BD');
    createdTournamentId = createTournRes.data ? createTournRes.data.id : null;

    const createRefRes = await request('/admin/referees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        nickname: `Ref_Judge_${uniqueSuffix}`,
        email: `judge_${uniqueSuffix}@toprival.gg`,
        assignedGame: 'Valorant',
        password: 'refereepassword123'
      })
    });
    assert(createRefRes.status === 201 && createRefRes.data.id, 'Super Admin da de alta a nuevo Árbitro Oficial');
    createdRefereeId = createRefRes.data ? createRefRes.data.id : null;

    const logsRes = await request('/system/logs');
    assert(logsRes.status === 200 && logsRes.data.length > 0, 'Auditoría institucional (System Logs) registrando eventos');

    // -------------------------------------------------------------
    // FASE 5: FLUJO OFICIAL ARBITRAL (REF / REFEREE)
    // -------------------------------------------------------------
    logSection('5. FLUJO OFICIAL REFEREE (CLAIM DE SALA, DICTAMEN Y W.O.)');

    const refLoginRes = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'carlos.ref@toprival.gg',
        password: 'refereepassword'
      })
    });
    assert(refLoginRes.status === 200 && refLoginRes.data.user.role === 'REFEREE', 'Árbitro Oficial (carlos.ref) autenticado');
    refereeToken = refLoginRes.data ? refLoginRes.data.token : null;

    const matchesRes = await request('/referee/matches');
    assert(matchesRes.status === 200 && Array.isArray(matchesRes.data), 'Consulta de consola arbitral de partidas');
    
    if (matchesRes.data && matchesRes.data.length > 0) {
      testMatchId = matchesRes.data[0].id;
      
      const claimRes = await request(`/referee/matches/${testMatchId}/claim`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${refereeToken}` }
      });
      assert(claimRes.status === 200, `Árbitro toma control (claim) de sala [${testMatchId}]`);

      const resolveRes = await request(`/referee/matches/${testMatchId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refereeToken}`
        },
        body: JSON.stringify({
          winnerId: 'p1',
          scoreA: 2,
          scoreB: 0,
          notes: 'Evidencias fotográficas verificadas reglamentariamente.'
        })
      });
      assert(resolveRes.status === 200, 'Dictamen arbitral registrado y acta cerrada');
    }

    // -------------------------------------------------------------
    // FASE 6: COMUNIDAD Y VOTACIONES
    // -------------------------------------------------------------
    logSection('6. COMUNIDAD, PROPUESTAS Y SISTEMA DE VOTACIONES');

    const proposeRes = await request('/community/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${playerToken}`
      },
      body: JSON.stringify({
        game: 'FreeFire',
        mode: 'Escuadras 4v4',
        description: 'Torneo relámpago fin de semana.',
        targetParticipants: 32
      })
    });
    assert(proposeRes.status === 201 && proposeRes.data.id, 'Jugador crea propuesta de torneo comunitario');
    communityRequestId = proposeRes.data ? proposeRes.data.id : null;

    if (communityRequestId) {
      const voteRes = await request(`/community/requests/${communityRequestId}/vote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${playerToken}` }
      });
      assert(voteRes.status === 200 && voteRes.data.action === 'voted', 'Voto comunitario emitido correctamente');

      const unvoteRes = await request(`/community/requests/${communityRequestId}/vote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${playerToken}` }
      });
      assert(unvoteRes.status === 200 && unvoteRes.data.action === 'unvoted', 'Retiro de voto (toggle) procesado');
    }

    // -------------------------------------------------------------
    // FASE 7: LIMPIEZA DE DATOS EFÍMEROS DE PRUEBA
    // -------------------------------------------------------------
    if (createdTournamentId && adminToken) {
      await request(`/admin/tournaments/${createdTournamentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    }
    if (communityRequestId && adminToken) {
      await request(`/community/requests/${communityRequestId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    }

    // -------------------------------------------------------------
    // RESUMEN FINAL
    // -------------------------------------------------------------
    console.log(`\n${colors.bold}═════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(`${colors.bold} 🏁 RESUMEN DE EJECUCIÓN DE PRUEBAS E2E Y SEGURIDAD${colors.reset}`);
    console.log(`${colors.bold}═════════════════════════════════════════════════════════════════${colors.reset}`);
    console.log(` Total de pruebas ejecutadas: ${passedTests + failedTests}`);
    console.log(` ${colors.green}Pruebas superadas (PASS): ${passedTests}${colors.reset}`);
    console.log(` ${failedTests === 0 ? colors.green : colors.red}Pruebas fallidas (FAIL):   ${failedTests}${colors.reset}`);
    console.log(`${colors.bold}═════════════════════════════════════════════════════════════════\n${colors.reset}`);

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Error crítico:', err);
    process.exit(1);
  }
}

runE2ETests();
