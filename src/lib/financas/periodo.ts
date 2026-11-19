export interface Periodo { de: string; ate: string } // "YYYY-MM"; null = tudo
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const nomeMes = (m: string) => `${MESES[+m.slice(5, 7) - 1]}/${m.slice(2, 4)}`;
export const mesAtual = () => new Date().toISOString().slice(0, 7);
export function addMes(m: string, k: number) {
  const t = +m.slice(0, 4) * 12 + (+m.slice(5, 7) - 1) + k;
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, "0")}`;
}
export const qtdMeses = (p: Periodo) => (+p.ate.slice(0, 4) * 12 + +p.ate.slice(5, 7)) - (+p.de.slice(0, 4) * 12 + +p.de.slice(5, 7)) + 1;
export const noPeriodo = (data: string, p: Periodo | null) => !p || (data.slice(0, 7) >= p.de && data.slice(0, 7) <= p.ate);
export const rotuloPeriodo = (p: Periodo | null) => (!p ? "Tudo" : p.de === p.ate ? nomeMes(p.de) : `${nomeMes(p.de)} a ${nomeMes(p.ate)}`);
