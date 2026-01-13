export default async function handler(req, res) {
  try {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Usuario>
  <username>${process.env.VAREJO_USER}</username>
  <password>${process.env.VAREJO_PASS}</password>
</Usuario>`;

    const response = await fetch(
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

    const text = await response.text();

    // DEBUG TOTAL
    console.log("AUTH STATUS:", response.status);
    console.log("AUTH RAW:", text);

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Erro ao autenticar",
        raw: text
      });
    }

    const json = JSON.parse(text);

    return res.status(200).json({
      accessToken: json.accessToken,
      refreshToken: json.refreshToken,
      expiresIn: 1800 // 30 minutos
    });

  } catch (err) {
    return res.status(500).json({
      error: "Erro interno auth",
      message: err.message
    });
  }
}
