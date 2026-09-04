# TOPRIVAL — UI DESIGN PROMPT 

Actúa como un **Senior Product Designer especializado en plataformas eSports, gaming competitivo y SaaS**.

Tengo un wireframe UX previamente diseñado para una plataforma llamada **TopRival**.

Tu trabajo es transformar ese wireframe en una **interfaz UI profesional, moderna, consistente y lista para convertirse posteriormente en una aplicación web real**.

NO cambies la arquitectura UX ni inventes funcionalidades nuevas.

Respeta las pantallas, flujos, navegación y estados definidos en el wireframe.

---

## PRODUCTO

TopRival es una plataforma de torneos gamer.

La plataforma administra directamente los torneos.

Los usuarios:

* participan en torneos;
* crean equipos;
* se inscriben;
* consultan brackets;
* juegan partidos;
* reportan resultados;
* consultan rankings;
* solicitan futuros torneos.

Los usuarios NO pueden crear torneos directamente.

Solamente el administrador puede crear, publicar, gestionar, pausar, cancelar y finalizar torneos.

---

# DESIGN DIRECTION

Diseña TopRival como:

**Competitive Gaming + Premium SaaS + eSports**

La estética debe ser:

* moderna;
* oscura;
* tecnológica;
* competitiva;
* premium;
* limpia;
* profesional.

Evita:

* exceso de neón;
* exceso de gradientes;
* interfaces infantiles;
* exceso de efectos;
* exceso de elementos decorativos;
* apariencia genérica de videojuego.

La prioridad es la usabilidad.

---

# COLOR SYSTEM

Utiliza:

Primary:

#7C3AED

Primary Hover:

#6D28D9

Primary Dark:

#5B21B6

Accent:

#A78BFA

Background:

#09090B

Surface:

#111113

Surface Secondary:

#18181B

Surface Elevated:

#27272A

Text Primary:

#FAFAFA

Text Secondary:

#A1A1AA

Text Muted:

#71717A

Success:

#22C55E

Warning:

#F59E0B

Danger:

#EF4444

Info:

#3B82F6

No utilices estos colores indiscriminadamente.

El violeta debe representar la identidad de TopRival.

Los colores de estado deben utilizarse únicamente para comunicar estados.

---

# TYPOGRAPHY

Utiliza:

Inter

Weights:

Regular
Medium
SemiBold
Bold

Desktop:

H1: 48px
H2: 36px
H3: 24px
H4: 20px
Body: 16px
Small: 14px
Caption: 12px

Mobile:

H1: 36px
H2: 28px
H3: 22px
Body: 15-16px

---

# COMPONENT SYSTEM

Crear componentes reutilizables:

Button
Input
Select
Dropdown
Modal
Toast
Badge
StatusBadge
Card
Avatar
Tabs
Navbar
Sidebar
BottomNavigation
Pagination
SearchBar
Filter
StatCard

Componentes específicos:

TournamentCard
TournamentHeader
TournamentStatus
RegistrationCard
ParticipantCard
TeamCard
MatchCard
Bracket
BracketMatch
RankingTable
RequestCard
DisputeCard
NotificationCard

---

# TOURNAMENT CARD

Crear variantes:

Upcoming
Registration Open
Live
Registration Closed
Paused
Finished

Cada tarjeta debe mostrar:

* juego;
* nombre;
* estado;
* modalidad;
* premio;
* participantes;
* cupos;
* fecha;
* hora;
* CTA.

---

# MATCH CARD

Crear variantes:

Pending
Scheduled
Live
Result Pending
Disputed
Completed
BYE

Debe mostrar:

* ronda;
* jugador/equipo;
* score;
* estado.

---

# BRACKET

Crear un bracket visual profesional.

Debe permitir:

* identificar al usuario;
* identificar partidos activos;
* identificar ganadores;
* identificar BYE;
* identificar próximos partidos;
* navegación horizontal;
* adaptación móvil.

El bracket debe ser uno de los elementos visuales más importantes de la plataforma.

---

# SPECIAL STATES

Diseñar correctamente:

INSCRIPCIONES ABIERTAS

ÚLTIMO CUPO

EN EVALUACIÓN

INSCRIPCIÓN CONFIRMADA

INSCRIPCIONES CERRADAS

EN VIVO

ESPERANDO RIVAL

BYE / AVANCE AUTOMÁTICO

RESULTADO PENDIENTE

PARTIDO EN DISPUTA

TORNEO PAUSADO

TORNEO FINALIZADO

TORNEO CANCELADO

Nunca depender exclusivamente del color.

Utilizar:

* icono;
* texto;
* badge;
* contexto.

---

# CORE SCREENS

Diseña primero:

1. Home
2. Tournaments
3. Tournament Detail
4. Registration
5. Registration Confirmation
6. Player Dashboard
7. Tournament Bracket
8. Match
9. Report Result
10. Tournament Finished

Después:

11. Login
12. Register
13. 2FA
14. Profile
15. Rankings
16. Teams
17. Tournament Requests

Finalmente:

18. Admin Dashboard
19. Tournament Management
20. Participants
21. Bracket Management
22. Disputes
23. Payments
24. Audit

---

# NAVIGATION

Desktop:

Logo TopRival

Inicio
Torneos
Rankings
Juegos
Solicitudes

Usuario:

Notificaciones
Perfil

Dashboard autenticado:

Dashboard
Mis Torneos
Mis Equipos
Ranking
Solicitudes
Notificaciones
Perfil
Configuración

Admin:

Dashboard
Torneos
Solicitudes
Usuarios
Equipos
Juegos
Partidos
Disputas
Rankings
Pagos
Reportes
Auditoría
Configuración

---

# RESPONSIVE DESIGN

Crear versiones:

Desktop 1440px
Laptop 1280px
Tablet 768px
Mobile 390px

Mobile debe utilizar bottom navigation:

Inicio
Torneos
Ranking
Alertas
Perfil

La experiencia móvil debe ser especialmente buena para:

* consultar torneos;
* inscribirse;
* consultar bracket;
* consultar partidos;
* reportar resultados.

---

# UX PRINCIPLES

El usuario debe identificar rápidamente:

¿QUÉ TORNEO ES?

¿ESTÁ DISPONIBLE?

¿CUÁNDO ES?

¿CUÁL ES EL PREMIO?

¿PUEDO INSCRIBIRME?

Dentro del torneo:

¿DÓNDE ESTOY?

¿CONTRA QUIÉN JUEGO?

¿CUÁNDO JUEGO?

¿QUÉ DEBO HACER?

---

# DESIGN SYSTEM

Organiza el archivo Figma de esta forma:

00 Cover
01 UX Flows
02 Design Tokens
03 Components
04 Public
05 Authentication
06 Player
07 Teams
08 Tournaments
09 Brackets
10 Admin
11 Mobile
12 Prototype

Crear componentes y variantes reutilizables.

Utilizar Auto Layout.

Utilizar variables de color, tipografía, spacing y radius.

Mantener consistencia entre todas las pantallas.

---

# IMPORTANT

No rediseñes la arquitectura UX.

No elimines funcionalidades del wireframe.

No inventes funcionalidades nuevas.

No conviertas la interfaz en una landing page.

El resultado debe parecer un **producto SaaS/eSports real listo para producción**.

Prioriza:

1. UX
2. jerarquía visual
3. consistencia
4. responsive
5. accesibilidad
6. escalabilidad del Design System
7. estética competitiva

Primero convierte el wireframe en UI de alta fidelidad.

Después crea el prototipo navegable del flujo:

HOME
→ TOURNAMENTS
→ TOURNAMENT DETAIL
→ REGISTRATION
→ CONFIRMATION
→ DASHBOARD
→ BRACKET
→ MATCH
→ RESULT
→ CHAMPION
