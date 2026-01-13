export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const authHeader = req.headers.authorization;
  const body = req.body;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  try {
    const url = "https://mercatto.varejofacil.com/api/v1/estoque/requisicoes-mercadorias";

    console.log("URL REQUISICAO:", url);
    console.log("AUTH:", authHeader);
    console.log("BODY ENVIADO:", JSON.stringify(body, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    });

    const text = await response.text();

    console.log("STATUS:", response.status);
    console.log("RAW:", text);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Erro ao registrar requisição",
        raw: text
      });
    }

    return res.status(200).json({
      success: true,
      raw: text
    });

  } catch (err) {
    return res.status(500).json({
      error: "Erro interno requisição",
      message: err.message
    });
  }
}
