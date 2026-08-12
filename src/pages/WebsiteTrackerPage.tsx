import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { trackingApi } from "../lib/api";
import {
  Globe, Plus, Eye, Users, Clock, TrendingUp, MousePointerClick,
  CheckCircle2, BarChart2, Smartphone, Monitor, Tablet, Copy, Check,
  ChevronRight, Zap, RefreshCw, X, ExternalLink, MapPin, Link2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Site { id: number; name: string; domain: string; tracker_id: string; is_active: boolean; }
interface Overview {
  pageviews: number; sessions: number; unique_visitors: number;
  bounce_rate: number; avg_duration_seconds: number;
  conversions: number; conversion_rate: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDuration(secs: number) {
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
}
function fmtNum(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, sub }: any) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={14} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1.5 text-xs bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 px-3 py-1.5 rounded-lg transition-colors">
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? "Copied!" : label}
    </button>
  );
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────
function MiniBar({ data, valueKey, labelKey, color = "bg-violet-500" }: any) {
  const max = Math.max(...data.map((d: any) => d[valueKey]), 1);
  return (
    <div className="space-y-2">
      {data.slice(0, 8).map((d: any, i: number) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-36 truncate flex-shrink-0">{d[labelKey]}</span>
          <div className="flex-1 bg-gray-800 rounded-full h-1.5">
            <div className={`${color} h-1.5 rounded-full`} style={{ width: `${(d[valueKey] / max) * 100}%` }} />
          </div>
          <span className="text-xs text-gray-400 w-10 text-right flex-shrink-0">{fmtNum(d[valueKey])}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Add site modal ───────────────────────────────────────────────────────────
function AddSiteModal({ onClose, onCreated, workspaceId }: any) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [snippet, setSnippet] = useState("");

  const create = async () => {
    if (!name.trim() || !domain.trim()) return;
    setLoading(true);
    try {
      const res = await trackingApi.createSite({ workspace_id: workspaceId, name, domain });
      setSnippet(res.data.snippet);
      onCreated(res.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="font-semibold flex items-center gap-2"><Globe size={16} className="text-violet-400" /> Add website</h2>
          <button onClick={onClose}><X size={18} className="text-gray-500 hover:text-white" /></button>
        </div>

        {!snippet ? (
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Site name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="My Company Website"
                className="w-full bg-gray-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Domain</label>
              <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="mycompany.com"
                className="w-full bg-gray-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-violet-500" />
              <p className="text-xs text-gray-600 mt-1">Without https:// — e.g. mycompany.com</p>
            </div>
            <button onClick={create} disabled={loading || !name.trim() || !domain.trim()}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 py-2.5 rounded-lg text-sm font-medium transition-colors">
              {loading ? "Creating…" : "Create site & get snippet"}
            </button>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4">
              <CheckCircle2 size={16} className="text-green-400" />
              <p className="text-sm text-green-300">Site created! Add this snippet to your website.</p>
            </div>
            <p className="text-xs text-gray-500 mb-2">Paste this before the closing <code className="text-violet-300">&lt;/head&gt;</code> tag:</p>
            <div className="relative">
              <pre className="bg-gray-800 rounded-xl p-4 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">{snippet}</pre>
              <div className="absolute top-2 right-2">
                <CopyBtn text={snippet} label="Copy snippet" />
              </div>
            </div>
            <div className="mt-4 bg-gray-800/50 rounded-xl p-4 text-sm text-gray-400 space-y-1.5">
              <p className="flex items-start gap-2"><CheckCircle2 size={13} className="text-violet-400 mt-0.5 flex-shrink-0" /> Tracks pageviews, sessions, scroll depth, and time-on-page automatically.</p>
              <p className="flex items-start gap-2"><CheckCircle2 size={13} className="text-violet-400 mt-0.5 flex-shrink-0" /> UTM parameters from your social posts are captured automatically — no extra code needed.</p>
              <p className="flex items-start gap-2"><CheckCircle2 size={13} className="text-violet-400 mt-0.5 flex-shrink-0" /> For custom events (conversions, form submits): call <code className="text-violet-300">spTrack('signup', {'{ category: "conversion" }'})</code></p>
            </div>
            <button onClick={onClose} className="mt-4 w-full border border-gray-700 hover:bg-gray-800 py-2.5 rounded-lg text-sm transition-colors">Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function WebsiteTrackerPage() {
  const { workspaceId } = useAuthStore();
  const [sites, setSites] = useState<Site[]>([]);
  const [activeSite, setActiveSite] = useState<Site | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [days, setDays] = useState(30);
  const [tab, setTab] = useState<"overview" | "pages" | "referrers" | "utm" | "devices" | "sessions">("overview");
  const [loading, setLoading] = useState(false);

  // Data states
  const [overview, setOverview] = useState<Overview | null>(null);
  const [timeseries, setTimeseries] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [referrers, setReferrers] = useState<any[]>([]);
  const [utm, setUtm] = useState<any[]>([]);
  const [devices, setDevices] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [snippet, setSnippet] = useState("");

  const loadSites = useCallback(async () => {
    if (!workspaceId) return;
    const res = await trackingApi.listSites(workspaceId);
    setSites(res.data);
    if (res.data.length > 0 && !activeSite) setActiveSite(res.data[0]);
  }, [workspaceId]);

  useEffect(() => { loadSites(); }, [loadSites]);

  const loadData = useCallback(async () => {
    if (!activeSite) return;
    setLoading(true);
    try {
      const tid = activeSite.tracker_id;
      const [ov, ts, pg, ref, ut, dev, sess, snip] = await Promise.all([
        trackingApi.overview(tid, days),
        trackingApi.timeseries(tid, days),
        trackingApi.topPages(tid, days),
        trackingApi.referrers(tid, days),
        trackingApi.utm(tid, days),
        trackingApi.devices(tid, days),
        trackingApi.sessions(tid),
        trackingApi.getSnippet(tid),
      ]);
      setOverview(ov.data);
      setTimeseries(ts.data);
      setPages(pg.data);
      setReferrers(ref.data);
      setUtm(ut.data);
      setDevices(dev.data);
      setSessions(sess.data);
      setSnippet(snip.data.snippet);
    } finally {
      setLoading(false);
    }
  }, [activeSite, days]);

  useEffect(() => { loadData(); }, [loadData]);

  const chartMax = Math.max(...timeseries.map((d: any) => d.pageviews), 1);

  if (sites.length === 0 && !showAddModal) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Globe size={22} className="text-violet-400" />
          <h1 className="text-2xl font-bold">Website Tracker</h1>
        </div>
        <div className="border-2 border-dashed border-gray-800 rounded-2xl p-12 text-center">
          <Globe size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Track your website visitors</p>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Add a lightweight snippet to your site and start seeing pageviews, sessions, UTM attribution from your social posts, device breakdowns, and more — all in real time.
          </p>
          <button onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            <Plus size={16} /> Add your first website
          </button>
        </div>
        {showAddModal && (
          <AddSiteModal workspaceId={workspaceId!} onClose={() => setShowAddModal(false)}
            onCreated={() => { loadSites(); setShowAddModal(false); }} />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Site list sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-gray-800 py-4 overflow-y-auto">
        <div className="px-4 flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sites</p>
          <button onClick={() => setShowAddModal(true)} className="p-1 hover:bg-gray-800 rounded-md">
            <Plus size={14} className="text-violet-400" />
          </button>
        </div>
        {sites.map(site => (
          <button key={site.id} onClick={() => setActiveSite(site)}
            className={`w-full text-left px-4 py-3 text-sm transition-colors ${activeSite?.id === site.id ? "bg-violet-600/15 text-white border-r-2 border-violet-500" : "text-gray-400 hover:text-white hover:bg-gray-800/50"}`}>
            <p className="font-medium truncate">{site.name}</p>
            <p className="text-xs text-gray-600 truncate mt-0.5">{site.domain}</p>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Globe size={18} className="text-violet-400" />
                {activeSite?.name}
                <a href={`https://${activeSite?.domain}`} target="_blank" rel="noopener noreferrer"
                  className="text-gray-600 hover:text-violet-400">
                  <ExternalLink size={14} />
                </a>
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">{activeSite?.domain}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadData} className="p-2 border border-gray-800 hover:bg-gray-800 rounded-lg">
                <RefreshCw size={14} className={loading ? "animate-spin text-violet-400" : "text-gray-400"} />
              </button>
              <select value={days} onChange={e => setDays(+e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm">
                {[7, 14, 30, 90].map(d => <option key={d} value={d}>Last {d} days</option>)}
              </select>
              {snippet && <CopyBtn text={snippet} label="Get snippet" />}
            </div>
          </div>

          {/* Stat cards */}
          {overview && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard label="Pageviews" value={fmtNum(overview.pageviews)} icon={Eye} color="bg-violet-600/20 text-violet-400" />
              <StatCard label="Unique Visitors" value={fmtNum(overview.unique_visitors)} icon={Users} color="bg-blue-600/20 text-blue-400" />
              <StatCard label="Avg. Session" value={fmtDuration(overview.avg_duration_seconds)} icon={Clock} color="bg-green-600/20 text-green-400" sub={`Bounce ${overview.bounce_rate}%`} />
              <StatCard label="Conversions" value={overview.conversions} icon={CheckCircle2} color="bg-amber-600/20 text-amber-400" sub={`${overview.conversion_rate}% rate`} />
            </div>
          )}

          {/* Time series chart */}
          {timeseries.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
              <p className="text-sm font-medium mb-4 flex items-center gap-2">
                <TrendingUp size={15} className="text-violet-400" /> Pageviews over time
              </p>
              <div className="flex items-end gap-1 h-28">
                {timeseries.map((d: any, i: number) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                      {d.date}: {d.pageviews} views
                    </div>
                    <div className="w-full bg-violet-600/40 hover:bg-violet-600/70 transition-colors rounded-t min-h-[2px]"
                      style={{ height: `${Math.max((d.pageviews / chartMax) * 100, 2)}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{timeseries[0]?.date}</span>
                <span>{timeseries[timeseries.length - 1]?.date}</span>
              </div>
            </div>
          )}

          {/* Tab navigation */}
          <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-5 flex-wrap">
            {(["overview", "pages", "referrers", "utm", "devices", "sessions"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${tab === t ? "bg-violet-600 text-white font-medium" : "text-gray-400 hover:text-white"}`}>
                {t === "utm" ? "UTM Attribution" : t}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === "overview" && overview && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm font-medium mb-4 flex items-center gap-2"><Link2 size={14} className="text-violet-400" /> Top Referrers</p>
                {referrers.length > 0 ? <MiniBar data={referrers} valueKey="visits" labelKey="referrer" /> : <p className="text-xs text-gray-600">No referrer data yet.</p>}
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <p className="text-sm font-medium mb-4 flex items-center gap-2"><Eye size={14} className="text-violet-400" /> Top Pages</p>
                {pages.length > 0 ? <MiniBar data={pages} valueKey="pageviews" labelKey="path" /> : <p className="text-xs text-gray-600">No page data yet.</p>}
              </div>
            </div>
          )}

          {tab === "pages" && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Page</th>
                  <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Views</th>
                  <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Avg. Time</th>
                  <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Scroll</th>
                </tr></thead>
                <tbody>{pages.map((p: any, i: number) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-5 py-3 text-gray-300 font-mono text-xs truncate max-w-xs">{p.path}</td>
                    <td className="px-5 py-3 text-right text-gray-300">{p.pageviews.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right text-gray-400">{fmtDuration(p.avg_duration_seconds)}</td>
                    <td className="px-5 py-3 text-right text-gray-400">{p.avg_scroll_depth}%</td>
                  </tr>
                ))}</tbody>
              </table>
              {pages.length === 0 && <p className="text-center text-gray-600 text-sm py-12">No page data yet.</p>}
            </div>
          )}

          {tab === "referrers" && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Source</th>
                  <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Visits</th>
                </tr></thead>
                <tbody>{referrers.map((r: any, i: number) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-5 py-3 text-gray-300">{r.referrer}</td>
                    <td className="px-5 py-3 text-right text-gray-300">{r.visits.toLocaleString()}</td>
                  </tr>
                ))}</tbody>
              </table>
              {referrers.length === 0 && <p className="text-center text-gray-600 text-sm py-12">No referrer data yet.</p>}
            </div>
          )}

          {tab === "utm" && (
            <div>
              <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-4 mb-4 text-sm text-gray-300">
                <p className="font-medium text-violet-300 mb-1 flex items-center gap-1.5"><Zap size={13} /> Social post attribution</p>
                UTM parameters in your published posts are captured automatically. When someone clicks a LinkedIn post with <code className="text-violet-300">?utm_campaign=product_launch</code>, that visit is attributed here — connecting your social content to website outcomes.
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-800">
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Campaign</th>
                    <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Source</th>
                    <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Visits</th>
                    <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Sessions</th>
                    <th className="text-right px-5 py-3 text-xs text-gray-500 font-medium">Conversions</th>
                  </tr></thead>
                  <tbody>{utm.map((u: any, i: number) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-5 py-3 text-gray-300 font-medium">{u.campaign}</td>
                      <td className="px-5 py-3 text-gray-400 capitalize">{u.source || "—"}</td>
                      <td className="px-5 py-3 text-right text-gray-300">{u.visits}</td>
                      <td className="px-5 py-3 text-right text-gray-300">{u.sessions}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={u.conversions > 0 ? "text-green-400 font-medium" : "text-gray-600"}>
                          {u.conversions}
                        </span>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
                {utm.length === 0 && <p className="text-center text-gray-600 text-sm py-12">No UTM data yet. Add UTM parameters to your social post links to see attribution here.</p>}
              </div>
            </div>
          )}

          {tab === "devices" && devices && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { title: "Device Type", data: devices.devices, icon: Monitor },
                { title: "Browsers", data: devices.browsers, icon: Globe },
                { title: "Operating Systems", data: devices.os, icon: Smartphone },
              ].map(({ title, data, icon: Icon }) => (
                <div key={title} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <p className="text-sm font-medium mb-4 flex items-center gap-2">
                    <Icon size={14} className="text-violet-400" /> {title}
                  </p>
                  <div className="space-y-2.5">
                    {(data || []).map((d: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300 capitalize">{d.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-800 rounded-full h-1.5">
                            <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${d.pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">{d.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "sessions" && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Entry page</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Source</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium">Campaign</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Pages</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Duration</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Device</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500 font-medium">Converted</th>
                </tr></thead>
                <tbody>{sessions.map((s: any, i: number) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-2.5 text-gray-300 font-mono text-xs truncate max-w-[180px]">{s.entry_page}</td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">{s.utm_source || s.referrer || "(direct)"}</td>
                    <td className="px-4 py-2.5 text-xs">
                      {s.utm_campaign ? <span className="bg-violet-600/20 text-violet-300 px-2 py-0.5 rounded-full">{s.utm_campaign}</span> : <span className="text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-400 text-xs">{s.pages}</td>
                    <td className="px-4 py-2.5 text-right text-gray-400 text-xs">{fmtDuration(s.duration)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-400 text-xs capitalize">{s.device}</td>
                    <td className="px-4 py-2.5 text-right">
                      {s.converted ? <CheckCircle2 size={14} className="text-green-400 ml-auto" /> : <span className="text-gray-700 text-xs">—</span>}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
              {sessions.length === 0 && <p className="text-center text-gray-600 text-sm py-12">No sessions yet. Add the tracker snippet to your website to start collecting data.</p>}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddSiteModal workspaceId={workspaceId!} onClose={() => setShowAddModal(false)}
          onCreated={(site: Site) => { loadSites(); setActiveSite(site); setShowAddModal(false); }} />
      )}
    </div>
  );
}
