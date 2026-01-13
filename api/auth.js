let cachedToken = null;
let tokenExpireAt = 0;

export async function getToken(){
  if(cachedToken && Date.now() < tokenExpireAt){
    return cachedToken;
  }

  const res = await fetch(`${process.env.VAREJO_BASE_URL}/auth`, {
    method: 'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({
      username: process.env.VAREJO_USER,
      password: process.env.VAREJO_PASS
    })
  });

  if(!res.ok){
    throw new Error('Falha ao autenticar no Varejo Fácil');
  }

  const data = await res.json();

  cachedToken = data.accessToken;
  tokenExpireAt = Date.now() + (29 * 60 * 1000); // 29 min

  return cachedToken;
}
