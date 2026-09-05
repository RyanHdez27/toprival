import {
  TournamentModel,
  TournamentRequest,
  Team,
  UserProfile,
  MatchModel,
  TournamentStatus,
  RefereeAccount,
  SystemLog,
  SystemNotification,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('toprival_token');
    const isFormData = options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(options.headers as Record<string, string>),
    };

    try {
      const response = await fetch(API_BASE_URL + endpoint, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error ' + response.status + ': ' + response.statusText);
      }

      return await response.json();
    } catch (error) {
      console.warn('[TopRival API] Fallback/Error on ' + endpoint + ':', error);
      throw error;
    }
  }

  // --- Auth & Users (CU-01, CU-02) ---
  auth = {
    login: (credentials: { email: string; passwordHash: string }) =>
      this.request<{ token: string; user: UserProfile }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: { email: string; nickname: string; passwordHash: string }) =>
      this.request<{ token: string; user: UserProfile }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getProfile: () => this.request<UserProfile>('/users/me'),
    updateProfile: (data: Partial<UserProfile>) =>
      this.request<UserProfile>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };

  // --- Tournaments (CU-04, CU-05, CU-11) ---
  tournaments = {
    getAll: (params?: { game?: string; status?: TournamentStatus }) => {
      const query = new URLSearchParams((params || {}) as Record<string, string>).toString();
      return this.request<TournamentModel[]>('/tournaments' + (query ? '?' + query : ''));
    },
    getById: (id: string) => this.request<TournamentModel>('/tournaments/' + id),
    registerTeamOrPlayer: (tournamentId: string, teamId?: string) =>
      this.request<{ success: boolean; registrationId: string }>('/tournaments/' + tournamentId + '/register', {
        method: 'POST',
        body: JSON.stringify({ teamId }),
      }),
    createOfficialTournament: (data: Partial<TournamentModel>) =>
      this.request<TournamentModel>('/admin/tournaments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateTournament: (id: string, updates: Partial<TournamentModel>) =>
      this.request<{ success: boolean }>('/admin/tournaments/' + id, {
        method: 'PUT',
        body: JSON.stringify(updates),
      }),
    deleteTournament: (id: string) =>
      this.request<{ success: boolean }>('/admin/tournaments/' + id, {
        method: 'DELETE',
      }),
    generateBrackets: (tournamentId: string) =>
      this.request<{ success: boolean }>('/admin/tournaments/' + tournamentId + '/generate-brackets', {
        method: 'POST',
      }),
  };

  // --- Community Requests & Voting (CU-14, CU-15) ---
  requests = {
    getAll: () => this.request<TournamentRequest[]>('/community/requests'),
    create: (data: Omit<TournamentRequest, 'id' | 'currentVotes' | 'hasVoted' | 'status'>) =>
      this.request<TournamentRequest>('/community/requests', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    delete: (requestId: string) =>
      this.request<{ success: boolean }>('/community/requests/' + requestId, {
        method: 'DELETE',
      }),
    vote: (requestId: string) =>
      this.request<{ success: boolean; newVotes: number }>('/community/requests/' + requestId + '/vote', {
        method: 'POST',
      }),
  };

  // --- Teams (CU-03) ---
  teams = {
    getMyTeam: () => this.request<Team>('/teams/me'),
    createTeam: (data: { name: string; tag: string; game: string }) =>
      this.request<Team>('/teams', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    invitePlayer: (teamId: string, emailOrNick: string) =>
      this.request<{ success: boolean }>('/teams/' + teamId + '/invites', {
        method: 'POST',
        body: JSON.stringify({ emailOrNick }),
      }),
  };

  // --- Referees & Arbitraje (Rol REF) ---
  referees = {
    getAll: () => this.request<RefereeAccount[]>('/referees'),
    create: (data: Omit<RefereeAccount, 'id' | 'matchesArbitrated' | 'createdAt'>) =>
      this.request<RefereeAccount>('/admin/referees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    toggleStatus: (id: string) =>
      this.request<{ success: boolean }>('/admin/referees/' + id + '/toggle', {
        method: 'PUT',
      }),
  };

  // --- Matches & Disputes (CU-06, CU-07, CU-12) ---
  matches = {
    getRefereeMatches: () => this.request<MatchModel[]>('/referee/matches'),
    getMatchById: (matchId: string) => this.request<MatchModel>('/matches/' + matchId),
    checkIn: (matchId: string) =>
      this.request<{ success: boolean }>('/matches/' + matchId + '/check-in', {
        method: 'POST',
      }),
    claimMatch: (matchId: string) =>
      this.request<{ success: boolean }>('/referee/matches/' + matchId + '/claim', {
        method: 'POST',
      }),
    unclaimMatch: (matchId: string) =>
      this.request<{ success: boolean }>('/referee/matches/' + matchId + '/unclaim', {
        method: 'POST',
      }),
    resolveRefereeMatch: (matchId: string, data: { winnerId: string; notes?: string; scoreA?: number; scoreB?: number }) =>
      this.request<{ success: boolean }>('/referee/matches/' + matchId + '/resolve', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    reportResult: (matchId: string, data: { scoreA: number; scoreB: number; evidenceUrl?: string; notes?: string }) =>
      this.request<{ success: boolean }>('/matches/' + matchId + '/report', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    uploadEvidence: (matchId: string, file: File) => {
      const formData = new FormData();
      formData.append('evidence', file);
      return this.request<{ success: boolean; evidenceUrl: string }>('/matches/' + matchId + '/evidence', {
        method: 'POST',
        body: formData,
      });
    },
    resolveDispute: (matchId: string, resolution: { winnerId: string; adminNotes: string }) =>
      this.request<{ success: boolean }>('/admin/matches/' + matchId + '/resolve', {
        method: 'POST',
        body: JSON.stringify(resolution),
      }),
  };

  // --- System Logs & Notificaciones ---
  system = {
    getLogs: () => this.request<SystemLog[]>('/system/logs'),
    createLog: (log: Omit<SystemLog, 'id' | 'timestamp'>) =>
      this.request<{ success: boolean }>('/system/logs', {
        method: 'POST',
        body: JSON.stringify(log),
      }),
    getNotifications: () => this.request<SystemNotification[]>('/system/notifications'),
  };

  // --- File Uploads (Screenshots, Banners, Avatars) ---
  upload = {
    image: (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return this.request<{ success: boolean; url: string; filename: string }>('/upload', {
        method: 'POST',
        body: formData,
      });
    },
  };

  // --- Pagos y Pasarela Wompi ---
  payments = {
    createIntent: (tournamentId: string, data: { teamId?: string; nick?: string; discord?: string }) =>
      this.request<{
        isFree: boolean;
        reference?: string;
        amountInCents?: number;
        amountFormatted?: string;
        currency?: string;
        publicKey?: string;
        signature?: string;
        tournament?: { id: string; title: string; game: string; entryFee: string };
        customer?: { email: string; fullName: string };
        message?: string;
      }>('/tournaments/' + tournamentId + '/payment-intent', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getStatus: (reference: string) =>
      this.request<{
        id: string;
        transaction_reference: string;
        status: string;
        amount_in_cents: number;
        currency: string;
        payment_method_type?: string;
        tournament_title?: string;
        registration_id?: string;
      }>('/payments/' + reference + '/status'),
    simulateSandboxApproval: (reference: string, paymentMethod: string = 'NEQUI') =>
      this.request<{
        success: boolean;
        status: string;
        reference: string;
        registrationId: string;
        message: string;
      }>('/payments/' + reference + '/simulate-sandbox-approval', {
        method: 'POST',
        body: JSON.stringify({ paymentMethod }),
      }),
  };
}

export const api = new ApiClient();
