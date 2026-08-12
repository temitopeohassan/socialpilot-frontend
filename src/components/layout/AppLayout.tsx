import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  LayoutDashboard, PenLine, Calendar, Image, BarChart2,
  Users, Rss, Layers, Sparkles, Settings, LogOut,
  Menu, X, ChevronDown, Zap, Wand2, Megaphone, ShieldCheck, Mic, Brain, BookOpen, Globe,
} from "lucide-react";

const aiNavItems = [
  { to: "command", icon: Wand2, label: "Command Center" },
  { to: "campaigns", icon: Megaphone, label: "Campaigns" },
  { to: "approvals", icon: ShieldCheck, label: "Approvals" },
  { to: "brand-voice", icon: Mic, label: "Brand Voice" },
  { to: "intelligence", icon: Brain, label: "Post Intelligence" },
  { to: "website-tracker", icon: Globe, label: "Website Tracker" },
];

const toolNavItems = [
  { to: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "calendar", icon: Calendar, label: "Calendar" },
  { to: "compose", icon: PenLine, label: "Manual Compose" },
  { to: "media", icon: Image, label: "Media Library" },
  { to: "analytics", icon: BarChart2, label: "Analytics" },
  { to: "rss", icon: Rss, label: "RSS Feeds" },
  { to: "accounts", icon: Settings, label: "Accounts" },
  { to: "team", icon: Users, label: "Team" },
  { to: "setup-guide", icon: BookOpen, label: "Setup Guide" },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-60" : "w-16"
        } flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-800">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-lg tracking-tight">SocialPilot</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto text-gray-400 hover:text-white"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {sidebarOpen && (
            <p className="px-5 text-[10px] font-semibold uppercase tracking-wider text-violet-400/70 mb-1">
              AI-First
            </p>
          )}
          {aiNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={`/app/${to}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-violet-600/20 text-violet-400 font-medium"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}

          {sidebarOpen && (
            <p className="px-5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 mb-1 mt-5">
              Tools
            </p>
          )}
          {!sidebarOpen && <div className="my-3 mx-4 border-t border-gray-800" />}
          {toolNavItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={`/app/${to}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-violet-600/20 text-violet-400 font-medium"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.plan} plan</p>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-400">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
