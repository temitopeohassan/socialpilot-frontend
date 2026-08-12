import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { mediaApi } from "../lib/api";
import { Upload, Trash2, Image, Video } from "lucide-react";

export default function MediaPage() {
  const { workspaceId } = useAuthStore();
  const [media, setMedia] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    if (!workspaceId) return;
    mediaApi.list(workspaceId, filter !== "all" ? { file_type: filter } : {}).then(r => setMedia(r.data));
  };

  useEffect(() => { load(); }, [workspaceId, filter]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!workspaceId || !files.length) return;
    await Promise.all(files.map(f => mediaApi.upload(workspaceId, f)));
    load();
  };

  const handleDelete = async (id: number) => {
    await mediaApi.delete(id);
    setMedia(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="flex gap-2">
          <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
            {["all", "image", "video"].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded text-sm capitalize ${filter === f ? "bg-violet-600 text-white" : "text-gray-400"}`}>{f}</button>
            ))}
          </div>
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-sm font-medium">
            <Upload size={15} /> Upload
          </button>
        </div>
      </div>
      <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleUpload} />

      {media.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-800 rounded-xl text-gray-500">
          <Image size={40} className="mb-3 opacity-30" />
          <p>No media yet. Upload your first file.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {media.map(m => (
            <div key={m.id} className="group relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden aspect-square">
              {m.file_type === "image" ? (
                <img src={m.url} alt={m.original_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Video size={32} className="text-gray-500" /></div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-300"><Trash2 size={20} /></button>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 p-2">
                <p className="text-xs text-gray-300 truncate">{m.original_name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
