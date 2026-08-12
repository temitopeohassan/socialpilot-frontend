import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import AppLayout from "./components/layout/AppLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ComposerPage from "./pages/ComposerPage";
import CalendarPage from "./pages/CalendarPage";
import MediaPage from "./pages/MediaPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AccountsPage from "./pages/AccountsPage";
import TeamPage from "./pages/TeamPage";
import RSSPage from "./pages/RSSPage";
import BulkPage from "./pages/BulkPage";
import AIStudioPage from "./pages/AIStudioPage";
// AI-first pages
import CommandCenterPage from "./pages/CommandCenterPage";
import CampaignsPage from "./pages/CampaignsPage";
import CampaignDetailPage from "./pages/CampaignDetailPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import BrandVoicePage from "./pages/BrandVoicePage";
import PostIntelligencePage from "./pages/PostIntelligencePage";
import SetupGuidePage from "./pages/SetupGuidePage";
import WebsiteTrackerPage from "./pages/WebsiteTrackerPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        {/* AI-first is the default landing experience */}
        <Route index element={<Navigate to="command" replace />} />
        <Route path="command" element={<CommandCenterPage />} />
        <Route path="campaigns" element={<CampaignsPage />} />
        <Route path="campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
        <Route path="brand-voice" element={<BrandVoicePage />} />
        <Route path="intelligence" element={<PostIntelligencePage />} />
        <Route path="setup-guide" element={<SetupGuidePage />} />
        <Route path="website-tracker" element={<WebsiteTrackerPage />} />

        {/* Supporting / manual tools */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="compose" element={<ComposerPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="accounts" element={<AccountsPage />} />
        <Route path="team" element={<TeamPage />} />
        <Route path="rss" element={<RSSPage />} />
        <Route path="bulk" element={<BulkPage />} />
        <Route path="ai-studio" element={<AIStudioPage />} />
      </Route>
    </Routes>
  );
}
