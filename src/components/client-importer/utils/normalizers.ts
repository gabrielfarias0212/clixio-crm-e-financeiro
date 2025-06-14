import { ClientStatus, NextAction, EventCategory } from "@/utils/types";

/**
 * Normalizes a date string to a Date object
 */
export function normalizeDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;

  // First try parsing as ISO format
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try Brazilian format (DD/MM/YYYY)
  const brMatch = dateStr.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
  if (brMatch) {
    // Convert to YYYY-MM-DD for proper parsing
    const day = brMatch[1].padStart(2, '0');
    const month = brMatch[2].padStart(2, '0');
    let year = brMatch[3];
    // Handle 2-digit years
    if (year.length === 2) {
      const currentYear = new Date().getFullYear();
      const century = Math.floor(currentYear / 100) * 100;
      year = String(century + parseInt(year));
    }
    
    // Parse with a timezone-safe approach (noon to avoid DST issues)
    return new Date(`${year}-${month}-${day}T12:00:00`);
  }

  // Try US format (MM/DD/YYYY)
  const usMatch = dateStr.match(/(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
  if (usMatch) {
    const month = usMatch[1].padStart(2, '0');
    const day = usMatch[2].padStart(2, '0');
    let year = usMatch[3];
    if (year.length === 2) {
      const currentYear = new Date().getFullYear();
      const century = Math.floor(currentYear / 100) * 100;
      year = String(century + parseInt(year));
    }
    
    return new Date(`${year}-${month}-${day}T12:00:00`);
  }

  // If all else fails, return null
  return null;
}

/**
 * Normalizes a phone number string
 */
export function normalizePhoneNumber(phone: string | null): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  return phone.replace(/[^0-9+]/g, '');
}

/**
 * Normalizes a status string to a valid ClientStatus
 */
export function normalizeStatus(status: string | null): ClientStatus {
  if (!status) return "orçamento enviado";
  
  const normalizedStatus = status.toLowerCase().trim();
  
  // Check for exact matches first
  if (normalizedStatus === "primeiro_contato") {
    return "primeiro_contato";
  }
  
  if (normalizedStatus === "orçamento enviado") {
    return "orçamento enviado";
  }
  
  if (normalizedStatus === "negociacao") {
    return "negociacao";
  }
  
  if (normalizedStatus === "fechado") {
    return "fechado";
  }
  
  if (normalizedStatus === "projeto_finalizado") {
    return "projeto_finalizado";
  }
  
  // Check for partial matches and map to new status
  if (normalizedStatus.includes("follow") || normalizedStatus.includes("contato") || normalizedStatus.includes("negoci")) {
    return "negociacao";
  }
  
  if (normalizedStatus.includes("orça") || normalizedStatus.includes("propos")) {
    return "orçamento enviado";
  }
  
  if (normalizedStatus.includes("andamento") || normalizedStatus.includes("progress") || normalizedStatus.includes("produção") || normalizedStatus.includes("execu")) {
    return "fechado";
  }
  
  if (normalizedStatus.includes("pago") || normalizedStatus.includes("entregue") || normalizedStatus.includes("conclu") || normalizedStatus.includes("final")) {
    return "projeto_finalizado";
  }
  
  if (normalizedStatus.includes("fecha") || normalizedStatus.includes("confirm") || normalizedStatus.includes("contrat") || normalizedStatus.includes("aprova")) {
    return "fechado";
  }
  
  // Default value if no match is found
  return "orçamento enviado";
}

/**
 * Normalizes a next action string to a valid NextAction
 */
export function normalizeNextAction(action: string | null): NextAction {
  if (!action) return "responder";
  
  const normalizedAction = action.toLowerCase().trim();
  
  // Check for exact matches first
  if (normalizedAction === "responder" || 
      normalizedAction === "enviar proposta" || 
      normalizedAction === "editar" || 
      normalizedAction === "entregar" || 
      normalizedAction === "nenhuma") {
    return normalizedAction as NextAction;
  }
  
  // Check for partial matches
  if (normalizedAction.includes("respond") || normalizedAction.includes("contato") || normalizedAction.includes("reply")) {
    return "responder";
  }
  
  if (normalizedAction.includes("envi") || normalizedAction.includes("propos") || normalizedAction.includes("orça")) {
    return "enviar proposta";
  }
  
  if (normalizedAction.includes("edit") || normalizedAction.includes("process") || normalizedAction.includes("revis")) {
    return "editar";
  }
  
  if (normalizedAction.includes("entreg") || normalizedAction.includes("deliver") || normalizedAction.includes("final")) {
    return "entregar";
  }
  
  if (normalizedAction.includes("nenhum") || normalizedAction.includes("none") || normalizedAction.includes("conclu")) {
    return "nenhuma";
  }
  
  // Default value if no match is found
  return "responder";
}

/**
 * Normalizes an event category string to a valid EventCategory
 */
export function normalizeEventCategory(category: string | null): EventCategory {
  if (!category) return "Casamento";
  
  const normalizedCategory = category.toLowerCase().trim();
  
  // Check for matches
  if (normalizedCategory.includes("casamento") || normalizedCategory.includes("wedding")) {
    return "Casamento";
  }
  
  if (normalizedCategory.includes("aniversa") || normalizedCategory.includes("birthday")) {
    return "Aniversario";
  }
  
  if (normalizedCategory.includes("civil") || normalizedCategory.includes("cartório")) {
    return "Civil";
  }
  
  if (normalizedCategory.includes("estudio") || normalizedCategory.includes("studio")) {
    return "Ensaio Estudio";
  }
  
  if (normalizedCategory.includes("extern") || normalizedCategory.includes("outdoor")) {
    return "Ensaio externo";
  }
  
  if (normalizedCategory.includes("corpor") || normalizedCategory.includes("business") || normalizedCategory.includes("empresa")) {
    return "Evento Corporativo";
  }
  
  // Default value if no match is found
  return "Casamento";
}
