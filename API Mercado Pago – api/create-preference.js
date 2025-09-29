// /api/create-preference.js
import mercadopago from "mercadopago";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado' });
    }

    mercadopago.configure({
      access_token: accessToken
    });

    const { items, back_urls } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Itens invál
