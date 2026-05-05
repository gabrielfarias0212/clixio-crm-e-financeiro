import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Phone, Mail, Users, FileText, Plus, Check, Trash2, Bell, Calendar, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CRMActivity, CRMFollowup, ActivityType, ACTIVITY_TYPES,
  fetchActivities, addActivity, deleteActivity,
  fetchFollowups, addFollowup, completeFollowup, deleteFollowup,
} from "@/utils/supabase/crm-activities";

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  MessageCircle, Phone, Mail, Users, FileText,
};

interface Props { clientId: string; clientName: string; }

type Tab = "history" | "followup";

export function CRMActivityPanel({ clientId, clientName }: Props) {
  const [tab, setTab] = useState<Tab>("history");
  const [activities, setActivities] = useState<CRMActivity[]>([]);
  const [followups, setFollowups] = useState<CRMFollowup[]>([]);
  const [loading, setLoading] = useState(true);

  // Activity form
  const [actType, setActType] = useState<ActivityType>("whatsapp");
  const [actText, setActText] = useState("");
  const [savingAct, setSavingAct] = useState(false);

  // Follow-up form
  const [fuDate, setFuDate] = useState("");
  const [fuNote, setFuNote] = useState("");
  const [savingFu, setSavingFu] = useState(false);

  const load = useCallback(async () => {
    try {
      const [acts, fups] = await Promise.all([fetchActivities(clientId), fetchFollowups(clientId)]);
      setActivities(acts);
      setFollowups(fups);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [clientId]);

  useEffect(() => { load(); }, [load]);

  async function handleAddActivity() {
    if (!actText.trim()) return;
    setSavingAct(true);
    try {
      const created = await addActivity(clientId, actType, actText.trim());
      setActivities(prev => [created, ...prev]);
      setActText("");
      toast.success("Atividade registrada");
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingAct(false); }
  }

  async function handleDeleteActivity(id: string) {
    try {
      await deleteActivity(id);
      setActivities(prev => prev.filter(a => a.id !== id));
    } catch (e: any) { toast.error(e.message); }
  }

  async function handleAddFollowup() {
    if (!fuDate) return toast.error("Selecione uma data");
    setSavingFu(true);
    try {
      const created = await addFollowup(clientId, fuDate, fuNote.trim() || undefined);
      setFollowups(prev => [...prev, created].sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date)));
      setFuDate("");
      setFuNote("");
      toast.success("Follow-up agendado");
    } catch (e: any) { toast.error(e.message); }
    finally { setSavingFu(false); }
  }

  async function handleComplete(id: string) {
    try {
      await completeFollowup(id);
      setFollowups(prev => prev.map(f => f.id === id ? { ...f, completed: true } : f));
      toast.success("Follow-up concluído");
    } catch (e: any) { toast.error(e.message); }
  }

  async function handleDeleteFollowup(id: string) {
    try {
      await deleteFollowup(id);
      setFollowups(prev => prev.filter(f => f.id !== id));
    } catch (e: any) { toast.error(e.message); }
  }

  const pendingFollowups = followups.filter(f => !f.completed);
  const today = new Date().toISOString().split("T")[0];

  const fuLabel = (date: string) => {
    if (date === today) return { text: "Hoje", cls: "text-red-600 font-semibold" };
    const diff = Math.ceil((new Date(date).getTime() - new Date(today).getTime()) / 86400000);
    if (diff < 0) return { text: `${Math.abs(diff)}d atrasado`, cls: "text-red-500 font-semibold" };
    if (diff === 1) return { text: "Amanhã", cls: "text-orange-500" };
    return { text: `em ${diff} dias`, cls: "text-stone-500" };
  };

  const getTypeInfo = (type: ActivityType) => ACTIVITY_TYPES.find(t => t.value === type)!;

  return (
    <div className="border-t border-stone-100 bg-stone-50/80" onClick={e => e.stopPropagation()}>
      {/* Tabs */}
      <div className="flex border-b border-stone-100">
        <button
          onClick={() => setTab("history")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${tab === "history" ? "text-stone-800 border-b-2 border-stone-800 bg-white" : "text-stone-400 hover:text-stone-600"}`}
        >
          <FileText size={12} /> Histórico {activities.length > 0 && `(${activities.length})`}
        </button>
        <button
          onClick={() => setTab("followup")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${tab === "followup" ? "text-stone-800 border-b-2 border-stone-800 bg-white" : "text-stone-400 hover:text-stone-600"}`}
        >
          <Bell size={12} /> Follow-up {pendingFollowups.length > 0 && <span className="bg-orange-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{pendingFollowups.length}</span>}
        </button>
      </div>

      <div className="p-3 space-y-3">
        {tab === "history" && (
          <>
            {/* Add activity */}
            <div className="space-y-2">
              <div className="flex gap-1.5 flex-wrap">
                {ACTIVITY_TYPES.map(t => {
                  const Icon = ICONS[t.icon];
                  return (
                    <button
                      key={t.value}
                      onClick={() => setActType(t.value)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${actType === t.value ? t.color + " border-current" : "bg-white text-stone-400 border-stone-200 hover:border-stone-300"}`}
                    >
                      {Icon && <Icon size={11} />} {t.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder={`Descreva o contato via ${getTypeInfo(actType).label.toLowerCase()}...`}
                  value={actText}
                  onChange={e => setActText(e.target.value)}
                  className="text-xs min-h-[60px] resize-none flex-1"
                />
              </div>
              <Button size="sm" className="w-full h-7 text-xs" onClick={handleAddActivity} disabled={savingAct || !actText.trim()}>
                <Plus size={12} className="mr-1" /> {savingAct ? "Salvando..." : "Registrar atividade"}
              </Button>
            </div>

            {/* Activity list */}
            {loading ? <p className="text-xs text-stone-400 text-center py-2">Carregando...</p>
              : activities.length === 0 ? <p className="text-xs text-stone-400 text-center py-2">Nenhuma atividade registrada</p>
              : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {activities.map(act => {
                    const t = getTypeInfo(act.type);
                    const Icon = ICONS[t.icon];
                    return (
                      <div key={act.id} className="flex items-start gap-2 bg-white rounded-lg border border-stone-100 px-2.5 py-2">
                        <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${t.color}`}>
                          {Icon && <Icon size={10} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-stone-700 leading-snug">{act.description}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            {t.label} · {new Date(act.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })} {new Date(act.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <button onClick={() => handleDeleteActivity(act.id)} className="text-stone-200 hover:text-red-400 transition-colors flex-shrink-0">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </>
        )}

        {tab === "followup" && (
          <>
            {/* Add follow-up */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={fuDate}
                  min={today}
                  onChange={e => setFuDate(e.target.value)}
                  className="h-8 text-xs flex-1"
                />
              </div>
              <Input
                placeholder="Objetivo do contato (opcional)..."
                value={fuNote}
                onChange={e => setFuNote(e.target.value)}
                className="h-8 text-xs"
              />
              <Button size="sm" className="w-full h-7 text-xs" onClick={handleAddFollowup} disabled={savingFu || !fuDate}>
                <Bell size={12} className="mr-1" /> {savingFu ? "Agendando..." : "Agendar follow-up"}
              </Button>
            </div>

            {/* Follow-up list */}
            {followups.length === 0 ? <p className="text-xs text-stone-400 text-center py-2">Nenhum follow-up agendado</p>
              : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {followups.map(fu => {
                    const label = fuLabel(fu.scheduled_date);
                    return (
                      <div key={fu.id} className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 ${fu.completed ? "bg-stone-50 border-stone-100 opacity-60" : "bg-white border-stone-100"}`}>
                        <button
                          onClick={() => !fu.completed && handleComplete(fu.id)}
                          className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${fu.completed ? "bg-green-500 border-green-500" : "border-stone-300 hover:border-green-400"}`}
                        >
                          {fu.completed && <Check size={9} className="text-white" strokeWidth={3} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className={`text-[10px] ${label.cls}`}>{label.text}</p>
                            <span className="text-[10px] text-stone-400">
                              {new Date(fu.scheduled_date + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                            </span>
                          </div>
                          {fu.description && <p className="text-xs text-stone-600 leading-snug mt-0.5">{fu.description}</p>}
                        </div>
                        <button onClick={() => handleDeleteFollowup(fu.id)} className="text-stone-200 hover:text-red-400 transition-colors flex-shrink-0">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </>
        )}
      </div>
    </div>
  );
}
