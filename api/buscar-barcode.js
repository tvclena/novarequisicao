export default async function handler(req, res) {
  const { barcode } = req.query;

  if (!barcode) {
    return res.status(400).json({ error: "Barcode obrigatório" });
  }

  try {
    // 🔐 AUTH DIRETO (SEM HTTP INTERNO)
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Usuario>
  <username>NALBERT SOUZA</username>
  <password>99861</password>
</Usuario>`;

    const authResp = await fetch(
      "https://mercatto.varejofacil.com/api/auth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/xml",
          "Accept": "application/json"
        },
        body: xml
      }
    );

    const authRaw = await authResp.text();

    if (!authResp.ok) {
      return res.status(authResp.status).json({
        error: "Erro ao autenticar",
        raw: authRaw
      });
    }

    const authJson = JSON.parse(authRaw);
    const token = authJson.accessToken;

    // 📦 BUSCA CÓDIGOS AUXILIARES
    const codigosResp = await fetch(
      "https://mercatto.varejofacil.com/api/v1/produto/codigos-auxiliares?start=0&count=2000",
      {
        headers: {
          Authorization: token,
          Accept: "application/json"
        }
      }
    );

    const codigos = await codigosResp.json();

    const encontrado = codigos.items.find(i => i.id === barcode);

    if (!encontrado) {
      return res.status(404).json({
        error: "Código de barras não encontrado",
        barcode
      });
    }

    // 📦 PRODUTO COMPLETO
    const produtoResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/produto/produtos/${encontrado.produtoId}`,
      {
        headers: {
          Authorization: token,
          Accept: "application/json"
        }
      }
    );

    const produto = await produtoResp.json();

    return res.status(200).json({
      barcode,
      produtoId: encontrado.produtoId,
      produto
    });

  } catch (err) {
    return res.status(500).json({
      error: "Erro interno busca barcode",
      message: err.message
    });
  }
}
