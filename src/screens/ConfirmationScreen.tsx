import { useApp } from "../context/AppContext";
import { Button, Badge, Card, Icon } from "../components/ui";

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

export function ConfirmationScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { selectedTournament, myTeam } = useApp();

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_#22C55E20]">
          <span className="text-[#22C55E] scale-150">
            <Icon.Check />
          </span>
        </div>

        <Badge variant="success" className="mb-4">
          Inscripción Confirmada
        </Badge>

        <h1 className="text-2xl font-bold text-[#FAFAFA] mb-2">
          ¡Estás inscrito!
        </h1>
        <p className="text-[#A1A1AA] text-sm leading-relaxed mb-8">
          Tu equipo <strong className="text-[#FAFAFA]">{myTeam.name}</strong> ha quedado oficialmente registrado en <strong className="text-[#FAFAFA]">{selectedTournament.title}</strong>.
        </p>

        <Card className="p-5 text-left mb-6">
          <h3 className="font-semibold text-[#FAFAFA] mb-3 text-sm">Resumen de Registro</h3>
          <div className="space-y-2">
            {[
              { icon: <Icon.Swords />, label: "Torneo", value: selectedTournament.title },
              { icon: <Icon.Calendar />, label: "Fecha", value: `${selectedTournament.startDate} · ${selectedTournament.startTime}` },
              { icon: <Icon.Users />, label: "Modalidad", value: `${selectedTournament.game} (${selectedTournament.mode})` },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-2 text-sm text-[#A1A1AA]">
                <span className="text-[#D4860A]">{r.icon}</span>
                <span className="text-[#71717A]">{r.label}:</span>
                <span className="text-[#FAFAFA]">{r.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[#27272A] flex items-center gap-2 text-xs text-[#71717A]">
            <Icon.Clock />
            Estado: <Badge variant="success">Cupo Asegurado</Badge>
          </div>
        </Card>

        {/* Next steps */}
        <Card className="p-5 text-left mb-8 bg-[#D4860A]/5 border-[#D4860A]/20">
          <h3 className="font-semibold text-[#FAFAFA] mb-3 text-sm">Próximos pasos</h3>
          <div className="space-y-2">
            {[
              "Recibirás confirmación por Discord",
              "El bracket se publicará el 13 Sep a las 20:00",
              "Los partidos comienzan el 14 Sep",
              "Reporta tus resultados desde el Dashboard",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                <span className="w-4 h-4 rounded-full bg-[#D4860A]/20 text-[#F5B830] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <Button fullWidth onClick={() => onNavigate("dashboard")}>
            <Icon.LayoutDashboard />
            Ir al Dashboard
          </Button>
          <Button variant="ghost" fullWidth onClick={() => onNavigate("tournaments")}>
            Ver más torneos
          </Button>
        </div>
      </div>
    </div>
  );
}
