import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Badge, Card, Avatar } from "../components/ui";

interface IndividualRankItem {
  rank: number;
  name: string;
  game: string;
  points: number;
  wins: number;
  games: number;
  wr: number;
  prize: string;
  isCurrentUser?: boolean;
}

interface ClanRankItem {
  rank: number;
  name: string;
  tag: string;
  game: string;
  points: number;
  tournamentsWon: number;
  members: number;
  prize: string;
  isCurrentClan?: boolean;
}

interface SquadRankItem {
  rank: number;
  name: string;
  tournamentName: string;
  game: string;
  captain: string;
  points: number;
  matchesWon: number;
  prize: string;
  isCurrentSquad?: boolean;
}

const INDIVIDUAL_RANKINGS: IndividualRankItem[] = [];
const CLAN_RANKINGS: ClanRankItem[] = [];
const SQUAD_RANKINGS: SquadRankItem[] = [];

const GAMES_LIST = [
  "Todos los juegos",
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

export function RankingsScreen() {
  const { currentUser, myTeam, currentRole, isAuthenticated, tournaments, referees } = useApp();
  const [rankingType, setRankingType] = useState<"individual" | "clans" | "squads">("individual");
  const [selectedGame, setSelectedGame] = useState("Todos los juegos");
  const [showAdminMetrics, setShowAdminMetrics] = useState(false);

  const isAdmin = isAuthenticated && currentRole === "ADMIN";

  // Usuario individual real
  const userRankData: IndividualRankItem | null =
    currentUser && currentUser.nickname !== "Invitado" && (currentUser.points || 0) > 0
      ? {
          rank: 1,
          name: currentUser.nickname,
          game: "Multijuego",
          points: currentUser.points || 0,
          wins: currentUser.stats?.tournamentsWon || 0,
          games: currentUser.stats?.matchesPlayed || 0,
          wr: currentUser.stats?.winRate || 0,
          prize: "$0",
          isCurrentUser: true,
        }
      : null;

  // Clan real
  const clanRankData: ClanRankItem | null =
    myTeam && myTeam.id !== "clan-solo" && (myTeam.stats?.points || 0) > 0
      ? {
          rank: 1,
          name: myTeam.name,
          tag: myTeam.tag,
          game: myTeam.game,
          points: myTeam.stats?.points || 0,
          tournamentsWon: myTeam.stats?.tournamentsWon || 0,
          members: myTeam.members.length,
          prize: "$0",
          isCurrentClan: true,
        }
      : null;

  const currentIndividualList = [
    ...INDIVIDUAL_RANKINGS.filter((p) => selectedGame === "Todos los juegos" || p.game === selectedGame),
    ...(userRankData && (selectedGame === "Todos los juegos" || userRankData.game === selectedGame) ? [userRankData] : []),
  ]
    .sort((a, b) => b.points - a.points)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const currentClanList = [
    ...CLAN_RANKINGS.filter((c) => selectedGame === "Todos los juegos" || c.game === selectedGame),
    ...(clanRankData && (selectedGame === "Todos los juegos" || clanRankData.game === selectedGame) ? [clanRankData] : []),
  ]
    .sort((a, b) => b.points - a.points)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const currentSquadList = SQUAD_RANKINGS.filter(
    (s) => selectedGame === "Todos los juegos" || s.game === selectedGame
  )
    .sort((a, b) => b.points - a.points)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  const activeListLength =
    rankingType === "individual"
      ? currentIndividualList.length
      : rankingType === "clans"
      ? currentClanList.length
      : currentSquadList.length;

  return (
    <div className="min-h-screen bg-[#09090B] pb-20">
      {/* Header */}
      <div className="bg-[#111113] border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-[#D4860A]/10 text-[#D4860A] border border-[#D4860A]/20">
                  🏆 TopRival Leaderboards
                </span>
                <span className="text-xs text-[#71717A]">
                  • Clasificación Global & ELO Competitivo
                </span>
              </div>
              <h1 className="text-2xl font-bold text-[#FAFAFA]">Tabla de Posiciones</h1>
              <p className="text-[#71717A] text-sm mt-1">Clasificación competitiva por Puntos TR (TopRival Points) · Temporada Oficial</p>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => setShowAdminMetrics(!showAdminMetrics)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs font-semibold text-[#FAFAFA] hover:border-[#D4860A] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  📊 {showAdminMetrics ? "Ocultar Métricas" : "Métricas Fair Play"}
                </button>
              )}

              {/* 3 Separate Ranking Type Tabs */}
              <div className="flex bg-[#18181B] p-1 rounded-xl border border-[#27272A] overflow-x-auto">
                <button
                  onClick={() => setRankingType("individual")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    rankingType === "individual"
                      ? "bg-[#D4860A] text-white"
                      : "text-[#71717A] hover:text-[#FAFAFA]"
                  }`}
                >
                  👤 Individual
                </button>
                <button
                  onClick={() => setRankingType("clans")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    rankingType === "clans"
                      ? "bg-[#D4860A] text-white"
                      : "text-[#71717A] hover:text-[#FAFAFA]"
                  }`}
                >
                  🏰 Clanes
                </button>
                <button
                  onClick={() => setRankingType("squads")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                    rankingType === "squads"
                      ? "bg-[#D4860A] text-white"
                      : "text-[#71717A] hover:text-[#FAFAFA]"
                  }`}
                >
                  ⚔️ Escuadras
                </button>
              </div>
            </div>
          </div>

          {/* Admin Fair Play & Performance Analytics Section */}
          {isAdmin && showAdminMetrics && (
            <div className="mt-5 pt-4 border-t border-[#27272A] animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D4860A]">
                  🛡️ Monitor de Integridad Competitiva & Distribución de Puntos
                </span>
                <span className="text-[11px] text-[#71717A]">Base de datos: Sincronizada</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#18181B] p-3 rounded-xl border border-[#27272A] space-y-1">
                  <span className="text-[#A1A1AA] font-semibold block">Win Rate Circuito</span>
                  <div className="text-lg font-bold font-mono text-[#FAFAFA]">
                    {currentUser?.stats?.winRate ? `${currentUser.stats.winRate}%` : "0% (Sin partidas)"}
                  </div>
                  <p className="text-[#71717A] text-[10px]">
                    Calculado en tiempo real desde las actas arbitrales certificadas.
                  </p>
                </div>

                <div className="bg-[#18181B] p-3 rounded-xl border border-[#27272A] space-y-1">
                  <span className="text-[#A1A1AA] font-semibold block">Integridad de Cuentas</span>
                  <div className="text-lg font-bold font-mono text-[#22C55E]">
                    {(currentUser && currentUser.nickname !== "Invitado" ? 1 : 0) + (referees?.length || 0)} Verificadas
                  </div>
                  <p className="text-[#71717A] text-[10px]">
                    Cuentas activas y validadas contra registros oficiales de BD.
                  </p>
                </div>

                <div className="bg-[#18181B] p-3 rounded-xl border border-[#27272A] space-y-1">
                  <span className="text-[#A1A1AA] font-semibold block">Bolsa Total Asignada</span>
                  <div className="text-lg font-bold font-mono text-[#F5B830]">
                    ${tournaments.reduce((acc, t) => acc + (parseInt(t.prizePool?.replace(/[^0-9]/g, "") || "0") || 0), 0).toLocaleString()} USD
                  </div>
                  <p className="text-[#71717A] text-[10px]">
                    Bolsa total comprometida en torneos oficiales registrados.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Game Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {GAMES_LIST.map((game) => (
              <button
                key={game}
                onClick={() => setSelectedGame(game)}
                className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors cursor-pointer font-medium ${
                  selectedGame === game
                    ? "bg-[#27272A] text-[#F5B830] border border-[#D4860A]/40"
                    : "bg-[#18181B] text-[#71717A] hover:text-[#FAFAFA] border border-[#27272A]"
                }`}
              >
                {game}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {activeListLength === 0 ? (
          <div className="py-16 text-center text-[#71717A] bg-[#111113] rounded-2xl border border-[#27272A] p-8">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-base font-bold text-[#FAFAFA] mb-1">Sin clasificaciones registradas</h3>
            <p className="text-xs text-[#71717A] max-w-md mx-auto leading-relaxed">
              Aún no se han completado partidas oficiales en esta categoría. Los puntos TR, estadísticas y tablas de posiciones se actualizarán automáticamente con los dictámenes de las actas arbitrales.
            </p>
          </div>
        ) : (
          <>
            {/* Podium Top */}
            {rankingType === "individual" && currentIndividualList.length > 0 && (
              <div className={`grid ${currentIndividualList.length >= 3 ? "grid-cols-3" : currentIndividualList.length === 2 ? "grid-cols-2" : "grid-cols-1 max-w-xs mx-auto"} gap-3`}>
                {currentIndividualList.slice(0, 3).map((player, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <Card
                      key={player.name + i}
                      className={`flex flex-col items-center justify-end p-4 ${
                        i === 0 ? "border-[#F59E0B]/40 bg-[#F59E0B]/5 shadow-[0_0_20px_#F59E0B15]" : ""
                      }`}
                    >
                      <span className="text-2xl mb-1">{medals[i]}</span>
                      <Avatar name={player.name} size={i === 0 ? 36 : 28} />
                      <div className="text-xs font-semibold text-[#FAFAFA] mt-1 truncate w-full text-center">
                        {player.name} {player.isCurrentUser && "(Tú)"}
                      </div>
                      <div className="text-[10px] text-[#F5B830] font-bold font-mono">{player.points} pts TR</div>
                    </Card>
                  );
                })}
              </div>
            )}

            {rankingType === "clans" && currentClanList.length > 0 && (
              <div className={`grid ${currentClanList.length >= 3 ? "grid-cols-3" : currentClanList.length === 2 ? "grid-cols-2" : "grid-cols-1 max-w-xs mx-auto"} gap-3`}>
                {currentClanList.slice(0, 3).map((clan, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <Card
                      key={clan.name + i}
                      className={`flex flex-col items-center justify-end p-4 ${
                        i === 0 ? "border-[#F59E0B]/40 bg-[#F59E0B]/5 shadow-[0_0_20px_#F59E0B15]" : ""
                      }`}
                    >
                      <span className="text-2xl mb-1">{medals[i]}</span>
                      <div className="w-8 h-8 rounded-lg bg-[#18181B] border border-[#D4860A] flex items-center justify-center font-bold text-xs text-[#D4860A]">
                        {clan.tag}
                      </div>
                      <div className="text-xs font-semibold text-[#FAFAFA] mt-1 truncate w-full text-center">
                        {clan.name} {clan.isCurrentClan && "(Tu Clan)"}
                      </div>
                      <div className="text-[10px] text-[#22C55E] font-bold font-mono">{clan.points} pts TR</div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Rankings Table */}
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#18181B] border-b border-[#27272A] text-xs text-[#71717A] uppercase">
                    <tr>
                      <th className="p-3.5">#</th>
                      <th className="p-3.5">
                        {rankingType === "individual" ? "Jugador" : rankingType === "clans" ? "Clan Oficial" : "Escuadra / Equipo"}
                      </th>
                      <th className="p-3.5">{rankingType === "squads" ? "Torneo" : "Juego"}</th>
                      <th className="p-3.5 text-center">Puntos TR</th>
                      <th className="p-3.5 text-center">
                        {rankingType === "individual" ? "Victorias" : rankingType === "clans" ? "Títulos Ganados" : "Partidas Ganadas"}
                      </th>
                      <th className="p-3.5 text-right">Premios</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A]">
                    {rankingType === "individual" &&
                      currentIndividualList.map((player) => (
                        <tr
                          key={player.name}
                          className={player.isCurrentUser ? "bg-[#D4860A]/10 font-medium" : "hover:bg-[#18181B]/50 transition-colors"}
                        >
                          <td className="p-3.5 font-bold font-mono text-xs">
                            {player.rank === 1 ? "🥇 1" : player.rank === 2 ? "🥈 2" : player.rank === 3 ? "🥉 3" : `#${player.rank}`}
                          </td>
                          <td className="p-3.5 flex items-center gap-2">
                            <Avatar name={player.name} size={28} />
                            <span className={player.isCurrentUser ? "text-[#F5B830] font-bold" : "text-[#FAFAFA]"}>
                              {player.name} {player.isCurrentUser && "(Tú)"}
                            </span>
                          </td>
                          <td className="p-3.5 text-xs text-[#A1A1AA]">{player.game}</td>
                          <td className="p-3.5 text-center font-mono font-bold text-[#F5B830]">{player.points} pts</td>
                          <td className="p-3.5 text-center font-mono text-[#22C55E]">{player.wins} W ({player.wr}%)</td>
                          <td className="p-3.5 text-right font-mono font-semibold text-[#FAFAFA]">{player.prize}</td>
                        </tr>
                      ))}

                    {rankingType === "clans" &&
                      currentClanList.map((clan) => (
                        <tr
                          key={clan.name}
                          className={clan.isCurrentClan ? "bg-[#D4860A]/10 font-medium" : "hover:bg-[#18181B]/50 transition-colors"}
                        >
                          <td className="p-3.5 font-bold font-mono text-xs">
                            {clan.rank === 1 ? "🥇 1" : clan.rank === 2 ? "🥈 2" : clan.rank === 3 ? "🥉 3" : `#${clan.rank}`}
                          </td>
                          <td className="p-3.5 flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-[#18181B] border border-[#D4860A]/50 flex items-center justify-center font-bold text-[10px] text-[#D4860A]">
                              {clan.tag}
                            </div>
                            <span className={clan.isCurrentClan ? "text-[#F5B830] font-bold" : "text-[#FAFAFA]"}>
                              {clan.name} {clan.isCurrentClan && "(Tu Clan)"}
                            </span>
                          </td>
                          <td className="p-3.5 text-xs text-[#A1A1AA]">{clan.game}</td>
                          <td className="p-3.5 text-center font-mono font-bold text-[#22C55E]">{clan.points} pts</td>
                          <td className="p-3.5 text-center font-mono text-[#F5B830]">{clan.tournamentsWon} Títulos</td>
                          <td className="p-3.5 text-right font-mono font-semibold text-[#FAFAFA]">{clan.prize}</td>
                        </tr>
                      ))}

                    {rankingType === "squads" &&
                      currentSquadList.map((sq) => (
                        <tr
                          key={sq.name}
                          className={sq.isCurrentSquad ? "bg-[#D4860A]/10 font-medium" : "hover:bg-[#18181B]/50 transition-colors"}
                        >
                          <td className="p-3.5 font-bold font-mono text-xs">
                            {sq.rank === 1 ? "🥇 1" : sq.rank === 2 ? "🥈 2" : sq.rank === 3 ? "🥉 3" : `#${sq.rank}`}
                          </td>
                          <td className="p-3.5 flex items-center gap-2">
                            <span className="text-base">⚔️</span>
                            <div>
                              <span className={sq.isCurrentSquad ? "text-[#F5B830] font-bold" : "text-[#FAFAFA]"}>
                                {sq.name} {sq.isCurrentSquad && "(Tu Escuadra)"}
                              </span>
                              <span className="text-[10px] text-[#71717A] block">Capitán: {sq.captain}</span>
                            </div>
                          </td>
                          <td className="p-3.5 text-xs text-[#A1A1AA]">{sq.tournamentName}</td>
                          <td className="p-3.5 text-center font-mono font-bold text-[#F5B830]">{sq.points} pts</td>
                          <td className="p-3.5 text-center font-mono text-[#22C55E]">{sq.matchesWon} Victorias</td>
                          <td className="p-3.5 text-right font-mono font-semibold text-[#FAFAFA]">{sq.prize}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default RankingsScreen;
