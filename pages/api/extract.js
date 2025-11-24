// pages/api/extract.js
// API Route para extração de links de mídia via RapidAPI (USANDO POST PARA ALL MEDIA DOWNLOADER)

import got from 'got';

// 🚨 CREDENCIAIS CONFIGURADAS PARA ALL MEDIA DOWNLOADER 🚨
const RAPIDAPI_HOST = 'all-media-downloader1.p.rapidapi.com'; 
const RAPIDAPI_KEY = 'f33219dae3msheaf9a18e4309ef0p1551a9jsn1a91ec0c62d2'; 
const API_ENDPOINT = 'https://all-media-downloader1.p.rapidapi.com/all'; 


// Função utilitária para validar e normalizar a URL
function normalizeUrl(u) {
  try {
    return new URL(u).toString();
  } catch (e) {
    return null;
  }
}

// O handler principal da API
export default async function handler(req, res) {
  // A URL alvo vem da query string do frontend (ex: /api/extract?url=...)
  const targetUrl = normalizeUrl(req.query.url);
  
  if (req.method !== 'GET') {
    // Mantemos como GET na URL, mas o handler faz a chamada POST para a API
  }

  if (!targetUrl) {
    return res.status(400).json({ error: 'Parâmetro "url" é obrigatório.' });
  }

  try {
    // 1. CHAMA A NOVA API (REQUISIÇÃO POST COM DADOS NO CORPO)
    const response = await got.post(API_ENDPOINT, {
        form: { url: targetUrl }, // Envia o link do Pin no corpo como form data
        headers: {
            'x-rapidapi-host': RAPIDAPI_HOST,
            'x-rapidapi-key': RAPIDAPI_KEY,
            'content-type': 'application/x-www-form-urlencoded' // OBRIGATÓRIO
        },
        responseType: 'json',
        timeout: { request: 20000 },
    });

    const apiData = response.body;

    // 2. ANALISA A RESPOSTA DA NOVA API (Busca por vídeo ou imagem de melhor qualidade)
    
    let mediaUrl = null;
    let mediaType = null;
    
    // Tenta encontrar o vídeo de melhor qualidade na lista de mídias (se houver)
    const bestVideo = (apiData.media || [])
        .filter(m => m.type === 'video' && m.url)
        .sort((a, b) => (b.quality || 0) - (a.quality || 0))[0];

    // Se encontrar vídeo, usa
    if (bestVideo) {
        mediaUrl = bestVideo.url;
        mediaType = 'video';
    } else {
        // Se não encontrar vídeo, tenta encontrar a imagem de melhor qualidade
        const bestImage = (apiData.media || [])
            .filter(m => m.type === 'image' && m.url)
            .sort((a, b) => (b.quality || 0) - (a.quality || 0))[0];
        
        if (bestImage) {
            mediaUrl = bestImage.url;
            mediaType = 'image';
        }
    }


    if (mediaUrl) {
        return res.status(200).json({
            ok: true,
            sourceUrl: targetUrl,
            media: { type: mediaType, url: mediaUrl.replace(/\\u002f/g, '/'), source: 'all_media_api' },
            message: 'Mídia extraída com sucesso via API externa.'
        });
    } else {
        return res.status(404).json({ 
            ok: false,
            sourceUrl: targetUrl,
            message: 'A API externa não retornou um link de vídeo ou imagem válido. Certifique-se de que o link do Pin é válido.'
        });
    }
  } catch (err) {
    console.error('API Error:', err.message);
    
    return res.status(500).json({ 
      ok: false, 
      message: 'Erro interno ao tentar processar a URL na API externa. Verifique os logs da Vercel para mais detalhes.', 
      details: err.message 
    });
  }
}
