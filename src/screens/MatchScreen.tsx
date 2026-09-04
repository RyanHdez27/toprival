import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Badge, Button, Card, Avatar, Icon } from "../components/ui";
import { api } from "../services/api";

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

export function MatchScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { currentMatch, selectedTournament, currentUser, currentRole, resolveDispute, showAlert } = useApp();
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60); // 15 minutos de tolerancia
  const [woClaimed, setWoClaimed] = useState(false);

  const isRefereeOrAdmin = currentRole === "REFEREE" || currentRole === "ADMIN";

  // Temporizador de 15 minutos reglamentarios para Walk-Over
  useEffect(() => {
    if (secondsRemaining <= 0 || woClaimed) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining, woClaimed]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCheckIn = async () => {
    setIsCheckedIn(true);
    try {
      await api.matches.checkIn(currentMatch.id);
    } catch (err) {
      console.warn("CheckIn API call error:", err);
    }
  };

  const handleClaimWalkOver = () => {
    setWoClaimed(true);
    resolveDispute(currentUser.nickname === currentMatch.participantA.name ? currentMatch.participantA.id : currentMatch.participantB.id);
  };

  if (currentMatch.id === "none") {
    return (
      <div className="min-h-screen bg-[#09090B] p-6 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center text-xs text-[#71717A] space-y-4">
          <div className="text-4xl">🎮</div>
          <h2 className="text-base font-bold text-[#FAFAFA]">No tienes ninguna partida activa</h2>
          <p>No te encuentras disputando una partida oficial en este momento. Revisa el bracket o inscríbete a un torneo disponible.</p>
          <Button onClick={() => onNavigate("tournaments")}>Ver Torneos</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B]">
      {/* Header */}
      <div className="bg-[#111113] border-b border-[#27272A]">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-5">
          <button
            onClick={() => onNavigate("bracket")}
            className="flex items-center gap-1 text-sm text-[#71717A] hover:text-[#A1A1AA] mb-3 cursor-pointer transition-colors"
          >
            ← Ver bracket completo
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-[#FAFAFA]">{currentMatch.roundName}</h1>
            <Badge variant="live">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] inline-block animate-pulse" />
              {woClaimed ? "Finalizado (W.O.)" : currentMatch.status === "IN_PROGRESS" ? "En Vivo" : currentMatch.status}
            </Badge>
            <span className="text-sm text-[#71717A]">{selectedTournament.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-5">
        {/* Main match card */}
        <Card className="p-6 border-[#EF4444]/20 shadow-[0_0_40px_#EF444410]">
          <div className="flex items-center justify-center gap-6 md:gap-12">
            {/* Player 1 (you) */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="relative">
                <Avatar name={currentMatch.participantA.name} size={64} className="ring-2 ring-[#D4860A]" />
                {currentMatch.participantA.name === currentUser.nickname && (
                  <div className="absolute -bottom-1 -right-1 bg-[#D4860A] rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white">TÚ</div>
                )}
              </div>
              <div className="text-center">
                <div className="font-bold text-[#F5B830]">{currentMatch.participantA.name}</div>
                <div className="text-xs text-[#71717A]">Seed #{currentMatch.participantA.seed || 1}</div>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full font-semibold">
                    ✓ Check-in Listo
                  </span>
                </div>
              </div>
              <div className="font-mono text-5xl font-bold text-[#FAFAFA]">
                {woClaimed ? 2 : currentMatch.score ? currentMatch.score.scoreA : 0}
              </div>
            </div>

            {/* VS & Timer */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-xs font-mono text-[#52525B] tracking-widest">VS</div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                <span className="text-xs text-[#EF4444] font-semibold">EN VIVO</span>
              </div>
              <div className="mt-2 text-center">
                <div className="text-[10px] text-[#71717A] uppercase font-mono">Tolerancia W.O.</div>
                <div className={`font-mono text-xs font-bold ${secondsRemaining <= 180 ? 'text-[#EF4444] animate-pulse' : 'text-[#F5B830]'}`}>
                  ⏱️ {formatTimer(secondsRemaining)}
                </div>
              </div>
            </div>

            {/* Player 2 */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <div className="relative">
                <Avatar name={currentMatch.participantB.name} size={64} />
                {currentMatch.participantB.name === currentUser.nickname && (
                  <div className="absolute -bottom-1 -right-1 bg-[#D4860A] rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white">TÚ</div>
                )}
              </div>
              <div className="text-center">
                <div className="font-bold text-[#FAFAFA]">{currentMatch.participantB.name}</div>
                <div className="text-xs text-[#71717A]">Seed #{currentMatch.participantB.seed || 2}</div>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#EAB308] bg-[#EAB308]/10 px-2 py-0.5 rounded-full font-semibold">
                    ⏳ En sala
                  </span>
                </div>
              </div>
              <div className="font-mono text-5xl font-bold text-[#FAFAFA]">
                {woClaimed ? 0 : currentMatch.score ? currentMatch.score.scoreB : 0}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-[#71717A]">
            {woClaimed ? "🏆 Partida concluida por Walk-Over reglamentario" : "Juego 1 de 3 · Formato Bo3"}
          </div>
        </Card>

        {/* W.O. Rule Alert / Status */}
        {secondsRemaining <= 0 || woClaimed ? (
          <Card className="p-4 border-[#22C55E]/30 bg-[#22C55E]/10">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center shrink-0">
                  <Icon.Check />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#FAFAFA]">
                    {woClaimed ? "¡Victoria asignada por W.O.!" : "Tolerancia de 15 minutos cumplida"}
                  </div>
                  <div className="text-xs text-[#A1A1AA]">
                    {woClaimed ? "Avanzaste a la siguiente ronda del bracket." : "El rival no se presentó dentro del tiempo límite. Puedes reclamar la victoria por Walk-Over."}
                  </div>
                </div>
              </div>
              {!woClaimed && (
                <Button variant="primary" size="sm" onClick={handleClaimWalkOver}>
                  Reclamar Victoria por W.O.
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-4 border-[#F59E0B]/20 bg-[#F59E0B]/5">
            <div className="flex items-center gap-3">
              <Icon.Clock />
              <div className="flex-1">
                <div className="text-sm font-semibold text-[#FAFAFA]">
                  Regla de Check-in y Tolerancia (15 Minutos)
                </div>
                <div className="text-xs text-[#A1A1AA] mt-0.5">
                  Ambos capitanes deben estar en el servidor antes de que expire el temporizador ({formatTimer(secondsRemaining)}). Si el rival no asiste, el sistema adjudica victoria por W.O.
                </div>
              </div>
              {!isCheckedIn && (
                <Button size="sm" variant="primary" onClick={handleCheckIn}>
                  Confirmar mi Check-in
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-5">
          <h2 className="font-semibold text-[#FAFAFA] mb-4 flex items-center gap-2">
            <Icon.Info />
            Instrucciones de Partida
          </h2>
          <div className="space-y-3">
            {[
              {
                num: 1,
                title: "Coordina en Discord",
                desc: "Usa el canal privado de Discord del torneo para compartir código de sala.",
              },
              {
                num: 2,
                title: "Juega el partido al mejor de 3 (Bo3)",
                desc: "El primer equipo en ganar 2 partidas avanza a la siguiente ronda.",
              },
              {
                num: 3,
                title: "Reporta con captura de pantalla",
                desc: "Sube la captura de victoria de la tabla de puntuaciones.",
              },
            ].map((step) => (
              <div key={step.num} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#D4860A]/20 text-[#F5B830] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {step.num}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#FAFAFA]">{step.title}</div>
                  <div className="text-xs text-[#71717A] mt-0.5">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Referee Actions if logged as REF/ADMIN */}
        {isRefereeOrAdmin && (
          <Card className="p-4 border-[#D4860A]/40 bg-[#18181B] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#D4860A] uppercase tracking-wider flex items-center gap-1.5">
                  <Icon.Shield /> Control Arbitral Oficial
                </span>
                <span className="text-xs text-[#71717A]">({currentUser.nickname})</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => onNavigate("referee" as any)}>
                ⚖️ Consola Arbitral Completa →
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#27272A]">
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  resolveDispute(currentMatch.participantA.id, `Victoria adjudicada por árbitro ${currentUser.nickname}`);
                  showAlert("Victoria Asignada", `✓ Victoria adjudicada oficialmente a ${currentMatch.participantA.name}`, "success");
                }}
              >
                🏆 Victoria {currentMatch.participantA.name}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  resolveDispute(currentMatch.participantB.id, `Victoria adjudicada por árbitro ${currentUser.nickname}`);
                  showAlert("Victoria Asignada", `✓ Victoria adjudicada oficialmente a ${currentMatch.participantB.name}`, "success");
                }}
              >
                🏆 Victoria {currentMatch.participantB.name}
              </Button>
            </div>
          </Card>
        )}

        {/* Actions for players */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button fullWidth onClick={() => onNavigate("report")}>
            <Icon.Upload />
            Reportar resultado
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={() => showAlert("Disputa Enviada", "Reporte de disputa enviado a los árbitros de guardia. Un oficial revisará la partida a la brevedad.", "warning")}
          >
            <Icon.Flag />
            Reportar disputa a árbitro
          </Button>
        </div>
      </div>
    </div>
  );
}
