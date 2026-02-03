export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const TMDB_BASE = "https://api.themoviedb.org/3";

  if (!TMDB_API_KEY) {
    console.error("TMDB_API_KEY is not set");
    return res.status(500).json({ 
      status_message: "TMDB API key missing on server.",
      error: "Configuration error" 
    });
  }

  // Extract the path after /api/tmdb/
  const path = req.url.replace(/^\/api\/tmdb\/?/, '');
  
  if (!path) {
    return res.status(400).json({ 
      status_message: "Missing TMDB endpoint path.",
      error: "Invalid request" 
    });
  }

  // Build query string, excluding api_key if present
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(req.query)) {
    if (key === "api_key") continue;
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, String(v)));
    } else if (value != null) {
      query.append(key, String(value));
    }
  }
  query.append("api_key", TMDB_API_KEY);

  const targetUrl = `${TMDB_BASE}/${path}?${query.toString()}`;

  try {
    const response = await fetch(targetUrl, {
      headers: { 
        Accept: "application/json",
        'User-Agent': 'CineView-Hub/1.0'
      },
    });

    const data = await response.text();
    
    // Set response headers
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=120");
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    res.status(response.status).send(data);
  } catch (error) {
    console.error("TMDB proxy error:", error);
    res.status(502).json({ 
      status_message: "TMDB proxy request failed.",
      error: error.message 
    });
  }
}
