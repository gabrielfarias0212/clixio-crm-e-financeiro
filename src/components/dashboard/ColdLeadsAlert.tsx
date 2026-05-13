// src/components/dashboard/ColdLeadsAlert.tsx
// Melhoria #4: exibe um painel de leads frios no Dashboard.
// Componente totalmente autônomo — apenas adicionar <ColdLeadsAlert /> no DashboardContent.

import { useNavigate } from "react-router-dom";
import { useColdLeads } from "@/hooks/useColdLeads";
import { Flame, ChevronRight, ExternalLink } from "lucide-react";

const STAGE_LABELS: Record<string, string> = {
  primeiro_contato:   "Primeiro Contato",
  orcamento_enviado:  "Orçamento Enviado",
  negociacao:         "Negociação / Follow-up",
};

const STAGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  primeiro_contato:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  orcamento_enviado:  { bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200" },
  negociacao:         { bg: "bg-yellow-50",  text: "text-yellow-700",  border: "border-yellow-200" },
};

function urgencyColor(days: number) {
  if (days <= 10) return "text-yellow-600";
  if (days <= 20) return "text-orange-600";
  return "text-red-600";
}

export function ColdLeadsAlert() {
  const navigate = useNavigate();
  const { coldLeads, loading } = useColdLeads();

  if (loading || coldLeads.length === 0) return null;

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-orange-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-orange-100">
            <Flame className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-900">
              {coldLeads.length} lead{coldLeads.length > 1 ? "s" : ""} sem contato
            </p>
            <p className="text-xs text-orange-600">
              Sem atualização há mais de 7 dias
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/crm")}
          className="flex items-center gap-1 text-xs text-orange-700 hover:text-orange-900 font-medium transition-colors"
        >
          Ver no CRM
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>

      {/* Lista */}
      <div className="divide-y divide-orange-100">
        {coldLeads.map((lead) => {
          const stage = STAGE_COLORS[lead.salesFunnelStage] ?? { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" };
          return (
            <div
              key={lead.id}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-orange-100/50 transition-colors cursor-pointer group"
              onClick={() => navigate("/crm")}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Initials avatar */}
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${stage.bg} ${stage.text}`}>
                  {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${stage.bg} ${stage.text} ${stage.border}`}>
                    {STAGE_LABELS[lead.salesFunnelStage] ?? lead.salesFunnelStage}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className={`text-xs font-semibold ${urgencyColor(lead.daysSinceUpdate)}`}>
                  {lead.daysSinceUpdate}d
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-orange-400 group-hover:text-orange-600 transition-colors" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
