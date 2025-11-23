// pages/api/extract.js
// API Route para extração de links de mídia de uma URL

import got from 'got';
import cheerio from 'cheerio';

// Função utilitária para validar e normalizar a URL
function normalizeUrl(u) {
  try {
    return new URL(u).toString();
  } catch (e) {
    return null;
  }
}

// Lógica de extração de mídia via meta tags e scripts
async function extractMediaFromHtml(html) {
  const $ = cheerio.load(html);

  // 1) Tenta buscar o link do vídeo nas meta tags Open Graph (og:video)
  const ogVideo =
    $('meta[property="og:video:secure_url"]').attr('content') ||
    $('meta[property="og:video"]').attr('content') ||
    $('meta[name="og:video"]').attr('content') ||
    $('meta[property="og:video:url"]').attr('content');

  if (ogVideo) return { type: 'video', url: ogVideo, source: 'og:video' };

  // 2) Tenta buscar o link da imagem (og:image)
  const ogImage =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="og:image"]').attr('content');
  
  if (ogImage) return { type: 'image', url: ogImage, source: 'og:image' };

  // 3) Fallback: procurar urls diretas em scripts (mais genérico)
  const scripts = $('script').toArray().map(s => $(s).html()).filter(Boolean);
  for (const s of scripts) {
    // Regex simples para URLs terminadas em .mp4, .jpg, .gif, etc.
    // Procura por links que pareçam ser de mídia
    const match = s.match(/(https?:\/\/[^\s"'<>\\\)\(]+\.(mp4|m3u8|jpg|jpeg|png|gif))/i);
    if (match) {
      return { type: match[2] === 'mp4' ? 'video' : 'image', url: match[1], source: 'script_match' };
    }
  }

  return null;
}

// O handler principal da API
export default async function handler(req, res) {
  const targetUrl = normalizeUrl(req.query.url);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!targetUrl) {
    return res.status(400).json({ error: 'Parâmetro "url" é obrigatório.' });
  }

  try {
    // Cabeçalhos realistas são vitais para evitar bloqueio
    const resp = await got(targetUrl, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36',
        'accept': 'text/html,application/xhtml+xml',
      },
      timeout: { request: 15000 },
      followRedirect: true,
    });

    const info = await extractMediaFromHtml(resp.body);

    if (info) {
      return res.status(200).json({
        ok: true,
        sourceUrl: targetUrl,
        media: info,
        message: 'Mídia extraída com sucesso.'
      });
    } else {
      return res.status(404).json({ 
        ok: false,
        sourceUrl: targetUrl,
        message: 'Nenhuma mídia de vídeo ou imagem encontrada.'
      });
    }
  } catch (err) {
    console.error('API Error:', err.message);
    return res.status(500).json({ 
      ok: false, 
      message: 'Erro interno ao tentar processar a URL. Verifique se o link é válido.', 
      details: err.message 
    });
  }
}
