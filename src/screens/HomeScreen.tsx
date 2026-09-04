import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button, Badge, Icon, StatCard, Card } from "../components/ui";
import { TournamentCard } from "../components/TournamentCard";

type Screen =
  | "home"
  | "tournaments"
  | "rankings"
  | "requests"
  | "team"
  | "admin"
  | "dashboard"
  | "bracket"
  | "match"
  | "report"
  | "champion"
  | "login"
  | "register"
  | "detail"
  | "registration"
  | "confirmation"
  | "settings";

export function HomeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const {
    tournaments,
    setSelectedTournamentId,
    currentMatch,
    isAuthenticated,
    currentRole,
    currentUser,
    myTeam,
    systemLogs,
    addSystemLog,
    tournamentRequests,
    referees,
    refereeMatches,
  } = useApp();
  const [logFilter, setLogFilter] = useState<string>("ALL");

  const filteredLogs = systemLogs.filter((l) => {
    if (logFilter === "ALL") return true;
    return l.type === logFilter;
  });

  if (isAuthenticated && currentRole === "ADMIN") {
    return (
      <div className="min-h-screen bg-[#09090B] pb-20">
        {/* Admin Executive Header */}
        <div className="bg-[#111113] border-b border-[#27272A]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 flex items-center gap-1.5">
                    <Icon.Shield /> Panel de Control Ejecutivo
                  </span>
                  <span className="text-xs text-[#22C55E] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" /> Servidor en Línea (Uptime 99.9%)
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#FAFAFA] tracking-tight">
                  Dashboard de Operaciones & Logs del Sistema
                </h1>
                <p className="text-[#71717A] text-sm mt-1">
                  Monitoreo en tiempo real de usuarios, organizaciones, líderes, auditoría de eventos e inconsistencias de la plataforma.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Button size="sm" variant="outline" onClick={() => onNavigate("admin")}>
                  <Icon.Shield /> Ir a Panel Admin
                </Button>
                <Button size="sm" variant="primary" onClick={() => onNavigate("tournaments")}>
                  <Icon.Swords /> Ver Torneos
                </Button>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#27272A]">
              <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A]">
                <div className="flex justify-between items-center text-xs text-[#71717A] mb-1">
                  <span>Usuarios Activos</span>
                  <Icon.Users />
                </div>
                <div className="text-2xl font-extrabold text-[#FAFAFA]">
                  {(currentUser && currentUser.nickname !== "Invitado" ? 1 : 0) + referees.length}
                </div>
                <span className="text-[10px] text-[#22C55E] font-medium">Sincronizados en BD</span>
              </div>

              <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A]">
                <div className="flex justify-between items-center text-xs text-[#71717A] mb-1">
                  <span>Clanes Registrados</span>
                  <Icon.Shield />
                </div>
                <div className="text-2xl font-extrabold text-[#FAFAFA]">
                  {myTeam && myTeam.id !== "clan-solo" ? 1 : 0}
                </div>
                <span className="text-[10px] text-[#D4860A] font-medium">Organizaciones activas</span>
              </div>

              <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A]">
                <div className="flex justify-between items-center text-xs text-[#71717A] mb-1">
                  <span>Árbitros Oficiales</span>
                  <Icon.Award />
                </div>
                <div className="text-2xl font-extrabold text-[#FAFAFA]">{referees.length}</div>
                <span className="text-[10px] text-[#A1A1AA] font-medium">Staff con rol REF</span>
              </div>

              <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A]">
                <div className="flex justify-between items-center text-xs text-[#71717A] mb-1">
                  <span>Torneos Oficiales</span>
                  <Icon.Trophy />
                </div>
                <div className="text-2xl font-extrabold text-[#EF4444] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                  {tournaments.filter((t) => t.status === "live").length} En Vivo
                </div>
                <span className="text-[10px] text-[#71717A] font-medium">{tournaments.length} torneos registrados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
          
          {/* Quick Utility Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-[#27272A] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#71717A] block">Disputas de Partidos</span>
                <strong className="text-sm text-[#FAFAFA]">
                  {refereeMatches.filter((m) => m.status === "WAITING_CONFIRMATION" || m.status === "DISPUTED").length > 0
                    ? `⚠️ ${refereeMatches.filter((m) => m.status === "WAITING_CONFIRMATION" || m.status === "DISPUTED").length} Requiere arbitraje`
                    : "✅ Todo al día"}
                </strong>
              </div>
              <Button size="sm" variant="secondary" onClick={() => onNavigate("admin")}>
                Revisar
              </Button>
            </Card>

            <Card className="p-4 border-[#27272A] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#71717A] block">Votaciones Comunidad</span>
                <strong className="text-sm text-[#FAFAFA]">
                  {tournamentRequests.length} Solicitudes activas
                </strong>
              </div>
              <Button size="sm" variant="secondary" onClick={() => onNavigate("requests")}>
                Ver Votaciones
              </Button>
            </Card>

            <Card className="p-4 border-[#27272A] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#71717A] block">Equipo Arbitral</span>
                <strong className="text-sm text-[#FAFAFA]">
                  3 Referees asignados
                </strong>
              </div>
              <Button size="sm" variant="secondary" onClick={() => onNavigate("settings")}>
                Gestionar
              </Button>
            </Card>
          </div>

          {/* Real-Time System Audit Logs */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#FAFAFA] flex items-center gap-2">
                  <Icon.BarChart /> Registro de Auditoría & Logs en Tiempo Real
                </h2>
                <p className="text-xs text-[#71717A]">
                  Registro detallado de acciones, logins, inscripciones, reportes de resultados e inconsistencias.
                </p>
              </div>

              {/* Log Filters */}
              <div className="flex flex-wrap gap-1.5 bg-[#18181B] p-1 rounded-lg border border-[#27272A]">
                {[
                  { id: "ALL", label: "Todos" },
                  { id: "AUTH", label: "Auth / Logins" },
                  { id: "TOURNAMENT", label: "Torneos" },
                  { id: "MATCH", label: "Partidos" },
                  { id: "COMMUNITY", label: "Comunidad" },
                  { id: "SECURITY", label: "Seguridad" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setLogFilter(f.id)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                      logFilter === f.id
                        ? "bg-[#27272A] text-[#FAFAFA] font-bold"
                        : "text-[#71717A] hover:text-[#A1A1AA]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <Card className="overflow-hidden border-[#27272A]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18181B] text-[#71717A] font-bold uppercase tracking-wider border-b border-[#27272A]">
                    <tr>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Acción</th>
                      <th className="py-3 px-4">Usuario / Entidad</th>
                      <th className="py-3 px-4">Detalles del Evento</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A] bg-[#111113]">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#18181B]/50 transition-colors">
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === "SUCCESS"
                                ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                                : log.status === "WARNING"
                                ? "bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/20"
                                : log.status === "ERROR"
                                ? "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                                : "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#D4860A] font-semibold">{log.type}</td>
                        <td className="py-3 px-4 font-bold text-[#FAFAFA]">{log.action}</td>
                        <td className="py-3 px-4 font-medium text-[#A1A1AA]">{log.user}</td>
                        <td className="py-3 px-4 text-[#A1A1AA] max-w-md truncate">{log.details}</td>
                        <td className="py-3 px-4 text-right font-mono text-[#71717A] whitespace-nowrap">
                          {log.timestamp}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && currentRole === "REFEREE") {
    const refereeProfile = referees.find(
      (r) => r.nickname === currentUser.nickname || r.email === currentUser.email
    ) || {
      nickname: currentUser.nickname || "Ref_Oficial",
      assignedGame: "General",
      matchesArbitrated: 0,
    };

    const pendingMatches = refereeMatches.filter(
      (m) => m.status === "WAITING_CONFIRMATION" || m.status === "DISPUTED"
    );

    const matchLogs = systemLogs.filter((l) => l.type === "MATCH");

    return (
      <div className="min-h-screen bg-[#09090B] pb-20">
        {/* Referee Executive Header */}
        <div className="bg-[#111113] border-b border-[#27272A]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-[#D4860A]/15 text-[#D4860A] border border-[#D4860A]/30 flex items-center gap-1.5">
                    <Icon.Shield /> Panel Arbitral Informativo
                  </span>
                  <span className="text-xs text-[#22C55E] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" /> Servidor Arbitral Activo
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#FAFAFA] tracking-tight">
                  Bienvenido, <span className="text-[#D4860A]">{refereeProfile.nickname}</span>
                </h1>
                <p className="text-[#71717A] text-sm mt-1">
                  Ámbito de moderación: <strong className="text-[#FAFAFA]">{refereeProfile.assignedGame}</strong> • Partidas juzgadas: <strong className="text-[#22C55E]">{refereeProfile.matchesArbitrated}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onNavigate("referee" as any)}
                  className="shadow-lg shadow-[#D4860A]/20"
                >
                  <Icon.Shield />
                  Abrir Consola Arbitral
                </Button>
              </div>
            </div>

            {/* Concise Referee Metric KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A]">
                <span className="text-xs text-[#71717A] block">Salas en Monitoreo</span>
                <span className="text-2xl font-bold text-[#FAFAFA]">{refereeMatches.length}</span>
              </div>
              <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A]">
                <span className="text-xs text-[#71717A] block">Esperando Dictamen</span>
                <span className="text-2xl font-bold text-[#EAB308] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308] animate-pulse" />
                  {pendingMatches.length}
                </span>
              </div>
              <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A]">
                <span className="text-xs text-[#71717A] block">Tus Partidas Arbitradas</span>
                <span className="text-2xl font-bold text-[#22C55E]">{refereeProfile.matchesArbitrated}</span>
              </div>
              <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A]">
                <span className="text-xs text-[#71717A] block">Tolerancia Oficial</span>
                <span className="text-2xl font-bold text-[#D4860A]">15 Minutos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Referee Dashboard Content Body */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
          
          {/* Section 1: Salas que requieren atención inmediata */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#FAFAFA] flex items-center gap-2">
                  <Icon.Zap /> Salas que Requieren Atención Inmediata ({pendingMatches.length})
                </h2>
                <p className="text-xs text-[#71717A]">
                  Partidas con reportes de marcador o solicitudes de arbitraje pendientes de revisión.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate("referee" as any)}
              >
                Ver Todas las Salas →
              </Button>
            </div>

            {pendingMatches.length === 0 ? (
              <Card className="p-8 text-center text-xs text-[#71717A] border-[#27272A]">
                ✓ Todas las salas están al día. No hay disputas pendientes en este momento.
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingMatches.map((m) => (
                  <Card key={m.id} className="p-5 border-[#EAB308]/40 bg-[#18181B]/60 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-[#D4860A]">{m.game} • {m.roundName}</span>
                        <Badge variant="warning">Esperando Dictamen</Badge>
                      </div>

                      <h3 className="font-bold text-sm text-[#FAFAFA] mb-1">
                        {m.participantA.name} <span className="text-[#71717A]">vs</span> {m.participantB.name}
                      </h3>
                      <p className="text-xs text-[#A1A1AA] mb-3">
                        Marcador reportado: <strong className="text-[#FAFAFA]">{m.score ? `${m.score.scoreA} - ${m.score.scoreB}` : "Por verificar"}</strong>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#27272A]">
                      <span className="text-[11px] text-[#71717A]">{m.scheduledTime}</span>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => onNavigate("referee" as any)}
                        className="text-xs"
                      >
                        ⚖️ Dictaminar Partido
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Historial Reciente de Partidas & Disputas */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-[#FAFAFA] flex items-center gap-2">
                <Icon.BarChart /> Actividad Arbitral Reciente
              </h2>
              <p className="text-xs text-[#71717A]">
                Registro cronológico de actas arbitrales, revisiones y resoluciones del circuito.
              </p>
            </div>

            <Card className="overflow-hidden border-[#27272A]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18181B] text-[#71717A] font-bold uppercase tracking-wider border-b border-[#27272A]">
                    <tr>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Acción</th>
                      <th className="py-3 px-4">Árbitro / Usuario</th>
                      <th className="py-3 px-4">Detalles</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A] bg-[#111113]">
                    {matchLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#18181B]/50 transition-colors">
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === "SUCCESS"
                                ? "bg-[#22C55E]/10 text-[#22C55E]"
                                : log.status === "WARNING"
                                ? "bg-[#EAB308]/10 text-[#EAB308]"
                                : "bg-[#3B82F6]/10 text-[#3B82F6]"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#FAFAFA]">{log.action}</td>
                        <td className="py-3 px-4 text-[#A1A1AA]">{log.user}</td>
                        <td className="py-3 px-4 text-[#A1A1AA]">{log.details}</td>
                        <td className="py-3 px-4 text-right font-mono text-[#71717A] whitespace-nowrap">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1440&h=600&fit=crop&auto=format)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B] via-[#09090B]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] to-transparent" />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#FAFAFA 1px, transparent 1px), linear-gradient(90deg, #FAFAFA 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-20 pb-24">
          <div className="max-w-2xl">
            <Badge variant="primary" className="mb-6">
              <Icon.Zap />
              Temporada 1 — El inicio del camino
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
              Compite al
              <br />
              <span className="text-[#D4860A]">máximo nivel.</span>
            </h1>
            <p className="text-[#A1A1AA] text-lg leading-relaxed mb-8 max-w-lg">
              Torneos organizados, brackets en tiempo real y rankings
              competitivos. TopRival es la plataforma para gamers serios.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                size="lg"
                onClick={() => onNavigate("tournaments")}
              >
                <Icon.Swords />
                Ver Torneos
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate(isAuthenticated ? "dashboard" : "register")}
              >
                {isAuthenticated ? "Ir a mi Dashboard" : "Crear Cuenta"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-[#27272A] bg-[#111113]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Torneos oficiales", value: `${tournaments.length}`, icon: <Icon.Trophy /> },
              { label: "Juegos competitivos", value: "9 Oficiales", icon: <Icon.Swords /> },
              { label: "Árbitros certificados", value: `${referees.length}`, icon: <Icon.Award /> },
              { label: "Servidor & Base de Datos", value: "100% Online", icon: <Icon.Zap /> },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="text-[#D4860A]">{s.icon}</span>
                <div>
                  <div className="font-bold text-lg text-[#FAFAFA]">{s.value}</div>
                  <div className="text-xs text-[#71717A]">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured tournaments */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#FAFAFA]">Torneos Destacados</h2>
            <p className="text-[#71717A] text-sm mt-1">Compite ahora o reserva tu lugar</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("tournaments")}>
            Ver todos <Icon.ChevronRight />
          </Button>
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center py-12 text-[#71717A] bg-[#111113] rounded-2xl border border-[#27272A] p-6">
            <div className="text-3xl mb-2">🎮</div>
            <p className="text-sm font-bold text-[#FAFAFA] mb-1">No hay torneos activos en este momento</p>
            <p className="text-xs max-w-sm mx-auto">Los nuevos torneos oficiales aparecerán publicados aquí tan pronto como abran inscripciones.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tournaments.slice(0, 3).map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                onClick={() => {
                  setSelectedTournamentId(t.id);
                  onNavigate("detail");
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Live now */}
      <section className="bg-[#111113] border-y border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
            <h2 className="text-xl font-bold text-[#FAFAFA]">En Vivo Ahora</h2>
            <Badge variant="live">Torneos en Competición</Badge>
          </div>

          {tournaments.filter((t) => t.status === "live").length === 0 ? (
            <div className="text-center py-8 text-[#71717A] bg-[#18181B] rounded-xl border border-[#27272A] p-6">
              <p className="text-sm font-bold text-[#FAFAFA] mb-1">No hay partidas en vivo en este momento</p>
              <p className="text-xs">Consulta la pestaña de Torneos para ver los próximos eventos programados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tournaments.filter((t) => t.status === "live").map((t) => (
                <Card
                  key={t.id}
                  className="p-4 hover:border-[#EF4444]/40 border-[#EF4444]/20 cursor-pointer bg-[#EF4444]/5 transition-all"
                  onClick={() => {
                    setSelectedTournamentId(t.id);
                    onNavigate("bracket");
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-[#D4860A] font-bold">{t.game}</span>
                    <Badge variant="live">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] inline-block mr-1" />
                      En Vivo
                    </Badge>
                  </div>
                  <div className="font-semibold text-[#FAFAFA] text-sm truncate">{t.title}</div>
                  <div className="font-mono text-[#F5B830] text-sm font-bold mt-2">
                    Premio: {t.prizePool}
                  </div>
                  <div className="text-[11px] text-[#71717A] mt-2 flex items-center justify-between">
                    <span>{t.mode}</span>
                    <span className="text-[#F5B830] underline">Ver Llaves →</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Games */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <h2 className="text-xl font-bold text-[#FAFAFA] mb-6">Juegos Disponibles</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { name: "FreeFire", icon: "🔥", count: 8 },
            { name: "CODMobile", icon: "📱", count: 6 },
            { name: "FC Mobile", icon: "⚽", count: 4 },
            { name: "Warzone", icon: "🪖", count: 5 },
            /*{ name: "Valorant", icon: "🎯", count: 7 },*/
            /* { name: "LOL", icon: "⚔️", count: 6 },*/
             { name: "EA FC", icon: "🎮", count: 5 },
            /* { name: "Rocket League", icon: "🚀", count: 4 },*/
            /* { name: "Counter Strike", icon: "💣", count: 6 },*/
          ].map((g) => (
            <button
              key={g.name}
              onClick={() => onNavigate("tournaments")}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-[#111113] border border-[#27272A] rounded-xl hover:border-[#D4860A]/40 hover:bg-[#D4860A]/10 transition-all cursor-pointer"
            >
              <span className="text-xl">{g.icon}</span>
              <span className="font-medium text-sm text-[#A1A1AA]">{g.name}</span>
              <Badge variant="muted">{g.count}</Badge>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#D4860A]/20 to-[#111113] border border-[#D4860A]/30 p-10 text-center">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #D4860A 0%, transparent 70%)" }} />
          <div className="relative">
            <Icon.Trophy />
            <h2 className="text-3xl font-bold text-[#FAFAFA] mt-4 mb-2">
              {isAuthenticated ? "¡Compite y Conquista la Gloria!" : "¿Listo para competir?"}
            </h2>
            <p className="text-[#A1A1AA] mb-6">
              {isAuthenticated
                ? "Inscribe a tu escuadra en la Copa Apertura FreeFire y suma puntos para el Ranking Oficial de Latinoamérica."
                : "Únete a miles de jugadores en la plataforma de torneos más seria de Latinoamérica."}
            </p>
            {isAuthenticated ? (
              <div className="flex justify-center gap-3">
                <Button size="lg" onClick={() => onNavigate("tournaments")}>
                  Explorar Torneos Oficiales
                </Button>
                <Button size="lg" variant="outline" onClick={() => onNavigate("dashboard")}>
                  Mi Dashboard
                </Button>
              </div>
            ) : (
              <Button size="lg" onClick={() => onNavigate("register")}>
                Crear cuenta gratis
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
