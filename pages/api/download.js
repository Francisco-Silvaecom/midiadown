// pages/api/download.js

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "URL é obrigatória" });
  }

  try {
    // Chama a API externa para obter a mídia
    const apiURL = `https://instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com/?url=${encodeURIComponent(url)}`;
    const r = await fetch(apiURL, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com",
      },
    });

    const data = await r.json();
    // Verifica estrutura da resposta
    if (!data?.media || !data.media[0]?.download_url) {
      return res.status(400).json({ error: "Mídia não encontrada" });
    }

    // Retorna a URL de download para o frontend
    return res.status(200).json({
      download_url: data.media[0].download_url,
    });
  } catch (err) {
    console.error("Erro na API /download:", err);
    return res.status(500).json({ error: "Falha ao processar o download" });
  }
}
