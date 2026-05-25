import { ensureTables, getSql, mapSuggestion } from "../lib/db.js";

const operatorCode = process.env.OPERATOR_CODE || "KUNB2026";

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

    if (req.method === "DELETE") {
      if (req.headers["x-operator-code"] !== operatorCode) {
        send(res, 401, { error: "Kode operator tidak valid." });
        return;
      }

      if (req.query.all === "true") {
        await db`DELETE FROM suggestions`;
        send(res, 200, { ok: true });
        return;
      }

      const suggestionId = String(req.query.id || "").replace("db-", "");
      const numericId = Number(suggestionId);

      if (!numericId) {
        send(res, 400, { error: "ID saran tidak valid." });
        return;
      }

      await db`
        DELETE FROM suggestions
        WHERE id = ${numericId}
      `;

      send(res, 200, { ok: true });
      return;
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    send(res, 405, { error: "Method tidak didukung." });
  } catch (error) {
    send(res, 503, { error: error.message || "Database belum tersambung." });
  }
}
