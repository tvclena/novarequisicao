export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    /* =============== AUTH ================= */
    const authResp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`);
    const authJson = await authResp.json();

    if (!authJson.accessToken) {
      return res.status(401).json({ error: "Token não obtido", raw: authJson });
    }

    const token = authJson.accessToken;

    /* ============ ENVIO REQUISIÇÃO ============ */
    const response = await fetch(
      "https://mercatto.varejofacil.com/api/v1/estoque/requisicoes-mercadorias",
      {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(req.body)
      }
    );

    const raw = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Erro ao registrar requisição",
        raw
      });
    }

    return res.status(201).json({
      message: "Requisição criada com sucesso",
      raw
    });

  } catch (err) {
    return res.status(500).json({
      error: "Erro interno requisição",
      message: err.message
    });
  }
}
