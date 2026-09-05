import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { Icon, Avatar, Badge, Button } from "./ui";

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
  | "confirmation"
  | "settings";

export function Navbar({
  screen,
  onNavigate,
  isAuthenticated,
}: {
  screen: any;
  onNavigate: (s: any) => void;
  isAuthenticated: boolean;
}) {
  const { currentRole, currentUser, logout, systemNotifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const unreadCount = systemNotifications.filter((n) => !n.read).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const publicLinks: { label: string; screen: Screen; badge?: string }[] = isAuthenticated
    ? currentRole === "ADMIN"
      ? [
          { label: "Inicio", screen: "home" },
          { label: "Torneos", screen: "tournaments" },
          { label: "Votaciones", screen: "requests", badge: "Comunidad" },
          { label: "Rankings", screen: "rankings" },
        ]
      : currentRole === "REFEREE"
      ? [
          { label: "Inicio", screen: "home" },
          { label: "Torneos", screen: "tournaments" },
          { label: "Rankings", screen: "rankings" },
        ]
      : [
          { label: "Inicio", screen: "home" },
          { label: "Torneos", screen: "tournaments" },
          { label: "Votaciones", screen: "requests", badge: "Comunidad" },
          { label: "Mi Equipo", screen: "team" },
          { label: "Rankings", screen: "rankings" },
        ]
    : [
        { label: "Inicio", screen: "home" },
        { label: "Torneos", screen: "tournaments" },
        { label: "Rankings", screen: "rankings" },
      ];

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    onNavigate("home");
  };

  return (
    <header className="sticky top-0 z-50 bg-[#09090B]/90 backdrop-blur-md border-b border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <img
            src="/android-chrome-192x192.png"
            alt="TopRival logo"
            className="w-7 h-7 rounded-lg object-contain"
          />
          <span className="font-bold text-base tracking-tight text-[#FAFAFA]">
            Top<span className="text-[#D4860A]">Rival</span>
          </span>
        </button>

        {/* Nav links — desktop */}
        <nav className="hidden md:flex items-center gap-1">
          {publicLinks.map((link) => (
            <button
              key={link.screen}
              onClick={() => onNavigate(link.screen)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                screen === link.screen
                  ? "text-[#FAFAFA] bg-[#18181B]"
                  : "text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#18181B]"
              }`}
            >
              {link.label}
              {link.badge && (
                <span className="text-[10px] px-1.5 py-0.2 bg-[#D4860A]/20 text-[#D4860A] rounded font-semibold">
                  {link.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Notifications Popover */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`relative p-2 rounded-md transition-colors cursor-pointer ${
                    notificationsOpen ? "text-[#FAFAFA] bg-[#18181B]" : "text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#18181B]"
                  }`}
                  title="Notificaciones"
                >
                  <Icon.Bell />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full animate-pulse ring-2 ring-[#09090B]" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#111113] border border-[#27272A] rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 pb-2 border-b border-[#27272A] flex justify-between items-center">
                      <span className="text-xs font-bold text-[#FAFAFA] uppercase tracking-wider">Centro de Notificaciones</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <span className="text-[10px] text-[#D4860A] font-semibold bg-[#D4860A]/10 px-1.5 py-0.5 rounded">
                            {unreadCount} nuevas
                          </span>
                        )}
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-[10px] text-[#71717A] hover:text-[#FAFAFA] cursor-pointer"
                        >
                          Marcar leídas
                        </button>
                      </div>
                    </div>

                    <div className="divide-y divide-[#27272A] max-h-80 overflow-y-auto">
                      {systemNotifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-[#71717A]">No hay notificaciones pendientes.</div>
                      ) : (
                        systemNotifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3.5 transition-colors cursor-pointer ${
                              !n.read ? "bg-[#18181B]/80 hover:bg-[#18181B]" : "hover:bg-[#18181B]/40 opacity-80"
                            }`}
                            onClick={() => {
                              markNotificationAsRead(n.id);
                              if (n.linkScreen) {
                                onNavigate(n.linkScreen);
                                setNotificationsOpen(false);
                              }
                            }}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <span className={`text-xs font-bold ${!n.read ? "text-[#FAFAFA]" : "text-[#A1A1AA]"}`}>
                                {n.title}
                              </span>
                              <span className="text-[9px] font-mono text-[#71717A]">{n.timestamp}</span>
                            </div>
                            <p className="text-xs text-[#A1A1AA] leading-relaxed mb-1.5">{n.message}</p>
                            <span className="text-[10px] font-semibold text-[#D4860A] flex items-center gap-1">
                              Ver detalles →
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar + Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#18181B] transition-colors cursor-pointer"
                >
                  <Avatar name={currentUser?.nickname || "Gamer"} size={28} />
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <span className="text-sm font-medium text-[#FAFAFA]">
                      {currentUser?.nickname || "Gamer"}
                    </span>
                    <span className="text-[10px] text-[#D4860A] font-semibold">
                      {currentRole === "ADMIN" ? "SUPER ADMIN" : currentRole === "REFEREE" ? "OFICIAL REFEREE" : currentRole === "TEAM_CAPTAIN" ? "CAPITÁN DE EQUIPO" : "JUGADOR (AGENTE LIBRE)"}
                    </span>
                  </div>
                  <span className={`text-xs text-[#71717A] transition-transform ${dropdownOpen ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#111113] border border-[#27272A] rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                    {/* Profile Summary Header */}
                    <div className="px-4 py-2 border-b border-[#27272A]">
                      <p className="text-xs font-semibold text-[#FAFAFA] truncate">
                        {currentUser?.nickname || "Gamer"}
                      </p>
                      <p className="text-[10px] text-[#71717A] truncate">
                        {currentUser?.email || "usuario@toprival.gg"}
                      </p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#D4860A]/15 text-[#D4860A] border border-[#D4860A]/30">
                        {currentRole === "ADMIN" ? "SUPER ADMIN" : currentRole === "REFEREE" ? "OFICIAL REFEREE STAFF" : currentRole === "TEAM_CAPTAIN" ? "CAPITÁN DE EQUIPO" : "JUGADOR"}
                      </span>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          onNavigate("dashboard");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#FAFAFA] hover:bg-[#18181B] flex items-center gap-2 transition-colors cursor-pointer font-medium"
                      >
                        <Icon.User />
                        {currentRole === "ADMIN" ? "📊 Dashboard Admin (Logs)" : currentRole === "REFEREE" ? "📊 Perfil & Métricas Arbitrales" : "Dashboard / Perfil"}
                      </button>

                      {currentRole !== "ADMIN" && currentRole !== "REFEREE" && (
                        <button
                          onClick={() => {
                            onNavigate("team");
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-[#FAFAFA] hover:bg-[#18181B] flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Icon.Shield />
                          Mi Equipo y Clan
                        </button>
                      )}

                      {(currentRole === "REFEREE" || currentRole === "ADMIN") && (
                        <button
                          onClick={() => {
                            onNavigate("referee");
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-[#D4860A] hover:bg-[#18181B] flex items-center gap-2 transition-colors cursor-pointer font-bold"
                        >
                          <Icon.Shield />
                          Panel Arbitral (REF)
                        </button>
                      )}

                      {currentRole === "ADMIN" && (
                        <button
                          onClick={() => {
                            onNavigate("admin");
                            setDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-[#EF4444] hover:bg-[#18181B] flex items-center gap-2 transition-colors cursor-pointer font-bold"
                        >
                          <Icon.Shield />
                          Panel de Administración
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onNavigate("settings");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-[#A1A1AA] hover:bg-[#18181B] hover:text-[#FAFAFA] flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Icon.Settings />
                        {currentRole === "ADMIN" ? "⚙️ Configuración & Referees" : currentRole === "REFEREE" ? "⚙️ Ajustes de Cuenta" : "Configuración y Ajustes"}
                      </button>
                    </div>

                    <div className="border-t border-[#27272A] pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Icon.LogOut />
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate("login")}
                className="px-3 py-1.5 text-sm text-[#71717A] hover:text-[#FAFAFA] transition-colors cursor-pointer font-medium"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => onNavigate("register")}
                className="px-3 py-1.5 text-sm font-medium bg-[#D4860A] hover:bg-[#BF7509] text-white rounded-md transition-colors cursor-pointer"
              >
                Registrarse
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#09090B]/95 backdrop-blur-md border-t border-[#27272A] z-50">
        <div className="flex">
          {(isAuthenticated
            ? currentRole === "ADMIN"
              ? [
                  { icon: <Icon.Home />, label: "Inicio", screen: "home" as Screen },
                  { icon: <Icon.Swords />, label: "Torneos", screen: "tournaments" as Screen },
                  { icon: <Icon.Flag />, label: "Votaciones", screen: "requests" as Screen },
                  { icon: <Icon.BarChart />, label: "Ranking", screen: "rankings" as Screen },
                  { icon: <Icon.User />, label: "Dashboard", screen: "dashboard" as Screen },
                ]
              : currentRole === "REFEREE"
              ? [
                  { icon: <Icon.Home />, label: "Inicio", screen: "home" as Screen },
                  { icon: <Icon.Swords />, label: "Torneos", screen: "tournaments" as Screen },
                  { icon: <Icon.BarChart />, label: "Ranking", screen: "rankings" as Screen },
                  { icon: <Icon.User />, label: "Dashboard", screen: "dashboard" as Screen },
                  { icon: <Icon.Settings />, label: "Ajustes", screen: "settings" as Screen },
                ]
              : [
                  { icon: <Icon.Home />, label: "Inicio", screen: "home" as Screen },
                  { icon: <Icon.Swords />, label: "Torneos", screen: "tournaments" as Screen },
                  { icon: <Icon.Shield />, label: "Equipo", screen: "team" as Screen },
                  { icon: <Icon.BarChart />, label: "Ranking", screen: "rankings" as Screen },
                  { icon: <Icon.User />, label: "Perfil", screen: "dashboard" as Screen },
                ]
            : [
                { icon: <Icon.Home />, label: "Inicio", screen: "home" as Screen },
                { icon: <Icon.Swords />, label: "Torneos", screen: "tournaments" as Screen },
                { icon: <Icon.BarChart />, label: "Ranking", screen: "rankings" as Screen },
                { icon: <Icon.User />, label: "Login", screen: "login" as Screen },
              ]
          ).map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.screen)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors cursor-pointer ${
                screen === item.screen
                  ? "text-[#D4860A]"
                  : "text-[#52525B]"
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
