// Pix EMV CRC16-CCITT
function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
    crc &= 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}
function emv(id: string, val: string) {
  return `${id}${val.length.toString().padStart(2, '0')}${val}`;
}

export function generatePixEMV(pixKey: string, amount: number, merchantName: string, city = 'Brasil'): string {
  const merchantInfo = emv('00', 'BR.GOV.BCB.PIX') + emv('01', pixKey);
  const name = (merchantName.replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'FOTOGRAFO').slice(0, 25);
  const cityTr = (city.replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'BRASIL').slice(0, 15);
  const additional = emv('05', 'EXTRAS');
  const payload =
    emv('00', '01') + emv('26', merchantInfo) +
    emv('52', '0000') + emv('53', '986') +
    emv('54', amount.toFixed(2)) + emv('58', 'BR') +
    emv('59', name) + emv('60', cityTr) +
    emv('62', additional) + '6304';
  return payload + crc16(payload);
}

// Client-side image compression + watermark via Canvas
export async function compressWithWatermark(
  file: File,
  watermarkText: string,
  maxDim = 1800,
  quality = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width >= height) { height = Math.round(height * maxDim / width); width = maxDim; }
        else { width = Math.round(width * maxDim / height); height = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      if (watermarkText) {
        const fontSize = Math.max(14, Math.floor(width * 0.035));
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-Math.PI / 5);
        const text = `© ${watermarkText}`;
        const sw = width * 0.55, sh = height * 0.28;
        for (let x = -width; x < width; x += sw)
          for (let y = -height; y < height; y += sh)
            ctx.fillText(text, x, y);
        ctx.restore();
      }
      canvas.toBlob(
        b => b ? resolve(b) : reject(new Error('Compressão falhou')),
        'image/webp', quality
      );
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

// Edge Function URL
const FN_URL = 'https://lwdfznskytyjqurxqebu.supabase.co/functions/v1/proofing-gallery-access';

export interface ProofingPhoto {
  id: string; gallery_id: string;
  nome_arquivo: string; storage_path: string | null;
  selecionada: boolean; created_at: string; url?: string;
}
export interface ProofingGallery {
  id: string; client_id: string; tipo: string; status: string;
  limite_incluso: number; permite_extras: boolean;
  preco_foto_extra: number | null; watermark_enabled: boolean;
  email_acesso: string | null; senha_acesso: string | null;
  deadline: string | null; valor_extras: number | null;
  extras_pago: boolean; created_at: string;
  proofing_photos?: ProofingPhoto[];
}

async function callFn(body: object) {
  const res = await fetch(FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro na requisição');
  return data;
}

export const galleryAuth = (gId: string, email: string, pwd: string) =>
  callFn({ action: 'auth', gallery_id: gId, email, password: pwd }) as Promise<{
    gallery: ProofingGallery & { proofing_photos: ProofingPhoto[] };
    client_name: string; studio_name: string; pix_key: string | null;
  }>;

export const togglePhoto = (gId: string, email: string, pwd: string, photoId: string, sel: boolean) =>
  callFn({ action: 'toggle_photo', gallery_id: gId, email, password: pwd, photo_id: photoId, selecionada: sel }) as Promise<{
    ok: boolean; selected_count: number; valor_extras: number;
  }>;

export const finalizeSelection = (gId: string, email: string, pwd: string) =>
  callFn({ action: 'finalize', gallery_id: gId, email, password: pwd });
