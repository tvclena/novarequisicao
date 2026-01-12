export default async function handler(req, res) {
  const token = req.headers.authorization;

  const r = await fetch(
    `${process.env.MERCATTO_BASE}/estoque/requisicoes-mercadorias`,
    {
      method: "POST",
      headers: {
        Authorization: token,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    }
  );

  const text = await r.text();
  res.status(r.status).send(text);
}
