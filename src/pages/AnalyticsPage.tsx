import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { analyticsApi } from "../lib/api";
import { postAnalyticsApi } from "../lib/api";
import {
  BarChart2, TrendingUp, Eye, Heart, MessageCircle, Share2,
  MousePointerClick, Users, Zap, Trophy, RefreshCw,
} from "lucide-react";

const METRICS = [
  { key: "impressions", label: "Impressions", icon: Eye, color: "violet" },
  { key: "likes", label: "Likes", icon: Heart, color: "pink" },
  { key: "comments", label: "Comments", icon: MessageCircle, color: "blue" },
  { key: "shares", label: "Shares", icon: Share2, color: "green" },
  { key: "clicks", label: "Clicks", icon: MousePointerClick, color: "yellow" },
  { key: "engagement_rate", label: "Eng. Rate", icon: Zap, color: "orange" },
];

export default function AnalyticsPage() {
  const { workspaceId } = useAuthStore();
  const [overview, setOverview] = useState<any>(null);
  const [perf, setPerf] = useState<any[]>([]);
  const [topPosts, setTopPosts] = useState<any[]>([]);
  const [days, setDays] = useState(30);
  const [chartMetric, setChartMetric] = useState("impressions");
  const [topMetric, setTopMetric] = useState("impressions");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const [o, p, t] = await Promise.all([
        analyticsApi.overview(workspaceId, days),
        analyticsApi.performance(workspaceId, days),
        postAnalyticsApi.topPosts(workspaceId, topMetric, days),
      ]);
      setOverview(o.data);
      setPerf(p.data);
      setTopPosts(t.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [workspaceId, days, topMetric]);

  const chartData = perf.slice(-30);
  const maxVal = Math.max(...chartData.map((p: any) => p[chartMetric] || 0), 1);
  const totals = overview?.totals || {};

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 size={22} className="text-violet-400" /> Analytics
        </h1>
        <div className="flex gap-2 items-center">
          <button onClick={load} className="p-2 border border-gray-800 hover:bg-gray-800 rounded-lg">
            <RefreshCw size={15} className={loading ? "animate-spin text-violet-400" : "text-gray-400"} />
          </button>
          <select value={days} onChange={e => setDays(+e.target.value)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm">
            {[7, 14, 30, 90].map(d => <option key={d} value={d}>Last {d} days</option>)}
          </select>
        </div>
      </div>

      {/* Publishing summary */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Posts", value: overview.total_posts, icon: BarChart2, color: "violet" },
            { label: "Published", value: overview.published, icon: TrendingUp, color: "green" },
            { label: "Scheduled", value: overview.scheduled, icon: Eye, color: "blue" },
            { label: "Failed", value: overview.failed, icon: MessageCircle, color: "red" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <Icon size={18} className={`text-${color}-400 mb-2`} />
              <p className="text-2xl font-bold">{value ?? "—"}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Engagement totals */}
      {overview && (
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { label: "Impressions", value: totals.impressions, icon: Eye },
            { label: "Reach", value: totals.reach, icon: Users },
            { label: "Likes", value: totals.likes, icon: Heart },
            { label: "Comments", value: totals.comments, icon: MessageCircle },
            { label: "Shares", value: totals.shares, icon: Share2 },
            { label: "Avg ER", value: totals.avg_engagement_rate != null ? `${(totals.avg_engagement_rate * 100).toFixed(1)}%` : "—", icon: Zap },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <Icon size={15} className="text-violet-400 mx-auto mb-1" />
              <p className="text-lg font-bold">{value ?? 0}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Performance chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <TrendingUp size={16} className="text-violet-400" /> Performance Over Time
          </h2>
          <select value={chartMetric} onChange={e => setChartMetric(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm">
            {METRICS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>

        {chartData.length > 0 ? (
          <>
            <div className="flex items-end gap-1 h-44">
              {chartData.map((p: any, i: number) => {
                const val = p[chartMetric] || 0;
                const height = maxVal > 0 ? (val / maxVal) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      {chartMetric === "avg_engagement_rate" ? `${(val * 100).toFixed(1)}%` : val.toLocaleString()}
                    </div>
                    <div
                      className="w-full bg-violet-600/40 hover:bg-violet-600/70 transition-colors rounded-t min-h-[2px]"
                      style={{ height: `${Math.max(height, 1)}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{chartData[0]?.date}</span>
              <span>{chartData[chartData.length - 1]?.date}</span>
            </div>
          </>
        ) : (
          <div className="h-44 flex items-center justify-center text-gray-600 text-sm">
            No analytics data yet — publish some posts to see performance here.
          </div>
        )}
      </div>

      {/* Top posts */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Trophy size={16} className="text-yellow-400" /> Top Posts
          </h2>
          <select value={topMetric} onChange={e => setTopMetric(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm">
            {METRICS.filter(m => m.key !== "avg_engagement_rate").map(m =>
              <option key={m.key} value={m.key}>{m.label}</option>
            )}
            <option value="engagement_rate">Eng. Rate</option>
          </select>
        </div>

        {topPosts.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-8">No data yet. Analytics populate after posts are published.</p>
        ) : (
          <div className="space-y-3">
            {topPosts.map((post: any, i: number) => (
              <div key={post.post_id} className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{post.caption_preview}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                    <span className="capitalize bg-gray-700 px-2 py-0.5 rounded">{post.platform}</span>
                    <span className="flex items-center gap-1"><Eye size={11} /> {post.impressions.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Heart size={11} /> {post.likes.toLocaleString()}</span>
                    <span className="flex items-center gap-1"><Share2 size={11} /> {post.shares.toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-violet-400"><Zap size={11} /> {(post.engagement_rate * 100).toFixed(1)}% ER</span>
                    {post.published_at && <span>{new Date(post.published_at).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
