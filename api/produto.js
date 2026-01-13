import { getToken } from './auth.js';

export default async function handler(req, res){
  try{
    const { id } = req.query;

    if(!id){
      return res.status(400).json({ message:'ID não informado' });
    }

    const token = await getToken();

    const api = `${process.env.VAREJO_BASE_URL}/v1/produto/produtos?q=id==${id}`;

    const r = await fetch(api, {
      headers:{
        Authorization: `Bearer ${token}`
      }
    });

    const data = await r.json();

    if(!r.ok){
      return res.status(500).json(data);
    }

    res.status(200).json(data);

  }catch(err){
    res.status(500).json({ message: err.message });
  }
}
