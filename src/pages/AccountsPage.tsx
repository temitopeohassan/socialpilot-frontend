import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { accountsApi } from "../lib/api";
import { Facebook, Instagram, Twitter, Linkedin, Plus, Trash2, CheckCircle2 } from "lucide-react";

const PLATFORM_ICONS: Record<string, any> = { facebook: Facebook, instagram: Instagram, twitter: Twitter, linkedin: Linkedin };
const PLATFORM_COLORS: Record<string, string> = { facebook: "text-blue-500", instagram: "text-pink-500", twitter: "text-sky-400", linkedin: "text-blue-600" };

export default function AccountsPage() {
  const { workspaceId } = useAuthStore();
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (!workspaceId) return;
    accountsApi.list(workspaceId).then(r => setAccounts(r.data));
  }, [workspaceId]);

  const disconnect = async (id: number) => {
    await accountsApi.disconnect(id);
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Connected Accounts</h1>
      </div>

      <div className="space-y-3 mb-8">
        {accounts.length === 0 && <p className="text-gray-500 text-sm">No accounts connected yet.</p>}
        {accounts.map(a => {
          const Icon = PLATFORM_ICONS[a.platform] || Facebook;
          return (
            <div key={a.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                <Icon size={20} className={PLATFORM_COLORS[a.platform]} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{a.display_name}</p>
                <p className="text-xs text-gray-400">@{a.username} · {a.platform}</p>
              </div>
              <CheckCircle2 size={16} className={a.is_active ? "text-green-400" : "text-gray-600"} />
              <button onClick={() => disconnect(a.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={15} /></button>
            </div>
          );
        })}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold mb-4">Connect a New Account</h2>
        <div className="grid grid-cols-2 gap-3">
          {["Facebook", "Instagram", "Twitter/X", "LinkedIn", "TikTok"].map(p => (
            <button key={p} className="flex items-center gap-3 p-3 border border-gray-700 hover:border-violet-500 rounded-lg text-sm text-gray-300 hover:text-white transition-colors">
              <Plus size={14} className="text-violet-400" />
              Connect {p}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">OAuth flows will redirect to each platform for authorization.</p>
      </div>
    </div>
  );
}
