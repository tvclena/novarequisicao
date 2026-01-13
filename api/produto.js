export default async function handler(req, res) {
  const { id } = req.query;
  const authHeader = req.headers.authorization;

  // 🔒 validações básicas
  if (!id) {
    return res.status(400).json({ error: "ID obrigatório" });
  }

  if (!authHeader) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  try {
    // ✅ URL OFICIAL DO VAREJO FÁCIL
    const url = `https://mercatto.varejofacil.com/api/v1/produto/produtos?q=id==${id}&start=0&count=1`;

    // 🔎 DEBUG TOTAL
    console.log("🔍 BUSCANDO PRODUTO");
    console.log("➡️ URL PRODUTO:", url);
    console.log("🔐 AUTH HEADER:", authHeader);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": authHeader, // Bearer eyJhbGciOi...
        "Accept": "application/json"
      }
    });

    const raw = await response.text();

    console.log("📡 STATUS PRODUTO:", response.status);
    console.log("📦 RESPOSTA PRODUTO (RAW):", raw);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Erro ao buscar produto",
        raw
      });
    }

    const json = JSON.parse(raw);

    return res.status(200).json(json);

  } catch (err) {
    return res.status(500).json({
      error: "Erro interno produto",
      message: err.message
    });
  }
}
