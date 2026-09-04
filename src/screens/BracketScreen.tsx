import { useApp } from "../context/AppContext";
import { Badge, Button, Card, Icon } from "../components/ui";
import { Bracket } from "../components/Bracket";

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

export function BracketScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { selectedTournament, tournaments, currentMatch, isAuthenticated, currentUser } = useApp();
  const tournament = selectedTournament || tournaments[0] || null;

  const isPlayingLiveMatch = Boolean(
    currentMatch &&
    currentMatch.id &&
    currentMatch.id !== "none" &&
    (currentMatch.status === "IN_PROGRESS" || currentMatch.status === "WAITING_CONFIRMATION")
  );

  if (!tournament) {
    return (
      <div className="min-h-screen bg-[#09090B] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center text-xs text-[#71717A] space-y-4">
          <div className="text-4xl">🏆</div>
          <h2 className="text-base font-bold text-[#FAFAFA]">No hay torneos seleccionados</h2>
          <p>Selecciona un torneo en la lista oficial para visualizar su árbol de eliminatorias y cruces.</p>
          <Button onClick={() => onNavigate("tournaments")}>Explorar Torneos</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Header */}
      <div className="bg-[#111113] border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5">
          <button
            onClick={() => onNavigate("tournaments")}
            className="flex items-center gap-1 text-sm text-[#71717A] hover:text-[#A1A1AA] mb-3 cursor-pointer transition-colors"
          >
            ← Volver a torneos
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-[#FAFAFA]">
                  Bracket — {tournament.title}
                </h1>
                <Badge variant={tournament.status === "live" ? "live" : "default"}>
                  {tournament.status === "live" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] inline-block animate-pulse" />
                  )}
                  {tournament.status === "live" ? "En Vivo" : tournament.status}
                </Badge>
              </div>
              <p className="text-sm text-[#71717A]">
                {tournament.gameIcon || "🎮"} {tournament.game} · {tournament.mode} · {tournament.maxParticipants} participantes
              </p>
            </div>
            {isAuthenticated ? (
              <Button size="sm" onClick={() => onNavigate("tournaments")}>
                <Icon.Swords />
                Ver todos los torneos
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => onNavigate("login")}>
                Iniciar sesión
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-5">
        <div className="flex flex-wrap gap-3 text-xs mb-6">
          {[
            { color: "bg-[#D4860A]/15 border border-[#D4860A]/40", label: "Tu posición" },
            { color: "bg-[#EF4444]/20 border border-[#EF4444]/40", label: "Partido en vivo" },
            { color: "bg-[#22C55E]/10 border border-[#22C55E]/25", label: "Ganador" },
            { color: "bg-[#27272A]", label: "Pendiente" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${l.color}`} />
              <span className="text-[#71717A]">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bracket */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8">
        <Card className="p-5 overflow-hidden">
          <Bracket />
        </Card>
      </div>

      {/* Current match highlight (only if there is a real match) */}
      {isPlayingLiveMatch && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-8">
          <Card className="p-5 border-[#EF4444]/30 bg-[#EF4444]/5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <Badge variant="live" className="mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] inline-block animate-pulse" />
                  {currentMatch.status === "IN_PROGRESS" ? "Partida en Vivo" : currentMatch.status}
                </Badge>
                <div className="text-[#FAFAFA] font-bold text-lg">
                  {currentMatch.participantA.name} vs {currentMatch.participantB.name}
                </div>
                <div className="text-sm text-[#A1A1AA]">{currentMatch.roundName} · {currentMatch.scheduledTime}</div>
              </div>
              <div className="flex gap-3">
                {isAuthenticated && (
                  <Button variant="outline" size="sm" onClick={() => onNavigate("dashboard")}>
                    Dashboard
                  </Button>
                )}
                <Button onClick={() => onNavigate("match")}>
                  Ver partido
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
