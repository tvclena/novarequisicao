export default async function handler(req, res) {
  try {
    const response = await fetch(
      `${process.env.VAREJO_URL}/api/v1/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          usuario: process.env.VAREJO_USUARIO,
          senha: process.env.VAREJO_SENHA
        })
      }
    );

    const text = await response.text();

    // 🔴 se não for JSON, devolve erro legível
    if (!text.startsWith("{")) {
      return res.status(500).json({
        error: "Login não retornou JSON",
        raw: text
      });
    }

    const data = JSON.parse(text);

    if (!data.token) {
      return res.status(401).json({
        error: "Token não retornado",
        data
      });
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({
      error: "Erro interno no login",
      message: err.message
    });
  }
}
