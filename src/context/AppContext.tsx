import React, { createContext, useContext, useState, useEffect } from "react";
import {
  TournamentModel,
  TournamentRequest,
  Team,
  UserProfile,
  MatchModel,
  Role,
  TournamentStatus,
  SystemLog,
  SystemNotification,
  RefereeAccount,
  PaymentReceipt,
} from "../types";
import { api } from "../services/api";
import { ModalConfig, ModalDialog } from "../components/ModalDialog";

export interface BracketParticipant {
  name: string;
  score?: number;
  winner?: boolean;
  isCurrentUser?: boolean;
  bye?: boolean;
}

export interface BracketMatch {
  id: string;
  roundIndex: number;
  matchIndex: number;
  p1?: BracketParticipant;
  p2?: BracketParticipant;
  status: "pending" | "live" | "completed" | "bye";
}

export interface BracketRound {
  label: string;
  matches: BracketMatch[];
}

const INITIAL_USER: UserProfile = {
  id: "guest",
  email: "guest@toprival.gg",
  nickname: "Invitado",
  role: "PLAYER",
  country: "Colombia",
  gameAccounts: [],
  stats: {
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    matchesPlayed: 0,
    winRate: 0,
    points: 0,
  },
};

const INITIAL_TEAM: Team = {
  id: "clan-solo",
  name: "Sin Clan Oficial",
  tag: "SOLO",
  captainId: "guest",
  game: "Multijuego",
  stats: {
    tournamentsPlayed: 0,
    tournamentsWon: 0,
    points: 0,
  },
  members: [],
};

const INITIAL_BRACKET: BracketRound[] = [];
const INITIAL_TOURNAMENTS: TournamentModel[] = [];
const INITIAL_REQUESTS: TournamentRequest[] = [];
const INITIAL_LOGS: SystemLog[] = [];
const INITIAL_NOTIFICATIONS: SystemNotification[] = [];
const INITIAL_REFEREES: RefereeAccount[] = [];
const INITIAL_REFEREE_MATCHES: MatchModel[] = [];

interface AppContextType {
  currentUser: UserProfile;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  isAuthenticated: boolean;
  login: (role: Role) => void;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerWithCredentials: (nick: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  tournaments: TournamentModel[];
  selectedTournament: TournamentModel;
  setSelectedTournamentId: (id: string) => void;
  updateTournamentStatus: (id: string, status: TournamentStatus) => void;
  myTeam: Team;
  tournamentRequests: TournamentRequest[];
  voteTournamentRequest: (requestId: string) => void;
  createTournamentRequest: (request: Omit<TournamentRequest, "id" | "currentVotes" | "hasVoted" | "status"> & { isAdminOfficial?: boolean }) => void;
  rejectTournamentRequest: (requestId: string) => void;
  deleteTournamentRequest: (requestId: string) => void;
  registerCurrentTeamToTournament: (tournamentId: string) => Promise<boolean> | boolean;
  createTournamentByAdmin: (tournament: Partial<TournamentModel>) => void;
  updateTournamentByAdmin: (id: string, updates: Partial<TournamentModel>) => void;
  deleteTournamentByAdmin: (id: string) => void;
  addTestParticipantToTournament: (tournamentId: string, participantName: string) => void;
  removeParticipantFromTournament: (tournamentId: string, participantId: string) => void;
  generateTournamentBracket: (tournamentId: string, seriesType?: "Bo1" | "Bo3" | "Bo5") => void;
  currentMatch: MatchModel;
  reportMatchResult: (scoreA: number, scoreB: number, evidenceUrl: string) => void;
  resolveDispute: (winnerId: string, notes?: string) => void;
  bracketData: BracketRound[];
  advanceBracketMatch: (roundIdx: number, matchIdx: number, winnerName: string, scoreWinner: number, scoreLoser: number) => void;
  resetBracket: () => void;
  updateUserNickname: (newNick: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  removeTeamMember: (userId: string) => boolean;
  createOrJoinTeam: (team: Partial<Team>) => void;
  leaveClan: () => boolean;
  systemLogs: SystemLog[];
  addSystemLog: (log: Omit<SystemLog, "id" | "timestamp">) => void;
  systemNotifications: SystemNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  referees: RefereeAccount[];
  createReferee: (data: Omit<RefereeAccount, "id" | "matchesArbitrated" | "createdAt">) => void;
  toggleRefereeStatus: (id: string) => void;
  refereeMatches: MatchModel[];
  claimMatch: (matchId: string) => void;
  unclaimMatch: (matchId: string) => void;
  resolveMatchAsReferee: (matchId: string, winnerId: string, notes?: string) => void;
  applyWalkOverAsReferee: (matchId: string, winnerId: string, absentParticipantName: string) => void;
  showAlert: (title: string, message: string, variant?: "info" | "success" | "warning" | "danger") => Promise<void>;
  showConfirm: (title: string, message: string, confirmText?: string, cancelText?: string, variant?: "warning" | "danger" | "info") => Promise<boolean>;
  showPrompt: (title: string, message: string, defaultValue?: string, placeholder?: string) => Promise<string | null>;
  lastPaymentReceipt: PaymentReceipt | null;
  setLastPaymentReceipt: (receipt: PaymentReceipt | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [currentRole, setCurrentRole] = useState<Role>("TEAM_CAPTAIN");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("toprival_token");
  });
  const [tournaments, setTournaments] = useState<TournamentModel[]>(INITIAL_TOURNAMENTS);
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("ff-live-01");
  const [myTeam, setMyTeam] = useState<Team>(INITIAL_TEAM);
  const [tournamentRequests, setTournamentRequests] = useState<TournamentRequest[]>(INITIAL_REQUESTS);
  const [bracketData, setBracketData] = useState<BracketRound[]>(INITIAL_BRACKET);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(INITIAL_LOGS);
  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>(INITIAL_NOTIFICATIONS);
  const [referees, setReferees] = useState<RefereeAccount[]>(INITIAL_REFEREES);
  const [lastPaymentReceipt, setLastPaymentReceipt] = useState<PaymentReceipt | null>(null);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  const showAlert = (
    title: string,
    message: string,
    variant: "info" | "success" | "warning" | "danger" = "info"
  ): Promise<void> => {
    return new Promise((resolve) => {
      setModalConfig({
        isOpen: true,
        type: "alert",
        variant,
        title,
        message,
        confirmText: "Entendido",
        onResolve: () => {
          setModalConfig(null);
          resolve();
        },
      });
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    confirmText: string = "Confirmar",
    cancelText: string = "Cancelar",
    variant: "warning" | "danger" | "info" = "warning"
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalConfig({
        isOpen: true,
        type: "confirm",
        variant,
        title,
        message,
        confirmText,
        cancelText,
        onResolve: (result: boolean) => {
          setModalConfig(null);
          resolve(!!result);
        },
      });
    });
  };

  const showPrompt = (
    title: string,
    message: string,
    defaultValue: string = "",
    placeholder: string = "Escribe aquí..."
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      setModalConfig({
        isOpen: true,
        type: "prompt",
        variant: "info",
        title,
        message,
        defaultValue,
        placeholder,
        confirmText: "Aceptar",
        cancelText: "Cancelar",
        onResolve: (result: string | null) => {
          setModalConfig(null);
          resolve(result);
        },
      });
    });
  };

  const closeModal = (value: any) => {
    if (modalConfig?.onResolve) {
      modalConfig.onResolve(value);
    }
    setModalConfig(null);
  };

  const addSystemLog = (logData: Omit<SystemLog, "id" | "timestamp">) => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: "Hace un momento",
      ...logData,
    };
    setSystemLogs((prev) => [newLog, ...prev]);
    api.system.createLog(logData).catch((err) => console.warn("System log API sync error:", err));
  };

  const markNotificationAsRead = (id: string) => {
    setSystemNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setSystemNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteTournamentRequest = (id: string) => {
    setTournamentRequests((prev) => prev.filter((r) => r.id !== id));
    api.requests.delete(id).catch((err) => console.warn("Delete request API error:", err));
  };

  const createReferee = (data: Omit<RefereeAccount, "id" | "matchesArbitrated" | "createdAt">) => {
    const newRef: RefereeAccount = {
      id: `ref-${Date.now()}`,
      matchesArbitrated: 0,
      createdAt: "Hoy",
      ...data,
    };
    setReferees((prev) => [newRef, ...prev]);
    api.referees.create(data).catch((err) => console.warn("Create referee API error:", err));
    addSystemLog({
      type: "USER",
      action: "Referee Creado",
      user: currentUser.nickname,
      details: `Nuevo árbitro asignado: ${data.nickname} (${data.assignedGame})`,
      status: "INFO",
    });
  };

  const toggleRefereeStatus = (id: string) => {
    setReferees((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
          : r
      )
    );
    api.referees.toggleStatus(id).catch((err) => console.warn("Toggle referee API error:", err));
  };

  const DEFAULT_MATCH: MatchModel = {
    id: "none",
    tournamentId: "none",
    roundName: "Partida Oficial",
    roundIndex: 0,
    game: "FreeFire",
    participantA: {
      id: "p1",
      name: "Participante 1",
      checkedIn: false,
      seed: 1,
    },
    participantB: {
      id: "p2",
      name: "Participante 2",
      checkedIn: false,
      seed: 2,
    },
    status: "SCHEDULED",
    scheduledTime: "Por programar",
  };

  const [refereeMatches, setRefereeMatches] = useState<MatchModel[]>(INITIAL_REFEREE_MATCHES);
  const [currentMatch, setCurrentMatch] = useState<MatchModel>(INITIAL_REFEREE_MATCHES[0] || DEFAULT_MATCH);

  const claimMatch = (matchId: string) => {
    setRefereeMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              claimedByRefereeId: currentUser.id,
              claimedByRefereeNick: currentUser.nickname,
            }
          : m
      )
    );
    api.matches.claimMatch(matchId).catch((err) => console.warn("Claim match API error:", err));
    addSystemLog({
      type: "MATCH",
      action: "Sala Reclamada por Árbitro",
      user: currentUser.nickname,
      details: `Árbitro ${currentUser.nickname} tomó la moderación de la sala (${matchId})`,
      status: "INFO",
    });
  };

  const unclaimMatch = (matchId: string) => {
    setRefereeMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              claimedByRefereeId: undefined,
              claimedByRefereeNick: undefined,
            }
          : m
      )
    );
    api.matches.unclaimMatch(matchId).catch((err) => console.warn("Unclaim match API error:", err));
  };

  const resolveMatchAsReferee = (matchId: string, winnerId: string, notes?: string) => {
    setRefereeMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          const winnerName = winnerId === m.participantA.id ? m.participantA.name : m.participantB.name;
          return {
            ...m,
            status: "COMPLETED",
            score: {
              scoreA: winnerId === m.participantA.id ? 2 : (m.score?.scoreA ?? 0),
              scoreB: winnerId === m.participantB.id ? 2 : (m.score?.scoreB ?? 0),
              winnerId,
              reportedBy: `REF_${currentUser.nickname}`,
              reportedAt: "Validado por Árbitro",
              disputeReason: notes || "Resultado certificado por arbitraje",
              evidenceUrls: m.score?.evidenceUrls || [],
            },
            disputeNotes: notes,
          };
        }
        return m;
      })
    );

    api.matches.resolveRefereeMatch(matchId, { winnerId, notes }).catch((err) => console.warn("Resolve match API error:", err));

    // Incrementar estadísticas del árbitro
    setReferees((prev) =>
      prev.map((r) =>
        r.nickname === currentUser.nickname || r.email === currentUser.email
          ? { ...r, matchesArbitrated: r.matchesArbitrated + 1 }
          : r
      )
    );

    addSystemLog({
      type: "MATCH",
      action: "Acta Arbitral Resuelta",
      user: currentUser.nickname,
      details: `Dictamen arbitral en match (${matchId}). Notas: ${notes || "Sin observaciones"}`,
      status: "SUCCESS",
    });
  };

  const applyWalkOverAsReferee = (matchId: string, winnerId: string, absentParticipantName: string) => {
    const woNotes = `W.O. Reglamentario: Se aplicó tolerancia de 15 minutos por inasistencia de ${absentParticipantName}.`;
    resolveMatchAsReferee(matchId, winnerId, woNotes);
  };

  // --- Sincronización Inicial con Backend REST & Base de Datos PostgreSQL ---
  useEffect(() => {
    async function loadBackendData() {
      // 1. Cargar Perfil de usuario si hay token
      const token = localStorage.getItem("toprival_token");
      if (token) {
        try {
          const profile = await api.auth.getProfile();
          if (profile) {
            setCurrentUser(profile);
            setCurrentRole(profile.role);
            setIsAuthenticated(true);
          }
        } catch {
          // Fallback controlado si el token expiró
        }
      }

      // 2. Cargar Torneos de PostgreSQL
      try {
        const backendTourneys = await api.tournaments.getAll();
        if (backendTourneys && backendTourneys.length > 0) {
          setTournaments(backendTourneys);
          setSelectedTournamentId(backendTourneys[0].id);
        }
      } catch {
        // Mantener INITIAL_TOURNAMENTS si el backend no está disponible
      }

      // 3. Cargar Solicitudes Comunitarias
      try {
        const backendRequests = await api.requests.getAll();
        if (backendRequests && backendRequests.length > 0) {
          setTournamentRequests(backendRequests);
        }
      } catch {
        // Mantener INITIAL_REQUESTS
      }

      // 4. Cargar Equipo
      try {
        const team = await api.teams.getMyTeam();
        if (team) {
          setMyTeam(team);
        }
      } catch {
        // Mantener INITIAL_TEAM
      }

      // 5. Cargar Referees
      try {
        const backendRefs = await api.referees.getAll();
        if (backendRefs && backendRefs.length > 0) {
          setReferees(backendRefs);
        }
      } catch {
        // Mantener INITIAL_REFEREES
      }

      // 6. Cargar Partidas Arbitrales
      try {
        const backendMatches = await api.matches.getRefereeMatches();
        if (backendMatches && backendMatches.length > 0) {
          setRefereeMatches(backendMatches);
          setCurrentMatch(backendMatches[0]);
        }
      } catch {
        // Mantener INITIAL_REFEREE_MATCHES
      }

      // 7. Cargar Logs de Auditoría
      try {
        const backendLogs = await api.system.getLogs();
        if (backendLogs && backendLogs.length > 0) {
          setSystemLogs(backendLogs);
        }
      } catch {
        // Mantener INITIAL_LOGS
      }

      // 8. Cargar Notificaciones
      try {
        const backendNotifs = await api.system.getNotifications();
        if (backendNotifs && backendNotifs.length > 0) {
          setSystemNotifications(backendNotifs);
        }
      } catch {
        // Mantener INITIAL_NOTIFICATIONS
      }
    }

    loadBackendData();
  }, []);

  const login = (role: Role) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
  };

  const loginWithCredentials = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.auth.login({ email, passwordHash: password });
      if (res && res.token) {
        localStorage.setItem("toprival_token", res.token);
        setCurrentUser(res.user);
        setCurrentRole(res.user.role);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: "No se pudo obtener el token de acceso" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      return { success: false, message: msg };
    }
  };

  const registerWithCredentials = async (nick: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await api.auth.register({ email, nickname: nick, passwordHash: password });
      if (res && res.token) {
        localStorage.setItem("toprival_token", res.token);
        setCurrentUser(res.user);
        setCurrentRole(res.user.role);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: "No se pudo completar el registro" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al registrar usuario";
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem("toprival_token");
    setCurrentUser(INITIAL_USER);
    setCurrentRole("PLAYER");
    setIsAuthenticated(false);
  };

  const DEFAULT_TOURNAMENT: TournamentModel = {
    id: "none",
    title: "Sin torneos registrados",
    game: "FreeFire",
    gameIcon: "🔥",
    bannerImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&fit=crop&auto=format",
    status: "upcoming",
    format: "SINGLE_ELIMINATION",
    mode: "Eliminación Directa",
    isTeamBased: true,
    entryFee: "Gratis",
    prizePool: "$0 USD",
    prizeDistribution: [
      { place: "1er Lugar", amount: "$0 USD", percentage: 100 },
    ],
    currentParticipants: 0,
    maxParticipants: 16,
    minParticipants: 4,
    startDate: "Próximamente",
    startTime: "20:00 COT",
    rules: {
      matchCheckInMinutes: 15,
      evidenceRequired: true,
      format: "SINGLE_ELIMINATION",
      seriesType: "Bo1",
      rulesText: "Reglamento estándar TopRival.",
      schedule: {
        registrationStart: "Próximamente",
        registrationEnd: "Próximamente",
        tournamentStart: "Próximamente",
      },
    },
    registeredTeamsOrPlayers: [],
  };

  const selectedTournament =
    tournaments.find((t) => t.id === selectedTournamentId) || tournaments[0] || DEFAULT_TOURNAMENT;

  const updateTournamentStatus = (id: string, status: TournamentStatus) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const voteTournamentRequest = (requestId: string) => {
    // Llamada en segundo plano a la API de PostgreSQL
    api.requests.vote(requestId).catch((err) => console.warn("Vote API sync error:", err));

    // Optimistic UI update
    setTournamentRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const hasVoted = !req.hasVoted;
          return {
            ...req,
            hasVoted,
            currentVotes: hasVoted ? req.currentVotes + 1 : Math.max(0, req.currentVotes - 1),
          };
        }
        return req;
      })
    );
  };

  const createTournamentRequest = (
    data: Omit<TournamentRequest, "id" | "currentVotes" | "hasVoted" | "status">
  ) => {
    const newReq: TournamentRequest = {
      id: `req-${Date.now()}`,
      ...data,
      currentVotes: 1,
      hasVoted: true,
      status: "IN_REVIEW",
    };
    setTournamentRequests((prev) => [newReq, ...prev]);

    // Persistencia en Backend
    api.requests.create(data).catch((err) => console.warn("Create Request API sync error:", err));
  };

  const rejectTournamentRequest = (requestId: string) => {
    setTournamentRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const registerCurrentTeamToTournament = async (tournamentId: string) => {
    let success = false;
    const registrantId = myTeam?.id || currentUser?.id || "player-me";
    const registrantName = myTeam?.name || currentUser?.nickname || "Mi Escuadra";

    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          const already = t.registeredTeamsOrPlayers?.some(
            (p) => p.id === registrantId || p.name === registrantName || p.id === currentUser?.id || p.name === currentUser?.nickname
          );
          if (already) return t;
          success = true;
          return {
            ...t,
            currentParticipants: (t.currentParticipants || 0) + 1,
            registeredTeamsOrPlayers: [
              ...(t.registeredTeamsOrPlayers || []),
              {
                id: registrantId,
                name: registrantName,
                registeredAt: "Hoy",
                status: "CONFIRMED",
              },
            ],
          };
        }
        return t;
      })
    );

    try {
      await api.tournaments.registerTeamOrPlayer(tournamentId, registrantId);
    } catch (err) {
      console.warn("Tournament Registration API error:", err);
    }

    return success;
  };

  const createTournamentByAdmin = (newTourney: Partial<TournamentModel>) => {
    const fullTourney: TournamentModel = {
      id: `t-${Date.now()}`,
      title: newTourney.title || "Nuevo Torneo Oficial",
      game: newTourney.game || "Valorant",
      gameIcon: newTourney.gameIcon || "🎯",
      bannerImage: newTourney.bannerImage || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=300&fit=crop&auto=format",
      status: (newTourney.status as TournamentStatus) || "registration-open",
      format: newTourney.format || "SINGLE_ELIMINATION",
      mode: newTourney.mode || "5v5",
      isTeamBased: newTourney.isTeamBased ?? true,
      entryFee: newTourney.entryFee || "Gratis",
      prizePool: newTourney.prizePool || "500 USD",
      prizeDistribution: newTourney.prizeDistribution || [
        { place: "1er Lugar", amount: "350 USD", percentage: 70 },
        { place: "2do Lugar", amount: "150 USD", percentage: 30 },
      ],
      currentParticipants: newTourney.currentParticipants || 0,
      maxParticipants: newTourney.maxParticipants || 16,
      minParticipants: 8,
      startDate: newTourney.startDate || "28 Sep 2026",
      startTime: newTourney.startTime || "19:00 COT",
      rules: newTourney.rules || {
        matchCheckInMinutes: 15,
        evidenceRequired: true,
        format: "SINGLE_ELIMINATION",
        seriesType: "Bo1",
        rulesText: "Reglamento oficial TopRival.",
        schedule: {
          registrationStart: "Hoy",
          registrationEnd: "27 Sep 2026",
          tournamentStart: "28 Sep 2026",
        },
      },
      registeredTeamsOrPlayers: newTourney.registeredTeamsOrPlayers || [],
    };
    setTournaments((prev) => [fullTourney, ...prev]);
    setSelectedTournamentId(fullTourney.id);

    // Persistencia en Backend
    api.tournaments.createOfficialTournament(newTourney).catch((err) => console.warn("Admin create tournament API error:", err));
  };

  const updateTournamentByAdmin = (id: string, updates: Partial<TournamentModel>) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    api.tournaments.updateTournament(id, updates).catch((err) => console.warn("Update tournament API error:", err));
  };

  const deleteTournamentByAdmin = (id: string) => {
    setTournaments((prev) => prev.filter((t) => t.id !== id));
    if (selectedTournamentId === id) {
      const remaining = tournaments.filter((t) => t.id !== id);
      if (remaining.length > 0) setSelectedTournamentId(remaining[0].id);
    }
    api.tournaments.deleteTournament(id).catch((err) => console.warn("Delete tournament API error:", err));
  };

  const addTestParticipantToTournament = (tournamentId: string, participantName: string) => {
    if (!participantName.trim()) return;
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          const currentList = t.registeredTeamsOrPlayers || [];
          const updatedList = [
            ...currentList,
            {
              id: `test-p-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              name: participantName.trim(),
              registeredAt: "Ahora",
              status: "CONFIRMED" as const,
            },
          ];
          return {
            ...t,
            currentParticipants: updatedList.length,
            registeredTeamsOrPlayers: updatedList,
          };
        }
        return t;
      })
    );
  };

  const removeParticipantFromTournament = (tournamentId: string, participantId: string) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id === tournamentId) {
          const filtered = (t.registeredTeamsOrPlayers || []).filter((p) => p.id !== participantId);
          return {
            ...t,
            currentParticipants: filtered.length,
            registeredTeamsOrPlayers: filtered,
          };
        }
        return t;
      })
    );
  };

  const generateTournamentBracket = (tournamentId: string, seriesType: "Bo1" | "Bo3" | "Bo5" = "Bo3") => {
    const targetTournament = tournaments.find((t) => t.id === tournamentId);
    const rawNames = targetTournament?.registeredTeamsOrPlayers?.map((p) => p.name) || [];
    
    // Si no hay suficientes registrados, complementar con nombres competitivos
    const defaultSeeds = [
      currentUser.nickname || "TuNick",
      "Karmine Corp",
      "Alpha Squad",
      "Viper Kings",
      "Shadow Killers",
      "Furia LATAM",
      "Leviatán Esports",
      "KRÜ Gaming",
    ];

    const finalNames: string[] = [];
    for (let i = 0; i < 8; i++) {
      if (rawNames[i]) {
        finalNames.push(rawNames[i]);
      } else if (defaultSeeds[i]) {
        finalNames.push(defaultSeeds[i]);
      } else {
        finalNames.push(`Equipo Seed #${i + 1}`);
      }
    }

    const newBracket: BracketRound[] = [
      {
        label: "Cuartos de Final",
        matches: [
          {
            id: `q1-${tournamentId}`,
            roundIndex: 0,
            matchIndex: 0,
            p1: { name: finalNames[0], isCurrentUser: finalNames[0] === currentUser.nickname, score: 0 },
            p2: { name: finalNames[7], isCurrentUser: finalNames[7] === currentUser.nickname, score: 0 },
            status: "live",
          },
          {
            id: `q2-${tournamentId}`,
            roundIndex: 0,
            matchIndex: 1,
            p1: { name: finalNames[3], isCurrentUser: finalNames[3] === currentUser.nickname, score: 0 },
            p2: { name: finalNames[4], isCurrentUser: finalNames[4] === currentUser.nickname, score: 0 },
            status: "live",
          },
          {
            id: `q3-${tournamentId}`,
            roundIndex: 0,
            matchIndex: 2,
            p1: { name: finalNames[1], isCurrentUser: finalNames[1] === currentUser.nickname, score: 0 },
            p2: { name: finalNames[6], isCurrentUser: finalNames[6] === currentUser.nickname, score: 0 },
            status: "live",
          },
          {
            id: `q4-${tournamentId}`,
            roundIndex: 0,
            matchIndex: 3,
            p1: { name: finalNames[2], isCurrentUser: finalNames[2] === currentUser.nickname, score: 0 },
            p2: { name: finalNames[5], isCurrentUser: finalNames[5] === currentUser.nickname, score: 0 },
            status: "live",
          },
        ],
      },
      {
        label: "Semifinales",
        matches: [
          {
            id: `s1-${tournamentId}`,
            roundIndex: 1,
            matchIndex: 0,
            p1: { name: "TBD" },
            p2: { name: "TBD" },
            status: "pending",
          },
          {
            id: `s2-${tournamentId}`,
            roundIndex: 1,
            matchIndex: 1,
            p1: { name: "TBD" },
            p2: { name: "TBD" },
            status: "pending",
          },
        ],
      },
      {
        label: "Gran Final",
        matches: [
          {
            id: `f1-${tournamentId}`,
            roundIndex: 2,
            matchIndex: 0,
            p1: { name: "TBD" },
            p2: { name: "TBD" },
            status: "pending",
          },
        ],
      },
    ];

    setBracketData(newBracket);
    // Cambiar estado a En Vivo si estaba en inscripciones
    updateTournamentByAdmin(tournamentId, {
      status: "live",
      rules: {
        ...(targetTournament?.rules || {
          matchCheckInMinutes: 15,
          evidenceRequired: true,
          format: "SINGLE_ELIMINATION",
          schedule: { registrationStart: "Hoy", registrationEnd: "Hoy", tournamentStart: "Hoy" },
        }),
        seriesType,
        format: "SINGLE_ELIMINATION",
        rulesText: targetTournament?.rules?.rulesText || `Reglamento oficial TopRival (${seriesType}).`,
      },
    });
  };

  const advanceBracketMatch = (
    roundIdx: number,
    matchIdx: number,
    winnerName: string,
    scoreWinner: number,
    scoreLoser: number
  ) => {
    setBracketData((prev) => {
      const next = JSON.parse(JSON.stringify(prev)) as BracketRound[];
      const match = next[roundIdx]?.matches[matchIdx];
      if (!match) return prev;

      match.status = "completed";
      if (match.p1) {
        match.p1.winner = match.p1.name === winnerName;
        match.p1.score = match.p1.winner ? scoreWinner : scoreLoser;
      }
      if (match.p2) {
        match.p2.winner = match.p2.name === winnerName;
        match.p2.score = match.p2.winner ? scoreWinner : scoreLoser;
      }

      const nextRound = next[roundIdx + 1];
      if (nextRound) {
        const nextMatchIdx = Math.floor(matchIdx / 2);
        const nextMatch = nextRound.matches[nextMatchIdx];
        if (nextMatch) {
          const isSlotP1 = matchIdx % 2 === 0;
          const newParticipant: BracketParticipant = {
            name: winnerName,
            isCurrentUser: winnerName === currentUser.nickname,
          };
          if (isSlotP1) {
            nextMatch.p1 = newParticipant;
          } else {
            nextMatch.p2 = newParticipant;
          }

          if (nextMatch.p1 && nextMatch.p2 && nextMatch.p1.name !== "TBD" && nextMatch.p2.name !== "TBD") {
            nextMatch.status = "live";
          }
        }
      }
      return next;
    });
  };

  const resetBracket = () => {
    setBracketData(INITIAL_BRACKET);
  };

  const reportMatchResult = (scoreA: number, scoreB: number, evidenceUrl: string) => {
    const winnerName = scoreA > scoreB ? currentMatch.participantA.name : currentMatch.participantB.name;
    const winnerId = scoreA > scoreB ? currentMatch.participantA.id : currentMatch.participantB.id;
    const scoreWinner = Math.max(scoreA, scoreB);
    const scoreLoser = Math.min(scoreA, scoreB);

    setCurrentMatch((prev) => ({
      ...prev,
      status: "WAITING_CONFIRMATION",
      score: {
        scoreA,
        scoreB,
        winnerId,
        reportedBy: currentUser.nickname,
        reportedAt: "Hace un momento",
        evidenceUrls: evidenceUrl ? [evidenceUrl] : ["https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&fit=crop&auto=format"],
      },
    }));

    api.matches.reportResult(currentMatch.id, {
      scoreA,
      scoreB,
      evidenceUrl,
      notes: `Reportado por ${currentUser.nickname}`,
    }).catch((err) => console.warn("Match report API error:", err));

    advanceBracketMatch(1, 0, winnerName, scoreWinner, scoreLoser);
  };

  const resolveDispute = (winnerId: string, notes?: string) => {
    const winnerName = winnerId === currentMatch.participantA.id ? currentMatch.participantA.name : currentMatch.participantB.name;
    setCurrentMatch((prev) => ({
      ...prev,
      status: "COMPLETED",
      score: {
        scoreA: winnerId === prev.participantA.id ? 2 : 0,
        scoreB: winnerId === prev.participantB.id ? 2 : 0,
        winnerId,
        reportedBy: "ADMIN_RESOLVED",
        reportedAt: "Resuelto por Administrador",
        disputeReason: notes || "Disputa arbitrada por panel oficial",
      },
    }));

    api.matches.resolveDispute(currentMatch.id, {
      winnerId,
      adminNotes: notes || "Disputa resuelta por panel oficial",
    }).catch((err) => console.warn("Resolve dispute API error:", err));

    advanceBracketMatch(1, 0, winnerName, 2, 0);
  };

  const updateUserNickname = (newNick: string) => {
    if (!newNick.trim()) return;
    const cleanNick = newNick.trim();
    setCurrentUser((prev) => ({ ...prev, nickname: cleanNick }));

    // Sincronizar directamente con PostgreSQL vía API REST
    api.auth.updateProfile({ nickname: cleanNick }).catch((err) => console.warn("Sync nickname error:", err));
  };

  const updateUserProfile = (profileData: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...profileData }));

    // Sincronizar directamente con PostgreSQL vía API REST
    api.auth.updateProfile(profileData).catch((err) => console.warn("Sync profile error:", err));
  };

  const removeTeamMember = (userId: string): boolean => {
    // Verificar si el equipo está confirmado en un torneo activo (regla de roster bloqueado)
    const isLockedInTournament = tournaments.some(
      (t) => (t.status === "live" || t.status === "registration-open") &&
             t.registeredTeamsOrPlayers?.some((p) => p.id === myTeam?.id)
    );

    if (isLockedInTournament) {
      return false; // Roster bloqueado
    }

    setMyTeam((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        members: prev.members.filter((m) => m.userId !== userId),
      };
    });
    return true;
  };

  const createOrJoinTeam = (teamData: Partial<Team>) => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: teamData.name || "Nuevo Clan",
      tag: teamData.tag || "TOP",
      captainId: currentUser.id,
      game: teamData.game || "FreeFire",
      stats: {
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        points: 100,
      },
      members: [
        {
          userId: currentUser.id,
          nickname: currentUser.nickname,
          role: "CAPTAIN",
          inGameName: currentUser.nickname,
          joinedAt: "Hoy",
        },
      ],
      ...teamData,
    };
    setMyTeam(newTeam);
  };

  const leaveClan = (): boolean => {
    // Verificar si el equipo está confirmado en un torneo activo (regla de roster bloqueado)
    const isLockedInTournament = tournaments.some(
      (t) => (t.status === "live" || t.status === "registration-open") &&
             t.registeredTeamsOrPlayers?.some((p) => p.id === myTeam?.id)
    );

    if (isLockedInTournament) {
      return false; // Roster bloqueado
    }

    setMyTeam({
      id: `solo-${currentUser.id}`,
      name: "Lobo Solitario",
      tag: "SOLO",
      captainId: currentUser.id,
      game: "FreeFire",
      stats: {
        tournamentsPlayed: 0,
        tournamentsWon: 0,
        points: 100,
      },
      members: [
        {
          userId: currentUser.id,
          nickname: currentUser.nickname,
          role: "CAPTAIN",
          inGameName: currentUser.nickname,
          joinedAt: "Hoy",
        },
      ],
    });
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        setCurrentRole,
        isAuthenticated,
        login,
        loginWithCredentials,
        registerWithCredentials,
        logout,
        tournaments,
        selectedTournament,
        setSelectedTournamentId,
        updateTournamentStatus,
        myTeam,
        tournamentRequests,
        voteTournamentRequest,
        createTournamentRequest,
        rejectTournamentRequest,
        registerCurrentTeamToTournament,
        createTournamentByAdmin,
        updateTournamentByAdmin,
        deleteTournamentByAdmin,
        addTestParticipantToTournament,
        removeParticipantFromTournament,
        generateTournamentBracket,
        currentMatch,
        reportMatchResult,
        resolveDispute,
        bracketData,
        advanceBracketMatch,
        resetBracket,
        updateUserNickname,
        updateUserProfile,
        removeTeamMember,
        createOrJoinTeam,
        leaveClan,
        systemLogs,
        addSystemLog,
        systemNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteTournamentRequest,
        referees,
        createReferee,
        toggleRefereeStatus,
        refereeMatches,
        claimMatch,
        unclaimMatch,
        resolveMatchAsReferee,
        applyWalkOverAsReferee,
        showAlert,
        showConfirm,
        showPrompt,
        lastPaymentReceipt,
        setLastPaymentReceipt,
      }}
    >
      {children}
      <ModalDialog config={modalConfig} onClose={closeModal} />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
