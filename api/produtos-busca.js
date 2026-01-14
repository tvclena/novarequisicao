export default async function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: "Texto de busca obrigatório" });
  }

  try {
    // 1️⃣ pega token
    const authResp = await fetch(`${process.env.BASE_URL}/api/auth`);
    const auth = await authResp.json();

    if (!auth.accessToken) {
      return res.status(401).json({ error: "Token não retornado" });
    }

    const url = `https://mercatto.varejofacil.com/api/v1/produto/produtos?q=descricao==*${q}*&start=0&count=20`;

    console.log("BUSCA URL:", url);

    const resp = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: auth.accessToken
      }
    });

    const text = await resp.text();
    console.log("BUSCA RAW:", text);

    if (!resp.ok) {
      return res.status(resp.status).json({ error: "Erro busca", raw: text });
    }

    return res.status(200).json(JSON.parse(text));

  } catch (err) {
    return res.status(500).json({
      error: "Erro interno busca",
      message: err.message
    });
  }
}
