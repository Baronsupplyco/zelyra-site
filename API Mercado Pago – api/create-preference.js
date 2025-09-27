// api/create-preference.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return res.status(500).json({ error: 'Access token do Mercado Pago não configurado.' });
  }

  try {
    const body = await req.json?.() || req.body; // Vercel node18 aceita req.body
    const items = (body?.items || []).map(it => ({
      title: it.title,
      quantity: Number(it.quantity || 1),
      currency_id: "BRL",
      unit_price: Number(it.unit_price)
    }));

    const preference = {
      items,
      back_urls: {
        success: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/sucesso.html`,
        failure: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/erro.html`,
        pending: `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/sucesso.html`
      },
      auto_return: "approved",
      payment_methods: {
        excluded_payment_types: [],
        installments: 12
      }
    };

    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    const data = await r.json();
    if (data?.init_point) {
      return res.status(200).json({ id: data.id, init_point: data.init_point });
    }
    return res.status(500).json({ error: 'Falha ao criar preferência', details: data });

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro interno' });
  }
}


---
