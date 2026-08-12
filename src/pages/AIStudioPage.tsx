import { useState } from "react";
import { aiApi } from "../lib/api";
import { Sparkles, Hash, Zap, RefreshCw, Copy, Check } from "lucide-react";

type Tab = "captions" | "rewrite" | "hooks" | "hashtags";

export default function AIStudioPage() {
  const [activeTab, setActiveTab] = useState<Tab>("captions");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [copied, setCopied] = useState<number | null>(null);

  // Captions
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("professional");

  // Rewrite
  const [original, setOriginal] = useState("");

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResults(null);
    try {
      let res;
      if (activeTab === "captions") {
        res = await aiApi.generateCaptions({ topic, platform, tone, variants: 3, include_hashtags: true, include_emoji: true });
        setResults(res.data.captions);
      } else if (activeTab === "rewrite") {
        res = await aiApi.rewrite({ original, platform, tone });
        setResults([res.data.rewritten]);
      } else if (activeTab === "hooks") {
        res = await aiApi.hooks({ topic, platform });
        setResults(res.data.hooks);
      } else if (activeTab === "hashtags") {
        res = await aiApi.hashtags(topic, platform);
        setResults(res.data.hashtags);
      }
    } catch {
      setResults(["Error: AI service unavailable. Check ANTHROPIC_API_KEY in backend."]);
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "captions", label: "Caption Generator", icon: Sparkles },
    { id: "rewrite", label: "Rewrite", icon: RefreshCw },
    { id: "hooks", label: "Hook Generator", icon: Zap },
    { id: "hashtags", label: "Hashtags", icon: Hash },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles size={24} className="text-violet-400" />
          AI Studio
        </h1>
        <p className="text-gray-400 mt-1">Generate captions, hooks, rewrites, and hashtags with AI.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setResults(null); }}
            className={`flex items-center gap-2 flex-1 justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        {activeTab !== "rewrite" && (
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Topic / Subject</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. New product launch, Summer sale, Tech tips..."
              className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        )}

        {activeTab === "rewrite" && (
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Original Caption</label>
            <textarea
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              rows={4}
              placeholder="Paste your existing caption here..."
              className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 resize-none"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1.5">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none"
            >
              {["instagram", "facebook", "twitter", "linkedin", "tiktok"].map((p) => (
                <option key={p} value={p} className="capitalize">{p}</option>
              ))}
            </select>
          </div>
          {activeTab !== "hashtags" && (
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1.5">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-sm outline-none"
              >
                {["professional", "casual", "funny", "inspirational", "urgent", "educational"].map((t) => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || (!topic.trim() && !original.trim())}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-3 rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-medium text-gray-300">Results</h2>
          {activeTab === "hashtags" ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex flex-wrap gap-2">
                {results.map((tag: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => copyToClipboard(tag, i)}
                    className="px-3 py-1 bg-violet-600/20 text-violet-300 rounded-full text-sm hover:bg-violet-600/40 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <button
                onClick={() => copyToClipboard(results.join(" "), 999)}
                className="mt-3 text-xs text-gray-400 hover:text-white flex items-center gap-1"
              >
                {copied === 999 ? <Check size={12} /> : <Copy size={12} />}
                Copy all
              </button>
            </div>
          ) : (
            results.map((item: string, i: number) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 relative group">
                <p className="text-sm text-gray-300 whitespace-pre-wrap pr-8">{item}</p>
                <button
                  onClick={() => copyToClipboard(item, i)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-white"
                >
                  {copied === i ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
