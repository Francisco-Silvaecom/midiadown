import cheerio from 'cheerio';
import got from 'got';

export default async function handler(req, res) {
  const link = req.query.url;

  if (!link) {
    return res.status(400).json({ ok: false, error: 'Missing url query param' });
  }

  try {
    const response = await got(link, {
      headers: {
        'user-agent': 'Mozilla/5.0',
        'accept': 'text/html'
      }
    });

    const $ = cheerio.load(response.body);

    // Tentativa 1 — encontrar og:video
    const ogVideo = $('meta[property="og:video"]').attr('content')
      || $('meta[property="og:video:secure_url"]').attr('content');

    if (ogVideo) {
      return res.json({
        ok: true,
        type: 'video',
        mediaUrl: ogVideo
      });
    }

    // Tentativa 2 — og:image (caso não seja vídeo)
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      return res.json({
        ok: true,
        type: 'image',
        mediaUrl: ogImage
      });
    }

    // Se nada encontrado
    return res.json({
      ok: false,
      error: 'Media not found'
    });

  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      ok: false,
      error: 'Error fetching the page'
    });
  }
}
