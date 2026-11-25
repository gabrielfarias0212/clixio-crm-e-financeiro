// Trabalhos da categoria "Freelance" (ex.: EVENTOMS) entram na Agenda e na
// previsão de caixa, mas NÃO contam como contrato fechado/lead e não aparecem
// no fluxo de trabalho (cópia, edição, entrega).
export const FREELANCE_CATEGORY = "Freelance";

export const isFreelance = (c: { eventCategory?: string | null }) =>
  c.eventCategory === FREELANCE_CATEGORY;

export const semFreelance = <T extends { eventCategory?: string | null }>(list: T[]): T[] =>
  list.filter(c => !isFreelance(c));
