import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { AssetsPage } from './components/assets/AssetsPage';
import { BeneficiariesPage } from './components/beneficiaries/BeneficiariesPage';
import HomePage from './components/home/HomePage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ReportPage } from './pages/ReportPage';
import { useAuth } from './hooks/useAuth';
import { PinSetup } from './components/auth/PinSetup';
import { PinEntry } from './components/auth/PinEntry';

function App() {
  const { isSetup, isAuthenticated } = useAuth();

  if (!isSetup) {
    return <PinSetup />;
  }

  if (!isAuthenticated) {
    return <PinEntry />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/beneficiaries" element={<BeneficiariesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/report" element={<ReportPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
