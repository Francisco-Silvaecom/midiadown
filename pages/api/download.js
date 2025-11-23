// pages/api/download.js

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "URL é obrigatória" });
  }

  try {
    const apiURL = `https://instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com/?url=${encodeURIComponent(url)}`;

    const response = await fetch(apiURL, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": "instagram-downloader-download-instagram-videos-stories1.p.rapidapi.com",
      },
    });

    const data = await response.json();

    if (!data?.media || !data.media[0]?.download_url) {
      return res.status(400).json({ error: "Mídia não encontrada" });
    }

    return res.status(200).json({ download_url: data.media[0].download_url });

  } catch (error) {
    console.error("API Error", error);
    return res.status(500).json({ error: "Erro ao baixar a mídia" });
  }
}
