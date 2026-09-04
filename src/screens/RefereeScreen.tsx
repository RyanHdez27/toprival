import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button, Badge, Card, Icon } from "../components/ui";
import { MatchModel } from "../types";

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
  | "settings"
  | "referee";

export function RefereeScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const {
    currentUser,
    referees,
    refereeMatches,
    claimMatch,
    unclaimMatch,
    resolveMatchAsReferee,
    applyWalkOverAsReferee,
    bracketData,
    advanceBracketMatch,
    selectedTournament,
    systemLogs,
    showAlert,
    showPrompt,
  } = useApp();

  const [leftViewMode, setLeftViewMode] = useState<"MATCHES" | "LOGS">("MATCHES");
  const [filterTab, setFilterTab] = useState<"ALL" | "PENDING" | "MY_CLAIMS" | "COMPLETED">("ALL");
  const [selectedMatch, setSelectedMatch] = useState<MatchModel | null>(refereeMatches[0] || null);
  const [disputeNotes, setDisputeNotes] = useState("");
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"matches" | "brackets">("matches");

  // Buscar información de perfil arbitral
  const refereeProfile = referees.find(
    (r) => r.id === currentUser.id || r.nickname === currentUser.nickname || r.email === currentUser.email
  ) || {
    nickname: currentUser.nickname || "Ref_Oficial",
    email: currentUser.email || "ref@toprival.gg",
    assignedGame: "Multijuego Oficial",
    matchesArbitrated: 0,
    status: "ACTIVE",
    permissions: {
      canResolveDisputes: true,
      canEditBrackets: true,
      canManageRooms: true,
    },
  };

  const matchLogs = systemLogs.filter((l) => l.type === "MATCH");

  const filteredMatches = refereeMatches.filter((m) => {
    if (filterTab === "PENDING") return m.status === "WAITING_CONFIRMATION" || m.status === "DISPUTED";
    if (filterTab === "MY_CLAIMS") return m.claimedByRefereeId === currentUser.id;
    if (filterTab === "COMPLETED") return m.status === "COMPLETED";
    return true;
  });

  const handleClaim = (match: MatchModel) => {
    claimMatch(match.id);
    setSelectedMatch({ ...match, claimedByRefereeId: currentUser.id, claimedByRefereeNick: currentUser.nickname });
  };

  const handleUnclaim = (match: MatchModel) => {
    unclaimMatch(match.id);
    setSelectedMatch({ ...match, claimedByRefereeId: undefined, claimedByRefereeNick: undefined });
  };

  const handleResolve = (match: MatchModel, winnerId: string) => {
    resolveMatchAsReferee(match.id, winnerId, disputeNotes);
    const winnerName = winnerId === match.participantA.id ? match.participantA.name : match.participantB.name;
    showAlert("Dictamen Arbitral Emitido", `✓ Victoria adjudicada oficialmente a ${winnerName}. Acta arbitral archivada con éxito.`, "success");
    setDisputeNotes("");
  };

  const handleWO = async (match: MatchModel) => {
    const loser = await showPrompt(
      "Aplicar W.O. por Inasistencia",
      "Ingresa el nombre del equipo que no se presentó a la sala (Regla de 15 minutos):",
      match.participantB.name
    );
    if (!loser) return;
    const winnerId = loser === match.participantA.name ? match.participantB.id : match.participantA.id;
    const winnerName = winnerId === match.participantA.id ? match.participantA.name : match.participantB.name;
    applyWalkOverAsReferee(match.id, winnerId, loser);
    showAlert("W.O. Aplicado", `⚖️ Victoria adjudicada por inasistencia del rival a ${winnerName}.`, "success");
  };

  return (
    <div className="min-h-screen bg-[#09090B] pb-20">
      {/* Header */}
      <div className="bg-[#111113] border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-[#D4860A]/15 text-[#D4860A] border border-[#D4860A]/30 flex items-center gap-1.5">
                  <Icon.Shield /> Panel Oficial de Arbitraje (REF)
                </span>
                <span className="text-xs text-[#71717A]">• Moderación y Dictamen Arbitral</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#FAFAFA] tracking-tight">
                Consola Arbitral de Partidas
              </h1>
              <p className="text-[#71717A] text-sm mt-1">
                Árbitro: <strong className="text-[#FAFAFA]">{refereeProfile.nickname}</strong> • Ámbito asignado: <strong className="text-[#D4860A]">{refereeProfile.assignedGame}</strong> • Partidas juzgadas: <strong className="text-[#22C55E]">{refereeProfile.matchesArbitrated}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={activeSubTab === "matches" ? "primary" : "outline"}
                size="sm"
                onClick={() => setActiveSubTab("matches")}
              >
                ⚖️ Salas & Disputas ({refereeMatches.filter((m) => m.status === "WAITING_CONFIRMATION").length})
              </Button>
              <Button
                variant={activeSubTab === "brackets" ? "primary" : "outline"}
                size="sm"
                onClick={() => setActiveSubTab("brackets")}
              >
                ⚔️ Control de Llaves
              </Button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#27272A]/60">
            <div className="bg-[#18181B]/70 p-3 rounded-xl border border-[#27272A]">
              <span className="text-xs text-[#71717A] block">Salas en Monitoreo</span>
              <span className="text-xl font-bold text-[#FAFAFA]">{refereeMatches.length}</span>
            </div>
            <div className="bg-[#18181B]/70 p-3 rounded-xl border border-[#27272A]">
              <span className="text-xs text-[#71717A] block">Requieren Dictamen</span>
              <span className="text-xl font-bold text-[#EAB308] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-pulse" />
                {refereeMatches.filter((m) => m.status === "WAITING_CONFIRMATION").length}
              </span>
            </div>
            <div className="bg-[#18181B]/70 p-3 rounded-xl border border-[#27272A]">
              <span className="text-xs text-[#71717A] block">Tus Salas Reclamadas</span>
              <span className="text-xl font-bold text-[#3B82F6]">
                {refereeMatches.filter((m) => m.claimedByRefereeId === currentUser.id).length}
              </span>
            </div>
            <div className="bg-[#18181B]/70 p-3 rounded-xl border border-[#27272A]">
              <span className="text-xs text-[#71717A] block">Tolerancia Oficial</span>
              <span className="text-xl font-bold text-[#22C55E]">15 Minutos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* SUBTAB 1: SALAS Y DISPUTAS */}
        {activeSubTab === "matches" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Columna Izquierda: Salas Activas vs Historial de Partidas */}
            <div className="lg:col-span-1 space-y-4">
              {/* Selector de Modo: Salas vs Historial */}
              <div className="flex rounded-xl bg-[#111113] p-1 border border-[#27272A]">
                <button
                  onClick={() => setLeftViewMode("MATCHES")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    leftViewMode === "MATCHES"
                      ? "bg-[#D4860A] text-white shadow"
                      : "text-[#71717A] hover:text-[#FAFAFA]"
                  }`}
                >
                  <Icon.Zap /> Salas Activas ({filteredMatches.length})
                </button>
                <button
                  onClick={() => setLeftViewMode("LOGS")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    leftViewMode === "LOGS"
                      ? "bg-[#27272A] text-[#FAFAFA] shadow"
                      : "text-[#71717A] hover:text-[#FAFAFA]"
                  }`}
                >
                  <Icon.BarChart /> Historial & Logs ({matchLogs.length})
                </button>
              </div>

              {leftViewMode === "MATCHES" ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">
                      Filtros de Estado
                    </span>

                    {/* Filtros */}
                    <div className="flex gap-1 bg-[#18181B] p-1 rounded-lg border border-[#27272A]">
                      <button
                        onClick={() => setFilterTab("ALL")}
                        className={`px-2 py-0.5 text-[11px] rounded font-semibold transition-colors cursor-pointer ${
                          filterTab === "ALL" ? "bg-[#27272A] text-[#FAFAFA]" : "text-[#71717A]"
                        }`}
                      >
                        Todas
                      </button>
                      <button
                        onClick={() => setFilterTab("PENDING")}
                        className={`px-2 py-0.5 text-[11px] rounded font-semibold transition-colors cursor-pointer ${
                          filterTab === "PENDING" ? "bg-[#EAB308]/20 text-[#EAB308]" : "text-[#71717A]"
                        }`}
                      >
                        Pendientes
                      </button>
                      <button
                        onClick={() => setFilterTab("MY_CLAIMS")}
                        className={`px-2 py-0.5 text-[11px] rounded font-semibold transition-colors cursor-pointer ${
                          filterTab === "MY_CLAIMS" ? "bg-[#3B82F6]/20 text-[#3B82F6]" : "text-[#71717A]"
                        }`}
                      >
                        Mías
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    {filteredMatches.length === 0 ? (
                      <Card className="p-6 text-center text-xs text-[#71717A]">
                        No hay salas que coincidan con el filtro seleccionado.
                      </Card>
                    ) : (
                      filteredMatches.map((m) => {
                        const isSelected = selectedMatch?.id === m.id;
                        const isClaimedByMe = m.claimedByRefereeId === currentUser.id;
                        return (
                          <Card
                            key={m.id}
                            className={`p-4 transition-all cursor-pointer border ${
                              isSelected
                                ? "border-[#D4860A] bg-[#18181B]"
                                : "border-[#27272A] hover:border-[#3F3F46] bg-[#111113]"
                            }`}
                            onClick={() => setSelectedMatch(m)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono font-bold text-[#D4860A]">{m.game || "FreeFire"}</span>
                              <Badge
                                variant={
                                  m.status === "WAITING_CONFIRMATION"
                                    ? "warning"
                                    : m.status === "COMPLETED"
                                    ? "success"
                                    : "live"
                                }
                              >
                                {m.status === "WAITING_CONFIRMATION" ? "Esperando Revisión" : m.status}
                              </Badge>
                            </div>

                            <div className="text-xs font-bold text-[#FAFAFA] mb-1">
                              {m.participantA.name} <span className="text-[#71717A]">vs</span> {m.participantB.name}
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-[#71717A] mt-2 pt-2 border-t border-[#27272A]">
                              <span>{m.roundName}</span>
                              {m.claimedByRefereeNick ? (
                                <span className={isClaimedByMe ? "text-[#3B82F6] font-bold" : "text-[#A1A1AA]"}>
                                  {isClaimedByMe ? "⭐ Moderada por ti" : `Árbitro: ${m.claimedByRefereeNick}`}
                                </span>
                              ) : (
                                <span className="text-[#EAB308] font-bold">✋ Sin Árbitro Asignado</span>
                              )}
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </>
              ) : (
                /* Historial de Partidas y Logs Arbitrales */
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {matchLogs.length === 0 ? (
                    <Card className="p-6 text-center text-xs text-[#71717A]">
                      No hay registros de actividad arbitral recientes.
                    </Card>
                  ) : (
                    matchLogs.map((log) => (
                      <Card
                        key={log.id}
                        className="p-4 border border-[#27272A] hover:border-[#3F3F46] bg-[#111113] space-y-2 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === "SUCCESS"
                                ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20"
                                : log.status === "WARNING"
                                ? "bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/20"
                                : "bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20"
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="text-[10px] font-mono text-[#71717A]">{log.timestamp}</span>
                        </div>

                        <p className="text-xs text-[#FAFAFA] font-medium leading-relaxed">
                          {log.details}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-[#71717A] pt-2 border-t border-[#27272A]/70">
                          <span>Árbitro: <strong className="text-[#A1A1AA]">{log.user}</strong></span>
                          <span className="text-[#22C55E]">✓ Registrado en acta</span>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Columna Derecha: Detalle de Sala, Inspección de Evidencias y Dictamen */}
            <div className="lg:col-span-2">
              {selectedMatch ? (
                <Card className="p-6 border-[#27272A] space-y-6">
                  {/* Header de Sala Seleccionada */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#27272A]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#D4860A] uppercase tracking-wider">
                          {selectedMatch.game} • {selectedMatch.roundName}
                        </span>
                        <Badge
                          variant={
                            selectedMatch.status === "WAITING_CONFIRMATION"
                              ? "warning"
                              : selectedMatch.status === "COMPLETED"
                              ? "success"
                              : "live"
                          }
                        >
                          {selectedMatch.status}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-[#FAFAFA] mt-1">
                        Sala de Partido: {selectedMatch.participantA.name} vs {selectedMatch.participantB.name}
                      </h3>
                      <span className="text-xs text-[#71717A]">Horario de Encuentro: {selectedMatch.scheduledTime}</span>
                    </div>

                    {/* Botón de Claim / Unclaim */}
                    <div>
                      {selectedMatch.claimedByRefereeId === currentUser.id ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-[#EF4444] hover:bg-[#EF4444]/10"
                          onClick={() => handleUnclaim(selectedMatch)}
                        >
                          Liberar Moderación
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs"
                          onClick={() => handleClaim(selectedMatch)}
                        >
                          ✋ Tomar / Reclamar Esta Sala
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Marcador Versus Box */}
                  <div className="bg-[#18181B] p-5 rounded-2xl border border-[#27272A]">
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                          Lado A (Seed #{selectedMatch.participantA.seed || 1})
                        </span>
                        <div className="font-bold text-base text-[#FAFAFA]">{selectedMatch.participantA.name}</div>
                        <span className="text-[11px] text-[#22C55E]">✓ Check-in Realizado</span>
                      </div>

                      <div className="px-5 py-2.5 rounded-xl bg-[#09090B] border border-[#27272A] text-center">
                        <span className="text-[10px] text-[#71717A] font-mono uppercase block">Marcador</span>
                        <div className="text-2xl font-mono font-extrabold text-[#D4860A]">
                          {selectedMatch.score ? `${selectedMatch.score.scoreA} - ${selectedMatch.score.scoreB}` : "VS"}
                        </div>
                      </div>

                      <div className="text-right flex-1">
                        <span className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider">
                          Lado B (Seed #{selectedMatch.participantB.seed || 2})
                        </span>
                        <div className="font-bold text-base text-[#FAFAFA]">{selectedMatch.participantB.name}</div>
                        <span className="text-[11px] text-[#22C55E]">✓ Check-in Realizado</span>
                      </div>
                    </div>
                  </div>

                  {/* Evidencias Fotográficas Adjuntas */}
                  {selectedMatch.score && (
                    <div className="space-y-3 bg-[#18181B]/70 p-4 rounded-xl border border-[#27272A]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#FAFAFA] flex items-center gap-1.5">
                          📸 Evidencia Fotográfica HD Adjunta:
                        </span>
                        <span className="text-[11px] text-[#71717A]">
                          Reportado por: <strong className="text-[#FAFAFA]">{selectedMatch.score.reportedBy}</strong> ({selectedMatch.score.reportedAt})
                        </span>
                      </div>

                      {selectedMatch.score.evidenceUrls && selectedMatch.score.evidenceUrls.length > 0 ? (
                        <div
                          onClick={() => setZoomedImage(selectedMatch.score!.evidenceUrls![0])}
                          className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#27272A] hover:border-[#D4860A] transition-all"
                        >
                          <img
                            src={selectedMatch.score.evidenceUrls[0]}
                            alt="Evidencia Arbitral"
                            className="max-h-60 w-full object-contain bg-black/80 group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold gap-1.5 transition-opacity">
                            <span>🔍 Inspeccionar captura en alta resolución</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-[#71717A] py-3 text-center">
                          No se adjuntaron capturas en este reporte.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Panel de Dictamen Arbitral */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                        Observaciones del Dictamen Arbitral (Se archivará en el acta oficial):
                      </label>
                      <input
                        type="text"
                        value={disputeNotes}
                        onChange={(e) => setDisputeNotes(e.target.value)}
                        placeholder="Ej: Captura validada por árbitro, marcador 2-1 confirmado reglamentariamente."
                        className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleResolve(selectedMatch, selectedMatch.participantA.id)}
                        className="justify-center font-bold"
                      >
                        🏆 Adjudicar Victoria a {selectedMatch.participantA.name}
                      </Button>

                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => handleResolve(selectedMatch, selectedMatch.participantB.id)}
                        className="justify-center font-bold hover:border-[#22C55E] hover:text-[#22C55E]"
                      >
                        🏆 Adjudicar Victoria a {selectedMatch.participantB.name}
                      </Button>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-[#27272A]">
                      <span className="text-[11px] text-[#71717A]">
                        ⏱️ Si un equipo no ingresó a sala tras 15 min de tolerancia:
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10"
                        onClick={() => handleWO(selectedMatch)}
                      >
                        ⚖️ Aplicar W.O. por Tolerancia
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card className="p-12 text-center text-xs text-[#71717A]">
                  Selecciona una sala en la columna izquierda para inspeccionar las evidencias y dictaminar el partido.
                </Card>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 2: CONTROL DE BRACKETS (REF) */}
        {activeSubTab === "brackets" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-[#27272A]">
                <div>
                  <h3 className="font-bold text-sm text-[#FAFAFA] flex items-center gap-2">
                    <span>Árbol de Cruces Oficial — {selectedTournament.title}</span>
                    <Badge variant="live">En Monitoreo Arbitral</Badge>
                  </h3>
                  <p className="text-xs text-[#71717A] mt-0.5">
                    Haz clic sobre cualquier equipo para adjudicar la serie y avanzar al vencedor en el cuadro.
                  </p>
                </div>
              </div>

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
      </div>

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

export default RefereeScreen;
