export default async function handler(req, res) {
  const { barcode } = req.query;

  if (!barcode) {
    return res.status(400).json({ error: "Barcode obrigatório" });
  }

  try {
    /* ================= AUTH ================= */
    const authResp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`);
    const authJson = await authResp.json();

    if (!authJson.accessToken) {
      return res.status(401).json({ error: "Token não obtido", raw: authJson });
    }

    const token = authJson.accessToken;

    /* ========= BUSCA CÓDIGO AUXILIAR ========= */
    const urlCodigo =
      `https://mercatto.varejofacil.com/api/v1/produto/codigos-auxiliares` +
      `?q=id==${barcode}&start=0&count=1`;

    const codResp = await fetch(urlCodigo, {
      headers: {
        Authorization: token,
        Accept: "application/json"
      }
    });

    const codText = await codResp.text();
    const codJson = JSON.parse(codText);

    if (!codJson.items || !codJson.items.length) {
      return res.status(404).json({
        error: "Código de barras não encontrado",
        barcode
      });
    }

    const produtoId = codJson.items[0].produtoId;

    /* ============ BUSCA PRODUTO ============== */
    const urlProduto =
      `https://mercatto.varejofacil.com/api/v1/produto/produtos?q=id==${produtoId}&start=0&count=1`;

    const prodResp = await fetch(urlProduto, {
      headers: {
        Authorization: token,
        Accept: "application/json"
      }
    });

    const prodText = await prodResp.text();
    const prodJson = JSON.parse(prodText);

    if (!prodJson.items || !prodJson.items.length) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    return res.status(200).json({
      barcode,
      produto: prodJson.items[0]
    });

  } catch (err) {
    return res.status(500).json({
      error: "Erro interno busca barcode",
      message: err.message
    });
  }
}
