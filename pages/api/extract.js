// pages/api/extract.js
// API Route para extração de links de mídia de uma URL (Otimizado para Pinterest com REGEX)

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

// Lógica de extração de mídia via JSON interno do Pinterest (REGEX)
async function extractMediaFromHtml(html) {
  const $ = cheerio.load(html);

  // 1) Estratégia Principal: Usar REGEX para encontrar a URL de vídeo mais proeminente no JSON
  // Procura por URLs de vídeo com alta resolução ('480p', '720p', 'orig') dentro de blocos JSON/scripts
  const regexVideo = /"video_list":\s*{[^}]+"(\d+p|orig)":\s*{[^}]+"url":\s*"(https:\/\/[^"]+\.mp4)"/i;
  // Procura por URLs de imagem de qualidade média/alta
  const regexImage = /"image_medium_url":\s*"(https:\/\/[^"]+\.jpg)"|url\s*:\s*"(https:\/\/[^"]+\.png)"/i;

  // Busca o conteúdo de todos os scripts, onde o Pinterest guarda os dados
  const scripts = $('script').toArray().map(s => $(s).html()).filter(Boolean);
  
  for (const scriptContent of scripts) {
    // Tenta encontrar o link do vídeo (prioridade)
    let videoMatch = scriptContent.match(regexVideo);
    if (videoMatch && videoMatch[2]) {
        // Retorna o link MP4 encontrado e limpa caracteres de escape (\u002f)
        return { 
            type: 'video', 
            url: videoMatch[2].replace(/\\u002f/g, '/'), 
            source: 'json_regex_video'
        };
    }
    
    // Tenta encontrar o link da imagem (Fallback)
    let imageMatch = scriptContent.match(regexImage);
    if (imageMatch && (imageMatch[1] || imageMatch[2])) {
        const imageUrl = imageMatch[1] || imageMatch[2];
        return { 
            type: 'image', 
            url: imageUrl.replace(/\\u002f/g, '/'),
            source: 'json_regex_image'
        };
    }
  }

  // 2) Estratégia Fallback: Meta Tags (Backup contra grandes mudanças na estrutura)
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
      message: 'Erro interno ao tentar processar a URL.', 
      details: err.message 
    });
  }
}
