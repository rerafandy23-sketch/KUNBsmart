import { neon } from "@neondatabase/serverless";

let sql;
let ready;

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diatur di Vercel.");
  }

  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }

  return sql;
}

export async function ensureTables() {
  if (ready) return ready;

  const db = getSql();
  ready = Promise.all([
    db`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price INTEGER NOT NULL,
        old_price INTEGER NOT NULL DEFAULT 0,
        stock INTEGER NOT NULL DEFAULT 0,
        promo BOOLEAN NOT NULL DEFAULT FALSE,
        is_new BOOLEAN NOT NULL DEFAULT FALSE,
        mark TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
    db`
      CREATE TABLE IF NOT EXISTS suggestions (
        id SERIAL PRIMARY KEY,
        name TEXT,
        text TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `,
  ]);

  return ready;
}

export function mapProduct(row) {
  return {
    id: `db-${row.id}`,
    name: row.name,
    category: row.category,
    price: Number(row.price),
    oldPrice: Number(row.old_price),
    stock: Number(row.stock),
    promo: Boolean(row.promo),
    isNew: Boolean(row.is_new),
    mark: row.mark,
  };
}

export function mapSuggestion(row) {
  return {
    id: `db-${row.id}`,
    name: row.name || "",
    text: row.text,
    createdAt: row.created_at,
  };
}
