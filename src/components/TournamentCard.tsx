import { useApp } from "../context/AppContext";
import { Badge, Button, Icon } from "./ui";

type TournamentStatus =
  | "upcoming"
  | "registration-open"
  | "live"
  | "registration-closed"
  | "paused"
  | "finished"
  | "cancelled";

export interface Tournament {
  id: string;
  game: string;
  gameIcon: string;
  name: string;
  status: TournamentStatus;
  mode: string;
  prize: string;
  participants: number;
  maxParticipants: number;
  date: string;
  time: string;
  image?: string;
}

const statusConfig: Record<
  TournamentStatus,
  { label: string; variant: "success" | "warning" | "live" | "muted" | "danger" | "info" | "primary" }
> = {
  upcoming: { label: "Próximamente", variant: "info" },
  "registration-open": { label: "Inscripciones Abiertas", variant: "success" },
  live: { label: "En Vivo", variant: "live" },
  "registration-closed": { label: "Inscripciones Cerradas", variant: "muted" },
  paused: { label: "Torneo Pausado", variant: "warning" },
  finished: { label: "Finalizado", variant: "muted" },
  cancelled: { label: "Cancelado", variant: "danger" },
};

const ctaLabel: Record<TournamentStatus, string | null> = {
  upcoming: "Ver Detalles",
  "registration-open": "Inscribirme",
  live: "Ver Bracket",
  "registration-closed": "Ver Bracket",
  paused: "Ver Detalles",
  finished: "Ver Resultados",
  cancelled: null,
};

export function TournamentCard({
  tournament,
  onClick,
}: {
  tournament: any;
  onClick?: () => void;
}) {
  const { currentRole, isAuthenticated } = useApp();
  const status = tournament.status || "registration-open";
  const { label, variant } = statusConfig[status as TournamentStatus] || { label: status, variant: "default" };
  let cta = ctaLabel[status as TournamentStatus] || "Ver Torneo";
  if (isAuthenticated && currentRole === "ADMIN") {
    cta = status === "live" ? "⚙️ Gestionar Brackets" : "⚙️ Administrar Torneo";
  } else if (isAuthenticated && currentRole === "REFEREE") {
    cta = status === "live" ? "⚖️ Monitorear Salas" : status === "finished" ? "Ver Resultados" : "Ver Información";
  }
  const participants = tournament.currentParticipants ?? tournament.participants ?? 0;
  const maxParticipants = tournament.maxParticipants ?? 16;
  const title = tournament.title || tournament.name;
  const fillPct = Math.round((participants / maxParticipants) * 100);
  const lastSlot = fillPct >= 90;

  return (
    <div
      onClick={onClick}
      className="group bg-[#111113] border border-[#27272A] rounded-xl overflow-hidden hover:border-[#3F3F46] transition-all duration-200 cursor-pointer hover:shadow-[0_0_30px_#D4860A11]"
    >
      {/* Game banner */}
      <div className="relative h-28 bg-gradient-to-br from-[#18181B] to-[#0D0D0F] overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${tournament.image || `https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=112&fit=crop&auto=format`})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-lg">{tournament.gameIcon}</span>
          <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
            {tournament.game}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant={variant}>
            {tournament.status === "live" && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] inline-block" />
            )}
            {label}
          </Badge>
        </div>
        {lastSlot && tournament.status === "registration-open" && (
          <div className="absolute bottom-3 right-3">
            <Badge variant="warning">
              <Icon.AlertTriangle />
              Último cupo
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-[#FAFAFA] text-base leading-tight mb-1 group-hover:text-[#F5B830] transition-colors">
          {title}
        </h3>
        <p className="text-xs text-[#71717A] mb-3 font-medium uppercase tracking-wide">
          {tournament.mode}
        </p>

        {/* Prize & Entry Fee */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <Icon.Trophy />
            <span className="text-[#F5B830] font-bold text-lg">
              {tournament.prizePool || tournament.prize || "$0 USD"}
            </span>
          </div>
          {tournament.entryFee && !["gratis", "free", "$0", "0"].includes(String(tournament.entryFee).toLowerCase().trim()) ? (
            <Badge variant="primary" className="text-[10px]">
              💳 {tournament.entryFee}
            </Badge>
          ) : (
            <Badge variant="muted" className="text-[10px]">
              Entrada Gratis
            </Badge>
          )}
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
          <div className="flex items-center gap-1.5 text-[#71717A]">
            <Icon.Calendar />
            <span>{tournament.startDate || tournament.date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#71717A]">
            <Icon.Clock />
            <span>{tournament.startTime || tournament.time}</span>
          </div>
        </div>

        {/* Participants bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-[#71717A] flex items-center gap-1">
              <Icon.Users />
              Participantes
            </span>
            <span className="text-xs font-mono text-[#A1A1AA]">
              {participants}/{maxParticipants}
            </span>
          </div>
          <div className="h-1.5 bg-[#27272A] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                lastSlot ? "bg-[#F59E0B]" : "bg-[#D4860A]"
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        {cta && (
          <Button
            variant={tournament.status === "registration-open" ? "primary" : "outline"}
            size="sm"
            fullWidth
          >
            {cta}
          </Button>
        )}
      </div>
    </div>
  );
}
