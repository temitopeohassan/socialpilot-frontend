import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { approvalApi } from "../lib/api";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Edit3, Sparkles,
} from "lucide-react";

export default function ApprovalsPage() {
  const { workspaceId } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [comment, setComment] = useState<Record<number, string>>({});

  const load = () => {
    if (!workspaceId) return;
    approvalApi.pending(workspaceId).then((r) => setItems(r.data));
  };
  useEffect(load, [workspaceId]);

  const decide = async (id: number, decision: string) => {
    await approvalApi.decide(id, decision, comment[id] || "");
    load();
  };

  const riskColor = (score: number) =>
    score >= 0.7 ? "text-red-400" : score >= 0.25 ? "text-yellow-400" : "text-green-400";
  const riskLabel = (score: number) =>
    score >= 0.7 ? "High risk" : score >= 0.25 ? "Review" : "Low risk";

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck size={22} className="text-violet-400" />
        <h1 className="text-2xl font-bold">Approvals</h1>
      </div>
      <p className="text-sm text-gray-400 mb-6">
        The agent pre-screened these. Highest-risk items are shown first.
      </p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-56 border-2 border-dashed border-gray-800 rounded-xl text-gray-500">
          <CheckCircle2 size={36} className="mb-3 opacity-30" />
          <p>Nothing waiting for review. The agent auto-approved everything safe.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(({ request, findings, variation }) => (
            <div key={request.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              {/* AI verdict */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-violet-400" />
                  <span className="text-xs text-gray-400">Agent assessment</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`flex items-center gap-1 ${riskColor(request.ai_risk_score)}`}>
                    <AlertTriangle size={11} /> {riskLabel(request.ai_risk_score)}
                  </span>
                  <span className="text-gray-500">
                    brand fit {Math.round(request.brand_alignment_score * 100)}%
                  </span>
                </div>
              </div>

              {/* Caption */}
              {variation && (
                <div className="bg-gray-800 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-1 capitalize">{variation.platform}</p>
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{variation.caption}</p>
                </div>
              )}

              {/* Findings */}
              {findings.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Flagged:</p>
                  <ul className="space-y-1">
                    {findings.map((f: string, i: number) => (
                      <li key={i} className="text-xs text-yellow-400/90 flex items-start gap-1.5">
                        <AlertTriangle size={11} className="mt-0.5 flex-shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <input
                value={comment[request.id] || ""}
                onChange={(e) => setComment((c) => ({ ...c, [request.id]: e.target.value }))}
                placeholder="Optional comment…"
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none mb-3"
              />

              <div className="flex gap-2">
                <button onClick={() => decide(request.id, "approved")} className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded-lg text-xs font-medium">
                  <CheckCircle2 size={13} /> Approve
                </button>
                <button onClick={() => decide(request.id, "changes_requested")} className="flex items-center gap-1.5 bg-yellow-600/80 hover:bg-yellow-600 px-3 py-1.5 rounded-lg text-xs font-medium">
                  <Edit3 size={13} /> Request changes
                </button>
                <button onClick={() => decide(request.id, "rejected")} className="flex items-center gap-1.5 bg-red-600/80 hover:bg-red-600 px-3 py-1.5 rounded-lg text-xs font-medium">
                  <XCircle size={13} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
