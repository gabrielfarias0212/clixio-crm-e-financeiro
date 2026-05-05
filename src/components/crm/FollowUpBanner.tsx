import { useEffect, useState } from "react";
import { Bell, Check, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { CRMFollowup, fetchAllPendingFollowups, completeFollowup } from "@/utils/supabase/crm-activities";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function FollowUpBanner() {
  const [followups, setFollowups] = useState<CRMFollowup[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPendingFollowups()
      .then(setFollowups)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleComplete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await completeFollowup(id);
      setFollowups(prev => prev.filter(f => f.id !== id));
      toast.success("Follow-up concluído");
    } catch (e: any) { toast.error(e.message); }
  }

  if (loading || followups.length === 0) return null;

  const today = new Date().toISOString().split("T")[0];
  const overdue  = followups.filter(f => f.scheduled_date < today);
  const todayFus = followups.filter(f => f.scheduled_date === today);
  const upcoming = followups.filter(f => f.scheduled_date > today);

  const urgentCount = overdue.length + todayFus.length;

  const fmtDate = (d: string) => {
    if (d === today) return "Hoje";
    const diff = Math.ceil((new Date(d).getTime() - new Date(today).getTime()) / 86400000);
    if (diff < 0) return `${Math.abs(diff)}d atrasado`;
    if (diff === 1) return "Amanhã";
    return new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  const preview = expanded ? followups : followups.slice(0, 3);

  return (
    <div className={`mb-4 rounded-xl border ${urgentCount > 0 ? "border-orange-200 bg-orange-50" : "border-blue-100 bg-blue-50"}`}>
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3"
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${urgentCount > 0 ? "bg-orange-500" : "bg-blue-500"}`}>
          {urgentCount > 0 ? <AlertCircle size={14} className="text-white" /> : <Bell size={14} className="text-white" />}
        </div>
        <div className="flex-1 text-left">
          <p className={`text-sm font-semibold ${urgentCount > 0 ? "text-orange-800" : "text-blue-800"}`}>
            {urgentCount > 0
              ? `${urgentCount} follow-up${urgentCount > 1 ? "s" : ""} para hoje${overdue.length > 0 ? " (+ atrasados)" : ""}`
              : `${followups.length} follow-up${followups.length > 1 ? "s" : ""} agendado${followups.length > 1 ? "s" : ""}`
            }
          </p>
          {!expanded && (
            <p className="text-xs text-stone-500 mt-0.5 truncate">
              {followups.slice(0, 2).map(f => f.client_name).join(", ")}
              {followups.length > 2 ? ` +${followups.length - 2} mais` : ""}
            </p>
          )}
        </div>
        {expanded ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-1.5 border-t border-orange-100">
          {overdue.length > 0 && <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wide mt-2">Atrasados</p>}
          {[...overdue, ...todayFus, ...upcoming].map(fu => (
            <div key={fu.id} className="flex items-center gap-3 bg-white rounded-lg border border-stone-100 px-3 py-2">
              <button
                onClick={e => handleComplete(fu.id, e)}
                className="w-5 h-5 rounded-full border-2 border-stone-300 hover:border-green-400 flex items-center justify-center flex-shrink-0 transition-colors"
              >
                <Check size={10} className="text-stone-300 hover:text-green-500" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-stone-800 truncate">{fu.client_name}</p>
                {fu.description && <p className="text-[10px] text-stone-400 truncate">{fu.description}</p>}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap ${
                fu.scheduled_date < today ? "text-red-500" :
                fu.scheduled_date === today ? "text-orange-500" : "text-stone-400"
              }`}>
                {fmtDate(fu.scheduled_date)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
