// pages/api/extract.js
// API Route para extração de links de mídia de uma URL (Versão Final: Meta Tags + JSON)

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

// Lógica de extração de mídia: Prioriza meta tags e JSON estruturado
async function extractMediaFromHtml(html) {
  const $ = cheerio.load(html);

  // --- ESTRATÉGIA 1: Meta Tags (Mais universal para vídeos e imagens) ---
  
  // Tenta buscar o link do vídeo em Open Graph (og:video)
  const ogVideo =
    $('meta[property="og:video:secure_url"]').attr('content') ||
    $('meta[property="og:video"]').attr('content') ||
    $('meta[property="og:video:url"]').attr('content') ||
    $('meta[name="og:video"]').attr('content'); 
  
  // Confirma se o link é MP4 ou tem chance de ser vídeo
  if (ogVideo && ogVideo.includes('.mp4')) {
    return { type: 'video', url: ogVideo.replace(/\\u002f/g, '/'), source: 'og:video' };
  }

  // Tenta buscar o link da imagem (og:image)
  const ogImage =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="og:image"]').attr('content');
  
  if (ogImage) {
    return { type: 'image', url: ogImage.replace(/\\u002f/g, '/'), source: 'og:image' };
  }

  // --- ESTRATÉGIA 2: JSON Interno (Último recurso se as meta tags falharem) ---
  
  // Usa REGEX para encontrar a URL de vídeo mais proeminente no HTML
  const regexVideo = /(https:\/\/[^"]+\/videos\/[^"]+\/(480p|720p|orig)\/[^"]+\.mp4)/i;
  
  let videoMatch = html.match(regexVideo);
  if (videoMatch && videoMatch[1]) {
      return { 
          type: 'video', 
          url: videoMatch[1].replace(/\\u002f/g, '/'), 
          source: 'html_regex_video_v4'
      };
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
    const resp = await got(targetUrl, {
      headers: {
        // ESSENCIAL: Usar um User-Agent de celular pode forçar o Pinterest a enviar links mais diretos
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
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
