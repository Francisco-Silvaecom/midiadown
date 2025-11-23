// pages/api/stream.js
// API Route para fazer proxy e forçar o download (Content-Disposition: attachment)

import got from 'got';

export default async function handler(req, res) {
    const mediaUrl = req.query.media;
    const filename = req.query.filename || 'download.mp4';
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!mediaUrl) {
        return res.status(400).json({ error: 'Parâmetro "media" é obrigatório.' });
    }

    try {
        // Cria um stream de requisição HTTP para a mídia original
        const streamResp = got.stream(mediaUrl, {
            headers: { 
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36' 
            },
            timeout: { request: 60000 } // 60 segundos
        });

        // 1. Repassar headers de Content-Type e Content-Length
        streamResp.on('response', r => {
            if (r.headers['content-type']) res.setHeader('Content-Type', r.headers['content-type']);
            if (r.headers['content-length']) res.setHeader('Content-Length', r.headers['content-length']);
            
            // 2. O CABEÇALHO MÁGICO para forçar o download!
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        });

        streamResp.on('error', err => {
            console.error('Stream Error:', err.message);
            if (!res.headersSent) res.status(500).json({ error: 'Falha ao transmitir o arquivo.' });
        });

        // 3. Conecta o stream do host original com a resposta do cliente
        streamResp.pipe(res);

    } catch (err) {
        console.error('Catch Stream Error:', err.message);
        return res.status(500).json({ error: 'Erro de processamento de stream.' });
    }
}
