// pages/api/extract.js
// API Route para extração de links de mídia de uma URL (Otimizado para Pinterest com REGEX V3)

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

// Lógica de extração de mídia via Busca Ampla no HTML (mais agressiva)
async function extractMediaFromHtml(html) {
  // 1) Estratégia Principal: Usar REGEX amplo para encontrar URLs de vídeo/imagem diretamente
  
  // Regex para links diretos de MP4 de alta resolução (480p, 720p, orig, etc.)
  // Ex: https://v.pinimg.com/videos/mc/720p/52/63/87/5263870f7d52634d2b2707f59d4c7952.mp4
  const regexVideo = /(https:\/\/[^"]+\/videos\/[^"]+\/(480p|720p|orig)\/[^"]+\.mp4)/i;
  
  // Regex para links diretos de JPG/PNG de alta qualidade
  // Ex: https://i.pinimg.com/originals/a4/d3/18/a4d318e8d89e02316e6423985a73e558.jpg
  const regexImage = /(https:\/\/[^"]+\/originals\/[^"]+\.(jpg|png))/i;

  // Busca o vídeo primeiro
  let videoMatch = html.match(regexVideo);
  if (videoMatch && videoMatch[1]) {
      // Retorna o link MP4 encontrado e limpa caracteres de escape
      return { 
          type: 'video', 
          url: videoMatch[1].replace(/\\u002f/g, '/'), 
          source: 'html_regex_video_v3'
      };
  }

  // Se não encontrar vídeo, busca a imagem
  let imageMatch = html.match(regexImage);
  if (imageMatch && imageMatch[1]) {
      // Retorna o link de Imagem encontrado
      return { 
          type: 'image', 
          url: imageMatch[1].replace(/\\u002f/g, '/'),
          source: 'html_regex_image_v3'
      };
  }

  // 2) Estratégia Fallback: Meta Tags (Backup contra grandes mudanças na estrutura)
  const $ = cheerio.load(html);

  const ogVideo =
    $('meta[property="og:video:secure_url"]').attr('content') ||
    $('meta[property="og:video"]').attr('content');

  if (ogVideo) return { type: 'video', url: ogVideo, source: 'og:video' };

  const ogImage =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="og:image"]').attr('content');
  
  if (ogImage) return { type: 'image', url: ogImage, source: 'og:image' };

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
      message: 'Erro interno ao tentar processar a URL. Verifique se o link é válido.', 
      details: err.message 
    });
  }
}
