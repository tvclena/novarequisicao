let cache = {
  token: null,
  expires: 0
};

export default async function handler(req, res) {
  try {
    // reutiliza token por 29 minutos
    if (cache.token && Date.now() < cache.expires) {
      return res.status(200).json({ accessToken: cache.token });
    }

    const response = await fetch(
      'https://mercatto.varejofacil.com/api/auth',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Accept': 'application/json'
        },
        body: `
<Usuario>
  <username>${process.env.VAREJO_USER}</username>
  <password>${process.env.VAREJO_PASS}</password>
</Usuario>`
      }
    );

    const text = await response.text();

    // defesa contra HTML
    if (!text.trim().startsWith('{')) {
      console.error('AUTH HTML:', text);
      return res.status(500).json({
        error: 'Resposta inválida do servidor de autenticação'
      });
    }

    const data = JSON.parse(text);

    cache.token = data.accessToken;
    cache.expires = Date.now() + 29 * 60 * 1000;

    res.status(200).json({ accessToken: cache.token });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
