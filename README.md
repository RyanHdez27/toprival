# 🏆 TopRival — Plataforma Gamer de Torneos Oficiales y Demanda Comunitaria

TopRival es una plataforma web para torneos de videojuegos donde la organización y administración están centralizadas por el equipo oficial, pero impulsadas activamente por la comunidad mediante un sistema de solicitudes y votaciones.

---

## 📁 Estructura del Proyecto

El repositorio está organizado de la siguiente manera:

* **src/ (Frontend):** Aplicación React 19 + TypeScript + Vite + Tailwind CSS v4 con diseño e interfaces optimizadas.
  * `src/components/`: Componentes reutilizables (Navbar, Bracket, MatchCard, TournamentCard, Modal, etc.).
  * `src/screens/`: Vistas principales (HomeScreen, TournamentsScreen, TournamentDetailScreen, RegistrationScreen, DashboardScreen, BracketScreen, MatchScreen, ReportResultScreen, RequestsScreen, TeamScreen, AdminScreen, RefereeScreen, RankingsScreen, SettingsScreen, LoginScreen).
  * `src/context/`: Estado global reactivo (`AppContext.tsx`) sincronizado en tiempo real con la base de datos PostgreSQL.
  * `src/services/`: Cliente API REST (`api.ts`) y esquema DDL de PostgreSQL (`schema.sql`).
* **server/ (Backend):** Servidor API REST en Node.js + Express conectado a PostgreSQL con automatización cron para tolerancia de 15 minutos (W.O.).
* **docs/ (Documentación):** Documentos de arquitectura técnica, casos de uso (CU-01 a CU-15), diagrama entidad-relación (ER), roadmap de producción y estrategia de despliegue.
* **docker-compose.yml:** Orquestación de la base de datos PostgreSQL 16.

---

## 👥 Credenciales de Acceso Oficiales

Para acceder y probar la plataforma en producción o desarrollo local, utiliza las siguientes cuentas oficiales registradas en la base de datos:

| Rol | Email | Contraseña | Capacidades y Permisos |
| :--- | :--- | :--- | :--- |
| ⚡ **ADMIN** | `admin@toprival.gg` | `adminpassword` | Control total de la plataforma: creación, edición y eliminación de torneos, control de llaves (Bo1/Bo3/Bo5), dashboard ejecutivo con métricas y logs de auditoría, gestión de árbitros (REF) y configuración global. |
| 🛡️ **REFEREE (REF)** | `carlos.ref@toprival.gg` | `refereepassword` *(o `adminpassword`)* | Staff arbitral y moderación de partidas: claim de salas de juego, visor de evidencias fotográficas en Zoom HD, dictamen de actas oficiales, aplicación reglamentaria de Walk-Over (15 min) y consulta de historial de partidas. *(Sin permisos destructivos)*. |
| 🎮 **JUGADOR / CAPITÁN** | `player@toprival.gg` | `playerpassword` | Jugador y líder de clan: gestión de clan/escuadras, estado Lobo Solitario, búsqueda de agentes libres (LFG), inscripción a torneos oficiales, propuesta y voto en torneos comunitarios y reporte de resultados con evidencia. |

---

## 🚀 Requisitos Previos

* **Node.js** v18+ instalado.
* **Docker & Docker Desktop** (o PostgreSQL local / cloud).
* Gestor de paquetes: **pnpm** o **npm**.

---

## 🛠️ Puesta en Marcha

### 1. Iniciar Base de Datos PostgreSQL con Docker
Ejecuta en la terminal en la raíz del proyecto:
```bash
docker compose up -d
```
> Esto iniciará el contenedor `toprival_postgres` en el puerto `5432` y ejecutará automáticamente el script `schema.sql` con las 10 tablas relacionales y los usuarios oficiales.

### 2. Iniciar el Servidor Backend (API REST)
En una terminal:
```bash
cd server
npm install
node server.js
```
> El backend quedará activo en `http://localhost:3001` con persistencia a base de datos y worker de 15 min W.O. activo.

### 3. Iniciar el Frontend (React + Vite)
En otra terminal en la raíz del proyecto:
```bash
npm install
npm run dev
```
> La aplicación estará disponible en la URL indicada por Vite (por defecto `http://localhost:5173` o `http://localhost:8443`).

---

## 📦 Compilación para Producción

Para compilar la aplicación frontend lista para despliegue en Hostinger / cPanel / Cloud:
```bash
npm run build
```
> Los archivos estáticos optimizados se generarán en la carpeta `dist/` para ser subidos directamente al `public_html` de tu servidor web.

---

*Desarrollado para TopRival Esports Platform — Septiembre 2026*
