// pages/api/extract.js
// API Route para extração de links de mídia de uma URL (Otimizado para Pinterest)

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

// Lógica de extração de mídia via JSON interno do Pinterest
async function extractMediaFromHtml(html) {
  const $ = cheerio.load(html);

  // 1) Estratégia Pinterest: Buscar dados JSON embutidos (Mais confiável para vídeos)
  // O JSON do Pinterest geralmente está em um script com id="initial-state" ou similar
  const scripts = $('script').toArray().map(s => $(s).html()).filter(s => s.includes('resourceResponses'));
  
  if (scripts.length > 0) {
    try {
        const jsonText = scripts[0];
        const start = jsonText.indexOf('{');
        const end = jsonText.lastIndexOf('}');
        const cleanedJson = jsonText.substring(start, end + 1);
        
        const data = JSON.parse(cleanedJson);

        // Tentativa de encontrar o link do vídeo dentro da estrutura de dados
        const videoData = Object.values(data.resourceResponses || {})
            .flatMap(res => res.data?.videos?.videoList || [])
            .find(video => video.url && video.width > 0);

        if (videoData && videoData.url) {
            return { 
                type: 'video', 
                url: videoData.url, 
                source: 'json_data'
            };
        }
    } catch (e) {
        console.warn("Falha na extração JSON do Pinterest:", e.message);
    }
  }

  // 2) Estratégia Fallback: Meta Tags (Funciona bem para imagens)
  const ogVideo =
    $('meta[property="og:video:secure_url"]').attr('content') ||
    $('meta[property="og:video"]').attr('content') ||
    $('meta[name="og:video"]').attr('content') ||
    $('meta[property="og:video:url"]').attr('content');

  if (ogVideo) return { type: 'video', url: ogVideo, source: 'og:video' };

  const ogImage =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="og:image"]').attr('content');
  
  if (ogImage) return { type: 'image', url: ogImage, source: 'og:image' };

  // 3) Fallback Genérico: Busca simples em scripts (Última chance)
  const allScripts = $('script').toArray().map(s => $(s).html()).filter(Boolean);
  for (const s of allScripts) {
    const match = s.match(/(https?:\/\/[^\s"'<>\\\)\(]+\.(mp4|m3u8|jpg|jpeg|png|gif))/i);
    if (match) {
      if (match[2] === 'mp4') {
         return { type: 'video', url: match[1], source: 'script_match_mp4' };
      }
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
        message: 'Nenhuma mídia de vídeo ou imagem encontrada. Verifique se o Pin é de vídeo/imagem.'
      });
    }
  } catch (err) {
    console.error('API Error:', err.message);
    return res.status(500).json({ 
      ok: false, 
      message: 'Erro interno ao tentar processar a URL.', 
      details: err.message 
    });
  }
}
