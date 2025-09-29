// Função serverless para criar uma preferência no Mercado Pago
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: "MP_ACCESS_TOKEN não configurado na Vercel" });
  }

  try {
    const { items } = req.body;

    // Validação simples
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Itens inválidos" });
    }

    const preference = {
      items,
      payment_methods: {
        installments: 12, // permite até 12x
        default_installments: 1
      },
      back_urls: {
        success: `${req.headers.origin || "https://zelyra-site.vercel.app"}/sucesso.html`,
        failure: `${req.headers.origin || "https://zelyra-site.vercel.app"}/erro.html`,
        pending: `${req.headers.origin || "https://zelyra-site.vercel.app"}/sucesso.html`
      },
      auto_return: "approved",
      external_reference: "zelyra-site"
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preference)
    });

    const data = await mpRes.json();
    if (!mpRes.ok) {
      console.error("MP error:", data);
      return res.status(500).json({ error: "Mercado Pago error", details: data });
    }

    return res.status(200).json({
      init_point: data.init_point || data.sandbox_init_point
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Erro interno" });
  }
}
