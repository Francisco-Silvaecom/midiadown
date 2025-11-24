// pages/api/extract.js
// API Route para extração de IMAGENS e GIFs do Pinterest (Seguro e Estável)

import got from 'got';
import cheerio from 'cheerio'; // Mantemos cheerio para meta tags

// Função utilitária para validar e normalizar a URL
function normalizeUrl(u) {
  try {
    return new URL(u).toString();
  } catch (e) {
    return null;
  }
}

// Lógica de extração de mídia: Focada em Meta Tags de Imagem
async function extractMediaFromHtml(html) {
  const $ = cheerio.load(html);

  // Estratégia Principal: Meta Tags (Mais confiável para imagens/GIFs)
  const ogImage =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="og:image"]').attr('content');
  
  if (ogImage) {
      // Se for GIF ou imagem, retornamos a URL
      const mediaType = ogImage.toLowerCase().endsWith('.gif') ? 'gif' : 'image';
      
      return { 
          type: mediaType, 
          url: ogImage.replace(/\\u002f/g, '/'), 
          source: 'og:image_stable' 
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
        // User-Agent de desktop para evitar o bloqueio mais agressivo
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
        message: 'Nenhuma imagem ou GIF encontrado para este Pin.'
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
