import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { brandVoiceApi } from "../lib/api";
import { Mic, Save, Sparkles, Plus, X, Wand2 } from "lucide-react";

const TONE_OPTIONS = ["friendly", "confident", "witty", "professional", "bold", "warm", "playful", "authoritative", "empathetic", "concise"];

export default function BrandVoicePage() {
  const { workspaceId } = useAuthStore();
  const [voice, setVoice] = useState<any>({
    description: "", tone_attributes: [], target_audience: "", writing_sample: "",
    do_rules: [], dont_rules: [], banned_words: [], preferred_emoji_level: "some", preferred_hashtag_count: 5,
  });
  const [saved, setSaved] = useState(false);
  const [learnSamples, setLearnSamples] = useState("");
  const [learning, setLearning] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    brandVoiceApi.get(workspaceId).then((r) => {
      if (r.data && r.data.id) {
        setVoice({
          ...r.data,
          tone_attributes: JSON.parse(r.data.tone_attributes || "[]"),
          do_rules: JSON.parse(r.data.do_rules || "[]"),
          dont_rules: JSON.parse(r.data.dont_rules || "[]"),
          banned_words: JSON.parse(r.data.banned_words || "[]"),
        });
      }
    });
  }, [workspaceId]);

  const save = async () => {
    if (!workspaceId) return;
    await brandVoiceApi.save({ ...voice, workspace_id: workspaceId });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const learn = async () => {
    if (!workspaceId || !learnSamples.trim()) return;
    setLearning(true);
    try {
      const samples = learnSamples.split("\n---\n").map((s) => s.trim()).filter(Boolean);
      const r = await brandVoiceApi.learnFromSamples(workspaceId, samples);
      setVoice({
        ...r.data,
        tone_attributes: JSON.parse(r.data.tone_attributes || "[]"),
        do_rules: JSON.parse(r.data.do_rules || "[]"),
        dont_rules: JSON.parse(r.data.dont_rules || "[]"),
        banned_words: JSON.parse(r.data.banned_words || "[]"),
      });
    } finally {
      setLearning(false);
    }
  };

  const toggleTone = (t: string) =>
    setVoice((v: any) => ({
      ...v,
      tone_attributes: v.tone_attributes.includes(t)
        ? v.tone_attributes.filter((x: string) => x !== t)
        : [...v.tone_attributes, t],
    }));

  const ListEditor = ({ field, label, placeholder }: any) => {
    const [val, setVal] = useState("");
    return (
      <div>
        <label className="text-sm font-medium text-gray-300 block mb-1.5">{label}</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {voice[field].map((item: string, i: number) => (
            <span key={i} className="flex items-center gap-1 bg-gray-800 px-2 py-1 rounded-md text-xs">
              {item}
              <button onClick={() => setVoice((v: any) => ({ ...v, [field]: v[field].filter((_: any, idx: number) => idx !== i) }))}>
                <X size={11} className="text-gray-500 hover:text-red-400" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={val} onChange={(e) => setVal(e.target.value)} placeholder={placeholder}
            onKeyDown={(e) => { if (e.key === "Enter" && val.trim()) { setVoice((v: any) => ({ ...v, [field]: [...v[field], val.trim()] })); setVal(""); } }}
            className="flex-1 bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none" />
          <button onClick={() => { if (val.trim()) { setVoice((v: any) => ({ ...v, [field]: [...v[field], val.trim()] })); setVal(""); } }}
            className="px-3 bg-gray-800 hover:bg-gray-700 rounded-lg"><Plus size={14} /></button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <Mic size={22} className="text-violet-400" />
        <h1 className="text-2xl font-bold">Brand Voice</h1>
      </div>
      <p className="text-sm text-gray-400 mb-6">
        Defined once, applied to every post the agent writes. It also learns from what you approve and edit.
      </p>

      {voice.learned_summary && (
        <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-4 mb-6">
          <p className="text-xs font-medium text-violet-300 mb-1 flex items-center gap-1.5">
            <Sparkles size={12} /> Learned from {voice.sample_count} approved posts
          </p>
          <p className="text-sm text-gray-300">{voice.learned_summary}</p>
        </div>
      )}

      {/* Learn from samples */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
        <p className="text-sm font-medium mb-2 flex items-center gap-1.5"><Wand2 size={15} className="text-violet-400" /> Bootstrap from existing posts</p>
        <p className="text-xs text-gray-500 mb-3">Paste a few posts you love (separate with a line of <code>---</code>). The agent will extract your voice.</p>
        <textarea value={learnSamples} onChange={(e) => setLearnSamples(e.target.value)} rows={4}
          placeholder={"Post one...\n---\nPost two..."}
          className="w-full bg-gray-800 rounded-lg p-3 text-sm outline-none resize-none mb-2" />
        <button onClick={learn} disabled={learning} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-3 py-2 rounded-lg text-sm font-medium">
          <Sparkles size={14} /> {learning ? "Analyzing…" : "Extract voice"}
        </button>
      </div>

      {/* Manual definition */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1.5">Voice description</label>
          <input value={voice.description} onChange={(e) => setVoice((v: any) => ({ ...v, description: e.target.value }))}
            placeholder="e.g. Warm, witty, expert-but-approachable" className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1.5">Tone attributes</label>
          <div className="flex flex-wrap gap-2">
            {TONE_OPTIONS.map((t) => (
              <button key={t} onClick={() => toggleTone(t)} className={`px-3 py-1 rounded-full text-xs capitalize transition-colors ${
                voice.tone_attributes.includes(t) ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}>{t}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1.5">Target audience</label>
          <input value={voice.target_audience} onChange={(e) => setVoice((v: any) => ({ ...v, target_audience: e.target.value }))}
            placeholder="e.g. Early-career developers in fintech" className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none" />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 block mb-1.5">Writing sample</label>
          <textarea value={voice.writing_sample} onChange={(e) => setVoice((v: any) => ({ ...v, writing_sample: e.target.value }))}
            rows={3} placeholder="A paragraph that sounds exactly like your brand…" className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none resize-none" />
        </div>

        <ListEditor field="do_rules" label="Always (do rules)" placeholder="e.g. Lead with a concrete benefit" />
        <ListEditor field="dont_rules" label="Never (don't rules)" placeholder="e.g. Use corporate jargon" />
        <ListEditor field="banned_words" label="Banned words" placeholder="e.g. synergy" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Emoji level</label>
            <select value={voice.preferred_emoji_level} onChange={(e) => setVoice((v: any) => ({ ...v, preferred_emoji_level: e.target.value }))}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none">
              {["none", "some", "heavy"].map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Default hashtags</label>
            <input type="number" value={voice.preferred_hashtag_count} onChange={(e) => setVoice((v: any) => ({ ...v, preferred_hashtag_count: +e.target.value }))}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none" />
          </div>
        </div>

        <button onClick={save} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-4 py-2.5 rounded-lg text-sm font-medium">
          <Save size={15} /> {saved ? "Saved!" : "Save brand voice"}
        </button>
      </div>
    </div>
  );
}
