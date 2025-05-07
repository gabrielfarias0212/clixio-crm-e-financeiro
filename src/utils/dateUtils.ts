import { isValid, format, parse } from 'date-fns';

function parseToValidDate(input?: string | Date | null): Date | null {
  if (!input) return null;

  if (input instanceof Date && isValid(input)) {
    return input;
  }

  if (typeof input === 'string') {
    // dd/MM/yyyy
    const matchDMY = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(input);
    if (matchDMY) {
      const [_, day, month, year] = matchDMY;
      const parsed = new Date(`${year}-${month}-${day}T00:00:00`);
      if (isValid(parsed)) return parsed;
    }

    // dd/MM/yyyy HH:mm
    const matchDMYHM = /^(\d{2})\/(\d{2})\/(\d{4})[ T](\d{2}):(\d{2})$/.exec(input);
    if (matchDMYHM) {
      const [_, day, month, year, hour, minute] = matchDMYHM;
      const parsed = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
      if (isValid(parsed)) return parsed;
    }

    // yyyy-MM-dd or yyyy-MM-ddTHH:mm:ss
    const parsed = new Date(input);
    if (isValid(parsed)) return parsed;
  }

  return null;
}

export function formatDateTime(input?: string | Date | null): string {
  const date = parseToValidDate(input);
  if (!date) return '';
  const hasTime = date.getHours() > 0 || date.getMinutes() > 0;
  return format(date, hasTime ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy');
}

export function toISOStringDateTime(input?: string | Date | null): string {
  const date = parseToValidDate(input);
  if (!date) return '';
  // Retorna string ISO, mas sem problemas de fuso pois usa UTC
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
}
