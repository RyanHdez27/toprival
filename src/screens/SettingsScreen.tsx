import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button, Card, Icon, Badge } from "../components/ui";

const OFFICIAL_GAMES = [
  "Todos los Juegos",
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

export function SettingsScreen({ onNavigate }: { onNavigate: (s: any) => void }) {
  const {
    currentUser,
    currentRole,
    isAuthenticated,
    updateUserProfile,
    updateUserNickname,
    systemLogs,
    referees,
    createReferee,
    toggleRefereeStatus,
    showAlert,
  } = useApp();

  const isAdmin = isAuthenticated && currentRole === "ADMIN";

  const [activeAdminTab, setActiveAdminTab] = useState<"profile" | "referees" | "auth_logs">("referees");

  // Profile states
  const [nickname, setNickname] = useState(currentUser?.nickname || "");
  const [discordTag, setDiscordTag] = useState(currentUser?.discordTag || "Admin#0001");
  const [country, setCountry] = useState(currentUser?.country || "Colombia");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; success: boolean } | null>(null);

  // New Referee Modal State
  const [showRefModal, setShowRefModal] = useState(false);
  const [refNick, setRefNick] = useState("");
  const [refEmail, setRefEmail] = useState("");
  const [refGame, setRefGame] = useState("FreeFire");
  const [canEditBrackets, setCanEditBrackets] = useState(true);
  const [canResolveDisputes, setCanResolveDisputes] = useState(true);
  const [canManageRooms, setCanManageRooms] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      updateUserNickname(nickname.trim());
    }
    updateUserProfile({
      discordTag,
      country,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg({ text: "La nueva contraseña debe tener al menos 6 caracteres.", success: false });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "Las contraseñas no coinciden.", success: false });
      return;
    }

    setPasswordMsg({ text: "✓ Contraseña actualizada correctamente.", success: true });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordMsg(null), 4000);
  };

  const handleCreateRefereeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refNick.trim() || !refEmail.trim()) return;

    createReferee({
      nickname: refNick.trim(),
      email: refEmail.trim(),
      assignedGame: refGame,
      status: "ACTIVE",
      permissions: {
        canEditBrackets,
        canResolveDisputes,
        canManageRooms,
      },
    });

    setRefNick("");
    setRefEmail("");
    setShowRefModal(false);
    showAlert("Árbitro Registrado", `¡Árbitro ${refNick} registrado exitosamente con permisos de gestión para ${refGame}!`, "success");
  };

  const authLogs = systemLogs.filter((l) => l.type === "AUTH" || l.type === "SECURITY");

  return (
    <div className="min-h-screen bg-[#09090B] pb-20">
      <div className="bg-[#111113] border-b border-[#27272A]">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          <button
            onClick={() => onNavigate(isAdmin ? "admin" : "dashboard")}
            className="flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#FAFAFA] mb-2 cursor-pointer transition-colors"
          >
            ← Volver al {isAdmin ? "Panel Admin" : "Dashboard"}
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-[#D4860A]/15 text-[#D4860A] border border-[#D4860A]/30">
                  {isAdmin ? "Configuración & Control de Staff" : "Ajustes de Usuario"}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-[#FAFAFA]">Configuración del Sistema</h1>
              <p className="text-[#71717A] text-sm mt-0.5">
                {isAdmin
                  ? "Gestión de árbitros (referees), auditoría de sesiones/errores y seguridad de cuenta."
                  : "Gestiona tu perfil competitivo, cuentas de juego y seguridad"}
              </p>
            </div>

            {isAdmin && (
              <div className="flex gap-1.5 bg-[#18181B] p-1 rounded-xl border border-[#27272A]">
                <button
                  onClick={() => setActiveAdminTab("referees")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeAdminTab === "referees" ? "bg-[#D4860A] text-white" : "text-[#71717A] hover:text-[#FAFAFA]"
                  }`}
                >
                  🛡️ Árbitros / Referees
                </button>
                <button
                  onClick={() => setActiveAdminTab("auth_logs")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeAdminTab === "auth_logs" ? "bg-[#D4860A] text-white" : "text-[#71717A] hover:text-[#FAFAFA]"
                  }`}
                >
                  🔐 Errores & Sesiones
                </button>
                <button
                  onClick={() => setActiveAdminTab("profile")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    activeAdminTab === "profile" ? "bg-[#D4860A] text-white" : "text-[#71717A] hover:text-[#FAFAFA]"
                  }`}
                >
                  👤 Mi Cuenta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {savedSuccess && (
          <div className="p-3 bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] rounded-xl text-sm font-semibold text-center animate-in fade-in">
            ✓ ¡Ajustes guardados con éxito!
          </div>
        )}

        {/* ADMIN TAB 1: GESTIÓN DE REFEREES / ÁRBITROS */}
        {isAdmin && activeAdminTab === "referees" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#FAFAFA] flex items-center gap-2">
                  <Icon.Shield /> Cuerpo Arbitral y Moderadores Auxiliares
                </h2>
                <p className="text-xs text-[#71717A]">
                  Los referees tienen facultades para gestionar brackets, salas y resolver actas de disputas sin permisos de alteración estructural.
                </p>
              </div>

              <Button variant="primary" size="sm" onClick={() => setShowRefModal(true)}>
                <Icon.Plus /> + Crear Nuevo Referee
              </Button>
            </div>

            <Card className="overflow-hidden border-[#27272A]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18181B] text-[#71717A] font-bold uppercase tracking-wider border-b border-[#27272A]">
                    <tr>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Árbitro</th>
                      <th className="py-3 px-4">Email / Contacto</th>
                      <th className="py-3 px-4">Juego Asignado</th>
                      <th className="py-3 px-4">Partidas Arbitradas</th>
                      <th className="py-3 px-4">Permisos</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A] bg-[#111113]">
                    {referees.map((ref) => (
                      <tr key={ref.id} className="hover:bg-[#18181B]/50 transition-colors">
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ref.status === "ACTIVE"
                                ? "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30"
                                : "bg-[#71717A]/15 text-[#71717A] border border-[#71717A]/30"
                            }`}
                          >
                            {ref.status === "ACTIVE" ? "ACTIVO" : "INACTIVO"}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#FAFAFA]">{ref.nickname}</td>
                        <td className="py-3 px-4 text-[#A1A1AA]">{ref.email}</td>
                        <td className="py-3 px-4 text-[#D4860A] font-semibold">{ref.assignedGame}</td>
                        <td className="py-3 px-4 font-mono text-[#FAFAFA]">{ref.matchesArbitrated} partidas</td>
                        <td className="py-3 px-4 text-[10px] text-[#A1A1AA]">
                          {ref.permissions?.canResolveDisputes && "✓ Disputas "}
                          {ref.permissions?.canEditBrackets && "✓ Brackets "}
                          {ref.permissions?.canManageRooms && "✓ Salas"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => toggleRefereeStatus(ref.id)}
                            className="text-xs text-[#D4860A] hover:underline font-semibold cursor-pointer"
                          >
                            {ref.status === "ACTIVE" ? "Desactivar" : "Reactivar"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* ADMIN TAB 2: AUDITORÍA DE SESIONES Y ERRORES */}
        {isAdmin && activeAdminTab === "auth_logs" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-[#FAFAFA] flex items-center gap-2">
                  <Icon.BarChart /> Auditoría de Inicios de Sesión y Validación de Errores
                </h2>
                <p className="text-xs text-[#71717A]">
                  Registro de logins de usuarios, bloqueos por contraseñas fallidas y anomalías de sesión.
                </p>
              </div>
            </div>

            <Card className="overflow-hidden border-[#27272A]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18181B] text-[#71717A] font-bold uppercase tracking-wider border-b border-[#27272A]">
                    <tr>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Evento</th>
                      <th className="py-3 px-4">Usuario</th>
                      <th className="py-3 px-4">Diagnóstico / Detalles</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272A] bg-[#111113]">
                    {authLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#18181B]/50 transition-colors">
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === "SUCCESS"
                                ? "bg-[#22C55E]/10 text-[#22C55E]"
                                : log.status === "WARNING"
                                ? "bg-[#EAB308]/10 text-[#EAB308]"
                                : "bg-[#EF4444]/10 text-[#EF4444]"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-[#FAFAFA]">{log.action}</td>
                        <td className="py-3 px-4 text-[#A1A1AA]">{log.user}</td>
                        <td className="py-3 px-4 text-[#A1A1AA]">{log.details}</td>
                        <td className="py-3 px-4 text-right font-mono text-[#71717A]">{log.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB PROFILE: PERFIL Y SEGURIDAD */}
        {(!isAdmin || activeAdminTab === "profile") && (
          <>
            {/* 1. Perfil Público */}
            <Card className="p-6 border-[#27272A]">
              <h2 className="text-lg font-bold text-[#FAFAFA] mb-1 flex items-center gap-2">
                <Icon.User /> Perfil de Administrador
              </h2>
              <p className="text-xs text-[#71717A] mb-5">Información de la cuenta maestra</p>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                      Nickname / Alias de Staff
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      disabled
                      value={currentUser?.email || "admin@toprival.gg"}
                      className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#71717A] opacity-70 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="primary" type="submit" size="sm">
                    Guardar Cambios
                  </Button>
                </div>
              </form>
            </Card>

            {/* 2. Cambio de Contraseña */}
            <Card className="p-6 border-[#27272A]">
              <h2 className="text-lg font-bold text-[#FAFAFA] mb-1 flex items-center gap-2">
                <Icon.Zap /> Seguridad y Credenciales
              </h2>
              <p className="text-xs text-[#71717A] mb-5">Actualiza tu contraseña de acceso</p>

              {passwordMsg && (
                <div
                  className={`p-3 mb-4 rounded-xl text-xs font-semibold text-center ${
                    passwordMsg.success
                      ? "bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E]"
                      : "bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444]"
                  }`}
                >
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="outline" type="submit" size="sm">
                    Actualizar Contraseña
                  </Button>
                </div>
              </form>
            </Card>
          </>
        )}
      </div>

      {/* MODAL CREAR REFEREE */}
      {showRefModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-[#27272A] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-6 border-b border-[#27272A] flex justify-between items-center bg-[#18181B]">
              <div>
                <h3 className="font-bold text-base text-[#FAFAFA]">Registrar Nuevo Referee / Árbitro</h3>
                <p className="text-xs text-[#71717A]">Asigna credenciales y ámbito de juego</p>
              </div>
              <button
                onClick={() => setShowRefModal(false)}
                className="text-[#71717A] hover:text-[#FAFAFA] font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRefereeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Nickname del Árbitro
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Referee_FreeFire_01"
                  value={refNick}
                  onChange={(e) => setRefNick(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="arbitro@toprival.gg"
                  value={refEmail}
                  onChange={(e) => setRefEmail(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Juego Asignado
                </label>
                <select
                  value={refGame}
                  onChange={(e) => setRefGame(e.target.value)}
                  className="w-full bg-[#18181B] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#D4860A]"
                >
                  {OFFICIAL_GAMES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#27272A]">
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1">
                  Permisos de Gestión:
                </label>
                <label className="flex items-center gap-2 text-xs text-[#FAFAFA] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canResolveDisputes}
                    onChange={(e) => setCanResolveDisputes(e.target.checked)}
                    className="rounded border-[#27272A] text-[#D4860A]"
                  />
                  Resolver Actas Arbitrales y Disputas de Partidos
                </label>
                <label className="flex items-center gap-2 text-xs text-[#FAFAFA] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canEditBrackets}
                    onChange={(e) => setCanEditBrackets(e.target.checked)}
                    className="rounded border-[#27272A] text-[#D4860A]"
                  />
                  Avanzar y Modificar Cruces en Brackets
                </label>
                <label className="flex items-center gap-2 text-xs text-[#FAFAFA] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canManageRooms}
                    onChange={(e) => setCanManageRooms(e.target.checked)}
                    className="rounded border-[#27272A] text-[#D4860A]"
                  />
                  Crear y Moderar Salas de Partida
                </label>
              </div>

              <div className="pt-4 border-t border-[#27272A] flex justify-end gap-2">
                <Button size="sm" variant="outline" type="button" onClick={() => setShowRefModal(false)}>
                  Cancelar
                </Button>
                <Button size="sm" variant="primary" type="submit">
                  Crear Árbitro
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsScreen;
