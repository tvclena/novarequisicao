export default async function handler(req, res) {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'ID obrigatório' });
    }

    // 1️⃣ busca token
    const authRes = await fetch(`${req.headers.origin}/api/auth`);
    const authData = await authRes.json();

    if (!authData.accessToken) {
      return res.status(500).json({ error: 'Token não gerado' });
    }

    // 2️⃣ busca produto pelo ID
    const produtoRes = await fetch(
      `https://mercatto.varejofacil.com/api/v1/produto/produtos?q=id==${id}`,
      {
        headers: {
          Authorization: `${authData.accessToken}`,
          Accept: 'application/json'
        }
      }
    );

    const produtoData = await produtoRes.json();

    res.status(200).json(produtoData);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
