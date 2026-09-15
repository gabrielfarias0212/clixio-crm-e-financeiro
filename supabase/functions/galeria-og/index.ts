import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const BOT_RE = /whatsapp|facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|applebot|googlebot|bingbot|crawler|spider|bot/i;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }),
    });
  }

  const url = new URL(req.url);
  const galleryId = url.searchParams.get('id');

  const appUrl = 'https://clixio-crm-e-financeiro.lovable.app';
  const galleryUrl = galleryId ? `${appUrl}/galeria/${galleryId}` : appUrl;

  // Non-bot browsers: redirect immediately (no HTML, no Content-Type confusion)
  const ua = req.headers.get('user-agent') || '';
  if (!BOT_RE.test(ua)) {
    return new Response(null, {
      status: 302,
      headers: new Headers({ 'Location': galleryUrl }),
    });
  }

  // Bot (WhatsApp, Facebook, etc.): serve OG HTML
  if (!galleryId) return new Response('Missing id', { status: 400 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const { data: gallery } = await supabase
    .from('proofing_galleries')
    .select('titulo, tipo, cover_photo_path')
    .eq('id', galleryId)
    .maybeSingle();

  const titulo = gallery?.titulo || (gallery?.tipo === 'album' ? 'Album' : 'Ensaio');
  const pageTitle = `${esc(titulo)} - Galeria de Selecao de Fotos`;
  const description = 'Acesse sua galeria e escolha suas fotos favoritas.';

  let ogImage = '';
  if (gallery?.cover_photo_path) {
    const { data: signed } = await supabase.storage
      .from('proofing-photos')
      .createSignedUrl(gallery.cover_photo_path, 86400);
    if (signed?.signedUrl) ogImage = signed.signedUrl;
  }

  const ogImageTags = ogImage ? `
  <meta property="og:image" content="${esc(ogImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:image" content="${esc(ogImage)}">` : '';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${esc(galleryUrl)}">${ogImageTags}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${esc(description)}">
</head>
<body style="margin:0;background:#1a1a1a;color:#fff;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif">
  <p>Abrindo galeria...</p>
</body>
</html>`;

  const headers = new Headers();
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  headers.set('Access-Control-Allow-Origin', '*');
  return new Response(html, { status: 200, headers });
});
