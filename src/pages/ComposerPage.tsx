import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { postsApi, aiApi, mediaApi } from "../lib/api";
import {
  Image, Link2, Calendar, Sparkles, Send, Save,
  Facebook, Instagram, Twitter, Linkedin, Hash, RefreshCw,
} from "lucide-react";

const PLATFORMS = [
  { id: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-500" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-500" },
  { id: "twitter", label: "Twitter/X", icon: Twitter, color: "text-sky-400" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
];

const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280, instagram: 2200, facebook: 63206, linkedin: 3000,
};

export default function ComposerPage() {
  const { workspaceId } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("professional");
  const [aiPlatform, setAiPlatform] = useState("instagram");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCaptions, setAiCaptions] = useState<string[]>([]);
  const [showAI, setShowAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const activePlatform = selectedPlatforms[0] || "instagram";
  const charLimit = PLATFORM_LIMITS[activePlatform] || 2200;
  const charCount = caption.length;
  const overLimit = charCount > charLimit;

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    try {
      const res = await aiApi.generateCaptions({
        topic: aiTopic,
        platform: aiPlatform,
        tone: aiTone,
        include_hashtags: true,
        include_emoji: true,
        variants: 3,
      });
      setAiCaptions(res.data.captions || []);
    } catch {
      setAiCaptions(["AI service unavailable. Check your API key configuration."]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!workspaceId || !files.length) return;
    const uploaded = await Promise.all(
      files.map((f) => mediaApi.upload(workspaceId, f))
    );
    setMediaFiles((prev) => [...prev, ...uploaded.map((r) => r.data)]);
  };

  const handleSave = async (publish = false) => {
    if (!workspaceId || !caption.trim()) {
      setError("Caption is required.");
      return;
    }
    if (!selectedPlatforms.length) {
      setError("Select at least one platform.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await postsApi.create({
        workspace_id: workspaceId,
        caption,
        account_ids: [], // In production: map selectedPlatforms → account IDs
        media_urls: mediaFiles.map((m) => m.url),
        link_url: linkUrl || null,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      });
      navigate("/app/calendar");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save post.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Compose Post</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Composer */}
        <div className="lg:col-span-2 space-y-5">
          {/* Platform selector */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-3 font-medium">Publish to</p>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map(({ id, label, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => togglePlatform(id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                    selectedPlatforms.includes(id)
                      ? "border-violet-500 bg-violet-500/10 text-white"
                      : "border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <Icon size={14} className={color} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Caption */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Caption</p>
              <button
                onClick={() => setShowAI(!showAI)}
                className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300"
              >
                <Sparkles size={12} />
                AI Assist
              </button>
            </div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What do you want to say?"
              rows={6}
              className={`w-full bg-gray-800 rounded-lg p-3 text-sm resize-none outline-none focus:ring-2 focus:ring-violet-500 ${
                overLimit ? "text-red-400" : "text-white"
              }`}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${overLimit ? "text-red-400" : "text-gray-500"}`}>
                {charCount} / {charLimit}
              </span>
            </div>
          </div>

          {/* Media */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm font-medium mb-3">Media</p>
            <div className="flex flex-wrap gap-3">
              {mediaFiles.map((m, i) => (
                <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-700 relative group">
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setMediaFiles((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-red-400 transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-500 hover:border-violet-500 hover:text-violet-400 transition-colors text-xs gap-1"
              >
                <Image size={18} />
                Add
              </button>
            </div>
            <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
          </div>

          {/* Link */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm font-medium mb-2">Link URL (optional)</p>
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
              <Link2 size={14} className="text-gray-400" />
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 text-sm hover:bg-gray-800 transition-colors"
            >
              <Save size={15} />
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={submitting || overLimit}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
            >
              <Send size={15} />
              {scheduledAt ? "Schedule" : "Publish Now"}
            </button>
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-5">
          {/* Schedule */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={15} className="text-gray-400" />
              <p className="text-sm font-medium">Schedule</p>
            </div>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            />
            {scheduledAt && (
              <p className="text-xs text-gray-400 mt-2">
                Will publish: {new Date(scheduledAt).toLocaleString()}
              </p>
            )}
          </div>

          {/* AI Studio Panel */}
          {showAI && (
            <div className="bg-gray-900 border border-violet-600/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={15} className="text-violet-400" />
                <p className="text-sm font-medium text-violet-300">AI Caption Generator</p>
              </div>
              <input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="What's this post about?"
                className="w-full bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 mb-2"
              />
              <div className="grid grid-cols-2 gap-2 mb-3">
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  {["professional", "casual", "funny", "inspirational", "urgent"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select
                  value={aiPlatform}
                  onChange={(e) => setAiPlatform(e.target.value)}
                  className="bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none"
                >
                  {["instagram", "facebook", "twitter", "linkedin"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleGenerateAI}
                disabled={aiLoading}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {aiLoading ? "Generating..." : "Generate Captions"}
              </button>

              {aiCaptions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {aiCaptions.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setCaption(c)}
                      className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 border border-gray-700 hover:border-violet-500 transition-all"
                    >
                      {c.slice(0, 120)}{c.length > 120 ? "…" : ""}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-sm font-medium mb-3">Preview</p>
            <div className="bg-gray-800 rounded-lg p-3">
              {caption ? (
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{caption}</p>
              ) : (
                <p className="text-sm text-gray-600 italic">Your caption will appear here...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
