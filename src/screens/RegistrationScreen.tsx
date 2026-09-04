import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button, Badge, Card, Input, Select, Icon, Divider } from "../components/ui";

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

export function RegistrationScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { selectedTournament, myTeam, currentUser, registerCurrentTeamToTournament, isAuthenticated } = useApp();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"solo" | "team">("team");
  const [nick, setNick] = useState(currentUser?.nickname || "GamerNick");
  const [discord, setDiscord] = useState(currentUser?.discordTag || "Nick#1337");

  const handleSubmit = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      registerCurrentTeamToTournament(selectedTournament.id);
      onNavigate("confirmation");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4 py-8">
        <Card className="max-w-md w-full p-6 text-center space-y-4 border-[#D4860A]/40 bg-[#111113]">
          <div className="w-12 h-12 rounded-xl bg-[#D4860A]/20 flex items-center justify-center text-[#D4860A] mx-auto text-xl">
            <Icon.Swords />
          </div>
          <h2 className="text-xl font-bold text-[#FAFAFA]">Inscripción a Torneo</h2>
          <p className="text-sm text-[#A1A1AA]">
            Para inscribir a tu equipo o competir en <strong className="text-[#FAFAFA]">{selectedTournament.title}</strong> necesitas tener una cuenta en TopRival.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Button fullWidth size="lg" onClick={() => onNavigate("login")}>
              Iniciar Sesión
            </Button>
            <Button fullWidth variant="outline" size="lg" onClick={() => onNavigate("register")}>
              Crear Cuenta Gratis
            </Button>
            <button
              onClick={() => onNavigate("detail")}
              className="text-xs text-[#71717A] hover:text-[#FAFAFA] pt-2 cursor-pointer transition-colors"
            >
              ← Volver a los detalles del torneo
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col">
      {/* Header */}
      <div className="bg-[#111113] border-b border-[#27272A]">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-5">
          <button
            onClick={() => (step === 1 ? onNavigate("detail") : setStep(step - 1))}
            className="flex items-center gap-1 text-sm text-[#71717A] hover:text-[#A1A1AA] mb-4 cursor-pointer transition-colors"
          >
            ← {step === 1 ? "Volver al torneo" : "Paso anterior"}
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[#D4860A]/20 flex items-center justify-center text-lg">
              {selectedTournament.gameIcon}
            </div>
            <div>
              <h1 className="font-bold text-[#FAFAFA]">Inscripción — {selectedTournament.title}</h1>
              <p className="text-sm text-[#71717A]">{selectedTournament.game} · {selectedTournament.mode} · {selectedTournament.startDate}</p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    s < step
                      ? "bg-[#22C55E] text-white"
                      : s === step
                      ? "bg-[#D4860A] text-white"
                      : "bg-[#27272A] text-[#71717A]"
                  }`}
                >
                  {s < step ? <Icon.Check /> : s}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${s === step ? "text-[#FAFAFA]" : "text-[#71717A]"}`}>
                  {["Modalidad", "Datos", "Confirmar"][s - 1]}
                </span>
                {s < 3 && <div className={`flex-1 w-8 h-px ${s < step ? "bg-[#22C55E]" : "bg-[#27272A]"}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 md:px-6 py-8">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-[#FAFAFA] mb-2">Selecciona tu modalidad</h2>
            <p className="text-[#71717A] text-sm mb-6">¿Participas solo o con un equipo?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["solo", "team"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`p-5 rounded-xl border-2 text-left cursor-pointer transition-all ${
                    mode === m
                      ? "border-[#D4860A] bg-[#D4860A]/10"
                      : "border-[#27272A] bg-[#111113] hover:border-[#3F3F46]"
                  }`}
                >
                  <div className="text-2xl mb-3">{m === "solo" ? "🎯" : "🛡️"}</div>
                  <div className="font-semibold text-[#FAFAFA] mb-1">
                    {m === "solo" ? "Jugador Individual" : "Con mi Equipo"}
                  </div>
                  <div className="text-sm text-[#71717A]">
                    {m === "solo"
                      ? "Participas como jugador libre. El organizador puede asignarte equipo."
                      : "Inscribes a tu equipo completo (mínimo 5 jugadores)."}
                  </div>
                  {mode === m && (
                    <div className="mt-3">
                      <Badge variant="primary">
                        <Icon.Check />
                        Seleccionado
                      </Badge>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-[#FAFAFA] mb-2">Tus datos</h2>
            <p className="text-[#71717A] text-sm mb-6">
              Confirma tu información para la inscripción.
            </p>
            <div className="space-y-4">
              <Input
                label="Nick en el juego"
                value={nick}
                onChange={setNick}
                placeholder="TuNick#0001"
                required
                hint="Debe coincidir exactamente con tu nombre en Valorant"
              />
              <Input
                label="Discord"
                value={discord}
                onChange={setDiscord}
                placeholder="Usuario#0000"
                required
                hint="Para coordinación de partidos"
              />
              {mode === "team" && (
                <Select
                  label="Seleccionar equipo"
                  value={myTeam.id}
                  options={[
                    { value: myTeam.id, label: `${myTeam.name} (${myTeam.members.length} miembros)` },
                  ]}
                />
              )}
              <Card className="p-4 border-[#3B82F6]/20 bg-[#3B82F6]/5">
                <div className="flex items-start gap-2 text-sm text-[#A1A1AA]">
                  <span className="text-[#3B82F6] mt-0.5 shrink-0"><Icon.Info /></span>
                  Al inscribirte confirmas que cumples los requisitos de participación y aceptas el reglamento oficial de TopRival.
                </div>
              </Card>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-[#FAFAFA] mb-2">Confirmar inscripción</h2>
            <p className="text-[#71717A] text-sm mb-6">Revisa los datos antes de confirmar.</p>
            <Card className="p-5 space-y-3">
              {[
                { label: "Torneo", value: selectedTournament.title },
                { label: "Juego", value: selectedTournament.game },
                { label: "Modalidad", value: mode === "solo" ? "Jugador Individual" : `Equipo: ${myTeam.name}` },
                { label: "Capitán / Nick", value: nick },
                { label: "Discord", value: discord },
                { label: "Fecha de inicio", value: `${selectedTournament.startDate} · ${selectedTournament.startTime}` },
                { label: "Costo de inscripción", value: selectedTournament.entryFee || "Gratis" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-[#71717A]">{r.label}</span>
                  <span className="text-[#FAFAFA] font-medium">{r.value}</span>
                </div>
              ))}
              <Divider />
              <div className="flex justify-between text-sm">
                <span className="text-[#71717A]">Estado de solicitud</span>
                <Badge variant="success">Confirmación Inmediata</Badge>
              </div>
            </Card>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Anterior
            </Button>
          )}
          <Button fullWidth onClick={handleSubmit}>
            {step < 3 ? "Continuar" : "Confirmar Inscripción"}
          </Button>
        </div>
      </div>
    </div>
  );
}
