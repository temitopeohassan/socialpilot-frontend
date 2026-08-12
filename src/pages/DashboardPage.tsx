import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { analyticsApi, postsApi } from "../lib/api";
import { Link } from "react-router-dom";
import {
  FileText, Clock, CheckCircle2, AlertCircle,
  TrendingUp, PenLine, Zap, ArrowRight,
} from "lucide-react";

interface Stats {
  total_posts: number;
  published: number;
  scheduled: number;
  failed: number;
  drafts: number;
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-green-500/10 text-green-400 border border-green-500/20",
  scheduled: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
  failed: "bg-red-500/10 text-red-400 border border-red-500/20",
  draft: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
  processing: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
};

export default function DashboardPage() {
  const { workspaceId, user } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    Promise.all([
      analyticsApi.overview(workspaceId, 30),
      postsApi.list({ workspace_id: workspaceId, per_page: 8 }),
    ])
      .then(([statsRes, postsRes]) => {
        setStats(statsRes.data);
        setRecentPosts(postsRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, [workspaceId]);

  if (!workspaceId) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-400">No workspace selected.</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total Posts", value: stats?.total_posts ?? 0, icon: FileText, color: "violet" },
    { label: "Published", value: stats?.published ?? 0, icon: CheckCircle2, color: "green" },
    { label: "Scheduled", value: stats?.scheduled ?? 0, icon: Clock, color: "blue" },
    { label: "Failed", value: stats?.failed ?? 0, icon: AlertCircle, color: "red" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-gray-400 mt-1">Here's your publishing overview for the last 30 days.</p>
        </div>
        <Link
          to="/app/compose"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <PenLine size={16} />
          Create Post
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className={`w-10 h-10 rounded-lg bg-${color}-600/10 flex items-center justify-center mb-3`}>
              <Icon size={20} className={`text-${color}-400`} />
            </div>
            <p className="text-2xl font-bold">{loading ? "—" : value}</p>
            <p className="text-sm text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { to: "/app/ai-studio", icon: Zap, label: "Generate with AI", desc: "Create captions with AI assistance", color: "violet" },
          { to: "/app/bulk", icon: FileText, label: "Bulk Publish", desc: "Upload and schedule many posts at once", color: "blue" },
          { to: "/app/rss", icon: TrendingUp, label: "RSS Automation", desc: "Auto-publish from RSS feeds", color: "green" },
        ].map(({ to, icon: Icon, label, desc, color }) => (
          <Link
            key={to}
            to={to}
            className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 flex items-center gap-4 transition-colors group"
          >
            <div className={`w-10 h-10 rounded-lg bg-${color}-600/10 flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={`text-${color}-400`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <ArrowRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="font-semibold">Recent Posts</h2>
          <Link to="/app/calendar" className="text-sm text-violet-400 hover:text-violet-300">
            View all →
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : recentPosts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No posts yet.</p>
            <Link to="/app/compose" className="text-violet-400 text-sm mt-2 inline-block hover:text-violet-300">
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{post.caption}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {post.scheduled_at
                      ? `Scheduled: ${new Date(post.scheduled_at).toLocaleString()}`
                      : `Created: ${new Date(post.created_at).toLocaleString()}`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[post.status] || ""}`}>
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
