import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { campaignApi } from "../lib/api";
import {
  Sparkles, Calendar, Send, RefreshCw, CheckCircle2, Edit3,
  TrendingUp, Facebook, Instagram, Twitter, Linkedin, ArrowLeft, Save,
} from "lucide-react";

const PLATFORM_ICONS: Record<string, any> = {
  facebook: Facebook, instagram: Instagram, twitter: Twitter, linkedin: Linkedin,
};
const PLATFORM_COLORS: Record<string, string> = {
  facebook: "text-blue-500", instagram: "text-pink-500",
  twitter: "text-sky-400", linkedin: "text-blue-600", tiktok: "text-white",
};

export default function CampaignDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [submitResult, setSubmitResult] = useState<any>(null);

  const load = () => {
    if (!id) return;
    campaignApi.get(+id).then((r) => setData(r.data)).finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const handleRegenerate = async () => {
    if (!id) return;
    setLoading(true);
    await campaignApi.regenerate(+id);
    load();
  };

  const handleSubmitApproval = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      const res = await campaignApi.submitForApproval(+id);
      setSubmitResult(res.data);
    } finally {
      setSubmitting(false);
    }
  };

  const saveEdit = async (variationId: number) => {
    await campaignApi.editVariation(variationId, { caption: editText });
    setEditing(null);
    load();
  };

  if (loading) return <div className="p-8 text-gray-500">Loading campaign…</div>;
  if (!data) return <div className="p-8 text-gray-500">Campaign not found.</div>;

  const { campaign, strategy, ideas } = data;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate("/app/campaigns")} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-4">
        <ArrowLeft size={15} /> All campaigns
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={20} className="text-violet-400" />
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
            campaign.status === "draft" ? "bg-gray-700 text-gray-300" :
            campaign.status === "pending_approval" ? "bg-yellow-500/15 text-yellow-400" :
            "bg-violet-500/15 text-violet-400"
          }`}>
            {campaign.status?.replace("_", " ")}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRegenerate} className="flex items-center gap-2 px-3 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg text-sm">
            <RefreshCw size={14} /> Regenerate
          </button>
          <button onClick={handleSubmitApproval} disabled={submitting} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm font-medium">
            <Send size={14} /> {submitting ? "Screening…" : "Submit for approval"}
          </button>
        </div>
      </div>

      {/* Strategy */}
      {strategy && (
        <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-4 mb-6">
          <p className="text-xs font-medium text-violet-300 mb-1 flex items-center gap-1.5">
            <Sparkles size={12} /> Agent strategy
          </p>
          <p className="text-sm text-gray-300">{strategy}</p>
        </div>
      )}

      {/* Approval result banner */}
      {submitResult && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-green-400" />
          <div className="text-sm">
            <p className="text-green-300 font-medium">{submitResult.message}</p>
            <button onClick={() => navigate("/app/approvals")} className="text-xs text-green-400 hover:underline mt-0.5">
              Go to approvals →
            </button>
          </div>
        </div>
      )}

      {/* Ideas + variations */}
      <div className="space-y-6">
        {ideas.map(({ idea, variations }: any, idx: number) => (
          <div key={idea.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800 bg-gray-900/50">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 bg-violet-600/20 text-violet-400 rounded-md flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <p className="text-sm font-medium text-gray-200">{idea.concept}</p>
              </div>
            </div>
            <div className="divide-y divide-gray-800">
              {variations.map((v: any) => {
                const Icon = PLATFORM_ICONS[v.platform] || Sparkles;
                return (
                  <div key={v.id} className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={PLATFORM_COLORS[v.platform]} />
                        <span className="text-sm font-medium capitalize">{v.platform}</span>
                        {v.status === "edited" && (
                          <span className="text-xs text-blue-400 flex items-center gap-1"><Edit3 size={10} /> edited</span>
                        )}
                        {v.status === "approved" && (
                          <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 size={10} /> approved</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {v.predicted_engagement_score > 0 && (
                          <span className="flex items-center gap-1 text-green-400">
                            <TrendingUp size={11} /> {Math.round(v.predicted_engagement_score * 100)}%
                          </span>
                        )}
                        <span>{v.char_count} chars</span>
                      </div>
                    </div>

                    {editing === v.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={4}
                          className="w-full bg-gray-800 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(v.id)} className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 px-3 py-1.5 rounded-lg text-xs font-medium">
                            <Save size={12} /> Save
                          </button>
                          <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white px-3 py-1.5 text-xs">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap mb-2">{v.caption}</p>
                        {v.media_suggestion && (
                          <p className="text-xs text-gray-500 italic mb-2">📷 {v.media_suggestion}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={11} />
                            {v.scheduled_at ? new Date(v.scheduled_at).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "unscheduled"}
                          </span>
                          <button onClick={() => { setEditing(v.id); setEditText(v.caption); }} className="text-xs text-gray-400 hover:text-violet-400 flex items-center gap-1">
                            <Edit3 size={11} /> Edit
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
