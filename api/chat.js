module.exports = async function handler(req, res) {
  // Configurazione CORS completa
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    // Parsing dinamico e validazione del payload
    let body = req.body;
    if (typeof body === 'string') {
        body = JSON.parse(body);
    }
    const { prompt, systemInstruction } = body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'API Key mancante lato server. Variabile non esposta.' });
    }

    // Downgrade al modello di produzione standard per compatibilità chiavi pubbliche
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] }
      })
    });

    if (!response.ok) {
        const errorDetails = await response.text();
        throw new Error(`Google API Fault: Status ${response.status} | Dettagli: ${errorDetails}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Errore Strutturale Backend:", error.message);
    res.status(500).json({ error: error.message });
  }
};
