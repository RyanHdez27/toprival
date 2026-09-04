import { useApp } from "../context/AppContext";
import { Button, Badge, Card, Avatar, Icon } from "../components/ui";

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

export function ChampionScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { selectedTournament, currentUser } = useApp();
  const championName = currentUser?.nickname || "Campeón Oficial";
  const tournamentTitle = selectedTournament?.title || "Torneo Oficial TopRival";
  const prize = selectedTournament?.prizePool || "$0 USD";

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center px-4 py-12">
      {/* Radial glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, #D4860A22 0%, transparent 65%)",
        }}
      />

      <div className="relative max-w-lg w-full text-center">
        {/* Trophy */}
        <div className="relative mb-6">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center mx-auto shadow-[0_0_80px_#F59E0B40]"
            style={{ background: "linear-gradient(135deg, #F59E0B22, #F59E0B44)" }}
          >
            <span className="text-6xl">🏆</span>
          </div>
          <div className="absolute -top-2 -right-2 left-0 right-0 flex justify-center">
            <span className="text-2xl animate-bounce">⭐</span>
          </div>
        </div>

        <Badge variant="warning" className="mb-4">
          <Icon.Award />
          Torneo Finalizado
        </Badge>

        <h1 className="text-4xl md:text-5xl font-bold text-[#FAFAFA] mb-2">
          ¡Campeón!
        </h1>
        <p className="text-[#F5B830] text-xl font-semibold mb-1">{championName}</p>
        <p className="text-[#71717A] text-sm mb-8">
          {tournamentTitle}
        </p>

        {/* Final match */}
        <Card className="p-5 mb-5 border-[#F59E0B]/20 bg-[#F59E0B]/5">
          <div className="text-xs font-mono text-[#71717A] mb-3 uppercase tracking-wider">
            Gran Final Oficial
          </div>
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar name={championName} size={40} className="ring-2 ring-[#F59E0B]" />
              <span className="text-sm font-bold text-[#F5B830]">{championName}</span>
              <span className="font-mono text-2xl font-bold text-[#22C55E]">1º</span>
            </div>
            <span className="font-mono text-[#52525B]">★</span>
            <div className="flex flex-col items-center gap-2">
              <Avatar name="Finalista" size={40} />
              <span className="text-sm font-bold text-[#A1A1AA]">Subcampeón</span>
              <span className="font-mono text-2xl font-bold text-[#71717A]">2º</span>
            </div>
          </div>
        </Card>

        {/* Prize */}
        <Card className="p-5 mb-5 border-[#F5B830]/20">
          <div className="flex items-center justify-center gap-3">
            <Icon.Trophy />
            <div>
              <div className="text-xs text-[#71717A]">Bolsa de premios asignada</div>
              <div className="text-2xl font-bold text-[#F5B830]">{prize}</div>
            </div>
          </div>
        </Card>

        {/* Podium */}
        <Card className="p-5 mb-8">
          <h3 className="text-sm font-semibold text-[#A1A1AA] mb-4">Podio final</h3>
          <div className="space-y-2">
            {[
              { pos: "🥇", name: "TuNick", prize: "$300", isYou: true },
              { pos: "🥈", name: "ShadowX", prize: "$150", isYou: false },
              { pos: "🥉", name: "BlazeKing", prize: "$50", isYou: false },
            ].map((p) => (
              <div
                key={p.name}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg ${
                  p.isYou ? "bg-[#D4860A]/15 border border-[#D4860A]/30" : "bg-[#18181B]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{p.pos}</span>
                  <Avatar name={p.name} size={28} />
                  <span className={`text-sm font-medium ${p.isYou ? "text-[#F5B830]" : "text-[#A1A1AA]"}`}>
                    {p.name}
                    {p.isYou && <span className="ml-1 text-xs">★</span>}
                  </span>
                </div>
                <span className="font-mono font-semibold text-[#F5B830]">{p.prize}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <Button fullWidth size="lg" onClick={() => onNavigate("tournaments")}>
            <Icon.Swords />
            Jugar otro torneo
          </Button>
          <Button variant="ghost" fullWidth onClick={() => onNavigate("rankings")}>
            Ver rankings globales
          </Button>
        </div>
      </div>
    </div>
  );
}
