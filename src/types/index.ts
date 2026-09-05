export type Role = "PLAYER" | "TEAM_CAPTAIN" | "MODERATOR" | "REFEREE" | "ADMIN";

export type TournamentStatus = "draft" | "registration-open" | "registration-closed" | "live" | "upcoming" | "paused" | "finished" | "cancelled";

export type TournamentFormat = "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION" | "ROUND_ROBIN" | "SWISS";

export type MatchStatus = "SCHEDULED" | "READY_TO_PLAY" | "IN_PROGRESS" | "WAITING_CONFIRMATION" | "DISPUTED" | "COMPLETED";

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatarUrl?: string;
  role: Role;
  country: string;
  discordTag?: string;
  points?: number;
  gameAccounts: {
    gameId: string;
    gameName: string;
    gameTag: string; // ej: Riot ID, Steam ID, EA ID
  }[];
  stats: {
    tournamentsPlayed: number;
    tournamentsWon: number;
    matchesPlayed: number;
    winRate: number;
    points: number;
  };
}

export interface TeamMember {
  userId: string;
  nickname: string;
  role: "CAPTAIN" | "MEMBER" | "SUBSTITUTE";
  joinedAt: string;
  inGameName: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  logoUrl?: string;
  captainId: string;
  game: string;
  members: TeamMember[];
  stats: {
    tournamentsPlayed: number;
    tournamentsWon: number;
    points: number;
  };
}

export interface TournamentRequest {
  id: string;
  game: string;
  gameIcon: string;
  mode: string;
  suggestedBy: string;
  suggestedDate: string;
  description: string;
  targetParticipants: number;
  currentVotes: number;
  hasVoted?: boolean;
  isAdminOfficial?: boolean;
  status: "IN_REVIEW" | "APPROVED" | "REJECTED" | "CONVERTED_TO_TOURNAMENT";
}

export interface TournamentRules {
  matchCheckInMinutes: number;
  evidenceRequired: boolean;
  format: TournamentFormat;
  seriesType: "Bo1" | "Bo3" | "Bo5";
  rulesText: string;
  schedule: {
    registrationStart: string;
    registrationEnd: string;
    tournamentStart: string;
  };
}

export interface TournamentModel {
  id: string;
  title: string;
  game: string;
  gameIcon: string;
  bannerImage: string;
  status: TournamentStatus;
  format: TournamentFormat;
  mode: string; // ej: 5v5, 1v1, 3v3
  isTeamBased: boolean;
  teamSize?: number;
  entryFee: string;
  prizePool: string;
  prizeDistribution: { place: string; amount: string; percentage: number }[];
  currentParticipants: number;
  maxParticipants: number;
  minParticipants: number;
  startDate: string;
  startTime: string;
  rules: TournamentRules;
  registeredTeamsOrPlayers: {
    id: string;
    name: string;
    logo?: string;
    registeredAt: string;
    status: "CONFIRMED" | "WAITLIST";
  }[];
}

export interface MatchScore {
  scoreA: number;
  scoreB: number;
  winnerId?: string;
  reportedBy?: string;
  reportedAt?: string;
  evidenceUrls?: string[];
  disputeReason?: string;
}

export interface MatchModel {
  id: string;
  tournamentId: string;
  roundName: string;
  roundIndex: number;
  game?: string;
  participantA: {
    id: string;
    name: string;
    logo?: string;
    checkedIn?: boolean;
    seed?: number;
  };
  participantB: {
    id: string;
    name: string;
    logo?: string;
    checkedIn?: boolean;
    seed?: number;
  };
  status: MatchStatus;
  scheduledTime: string;
  score?: MatchScore;
  claimedByRefereeId?: string;
  claimedByRefereeNick?: string;
  disputeNotes?: string;
}

export interface SystemLog {
  id: string;
  type: "AUTH" | "TOURNAMENT" | "MATCH" | "COMMUNITY" | "USER" | "SECURITY";
  action: string;
  user: string;
  details: string;
  timestamp: string;
  status: "SUCCESS" | "WARNING" | "ERROR" | "INFO";
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "VOTE" | "MATCH" | "DISPUTE" | "REGISTRATION" | "SYSTEM";
  linkScreen?: string;
}

export interface RefereeAccount {
  id: string;
  nickname: string;
  email: string;
  assignedGame: string;
  status: "ACTIVE" | "INACTIVE";
  matchesArbitrated: number;
  createdAt: string;
  permissions?: {
    canEditBrackets?: boolean;
    canResolveDisputes?: boolean;
    canManageRooms?: boolean;
  };
}

export interface PaymentReceipt {
  reference: string;
  gateway: "WOMPI";
  amountFormatted: string;
  amountInCents: number;
  currency: string;
  paymentMethodType: string;
  status: "APPROVED" | "PENDING" | "DECLINED";
  tournamentTitle: string;
  customerName: string;
  paidAt: string;
  registrationId?: string;
}

