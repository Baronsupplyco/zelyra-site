// Vercel Serverless Function
export default async function handler(req, res){
  if(req.method !== 'POST'){
    return res.status(405).json({error:'Method not allowed'});
  }
  const { items = [], shipping_cost = 0 } = req.body || {};
  const accessToken = process.env.MP_ACCESS_TOKEN; // defina no Vercel

  if(!accessToken){
    return res.status(500).json({error:'MP_ACCESS_TOKEN não configurado.'});
  }

  const preference = {
    items: items.map(i => ({
      title: i.title,
      quantity: Number(i.quantity||1),
      unit_price: Number(i.unit_price||0),
      currency_id: i.currency_id || 'BRL',
      picture_url: i.picture_url || ''
    })),
    back_urls: {
      success: `${process.env.SITE_URL || 'https://zelyra-site.vercel.app'}/sucesso.html`,
      failure: `${process.env.SITE_URL || 'https://zelyra-site.vercel.app'}/erro.html`,
      pending: `${process.env.SITE_URL || 'https://zelyra-site.vercel.app'}/pendente.html`
    },
    auto_return: 'approved',
    shipments: {
      cost: Number(shipping_cost || 0),
      mode: 'not_specified'
    },
    statement_descriptor: 'ZELYRA',
    notification_url: `${process.env.SITE_URL || 'https://zelyra-site.vercel.app'}/api/webhook`
  };

  try{
    const resp = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(preference)
    });
    const data = await resp.json();
    if(data.init_point || data.sandbox_init_point){
      return res.status(200).json({ init_point: data.init_point || data.sandbox_init_point });
    }
    return res.status(500).json({error:'Falha ao criar preferência', details:data});
  }catch(e){
    return res.status(500).json({error:'Erro de integração', details: String(e)});
  }
}
