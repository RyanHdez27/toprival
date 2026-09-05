import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button, Badge, Icon, Card } from "../components/ui";
import { TournamentModel, TournamentStatus } from "../types";

const OFFICIAL_GAMES = [
  "FreeFire",
  "CODMobile",
  "FC Mobile",
  "Warzone",
  "Valorant",
  "LOL",
  "EA FC",
  "Rocket League",
  "Counter Strike",
];

const GAME_MODES: Record<string, { mode: string; defaultTarget: number }[]> = {
  FreeFire: [
    { mode: "Battle Royale — Escuadra (4v4)", defaultTarget: 48 },
    { mode: "Battle Royale — Dúos (2v2)", defaultTarget: 48 },
    { mode: "Battle Royale — Solitario (1v1)", defaultTarget: 48 },
    { mode: "Duelo de Escuadras / PVP (4v4)", defaultTarget: 16 },
    { mode: "PVP Dúo (2v2)", defaultTarget: 16 },
    { mode: "PVP Solitario (1v1)", defaultTarget: 32 },
  ],
  CODMobile: [
    { mode: "Multijugador / Solitario (1v1)", defaultTarget: 32 },
    { mode: "Multijugador / Dúo (2v2)", defaultTarget: 16 },
    { mode: "Multijugador / Escuadra (4v4)", defaultTarget: 16 },
    { mode: "Battle Royale — Escuadras (4v4)", defaultTarget: 16 },
    { mode: "Battle Royale — Dúos (2v2)", defaultTarget: 48 },
  ],
  "FC Mobile": [
    { mode: "Cara a Cara (1v1)", defaultTarget: 32 },
    { mode: "Ataque Enfrentado (1v1)", defaultTarget: 32 },
  ],
  Warzone: [
    { mode: "Battle Royale — Cuartetos (4v4)", defaultTarget: 16 },
    { mode: "Battle Royale — Tríos (3v3)", defaultTarget: 20 },
    { mode: "Battle Royale — Dúos (2v2)", defaultTarget: 25 },
    { mode: "Kill Race — Dúos (2v2)", defaultTarget: 25 },
  ],
  Valorant: [
    { mode: "Competitivo 5v5 — Eliminación Directa", defaultTarget: 16 },
    { mode: "Wingman / Duelo 2v2", defaultTarget: 16 },
    { mode: "Deathmatch 1v1", defaultTarget: 32 },
  ],
  LOL: [
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
  FreeFire: "🔥",
  CODMobile: "📱",
  "FC Mobile": "⚽",
  Warzone: "🪖",
  Valorant: "🎯",
  LOL: "⚔️",
  "EA FC": "🎮",
  "Rocket League": "🚀",
  "Counter Strike": "💣",
};

export function AdminScreen() {
  const {
    tournaments,
    selectedTournament,
    setSelectedTournamentId,
    createTournamentByAdmin,
    updateTournamentByAdmin,
    deleteTournamentByAdmin,
    addTestParticipantToTournament,
    removeParticipantFromTournament,
    generateTournamentBracket,
    bracketData,
    advanceBracketMatch,
    resetBracket,
    currentMatch,
    refereeMatches,
    resolveDispute,
    tournamentRequests,
    deleteTournamentRequest,
    createTournamentRequest,
    addSystemLog,
    currentUser,
    showAlert,
    showConfirm,
    showPrompt,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"tournaments" | "brackets" | "matches" | "requests">("tournaments");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState<TournamentModel | null>(null);
  const [convertedRequestId, setConvertedRequestId] = useState<string | null>(null);
  const [participantsModalTourney, setParticipantsModalTourney] = useState<TournamentModel | null>(null);
  const [newParticipantName, setNewParticipantName] = useState("");
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Form states de Torneo
  const [title, setTitle] = useState("");
  const [game, setGame] = useState("FreeFire");
  const [mode, setMode] = useState("Battle Royale — Escuadra (4v4)");
  const [seriesType, setSeriesType] = useState<"Bo1" | "Bo3" | "Bo5">("Bo3");
  const [prizePool, setPrizePool] = useState("$500 USD");
  const [entryFee, setEntryFee] = useState("Gratis");
  const [maxParticipants, setMaxParticipants] = useState(16);
  const [startDate, setStartDate] = useState("15 Sep 2026");
  const [startTime, setStartTime] = useState("19:00 COT");
  const [rulesText, setRulesText] = useState("Tolerancia reglamentaria: 15 minutos. Obligatorio subir captura HD de resultados.");
  const [bannerImage, setBannerImage] = useState("https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=300&fit=crop&auto=format");

  // Estado para gestión de disputas
  const [disputeNotes, setDisputeNotes] = useState("");
  const [bracketSeriesType, setBracketSeriesType] = useState<"Bo1" | "Bo3" | "Bo5">("Bo3");

  const handleGameChange = (selectedGame: string) => {
    setGame(selectedGame);
    const modes = GAME_MODES[selectedGame];
    if (modes && modes.length > 0) {
      setMode(modes[0].mode);
      setMaxParticipants(modes[0].defaultTarget);
    }
  };

  const openCreateModal = () => {
    setEditingTournament(null);
    setConvertedRequestId(null);
    setTitle("");
    setGame("FreeFire");
    setMode(GAME_MODES["FreeFire"][0].mode);
    setSeriesType("Bo3");
    setPrizePool("$500 USD");
    setEntryFee("Gratis");
    setMaxParticipants(16);
    setStartDate("15 Sep 2026");
    setStartTime("19:00 COT");
    setRulesText("Tolerancia reglamentaria: 15 minutos. Obligatorio subir captura HD de resultados.");
    setShowCreateModal(true);
  };

  const openEditModal = (t: TournamentModel) => {
    setEditingTournament(t);
    setConvertedRequestId(null);
    setTitle(t.title);
    setGame(t.game);
    setMode(t.mode);
    setSeriesType((t.rules?.seriesType as any) || "Bo3");
    setPrizePool(t.prizePool);
    setEntryFee(t.entryFee);
    setMaxParticipants(t.maxParticipants);
    setStartDate(t.startDate);
    setStartTime(t.startTime);
    setRulesText(t.rules?.rulesText || "");
    setBannerImage(t.bannerImage || "");
    setShowCreateModal(true);
  };

  const handleConvertRequest = (req: any) => {
    setEditingTournament(null);
    setConvertedRequestId(req.id);
    setTitle(`Copa Oficial ${req.game}: ${req.mode}`);
    setGame(req.game);
    setMode(req.mode);
    setSeriesType("Bo3");
    setPrizePool("$300 USD");
    setEntryFee("Gratis");
    setMaxParticipants(req.targetParticipants || 16);
    setStartDate(req.suggestedDate || "20 Sep 2026");
    setStartTime("19:00 COT");
    setRulesText(`Torneo originado por iniciativa comunitaria de ${req.suggestedBy}.`);
    setShowCreateModal(true);
  };

  const handleSaveTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const gameIcon = GAME_ICONS[game] || "🎮";

    if (editingTournament) {
      updateTournamentByAdmin(editingTournament.id, {
        title,
        ...(editingTournament.status !== "live" ? { game, gameIcon, mode, maxParticipants } : {}),
        prizePool,
        entryFee,
        startDate,
        startTime,
        bannerImage,
        rules: {
          matchCheckInMinutes: 15,
          evidenceRequired: true,
          format: "SINGLE_ELIMINATION",
          seriesType,
          rulesText,
          schedule: {
            registrationStart: "Hoy",
            registrationEnd: startDate,
            tournamentStart: startDate,
          },
        },
      });
      addSystemLog({
        type: "TOURNAMENT",
        action: "Torneo Modificado",
        user: currentUser.nickname,
        details: `Torneo editado: ${title} (${editingTournament.id})`,
        status: "INFO",
      });
    } else {
      createTournamentByAdmin({
        title,
        game,
        gameIcon,
        mode,
        prizePool,
        entryFee,
        maxParticipants,
        startDate,
        startTime,
        bannerImage,
        rules: {
          matchCheckInMinutes: 15,
          evidenceRequired: true,
          format: "SINGLE_ELIMINATION",
          seriesType,
          rulesText,
          schedule: {
            registrationStart: "Hoy",
            registrationEnd: startDate,
            tournamentStart: startDate,
          },
        },
      });

      if (convertedRequestId) {
        deleteTournamentRequest(convertedRequestId);
      }

      addSystemLog({
        type: "TOURNAMENT",
        action: "Torneo Oficial Creado",
        user: currentUser.nickname,
        details: `Nuevo torneo creado: ${title} (${game} - ${mode})`,
        status: "SUCCESS",
      });
    }

    setShowCreateModal(false);
    setEditingTournament(null);
    setConvertedRequestId(null);
  };

  const filteredTournaments = tournaments.filter((t) => {
    if (statusFilter === "ALL") return true;
    return t.status === statusFilter;
  });

  const getStatusBadge = (status: TournamentStatus) => {
    switch (status) {
      case "live":
        return <Badge variant="live"><span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse inline-block" /> En Vivo</Badge>;
      case "registration-open":
        return <Badge variant="success">Inscripciones Abiertas</Badge>;
      case "registration-closed":
        return <Badge variant="warning">Inscripciones Cerradas</Badge>;
      case "paused":
        return <Badge variant="warning">⏸️ Pausado</Badge>;
      case "finished":
        return <Badge variant="default">🏁 Finalizado</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] pb-20">
      {/* Header */}
      <div className="bg-[#111113] border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 flex items-center gap-1.5">
                  <Icon.Shield /> Panel de Super-Administración
                </span>
                <span className="text-xs text-[#71717A]">• Control Maestro de TopRival</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#FAFAFA] tracking-tight">
                Gestión y Operación de Torneos
              </h1>
              <p className="text-[#71717A] text-sm mt-1">
                Ciclo de vida de torneos, control de llaves (brackets), resolución de actas arbitrales y aprobación comunitaria.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={openCreateModal}
                className="shadow-lg shadow-[#D4860A]/20"
              >
                <Icon.Plus />
                Crear Torneo Oficial
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#27272A]/60">
            <div className="bg-[#18181B]/70 p-3 rounded-xl border border-[#27272A]">
              <span className="text-xs text-[#71717A] block">Total Torneos</span>
              <span className="text-xl font-bold text-[#FAFAFA]">{tournaments.length}</span>
            </div>
            <div className="bg-[#18181B]/70 p-3 rounded-xl border border-[#27272A]">
              <span className="text-xs text-[#71717A] block">En Vivo / Jugando</span>
              <span className="text-xl font-bold text-[#EF4444] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
                {tournaments.filter((t) => t.status === "live").length}
              </span>
            </div>
            <div className="bg-[#18181B]/70 p-3 rounded-xl border border-[#27272A]">
              <span className="text-xs text-[#71717A] block">Inscripciones Abiertas</span>
              <span className="text-xl font-bold text-[#22C55E]">
                {tournaments.filter((t) => t.status === "registration-open").length}
              </span>
            </div>
            <div className="bg-[#18181B]/70 p-3 rounded-xl border border-[#27272A]">
              <span className="text-xs text-[#71717A] block">Disputas Pendientes</span>
              <span className="text-xl font-bold text-[#EAB308]">
                {refereeMatches.filter((m) => m.status === "WAITING_CONFIRMATION" || m.status === "DISPUTED").length > 0
                  ? `${refereeMatches.filter((m) => m.status === "WAITING_CONFIRMATION" || m.status === "DISPUTED").length} Requiere Acción`
                  : "0"}
              </span>
            </div>
          </div>

          {/* Subtabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto pb-1">
            {[
              { id: "tournaments", label: `🏆 Torneos (${tournaments.length})` },
              { id: "brackets", label: `⚔️ Control de Brackets & Llaves` },
              { id: "matches", label: `⚖️ Moderación & Disputas (${refereeMatches.filter((m) => m.status === "WAITING_CONFIRMATION" || m.status === "DISPUTED").length})` },
              { id: "requests", label: `💡 Solicitudes de Comunidad (${tournamentRequests.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-[#D4860A] text-white shadow-md shadow-[#D4860A]/30"
                    : "bg-[#18181B] text-[#A1A1AA] hover:bg-[#27272A] hover:text-[#FAFAFA]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* TAB 1: TORNEOS */}
        {activeTab === "tournaments" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#FAFAFA]">Catálogo de Torneos Oficiales</h2>
                <p className="text-xs text-[#71717A]">Gestiona estados, reglas, brackets e inscritos de cada torneo.</p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-[#18181B] p-1 rounded-lg border border-[#27272A]">
                {[
                  { id: "ALL", label: "Todos" },
                  { id: "live", label: "En Vivo" },
                  { id: "registration-open", label: "Inscripciones" },
                  { id: "paused", label: "Pausados" },
                  { id: "finished", label: "Finalizados" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                      statusFilter === f.id
                        ? "bg-[#27272A] text-[#FAFAFA] font-bold"
                        : "text-[#71717A] hover:text-[#A1A1AA]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTournaments.map((t) => (
                <Card key={t.id} className="p-5 flex flex-col justify-between border-[#27272A] hover:border-[#3F3F46] transition-all">
                  <div>
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{t.gameIcon}</span>
                        <div>
                          <span className="text-xs font-mono font-bold text-[#D4860A] block">{t.game}</span>
                          <span className="text-[10px] text-[#71717A] uppercase tracking-wider">{t.rules?.seriesType || "Bo3"} • {t.format}</span>
                        </div>
                      </div>
                      {getStatusBadge(t.status)}
                    </div>

                    <h3 className="font-bold text-base text-[#FAFAFA] mb-1 line-clamp-1">{t.title}</h3>
                    <p className="text-xs text-[#A1A1AA] mb-4">{t.mode} • Premio: <strong className="text-[#22C55E]">{t.prizePool}</strong></p>

                    {/* Quick Info Box */}
                    <div className="bg-[#18181B] p-3 rounded-xl border border-[#27272A] space-y-1.5 text-xs text-[#A1A1AA] mb-4">
                      <div className="flex justify-between items-center">
                        <span>Participantes:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-[#FAFAFA]">{t.currentParticipants || 0} / {t.maxParticipants}</strong>
                          <span className="text-[10px] text-[#71717A]">({t.registeredTeamsOrPlayers?.length || 0} confirmados)</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span>Inicio programado:</span>
                        <strong className="text-[#FAFAFA]">{t.startDate} ({t.startTime})</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Entrada:</span>
                        <span className="text-[#F5B830] font-semibold">{t.entryFee}</span>
                      </div>
                    </div>

                    {/* Ciclo de Vida: Botones Rápidos de Estado */}
                    <div className="mb-4">
                      <span className="text-[10px] uppercase font-bold text-[#71717A] tracking-wider block mb-1.5">
                        Cambiar Estado del Torneo:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => updateTournamentByAdmin(t.id, { status: "registration-open" })}
                          className={`px-2 py-1 text-[11px] rounded font-semibold transition-colors cursor-pointer ${
                            t.status === "registration-open" ? "bg-[#22C55E] text-black" : "bg-[#18181B] text-[#A1A1AA] hover:bg-[#27272A]"
                          }`}
                        >
                          🟢 Abrir
                        </button>
                        <button
                          onClick={() => updateTournamentByAdmin(t.id, { status: "registration-closed" })}
                          className={`px-2 py-1 text-[11px] rounded font-semibold transition-colors cursor-pointer ${
                            t.status === "registration-closed" ? "bg-[#EAB308] text-black" : "bg-[#18181B] text-[#A1A1AA] hover:bg-[#27272A]"
                          }`}
                        >
                          🟡 Cerrar
                        </button>
                        <button
                          onClick={() => updateTournamentByAdmin(t.id, { status: "live" })}
                          className={`px-2 py-1 text-[11px] rounded font-semibold transition-colors cursor-pointer ${
                            t.status === "live" ? "bg-[#EF4444] text-white animate-pulse" : "bg-[#18181B] text-[#A1A1AA] hover:bg-[#27272A]"
                          }`}
                        >
                          🔴 En Vivo
                        </button>
                        <button
                          onClick={() => updateTournamentByAdmin(t.id, { status: "paused" })}
                          className={`px-2 py-1 text-[11px] rounded font-semibold transition-colors cursor-pointer ${
                            t.status === "paused" ? "bg-[#F97316] text-white" : "bg-[#18181B] text-[#A1A1AA] hover:bg-[#27272A]"
                          }`}
                        >
                          ⏸️ Pausar
                        </button>
                        <button
                          onClick={() => updateTournamentByAdmin(t.id, { status: "finished" })}
                          className={`px-2 py-1 text-[11px] rounded font-semibold transition-colors cursor-pointer ${
                            t.status === "finished" ? "bg-[#3F3F46] text-white" : "bg-[#18181B] text-[#A1A1AA] hover:bg-[#27272A]"
                          }`}
                        >
                          🏁 Finalizar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-[#27272A] space-y-2">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => {
                          setSelectedTournamentId(t.id);
                          setActiveTab("brackets");
                        }}
                      >
                        ⚔️ Brackets
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setParticipantsModalTourney(t)}
                      >
                        👥 Inscritos ({t.registeredTeamsOrPlayers?.length || 0})
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => openEditModal(t)}
                      >
                        {t.status === "live" ? "🔒 Editar (Restringido)" : "✏️ Editar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-[#EF4444] hover:bg-[#EF4444]/10 hover:border-[#EF4444]"
                        onClick={async () => {
                          const ok = await showConfirm(
                            "Eliminar Torneo",
                            `¿Estás seguro de que deseas eliminar permanentemente el torneo "${t.title}"?`,
                            "Eliminar Torneo",
                            "Cancelar",
                            "danger"
                          );
                          if (ok) {
                            deleteTournamentByAdmin(t.id);
                            showAlert("Torneo Eliminado", `El torneo "${t.title}" ha sido eliminado del sistema.`, "success");
                          }
                        }}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CONTROL DE BRACKETS & LLAVES */}
        {activeTab === "brackets" && (
          <div className="space-y-6">
            <div className="bg-[#111113] p-5 rounded-2xl border border-[#27272A] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#D4860A] uppercase tracking-wider">Módulo de Brackets en Vivo</span>
                </div>
                <h2 className="text-xl font-bold text-[#FAFAFA]">
                  Generador y Control de Llaves — {selectedTournament.title}
                </h2>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Sembrado de participantes, avance manual de cruces y control de rondas (Bo1 / Bo3 / Bo5).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Selector de Torneo */}
                <select
                  value={selectedTournament.id}
                  onChange={(e) => setSelectedTournamentId(e.target.value)}
                  className="bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-xs font-semibold text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                >
                  {tournaments.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.gameIcon} {t.title} ({t.status})
                    </option>
                  ))}
                </select>

                {/* Selector de Formato Bo */}
                <select
                  value={bracketSeriesType}
                  onChange={(e) => setBracketSeriesType(e.target.value as any)}
                  className="bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-xs font-semibold text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                >
                  <option value="Bo1">Serie Bo1 (Al mejor de 1)</option>
                  <option value="Bo3">Serie Bo3 (Al mejor de 3)</option>
                  <option value="Bo5">Serie Bo5 (Al mejor de 5)</option>
                </select>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    generateTournamentBracket(selectedTournament.id, bracketSeriesType);
                    showAlert("Bracket Generado", `¡Bracket generado exitosamente para "${selectedTournament.title}" en formato ${bracketSeriesType}!`, "success");
                  }}
                >
                  ⚡ Generar Brackets (8 Slots)
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const ok = await showConfirm(
                      "Reiniciar Llaves",
                      "¿Deseas reiniciar las llaves y brackets al estado original?",
                      "Reiniciar",
                      "Cancelar",
                      "warning"
                    );
                    if (ok) {
                      resetBracket();
                      showAlert("Brackets Reiniciados", "Las llaves del torneo han sido restablecidas.", "info");
                    }
                  }}
                >
                  🔄 Resetear
                </Button>
              </div>
            </div>

            {/* Interactive Bracket Panel */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#27272A]">
                <div>
                  <h3 className="font-bold text-sm text-[#FAFAFA] flex items-center gap-2">
                    <span>Árbol de Competencia Oficial</span>
                    <Badge variant={selectedTournament.status === "live" ? "live" : "default"}>
                      {selectedTournament.status === "live" ? "Torneo En Curso" : selectedTournament.status}
                    </Badge>
                  </h3>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    👉 <strong>Haz clic en cualquier equipo</strong> para adjudicarle la victoria inmediata y avanzar a la siguiente ronda.
                  </p>
                </div>
              </div>

              {/* Visualización de Brackets con avance interactivo */}
              <div className="overflow-x-auto pb-6">
                <div className="flex gap-8 min-w-max items-start pt-2">
                  {bracketData.map((round, ri) => {
                    const gapClass = ri === 0 ? "gap-4" : ri === 1 ? "gap-24" : "gap-56";
                    return (
                      <div key={round.label} className="flex flex-col items-center">
                        <div className="mb-6 px-4 py-1.5 rounded-full bg-[#18181B] border border-[#27272A]">
                          <span className="text-xs font-bold text-[#D4860A] uppercase tracking-wider">
                            {round.label}
                          </span>
                        </div>

                        <div className={`flex flex-col ${gapClass}`}>
                          {round.matches.map((match, mi) => (
                            <div
                              key={match.id}
                              className="flex items-center"
                              style={{
                                marginTop: ri === 1 ? "56px" : ri === 2 ? "132px" : "0",
                              }}
                            >
                              <div className="bg-[#111113] border border-[#27272A] rounded-xl p-3 w-56 shadow-lg space-y-2">
                                <div className="flex justify-between items-center text-[10px] text-[#71717A] font-mono">
                                  <span>Match #{mi + 1}</span>
                                  <Badge variant={match.status === "completed" ? "success" : match.status === "live" ? "live" : "default"}>
                                    {match.status}
                                  </Badge>
                                </div>

                                {/* Slot P1 */}
                                <div
                                  onClick={() => {
                                    if (match.p1 && match.p1.name !== "TBD" && match.p2 && match.p2.name !== "TBD") {
                                      advanceBracketMatch(ri, mi, match.p1.name, 2, 0);
                                    }
                                  }}
                                  className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                                    match.p1?.winner
                                      ? "bg-[#22C55E]/15 border-[#22C55E]/50 text-[#22C55E]"
                                      : "bg-[#18181B] border-[#27272A] hover:border-[#D4860A] text-[#FAFAFA]"
                                  }`}
                                >
                                  <span className="text-xs font-bold truncate">
                                    {match.p1?.name || "TBD"}
                                  </span>
                                  <span className="text-xs font-mono font-bold">
                                    {match.p1?.score ?? (match.p1?.winner ? "2" : "-")}
                                  </span>
                                </div>

                                <div className="text-center text-[9px] font-mono text-[#52525B]">VS</div>

                                {/* Slot P2 */}
                                <div
                                  onClick={() => {
                                    if (match.p1 && match.p1.name !== "TBD" && match.p2 && match.p2.name !== "TBD") {
                                      advanceBracketMatch(ri, mi, match.p2.name, 2, 0);
                                    }
                                  }}
                                  className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                                    match.p2?.winner
                                      ? "bg-[#22C55E]/15 border-[#22C55E]/50 text-[#22C55E]"
                                      : "bg-[#18181B] border-[#27272A] hover:border-[#D4860A] text-[#FAFAFA]"
                                  }`}
                                >
                                  <span className="text-xs font-bold truncate">
                                    {match.p2?.name || "TBD"}
                                  </span>
                                  <span className="text-xs font-mono font-bold">
                                    {match.p2?.score ?? (match.p2?.winner ? "2" : "-")}
                                  </span>
                                </div>
                              </div>

                              {ri < bracketData.length - 1 && (
                                <div className="w-8 h-px bg-[#3F3F46]" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: MODERACIÓN, REPORTES Y DISPUTAS */}
        {activeTab === "matches" && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#FAFAFA]">Consola de Moderación y Resolución de Disputas</h2>
                <p className="text-xs text-[#71717A]">Supervisa reportes con discrepancia, revisa evidencias HD y adjudica victorias o W.O.</p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  showAlert("Regla de Tolerancia (15 min)", "Se validó la presencia de capitanes en sala. No se detectaron ausencias irregulares.", "info");
                }}
              >
                ⏱️ Evaluar W.O. Global (15 min)
              </Button>
            </div>

            {refereeMatches.filter(m => m.status === "WAITING_CONFIRMATION" || m.status === "DISPUTED").length === 0 ? (
              <Card className="p-12 text-center text-xs text-[#71717A] border-[#27272A] bg-[#111113]">
                <div className="text-3xl mb-2">⚖️</div>
                <p className="font-bold text-[#FAFAFA] text-sm mb-1">Sin disputas ni partidas pendientes de moderación</p>
                <p className="max-w-md mx-auto">
                  Todos los resultados y reportes de marcadores se encuentran certificados al día. Cuando surja una discrepancia o reporte en espera de revisión arbitral, se listará automáticamente aquí.
                </p>
              </Card>
            ) : (
              refereeMatches.filter(m => m.status === "WAITING_CONFIRMATION" || m.status === "DISPUTED").map((activeDisputedMatch) => (
                <Card key={activeDisputedMatch.id} className="p-6 border-[#D4860A]/40 bg-[#111113] mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308] animate-pulse" />
                      <span className="font-bold text-sm text-[#FAFAFA]">
                        {activeDisputedMatch.roundName} — {activeDisputedMatch.game}
                      </span>
                    </div>
                    <Badge variant={activeDisputedMatch.status === "WAITING_CONFIRMATION" ? "warning" : "default"}>
                      {activeDisputedMatch.status === "WAITING_CONFIRMATION" ? "Esperando Aprobación de Árbitro" : activeDisputedMatch.status}
                    </Badge>
                  </div>

                  {/* Match Versus Box */}
                  <div className="bg-[#18181B] p-5 rounded-2xl border border-[#27272A] mb-5">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">Equipo / Jugador A</span>
                        <div className="font-bold text-base text-[#FAFAFA]">{activeDisputedMatch.participantA.name}</div>
                      </div>

                      <div className="px-4 py-2 rounded-xl bg-[#09090B] border border-[#27272A] text-center">
                        <span className="text-xs text-[#71717A] font-mono block">Marcador</span>
                        <div className="text-xl font-mono font-extrabold text-[#D4860A]">
                          {activeDisputedMatch.score ? `${activeDisputedMatch.score.scoreA} - ${activeDisputedMatch.score.scoreB}` : "VS"}
                        </div>
                      </div>

                      <div className="text-right flex-1">
                        <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">Equipo / Jugador B</span>
                        <div className="font-bold text-base text-[#FAFAFA]">{activeDisputedMatch.participantB.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* Detalle del Reporte y Evidencia */}
                  {activeDisputedMatch.score && (
                    <div className="space-y-4 mb-6 text-xs text-[#A1A1AA] bg-[#18181B]/60 p-4 rounded-xl border border-[#27272A]">
                      <div className="flex justify-between items-center pb-2 border-b border-[#27272A]">
                        <span>Reporte ingresado por:</span>
                        <strong className="text-[#FAFAFA]">
                          {activeDisputedMatch.score.reportedBy} ({activeDisputedMatch.score.reportedAt})
                        </strong>
                      </div>

                      {activeDisputedMatch.score.evidenceUrls && activeDisputedMatch.score.evidenceUrls.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-[#FAFAFA] flex items-center gap-1.5">
                              📸 Evidencia Fotográfica Oficial Adjunta:
                            </span>
                            <span
                              className="text-xs text-[#D4860A] hover:underline cursor-pointer font-semibold"
                              onClick={() => setZoomedImage(activeDisputedMatch.score!.evidenceUrls![0])}
                            >
                              🔍 Clic para pantalla completa HD
                            </span>
                          </div>

                          <div
                            onClick={() => setZoomedImage(activeDisputedMatch.score!.evidenceUrls![0])}
                            className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#27272A] hover:border-[#D4860A] transition-all"
                          >
                            <img
                              src={activeDisputedMatch.score.evidenceUrls[0]}
                              alt="Evidencia"
                              className="max-h-56 w-full object-contain bg-black/80 group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition-opacity">
                              <span>🔍 Inspeccionar captura en alta resolución</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input de Notas y Acciones de Resolución */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                        Notas Oficiales del Dictamen Arbitral (Opcional):
                      </label>
                      <input
                        type="text"
                        value={disputeNotes}
                        onChange={(e) => setDisputeNotes(e.target.value)}
                        placeholder="Ej: Captura validada correctamente, no se detectaron anomalías reglamentarias."
                        className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => {
                          resolveDispute(activeDisputedMatch.participantA.id, disputeNotes);
                          showAlert("Victoria Asignada", `¡Victoria adjudicada a ${activeDisputedMatch.participantA.name}! El bracket se actualizó.`, "success");
                        }}
                        className="flex-1 justify-center"
                      >
                        🏆 Victoria {activeDisputedMatch.participantA.name}
                      </Button>

                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => {
                          resolveDispute(activeDisputedMatch.participantB.id, disputeNotes);
                          showAlert("Victoria Asignada", `¡Victoria adjudicada a ${activeDisputedMatch.participantB.name}! El bracket se actualizó.`, "success");
                        }}
                        className="flex-1 justify-center hover:border-[#22C55E] hover:text-[#22C55E]"
                      >
                        🏆 Victoria {activeDisputedMatch.participantB.name}
                      </Button>
                    </div>

                    <div className="pt-2 border-t border-[#27272A] flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10"
                        onClick={async () => {
                          const loser = await showPrompt(
                            "Adjudicar W.O. Oficial",
                            "Ingresa el nombre del equipo que no se presentó (Regla de 15 minutos):",
                            activeDisputedMatch.participantB.name
                          );
                          if (loser) {
                            const winnerId = loser === activeDisputedMatch.participantA.name ? activeDisputedMatch.participantB.id : activeDisputedMatch.participantA.id;
                            const winnerName = winnerId === activeDisputedMatch.participantA.id ? activeDisputedMatch.participantA.name : activeDisputedMatch.participantB.name;
                            resolveDispute(winnerId, `Aplicación de W.O. reglamentario por inasistencia de ${loser}.`);
                            showAlert("W.O. Aplicado", `Victoria adjudicada por inasistencia a ${winnerName}.`, "success");
                          }
                        }}
                      >
                        ⚖️ Adjudicar W.O. por No Presentación (15 min)
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* TAB 4: SOLICITUDES DE COMUNIDAD */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#FAFAFA]">Solicitudes y Votaciones de la Comunidad</h2>
                <p className="text-xs text-[#71717A]">
                  Convierte las propuestas más votadas por los jugadores en torneos oficiales con 1 clic.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const gameSelected = await showPrompt(
                    "Lanzar Encuesta Oficial",
                    "¿Para qué videojuego deseas abrir la encuesta comunitaria oficial?",
                    "Counter Strike 2"
                  );
                  if (gameSelected) {
                    createTournamentRequest({
                      game: gameSelected,
                      gameIcon: GAME_ICONS[gameSelected] || "🎮",
                      mode: "Competitivo 5v5 Oficial Staff",
                      description: `Encuesta oficial de TopRival para evaluar apertura de liga en ${gameSelected}.`,
                      suggestedBy: "TopRival Staff",
                      suggestedDate: "30 Sep 2026",
                      targetParticipants: 32,
                      isAdminOfficial: true,
                    });
                    showAlert("Encuesta Publicada", `¡Encuesta oficial para "${gameSelected}" publicada con éxito!`, "success");
                  }
                }}
              >
                📢 + Lanzar Encuesta Oficial
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tournamentRequests.map((req) => {
                const percent = Math.min(100, Math.round((req.currentVotes / (req.targetParticipants || 16)) * 100));
                return (
                  <Card key={req.id} className="p-5 flex flex-col justify-between border-[#27272A] hover:border-[#3F3F46]">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{req.gameIcon}</span>
                          <span className="font-bold text-sm text-[#FAFAFA]">{req.game}</span>
                          {req.isAdminOfficial && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-[#EF4444]/20 text-[#EF4444] rounded font-bold">
                              Oficial Staff
                            </span>
                          )}
                        </div>
                        <Badge variant="warning">{req.currentVotes} Votos</Badge>
                      </div>

                      <h4 className="font-bold text-sm text-[#D4860A] mb-1">{req.mode}</h4>
                      <p className="text-xs text-[#71717A] mb-3">{req.description || "Propuesta organizada por la comunidad de TopRival."}</p>

                      <div className="bg-[#18181B] p-3 rounded-xl border border-[#27272A] mb-4 space-y-2">
                        <div className="flex justify-between text-xs text-[#A1A1AA]">
                          <span>Propuesto por: <strong className="text-[#FAFAFA]">{req.suggestedBy}</strong></span>
                          <span>Fecha sugerida: <strong className="text-[#FAFAFA]">{req.suggestedDate}</strong></span>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-[#71717A] mb-1">
                            <span>Progreso de votación:</span>
                            <span className="font-bold text-[#FAFAFA]">{percent}% (Meta: {req.targetParticipants} jugadores)</span>
                          </div>
                          <div className="w-full bg-[#27272A] h-2 rounded-full overflow-hidden">
                            <div className="bg-[#D4860A] h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-[#27272A]">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => handleConvertRequest(req)}
                      >
                        ✨ Convertir a Torneo Oficial
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-[#EF4444] hover:bg-[#EF4444]/10"
                        onClick={async () => {
                          const ok = await showConfirm(
                            "Descartar Propuesta",
                            `¿Deseas descartar y eliminar la propuesta comunitaria para "${req.game}"?`,
                            "Descartar",
                            "Cancelar",
                            "danger"
                          );
                          if (ok) {
                            deleteTournamentRequest(req.id);
                            showAlert("Propuesta Descartada", "La solicitud comunitaria ha sido retirada.", "info");
                          }
                        }}
                      >
                        Rechazar
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR TORNEO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-[#27272A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-[#27272A] flex justify-between items-center sticky top-0 bg-[#111113]/95 backdrop-blur z-10">
              <div>
                <h2 className="text-lg font-bold text-[#FAFAFA]">
                  {editingTournament ? "Editar Torneo Oficial" : convertedRequestId ? "Convertir Solicitud a Torneo Oficial" : "Crear Nuevo Torneo Oficial"}
                </h2>
                <p className="text-xs text-[#71717A]">
                  {editingTournament?.status === "live"
                    ? "⚠️ Torneo en vivo: Para proteger la llave activa, el juego y modalidad están bloqueados."
                    : "Configuración técnica, reglas y cupos de la plataforma"}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTournament(null);
                  setConvertedRequestId(null);
                }}
                className="w-8 h-8 rounded-full bg-[#18181B] hover:bg-[#27272A] text-[#71717A] hover:text-[#FAFAFA] text-lg font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTournament} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Título Oficial del Torneo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: FreeFire Masters LATAM - Playoffs Apertura"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[#D4860A]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                    Videojuego Oficial (9 Juegos) {editingTournament?.status === "live" && "(Bloqueado en vivo)"}
                  </label>
                  <select
                    disabled={editingTournament?.status === "live"}
                    value={game}
                    onChange={(e) => handleGameChange(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A] disabled:opacity-50"
                  >
                    {OFFICIAL_GAMES.map((g) => (
                      <option key={g} value={g}>
                        {GAME_ICONS[g] || "🎮"} {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                    Modalidad Predefinida {editingTournament?.status === "live" && "(Bloqueada en vivo)"}
                  </label>
                  <select
                    disabled={editingTournament?.status === "live"}
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A] disabled:opacity-50"
                  >
                    {GAME_MODES[game]?.map((m) => (
                      <option key={m.mode} value={m.mode}>
                        {m.mode}
                      </option>
                    )) || <option value={mode}>{mode}</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                    Formato de Serie
                  </label>
                  <select
                    value={seriesType}
                    onChange={(e) => setSeriesType(e.target.value as any)}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                  >
                    <option value="Bo1">Bo1 (Mejor de 1)</option>
                    <option value="Bo3">Bo3 (Mejor de 3)</option>
                    <option value="Bo5">Bo5 (Mejor de 5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                    Bolsa de Premios
                  </label>
                  <input
                    type="text"
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    placeholder="Ej: $500 USD"
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                    Costo Inscripción
                  </label>
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={entryFee}
                      onChange={(e) => setEntryFee(e.target.value)}
                      placeholder="Ej: $25.000 COP o Gratis"
                      className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                    />
                    <div className="flex gap-1 flex-wrap">
                      {["Gratis", "$15.000", "$25.000", "$50.000", "$100.000"].map((fee) => (
                        <button
                          key={fee}
                          type="button"
                          onClick={() => setEntryFee(fee)}
                          className={`text-[9px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                            entryFee === fee
                              ? "bg-[#D4860A] text-white font-bold"
                              : "bg-[#27272A] text-[#A1A1AA] hover:text-white"
                          }`}
                        >
                          {fee}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                    Cupos Máximos
                  </label>
                  <input
                    disabled={editingTournament?.status === "live"}
                    type="number"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A] disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                    Fecha de Inicio
                  </label>
                  <input
                    type="text"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Ej: 28 Sep 2026"
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                    Hora de Inicio (COT)
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="Ej: 19:00 COT"
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Reglamento Específico del Torneo
                </label>
                <textarea
                  rows={3}
                  value={rulesText}
                  onChange={(e) => setRulesText(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                />
              </div>

              <div className="pt-4 border-t border-[#27272A] flex justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTournament(null);
                    setConvertedRequestId(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button variant="primary" type="submit">
                  {editingTournament ? "Guardar Modificaciones" : "Publicar Torneo Oficial"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GESTIÓN DE INSCRITOS */}
      {participantsModalTourney && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-[#27272A] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-[#27272A] flex justify-between items-center bg-[#18181B]">
              <div>
                <h3 className="font-bold text-sm text-[#FAFAFA]">
                  Inscritos: {participantsModalTourney.title}
                </h3>
                <span className="text-xs text-[#71717A]">
                  {participantsModalTourney.registeredTeamsOrPlayers?.length || 0} de {participantsModalTourney.maxParticipants} confirmados
                </span>
              </div>
              <button
                onClick={() => setParticipantsModalTourney(null)}
                className="text-[#71717A] hover:text-[#FAFAFA] font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Form para agregar participante de prueba */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre de escuadra o jugador..."
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                  className="flex-1 bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (newParticipantName.trim()) {
                      addTestParticipantToTournament(participantsModalTourney.id, newParticipantName);
                      setNewParticipantName("");
                      const updatedTourney = tournaments.find((t) => t.id === participantsModalTourney.id);
                      if (updatedTourney) setParticipantsModalTourney(updatedTourney);
                    }
                  }}
                >
                  + Inscribir
                </Button>
              </div>

              {/* Lista de Participantes */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {(participantsModalTourney.registeredTeamsOrPlayers || []).length === 0 ? (
                  <div className="text-center py-6 text-xs text-[#71717A]">
                    No hay participantes registrados todavía en este torneo.
                  </div>
                ) : (
                  (participantsModalTourney.registeredTeamsOrPlayers || []).map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="flex items-center justify-between bg-[#18181B] p-2.5 rounded-lg border border-[#27272A] text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#71717A] font-bold">#{idx + 1}</span>
                        <span className="font-semibold text-[#FAFAFA]">{p.name}</span>
                        <Badge variant="success">CONFIRMADO</Badge>
                      </div>
                      <button
                        onClick={() => {
                          removeParticipantFromTournament(participantsModalTourney.id, p.id);
                          const updated = tournaments.find((t) => t.id === participantsModalTourney.id);
                          if (updated) setParticipantsModalTourney(updated);
                        }}
                        className="text-xs text-[#EF4444] hover:underline cursor-pointer"
                      >
                        Expulsar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 bg-[#18181B] border-t border-[#27272A] flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setParticipantsModalTourney(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ZOOM DE EVIDENCIA ARBITRAL HD */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center animate-in fade-in zoom-in-95">
            <div className="w-full flex justify-between items-center text-white pb-3 border-b border-[#27272A] mb-3">
              <div className="flex items-center gap-2">
                <Icon.Shield />
                <span className="font-bold text-sm">Inspección de Evidencia Arbitral (Zoom HD)</span>
              </div>
              <button
                onClick={() => setZoomedImage(null)}
                className="w-8 h-8 rounded-full bg-[#27272A] hover:bg-[#3F3F46] flex items-center justify-center text-white font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="w-full overflow-auto rounded-xl border border-[#27272A] bg-black/90 flex items-center justify-center p-2">
              <img
                src={zoomedImage}
                alt="Evidencia Ampliada"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
            <div className="pt-3 flex gap-3">
              <Button size="sm" variant="outline" onClick={() => window.open(zoomedImage, "_blank")}>
                Abrir en nueva pestaña
              </Button>
              <Button size="sm" variant="primary" onClick={() => setZoomedImage(null)}>
                Cerrar vista previa
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminScreen;
