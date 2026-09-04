import { useApp } from "../context/AppContext";
import { Avatar, Badge } from "./ui";

interface BracketParticipant {
  name: string;
  score?: number;
  winner?: boolean;
  isCurrentUser?: boolean;
  bye?: boolean;
}

interface BracketMatch {
  id: string;
  roundIndex: number;
  matchIndex: number;
  p1?: BracketParticipant;
  p2?: BracketParticipant;
  status: "pending" | "live" | "completed" | "bye";
}

interface BracketRound {
  label: string;
  matches: BracketMatch[];
}

function BracketSlot({
  participant,
  showScore,
  onClick,
}: {
  participant?: BracketParticipant;
  showScore?: boolean;
  onClick?: () => void;
}) {
  if (!participant || participant.name === "TBD" || participant.name === "???") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-[#0D0D0F] rounded border border-dashed border-[#3F3F46]">
        <div className="w-6 h-6 rounded-full bg-[#27272A]" />
        <span className="text-xs text-[#52525B] font-mono">TBD</span>
      </div>
    );
  }

  if (participant.bye) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-[#D4860A]/10 rounded border border-[#D4860A]/20">
        <span className="text-xs text-[#F5B830] font-mono tracking-widest">BYE</span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between gap-2 px-3 py-2 rounded border transition-all cursor-pointer ${
        participant.isCurrentUser
          ? "bg-[#D4860A]/15 border-[#D4860A]/40 hover:border-[#D4860A]"
          : participant.winner
          ? "bg-[#22C55E]/10 border-[#22C55E]/25 hover:border-[#22C55E]/50"
          : "bg-[#18181B] border-[#27272A] hover:border-[#3F3F46]"
      }`}
    >
      <div className="flex items-center gap-2">
        <Avatar name={participant.name} size={22} />
        <span
          className={`text-xs font-medium ${
            participant.isCurrentUser
              ? "text-[#F5B830]"
              : participant.winner
              ? "text-[#22C55E]"
              : "text-[#A1A1AA]"
          }`}
        >
          {participant.name}
          {participant.isCurrentUser && (
            <span className="ml-1 text-[9px] text-[#71717A]">★</span>
          )}
        </span>
      </div>
      {showScore && participant.score !== undefined && (
        <span
          className={`font-mono font-bold text-sm ${
            participant.winner ? "text-[#22C55E]" : "text-[#52525B]"
          }`}
        >
          {participant.score}
        </span>
      )}
    </div>
  );
}

function BracketMatchCell({
  match,
  onSelectWinner,
}: {
  match: BracketMatch;
  onSelectWinner?: (winnerName: string) => void;
}) {
  const isLive = match.status === "live";
  const showScore = match.status === "completed" || match.status === "live";

  return (
    <div
      className={`relative rounded-xl border p-2 w-52 shrink-0 ${
        isLive
          ? "border-[#EF4444]/40 shadow-[0_0_20px_#EF444420]"
          : "border-[#27272A]"
      } bg-[#111113]`}
    >
      {isLive && (
        <div className="absolute -top-2.5 left-3">
          <Badge variant="live">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] inline-block" />
            En Vivo
          </Badge>
        </div>
      )}
      <div className="space-y-1.5">
        <BracketSlot
          participant={match.p1}
          showScore={showScore}
          onClick={() => {
            if (match.p1 && match.p2 && match.p1.name !== "TBD" && match.p2.name !== "TBD" && onSelectWinner) {
              onSelectWinner(match.p1.name);
            }
          }}
        />
        <div className="flex items-center gap-2 px-2">
          <div className="flex-1 h-px bg-[#27272A]" />
          <span className="text-[9px] font-mono text-[#52525B] tracking-widest">VS</span>
          <div className="flex-1 h-px bg-[#27272A]" />
        </div>
        <BracketSlot
          participant={match.p2}
          showScore={showScore}
          onClick={() => {
            if (match.p1 && match.p2 && match.p1.name !== "TBD" && match.p2.name !== "TBD" && onSelectWinner) {
              onSelectWinner(match.p2.name);
            }
          }}
        />
      </div>
    </div>
  );
}

export function Bracket() {
  const { bracketData, advanceBracketMatch } = useApp();

  if (bracketData.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-[#71717A]">
        <div className="text-3xl mb-2">⚔️</div>
        <p className="font-bold text-[#FAFAFA] text-sm mb-1">El bracket aún no ha sido generado</p>
        <p className="max-w-md mx-auto">
          El administrador o árbitro oficial generará el árbol de enfrentamientos una vez finalice el periodo de inscripciones.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="text-xs text-[#71717A]">
          🏆 <span className="text-[#A1A1AA]">Llave Oficial:</span> Los resultados se actualizan automáticamente al validar cada partida.
        </div>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-8 min-w-max items-start pt-4">
          {bracketData.map((round, ri) => {
            const gapClass =
              ri === 0
                ? "gap-4"
                : ri === 1
                ? "gap-24"
                : "gap-56";
            return (
              <div key={round.label} className="flex flex-col items-center">
                <div className="mb-6 px-4 py-1 rounded-full bg-[#18181B] border border-[#27272A]">
                  <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                    {round.label}
                  </span>
                </div>
                <div className={`flex flex-col ${gapClass}`}>
                  {round.matches.map((match, mi) => (
                    <div
                      key={match.id}
                      className="flex items-center"
                      style={{
                        marginTop:
                          ri === 1
                            ? "56px"
                            : ri === 2
                            ? "132px"
                            : "0",
                      }}
                    >
                      <BracketMatchCell
                        match={match}
                        onSelectWinner={(winnerName) =>
                          advanceBracketMatch(ri, mi, winnerName, 2, 0)
                        }
                      />
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
    </div>
  );
}
