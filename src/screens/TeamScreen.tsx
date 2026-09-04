import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button, Badge, Icon, Card, Avatar } from "../components/ui";

interface ClanModel {
  id: string;
  name: string;
  tag: string;
  game: string;
  membersCount: number;
  maxMembers: number;
  points: number;
  openSlots: number;
  leaderNick: string;
  type: "CLAN";
}

interface OpenSquadModel {
  id: string;
  name: string;
  game: string;
  tournamentName: string;
  membersCount: number;
  maxMembers: number;
  points: number;
  openSlots: number;
  captainNick: string;
  type: "SQUAD";
}

interface FreeAgentModel {
  id: string;
  nick: string;
  game: string;
  rank: string;
  role: string;
  points: number;
  lookingFor: string;
  isMe?: boolean;
}

interface SquadMember {
  userId?: string;
  name: string;
  role: "Capitán" | "Titular" | "Refuerzo";
}

interface SquadModel {
  id: string;
  name: string;
  game: string;
  tournamentName: string;
  members: SquadMember[];
  status: "ACTIVE" | "COMPLETED";
}

interface TeamHistoryLog {
  id: string;
  date: string;
  action: string;
  type: "CLAN" | "SQUAD" | "TRANSFER";
}

const INITIAL_PUBLIC_CLANS: ClanModel[] = [];
const INITIAL_OPEN_SQUADS: OpenSquadModel[] = [];
const INITIAL_FREE_AGENTS: FreeAgentModel[] = [];

export function TeamScreen() {
  const { myTeam, currentUser, removeTeamMember, createOrJoinTeam, leaveClan, tournaments, showAlert, showConfirm } = useApp();
  const [activeTab, setActiveTab] = useState<"roster" | "find-clan" | "free-agents" | "history">("roster");

  // Filtro en "Buscar Clan o Escuadra"
  const [findFilter, setFindFilter] = useState<"all" | "clans" | "squads">("all");

  // Modales
  const [showCreateClanModal, setShowCreateClanModal] = useState(false);
  const [showCreateSquadModal, setShowCreateSquadModal] = useState(false);
  const [showLfgModal, setShowLfgModal] = useState(false);
  const [reRegisterSquadModal, setReRegisterSquadModal] = useState<SquadModel | null>(null);
  const [selectedNewTourney, setSelectedNewTourney] = useState("Copa Apertura FreeFire Squads");

  // Form crear Clan
  const [newClanName, setNewClanName] = useState("");
  const [newClanTag, setNewClanTag] = useState("");
  const [newClanGame, setNewClanGame] = useState("FreeFire");

  // Form crear Escuadra
  const [newSquadName, setNewSquadName] = useState("");
  const [newSquadTourney, setNewSquadTourney] = useState("Copa Apertura FreeFire Squads");
  const [newSquadGame, setNewSquadGame] = useState("FreeFire");

  // Form LFG (Publicarme como Agente Libre)
  const [myFreeAgentsList, setMyFreeAgentsList] = useState<FreeAgentModel[]>(INITIAL_FREE_AGENTS);
  const [lfgGame, setLfgGame] = useState("FreeFire");
  const [lfgRank, setLfgRank] = useState("Heroico");
  const [lfgRole, setLfgRole] = useState("Rusher");
  const [lfgTourney, setLfgTourney] = useState("Copa Apertura FreeFire Squads");
  const [isLfgPublished, setIsLfgPublished] = useState(false);

  // Buscador de Agentes Libres
  const [agentSearch, setAgentSearch] = useState("");

  // Escuadras y Logs
  const [mySquads, setMySquads] = useState<SquadModel[]>([]);

  const [historyLogs, setHistoryLogs] = useState<TeamHistoryLog[]>([]);

  // Invitaciones
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteSent, setInviteSent] = useState(false);

  const isSolo = !myTeam?.name || myTeam?.name === "Lobo Solitario" || myTeam?.tag === "SOLO";
  const isCaptain = !isSolo && (myTeam?.captainId === currentUser?.id || myTeam?.members?.some(m => m.userId === currentUser?.id && m.role === "CAPTAIN"));

  // Verificar si el equipo está inscrito en un torneo activo
  const activeTourney = tournaments.find(
    (t) => (t.status === "live" || t.status === "registration-open") &&
           t.registeredTeamsOrPlayers?.some((p) => p.id === myTeam?.id)
  );
  const isRosterLocked = !!activeTourney && !isSolo;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteEmail("");
    }, 3000);
  };

  const handleExpelClanMember = async (userId: string, nick: string) => {
    if (userId === currentUser?.id) {
      showAlert("Acción no permitida", "No puedes expulsarte a ti mismo como capitán del clan.", "warning");
      return;
    }

    const ok = await showConfirm(
      "Expulsar Jugador",
      `¿Estás seguro de que deseas expulsar a ${nick} del clan?`,
      "Expulsar",
      "Cancelar",
      "danger"
    );

    if (ok) {
      const removed = removeTeamMember(userId);
      if (!removed) {
        showAlert("Roster Bloqueado", "⚠️ Este equipo está actualmente inscrito en un torneo activo. Por normativa oficial, no es posible modificar el roster de jugadores hasta finalizar el evento.", "warning");
      } else {
        showAlert("Jugador Expulsado", `El jugador ${nick} ha sido expulsado del clan.`, "info");
        setHistoryLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            date: "Hoy",
            action: `Expulsaste a ${nick} del clan`,
            type: "TRANSFER",
          },
          ...prev,
        ]);
      }
    }
  };

  const handleLeaveClan = async () => {
    const ok = await showConfirm(
      "Abandonar Clan",
      `¿Estás seguro de que deseas abandonar el clan '${myTeam?.name || "Sin Clan"}'?`,
      "Abandonar Clan",
      "Cancelar",
      "danger"
    );

    if (ok) {
      const success = leaveClan();
      if (!success) {
        showAlert("Roster Bloqueado", "⚠️ No puedes abandonar el clan mientras esté registrado y compitiendo en un torneo activo.", "warning");
      } else {
        setHistoryLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            date: "Hoy",
            action: `Abandonaste el Clan '${myTeam?.name || "Sin Clan"}' (Estado: Lobo Solitario)`,
            type: "CLAN",
          },
          ...prev,
        ]);
        showAlert("Clan Abandonado", "Has salido del clan. Ahora tu estado es 'Lobo Solitario' y puedes unirte a otro clan o fundar uno nuevo.", "info");
      }
    }
  };

  const handleCreateClan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClanName.trim() || !newClanTag.trim()) return;

    createOrJoinTeam({
      name: newClanName,
      tag: newClanTag.toUpperCase(),
      game: newClanGame,
    });
    setHistoryLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        date: "Hoy",
        action: `Creaste el Clan '${newClanName}' [${newClanTag.toUpperCase()}]`,
        type: "CLAN",
      },
      ...prev,
    ]);
    setShowCreateClanModal(false);
    setActiveTab("roster");
    showAlert("Clan Creado", `¡Clan ${newClanName} creado con éxito! Eres el Capitán del clan.`, "success");
  };

  const handleCreateSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSquadName.trim()) return;

    const newSq: SquadModel = {
      id: `sq-${Date.now()}`,
      name: newSquadName,
      game: newSquadGame,
      tournamentName: newSquadTourney,
      members: [
        { name: currentUser?.nickname || "TuNick", role: "Capitán", userId: currentUser?.id },
      ],
      status: "ACTIVE",
    };

    setMySquads((prev) => [newSq, ...prev]);
    setHistoryLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        date: "Hoy",
        action: `Creaste la escuadra '${newSquadName}' para ${newSquadTourney}`,
        type: "SQUAD",
      },
      ...prev,
    ]);
    setShowCreateSquadModal(false);
    setActiveTab("roster");
    showAlert("Escuadra Creada", `¡Escuadra ${newSquadName} creada para ${newSquadTourney}!`, "success");
  };

  // Expulsar miembro de una escuadra
  const handleExpelSquadMember = async (squadId: string, memberName: string) => {
    const ok = await showConfirm(
      "Expulsar de Escuadra",
      `¿Deseas expulsar a '${memberName}' de esta escuadra?`,
      "Expulsar",
      "Cancelar",
      "danger"
    );

    if (ok) {
      setMySquads(prev => prev.map(sq => {
        if (sq.id === squadId) {
          return {
            ...sq,
            members: sq.members.filter(m => m.name !== memberName)
          };
        }
        return sq;
      }));
      setHistoryLogs(prev => [
        { id: `log-${Date.now()}`, date: "Hoy", action: `Expulsaste a '${memberName}' de tu escuadra`, type: "TRANSFER" },
        ...prev
      ]);
      showAlert("Jugador Expulsado", `Jugador ${memberName} expulsado de la escuadra.`, "info");
    }
  };

  // Abandonar escuadra como jugador
  const handleLeaveSquad = async (squadId: string, squadName: string) => {
    const ok = await showConfirm(
      "Salir de Escuadra",
      `¿Deseas salirte de la escuadra '${squadName}'?`,
      "Salir",
      "Cancelar",
      "warning"
    );

    if (ok) {
      setMySquads(prev => prev.filter(sq => sq.id !== squadId));
      setHistoryLogs(prev => [
        { id: `log-${Date.now()}`, date: "Hoy", action: `Te retiraste de la escuadra '${squadName}'`, type: "TRANSFER" },
        ...prev
      ]);
      showAlert("Escuadra Abandonada", `Te has retirado de la escuadra ${squadName}.`, "info");
    }
  };

  // Inscribir escuadra finalizada a un nuevo torneo
  const handleReRegisterSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reRegisterSquadModal) return;

    setMySquads(prev => prev.map(sq => {
      if (sq.id === reRegisterSquadModal.id) {
        return {
          ...sq,
          tournamentName: selectedNewTourney,
          status: "ACTIVE",
        };
      }
      return sq;
    }));

    setHistoryLogs(prev => [
      {
        id: `log-${Date.now()}`,
        date: "Hoy",
        action: `Inscribiste la escuadra '${reRegisterSquadModal.name}' en ${selectedNewTourney}`,
        type: "SQUAD"
      },
      ...prev
    ]);

    showAlert("Escuadra Inscrita", `¡Escuadra '${reRegisterSquadModal.name}' inscrita con éxito a '${selectedNewTourney}'!`, "success");
    setReRegisterSquadModal(null);
  };

  const handlePublishLfg = (e: React.FormEvent) => {
    e.preventDefault();
    const myEntry: FreeAgentModel = {
      id: `fa-me-${Date.now()}`,
      nick: currentUser?.nickname || "TuNick",
      game: lfgGame,
      rank: lfgRank,
      role: lfgRole,
      points: currentUser?.points || 0,
      lookingFor: lfgTourney,
      isMe: true,
    };

    setMyFreeAgentsList((prev) => [myEntry, ...prev.filter(p => !p.isMe)]);
    setIsLfgPublished(true);
    setShowLfgModal(false);
    showAlert("Agente Libre Publicado", `¡Tu perfil de Agente Libre para ${lfgGame} ha sido publicado en el tablón!`, "success");
  };

  const handleUnpublishLfg = () => {
    setMyFreeAgentsList((prev) => prev.filter(p => !p.isMe));
    setIsLfgPublished(false);
    showAlert("Perfil Retirado", "Has retirado tu publicación del tablón de Agentes Libres.", "info");
  };

  const filteredAgents = myFreeAgentsList.filter(fa => {
    const q = agentSearch.toLowerCase();
    return !q || fa.nick.toLowerCase().includes(q) || fa.game.toLowerCase().includes(q) || fa.role.toLowerCase().includes(q) || fa.lookingFor.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#09090B] pb-16">
      {/* Header Banner */}
      <div className="bg-[#111113] border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className={`w-20 h-20 rounded-2xl bg-[#18181B] border-2 flex items-center justify-center text-2xl md:text-3xl font-black shadow-[0_0_20px_#D4860A33] ${isSolo ? "border-[#71717A] text-[#71717A]" : "border-[#D4860A] text-[#D4860A]"}`}>
                {isSolo ? "🐺" : myTeam?.tag || "TOP"}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-[#FAFAFA]">
                    {isSolo ? "Lobo Solitario" : myTeam?.name || "Sin Clan"}
                  </h1>
                  {isSolo ? (
                    <Badge variant="muted">Sin Clan Oficial</Badge>
                  ) : (
                    <>
                      {isCaptain && <Badge variant="warning">Capitán</Badge>}
                      <button
                        onClick={handleLeaveClan}
                        className="text-xs text-[#EF4444] hover:underline cursor-pointer font-medium bg-[#EF4444]/10 px-2.5 py-1 rounded-md border border-[#EF4444]/20 transition-colors"
                      >
                        🚪 Salir del Clan
                      </button>
                    </>
                  )}
                </div>
                <p className="text-sm text-[#71717A] mt-1 flex items-center gap-3 flex-wrap">
                  <span>Organización: <strong className="text-[#FAFAFA]">{isSolo ? "Lobo Solitario (Agente Libre)" : myTeam?.name}</strong></span>
                  <span>•</span>
                  <span>Juego: <strong className="text-[#FAFAFA]">{myTeam?.game || "FreeFire"}</strong></span>
                  <span>•</span>
                  <span>Miembros: <strong className="text-[#FAFAFA]">{isSolo ? "1 (Tú)" : `${myTeam?.members?.length || 1} Jugadores`}</strong></span>
                  {isRosterLocked && (
                    <span className="text-[#F59E0B] font-semibold bg-[#F59E0B]/10 px-2 py-0.5 rounded text-xs">
                      🔒 Roster Bloqueado en Torneo Activo
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-4 bg-[#18181B] p-3 rounded-xl border border-[#27272A]">
                <div className="text-center px-3 border-r border-[#27272A]">
                  <div className="text-xl font-bold text-[#FAFAFA]">{isSolo ? 0 : myTeam?.stats?.tournamentsPlayed || 0}</div>
                  <div className="text-[10px] text-[#71717A] uppercase tracking-wider font-semibold">Torneos</div>
                </div>
                <div className="text-center px-3 border-r border-[#27272A]">
                  <div className="text-xl font-bold text-[#D4860A]">{isSolo ? 0 : myTeam?.stats?.tournamentsWon || 0}</div>
                  <div className="text-[10px] text-[#71717A] uppercase tracking-wider font-semibold">Títulos</div>
                </div>
                <div className="text-center px-3">
                  <div className="text-xl font-bold text-[#22C55E]">{currentUser?.points || 0} pts</div>
                  <div className="text-[10px] text-[#71717A] uppercase tracking-wider font-semibold">Puntos TR</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex gap-2 mt-6 border-t border-[#27272A] pt-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab("roster")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "roster"
                  ? "bg-[#D4860A] text-white"
                  : "bg-[#18181B] text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              🛡️ Mi Roster, Clan y Escuadras
            </button>
            <button
              onClick={() => setActiveTab("find-clan")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "find-clan"
                  ? "bg-[#D4860A] text-white"
                  : "bg-[#18181B] text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              🔍 Buscar Clan o Escuadra
            </button>
            <button
              onClick={() => setActiveTab("free-agents")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "free-agents"
                  ? "bg-[#D4860A] text-white"
                  : "bg-[#18181B] text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              👥 Agentes Libres (LFG) {isLfgPublished && "🟢"}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === "history"
                  ? "bg-[#D4860A] text-white"
                  : "bg-[#18181B] text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              📜 Historial y Traspasos (30 días)
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Mi Roster, Clan y Escuadras */}
      {activeTab === "roster" && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
          {/* Action Header for creating clan vs squad */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#111113] p-4 rounded-xl border border-[#27272A]">
            <div>
              <h3 className="font-bold text-[#FAFAFA] text-sm">Organización y Equipos Competitivos</h3>
              <p className="text-xs text-[#71717A]">
                {isSolo
                  ? "Actualmente no perteneces a ningún Clan oficial. Puedes fundar tu propio Clan o crear Escuadras para torneos."
                  : `Perteneces al clan ${myTeam?.name}. Puedes crear Escuadras independientes para torneos específicos.`}
              </p>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setShowCreateClanModal(true)}>
                🏰 Crear Clan
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowCreateSquadModal(true)}>
                ⚔️ Crear Equipo / Escuadra
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Aside: Invitación y Gestión */}
            <div className="space-y-6 lg:order-1">
              {!isSolo && (
                <Card className="p-5 border-[#27272A] bg-[#111113]">
                  <h3 className="text-base font-bold text-[#FAFAFA] mb-1">Invitar Jugador al Clan</h3>
                  <p className="text-xs text-[#71717A] mb-4">
                    Suma nuevos miembros a tu clan para próximos torneos.
                  </p>

                  <form onSubmit={handleInvite} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                        Email o Nickname del Jugador
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ej: viper@toprival.gg"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[#D4860A]"
                      />
                    </div>

                    <Button variant="primary" size="sm" type="submit" className="w-full">
                      <Icon.User />
                      Enviar Invitación
                    </Button>

                    {inviteSent && (
                      <div className="p-2.5 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-lg text-xs font-medium text-center animate-in fade-in">
                        ✓ ¡Invitación enviada con éxito!
                      </div>
                    )}
                  </form>

                  <div className="mt-6 pt-5 border-t border-[#27272A]">
                    <div className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
                      Código de Entrada Directa
                    </div>
                    <div className="flex items-center gap-2 bg-[#18181B] p-2 rounded-lg border border-[#27272A] font-mono text-xs text-[#FAFAFA] justify-between">
                      <span>{myTeam?.tag ? `${myTeam.tag}-LATAM-2026` : "KC-LATAM-2026"}</span>
                      <button
                        onClick={() => showAlert("Código Copiado", "Código de clan copiado al portapapeles con éxito.", "info")}
                        className="text-xs text-[#D4860A] hover:underline font-sans cursor-pointer"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Normativa de Roster */}
              <div className={`border rounded-xl p-4 text-xs space-y-2 ${isRosterLocked ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]" : "bg-[#18181B]/70 border-[#27272A] text-[#71717A]"}`}>
                <div className="font-semibold text-[#FAFAFA] flex items-center gap-1.5">
                  <Icon.Shield /> Normativa de Roster y Torneo
                </div>
                <p className="leading-relaxed">
                  {isRosterLocked
                    ? "🔒 Este equipo está registrado en un torneo en curso. Los jugadores inscritos al inicio son los únicos habilitados para competir. No se permiten cambios hasta la finalización del torneo."
                    : "Como capitán, puedes gestionar altas y bajas antes del cierre de inscripciones. Cuando un torneo finalice, el capitán podrá reinscribir la escuadra al siguiente torneo disponible."}
                </p>
              </div>
            </div>

            {/* Main Column: Clan Members + My Squads */}
            <div className="lg:col-span-2 space-y-8 lg:order-2">
              {/* 1. Miembros de mi Clan */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#FAFAFA]">
                      {isSolo ? "Tu Estado de Jugador" : `Roster del Clan: ${myTeam?.name}`}
                    </h2>
                    <p className="text-xs text-[#71717A]">
                      {isSolo ? "Estás compitiendo como Lobo Solitario sin afiliación a clan" : "Miembros oficiales de tu clan"}
                    </p>
                  </div>
                  <Badge variant={isSolo ? "muted" : "default"}>
                    {isSolo ? "Lobo Solitario" : `${myTeam?.members?.length || 1} Jugadores`}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {(myTeam?.members || [
                    { userId: currentUser?.id || "u-1", nickname: currentUser?.nickname || "TuNick", role: "CAPTAIN", joinedAt: "Reciente", inGameName: currentUser?.nickname || "TuNick" }
                  ]).map((m, idx) => (
                    <Card key={m.userId} className="p-4 flex items-center justify-between hover:border-[#3F3F46] transition-all">
                      <div className="flex items-center gap-3.5">
                        <div className="text-xs font-mono text-[#52525B] w-4">#{idx + 1}</div>
                        <Avatar name={m.nickname} size={40} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#FAFAFA]">{m.nickname}</span>
                            {m.role === "CAPTAIN" && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#D4860A]/20 text-[#D4860A] rounded border border-[#D4860A]/30">
                                {isSolo ? "JUGADOR" : "CAPITÁN"}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-[#71717A] mt-0.5 flex items-center gap-2">
                            <span>IGN: <strong className="text-[#A1A1AA]">{m.inGameName || m.nickname}</strong></span>
                            <span>•</span>
                            <span>Ingresó: {m.joinedAt || "Reciente"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCaptain && m.role !== "CAPTAIN" && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleExpelClanMember(m.userId, m.nickname)}
                            disabled={isRosterLocked}
                          >
                            Expulsar
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 2. Mis Escuadras de Torneo */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#FAFAFA]">Mis Escuadras de Torneo</h2>
                    <p className="text-xs text-[#71717A]">Alineaciones que has creado o a las que perteneces para torneos</p>
                  </div>
                  <Badge variant="warning">{mySquads.length} Escuadras</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mySquads.length === 0 ? (
                    <Card className="p-8 text-center text-xs text-[#71717A] md:col-span-2 border-[#27272A] bg-[#111113]">
                      <div className="text-3xl mb-2">⚔️</div>
                      <p className="font-bold text-[#FAFAFA] text-sm mb-1">Sin escuadras de torneo activas</p>
                      <p className="max-w-md mx-auto">Aún no has registrado ninguna escuadra para competir. Haz clic en "Crear Equipo / Escuadra" para armar tu alineación.</p>
                    </Card>
                  ) : (
                    mySquads.map((sq) => {
                    const isSquadCaptain = sq.members.some(m => (m.userId === currentUser?.id || m.name === currentUser?.nickname) && m.role === "Capitán");
                    const isCompleted = sq.status === "COMPLETED";

                    return (
                      <Card key={sq.id} className="p-4 space-y-3 border-[#27272A] bg-[#111113] flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <div>
                              <h4 className="font-bold text-[#FAFAFA] text-base">{sq.name}</h4>
                              <span className="text-xs text-[#D4860A] font-medium">{sq.tournamentName}</span>
                            </div>
                            <Badge variant={isCompleted ? "muted" : "success"}>
                              {isCompleted ? "Torneo Finalizado" : "En Competición"}
                            </Badge>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-[#27272A]">
                            <div className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">Alineación y Gestión:</div>
                            <div className="space-y-1.5">
                              {sq.members.map((sm, i) => {
                                const isSelf = sm.userId === currentUser?.id || sm.name === currentUser?.nickname;
                                return (
                                  <div key={i} className="flex items-center justify-between px-2.5 py-1.5 bg-[#18181B] border border-[#27272A] rounded-lg text-xs">
                                    <div className="flex items-center gap-2">
                                      <Avatar name={sm.name} size={20} />
                                      <span className="text-[#FAFAFA] font-medium">{sm.name}</span>
                                      <span className="text-[9px] text-[#D4860A] font-bold">({sm.role})</span>
                                    </div>

                                    {/* Botón expulsar / retirarse */}
                                    <div>
                                      {isSquadCaptain && !isSelf && (
                                        <button
                                          onClick={() => handleExpelSquadMember(sq.id, sm.name)}
                                          className="text-[10px] text-[#EF4444] hover:underline cursor-pointer font-semibold"
                                        >
                                          Expulsar
                                        </button>
                                      )}
                                      {!isSquadCaptain && isSelf && (
                                        <button
                                          onClick={() => handleLeaveSquad(sq.id, sq.name)}
                                          className="text-[10px] text-[#EF4444] hover:underline cursor-pointer font-semibold"
                                        >
                                          Retirarme
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Botón Inscribir a Nuevo Torneo si el torneo finalizó */}
                        {isCompleted && isSquadCaptain && (
                          <div className="pt-3 border-t border-[#27272A]">
                            <Button
                              fullWidth
                              size="sm"
                              variant="primary"
                              onClick={() => setReRegisterSquadModal(sq)}
                              className="text-xs"
                            >
                              🏆 Inscribir Escuadra a Nuevo Torneo
                            </Button>
                          </div>
                        )}
                      </Card>
                    );
                  }))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Buscar Clan o Escuadra */}
      {activeTab === "find-clan" && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#FAFAFA]">Clanes y Escuadras Reclutando</h2>
              <p className="text-xs text-[#71717A]">Explora organizaciones oficiales o únete a escuadras con cupos disponibles para un torneo</p>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => setShowCreateClanModal(true)}>
                🏰 Crear Clan
              </Button>
              <Button variant="primary" size="sm" onClick={() => setShowCreateSquadModal(true)}>
                ⚔️ Crear Equipo / Escuadra
              </Button>
            </div>
          </div>

          {/* Subfilter for Clans vs Squads */}
          <div className="flex gap-2 bg-[#111113] p-1.5 rounded-xl border border-[#27272A] w-fit">
            <button
              onClick={() => setFindFilter("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                findFilter === "all" ? "bg-[#27272A] text-[#FAFAFA]" : "text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              Todos ({INITIAL_PUBLIC_CLANS.length + INITIAL_OPEN_SQUADS.length})
            </button>
            <button
              onClick={() => setFindFilter("clans")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                findFilter === "clans" ? "bg-[#D4860A] text-white" : "text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              🏰 Clanes Oficiales ({INITIAL_PUBLIC_CLANS.length})
            </button>
            <button
              onClick={() => setFindFilter("squads")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                findFilter === "squads" ? "bg-[#D4860A] text-white" : "text-[#71717A] hover:text-[#FAFAFA]"
              }`}
            >
              ⚔️ Escuadras de Torneo ({INITIAL_OPEN_SQUADS.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_PUBLIC_CLANS.length === 0 && INITIAL_OPEN_SQUADS.length === 0 && (
              <Card className="p-8 text-center text-xs text-[#71717A] col-span-full border-[#27272A] bg-[#111113]">
                <div className="text-3xl mb-2">🏰</div>
                <p className="font-bold text-[#FAFAFA] text-sm mb-1">No hay organizaciones reclutando actualmente</p>
                <p className="max-w-md mx-auto">Sé el primero en fundar un clan oficial o crear una escuadra para comenzar a reclutar jugadores.</p>
              </Card>
            )}

            {/* Clanes */}
            {(findFilter === "all" || findFilter === "clans") &&
              INITIAL_PUBLIC_CLANS.map((clan) => (
                <Card key={clan.id} className="p-5 flex justify-between items-center border-[#27272A] hover:border-[#D4860A]/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#18181B] border border-[#D4860A] flex items-center justify-center font-bold text-[#D4860A]">
                      {clan.tag}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-[#FAFAFA] text-base">{clan.name}</h3>
                        <Badge variant="warning" className="text-[9px]">CLAN OFICIAL</Badge>
                      </div>
                      <p className="text-xs text-[#71717A]">
                        Juego: <strong className="text-[#A1A1AA]">{clan.game}</strong> • Líder: <strong className="text-[#FAFAFA]">{clan.leaderNick}</strong>
                      </p>
                      <div className="flex gap-2 items-center mt-2">
                        <span className="text-[10px] text-[#F5B830] font-semibold bg-[#F5B830]/10 px-2 py-0.5 rounded">
                          {clan.openSlots} cupos disponibles
                        </span>
                        <span className="text-xs text-[#22C55E] font-mono font-bold">{clan.points} pts TR</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => showAlert("Solicitud Enviada", `Solicitud de ingreso enviada exitosamente al clan ${clan.name}.`, "success")}>
                    Solicitar Ingreso
                  </Button>
                </Card>
              ))}

            {/* Escuadras de Torneo */}
            {(findFilter === "all" || findFilter === "squads") &&
              INITIAL_OPEN_SQUADS.map((sq) => (
                <Card key={sq.id} className="p-5 flex justify-between items-center border-[#27272A] hover:border-[#3B82F6]/40 transition-colors bg-[#111113]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#18181B] border border-[#3B82F6] flex items-center justify-center text-xl">
                      ⚔️
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-[#FAFAFA] text-base">{sq.name}</h3>
                        <Badge variant="primary" className="text-[9px]">ESCUADRA DE TORNEO</Badge>
                      </div>
                      <p className="text-xs text-[#71717A]">
                        Torneo: <strong className="text-[#D4860A]">{sq.tournamentName}</strong>
                      </p>
                      <p className="text-xs text-[#71717A]">
                        Capitán: <strong className="text-[#FAFAFA]">{sq.captainNick}</strong> • Juego: {sq.game}
                      </p>
                      <div className="flex gap-2 items-center mt-2">
                        <span className="text-[10px] text-[#3B82F6] font-semibold bg-[#3B82F6]/10 px-2 py-0.5 rounded">
                          {sq.openSlots} cupo disponible
                        </span>
                        <span className="text-xs text-[#22C55E] font-mono font-bold">{sq.points} pts TR</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="primary" onClick={() => showAlert("Solicitud Enviada", `Solicitud para unirte a la escuadra '${sq.name}' enviada con éxito.`, "success")}>
                    Unirme al Torneo
                  </Button>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Tab 3: Agentes Libres (LFG) */}
      {activeTab === "free-agents" && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-[#FAFAFA]">Agentes Libres (Looking For Group)</h2>
              <p className="text-xs text-[#71717A]">Busca amigos y jugadores sin equipo para fichar a tu escuadra</p>
            </div>
            <div className="flex gap-2">
              {isLfgPublished ? (
                <Button size="sm" variant="danger" onClick={handleUnpublishLfg}>
                  ✕ Retirar mi publicación LFG
                </Button>
              ) : (
                <Button size="sm" variant="primary" onClick={() => setShowLfgModal(true)}>
                  📢 Publicarme como Agente Libre
                </Button>
              )}
            </div>
          </div>

          {/* Buscador de Jugadores y Amigos */}
          <div className="bg-[#111113] p-4 rounded-xl border border-[#27272A] flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar jugador por Nickname, Rol (Rusher, IGL, Francotirador) o Torneo..."
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                className="w-full bg-[#18181B] border border-[#27272A] rounded-lg pl-9 pr-3 py-2 text-sm text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[#D4860A]"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]">🔍</span>
            </div>
            {agentSearch && (
              <Button size="sm" variant="outline" onClick={() => setAgentSearch("")}>
                Limpiar
              </Button>
            )}
          </div>

          {/* Lista de Agentes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredAgents.length === 0 ? (
              <Card className="p-8 text-center text-xs text-[#71717A] md:col-span-3 border-[#27272A] bg-[#111113]">
                <div className="text-3xl mb-2">📢</div>
                <p className="font-bold text-[#FAFAFA] text-sm mb-1">No hay agentes libres registrados</p>
                <p className="max-w-md mx-auto">No se encontraron jugadores buscando equipo. Haz clic en "Publicarme como Agente Libre" para buscar escuadra.</p>
              </Card>
            ) : (
              filteredAgents.map((fa) => (
                <Card key={fa.id} className={`p-5 space-y-3 ${fa.isMe ? "border-[#D4860A]/50 bg-[#D4860A]/5" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={fa.nick} size={40} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-[#FAFAFA]">{fa.nick}</h4>
                          {fa.isMe && <Badge variant="warning">Tú</Badge>}
                        </div>
                        <span className="text-xs text-[#F5B830] font-medium">{fa.game} • {fa.rank}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-[#71717A] space-y-1 bg-[#18181B] p-2.5 rounded-lg border border-[#27272A]">
                    <div>Rol principal: <strong className="text-[#FAFAFA]">{fa.role}</strong></div>
                    <div>Busca equipo para: <strong className="text-[#D4860A]">{fa.lookingFor}</strong></div>
                    <div>Puntos TR: <strong className="text-[#22C55E]">{fa.points}</strong></div>
                  </div>
                  {!fa.isMe ? (
                    <Button fullWidth size="sm" variant="primary" onClick={() => showAlert("Invitación Enviada", `Invitación de escuadra enviada exitosamente a ${fa.nick}.`, "success")}>
                      Fichar para mi Escuadra
                    </Button>
                  ) : (
                    <div className="text-center text-xs text-[#22C55E] font-semibold">
                      ✓ Tu perfil está visible para otros capitanes
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Historial y Traspasos (Últimos 30 días) */}
      {activeTab === "history" && (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#FAFAFA]">Historial de Traspasos y Equipos</h2>
            <p className="text-xs text-[#71717A]">Registro de movimientos, clanes y escuadras de los últimos 30 días</p>
          </div>

          <Card className="p-0 overflow-hidden divide-y divide-[#27272A]">
            {historyLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#71717A]">
                <div className="text-3xl mb-2">📋</div>
                <p className="font-bold text-[#FAFAFA] text-sm mb-1">Sin historial de movimientos reciente</p>
                <p>Las inscripciones, transferencias y altas de miembros en los últimos 30 días aparecerán aquí.</p>
              </div>
            ) : (
              historyLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-[#18181B]/50 transition-colors">
                  <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-[#18181B] border border-[#27272A] flex items-center justify-center text-sm">
                      {log.type === "CLAN" ? "🏰" : log.type === "SQUAD" ? "⚔️" : "🔄"}
                    </div>
                    <div>
                      <p className="text-sm text-[#FAFAFA] font-medium">{log.action}</p>
                      <span className="text-[10px] text-[#71717A] font-mono">{log.date}</span>
                    </div>
                  </div>
                  <Badge variant="muted">{log.type}</Badge>
                </div>
              ))
            )}
          </Card>
        </div>
      )}

      {/* Modal 1: Crear Clan */}
      {showCreateClanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-[#27272A] rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 shadow-2xl">
            <h3 className="text-lg font-bold text-[#FAFAFA] mb-1">🏰 Crear Nuevo Clan</h3>
            <p className="text-xs text-[#71717A] mb-4">El Clan es tu organización permanente en TopRival con Tag oficial.</p>

            <form onSubmit={handleCreateClan} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Nombre del Clan
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: Furia Latina"
                  value={newClanName}
                  onChange={(e) => setNewClanName(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Tag / Siglas del Clan (2-5 letras)
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="ej: FURL"
                  value={newClanTag}
                  onChange={(e) => setNewClanTag(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A] uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Juego Principal
                </label>
                <select
                  value={newClanGame}
                  onChange={(e) => setNewClanGame(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                >
                  {["FreeFire", "CODMobile", "FIFA Mobile", "Warzone", "Valorant", "LOL", "FIFA", "Rocket League", "Counter Strike"].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" fullWidth onClick={() => setShowCreateClanModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" fullWidth>
                  Crear Clan Oficial
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Crear Escuadra / Equipo de Torneo */}
      {showCreateSquadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-[#27272A] rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 shadow-2xl">
            <h3 className="text-lg font-bold text-[#FAFAFA] mb-1">⚔️ Crear Escuadra / Equipo de Torneo</h3>
            <p className="text-xs text-[#71717A] mb-4">Alineación específica creada para competir en un torneo particular.</p>

            <form onSubmit={handleCreateSquad} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Nombre de la Escuadra
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: Squad Apertura Masters"
                  value={newSquadName}
                  onChange={(e) => setNewSquadName(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Torneo Destino
                </label>
                <select
                  value={newSquadTourney}
                  onChange={(e) => setNewSquadTourney(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                >
                  <option value="Copa Apertura FreeFire Squads">Copa Apertura FreeFire Squads</option>
                  <option value="FreeFire Masters LATAM - Playoffs">FreeFire Masters LATAM - Playoffs</option>
                  <option value="TopRival Championship 2026">TopRival Championship 2026</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" fullWidth onClick={() => setShowCreateSquadModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" fullWidth>
                  Crear Escuadra
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Publicarme como Agente Libre */}
      {showLfgModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-[#27272A] rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 shadow-2xl">
            <h3 className="text-lg font-bold text-[#FAFAFA] mb-1">📢 Publicarme como Agente Libre</h3>
            <p className="text-xs text-[#71717A] mb-4">Los capitanes que busquen refuerzos para sus torneos podrán contactarte e invitarte.</p>

            <form onSubmit={handlePublishLfg} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Videojuego
                </label>
                <select
                  value={lfgGame}
                  onChange={(e) => setLfgGame(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                >
                  {["FreeFire", "CODMobile", "FIFA Mobile", "Warzone", "Valorant", "LOL", "FIFA", "Rocket League", "Counter Strike"].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                    Rango / Nivel Actual
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Heroico / Inmortal"
                    value={lfgRank}
                    onChange={(e) => setLfgRank(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                    Rol Principal
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej: Rusher, IGL, Sniper"
                    value={lfgRole}
                    onChange={(e) => setLfgRole(e.target.value)}
                    className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Buscas escuadra para
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej: Copa Apertura FreeFire o Torneos 4v4"
                  value={lfgTourney}
                  onChange={(e) => setLfgTourney(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" fullWidth onClick={() => setShowLfgModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" fullWidth>
                  Publicar en Agentes Libres
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Re-inscribir Escuadra Finalizada a Nuevo Torneo */}
      {reRegisterSquadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-[#27272A] rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 shadow-2xl">
            <h3 className="text-lg font-bold text-[#FAFAFA] mb-1">🏆 Inscribir Escuadra a Nuevo Torneo</h3>
            <p className="text-xs text-[#71717A] mb-4">
              Inscribe tu alineación existente de <strong>{reRegisterSquadModal.name}</strong> a un nuevo torneo oficial disponible.
            </p>

            <form onSubmit={handleReRegisterSquad} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Seleccionar Torneo Oficial
                </label>
                <select
                  value={selectedNewTourney}
                  onChange={(e) => setSelectedNewTourney(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                >
                  <option value="Copa Apertura FreeFire Squads">Copa Apertura FreeFire Squads (Inscripciones Abiertas)</option>
                  <option value="TopRival Championship 2026">TopRival Championship 2026</option>
                  <option value="FreeFire Masters LATAM - Temporada 2">FreeFire Masters LATAM - Temporada 2</option>
                </select>
              </div>

              <div className="p-3 bg-[#18181B] rounded-lg border border-[#27272A] text-xs space-y-1">
                <div className="font-semibold text-[#FAFAFA]">Alineación que se inscribirá:</div>
                <div className="text-[#A1A1AA]">
                  {reRegisterSquadModal.members.map(m => m.name).join(", ")}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" fullWidth onClick={() => setReRegisterSquadModal(null)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" fullWidth>
                  Confirmar Inscripción
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
