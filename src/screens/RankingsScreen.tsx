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

const INDIVIDUAL_RANKINGS: IndividualRankItem[] = [
  {
    rank: 1,
    name: "AlphaSniper",
    game: "FreeFire",
    points: 1250,
    wins: 18,
    games: 22,
    wr: 82,
    prize: "$650 USD",
  },
  {
    rank: 2,
    name: "ViperKing",
    game: "FreeFire",
    points: 1120,
    wins: 15,
    games: 20,
    wr: 75,
    prize: "$400 USD",
  },
  {
    rank: 3,
    name: "TitanPrime",
    game: "Valorant",
    points: 980,
    wins: 14,
    games: 19,
    wr: 74,
    prize: "$300 USD",
  },
  {
    rank: 4,
    name: "GhostRider",
    game: "CODMobile",
    points: 870,
    wins: 12,
    games: 18,
    wr: 67,
    prize: "$200 USD",
  },
  {
    rank: 5,
    name: "DeltaForce",
    game: "Warzone",
    points: 810,
    wins: 10,
    games: 16,
    wr: 63,
    prize: "$150 USD",
  },
  {
    rank: 6,
    name: "StrikerGol",
    game: "FC Mobile",
    points: 740,
    wins: 9,
    games: 15,
    wr: 60,
    prize: "$100 USD",
  },
];

const CLAN_RANKINGS: ClanRankItem[] = [
  {
    rank: 1,
    name: "Furia LATAM Esports",
    tag: "FURL",
    game: "FreeFire",
    points: 3450,
    tournamentsWon: 5,
    members: 6,
    prize: "$1,800 USD",
  },
  {
    rank: 2,
    name: "Valiant Titans",
    tag: "VLNT",
    game: "Valorant",
    points: 2980,
    tournamentsWon: 4,
    members: 5,
    prize: "$1,200 USD",
  },
  {
    rank: 3,
    name: "Shadow Syndicate",
    tag: "SHDW",
    game: "CODMobile",
    points: 2640,
    tournamentsWon: 3,
    members: 5,
    prize: "$900 USD",
  },
  {
    rank: 4,
    name: "Leviatán Academy",
    tag: "LEV",
    game: "Valorant",
    points: 2150,
    tournamentsWon: 2,
    members: 6,
    prize: "$600 USD",
  },
];

const SQUAD_RANKINGS: SquadRankItem[] = [
  {
    rank: 1,
    name: "Escuadra Alfa FreeFire",
    tournamentName: "Copa Apertura FreeFire Squads",
    game: "FreeFire",
    captain: "AlphaSniper",
    points: 890,
    matchesWon: 8,
    prize: "$500 USD",
  },
  {
    rank: 2,
    name: "Playoffs Rush Masters",
    tournamentName: "FreeFire Masters LATAM - Playoffs",
    game: "FreeFire",
    captain: "RushGod",
    points: 760,
    matchesWon: 6,
    prize: "$350 USD",
  },
  {
    rank: 3,
    name: "Warzone Havoc Squad",
    tournamentName: "TopRival Championship 2026",
    game: "Warzone",
    captain: "DeltaForce",
    points: 680,
    matchesWon: 5,
    prize: "$250 USD",
  },
];

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
  const { currentUser, myTeam, currentRole, isAuthenticated, tournaments, referees, showAlert } = useApp();
  const [rankingType, setRankingType] = useState<"individual" | "clans" | "squads">("individual");
  const [selectedGame, setSelectedGame] = useState("Todos los juegos");
  const [showAdminMetrics, setShowAdminMetrics] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<{
    type: "individual" | "clans" | "squads";
    data: any;
  } | null>(null);

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
                          onClick={() => setSelectedDetailItem({ type: "individual", data: player })}
                          className={`${player.isCurrentUser ? "bg-[#D4860A]/10 font-medium" : "hover:bg-[#18181B]/50"} transition-colors cursor-pointer`}
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
                          onClick={() => setSelectedDetailItem({ type: "clans", data: clan })}
                          className={`${clan.isCurrentClan ? "bg-[#D4860A]/10 font-medium" : "hover:bg-[#18181B]/50"} transition-colors cursor-pointer`}
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
                          onClick={() => setSelectedDetailItem({ type: "squads", data: sq })}
                          className={`${sq.isCurrentSquad ? "bg-[#D4860A]/10 font-medium" : "hover:bg-[#18181B]/50"} transition-colors cursor-pointer`}
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

      {/* Modal de Detalle Competitivo Interactivo */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-[#27272A] rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-3">
                {selectedDetailItem.type === "individual" ? (
                  <Avatar name={selectedDetailItem.data.name} size={44} />
                ) : selectedDetailItem.type === "clans" ? (
                  <div className="w-11 h-11 rounded-xl bg-[#18181B] border border-[#D4860A] flex items-center justify-center font-bold text-sm text-[#D4860A]">
                    {selectedDetailItem.data.tag}
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-[#18181B] border border-[#3B82F6] flex items-center justify-center text-2xl">
                    ⚔️
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-[#FAFAFA] flex items-center gap-2">
                    {selectedDetailItem.data.name}
                    <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#D4860A]/15 text-[#D4860A]">
                      #{selectedDetailItem.data.rank}
                    </span>
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    {selectedDetailItem.type === "individual"
                      ? `Perfil de Jugador · ${selectedDetailItem.data.game}`
                      : selectedDetailItem.type === "clans"
                      ? `Clan Oficial · Tag: [${selectedDetailItem.data.tag}]`
                      : `Escuadra · Torneo: ${selectedDetailItem.data.tournamentName}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="text-[#71717A] hover:text-[#FAFAFA] font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stats Breakdown */}
            <div className="grid grid-cols-3 gap-2 bg-[#18181B] p-3 rounded-xl border border-[#27272A] text-center">
              <div>
                <span className="text-[10px] text-[#71717A] uppercase font-semibold block">Puntos TR</span>
                <span className="text-base font-bold font-mono text-[#F5B830]">{selectedDetailItem.data.points}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#71717A] uppercase font-semibold block">
                  {selectedDetailItem.type === "clans" ? "Títulos" : "Victorias"}
                </span>
                <span className="text-base font-bold font-mono text-[#22C55E]">
                  {selectedDetailItem.type === "clans"
                    ? selectedDetailItem.data.tournamentsWon
                    : selectedDetailItem.type === "squads"
                    ? selectedDetailItem.data.matchesWon
                    : selectedDetailItem.data.wins}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#71717A] uppercase font-semibold block">Premios</span>
                <span className="text-base font-bold font-mono text-[#FAFAFA]">{selectedDetailItem.data.prize}</span>
              </div>
            </div>

            <div className="p-3 bg-[#18181B]/60 rounded-xl border border-[#27272A] text-xs text-[#A1A1AA] space-y-1.5">
              <div className="flex justify-between">
                <span>Certificación Fair Play:</span>
                <span className="text-[#22C55E] font-semibold">✓ Verificado por TopRival</span>
              </div>
              <div className="flex justify-between">
                <span>Juego Principal:</span>
                <strong className="text-[#FAFAFA]">{selectedDetailItem.data.game}</strong>
              </div>
              {selectedDetailItem.type === "individual" && (
                <div className="flex justify-between">
                  <span>Win Rate Oficial:</span>
                  <strong className="text-[#22C55E]">{selectedDetailItem.data.wr}%</strong>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="px-4 py-2 rounded-lg bg-[#27272A] text-xs font-semibold text-[#FAFAFA] hover:bg-[#3F3F46] transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RankingsScreen;
