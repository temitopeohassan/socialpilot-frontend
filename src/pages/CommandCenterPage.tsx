import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { agentApi } from "../lib/api";
import {
  Sparkles, Send, ArrowRight, Loader2, Wand2, Calendar,
  CheckCircle2, RotateCcw, MessageSquare, Lightbulb,
} from "lucide-react";

interface AgentMessage {
  role: "user" | "agent";
  content: string;
  result?: any;
}

const SUGGESTIONS = [
  "Schedule three LinkedIn posts for next week about our new product launch",
  "Plan a 5-post Instagram campaign for our summer sale this month",
  "Create a week of Twitter posts announcing our funding round",
  "Draft two LinkedIn posts about remote work culture for next Tuesday",
];

export default function CommandCenterPage() {
  const { workspaceId } = useAuthStore();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = async (prompt: string) => {
    if (!prompt.trim() || !workspaceId || loading) return;
    setMessages((m) => [...m, { role: "user", content: prompt }]);
    setInput("");
    setLoading(true);

    try {
      const res = await agentApi.chat(workspaceId, prompt);
      const data = res.data;
      let content = data.message || "";
      if (data.type === "clarification") content = data.question;
      if (data.type === "answer") content = data.message;
      setMessages((m) => [...m, { role: "agent", content, result: data }]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          role: "agent",
          content:
            e.response?.data?.detail ||
            "Something went wrong. Check that your ANTHROPIC_API_KEY is configured.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-800">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wand2 size={20} className="text-violet-400" />
          Command Center
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Describe what you want. The agent plans, writes, and schedules it for you.
        </p>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {isEmpty ? (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-violet-600/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-violet-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">What should we publish?</h2>
              <p className="text-gray-400">
                Tell me your goal in plain English — I'll handle the rest.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mb-3">
                <Lightbulb size={12} /> Try one of these
              </p>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  className="w-full text-left p-4 bg-gray-900 border border-gray-800 hover:border-violet-500/50 rounded-xl text-sm text-gray-300 transition-all group flex items-center gap-3"
                >
                  <MessageSquare size={15} className="text-violet-400 flex-shrink-0" />
                  <span className="flex-1">{s}</span>
                  <ArrowRight size={15} className="text-gray-600 group-hover:text-violet-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-5">
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === "user" ? "flex justify-end" : ""}>
                {msg.role === "user" ? (
                  <div className="bg-violet-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%] text-sm">
                    {msg.content}
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-600/15 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={16} className="text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-200">
                        {msg.content}
                      </div>
                      {msg.result?.type === "campaign_created" && (
                        <CampaignResultCard result={msg.result} onView={() => navigate(`/app/campaigns/${msg.result.campaign_id}`)} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-600/15 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={16} className="text-violet-400" />
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Planning your campaign…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="px-8 py-4 border-t border-gray-800">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-2 bg-gray-900 border border-gray-800 rounded-2xl p-2 focus-within:border-violet-500/50 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit(input);
                }
              }}
              placeholder="e.g. Schedule three LinkedIn posts for next week about…"
              rows={1}
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none resize-none max-h-32"
            />
            <button
              onClick={() => submit(input)}
              disabled={!input.trim() || loading}
              className="w-9 h-9 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            The agent applies your brand voice and predicts the best times to post automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

function CampaignResultCard({ result, onView }: { result: any; onView: () => void }) {
  return (
    <div className="mt-3 bg-gray-900 border border-violet-500/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 size={16} className="text-green-400" />
        <span className="font-semibold text-sm">{result.name}</span>
      </div>
      {result.strategy && (
        <p className="text-xs text-gray-400 mb-3">{result.strategy}</p>
      )}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs bg-gray-800 px-2 py-1 rounded-md text-gray-300">
          {result.variation_count} posts
        </span>
        {(result.platforms || []).map((p: string) => (
          <span key={p} className="text-xs bg-gray-800 px-2 py-1 rounded-md text-gray-300 capitalize">
            {p}
          </span>
        ))}
      </div>
      <button
        onClick={onView}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <Calendar size={14} />
        Review & schedule
      </button>
    </div>
  );
}
