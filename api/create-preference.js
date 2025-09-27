// api/create-preference.js
const mercadopago = require('mercadopago');

module.exports = async (req, res) => {
  if (req.method !== 'POST'){
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try{
    mercadopago.configure({
      access_token: process.env.MP_ACCESS_TOKEN
    });

    const { items } = req.body;

    const preference = {
      items: items.map(i => ({
        title: i.title,
        quantity: i.quantity,
        unit_price: i.unit_price,
        currency_id: 'BRL',
        picture_url: i.picture_url
      })),
      payment_methods: {
        excluded_payment_types: [],
        installments: 12 // permitir parcelamento
      },
      back_urls: {
        success: "https://zelyra-site.vercel.app/sucesso.html",
        failure: "https://zelyra-site.vercel.app/falha.html",
        pending: "https://zelyra-site.vercel.app/pending.html"
      },
      auto_return: "approved" // volta para success automaticamente quando aprovado
    };

    const resp = await mercadopago.preferences.create(preference);
    res.status(200).json({ init_point: resp.body.init_point });
  }catch(e){
    console.error('MP error', e);
    res.status(500).json({ error: 'Erro ao criar preferência' });
  }
};
