import { Icon, Avatar, Divider } from "./ui";

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

const navItems: {
  icon: React.ReactNode;
  label: string;
  screen: Screen;
}[] = [
  { icon: <Icon.LayoutDashboard />, label: "Dashboard", screen: "dashboard" },
  { icon: <Icon.Swords />, label: "Torneos", screen: "tournaments" },
  { icon: <Icon.Users />, label: "Mi Equipo", screen: "team" },
  { icon: <Icon.Flag />, label: "Votaciones", screen: "requests" },
  { icon: <Icon.BarChart />, label: "Rankings", screen: "rankings" },
  { icon: <Icon.Shield />, label: "Panel Admin", screen: "admin" },
];

export function Sidebar({
  screen,
  onNavigate,
}: {
  screen: Screen;
  onNavigate: (s: Screen) => void;
}) {
  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-[#111113] border-r border-[#27272A] h-full">
      {/* Profile */}
      <div className="p-4 border-b border-[#27272A]">
        <div className="flex items-center gap-3">
          <Avatar name="TuNick" size={36} />
          <div className="min-w-0">
            <div className="font-semibold text-sm text-[#FAFAFA] truncate">
              TuNick
            </div>
            <div className="text-xs text-[#71717A]">Rank #47</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate(item.screen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 cursor-pointer ${
              screen === item.screen
                ? "bg-[#D4860A]/20 text-[#F5B830] border border-[#D4860A]/20"
                : "text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#18181B]"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
        <Divider className="my-2" />
        <button
          onClick={() => onNavigate("home")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#18181B] transition-all cursor-pointer"
        >
          <Icon.Settings />
          Configuración
        </button>
        <button
          onClick={() => onNavigate("home")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#71717A] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all cursor-pointer"
        >
          <Icon.LogOut />
          Cerrar Sesión
        </button>
      </nav>
    </aside>
  );
}
