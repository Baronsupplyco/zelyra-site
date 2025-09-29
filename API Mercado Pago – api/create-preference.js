// /api/checkout.js
import mercadopago from "mercadopago";

export default async function handler(req, res){
  if(req.method !== 'POST'){
    return res.status(405).json({error: 'Método não permitido'});
  }

  try{
    const { items, payer } = req.body || {};

    if(!items || !Array.isArray(items) || !items.length){
      return res.status(400).json({error: 'Itens inválidos'});
    }

    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN   // << configure na Vercel
    });

    const preference = {
      items: items.map(i => ({
        title: i.title,
        quantity: Number(i.quantity),
        currency_id: "BRL",
        unit_price: Number(i.unit_price.toFixed(2)),
        picture_url: i.picture_url || undefined
      })),
      payer: payer || {},
      back_urls: {
        success: `${process.env.BASE_URL || 'https://'+req.headers.host}/sucesso.html`,
        failure: `${process.env.BASE_URL || 'https://'+req.headers.host}/sucesso.html`,
        pending: `${process.env.BASE_URL || 'https://'+req.headers.host}/sucesso.html`
      },
      auto_return: "approved"
    };

    const resp = await mercadopago.preferences.create(preference);
    return res.status(200).json({
      id: resp.body.id,
      init_point: resp.body.init_point,
      sandbox_init_point: resp.body.sandbox_init_point
    });
  }catch(e){
    console.error('Erro MP:', e.message);
    return res.status(500).json({ error: 'Erro ao criar preferência' });
  }
}
