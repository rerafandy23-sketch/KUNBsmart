import { ensureTables, getSql, mapProduct } from "../lib/db.js";

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
        FROM products
        ORDER BY created_at DESC, id DESC
      `;
      send(res, 200, { products: rows.map(mapProduct) });
      return;
    }

    if (req.method === "POST") {
      if (req.headers["x-operator-code"] !== operatorCode) {
        send(res, 401, { error: "Kode operator tidak valid." });
        return;
      }

      const body = req.body || {};
      const name = String(body.name || "").trim();
      const category = String(body.category || "").trim();
      const mark = String(body.mark || "").trim().toUpperCase().slice(0, 3);
      const price = Number(body.price);
      const oldPrice = Number(body.oldPrice || 0);
      const stock = Number(body.stock);

      if (!name || !category || !mark || price < 0 || stock < 0) {
        send(res, 400, { error: "Data produk tidak lengkap." });
        return;
      }

      const rows = await db`
        INSERT INTO products (name, category, price, old_price, stock, promo, is_new, mark)
        VALUES (${name}, ${category}, ${price}, ${oldPrice}, ${stock}, ${Boolean(body.promo)}, ${Boolean(body.isNew)}, ${mark})
        RETURNING *
      `;

      send(res, 201, { product: mapProduct(rows[0]) });
      return;
    }

    res.setHeader("Allow", "GET, POST");
    send(res, 405, { error: "Method tidak didukung." });
  } catch (error) {
    send(res, 503, { error: error.message || "Database belum tersambung." });
  }
}
