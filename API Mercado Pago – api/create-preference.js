// api/create-preference.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({error: 'Method not allowed'});
  }

  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  if(!ACCESS_TOKEN){
    return res.status(500).json({error: 'ACCESS_TOKEN não configurado na Vercel.'});
  }

  try {
    const { items = [] } = req.body;

    const preference = {
      items,
      back_urls: {
        success: `${req.headers.origin || ''}/sucesso.html`,
        failure: `${req.headers.origin || ''}/erro.html`,
        pending: `${req.headers.origin || ''}/sucesso.html`
      },
      auto_return: "approved"
    };

    const mpResp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    const data = await mpResp.json();
    if (mpResp.ok && data.init_point) {
      return res.status(200).json({ init_point: data.init_point });
    } else {
      console.error('MP Error:', data);
      return res.status(400).json({ error: 'Falha ao criar preferência', details: data });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({error: 'Erro interno ao criar preferência'});
  }
}
