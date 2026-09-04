import { useApp } from "../context/AppContext";
import { Badge, Button, Card, Avatar, Icon, Divider } from "../components/ui";

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

export function TournamentDetailScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { selectedTournament, tournaments, isAuthenticated, myTeam, currentUser } = useApp();
  const tournament = selectedTournament || tournaments[0] || {
    id: "ff-live-01",
    title: "Torneo Oficial TopRival",
    game: "FreeFire",
    gameIcon: "🔥",
    status: "registration-open",
    mode: "Squads 4v4",
    prizePool: "$300 USD",
    currentParticipants: 10,
    maxParticipants: 16,
    startDate: "15 Sep 2026",
    startTime: "20:00 COT",
    registeredTeamsOrPlayers: [],
    rules: {
      matchCheckInMinutes: 15,
      seriesType: "Bo1",
    },
  };

  const registeredList = tournament.registeredTeamsOrPlayers || [];
  const currentCount = tournament.currentParticipants ?? registeredList.length ?? 0;
  const maxCount = tournament.maxParticipants ?? 16;
  const remainingSlots = Math.max(0, maxCount - currentCount);
  const fillPct = Math.min(100, Math.round((currentCount / maxCount) * 100));

  const isAlreadyRegistered = registeredList.some(
    (p) =>
      p.id === myTeam?.id ||
      p.id === currentUser?.id ||
      p.name === myTeam?.name ||
      p.name === currentUser?.nickname
  );

  const handleRegistrationClick = () => {
    if (!isAuthenticated) {
      onNavigate("login");
    } else {
      onNavigate("registration");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Banner */}
      <div className="relative h-52 md:h-72 overflow-hidden">
        <img
          src={tournament.bannerImage || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1440&h=288&fit=crop&auto=format"}
          alt={tournament.title}
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090B]/80 to-transparent" />

        <div className="absolute bottom-6 left-4 md:left-6 right-4 md:right-6">
          <button
            onClick={() => onNavigate("tournaments")}
            className="flex items-center gap-1 text-sm text-[#71717A] hover:text-[#A1A1AA] mb-3 cursor-pointer transition-colors"
          >
            ← Volver a Torneos
          </button>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant={tournament.status === "live" ? "live" : "success"}>
              {tournament.status === "live" && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] inline-block animate-pulse" />
              )}
              {tournament.status === "registration-open"
                ? "Inscripciones Abiertas"
                : tournament.status === "live"
                ? "Torneo en Vivo"
                : tournament.status}
            </Badge>
            {tournament.status === "registration-open" && (
              <Badge variant="warning">
                <Icon.AlertTriangle />
                {remainingSlots} cupos restantes
              </Badge>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-[#FAFAFA]">
            {tournament.title}
          </h1>
          <p className="text-[#A1A1AA] text-sm mt-1 flex items-center gap-1">
            <span>{tournament.gameIcon}</span> {tournament.game} · {tournament.mode}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Key info cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <Icon.Trophy />, label: "Premio", value: tournament.prizePool, color: "text-[#F5B830]" },
              { icon: <Icon.Calendar />, label: "Fecha", value: tournament.startDate, color: "text-[#FAFAFA]" },
              { icon: <Icon.Clock />, label: "Hora", value: tournament.startTime, color: "text-[#FAFAFA]" },
              { icon: <Icon.Users />, label: "Cupos", value: `${currentCount} / ${maxCount}`, color: "text-[#F59E0B]" },
            ].map((item) => (
              <Card key={item.label} className="p-4">
                <div className="text-[#71717A] mb-1">{item.icon}</div>
                <div className={`font-bold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-[#71717A]">{item.label}</div>
              </Card>
            ))}
          </div>

          {/* Description */}
          <Card className="p-5">
            <h2 className="font-semibold text-[#FAFAFA] mb-3">Acerca del torneo</h2>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
              Torneo oficial organizado por TopRival para la comunidad competitiva de {tournament.game}. Formato {tournament.mode} con sistema automatizado de brackets, check-in previo y soporte de árbitros para validación de resultados.
            </p>
          </Card>

          {/* Rules */}
          <Card className="p-5">
            <h2 className="font-semibold text-[#FAFAFA] mb-4">Reglas y formato</h2>
            <div className="space-y-3">
              {[
                { icon: <Icon.Shield />, text: `Formato: ${tournament.mode} (${tournament.rules?.seriesType || "Bo1"})` },
                { icon: <Icon.Clock />, text: `Tolerancia de check-in: ${tournament.rules?.matchCheckInMinutes || 15} minutos antes del match` },
                { icon: <Icon.Users />, text: tournament.isTeamBased ? "Inscripción por escuadras registradas" : "Inscripción individual / 1v1" },
                { icon: <Icon.Flag />, text: "Resultados obligatorios con captura de pantalla" },
                { icon: <Icon.AlertTriangle />, text: "Disputas evaluadas por el equipo de moderación TopRival" },
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-[#A1A1AA]">
                  <span className="text-[#D4860A] mt-0.5 shrink-0">{r.icon}</span>
                  {r.text}
                </div>
              ))}
            </div>
          </Card>

          {/* Participants */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#FAFAFA]">
                Equipos y Jugadores Confirmados
                <span className="ml-2 text-[#71717A] font-normal text-sm">({registeredList.length}/{maxCount})</span>
              </h2>
              <div className="h-1.5 w-24 bg-[#27272A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F59E0B] rounded-full"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>
            {registeredList.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {registeredList.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-2 bg-[#18181B] rounded-lg">
                    <Avatar name={p.name} size={24} />
                    <span className="text-sm truncate text-[#A1A1AA] font-medium">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#71717A]">Aún no hay inscritos en este torneo. ¡Sé el primero!</p>
            )}
          </Card>
        </div>

        {/* Sidebar — registration */}
        <div className="space-y-4">
          <Card className="p-5 border-[#D4860A]/30 shadow-[0_0_30px_#D4860A15]">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={tournament.status === "live" ? "live" : "success"}>
                {tournament.status === "live" ? "En Curso" : "Inscripciones Abiertas"}
              </Badge>
            </div>
            <h3 className="font-semibold text-[#FAFAFA] text-lg mt-3 mb-1">
              {tournament.status === "live" ? "Torneo en Progreso" : "Inscribirse al torneo"}
            </h3>
            <p className="text-sm text-[#71717A] mb-4">
              {tournament.status === "live"
                ? "El torneo ya ha comenzado. Puedes consultar los brackets y seguir las partidas en vivo."
                : "Completa el formulario de inscripción para reservar el cupo de tu escuadra."}
            </p>

            <div className="space-y-2 mb-5 text-sm">
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Inscripción</span>
                <span className="font-semibold text-[#22C55E]">{tournament.entryFee || "Gratuita"}</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Cupos restantes</span>
                <span className="font-semibold text-[#F59E0B]">{remainingSlots} cupos</span>
              </div>
              <div className="flex justify-between text-[#A1A1AA]">
                <span>Cierre inscripciones</span>
                <span>15 Sep, 23:59 COT</span>
              </div>
            </div>

            <Divider className="mb-4" />

            {isAlreadyRegistered ? (
              <div className="space-y-2">
                <div className="p-3 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                  <Icon.Check /> ¡Ya estás inscrito en este torneo!
                </div>
                <Button fullWidth size="lg" onClick={() => onNavigate("bracket")}>
                  <Icon.Swords />
                  Ver Bracket y Partidas
                </Button>
              </div>
            ) : tournament.status === "live" ? (
              <Button fullWidth size="lg" onClick={() => onNavigate("bracket")}>
                <Icon.Swords />
                Ver Bracket en Vivo
              </Button>
            ) : !isAuthenticated ? (
              <div className="space-y-2">
                <Button fullWidth size="lg" onClick={() => onNavigate("login")}>
                  Iniciar sesión para Inscribirme
                </Button>
                <Button fullWidth variant="outline" size="sm" onClick={() => onNavigate("register")}>
                  ¿Sin cuenta? Regístrate gratis
                </Button>
              </div>
            ) : (
              <Button fullWidth size="lg" onClick={handleRegistrationClick}>
                <Icon.Swords />
                Inscribirme ahora
              </Button>
            )}

            {!isAlreadyRegistered && (
              <Button
                variant="outline"
                fullWidth
                size="sm"
                className="mt-2"
                onClick={() => onNavigate("bracket")}
              >
                Consultar Bracket del Torneo
              </Button>
            )}

            <p className="text-center text-xs text-[#71717A] mt-3">
              Al participar aceptas las reglas oficiales de TopRival
            </p>
          </Card>

          {/* Prize breakdown */}
          <Card className="p-5">
            <h3 className="font-semibold text-[#FAFAFA] mb-3 flex items-center gap-2">
              <Icon.Trophy />
              Premiación
            </h3>
            <div className="space-y-2">
              {[
                { pos: "🥇 1°", prize: "$200 USD" },
                { pos: "🥈 2°", prize: "$100 USD" },
                { pos: "🥉 3°", prize: "Puntos Ranking" },
              ].map((p) => (
                <div key={p.pos} className="flex justify-between text-sm">
                  <span className="text-[#A1A1AA]">{p.pos}</span>
                  <span className="font-semibold text-[#F5B830]">{p.prize}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
