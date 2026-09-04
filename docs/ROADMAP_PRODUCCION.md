# 🚀 Roadmap de Desarrollo y Producción — TopRival Esports Platform

Este documento es el registro maestro de la arquitectura, funcionalidades completadas, limpieza de datos y requerimientos de despliegue para la plataforma **TopRival**.

---

## 📊 1. Estado General de Módulos

| Módulo / Vista | Estado | Descripción |
| :--- | :---: | :--- |
| **1. Vista Pública & Deslogueado** | ✅ **100% Completado** | Navbar, historial del navegador (`popstate`), 9 juegos oficiales, torneos destacados y bracket público. |
| **2. Vista Usuario / Jugador** | ✅ **100% Completado** | Dashboard 100% dinámico, persistencia de Nickname, estadísticas reales desde BD, configuración de cuentas. |
| **3. Módulo Mi Equipo, Clanes y LFG** | ✅ **100% Completado** | Clanes vs Escuadras, estado *Lobo Solitario*, salir de clan, expulsión/retiro, logs 30 días, reinscripción de escuadras y LFG interactivo. |
| **4. Rankings y Tabla de Posiciones** | ✅ **100% Completado** | 3 vistas independientes (*Individual*, *Clanes*, *Escuadras*) y métricas Fair Play calculadas en tiempo real. |
| **5. Comunidad y Votaciones** | ✅ **100% Completado** | 9 juegos oficiales, modalidades predefinidas, meta automática, conversión a torneo oficial y encuestas del staff. |
| **6. Vista Admin & Operaciones** | ✅ **100% Completado** | Dashboard ejecutivo con logs en vivo, analítica histórica dinámica, control de brackets (Bo1/Bo3/Bo5), moderación de disputas sin datos quemados y acceso exclusivo vía dropdown. |
| **7. Rol REF (Árbitros & Moderadores)** | ✅ **100% Completado** | Consola arbitral dedicada (`RefereeScreen.tsx`), claim de salas, visor de evidencias con Zoom HD, adjudicación de victorias, W.O. por 15 min, historial de actas y aislamiento de permisos. |
| **8. Limpieza Integral de Datos Quemados (Zero Mock Data)** | ✅ **100% Completado** | Supresión total de datos mock en torneos, clanes, escuadras, analíticas históricas, partidos en vivo fantasma y estadísticas simuladas. Empty states elegantes cuando no hay registros. |
| **9. Sistema de Modales Embebidos Esports** | ✅ **100% Completado** | Erradicación del 100% de `alert`, `confirm` y `prompt` nativos del navegador. Implementación del componente `ModalDialog.tsx` con Promesas (`showAlert`, `showConfirm`, `showPrompt`). |
| **10. Persistencia 100% en Base de Datos (Zero localStorage)** | ✅ **100% Completado** | Sincronización integral con PostgreSQL 16 vía API REST. `localStorage` se utiliza exclusivamente para el token JWT (`toprival_token`). |
| **11. Despliegue en Desarrollo / Producción** | ⏳ **Listo para Despliegue** | Build de producción probado (`npm run build`), Docker Compose configurado y backend Node.js preparado. |

---

## ✅ 2. Registro Detallado de Trabajo Completado

### A. Sistema de Modales Embebidos Esports (`ModalDialog.tsx` & `AppContext.tsx`)
- [x] **Componente `ModalDialog.tsx`:** Modal interactivo con estética gamer dark, fondo con desenfoque (`backdrop-blur-md`), bordes con resplandor dinámico por tipo (*info*, *success*, *warning*, *danger*), soporte para teclado (<kbd>Escape</kbd> para cancelar, <kbd>Enter</kbd> para confirmar/enviar).
- [x] **Control Global Asíncrono en `AppContext`:**
  - `showAlert(title, message, variant)`: Notificaciones de éxito o informativas.
  - `showConfirm(title, message, confirmText, cancelText, variant)`: Diálogos de confirmación para acciones críticas.
  - `showPrompt(title, message, defaultValue, placeholder)`: Entrada de texto interactiva en modal (para W.O. y encuestas).
- [x] **Migración Total:** Reemplazados todos los diálogos nativos del navegador en `AdminScreen`, `RefereeScreen`, `TeamScreen`, `MatchScreen`, `RequestsScreen`, `DashboardScreen`, `SettingsScreen` y `LoginScreen`.

### B. Limpieza Integral de Datos Quemados (Zero Mock Data)
- [x] **Analíticas Históricas Dinámicas (`TournamentsScreen.tsx`):** Desglose por juego, series (Bo1/Bo3/Bo5) y modalidades (1v1 a 5v5) calculado en tiempo real sobre la base de datos, con empty state informativo si no hay torneos.
- [x] **Métricas Fair Play (`RankingsScreen.tsx`):** Win Rate de circuito, Integridad de Cuentas y Bolsa Total Asignada calculadas dinámicamente.
- [x] **Eliminación de Partidos Fantasma (`DashboardScreen.tsx`, `MatchScreen.tsx`, `BracketScreen.tsx`):** La sala de juego y el banner en vivo solo se activan ante una partida real en curso asignada al usuario autenticado.
- [x] **Estadísticas de Jugador & Árbitro:** Contadores parten de 0 y reflejan exclusivamente la actividad registrada en BD.
- [x] **Moderación de Disputas (`AdminScreen.tsx`):** Tarjeta fija simulada sustituida por mapeo dinámico de incidencias y estado vacío oficial.

### C. Rol REF — Árbitros y Moderadores (`RefereeScreen.tsx`, `MatchScreen.tsx`, `Navbar.tsx`)
- [x] **Consola Arbitral de Partidas:** Monitoreo en tiempo real de salas de juego, claim y unclaim de partidas.
- [x] **Visor de Evidencias HD con Zoom:** Modal de pantalla completa para inspección de capturas fotográficas de resultados.
- [x] **Dictamen Oficial & W.O. (15 min):** Adjudicación reglamentaria de victoria o aplicación de Walk-Over con archivado automático en actas.
- [x] **Historial & Logs Arbitrales:** Panel lateral conmutativo para auditoría de dictámenes y sanciones.
- [x] **Perfil Arbitral Auténtico (`DashboardScreen.tsx`):** Credenciales de staff, juego asignado, historial de arbitraje y aviso de imparcialidad (sin permisos de inscripción como jugador).
- [x] **Badge en Navbar:** Menú desplegable muestra la etiqueta oficial `OFICIAL REFEREE STAFF`.
- [x] **Acceso Exclusivo:** Consola arbitral accesible únicamente desde el menú de usuario.

### D. Módulo Mi Equipo, Clanes y Escuadras (`TeamScreen.tsx`)
- [x] **Separación Clan vs. Escuadra:** Clanes permanentes con Tag vs Escuadras específicas por torneo.
- [x] **Estado "Lobo Solitario":** Al abandonar el clan, el usuario queda en estado libre sin perder su historial.
- [x] **Gestión de Roster & Bloqueo:** Protección de altas y bajas mientras el equipo compite en un torneo activo.
- [x] **Tablón de Agentes Libres (LFG):** Publicación/retiro interactivo y buscador en tiempo real.

### E. Vista Admin & Operaciones (`AdminScreen.tsx`, `HomeScreen.tsx`, `SettingsScreen.tsx`)
- [x] **Dashboard Ejecutivo:** KPIs de usuarios, clanes y torneos 100% dinámicos, junto con visor de auditoría global.
- [x] **Generador de Brackets:** Creación de llaves eliminatorias en formatos Bo1, Bo3 y Bo5 con avance manual o arbitral.
- [x] **Gestión de Referees:** Alta de árbitros con juego asignado y permisos granulares.
- [x] **Acceso Restringido:** Panel de administración accesible exclusivamente desde el avatar del Super Admin.

### F. Persistencia y Backend (`src/services/api.ts`, `server/server.js`, `schema.sql`)
- [x] **Cero `localStorage` para Datos del Negocio:** Utilizado exclusivamente para el token JWT.
- [x] **API REST en Node.js + Express:** Endpoints para autenticación, torneos, clanes, brackets, solicitudes, árbitros y auditoría.
- [x] **Esquema Relacional PostgreSQL:** 10 tablas optimizadas con claves foráneas, índices y soporte para 5 roles de usuario.

---

## 👥 3. Credenciales Oficiales de Prueba

| Rol | Email | Contraseña | Capacidades y Permisos |
| :--- | :--- | :--- | :--- |
| ⚡ **SUPER ADMIN** | `admin@toprival.gg` | `adminpassword` | Control maestro de la plataforma, torneos, brackets, encuestas oficiales, gestión de árbitros y auditoría. |
| 🛡️ **OFICIAL REFEREE (REF)** | `carlos.ref@toprival.gg` | `refereepassword` | Consola arbitral, claim de salas, inspección de evidencias HD, emisión de dictámenes y W.O. (15 min). |
| 🎮 **JUGADOR / CAPITÁN** | `player@toprival.gg` | `playerpassword` | Inscripción a torneos, creación/gestión de clanes y escuadras, agentes libres (LFG), votaciones y reporte de resultados. |

---

## 🚀 4. Alistamiento para Despliegue en Desarrollo / Staging

### Checklist de Preparación:
1. [x] **Validación de Tipos TypeScript:** `npx tsc --noEmit` completado con **0 errores**.
2. [x] **Build de Producción Vite:** `npm run build` generado exitosamente en carpeta `dist/`.
3. [x] **Contenedor PostgreSQL:** `docker-compose.yml` listo con DDL `schema.sql` y datos semilla oficiales.
4. [x] **Servidor Backend Express:** `server/server.js` configurado con CORS, JWT y worker de tolerancia de 15 min.

### Pasos para Desplegar en Servidor de Desarrollo:
```bash
# 1. Iniciar Base de Datos PostgreSQL
docker compose up -d

# 2. Iniciar Servidor Backend (Puerto 3001)
cd server
npm install
npm start

# 3. Servir Frontend (o compilar para Nginx / Apache / cPanel)
cd ..
npm install
npm run build
```

---

*Última actualización: Septiembre 2026 — TopRival Core Dev Team*
