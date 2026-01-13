let cachedToken = null;
let expiresAt = 0;

export default async function handler(req, res) {
  try {
    if (cachedToken && Date.now() < expiresAt) {
      return res.status(200).json({ accessToken: cachedToken });
    }

    const r = await fetch('https://mercatto.varejofacil.com/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml' },
      body: `
        <Usuario>
          <username>${process.env.VAREJO_USER}</username>
          <password>${process.env.VAREJO_PASS}</password>
        </Usuario>
      `
    });

    const text = await r.text();

    // 🔥 defesa contra HTML
    if (!text.trim().startsWith('{')) {
      console.error('Resposta não JSON:', text);
      return res.status(500).json({
        message: 'Resposta inválida do servidor de autenticação'
      });
    }

    const data = JSON.parse(text);

    cachedToken = data.accessToken;
    expiresAt = Date.now() + 29 * 60 * 1000;

    res.status(200).json({ accessToken: cachedToken });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
