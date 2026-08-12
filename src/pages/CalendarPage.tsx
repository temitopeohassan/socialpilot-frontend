// Calendar Page
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { postsApi } from "../lib/api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_DOT: Record<string, string> = {
  published: "bg-green-400", scheduled: "bg-blue-400", failed: "bg-red-400", draft: "bg-gray-400",
};

export function CalendarPage() {
  const { workspaceId } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!workspaceId) return;
    postsApi.list({ workspace_id: workspaceId, per_page: 100 }).then((r) => setPosts(r.data.data || []));
  }, [workspaceId]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const postsByDate: Record<string, any[]> = {};
  posts.forEach((p) => {
    const date = (p.scheduled_at || p.created_at)?.slice(0, 10);
    if (date) {
      postsByDate[date] = postsByDate[date] || [];
      postsByDate[date].push(p);
    }
  });

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Content Calendar</h1>
        <Link to="/app/compose" className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + New Post
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="text-gray-400 hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-semibold">{monthNames[month]} {year}</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="text-gray-400 hover:text-white">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-gray-800">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="text-center text-xs text-gray-500 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const dateStr = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
            const dayPosts = dateStr ? postsByDate[dateStr] || [] : [];
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

            return (
              <div key={i} className={`min-h-[90px] border-b border-r border-gray-800 p-2 ${!day ? "bg-gray-950/50" : ""}`}>
                {day && (
                  <>
                    <p className={`text-xs font-medium mb-1 ${isToday ? "text-violet-400" : "text-gray-300"}`}>{day}</p>
                    {dayPosts.slice(0, 3).map((p, j) => (
                      <div key={j} className="flex items-center gap-1 mb-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[p.status]}`} />
                        <p className="text-xs text-gray-400 truncate">{p.caption?.slice(0, 20)}</p>
                      </div>
                    ))}
                    {dayPosts.length > 3 && <p className="text-xs text-gray-600">+{dayPosts.length - 3} more</p>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;
