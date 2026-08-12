import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { campaignApi } from "../lib/api";
import { Sparkles, Plus, Calendar, ChevronRight } from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  planning: "bg-gray-700 text-gray-300",
  draft: "bg-blue-500/15 text-blue-400",
  pending_approval: "bg-yellow-500/15 text-yellow-400",
  approved: "bg-green-500/15 text-green-400",
  scheduled: "bg-violet-500/15 text-violet-400",
  active: "bg-violet-500/15 text-violet-400",
  completed: "bg-gray-600 text-gray-300",
  archived: "bg-gray-800 text-gray-500",
};

export default function CampaignsPage() {
  const { workspaceId } = useAuthStore();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<any[]>([]);

  useEffect(() => {
    if (!workspaceId) return;
    campaignApi.list(workspaceId).then((r) => setCampaigns(r.data));
  }, [workspaceId]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles size={22} className="text-violet-400" /> Campaigns
        </h1>
        <button onClick={() => navigate("/app/command")} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={15} /> New from prompt
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-800 rounded-xl text-gray-500">
          <Sparkles size={36} className="mb-3 opacity-30" />
          <p className="mb-1">No campaigns yet.</p>
          <button onClick={() => navigate("/app/command")} className="text-violet-400 text-sm hover:underline">
            Describe one in the Command Center →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((c) => (
            <button key={c.id} onClick={() => navigate(`/app/campaigns/${c.id}`)} className="w-full text-left bg-gray-900 border border-gray-800 hover:border-violet-500/40 rounded-xl p-4 flex items-center gap-4 transition-colors group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate">{c.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STATUS_STYLE[c.status] || ""}`}>
                    {c.status?.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-gray-400 truncate">{c.goal}</p>
                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                  <Calendar size={10} /> {c.post_count} posts · created {new Date(c.created_at).toLocaleDateString()}
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-600 group-hover:text-violet-400 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
