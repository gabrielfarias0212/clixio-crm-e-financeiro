
import { Client, ClientStatus, EventCategory, NextAction } from "@/utils/types";
import { parseBrazilianDate } from "@/utils/dateUtils";

export function mapImportedClientToModel(row: any): Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'payments'> {
  // Map spreadsheet columns to client model
  const name = row["Nome"] || row["nome"] || "";
  const email = row["E-mail"] || row["email"] || "";
  const phone = row["Telefone"] || row["telefone"] || "";
  
  // Parse date if available
  let weddingDate = null;
  const dateValue = row["Data do Evento"] || row["data do evento"] || row["Data"] || row["data"];
  
  if (dateValue) {
    // Handle Excel serial numbers, Date objects, or string dates
    weddingDate = parseBrazilianDate(dateValue);
  }
  
  // Parse contract value
  let contractValue = 0;
  const valueField = row["Valor do contrato"] || row["valor do contrato"] || row["Valor"] || row["valor"] || "0";
  if (valueField) {
    if (typeof valueField === "number") {
      contractValue = valueField;
    } else {
      // Remove currency symbols and commas, then parse
      const cleanValue = valueField.toString().replace(/[^\d.,]/g, "").replace(",", ".");
      contractValue = parseFloat(cleanValue) || 0;
    }
  }
  
  // Map status
  let status: ClientStatus = "orçamento enviado";
  const statusField = row["Status do Contrato"] || row["status do contrato"] || row["Status"] || row["status"];
  if (statusField) {
    const statusLower = statusField.toString().toLowerCase();
    if (statusLower.includes("orçamento") || statusLower.includes("orcamento")) {
      status = "orçamento enviado";
    } else if (statusLower.includes("follow") || statusLower.includes("follow-up")) {
      status = "follow-up";
    } else if (statusLower.includes("fechado")) {
      status = "fechado";
    } else if (statusLower.includes("andamento")) {
      status = "em andamento";
    } else if (statusLower.includes("pago")) {
      status = "pago";
    }
  }
  
  // Map event category
  let eventCategory: EventCategory = "Casamento";
  const categoryField = row["Categoria do evento"] || row["categoria do evento"] || row["Categoria"] || row["categoria"];
  if (categoryField) {
    const categoryLower = categoryField.toString().toLowerCase();
    if (categoryLower.includes("aniversario")) {
      eventCategory = "Aniversario";
    } else if (categoryLower.includes("civil")) {
      eventCategory = "Civil";
    } else if (categoryLower.includes("ensaio") && categoryLower.includes("estudio")) {
      eventCategory = "Ensaio Estudio";
    } else if (categoryLower.includes("ensaio") && categoryLower.includes("externo")) {
      eventCategory = "Ensaio externo";
    } else if (categoryLower.includes("corporativo")) {
      eventCategory = "Evento Corporativo";
    }
  }
  
  // Default next action based on status
  let nextAction: NextAction = "enviar proposta";
  if (status === "orçamento enviado") {
    nextAction = "responder";
  } else if (status === "follow-up") {
    nextAction = "responder";
  } else if (status === "fechado") {
    nextAction = "editar";
  } else if (status === "em andamento") {
    nextAction = "entregar";
  } else if (status === "pago") {
    nextAction = "nenhuma";
  }
  
  return {
    name,
    email,
    phone,
    weddingDate,
    contractValue,
    status,
    nextAction,
    eventCategory,
    notes: row["Observações"] || row["observações"] || row["Notas"] || row["notas"] || "",
    downPayment: 0
  };
}
