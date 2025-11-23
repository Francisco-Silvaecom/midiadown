export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL é obrigatória" });
  }

  try {
    const response = await fetch("https://instasupersave.com/api/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const result = await response.json();

    if (result && result.result && result.result[0]?.url) {
      return res.status(200).json({
        media: result.result[0].url
      });
    }

    return res.status(400).json({ error: "Vídeo não encontrado. Verifique a URL!" });

  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Erro ao baixar o vídeo" });
  }
}
