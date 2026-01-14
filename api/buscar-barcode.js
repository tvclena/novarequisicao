/**
 * buscar-barcode.js
 * Versão otimizada com cache de token + cache de códigos auxiliares
 * Resultado: leitura praticamente instantânea
 */

let cachedToken = null;
let tokenExpiraEm = 0;

let cacheCodigos = null; // Map(barcode -> produtoId)
let cacheAtualizadoEm = 0;

// ==================== TOKEN ====================
async function getToken() {
  const agora = Date.now();

  // Reutiliza token válido
  if (cachedToken && agora < tokenExpiraEm) {
    return cachedToken;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Usuario>
  <username>NALBERT SOUZA</username>
  <password>99861</password>
</Usuario>`;

  const resp = await fetch(
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

  const raw = await resp.text();

  if (!resp.ok) {
    throw new Error("Erro ao autenticar: " + raw);
  }

  const json = JSON.parse(raw);

  cachedToken = json.accessToken;
  // expira 1 minuto antes para segurança
  tokenExpiraEm = agora + (json.expiresIn * 1000) - 60000;

  return cachedToken;
}

// ==================== CÓDIGOS AUXILIARES ====================
async function carregarCodigos(token) {
  // Cache válido por 10 minutos
  if (cacheCodigos && Date.now() - cacheAtualizadoEm < 10 * 60 * 1000) {
    return cacheCodigos;
  }

  const mapa = new Map();
  let start = 0;
  const count = 500;

  while (true) {
    const resp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/produto/codigos-auxiliares?start=${start}&count=${count}`,
      {
        headers: {
          Authorization: token,
          Accept: "application/json"
        }
      }
    );

    const data = await resp.json();

    if (!data.items || !data.items.length) break;

    data.items.forEach(item => {
      // item.id = código de barras
      // item.produtoId = id do produto
      mapa.set(item.id, item.produtoId);
    });

    start += count;
    if (start >= data.total) break;
  }

  cacheCodigos = mapa;
  cacheAtualizadoEm = Date.now();

  return mapa;
}

// ==================== HANDLER ====================
export default async function handler(req, res) {
  try {
    const { barcode } = req.query;

    if (!barcode) {
      return res.status(400).json({ error: "Barcode obrigatório" });
    }

    // 1️⃣ Token (cacheado)
    const token = await getToken();

    // 2️⃣ Mapa de códigos (cacheado)
    const codigos = await carregarCodigos(token);

    const produtoId = codigos.get(barcode);

    if (!produtoId) {
      return res.status(404).json({
        error: "Código de barras não encontrado",
        barcode
      });
    }

    // 3️⃣ Produto completo
    const prodResp = await fetch(
      `https://mercatto.varejofacil.com/api/v1/produto/produtos/${produtoId}`,
      {
        headers: {
          Authorization: token,
          Accept: "application/json"
        }
      }
    );

    const produtoRaw = await prodResp.text();

    if (!prodResp.ok) {
      return res.status(prodResp.status).json({
        error: "Erro ao buscar produto",
        raw: produtoRaw
      });
    }

    const produto = JSON.parse(produtoRaw);

    return res.status(200).json({
      barcode,
      produtoId,
      produto
    });

  } catch (err) {
    return res.status(500).json({
      error: "Erro interno buscar-barcode",
      message: err.message
    });
  }
}
