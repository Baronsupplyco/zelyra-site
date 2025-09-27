import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({error:'Método não permitido'});
  try{
    const { items } = req.body;
    mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN });

    const preference = {
      items: items.map(it => ({
        title: it.title, quantity: Number(it.quantity),
        currency_id: it.currency_id || 'BRL', unit_price: Number(it.unit_price)
      })),
      back_urls: {
        success: `${req.headers.origin}/sucesso.html`,
        failure: `${req.headers.origin}/erro.html`,
        pending: `${req.headers.origin}/sucesso.html`
      },
      auto_return: "approved"
    };

    const response = await mercadopago.preferences.create(preference);
    return res.status(200).json({ init_point: response.body.init_point });
  }catch(err){
    console.error('MP erro:', err);
    return res.status(500).json({error:'Falha ao criar preferência'});
  }
}
