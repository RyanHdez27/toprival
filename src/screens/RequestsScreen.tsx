import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button, Badge, Icon, Card } from "../components/ui";

const GAME_MODES: Record<string, { mode: string; defaultTarget: number }[]> = {
  "FreeFire": [
    { mode: "Battle Royale — Escuadra (4v4)", defaultTarget: 48 },
    { mode: "Battle Royale — Dúos (2v2)", defaultTarget: 48 },
    { mode: "Battle Royale — Solitario (1v1)", defaultTarget: 48 },
    { mode: "Duelo de Escuadras / PVP (4v4)", defaultTarget: 16 },
    { mode: "PVP Dúo (2v2)", defaultTarget: 16 },
    { mode: "PVP Solitario (1v1)", defaultTarget: 32 },
  ],
  "CODMobile": [
    { mode: "Multijugador / Solitario (1v1)", defaultTarget: 32 },
    { mode: "Multijugador / Dúo (2v2)", defaultTarget: 16 },
    { mode: "Multijugador / Escuadra (4v4)", defaultTarget: 16 },
    { mode: "Battle Royale — Escuadras (4v4)", defaultTarget: 16 },
    { mode: "Battle Royale — Dúos (2v2)", defaultTarget: 48 },
    { mode: "Battle Royale — Solitario (1v1)", defaultTarget: 48 },
  ],
  "FC Mobile": [
    { mode: "Cara a Cara (1v1)", defaultTarget: 32 },
    { mode: "Ataque Enfrentado (1v1)", defaultTarget: 32 },
  ],
  "Warzone": [
    { mode: "Battle Royale — Cuartetos (4v4)", defaultTarget: 16 },
    { mode: "Battle Royale — Tríos (3v3)", defaultTarget: 20 },
    { mode: "Battle Royale — Dúos (2v2)", defaultTarget: 25 },
    { mode: "Kill Race — Dúos (2v2)", defaultTarget: 25 },
  ],
  "Valorant": [
    { mode: "Competitivo 5v5 — Eliminación Directa", defaultTarget: 16 },
    { mode: "Wingman / Duelo 2v2", defaultTarget: 16 },
    { mode: "Deathmatch 1v1", defaultTarget: 32 },
  ],
  "LOL": [
    { mode: "Grieta del Invocador 5v5", defaultTarget: 16 },
    { mode: "ARAM 5v5", defaultTarget: 16 },
    { mode: "Duelo 1v1 Abismo de los Lamentos", defaultTarget: 32 },
  ],
  "EA FC": [
    { mode: "Torneo 1v1 Clásico", defaultTarget: 32 },
    { mode: "Liga / Campeonato (All vs All)", defaultTarget: 32 },
    { mode: "Modo 2v2 Cooperativo", defaultTarget: 16 },
  ],
  "Rocket League": [
    { mode: "Estándar 3v3", defaultTarget: 16 },
    { mode: "Dobles 2v2", defaultTarget: 16 },
    { mode: "Duelo 1v1", defaultTarget: 32 },
  ],
  "Counter Strike": [
    { mode: "Competitivo 5v5 (MR12)", defaultTarget: 16 },
    { mode: "Wingman 2v2", defaultTarget: 16 },
    { mode: "Duelo 1v1 Aim Map", defaultTarget: 32 },
  ],
};

const GAME_ICONS: Record<string, string> = {
  "FreeFire": "🔥",
  "CODMobile": "📱",
  "FIFA Mobile": "⚽",
  "Warzone": "🪖",
  "Valorant": "🎯",
  "LOL": "⚔️",
  "FIFA": "🎮",
  "Rocket League": "🚀",
  "Counter Strike": "💣",
};

export function RequestsScreen() {
  const {
    tournamentRequests,
    voteTournamentRequest,
    createTournamentRequest,
    deleteTournamentRequest,
    createTournamentByAdmin,
    currentUser,
    currentRole,
    isAuthenticated,
    showAlert,
    showConfirm,
  } = useApp();

  const isAdmin = isAuthenticated && currentRole === "ADMIN";

  const [showModal, setShowModal] = useState(false);
  const [isAdminOfficialPoll, setIsAdminOfficialPoll] = useState(false);
  const [newGame, setNewGame] = useState("FreeFire");
  const [newMode, setNewMode] = useState(GAME_MODES["FreeFire"][0].mode);
  const [newDesc, setNewDesc] = useState("");
  const [newDate, setNewDate] = useState("");
  const [targetPlayers, setTargetPlayers] = useState(GAME_MODES["FreeFire"][0].defaultTarget);

  const handleGameChange = (game: string) => {
    setNewGame(game);
    const modes = GAME_MODES[game];
    if (modes && modes.length > 0) {
      setNewMode(modes[0].mode);
      setTargetPlayers(modes[0].defaultTarget);
    }
  };

  const handleModeChange = (mode: string) => {
    setNewMode(mode);
    const found = GAME_MODES[newGame]?.find((m) => m.mode === mode);
    if (found) {
      setTargetPlayers(found.defaultTarget);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    createTournamentRequest({
      game: newGame,
      gameIcon: GAME_ICONS[newGame] || "🎮",
      mode: newMode,
      description: newDesc,
      suggestedBy: isAdminOfficialPoll ? "TopRival Staff Oficial" : currentUser?.nickname || "Gamer",
      suggestedDate: newDate ? new Date(newDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "30 Sep 2026",
      targetParticipants: Number(targetPlayers),
      isAdminOfficial: isAdminOfficialPoll,
    });

    setShowModal(false);
    setIsAdminOfficialPoll(false);
    setNewDesc("");
    setNewDate("");
  };

  return (
    <div className="min-h-screen bg-[#09090B] pb-20">
      {/* Header */}
      <div className="bg-[#111113] border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#D4860A]/10 text-[#D4860A] border border-[#D4860A]/20">
                  Comunidad & Votaciones
                </span>
                {isAdmin && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
                    Modo Moderador Admin
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-[#FAFAFA]">Solicitudes y Votaciones de Torneos</h1>
              <p className="text-[#71717A] text-sm mt-0.5">
                La comunidad propone y vota. Los torneos con mayor respaldo son creados y patrocinados por el staff oficial de TopRival.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    createTournamentByAdmin({
                      title: "Copa Oficial Apertura TopRival",
                      game: "FreeFire",
                      gameIcon: "🔥",
                      mode: "Duelo de Escuadras (4v4)",
                      maxParticipants: 16,
                      startDate: "25 Sep 2026",
                    });
                    showAlert("Torneo Creado", "¡Torneo oficial creado de inmediato con inscripciones abiertas!", "success");
                  }}
                  className="bg-[#22C55E] hover:bg-[#16A34A] text-black font-bold"
                >
                  ⚡ Crear Torneo Inmediato
                </Button>
              )}

              <Button
                variant={isAdmin ? "outline" : "primary"}
                size="md"
                onClick={() => {
                  setIsAdminOfficialPoll(isAdmin);
                  setShowModal(true);
                }}
                className="shrink-0"
              >
                <Icon.Plus />
                {isAdmin ? "📢 Proponer Votación Oficial" : "Proponer Torneo"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournamentRequests.map((req) => (
            <Card key={req.id} className="p-5 flex flex-col justify-between hover:border-[#3F3F46] transition-all border-[#27272A]">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-xl">
                      {req.gameIcon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-base text-[#FAFAFA]">{req.game}</h3>
                        {req.isAdminOfficial && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-[#EF4444]/20 text-[#EF4444] rounded font-bold">
                            Oficial Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#D4860A] font-medium">{req.mode}</p>
                    </div>
                  </div>
                  <Badge variant={req.status === "APPROVED" ? "success" : "default"}>
                    {req.status === "APPROVED" ? "En Planificación" : "En Votación"}
                  </Badge>
                </div>

                <p className="text-sm text-[#A1A1AA] mb-4 leading-relaxed">
                  {req.description}
                </p>

                <div className="bg-[#18181B] rounded-lg p-3 space-y-1.5 text-xs text-[#71717A] mb-4">
                  <div className="flex justify-between">
                    <span>Propuesto por:</span>
                    <span className="text-[#FAFAFA] font-medium">{req.suggestedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha tentativa:</span>
                    <span className="text-[#FAFAFA] font-medium">{req.suggestedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Meta de cupos:</span>
                    <span className="text-[#22C55E] font-medium">{req.targetParticipants} cupos</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#27272A] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-bold text-[#FAFAFA]">{req.currentVotes}</span>
                    <span className="text-xs text-[#71717A]">votos acumulados</span>
                  </div>
                  <Button
                    size="sm"
                    variant={req.hasVoted ? "primary" : "outline"}
                    onClick={() => voteTournamentRequest(req.id)}
                    className="flex items-center gap-1.5"
                  >
                    <Icon.Check />
                    {req.hasVoted ? "¡Votado!" : "Votar +1"}
                  </Button>
                </div>

                {isAdmin && (
                  <div className="flex gap-2 pt-2 border-t border-[#27272A]/60">
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex-1 text-xs"
                      onClick={() => {
                        createTournamentByAdmin({
                          title: `Torneo Oficial: ${req.game} (${req.mode})`,
                          game: req.game,
                          gameIcon: req.gameIcon,
                          mode: req.mode,
                          maxParticipants: req.targetParticipants || 16,
                          startDate: req.suggestedDate || "25 Sep 2026",
                        });
                        deleteTournamentRequest(req.id);
                        showAlert("Torneo Creado", `¡Torneo oficial creado exitosamente a partir de la votación de ${req.game}!`, "success");
                      }}
                    >
                      ✨ Crear Torneo
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-[#EF4444] hover:bg-[#EF4444]/10"
                      onClick={async () => {
                        const ok = await showConfirm(
                          "Eliminar Votación",
                          `¿Deseas eliminar la tarjeta de votación de "${req.game}"?`,
                          "Eliminar",
                          "Cancelar",
                          "danger"
                        );
                        if (ok) {
                          deleteTournamentRequest(req.id);
                          showAlert("Votación Eliminada", "La propuesta comunitaria ha sido eliminada.", "info");
                        }
                      }}
                    >
                      🗑️ Eliminar
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modal Proponer Torneo */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-[#27272A] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-[#27272A] flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#FAFAFA]">Proponer Nuevo Torneo</h2>
                <p className="text-xs text-[#71717A]">Haz que la comunidad vote tu juego y formato favorito</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#71717A] hover:text-[#FAFAFA] text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Videojuego Oficial
                </label>
                <select
                  value={newGame}
                  onChange={(e) => handleGameChange(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                >
                  {Object.keys(GAME_MODES).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Modalidad / Formato Predefinido
                </label>
                <select
                  value={newMode}
                  onChange={(e) => handleModeChange(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                >
                  {(GAME_MODES[newGame] || []).map((m) => (
                    <option key={m.mode} value={m.mode}>
                      {m.mode}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                    Meta de Participantes
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={128}
                    value={targetPlayers}
                    onChange={(e) => setTargetPlayers(Number(e.target.value))}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                  />
                  <span className="text-[10px] text-[#71717A] mt-0.5 block">Recomendado para esta modalidad</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                    Fecha Sugerida
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Descripción y Justificación de la Propuesta
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explica por qué este formato y fecha serían ideales para la comunidad..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[#D4860A]"
                />
              </div>

              <div className="pt-4 border-t border-[#27272A] flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  Publicar Solicitud
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
