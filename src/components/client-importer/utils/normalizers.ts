
import { ClientStatus, NextAction, EventCategory } from "@/utils/types";

export function normalizeStatus(status: string): ClientStatus {
  const statusMap: Record<string, ClientStatus> = {
    // Novos status
    "novo lead": "novo lead",
    "proposta enviada": "proposta enviada", 
    "negociação": "negociação",
    "fechado (aguardando assinatura)": "fechado (aguardando assinatura)",
    "contrato assinado": "contrato assinado",
    "contrato oficializado e entrada confirmada": "contrato oficializado e entrada confirmada",
    "pré-wedding agendado": "pré-wedding agendado",
    "pré-wedding feito": "pré-wedding feito",
    "pré-wedding entregue": "pré-wedding entregue",
    "evento principal fotografado": "evento principal fotografado",
    "material em pós-produção": "material em pós-produção",
    "galeria/link entregue": "galeria/link entregue",
    "álbum aprovado / em produção": "álbum aprovado / em produção",
    "cliente escolheu as fotos e álbum está sendo feito": "cliente escolheu as fotos e álbum está sendo feito",
    "trabalho entregue": "trabalho entregue",
    "todas as entregas finalizadas": "todas as entregas finalizadas",
    
    // Mapeamento de status antigos para novos
    "orçamento enviado": "proposta enviada",
    "follow-up": "novo lead",
    "fechado": "fechado (aguardando assinatura)",
    "em andamento": "evento principal fotografado",
    "pago": "contrato oficializado e entrada confirmada",
    "entregue": "todas as entregas finalizadas",
    "concluído": "todas as entregas finalizadas",
    "finalizado": "todas as entregas finalizadas"
  };

  const lowerStatus = status.toLowerCase().trim();
  
  // Tentar encontrar correspondência exata primeiro
  for (const [key, value] of Object.entries(statusMap)) {
    if (key.toLowerCase() === lowerStatus) {
      return value;
    }
  }
  
  // Tentar correspondência parcial
  if (lowerStatus.includes("proposta") || lowerStatus.includes("orçamento")) {
    return "proposta enviada";
  }
  
  if (lowerStatus.includes("negociaç") || lowerStatus.includes("follow")) {
    return "negociação";
  }
  
  if (lowerStatus.includes("fechado") || lowerStatus.includes("assinatura")) {
    return "fechado (aguardando assinatura)";
  }
  
  if (lowerStatus.includes("andamento") || lowerStatus.includes("produção")) {
    return "evento principal fotografado";
  }
  
  if (lowerStatus.includes("pago") || lowerStatus.includes("confirmada")) {
    return "contrato oficializado e entrada confirmada";
  }
  
  // Default para novo lead se não encontrar correspondência
  return "novo lead";
}

export function normalizeNextAction(action: string): NextAction {
  const actionMap: Record<string, NextAction> = {
    // Novas ações
    "enviar proposta inicial": "enviar proposta inicial",
    "aguardar resposta do cliente": "aguardar resposta do cliente",
    "negociar condições": "negociar condições",
    "preparar contrato": "preparar contrato",
    "oficializar entrada": "oficializar entrada",
    "agendar pré-wedding": "agendar pré-wedding",
    "realizar pré-wedding": "realizar pré-wedding",
    "editar e entregar pré-wedding": "editar e entregar pré-wedding",
    "fotografar evento principal": "fotografar evento principal",
    "iniciar pós-produção": "iniciar pós-produção",
    "preparar galeria": "preparar galeria",
    "apresentar álbum": "apresentar álbum",
    "produzir álbum": "produzir álbum",
    "finalizar entregas": "finalizar entregas",
    "nenhuma ação pendente": "nenhuma ação pendente",
    
    // Mapeamento de ações antigas para novas
    "responder": "aguardar resposta do cliente",
    "enviar proposta": "enviar proposta inicial",
    "editar": "iniciar pós-produção",
    "entregar": "finalizar entregas",
    "nenhuma": "nenhuma ação pendente"
  };

  const lowerAction = action.toLowerCase().trim();
  
  // Tentar encontrar correspondência exata primeiro
  for (const [key, value] of Object.entries(actionMap)) {
    if (key.toLowerCase() === lowerAction) {
      return value;
    }
  }
  
  // Tentar correspondência parcial
  if (lowerAction.includes("proposta")) {
    return "enviar proposta inicial";
  }
  
  if (lowerAction.includes("resposta") || lowerAction.includes("aguardar")) {
    return "aguardar resposta do cliente";
  }
  
  if (lowerAction.includes("contrato")) {
    return "preparar contrato";
  }
  
  if (lowerAction.includes("editar") || lowerAction.includes("produção")) {
    return "iniciar pós-produção";
  }
  
  if (lowerAction.includes("entregar") || lowerAction.includes("finalizar")) {
    return "finalizar entregas";
  }
  
  // Default para enviar proposta inicial se não encontrar correspondência
  return "enviar proposta inicial";
}

export function normalizeEventCategory(category: string): EventCategory {
  const categoryMap: Record<string, EventCategory> = {
    "casamento": "Casamento",
    "wedding": "Casamento",
    "aniversario": "Aniversario",
    "aniversário": "Aniversario",
    "birthday": "Aniversario",
    "civil": "Civil",
    "ensaio estudio": "Ensaio Estudio",
    "ensaio externo": "Ensaio externo",
    "evento corporativo": "Evento Corporativo",
    "corporativo": "Evento Corporativo",
    "15 anos": "15 anos",
    "quinze anos": "15 anos"
  };

  const lowerCategory = category.toLowerCase().trim();
  
  // Tentar encontrar correspondência exata primeiro
  for (const [key, value] of Object.entries(categoryMap)) {
    if (key === lowerCategory) {
      return value;
    }
  }
  
  // Correspondência parcial
  if (lowerCategory.includes("casam") || lowerCategory.includes("wedding")) {
    return "Casamento";
  }
  
  if (lowerCategory.includes("aniver") || lowerCategory.includes("birthday")) {
    return "Aniversario";
  }
  
  if (lowerCategory.includes("ensaio")) {
    return lowerCategory.includes("externo") ? "Ensaio externo" : "Ensaio Estudio";
  }
  
  if (lowerCategory.includes("corporativ")) {
    return "Evento Corporativo";
  }
  
  if (lowerCategory.includes("15") || lowerCategory.includes("quinze")) {
    return "15 anos";
  }
  
  // Default para Casamento se não encontrar correspondência
  return "Casamento";
}
