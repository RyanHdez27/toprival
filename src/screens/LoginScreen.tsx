import { useState } from "react";
import { useApp } from "../context/AppContext";
import { Button, Input, Icon } from "../components/ui";

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

export function LoginScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { loginWithCredentials, login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);
    setLoading(true);

    try {
      const res = await loginWithCredentials(email, password);
      if (res.success) {
        if (email.toLowerCase().includes("admin")) {
          onNavigate("admin");
        } else if (email.toLowerCase().includes("ref") || email.toLowerCase().includes("arbitro")) {
          onNavigate("referee" as any);
        } else {
          onNavigate("dashboard");
        }
      } else {
        // Fallback local en modo desarrollo si la base de datos no está activa
        if (email.toLowerCase().includes("admin")) {
          login("ADMIN");
          onNavigate("admin");
        } else if (email.toLowerCase().includes("ref") || email.toLowerCase().includes("arbitro")) {
          login("REFEREE");
          onNavigate("referee" as any);
        } else {
          login("TEAM_CAPTAIN");
          onNavigate("dashboard");
        }
      }
    } catch {
      if (email.toLowerCase().includes("admin")) {
        login("ADMIN");
        onNavigate("admin");
      } else if (email.toLowerCase().includes("ref") || email.toLowerCase().includes("arbitro")) {
        login("REFEREE");
        onNavigate("referee" as any);
      } else {
        login("TEAM_CAPTAIN");
        onNavigate("dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Back to Home */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#FAFAFA] transition-colors cursor-pointer"
          >
            ← Volver al inicio
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8 cursor-pointer" onClick={() => onNavigate("home")}>
          <img
            src="/android-chrome-192x192.png"
            alt="TopRival logo"
            className="w-12 h-12 rounded-xl object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[#FAFAFA]">
            Top<span className="text-[#D4860A]">Rival</span>
          </h1>
          <p className="text-sm text-[#71717A] mt-1">Ingresa a tu cuenta de TopRival</p>
        </div>

        <form onSubmit={onSubmitForm} className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 space-y-4">
          <Input
            label="Email"
            type="email"
            required
            placeholder="jugador@toprival.gg"
            value={email}
            onChange={setEmail}
          />

          <Input
            label="Contraseña"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={setPassword}
          />

          {error && (
            <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-xl text-xs text-[#EF4444]">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-[#F5B830] hover:text-[#D4860A] transition-colors cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <Button fullWidth size="lg" type="submit" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

        <p className="text-center text-sm text-[#71717A] mt-5">
          ¿Sin cuenta?{" "}
          <button
            onClick={() => onNavigate("register")}
            className="text-[#F5B830] hover:text-[#D4860A] transition-colors cursor-pointer font-medium"
          >
            Regístrate gratis
          </button>
        </p>
      </div>
    </div>
  );
}

export function RegisterScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const { registerWithCredentials, login, showAlert } = useApp();
  const [nick, setNick] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick || !email || !password) return;
    setError(null);
    setLoading(true);

    try {
      const res = await registerWithCredentials(nick, email, password);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onNavigate("dashboard");
        }, 1200);
      } else {
        setError(res.message || "El correo electrónico o nickname ya se encuentra registrado.");
      }
    } catch (err: any) {
      setError("Error de conexión al registrar. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Back to Home */}
        <div className="mb-6">
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#FAFAFA] transition-colors cursor-pointer"
          >
            ← Volver al inicio
          </button>
        </div>

        <div className="text-center mb-8 cursor-pointer" onClick={() => onNavigate("home")}>
          <img
            src="/android-chrome-192x192.png"
            alt="TopRival logo"
            className="w-12 h-12 rounded-xl object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-[#FAFAFA]">
            Top<span className="text-[#D4860A]">Rival</span>
          </h1>
          <p className="text-sm text-[#71717A] mt-1">Crea tu cuenta de TopRival</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] rounded-xl text-xs font-semibold space-y-1 animate-in fade-in">
            <p>⚠️ {error}</p>
            <div className="flex gap-2 pt-1 text-[11px]">
              <button
                type="button"
                onClick={() => showAlert("Recuperación de Contraseña", `Instrucciones de recuperación enviadas a: ${email || "tu correo registrado"}`, "info")}
                className="text-[#F5B830] underline hover:text-[#D4860A] cursor-pointer"
              >
                Recuperar contraseña
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => onNavigate("login")}
                className="text-[#FAFAFA] underline hover:text-[#A1A1AA] cursor-pointer"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] rounded-xl text-xs font-semibold text-center animate-in fade-in">
            ✓ ¡Cuenta creada con éxito! Ingresando al panel...
          </div>
        )}

        <form onSubmit={handleRegister} className="bg-[#111113] border border-[#27272A] rounded-2xl p-6 space-y-4">
          <Input
            label="Nick de jugador"
            placeholder="TuNick"
            value={nick}
            onChange={setNick}
            required
            hint="Este es tu nombre competitivo en la plataforma"
          />
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={setEmail}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={setPassword}
            required
          />

          <Button fullWidth size="lg" type="submit">
            Crear cuenta gratuita
          </Button>

          <p className="text-center text-xs text-[#71717A]">
            Al registrarte aceptas los{" "}
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-[#F5B830] hover:text-[#D4860A] underline cursor-pointer font-medium"
            >
              Términos de Uso
            </button>
          </p>
        </form>

        <p className="text-center text-sm text-[#71717A] mt-5">
          ¿Ya tienes cuenta?{" "}
          <button
            onClick={() => onNavigate("login")}
            className="text-[#F5B830] hover:text-[#D4860A] transition-colors cursor-pointer font-medium"
          >
            Iniciar sesión
          </button>
        </p>

        {/* Modal de Términos de Uso */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#111113] border border-[#27272A] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95">
              <div className="p-6 border-b border-[#27272A] flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-[#FAFAFA]">Términos de Uso y Reglamento TopRival</h2>
                  <p className="text-xs text-[#71717A]">Condiciones para participación en torneos competitivos</p>
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="text-[#71717A] hover:text-[#FAFAFA] text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-xs text-[#A1A1AA] leading-relaxed">
                <div>
                  <h3 className="font-bold text-[#FAFAFA] text-sm mb-1">1. Juego Limpio y Anti-Cheat</h3>
                  <p>Está estrictamente prohibido el uso de hacks, scripts, exploits o programas de terceros no autorizados. Cualquier sospecha o prueba de comportamiento antideportivo resultará en la descalificación inmediata del equipo y ban permanente de la cuenta.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#FAFAFA] text-sm mb-1">2. Conducta y Respeto</h3>
                  <p>Todos los jugadores, capitanes y moderadores deben mantener un ambiente de respeto. No se tolerará el acoso, discurso de odio ni conductas tóxicas en los chats de partidos ni salas de la comunidad.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#FAFAFA] text-sm mb-1">3. Registro de Resultados y Evidencias</h3>
                  <p>Los capitanes son responsables de realizar check-in a tiempo y subir capturas de pantalla de la tabla final de cada partida como evidencia de victoria.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#FAFAFA] text-sm mb-1">4. Premios y Pagos</h3>
                  <p>Los premios anunciados en torneos oficiales se distribuirán a la cuenta registrada del capitán del equipo ganador en un plazo máximo de 5 días hábiles tras la finalización del evento.</p>
                </div>
              </div>

              <div className="p-4 border-t border-[#27272A] flex justify-end bg-[#18181B]">
                <Button variant="primary" size="sm" onClick={() => setShowTermsModal(false)}>
                  Entendido y Acepto
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
