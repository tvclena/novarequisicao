export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: 'ID não informado' });
    }

    const auth = await fetch(`${req.headers.origin}/api/auth`);
    const authData = await auth.json();

    const r = await fetch(
      `https://mercatto.varejofacil.com/api/v1/produto/produtos?q=id==${id}`,
      {
        headers: {
          Authorization: `Bearer ${authData.accessToken}`
        }
      }
    );

    const data = await r.json();
    res.status(200).json(data);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
