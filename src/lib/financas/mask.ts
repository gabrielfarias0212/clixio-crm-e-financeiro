/** Mascara dados sensíveis antes de qualquer envio a IA. Nunca altera valores nem datas. */
export function maskSensitive(text: string): string {
  return text
    .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, "[CPF]")
    .replace(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, "[CNPJ]")
    .replace(/\b(?:\d[ -]?){13,19}\b/g, "[CARTAO]")
    .replace(/\b\d{6,}\b/g, "[NUM]")
    .replace(/(Pix (?:recebido de|enviado para))\s+.+$/i, "$1 [PESSOA]");
}
