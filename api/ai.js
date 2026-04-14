export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: 'Falta el prompt' });
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        input: prompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Error en OpenAI'
      });
    }

    const text =
      data.output_text ||
      data.output?.flatMap(item => item.content || [])
        ?.filter(c => c.type === 'output_text')
        ?.map(c => c.text || '')
        ?.join('') ||
      '';

    res.status(200).json({ text });

  } catch (err) {
    res.status(500).json({
      error: err.message || 'Error interno'
    });
  }
}
