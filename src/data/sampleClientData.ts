
import { format } from "date-fns";

export interface ClientToImport {
  name: string;
  weddingDate: Date;
  location: string;
  contractValue: number;
  downPayment: number;
  notes: string;
}

// Client data from the spreadsheet
export const clientsToImport: ClientToImport[] = [
  {
    name: "Dayadria Cypriano Rabelo Seribeli",
    weddingDate: new Date("2025-09-06"),
    location: "Cerimônia: Igreja Matriz / Festa: Simted",
    contractValue: 3800,
    downPayment: 380,
    notes: "10% (380,00) de entrada e restante até o evento"
  },
  {
    name: "LEONARDO GONÇALVES DA SILVA",
    weddingDate: new Date("2026-04-25"),
    location: "CERIMONIA: SANTISSIMA TRINDADE / RECEPÇÃO A DEFINIR",
    contractValue: 3800,
    downPayment: 380,
    notes: "10% (380,00) de entrada até o dia 10 e restante até o dia 26/04/26"
  },
  {
    name: "FRANCIENE DE SOUZA DA SILVA",
    weddingDate: new Date("2025-06-14"),
    location: "NOSSA SENHORA DE FATIMA/ EZENEZER",
    contractValue: 3800,
    downPayment: 380,
    notes: "10% (380,00) de entrada até o dia 10 e restante até o dia 14/06/25"
  },
  {
    name: "Ariene kelita Medina Pereira",
    weddingDate: new Date("2025-11-20"),
    location: "Igreja: palavra profética",
    contractValue: 3000,
    downPayment: 300,
    notes: "ENTRADA DE 10% NO FECHAMENTO DO CONTRATO E RESTANTE ATÉ O DIA 19/11/2025"
  },
  {
    name: "Vanessa Fukuda Mariano",
    weddingDate: new Date("2025-10-05"),
    location: "Garden Fest",
    contractValue: 3800,
    downPayment: 380,
    notes: "10% ENTRADA E RESTANTE ATÉ A DATA DO EVENTO."
  }
];
