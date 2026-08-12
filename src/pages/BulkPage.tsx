import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import { postsApi } from "../lib/api";
import { Layers, Plus, Trash2, Upload, CheckCircle2 } from "lucide-react";

interface BulkRow { caption: string; scheduled_at: string; }

export default function BulkPage() {
  const { workspaceId } = useAuthStore();
  const [rows, setRows] = useState<BulkRow[]>([{ caption: "", scheduled_at: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const addRow = () => setRows(r => [...r, { caption: "", scheduled_at: "" }]);
  const removeRow = (i: number) => setRows(r => r.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof BulkRow, val: string) =>
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: val } : row));

  const handleSubmit = async () => {
    if (!workspaceId) return;
    const validRows = rows.filter(r => r.caption.trim());
    if (!validRows.length) return;
    setSubmitting(true);
    try {
      await postsApi.bulk({
        workspace_id: workspaceId,
        account_ids: [],
        posts: validRows.map(r => ({ caption: r.caption, scheduled_at: r.scheduled_at ? new Date(r.scheduled_at).toISOString() : null })),
      });
      setSuccess(true);
      setRows([{ caption: "", scheduled_at: "" }]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Layers size={22} className="text-blue-400" /> Bulk Publish</h1>
        <button onClick={addRow} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm">
          <Plus size={14} /> Add Row
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl p-3 mb-4 text-sm">
          <CheckCircle2 size={16} /> Posts created successfully!
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden mb-4">
        <div className="grid grid-cols-[1fr_200px_40px] gap-0 border-b border-gray-800 px-4 py-2 text-xs text-gray-400 font-medium">
          <span>Caption</span><span>Schedule Date/Time</span><span />
        </div>
        {rows.map((row, i) => (
          <div key={i} className="grid grid-cols-[1fr_200px_40px] items-center border-b border-gray-800 last:border-0">
            <textarea
              value={row.caption}
              onChange={e => update(i, "caption", e.target.value)}
              placeholder={`Post ${i + 1} caption...`}
              rows={2}
              className="bg-transparent px-4 py-3 text-sm outline-none resize-none border-r border-gray-800"
            />
            <input
              type="datetime-local"
              value={row.scheduled_at}
              onChange={e => update(i, "scheduled_at", e.target.value)}
              className="bg-transparent px-4 py-3 text-sm outline-none border-r border-gray-800"
            />
            <button onClick={() => removeRow(i)} className="flex items-center justify-center text-gray-600 hover:text-red-400 h-full">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-4 py-2.5 rounded-lg text-sm font-medium">
          <Upload size={15} />
          {submitting ? "Submitting..." : `Submit ${rows.filter(r => r.caption).length} Posts`}
        </button>
        <p className="text-xs text-gray-500">{rows.length} rows · {rows.filter(r => r.caption.trim()).length} with content</p>
      </div>
    </div>
  );
}
