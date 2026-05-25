const operatorCode = process.env.OPERATOR_CODE || "KUNB2026";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method tidak didukung." });
    return;
  }

  if (req.headers["x-operator-code"] !== operatorCode) {
    res.status(401).json({ error: "Kode operator tidak valid." });
    return;
  }

  res.status(200).json({ ok: true });
}
