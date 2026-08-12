import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { intelligenceApi } from "../lib/api";
import {
  Brain, Zap, Target, MessageCircle, TrendingUp, Eye,
  ChevronDown, ChevronUp, Loader2, Plus, X, BarChart2,
  Lightbulb, ArrowRight, CheckCircle2, AlertTriangle, Layers,
} from "lucide-react";

const PLATFORMS = ["", "linkedin", "instagram", "twitter", "facebook", "tiktok"];
const PLATFORM_LABELS: Record<string, string> = {
  "": "Any platform", linkedin: "LinkedIn", instagram: "Instagram",
  twitter: "Twitter/X", facebook: "Facebook", tiktok: "TikTok",
};

type Mode = "single" | "compare" | "batch";

export default function PostIntelligencePage() {
  const { workspaceId } = useAuthStore();
  const [mode, setMode] = useState<Mode>("single");
  const [caption, setCaption] = useState("");
  const [captionB, setCaptionB] = useState("");
  const [batchCaptions, setBatchCaptions] = useState<string[]>(["", ""]);
  const [platform, setPlatform] = useState("");
  const [niche, setNiche] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setExpanded(e => ({ ...e, [key]: !e[key] }));

  const run = async () => {
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (mode === "single") {
        res = await intelligenceApi.analyze({ caption, platform_hint: platform, niche_hint: niche, workspace_id: workspaceId ?? undefined });
        setResult({ type: "single", data: res.data });
      } else if (mode === "compare") {
        res = await intelligenceApi.compare({ caption_a: caption, caption_b: captionB, platform_hint: platform, niche_hint: niche, workspace_id: workspaceId ?? undefined });
        setResult({ type: "compare", data: res.data });
      } else {
        const valid = batchCaptions.filter(c => c.trim());
        res = await intelligenceApi.batch(valid, workspaceId ?? undefined);
        setResult({ type: "batch", data: res.data });
      }
    } catch (e: any) {
      setResult({ type: "error", message: e.response?.data?.detail || "Analysis failed" });
    } finally {
      setLoading(false);
    }
  };

  const canRun = mode === "single" ? caption.trim().length > 10
    : mode === "compare" ? caption.trim().length > 10 && captionB.trim().length > 10
    : batchCaptions.filter(c => c.trim()).length >= 2;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Brain size={22} className="text-violet-400" />
        <h1 className="text-2xl font-bold">Post Intelligence</h1>
      </div>
      <p className="text-sm text-gray-400 mb-6">
        Analyze any post — your own draft, a published post, or a competitor's. Get intent analysis, hook scoring, platform fit, and specific rewrites.
      </p>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-5 w-fit">
        {(["single", "compare", "batch"] as Mode[]).map(m => (
          <button key={m} onClick={() => { setMode(m); setResult(null); }}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${mode === m ? "bg-violet-600 text-white font-medium" : "text-gray-400 hover:text-white"}`}>
            {m === "single" ? "Analyze" : m === "compare" ? "Compare" : "Batch"}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1.5 block">Platform (optional)</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none">
              {PLATFORMS.map(p => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1.5 block">Industry/niche (optional)</label>
            <input value={niche} onChange={e => setNiche(e.target.value)}
              placeholder="e.g. fintech, SaaS, fashion" className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none" />
          </div>
        </div>

        {mode === "single" && (
          <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={5}
            placeholder="Paste any post here — your draft, a published post, or a competitor's caption..."
            className="w-full bg-gray-800 rounded-lg p-3 text-sm outline-none resize-none" />
        )}

        {mode === "compare" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Post A</p>
              <textarea value={caption} onChange={e => setCaption(e.target.value)} rows={6}
                placeholder="First post..." className="w-full bg-gray-800 rounded-lg p-3 text-sm outline-none resize-none" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1.5">Post B</p>
              <textarea value={captionB} onChange={e => setCaptionB(e.target.value)} rows={6}
                placeholder="Second post to compare..." className="w-full bg-gray-800 rounded-lg p-3 text-sm outline-none resize-none" />
            </div>
          </div>
        )}

        {mode === "batch" && (
          <div className="space-y-2">
            {batchCaptions.map((c, i) => (
              <div key={i} className="flex gap-2">
                <textarea value={c} onChange={e => setBatchCaptions(prev => prev.map((x, j) => j === i ? e.target.value : x))}
                  rows={2} placeholder={`Post ${i + 1}...`}
                  className="flex-1 bg-gray-800 rounded-lg p-3 text-sm outline-none resize-none" />
                {batchCaptions.length > 2 && (
                  <button onClick={() => setBatchCaptions(prev => prev.filter((_, j) => j !== i))}
                    className="self-start mt-1 p-1.5 text-gray-500 hover:text-red-400">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {batchCaptions.length < 10 && (
              <button onClick={() => setBatchCaptions(prev => [...prev, ""])}
                className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300">
                <Plus size={14} /> Add post
              </button>
            )}
          </div>
        )}

        <button onClick={run} disabled={!canRun || loading}
          className="mt-4 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Brain size={15} />}
          {loading ? "Analyzing…" : mode === "single" ? "Analyze post" : mode === "compare" ? "Compare posts" : "Analyze batch"}
        </button>
      </div>

      {/* Results */}
      {result?.type === "error" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {result.message}
        </div>
      )}

      {result?.type === "single" && <SingleReport data={result.data} expanded={expanded} toggle={toggle} />}
      {result?.type === "compare" && <CompareReport data={result.data} expanded={expanded} toggle={toggle} />}
      {result?.type === "batch" && <BatchReport data={result.data} expanded={expanded} toggle={toggle} />}
    </div>
  );
}

// ─── Single Report ────────────────────────────────────────────────────────────

function SingleReport({ data, expanded, toggle }: any) {
  const structure = data.structure || {};
  const readability = data.readability || {};
  const platformFit = data.platform_fit || {};
  const improvements = data.improvements || [];
  const triggers = data.psychological_triggers || [];

  const scoreColor = (s: number) => s >= 8 ? "text-green-400" : s >= 6 ? "text-yellow-400" : "text-red-400";
  const scoreBar = (s: number, max = 10) => (
    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-1">
      <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${(s / max) * 100}%` }} />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="bg-gray-900 border border-violet-500/30 rounded-xl p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-violet-300 font-medium mb-1 flex items-center gap-1"><Brain size={11} /> AI Summary</p>
            <p className="text-sm text-gray-300">{data.summary}</p>
          </div>
          <div className="text-center ml-4 flex-shrink-0">
            <p className={`text-3xl font-bold ${scoreColor(data.overall_score)}`}>{data.overall_score}<span className="text-base text-gray-500">/10</span></p>
            <p className="text-xs text-gray-500">Overall</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs bg-violet-600/20 text-violet-300 px-2 py-1 rounded-full capitalize">{data.primary_intent?.replace(/_/g, " ")}</span>
          {data.secondary_intent && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full capitalize">{data.secondary_intent?.replace(/_/g, " ")}</span>}
          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full capitalize">{data.predicted_engagement_type?.replace(/_/g, " ")} predicted</span>
        </div>
      </div>

      {/* Hook */}
      <Section title="Hook Analysis" icon={Zap} score={data.hook_score} expanded={expanded} toggle={toggle}>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div><p className="text-xs text-gray-500 mb-0.5">Type</p><p className="text-sm capitalize">{data.hook_type?.replace(/_/g, " ") || "—"}</p></div>
          <div><p className="text-xs text-gray-500 mb-0.5">Score</p><p className={`text-sm font-bold ${scoreColor(data.hook_score)}`}>{data.hook_score}/10</p></div>
        </div>
        <p className="text-sm text-gray-300 mb-3">{data.hook_analysis}</p>
        {data.hook_rewrite && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <p className="text-xs text-green-400 font-medium mb-1 flex items-center gap-1"><Lightbulb size={11} /> Stronger opening</p>
            <p className="text-sm text-gray-200 italic">"{data.hook_rewrite}"</p>
          </div>
        )}
      </Section>

      {/* Structure */}
      <Section title="Structure" icon={Layers} expanded={expanded} toggle={toggle}>
        <div className="grid grid-cols-3 gap-3 mb-3">
          {[["Hook", structure.has_hook], ["Body", structure.has_body], ["CTA", structure.has_cta]].map(([label, val]) => (
            <div key={String(label)} className={`text-center p-3 rounded-lg ${val ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              {val ? <CheckCircle2 size={16} className="text-green-400 mx-auto mb-1" /> : <AlertTriangle size={16} className="text-red-400 mx-auto mb-1" />}
              <p className="text-xs">{String(label)}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-4 text-sm text-gray-400">
          <span>CTA quality: <span className="text-gray-200 capitalize">{structure.cta_quality}</span></span>
          <span>Arc: <span className="text-gray-200 capitalize">{structure.narrative_arc}</span></span>
        </div>
        {structure.cta_text && <p className="text-xs text-gray-500 mt-2">CTA: <span className="text-gray-300 italic">"{structure.cta_text}"</span></p>}
      </Section>

      {/* Platform fit */}
      <Section title="Platform Fit" icon={Target} expanded={expanded} toggle={toggle}>
        <div className="space-y-3">
          {Object.entries(platformFit).map(([plt, fit]: any) => (
            <div key={plt}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize font-medium">{plt}</span>
                <span className={scoreColor(fit.score)}>{fit.score}/10</span>
              </div>
              {scoreBar(fit.score)}
              <p className="text-xs text-gray-500 mt-1">{fit.notes}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Triggers + Readability */}
      <Section title="Tone & Triggers" icon={Eye} expanded={expanded} toggle={toggle}>
        {triggers.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Psychological triggers used</p>
            <div className="flex flex-wrap gap-2">
              {triggers.map((t: string) => (
                <span key={t} className="text-xs bg-violet-600/20 text-violet-300 px-2 py-1 rounded-full capitalize">{t}</span>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {Object.entries(readability).map(([k, v]) => (
            <div key={k}><p className="text-xs text-gray-500 capitalize">{k.replace(/_/g, " ")}</p><p className="text-gray-200 capitalize">{String(v)}</p></div>
          ))}
        </div>
      </Section>

      {/* Improvements */}
      {improvements.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="font-medium flex items-center gap-2 mb-4"><Lightbulb size={16} className="text-yellow-400" /> Improvements</p>
          <div className="space-y-4">
            {improvements.map((imp: any, i: number) => (
              <div key={i} className="border-l-2 border-violet-500/30 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-gray-700 px-2 py-0.5 rounded capitalize">{imp.area}</span>
                  <AlertTriangle size={12} className="text-yellow-400" />
                  <span className="text-xs text-gray-400">{imp.issue}</span>
                </div>
                <p className="text-sm text-gray-200">{imp.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Compare Report ────────────────────────────────────────────────────────────

function CompareReport({ data }: any) {
  const { report_a, report_b, comparison } = data;
  const scoreColor = (s: number) => s >= 8 ? "text-green-400" : s >= 6 ? "text-yellow-400" : "text-red-400";
  const winner = comparison?.winner;

  return (
    <div className="space-y-4">
      {/* Verdict */}
      <div className="bg-gray-900 border border-violet-500/30 rounded-xl p-5">
        <p className="text-xs text-violet-300 font-medium mb-2 flex items-center gap-1"><Brain size={11} /> Verdict</p>
        <div className="flex items-center gap-3 mb-3">
          {winner && winner !== "tie" && (
            <span className="bg-violet-600 text-white px-3 py-1 rounded-lg font-bold">
              Post {winner} wins {comparison.margin !== "close" ? `(${comparison.margin})` : ""}
            </span>
          )}
          {winner === "tie" && <span className="bg-gray-700 px-3 py-1 rounded-lg font-bold">Tie</span>}
        </div>
        <p className="text-sm text-gray-300 mb-3">{comparison?.verdict}</p>
        {comparison?.hybrid_suggestion && (
          <p className="text-sm text-violet-300 italic flex items-start gap-1.5">
            <Lightbulb size={13} className="mt-0.5 flex-shrink-0" /> {comparison.hybrid_suggestion}
          </p>
        )}
      </div>

      {/* Side by side scores */}
      <div className="grid grid-cols-2 gap-4">
        {[{ label: "Post A", report: report_a }, { label: "Post B", report: report_b }].map(({ label, report }) => (
          <div key={label} className={`bg-gray-900 border rounded-xl p-5 ${winner === label.slice(-1) ? "border-violet-500/50" : "border-gray-800"}`}>
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold">{label}</p>
              <p className={`text-2xl font-bold ${scoreColor(report.overall_score)}`}>{report.overall_score}<span className="text-sm text-gray-500">/10</span></p>
            </div>
            <p className="text-xs text-gray-400 mb-3 line-clamp-3">{report.caption}</p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400"><span>Hook</span><span className={scoreColor(report.hook_score)}>{report.hook_score}/10</span></div>
              <div className="flex justify-between text-gray-400"><span>Intent</span><span className="capitalize text-gray-200">{report.primary_intent?.replace(/_/g, " ")}</span></div>
              <div className="flex justify-between text-gray-400"><span>Predicted</span><span className="capitalize text-gray-200">{report.predicted_engagement_type?.replace(/_/g, " ")}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Wins per side */}
      {comparison && (
        <div className="grid grid-cols-2 gap-4">
          {[{ label: "Post A wins on", wins: comparison.a_wins_on }, { label: "Post B wins on", wins: comparison.b_wins_on }].map(({ label, wins }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 font-medium mb-2">{label}</p>
              <ul className="space-y-1">
                {(wins || []).map((w: string, i: number) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-1.5"><CheckCircle2 size={12} className="text-green-400 mt-0.5 flex-shrink-0" />{w}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Batch Report ─────────────────────────────────────────────────────────────

function BatchReport({ data }: any) {
  const { reports, patterns, average_score } = data;
  const scoreColor = (s: number) => s >= 8 ? "text-green-400" : s >= 6 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="space-y-4">
      {/* Pattern summary */}
      <div className="bg-gray-900 border border-violet-500/30 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-medium flex items-center gap-2"><BarChart2 size={16} className="text-violet-400" /> Batch Analysis — {reports.length} posts</p>
          <div className="text-center">
            <p className={`text-2xl font-bold ${scoreColor(average_score)}`}>{average_score}<span className="text-sm text-gray-500">/10</span></p>
            <p className="text-xs text-gray-500">avg score</p>
          </div>
        </div>

        {patterns && (
          <div className="grid grid-cols-2 gap-4">
            {[{ label: "Patterns", items: patterns.patterns, color: "blue" },
              { label: "Strengths", items: patterns.strengths, color: "green" },
              { label: "Weaknesses", items: patterns.weaknesses, color: "red" },
              { label: "Recommendations", items: patterns.recommendations, color: "violet" }
            ].map(({ label, items, color }) => (
              <div key={label}>
                <p className="text-xs text-gray-500 font-medium mb-2">{label}</p>
                <ul className="space-y-1">
                  {(items || []).map((item: string, i: number) => (
                    <li key={i} className={`text-xs text-gray-300 flex items-start gap-1.5`}>
                      <ArrowRight size={10} className={`text-${color}-400 mt-0.5 flex-shrink-0`} />{item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Individual scores */}
      <div className="grid grid-cols-2 gap-3">
        {reports.map((r: any, i: number) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Post {i + 1}</span>
              <span className={`font-bold ${scoreColor(r.overall_score)}`}>{r.overall_score}/10</span>
            </div>
            <p className="text-xs text-gray-400 line-clamp-2 mb-2">{r.caption}</p>
            <div className="flex gap-2 text-xs text-gray-500">
              <span className="capitalize">{r.primary_intent?.replace(/_/g, " ")}</span>
              <span>·</span>
              <span>Hook {r.hook_score}/10</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function Section({ title, icon: Icon, score, expanded, toggle, children }: any) {
  const isOpen = expanded[title] !== false; // default open
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <button onClick={() => toggle(title)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-violet-400" />
          <span className="font-medium text-sm">{title}</span>
          {score !== undefined && <span className="text-xs text-gray-500">{score}/10</span>}
        </div>
        {isOpen ? <ChevronUp size={15} className="text-gray-500" /> : <ChevronDown size={15} className="text-gray-500" />}
      </button>
      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}
