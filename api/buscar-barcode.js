export default async function handler(req, res) {
  const { barcode } = req.query;

  if (!barcode) {
    return res.status(400).json({
      error: "Barcode não informado"
    });
  }

  try {
    /* =====================================================
       1️⃣ OBTÉM TOKEN (USA SUA API AUTH EXISTENTE)
    ===================================================== */
    const authResp = await fetch(`${process.env.VERCEL_URL || ""}/api/auth`);
    const authRaw = await authResp.text();

    console.log("AUTH STATUS:", authResp.status);
    console.log("AUTH RAW:", authRaw);

    if (!authResp.ok) {
      return res.status(401).json({
        error: "Erro ao autenticar",
        raw: authRaw
      });
    }

    const authJson = JSON.parse(authRaw);
    const token = authJson.accessToken;

    if (!token) {
      return res.status(401).json({
        error: "Token não retornado"
      });
    }

    /* =====================================================
       2️⃣ BUSCA CÓDIGO AUXILIAR (EAN / BARCODE)
       ⚠️ O ID DO CÓDIGO É O PRÓPRIO BARCODE
    ===================================================== */
    const urlCodigo = `https://mercatto.varejofacil.com/api/v1/produto/codigos-auxiliares?q=id==${barcode}&start=0&count=1`;

    console.log("BUSCANDO CÓDIGO AUXILIAR:", urlCodigo);

    const codigoResp = await fetch(urlCodigo, {
      headers: {
        Authorization: token,
        Accept: "application/json"
      }
    });

    const codigoRaw = await codigoResp.text();

    console.log("CODIGO STATUS:", codigoResp.status);
    console.log("CODIGO RAW:", codigoRaw);

    if (!codigoResp.ok) {
      return res.status(codigoResp.status).json({
        error: "Erro ao buscar código de barras",
        raw: codigoRaw
      });
    }

    const codigoJson = JSON.parse(codigoRaw);

    if (
      !codigoJson.items ||
      !codigoJson.items.length ||
      !codigoJson.items[0].produtoId
    ) {
      return res.status(404).json({
        error: "Código de barras não encontrado",
        barcode
      });
    }

    const produtoId = codigoJson.items[0].produtoId;

    console.log("PRODUTO ID ENCONTRADO:", produtoId);

    /* =====================================================
       3️⃣ BUSCA PRODUTO COMPLETO PELO ID
    ===================================================== */
    const urlProduto = `https://mercatto.varejofacil.com/api/v1/produto/produtos/${produtoId}`;

    console.log("BUSCANDO PRODUTO:", urlProduto);

    const produtoResp = await fetch(urlProduto, {
      headers: {
        Authorization: token,
        Accept: "application/json"
      }
    });

    const produtoRaw = await produtoResp.text();

    console.log("PRODUTO STATUS:", produtoResp.status);
    console.log("PRODUTO RAW:", produtoRaw);

    if (!produtoResp.ok) {
      return res.status(produtoResp.status).json({
        error: "Erro ao buscar produto",
        raw: produtoRaw
      });
    }

    const produtoJson = JSON.parse(produtoRaw);

    /* =====================================================
       4️⃣ RETORNO FINAL (PRODUTO COMPLETO)
    ===================================================== */
    return res.status(200).json({
      barcode,
      produtoId,
      produto: produtoJson
    });

  } catch (err) {
    console.error("ERRO BUSCAR BARCODE:", err);
    return res.status(500).json({
      error: "Erro interno busca barcode",
      message: err.message
    });
  }
}
