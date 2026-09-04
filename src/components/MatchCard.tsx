import { Badge, Avatar, Icon } from "./ui";

type MatchStatus =
  | "pending"
  | "scheduled"
  | "live"
  | "result-pending"
  | "disputed"
  | "completed"
  | "bye";

export interface Match {
  id: string;
  round: string;
  player1: { name: string; avatar?: string; score?: number; winner?: boolean };
  player2?: { name: string; avatar?: string; score?: number; winner?: boolean };
  status: MatchStatus;
  scheduledAt?: string;
}

const statusConfig: Record<
  MatchStatus,
  { label: string; variant: "success" | "warning" | "live" | "muted" | "danger" | "info" | "primary" }
> = {
  pending: { label: "Pendiente", variant: "muted" },
  scheduled: { label: "Programado", variant: "info" },
  live: { label: "En Vivo", variant: "live" },
  "result-pending": { label: "Resultado Pendiente", variant: "warning" },
  disputed: { label: "En Disputa", variant: "danger" },
  completed: { label: "Completado", variant: "success" },
  bye: { label: "BYE / Avance Automático", variant: "primary" },
};

export function MatchCard({
  match,
  isCurrentUser,
  onClick,
}: {
  match: Match;
  isCurrentUser?: boolean;
  onClick?: () => void;
}) {
  const { label, variant } = statusConfig[match.status];
  const isBye = match.status === "bye";

  return (
    <div
      onClick={onClick}
      className={`bg-[#111113] border rounded-xl p-4 transition-all duration-200 ${
        isCurrentUser
          ? "border-[#D4860A]/50 shadow-[0_0_20px_#D4860A15]"
          : "border-[#27272A] hover:border-[#3F3F46]"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-[#71717A] uppercase tracking-wider">
          {match.round}
        </span>
        <Badge variant={variant}>
          {match.status === "live" && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] inline-block" />
          )}
          {label}
        </Badge>
      </div>

      {isBye ? (
        <div className="flex items-center gap-3 py-2">
          <Avatar name={match.player1.name} size={36} />
          <div>
            <div className="font-semibold text-[#FAFAFA]">
              {match.player1.name}
            </div>
            <div className="text-xs text-[#F5B830]">Avanza automáticamente</div>
          </div>
          <Icon.Zap />
        </div>
      ) : (
        <div className="space-y-2">
          {/* Player 1 */}
          <div
            className={`flex items-center justify-between p-2.5 rounded-lg ${
              match.player1.winner
                ? "bg-[#22C55E]/10 border border-[#22C55E]/20"
                : "bg-[#18181B]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {match.player1.winner && (
                <Icon.Check />
              )}
              <Avatar name={match.player1.name} size={28} />
              <span
                className={`text-sm font-medium ${
                  isCurrentUser
                    ? "text-[#F5B830]"
                    : match.player1.winner
                    ? "text-[#22C55E]"
                    : "text-[#FAFAFA]"
                }`}
              >
                {match.player1.name}
                {isCurrentUser && (
                  <span className="ml-1.5 text-[10px] text-[#71717A]">(tú)</span>
                )}
              </span>
            </div>
            {match.player1.score !== undefined && (
              <span
                className={`font-mono font-bold text-lg ${
                  match.player1.winner ? "text-[#22C55E]" : "text-[#FAFAFA]"
                }`}
              >
                {match.player1.score}
              </span>
            )}
          </div>

          {/* VS */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-[#27272A]" />
            <span className="text-[10px] font-mono text-[#52525B] tracking-widest">VS</span>
            <div className="flex-1 h-px bg-[#27272A]" />
          </div>

          {/* Player 2 */}
          {match.player2 && (
            <div
              className={`flex items-center justify-between p-2.5 rounded-lg ${
                match.player2.winner
                  ? "bg-[#22C55E]/10 border border-[#22C55E]/20"
                  : "bg-[#18181B]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {match.player2.winner && <Icon.Check />}
                <Avatar name={match.player2.name} size={28} />
                <span
                  className={`text-sm font-medium ${
                    match.player2.winner ? "text-[#22C55E]" : "text-[#FAFAFA]"
                  }`}
                >
                  {match.player2.name}
                </span>
              </div>
              {match.player2.score !== undefined && (
                <span
                  className={`font-mono font-bold text-lg ${
                    match.player2.winner ? "text-[#22C55E]" : "text-[#FAFAFA]"
                  }`}
                >
                  {match.player2.score}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {match.scheduledAt && match.status === "scheduled" && (
        <div className="mt-3 pt-3 border-t border-[#27272A] flex items-center gap-1.5 text-xs text-[#71717A]">
          <Icon.Clock />
          {match.scheduledAt}
        </div>
      )}
    </div>
  );
}
