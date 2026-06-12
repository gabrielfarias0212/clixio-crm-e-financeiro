import React, { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Client } from "@/utils/types";
import { TrendingUp, TrendingDown, Users, MessageCircle, CheckCircle, XCircle } from "lucide-react";

interface CRMHeaderProps {
  clients: Client[];
}

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

export function CRMHeader({ clients }: CRMHeaderProps) {
  const isMobile = useIsMobile();
  const stats = useMemo(() => {
    const crm = clients.filter(c => c.leadSource !== "Projeto Direto");
    const opportunities = crm.filter(c => ["primeiro_contato", "orcamento_enviado", "negociacao"].includes(c.salesFunnelStage || c.status)).length;
    const inContact     = crm.filter(c => c.salesFunnelStage === "primeiro_contato" || c.status === "primeiro_contato").length;
    const closed        = crm.filter(c => c.salesFunnelStage === "contrato_fechado" || c.status === "fechado").length;
    const lost          = crm.filter(c => c.salesFunnelStage === "contrato_perdido" || c.status === "contrato_perdido").length;
    const finished      = crm.filter(c => c.salesFunnelStage === "projeto_finalizado" || c.status === "projeto_finalizado").length;
    const totalValue    = crm.filter(c => c.salesFunnelStage === "contrato_fechado" || c.status === "fechado").reduce((s, c) => s + (c.contractValue || 0), 0);
    const pipelineValue = crm.filter(c => ["primeiro_contato", "orcamento_enviado", "negociacao"].includes(c.salesFunnelStage || c.status)).reduce((s, c) => s + (c.contractValue || 0), 0);
    const totalDecided  = closed + finished + lost;
    const conversionRate = totalDecided > 0 ? ((closed + finished) / totalDecided) * 100 : 0;
    return { opportunities, inContact, closed, lost, totalValue, pipelineValue, conversionRate };
  }, [clients]);

  const cards = [
    {
      title: "Oportunidades",
      value: stats.opportunities,
      sub: fmt(stats.pipelineValue),
      icon: Users,
      accent: "#1E3A5F",
      iconBg: "#E8EEF6",
    },
    {
      title: "Em Contato",
      value: stats.inContact,
      sub: "primeiros contatos",
      icon: MessageCircle,
      accent: "#E8A838",
      iconBg: "#FEF3DC",
    },
    {
      title: "Fechados",
      value: stats.closed,
      sub: fmt(stats.totalValue),
      icon: CheckCircle,
      accent: "#52C97A",
      iconBg: "#E6F9EE",
    },
    {
      title: "Perdidos",
      value: stats.lost,
      sub: "não convertidos",
      icon: XCircle,
      accent: "#E05252",
      iconBg: "#FEE8E8",
    },
    {
      title: "Conversão",
      value: `${stats.conversionRate.toFixed(1)}%`,
      sub: "taxa de sucesso",
      icon: stats.conversionRate >= 20 ? TrendingUp : TrendingDown,
      accent: stats.conversionRate >= 20 ? "#52C97A" : "#E05252",
      iconBg: stats.conversionRate >= 20 ? "#E6F9EE" : "#FEE8E8",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, minmax(0, 1fr))", gap: isMobile ? 10 : 12 }}>
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            style={{
              background: "#FFFFFF",
              borderRadius: 14,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05), 0 6px 20px rgba(0,0,0,0.07)",
              borderTop: `3px solid ${c.accent}`,
              padding: isMobile ? "12px 14px" : "16px 18px",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase" as const, color: "#9A9590" }}>
                {c.title}
              </span>
              <span style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>
                {c.value}
              </span>
              <span style={{ fontSize: 11, color: "#9A9590", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                {c.sub}
              </span>
            </div>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: c.iconBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Icon style={{ width: 16, height: 16, color: c.accent }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
