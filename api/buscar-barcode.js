export default async function handler(req, res) {
  const { barcode } = req.query;

  if (!barcode) {
    return res.status(400).json({ error: "Barcode obrigatório" });
  }

  try {
    // 🔐 AUTH
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

    const authJson = await authResp.json();
    const token = authJson.accessToken;

    let start = 0;
    const count = 200;
    let encontrado = null;

    while (!encontrado) {
      const resp = await fetch(
        `https://mercatto.varejofacil.com/api/v1/produto/codigos-auxiliares?start=${start}&count=${count}`,
        {
          headers: {
            Authorization: token,
            Accept: "application/json"
          }
        }
      );

      const data = await resp.json();

      encontrado = data.items.find(i => i.id === barcode);

      if (encontrado) break;

      start += count;
      if (start >= data.total) break;
    }

    if (!encontrado) {
      return res.status(404).json({
        error: "Código de barras não encontrado",
        barcode
      });
    }

    // 🔍 PRODUTO COMPLETO
    const prodResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/produto/produtos/${encontrado.produtoId}`,
      {
        headers: {
          Authorization: token,
          Accept: "application/json"
        }
      }
    );

    const produto = await prodResp.json();

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
