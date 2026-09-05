import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Badge, Button, Card, Avatar, Icon, StatCard } from "../components/ui";
import { MatchCard, Match } from "../components/MatchCard";

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
  | "confirmation";



export function DashboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const {
    currentUser,
    currentRole,
    isAuthenticated,
    currentMatch,
    tournaments,
    myTeam,
    updateUserNickname,
    setSelectedTournamentId,
    systemLogs,
    systemNotifications,
    referees,
    tournamentRequests,
    showAlert,
  } = useApp();

  const [showNickModal, setShowNickModal] = useState(false);
  const [newNick, setNewNick] = useState(currentUser?.nickname || "");
  const [logFilter, setLogFilter] = useState("ALL");
  const [logSearch, setLogSearch] = useState("");

  const isPlayingLiveMatch = Boolean(
    currentMatch &&
    currentMatch.id &&
    currentMatch.id !== "none" &&
    (currentMatch.status === "IN_PROGRESS" || currentMatch.status === "WAITING_CONFIRMATION") &&
    (currentUser?.nickname === currentMatch.participantA?.name || currentUser?.nickname === currentMatch.participantB?.name)
  );

  const myMatchesMapped: Match[] = isPlayingLiveMatch
    ? [
        {
          id: currentMatch.id,
          round: `${currentMatch.roundName} · ${currentMatch.game || "Torneo Oficial"}`,
          player1: {
            name: currentMatch.participantA.name,
            score: currentMatch.score?.scoreA,
            winner: currentMatch.score?.winnerId === currentMatch.participantA.id,
          },
          player2: {
            name: currentMatch.participantB.name,
            score: currentMatch.score?.scoreB,
            winner: currentMatch.score?.winnerId === currentMatch.participantB.id,
          },
          status:
            currentMatch.status === "IN_PROGRESS" || currentMatch.status === "WAITING_CONFIRMATION"
              ? "live"
              : "completed",
          scheduledAt: currentMatch.scheduledTime,
        },
      ]
    : [];

  const handleSaveNick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNick.trim()) return;
    updateUserNickname(newNick.trim());
    setShowNickModal(false);
    showAlert("Perfil Actualizado", `Nickname actualizado exitosamente a: ${newNick.trim()}`, "success");
  };

  const filteredLogs = systemLogs.filter((l) => {
    const matchesFilter = logFilter === "ALL" || l.type === logFilter;
    const matchesSearch =
      !logSearch ||
      l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.user.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(logSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // ADMIN VIEW OF DASHBOARD
  if (isAuthenticated && currentRole === "ADMIN") {
    return (
      <div className="min-h-screen bg-[#09090B] p-4 md:p-6 pb-20">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111113] p-6 rounded-2xl border border-[#27272A]">
            <div className="flex items-center gap-3.5">
              <Avatar name={currentUser?.nickname || "Admin"} size={48} />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold text-[#FAFAFA]">
                    Dashboard de Plataforma & Auditoría Global
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
                    SUPER ADMIN
                  </span>
                </div>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Consola de validación de logs de torneos, partidos, autenticación e inconsistencias.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => onNavigate("admin")}>
                <Icon.Shield /> Panel de Torneos
              </Button>
              <Button size="sm" variant="primary" onClick={() => onNavigate("tournaments")}>
                <Icon.Swords /> Ver Todos los Torneos
              </Button>
            </div>
          </div>

          {/* Metric KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Usuarios Registrados" value={String((currentUser && currentUser.nickname !== "Invitado" ? 1 : 0) + referees.length)} icon={<Icon.Users />} />
            <StatCard label="Clanes & Escuadras" value={String(myTeam && myTeam.id !== "clan-solo" ? 1 : 0)} icon={<Icon.Shield />} />
            <StatCard label="Torneos en Circuito" value={String(tournaments.length)} icon={<Icon.Trophy />} />
            <StatCard label="Árbitros / Referees" value={String(referees.length)} icon={<Icon.Award />} />
          </div>

          {/* Logs Audit Viewer */}
          <Card className="p-6 border-[#27272A] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-[#FAFAFA] flex items-center gap-2">
                  <Icon.BarChart /> Registro Completo de Eventos & Logs de Auditoría
                </h2>
                <p className="text-xs text-[#71717A]">
                  Seguimiento de todas las operaciones realizadas por usuarios, árbitros y administradores.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Buscar en logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                />

                <select
                  value={logFilter}
                  onChange={(e) => setLogFilter(e.target.value)}
                  className="bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-1.5 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                >
                  <option value="ALL">Todos los Tipos</option>
                  <option value="AUTH">Auth / Sesiones</option>
                  <option value="TOURNAMENT">Torneos</option>
                  <option value="MATCH">Partidos / Disputas</option>
                  <option value="COMMUNITY">Comunidad</option>
                  <option value="SECURITY">Seguridad</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#27272A]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18181B] text-[#71717A] font-bold uppercase tracking-wider border-b border-[#27272A]">
                  <tr>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Acción</th>
                    <th className="py-3 px-4">Usuario / IP</th>
                    <th className="py-3 px-4">Detalles del Evento</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272A] bg-[#111113]">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#71717A]">
                        No se encontraron registros que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
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
                        <td className="py-3 px-4 text-[#A1A1AA]">{log.user}</td>
                        <td className="py-3 px-4 text-[#A1A1AA]">{log.details}</td>
                        <td className="py-3 px-4 text-right font-mono text-[#71717A] whitespace-nowrap">
                          {log.timestamp}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // REFEREE VIEW OF DASHBOARD
  if (isAuthenticated && currentRole === "REFEREE") {
    const refereeProfile = referees.find(
      (r) => r.id === currentUser.id || r.nickname === currentUser.nickname || r.email === currentUser.email
    ) || {
      nickname: currentUser.nickname || "Ref_Oficial",
      email: currentUser.email || "ref@toprival.gg",
      assignedGame: "Multijuego Oficial",
      matchesArbitrated: 0,
      status: "ACTIVE",
      createdAt: "Hoy",
    };

    return (
      <div className="min-h-screen bg-[#09090B] p-4 md:p-6 pb-20">
        <div className="max-w-5xl mx-auto space-y-7">
          {/* Referee Profile Card */}
          <Card className="p-6 border-[#D4860A]/30 bg-[#111113]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar name={refereeProfile.nickname} size={64} className="ring-2 ring-[#D4860A]" />
                  <span className="absolute -bottom-1 -right-1 p-1 bg-[#D4860A] text-white rounded-full text-[10px]">
                    <Icon.Shield />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-[#FAFAFA]">{refereeProfile.nickname}</h1>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#D4860A]/20 text-[#D4860A] border border-[#D4860A]/40">
                      OFICIAL REFEREE STAFF
                    </span>
                  </div>
                  <p className="text-xs text-[#71717A] mt-0.5">{refereeProfile.email}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[#A1A1AA]">
                    <span>Juego Asignado: <strong className="text-[#D4860A]">{refereeProfile.assignedGame}</strong></span>
                    <span>•</span>
                    <span>Estado: <strong className="text-[#22C55E]">Activo</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onNavigate("referee" as any)}
                  className="shadow-lg shadow-[#D4860A]/20"
                >
                  <Icon.Shield /> Abrir Panel Arbitral
                </Button>
              </div>
            </div>
          </Card>

          {/* Arbitral Impartiality Notice */}
          <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#D4860A]/15 text-[#D4860A] flex items-center justify-center shrink-0">
                <Icon.Shield />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#FAFAFA]">Perfil de Arbitraje y Moderación Certificado</h4>
                <p className="text-[11px] text-[#71717A]">
                  Esta cuenta está configurada como staff arbitral imparcial. No puedes inscribirte como jugador en torneos competitivos oficiales.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-[10px] font-bold rounded bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20 whitespace-nowrap">
              ✓ Credenciales Verificadas
            </span>
          </div>

          {/* Arbitral Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111113] p-4 rounded-xl border border-[#27272A]">
              <span className="text-xs text-[#71717A] block">Partidas Arbitradas</span>
              <span className="text-2xl font-bold text-[#FAFAFA] mt-1 block">{refereeProfile.matchesArbitrated}</span>
              <span className="text-[10px] text-[#22C55E]">En circuito oficial</span>
            </div>
            <div className="bg-[#111113] p-4 rounded-xl border border-[#27272A]">
              <span className="text-xs text-[#71717A] block">Tolerancia Oficial</span>
              <span className="text-2xl font-bold text-[#D4860A] mt-1 block">15 Minutos</span>
              <span className="text-[10px] text-[#71717A]">Reglamento Check-in</span>
            </div>
            <div className="bg-[#111113] p-4 rounded-xl border border-[#27272A]">
              <span className="text-xs text-[#71717A] block">Dictámenes Emitidos</span>
              <span className="text-2xl font-bold text-[#3B82F6] mt-1 block">100%</span>
              <span className="text-[10px] text-[#3B82F6]">Con actas archivadas</span>
            </div>
            <div className="bg-[#111113] p-4 rounded-xl border border-[#27272A]">
              <span className="text-xs text-[#71717A] block">Acreditación</span>
              <span className="text-2xl font-bold text-[#22C55E] mt-1 block">Nivel 1</span>
              <span className="text-[10px] text-[#22C55E]">Staff Oficial</span>
            </div>
          </div>

          {/* Circuit Tournaments under Supervision */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#FAFAFA] uppercase tracking-wider">
                Torneos en Supervisión ({tournaments.filter(t => t.status === "live" || t.status === "upcoming").length})
              </h2>
              <button
                onClick={() => onNavigate("tournaments")}
                className="text-xs text-[#D4860A] hover:text-[#BF7509] font-semibold cursor-pointer"
              >
                Ver todos los torneos →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tournaments.slice(0, 2).map((t) => (
                <Card key={t.id} className="p-4 border-[#27272A] flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#D4860A]">{t.game}</span>
                    <h3 className="font-bold text-sm text-[#FAFAFA]">{t.title}</h3>
                    <span className="text-xs text-[#71717A]">{t.status === "live" ? "🔴 En Vivo" : "🗓️ " + t.startDate}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onNavigate("referee" as any)}
                    className="text-xs"
                  >
                    ⚖️ Monitorear
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PLAYER VIEW OF DASHBOARD
  return (
    <div className="min-h-screen bg-[#09090B] p-4 md:p-6 pb-20">
      <div className="max-w-5xl mx-auto">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div className="flex items-center gap-3.5">
            <Avatar name={currentUser?.nickname || "Gamer"} size={48} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-[#FAFAFA]">
                  Hola, <span className="text-[#D4860A]">{currentUser?.nickname || "Gamer"}</span>
                </h1>
                <button
                  onClick={() => {
                    setNewNick(currentUser?.nickname || "");
                    setShowNickModal(true);
                  }}
                  className="text-xs text-[#71717A] hover:text-[#FAFAFA] underline cursor-pointer"
                  title="Cambiar nickname"
                >
                  ✎ Cambiar Nick
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="primary">{currentUser?.points || 0} Puntos TR</Badge>
                <span className="text-xs text-[#71717A]">· {myTeam && myTeam.id !== "clan-solo" ? myTeam.name : "Sin Clan"}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => onNavigate("tournaments")}>
              <Icon.Plus />
              Inscribirme a torneo
            </Button>
            <Button size="sm" onClick={() => onNavigate("bracket")}>
              <Icon.Swords />
              Ver Brackets
            </Button>
          </div>
        </div>

        {/* Modal Cambiar Nickname */}
        {showNickModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111113] border border-[#27272A] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
              <div className="p-5 border-b border-[#27272A] flex justify-between items-center bg-[#18181B]">
                <h3 className="font-bold text-sm text-[#FAFAFA]">Cambiar Nickname Competitivo</h3>
                <button
                  onClick={() => setShowNickModal(false)}
                  className="text-[#71717A] hover:text-[#FAFAFA] font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSaveNick} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                    Nuevo Nickname
                  </label>
                  <input
                    type="text"
                    required
                    value={newNick}
                    onChange={(e) => setNewNick(e.target.value)}
                    placeholder="Ej: FuraGod99"
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button size="sm" variant="outline" type="button" onClick={() => setShowNickModal(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" variant="primary" type="submit">
                    Guardar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Partida en Vivo Asignada */}
        {isPlayingLiveMatch && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#D4860A]/20 via-[#18181B] to-[#18181B] border border-[#D4860A]/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <span className="text-xs font-bold text-[#D4860A] uppercase tracking-wider block">
                  ¡Tienes una Partida Asignada en Curso!
                </span>
                <span className="text-sm font-bold text-[#FAFAFA]">
                  {currentMatch.roundName}: {currentMatch.participantA.name} vs {currentMatch.participantB.name}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="primary" onClick={() => onNavigate("match")}>
                Ir a la Sala de Partida →
              </Button>
              <Button size="sm" variant="outline" onClick={() => onNavigate("report")}>
                Reportar Resultado
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          <StatCard
            label="Torneos Jugados"
            value={String(currentUser?.stats?.tournamentsPlayed || 0)}
            icon={<Icon.Trophy />}
          />
          <StatCard
            label="Partidas Jugadas"
            value={String(currentUser?.stats?.matchesPlayed || 0)}
            icon={<Icon.Swords />}
          />
          <StatCard
            label="Win Rate"
            value={`${currentUser?.stats?.winRate || 0}%`}
            icon={<Icon.Zap />}
          />
          <StatCard
            label="Premios Ganados"
            value={`$${currentUser?.stats?.tournamentsWon ? currentUser.stats.tournamentsWon * 200 : 0}`}
            icon={<Icon.Award />}
          />
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main 2 cols */}
          <div className="lg:col-span-2 space-y-5">
            {/* Matches */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#FAFAFA] uppercase tracking-wider">
                  Mis Partidas
                </h2>
                <Button variant="ghost" size="sm" onClick={() => onNavigate("bracket")}>
                  Ver Bracket Completo →
                </Button>
              </div>

              {myMatchesMapped.length > 0 ? (
                <div className="space-y-3">
                  {myMatchesMapped.map((match) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onClick={() => onNavigate("match")}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center text-xs text-[#71717A]">
                  No tienes partidas pendientes en este momento. Inscríbete a un torneo para competir.
                </Card>
              )}
            </div>

            {/* Quick Tournaments */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#FAFAFA] uppercase tracking-wider">
                  Torneos Recomendados
                </h2>
                <Button variant="ghost" size="sm" onClick={() => onNavigate("tournaments")}>
                  Ver todos →
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tournaments.slice(0, 2).map((t) => (
                  <Card
                    key={t.id}
                    className="p-4 hover:border-[#3F3F46] transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedTournamentId(t.id);
                      onNavigate("detail");
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#D4860A]">{t.game}</span>
                      <Badge variant={t.status === "live" ? "live" : "success"}>
                        {t.status === "live" ? "En Vivo" : "Inscripciones"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm text-[#FAFAFA] mb-1 truncate">{t.title}</h3>
                    <div className="flex justify-between text-xs text-[#71717A]">
                      <span>Premio: {t.prizePool}</span>
                      <span>{t.startDate}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Clan Widget */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#27272A]">
                <h2 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-wider flex items-center gap-1.5">
                  <Icon.Shield /> Mi Clan & Escuadra
                </h2>
                <Button variant="ghost" size="sm" onClick={() => onNavigate("team")}>
                  Ver Clan →
                </Button>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-[#18181B] border flex items-center justify-center font-bold text-sm ${myTeam && myTeam.id !== "clan-solo" && myTeam.tag !== "SOLO" ? "border-[#D4860A] text-[#D4860A]" : "border-[#71717A] text-[#71717A]"}`}>
                  {myTeam && myTeam.id !== "clan-solo" && myTeam.tag !== "SOLO" ? myTeam.tag : "🐺"}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#FAFAFA]">
                    {myTeam && myTeam.id !== "clan-solo" && myTeam.tag !== "SOLO" ? myTeam.name : "Lobo Solitario"}
                  </div>
                  <div className="text-[11px] text-[#71717A]">
                    {myTeam && myTeam.id !== "clan-solo" && myTeam.tag !== "SOLO"
                      ? `${myTeam?.members?.length || 1} miembros activos`
                      : "Agente Libre (Sin Clan)"}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-[#A1A1AA] bg-[#18181B] p-2.5 rounded-lg border border-[#27272A]">
                Rol: <strong className="text-[#FAFAFA]">{currentRole === "TEAM_CAPTAIN" ? "Capitán del Clan" : "Jugador (Agente Libre)"}</strong>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-4">
              <h2 className="text-xs font-bold text-[#FAFAFA] uppercase tracking-wider mb-3 pb-2 border-b border-[#27272A]">
                Notificaciones Recientes
              </h2>
              <div className="space-y-3">
                {systemNotifications.length > 0 ? (
                  systemNotifications.slice(0, 4).map((n) => (
                    <div key={n.id} className="flex gap-2.5 items-start">
                      <span className="text-[#D4860A] mt-0.5 shrink-0 text-xs">🔔</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#FAFAFA] leading-snug">{n.message}</p>
                        <span className="text-[10px] text-[#71717A]">{n.timestamp}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-[#71717A] py-3">
                    No tienes notificaciones pendientes.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardScreen;
