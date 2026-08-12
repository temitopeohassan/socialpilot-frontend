import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { teamApi } from "../lib/api";
import { Users, UserMinus, Crown, Edit3, Eye } from "lucide-react";

const ROLE_ICONS: Record<string, any> = { owner: Crown, admin: Edit3, editor: Edit3, viewer: Eye };
const ROLE_COLORS: Record<string, string> = { owner: "text-yellow-400", admin: "text-violet-400", editor: "text-blue-400", viewer: "text-gray-400" };

export default function TeamPage() {
  const { workspaceId } = useAuthStore();
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (!workspaceId) return;
    teamApi.members(workspaceId).then(r => setMembers(r.data));
  }, [workspaceId]);

  const removeMember = async (id: number) => {
    await teamApi.remove(id);
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users size={22} /> Team</h1>
        <button className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-sm font-medium">Invite Member</button>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
        {members.map(m => {
          const Icon = ROLE_ICONS[m.role] || Eye;
          return (
            <div key={m.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold">
                {m.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-gray-400">{m.email}</p>
              </div>
              <div className="flex items-center gap-1">
                <Icon size={13} className={ROLE_COLORS[m.role]} />
                <span className={`text-xs capitalize ${ROLE_COLORS[m.role]}`}>{m.role}</span>
              </div>
              {m.role !== "owner" && (
                <button onClick={() => removeMember(m.id)} className="text-gray-600 hover:text-red-400"><UserMinus size={15} /></button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
