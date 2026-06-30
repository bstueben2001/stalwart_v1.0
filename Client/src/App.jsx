import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './Context';
import Navbar from './Components/Navbar';
import Home from './Components/Home';
import Council from './Components/Council';
import Calendar from './Components/Calendar';
import Settings from './Components/Settings';
import HealthDashboard       from './Components/CouncilAssets/HealthAdvisor/HealthDashboard';
import BattleDashboard       from './Components/CouncilAssets/BattleAdvisor/BattleDashboard';
import DiplomacyDashboard    from './Components/CouncilAssets/DiplomacyAdvisor/DiplomacyDashboard';
import EconomicDashboard     from './Components/CouncilAssets/EconomicAdvisor/EconomicDashboard';
import RomanticDashboard     from './Components/CouncilAssets/RomanticAdvisor/RomanticDashboard';
import EntertainmentDashboard from './Components/CouncilAssets/EntertainmentAdvisor/EntertainmentDashboard';
import MuseumDashboard from './Components/CouncilAssets/Museum/MuseumDashboard';
import Embers from './Components/Embers';
import AuthGate from './Components/AuthGate';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Embers />
        <Navbar />
        <main className="content-area">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/council" element={<AuthGate><Council /></AuthGate>} />
          <Route path="/council/health"        element={<AuthGate><HealthDashboard /></AuthGate>} />
          <Route path="/council/battle"        element={<AuthGate><BattleDashboard /></AuthGate>} />
          <Route path="/council/diplomacy"     element={<AuthGate><DiplomacyDashboard /></AuthGate>} />
          <Route path="/council/economic"      element={<AuthGate><EconomicDashboard /></AuthGate>} />
          <Route path="/council/romantic"      element={<AuthGate><RomanticDashboard /></AuthGate>} />
          <Route path="/council/entertainment" element={<AuthGate><EntertainmentDashboard /></AuthGate>} />
          <Route path="/council/museum"        element={<AuthGate><MuseumDashboard /></AuthGate>} />
          <Route path="/calendar" element={<AuthGate><Calendar /></AuthGate>} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        </main>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
