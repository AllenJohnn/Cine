import express from "express";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(compression());

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

app.get("/api/tmdb/*", async (req, res) => {
  if (!TMDB_API_KEY) {
    return res.status(500).json({ status_message: "TMDB API key missing on server." });
  }

  const endpointPath = req.params[0];
  if (!endpointPath) {
    return res.status(400).json({ status_message: "Missing TMDB endpoint path." });
  }

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

  const targetUrl = `${TMDB_BASE}/${endpointPath}?${query.toString()}`;

  try {
    const response = await fetch(targetUrl, {
      headers: { Accept: "application/json" },
    });

    const data = await response.text();
    res.status(response.status);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.send(data);
  } catch (error) {
    console.error("TMDB proxy error:", error);
    res.status(502).json({ status_message: "TMDB proxy request failed." });
  }
});

const distPath = path.resolve(__dirname, "..", "dist");
app.use(express.static(distPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const port = process.env.PORT || 4173;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
