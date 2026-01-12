export default async function handler(req, res) {
  const { q } = req.query;
  const token = req.headers.authorization;

  const r = await fetch(
    `${process.env.MERCATTO_BASE}/produtos?q=${encodeURIComponent(q)}`,
    {
      headers: {
        Authorization: token,
        Accept: "application/json"
      }
    }
  );

  const data = await r.json();
  res.status(200).json(data);
}
