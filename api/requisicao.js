export default async function handler(req, res) {
  try {
    const login = await fetch(`${req.headers.origin}/api/login`);
    const loginData = await login.json();

    if (!loginData.token) {
      return res.status(401).json({ error: "Token inválido" });
    }

    const response = await fetch(
      `${process.env.VAREJO_URL}/api/v1/estoque/requisicoes-mercadorias`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${loginData.token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(req.body)
      }
    );

    const text = await response.text();

    if (!text.startsWith("{")) {
      return res.status(500).json({
        error: "Resposta não JSON",
        raw: text
      });
    }

    return res.status(response.status).json(JSON.parse(text));

  } catch (err) {
    return res.status(500).json({
      error: "Erro na requisição",
      message: err.message
    });
  }
}
