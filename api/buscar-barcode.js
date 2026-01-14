export default async function handler(req, res) {
  const { barcode } = req.query;

  if (!barcode) {
    return res.status(400).json({ error: "Barcode obrigatório" });
  }

  try {
    // 1️⃣ AUTENTICA (USANDO SEU AUTH)
    const authResp = await fetch(`${req.headers.origin}/api/auth`);
    const authJson = await authResp.json();

    if (!authJson.accessToken) {
      return res.status(401).json({ error: "Token não retornado", authJson });
    }

    const token = authJson.accessToken;

    // 2️⃣ BUSCA TODOS OS CÓDIGOS AUXILIARES
    const codigosResp = await fetch(
      "https://mercatto.varejofacil.com/api/v1/produto/codigos-auxiliares?start=0&count=1000",
      {
        headers: {
          Authorization: token,
          Accept: "application/json"
        }
      }
    );

    const codigosRaw = await codigosResp.text();
    const codigos = JSON.parse(codigosRaw);

    const encontrado = codigos.items.find(i => i.id === barcode);

    if (!encontrado) {
      return res.status(404).json({
        error: "Código de barras não encontrado",
        barcode
      });
    }

    // 3️⃣ BUSCA PRODUTO COMPLETO
    const produtoResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/produto/produtos/${encontrado.produtoId}`,
      {
        headers: {
          Authorization: token,
          Accept: "application/json"
        }
      }
    );

    const produtoRaw = await produtoResp.text();
    const produto = JSON.parse(produtoRaw);

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
