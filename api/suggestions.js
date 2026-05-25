import { ensureTables, getSql, mapSuggestion } from "../lib/db.js";

function send(res, status, body) {
  res.status(status).json(body);
}

export default async function handler(req, res) {
  try {
    await ensureTables();
    const db = getSql();

    if (req.method === "GET") {
      const rows = await db`
        SELECT *
        FROM suggestions
        ORDER BY created_at DESC, id DESC
      `;
      send(res, 200, { suggestions: rows.map(mapSuggestion) });
      return;
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const name = String(body.name || "").trim();
      const text = String(body.text || "").trim();

      if (!text) {
        send(res, 400, { error: "Saran tidak boleh kosong." });
        return;
      }

      const rows = await db`
        INSERT INTO suggestions (name, text)
        VALUES (${name}, ${text})
        RETURNING *
      `;

      send(res, 201, { suggestion: mapSuggestion(rows[0]) });
      return;
    }

    res.setHeader("Allow", "GET, POST");
    send(res, 405, { error: "Method tidak didukung." });
  } catch (error) {
    send(res, 503, { error: error.message || "Database belum tersambung." });
  }
}

