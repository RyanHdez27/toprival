import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button, Badge, Icon, Tabs } from "../components/ui";
import { TournamentCard } from "../components/TournamentCard";

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
  | "confirmation";

const PLAYER_STATUS_TABS = ["Todos", "Inscripciones", "En Vivo", "Próximos", "Finalizados"];
const ADMIN_STATUS_TABS = ["Todos", "En Vivo", "Próximos", "Finalizados"];

const GAME_FILTERS = [
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

const ELIMINATION_TYPES = ["Todos los formatos", "Eliminación Simple", "Doble Eliminación", "Bo1", "Bo3", "Bo5"];
const GROUP_SIZES = ["Todos los tamaños", "Individual (1v1)", "Dúos (2v2)", "Tríos (3v3)", "Escuadras (4v4)", "Equipos 5v5"];

export function TournamentsScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { tournaments, setSelectedTournamentId, isAuthenticated, currentRole } = useApp();
  const [activeTab, setActiveTab] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [gameFilter, setGameFilter] = useState("Todos los juegos");
  const [eliminationFilter, setEliminationFilter] = useState("Todos los formatos");
  const [groupSizeFilter, setGroupSizeFilter] = useState("Todos los tamaños");
  const [showAnalytics, setShowAnalytics] = useState(false);

  const isAdmin = isAuthenticated && currentRole === "ADMIN";
  const isReferee = isAuthenticated && currentRole === "REFEREE";
  const statusTabs = (isAdmin || isReferee) ? ADMIN_STATUS_TABS : PLAYER_STATUS_TABS;

  const filtered = tournaments.filter((t) => {
    const matchesTab =
      activeTab === "Todos" ||
      (activeTab === "Inscripciones" && t.status === "registration-open") ||
      (activeTab === "En Vivo" && t.status === "live") ||
      (activeTab === "Próximos" && t.status === "upcoming") ||
      (activeTab === "Finalizados" && t.status === "finished");
    
    const matchesGame =
      gameFilter === "Todos los juegos" || t.game === gameFilter;
    
    const matchesElimination =
      eliminationFilter === "Todos los formatos" ||
      t.rules?.seriesType === eliminationFilter ||
      (eliminationFilter === "Eliminación Simple" && t.format === "SINGLE_ELIMINATION");

    const matchesGroup =
      groupSizeFilter === "Todos los tamaños" ||
      (groupSizeFilter === "Individual (1v1)" && (t.mode?.includes("1v1") || t.teamSize === 1)) ||
      (groupSizeFilter === "Dúos (2v2)" && (t.mode?.includes("2v2") || t.teamSize === 2)) ||
      (groupSizeFilter === "Tríos (3v3)" && (t.mode?.includes("3v3") || t.teamSize === 3)) ||
      (groupSizeFilter === "Escuadras (4v4)" && (t.mode?.includes("4v4") || t.teamSize === 4)) ||
      (groupSizeFilter === "Equipos 5v5" && (t.mode?.includes("5v5") || t.teamSize === 5));

    const matchesSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.game.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesGame && matchesElimination && matchesGroup && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#09090B] pb-20">
      {/* Page header */}
      <div className="bg-[#111113] border-b border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-[#FAFAFA]">Torneos</h1>
                {isAdmin && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
                    Modo Supervisión Admin
                  </span>
                )}
                {isReferee && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#D4860A]/15 text-[#D4860A] border border-[#D4860A]/30">
                    Modo Arbitral REF
                  </span>
                )}
              </div>
              <p className="text-[#71717A] text-sm">
                {tournaments.length} torneos registrados en el circuito competitivo
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  variant={showAnalytics ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                >
                  <Icon.BarChart />
                  {showAnalytics ? "Ocultar Analítica" : "📊 Analítica Histórica"}
                </Button>
              )}

              {isAdmin ? (
                <Button variant="primary" size="sm" onClick={() => onNavigate("admin")}>
                  <Icon.Shield /> Panel de Gestión
                </Button>
              ) : isReferee ? (
                <Button variant="primary" size="sm" onClick={() => onNavigate("referee" as any)}>
                  <Icon.Shield /> Consola Arbitral
                </Button>
              ) : (
                isAuthenticated && (
                  <Button variant="outline" size="sm" onClick={() => onNavigate("requests")}>
                    <Icon.Flag /> Solicitar torneo
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Search + advanced filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B]">
                <Icon.Search />
              </span>
              <input
                type="text"
                placeholder="Buscar torneo o juego..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#18181B] border border-[#27272A] rounded-lg text-xs text-[#FAFAFA] placeholder:text-[#52525B] focus:outline-none focus:border-[#D4860A] transition-colors"
              />
            </div>

            <select
              value={gameFilter}
              onChange={(e) => setGameFilter(e.target.value)}
              className="bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#A1A1AA] focus:outline-none focus:border-[#D4860A] transition-colors cursor-pointer"
            >
              {GAME_FILTERS.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>

            <select
              value={eliminationFilter}
              onChange={(e) => setEliminationFilter(e.target.value)}
              className="bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#A1A1AA] focus:outline-none focus:border-[#D4860A] transition-colors cursor-pointer"
            >
              {ELIMINATION_TYPES.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>

            <select
              value={groupSizeFilter}
              onChange={(e) => setGroupSizeFilter(e.target.value)}
              className="bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#A1A1AA] focus:outline-none focus:border-[#D4860A] transition-colors cursor-pointer"
            >
              {GROUP_SIZES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Historical Analytics Section for Admin */}
      {currentRole === "ADMIN" && showAnalytics && (
        <div className="bg-[#111113]/70 border-b border-[#27272A] py-6 animate-in fade-in slide-in-from-top-4">
          <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-[#FAFAFA] flex items-center gap-2">
                📈 Analítica Histórica & Desglose de Participación Competitiva
              </h2>
              <span className="text-xs text-[#71717A]">Base de datos: {tournaments.length} torneos registrados</span>
            </div>

            {tournaments.length === 0 ? (
              <div className="bg-[#18181B] p-8 rounded-xl border border-[#27272A] text-center text-xs text-[#71717A]">
                <div className="text-3xl mb-2">📊</div>
                <p className="font-bold text-[#FAFAFA] text-sm mb-1">Sin registros suficientes para generar analíticas</p>
                <p className="max-w-md mx-auto">
                  Aún no hay torneos completados en la base de datos. Los gráficos de distribución por videojuego, formatos de eliminación y modalidades de grupo se generarán en tiempo real.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A] space-y-3">
                  <span className="text-xs font-semibold text-[#A1A1AA] block">Distribución por Videojuego</span>
                  <div className="space-y-2 text-xs">
                    {Array.from(new Set(tournaments.map((t) => t.game))).map((g) => {
                      const count = tournaments.filter((t) => t.game === g).length;
                      const pct = Math.round((count / tournaments.length) * 100);
                      return (
                        <div key={g}>
                          <div className="flex justify-between text-[#FAFAFA] mb-1">
                            <span>{g}</span>
                            <strong className="font-mono text-[#D4860A]">
                              {pct}% ({count})
                            </strong>
                          </div>
                          <div className="w-full bg-[#27272A] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-[#D4860A] h-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A] space-y-3">
                  <span className="text-xs font-semibold text-[#A1A1AA] block">Formato de Eliminación & Series</span>
                  <div className="space-y-2 text-xs">
                    {["Bo1", "Bo3", "Bo5"].map((st) => {
                      const count = tournaments.filter((t) => t.rules?.seriesType === st).length;
                      const pct = Math.round((count / tournaments.length) * 100);
                      return (
                        <div key={st} className="flex justify-between py-1 border-b border-[#27272A]">
                          <span className="text-[#A1A1AA]">Series {st}:</span>
                          <strong className="text-[#FAFAFA]">
                            {pct}% ({count} torneos)
                          </strong>
                        </div>
                      );
                    })}
                    <div className="flex justify-between py-1">
                      <span className="text-[#A1A1AA]">Tasa de certificación arbitral:</span>
                      <strong className="text-[#22C55E]">100%</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-[#18181B] p-4 rounded-xl border border-[#27272A] space-y-3">
                  <span className="text-xs font-semibold text-[#A1A1AA] block">Modalidades de Grupo</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-[#27272A]">
                      <span className="text-[#A1A1AA]">Escuadras & Equipos (4v4 / 5v5):</span>
                      <strong className="text-[#FAFAFA]">
                        {Math.round((tournaments.filter((t) => (t.teamSize || 1) >= 4).length / tournaments.length) * 100)}%
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#27272A]">
                      <span className="text-[#A1A1AA]">Dúos & Tríos (2v2 / 3v3):</span>
                      <strong className="text-[#FAFAFA]">
                        {Math.round((tournaments.filter((t) => (t.teamSize || 1) === 2 || (t.teamSize || 1) === 3).length / tournaments.length) * 100)}%
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#27272A]">
                      <span className="text-[#A1A1AA]">Individuales (1v1):</span>
                      <strong className="text-[#FAFAFA]">
                        {Math.round((tournaments.filter((t) => (t.teamSize || 1) === 1).length / tournaments.length) * 100)}%
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#A1A1AA]">Torneos en Vivo:</span>
                      <strong className="text-[#F5B830]">
                        {tournaments.filter((t) => t.status === "live").length} activos
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs + grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {statusTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-[#D4860A] text-white"
                  : "text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#18181B]"
              }`}
            >
              {tab}
              {tab === "En Vivo" && (
                <span className="ml-2 w-1.5 h-1.5 rounded-full bg-[#EF4444] inline-block animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((t) => (
              <TournamentCard
                key={t.id}
                tournament={t}
                onClick={() => {
                  setSelectedTournamentId(t.id);
                  if (currentRole === "ADMIN") {
                    onNavigate("admin");
                  } else {
                    onNavigate("detail");
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#111113] rounded-2xl border border-[#27272A]">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-[#FAFAFA] font-semibold mb-1">Sin resultados</h3>
            <p className="text-[#71717A] text-sm">
              No hay torneos que coincidan con los filtros seleccionados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
