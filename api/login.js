export default async function handler(req, res) {
  const base = process.env.MERCATTO_BASE;

  const xml = `
  <Usuario>
    <username>${process.env.MERCATTO_USER}</username>
    <password>${process.env.MERCATTO_PASS}</password>
  </Usuario>`;

  const r = await fetch(`${base}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/xml" },
    body: xml
  });

  const data = await r.json();
  res.status(200).json(data);
}
