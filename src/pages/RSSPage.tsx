import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { rssApi } from "../lib/api";
import { Rss, Plus, Trash2, RefreshCw } from "lucide-react";

export default function RSSPage() {
  const { workspaceId } = useAuthStore();
  const [feeds, setFeeds] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", feed_url: "", caption_template: "{title}\n\n{url}", sync_interval_hours: 1 });

  useEffect(() => {
    if (!workspaceId) return;
    rssApi.list(workspaceId).then(r => setFeeds(r.data));
  }, [workspaceId]);

  const handleCreate = async () => {
    if (!workspaceId) return;
    const res = await rssApi.create({ ...form, workspace_id: workspaceId, account_ids: [] });
    setFeeds(prev => [...prev, res.data]);
    setShowForm(false);
    setForm({ name: "", feed_url: "", caption_template: "{title}\n\n{url}", sync_interval_hours: 1 });
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Rss size={22} className="text-orange-400" /> RSS Automation</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={15} /> Add Feed
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-violet-600/30 rounded-xl p-5 mb-6 space-y-3">
          <h2 className="font-medium">New RSS Feed</h2>
          <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Feed name" className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none" />
          <input value={form.feed_url} onChange={e => setForm(f => ({...f, feed_url: e.target.value}))} placeholder="https://example.com/feed.xml" className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none" />
          <textarea value={form.caption_template} onChange={e => setForm(f => ({...f, caption_template: e.target.value}))} rows={3} placeholder="Caption template: use {title}, {url}, {description}" className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none resize-none" />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-sm font-medium">Save Feed</button>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {feeds.length === 0 && <p className="text-gray-500 text-sm">No RSS feeds configured yet.</p>}
        {feeds.map(feed => (
          <div key={feed.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
            <Rss size={18} className="text-orange-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">{feed.name}</p>
              <p className="text-xs text-gray-400 truncate">{feed.feed_url}</p>
              <p className="text-xs text-gray-500 mt-0.5">Syncs every {feed.sync_interval_hours}h · {feed.is_active ? "Active" : "Paused"}</p>
            </div>
            <button onClick={async () => { await rssApi.delete(feed.id); setFeeds(prev => prev.filter(f => f.id !== feed.id)); }} className="text-gray-500 hover:text-red-400">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
