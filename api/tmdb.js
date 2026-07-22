// Vercel Serverless Function — proxies TMDB API calls
// Benefits: hides API key, server-side CDN caching for ALL users, avoids rate limits

export default async function handler(req, res) {
  const { path, query } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: 'TMDB API key not configured' });
  }

  try {
    const url = new URL(`https://api.themoviedb.org/3/${path}`);
    url.searchParams.append('api_key', TMDB_API_KEY);

    // Forward any extra query params (e.g. query, with_genres, append_to_response)
    if (query) {
      const extra = JSON.parse(query);
      Object.entries(extra).forEach(([k, v]) => {
        url.searchParams.append(k, v);
      });
    }

    const tmdbRes = await fetch(url.toString());
    const data = await tmdbRes.json();

    if (!tmdbRes.ok) {
      return res.status(tmdbRes.status).json(data);
    }

    // Cache at Vercel's CDN edge for 10 minutes, stale-while-revalidate for 1 hour
    // This means ALL users share the same cached response — no redundant TMDB calls
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=3600');
    return res.status(200).json(data);
  } catch (err) {
    console.error('TMDB proxy error:', err);
    return res.status(500).json({ error: 'Failed to fetch from TMDB' });
  }
}
