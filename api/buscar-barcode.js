export default async function handler(req, res) {
  const { barcode } = req.query;

  if (!barcode) {
    return res.status(400).json({ error: "Barcode obrigatório" });
  }

  try {
    // 1️⃣ TOKEN
    const auth = await fetch(`${process.env.BASE_URL}/api/auth`);
    const authJson = await auth.json();
    const token = authJson.accessToken;

    if (!token) throw new Error("Token não gerado");

    // 2️⃣ BUSCA CÓDIGOS AUXILIARES
    const codigosResp = await fetch(
      "https://mercatto.varejofacil.com/api/v1/produto/codigos-auxiliares?start=0&count=1000",
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
      return res.status(404).json({ error: "Código de barras não encontrado" });
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
