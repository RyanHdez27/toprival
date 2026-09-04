import { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/Navbar";
import { HomeScreen } from "./screens/HomeScreen";
import { TournamentsScreen } from "./screens/TournamentsScreen";
import { TournamentDetailScreen } from "./screens/TournamentDetailScreen";
import { RegistrationScreen } from "./screens/RegistrationScreen";
import { ConfirmationScreen } from "./screens/ConfirmationScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { BracketScreen } from "./screens/BracketScreen";
import { MatchScreen } from "./screens/MatchScreen";
import { ReportResultScreen } from "./screens/ReportResultScreen";
import { ChampionScreen } from "./screens/ChampionScreen";
import { RankingsScreen } from "./screens/RankingsScreen";
import { LoginScreen, RegisterScreen } from "./screens/LoginScreen";
import { RequestsScreen } from "./screens/RequestsScreen";
import { TeamScreen } from "./screens/TeamScreen";
import { AdminScreen } from "./screens/AdminScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { RefereeScreen } from "./screens/RefereeScreen";

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
  | "settings"
  | "referee";

const AUTH_SCREENS: Screen[] = ["dashboard", "team", "admin", "report", "registration", "settings", "referee"];
const NO_NAV_SCREENS: Screen[] = ["login", "register", "champion", "registration", "confirmation", "report"];

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

function MainLayout() {
  const { isAuthenticated, currentRole } = useApp();

  const getScreenFromHash = (): Screen => {
    const hash = window.location.hash.replace(/^#\/?/, "") as Screen;
    const validScreens: Screen[] = [
      "home", "tournaments", "rankings", "requests", "team", "admin",
      "dashboard", "bracket", "match", "report", "champion", "login",
      "register", "detail", "registration", "confirmation", "settings",
      "referee"
    ];
    return validScreens.includes(hash) ? hash : "home";
  };

  const [screen, setScreen] = useState<Screen>(getScreenFromHash);

  const navigate = (s: Screen, replace = false) => {
    window.scrollTo(0, 0);
    setScreen(s);
    if (replace) {
      window.history.replaceState({ screen: s }, "", `#/${s}`);
    } else if (window.location.hash !== `#/${s}`) {
      window.history.pushState({ screen: s }, "", `#/${s}`);
    }
  };

  // Escuchar botones Atrás y Adelante del navegador
  useEffect(() => {
    const handlePopState = () => {
      const current = getScreenFromHash();
      setScreen(current);
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", handlePopState);
    };
  }, []);

  // Protected route enforcement
  useEffect(() => {
    if (AUTH_SCREENS.includes(screen) && !isAuthenticated) {
      navigate("login", true);
    } else if (screen === "admin" && currentRole !== "ADMIN") {
      navigate("dashboard", true);
    } else if (screen === "referee" && currentRole !== "REFEREE" && currentRole !== "ADMIN") {
      navigate("dashboard", true);
    } else if (screen === "requests" && currentRole === "REFEREE") {
      navigate("tournaments", true);
    }
  }, [screen, isAuthenticated, currentRole]);

  const showNav = !NO_NAV_SCREENS.includes(screen);

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col">
      {showNav && (
        <Navbar
          screen={screen}
          onNavigate={navigate}
          isAuthenticated={isAuthenticated}
        />
      )}

      <main className="flex-1 pb-16 md:pb-0">
        {screen === "home" && <HomeScreen onNavigate={navigate} />}
        {screen === "tournaments" && <TournamentsScreen onNavigate={navigate} />}
        {screen === "requests" && currentRole !== "REFEREE" && <RequestsScreen />}
        {screen === "team" && <TeamScreen />}
        {screen === "admin" && currentRole === "ADMIN" && <AdminScreen />}
        {screen === "referee" && (currentRole === "REFEREE" || currentRole === "ADMIN") && (
          <RefereeScreen onNavigate={navigate} />
        )}
        {screen === "dashboard" && <DashboardScreen onNavigate={navigate} />}
        {screen === "detail" && <TournamentDetailScreen onNavigate={navigate} />}
        {screen === "registration" && <RegistrationScreen onNavigate={navigate} />}
        {screen === "confirmation" && <ConfirmationScreen onNavigate={navigate} />}
        {screen === "rankings" && <RankingsScreen />}
        {screen === "bracket" && <BracketScreen onNavigate={navigate} />}
        {screen === "match" && <MatchScreen onNavigate={navigate} />}
        {screen === "report" && <ReportResultScreen onNavigate={navigate} />}
        {screen === "champion" && <ChampionScreen onNavigate={navigate} />}
        {screen === "login" && <LoginScreen onNavigate={navigate} />}
        {screen === "register" && <RegisterScreen onNavigate={navigate} />}
        {screen === "settings" && <SettingsScreen onNavigate={navigate} />}
      </main>
    </div>
  );
}
