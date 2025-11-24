// pages/api/extract.js
// API Route para extração de links de mídia via RapidAPI (Versão Final e Funcional)

import got from 'got';

// 🚨 CREDENCIAIS CONFIGURADAS 🚨
const RAPIDAPI_HOST = 'pinterest-video-and-image-downloader.p.rapidapi.com'; 
const RAPIDAPI_KEY = 'f33219dae3msheaf9a18e4309ef0p1551a9jsn1a91ec0c62d2'; 
const API_ENDPOINT = 'https://pinterest-video-and-image-downloader.p.rapidapi.com/get-pin-media'; 


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
  const targetUrl = normalizeUrl(req.query.url);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!targetUrl) {
    return res.status(400).json({ error: 'Parâmetro "url" é obrigatório.' });
  }

  try {
    // 1. CHAMA A API DO PINTEREST
    const response = await got(API_ENDPOINT, {
        searchParams: { url: targetUrl }, // Envia o link do Pin para a API
        headers: {
            'x-rapidapi-host': RAPIDAPI_HOST,
            'x-rapidapi-key': RAPIDAPI_KEY,
        },
        responseType: 'json',
        timeout: { request: 20000 },
    });

    const apiData = response.body;

    // 2. ANALISA A RESPOSTA DA API
    // Estrutura de análise robusta para extrair links de vídeo (prioridade) ou imagem
    let mediaUrl = null;
    let mediaType = null;
    
    // Tenta encontrar o vídeo (comumente em 'video' ou 'download_video')
    const videoResult = apiData.video || apiData.download_video; 
    
    if (videoResult && typeof videoResult === 'string' && videoResult.includes('http')) {
        mediaUrl = videoResult;
        mediaType = 'video';
    } else {
        // Tenta encontrar o link da imagem se o vídeo não for encontrado
        const imageResult = apiData.image || apiData.download_image || apiData.image_url;
        if (imageResult && typeof imageResult === 'string' && imageResult.includes('http')) {
            mediaUrl = imageResult;
            mediaType = 'image';
        }
    }


    if (mediaUrl) {
        return res.status(200).json({
            ok: true,
            sourceUrl: targetUrl,
            media: { type: mediaType, url: mediaUrl.replace(/\\u002f/g, '/'), source: 'external_api' },
            message: 'Mídia extraída com sucesso via API externa.'
        });
    } else {
        return res.status(404).json({ 
            ok: false,
            sourceUrl: targetUrl,
            message: 'A API externa não retornou um link de vídeo ou imagem válido para este Pin. Verifique se o Pin é público.'
        });
    }
  } catch (err) {
    console.error('API Error:', err.message);
    // Erros 401/403: Geralmente significam chave inválida ou falta de créditos.
    if (err.response && (err.response.statusCode === 401 || err.response.statusCode === 403)) {
         return res.status(err.response.statusCode).json({
            ok: false,
            message: 'Erro de Autenticação na API Externa. Verifique se a chave está correta e se você tem créditos no plano Basic (Free) do RapidAPI.',
            details: err.message
        });
    }
    return res.status(500).json({ 
      ok: false, 
      message: 'Erro ao tentar processar a URL na API externa.', 
      details: err.message 
    });
  }
}
