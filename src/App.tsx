import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { AssetsPage } from './components/assets/AssetsPage';
import { BeneficiariesPage } from './components/beneficiaries/BeneficiariesPage';
import HomePage from './components/home/HomePage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { ReportPage } from './pages/ReportPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Home page is unprotected - visitors can see it without PIN */}
          <Route path="/" element={<Layout><HomePage /></Layout>} />

          {/* All other routes are protected - require PIN setup/entry */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
          <Route path="/beneficiaries" element={<ProtectedRoute><BeneficiariesPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

