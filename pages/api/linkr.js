
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { domain } = req.body;

  if (!domain) {
    return res.status(400).json({ error: 'Missing domain in request body' });
  }

  const prompt = `Act as a data monetization consultant from LINKR. A company has entered the domain: ${domain}. Return the following sections:

1. About LINKR
2. Why this company is a fit for data monetization
3. Top 3 use cases
4. Suggested packaging (API, export, etc.)
5. Compliance table
6. Revenue forecast (1-3 yrs)
7. Schema preview
8. 2–3 LinkedIn outreach messages`;

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a data consultant at LINKR." },
          { role: "user", content: prompt },
        ],
        temperature: 0.6,
      }),
    });

    const data = await openaiRes.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    res.status(200).json({ output: data.choices?.[0]?.message?.content || 'No output received from OpenAI.' });
  } catch (error) {
    console.error("GPT API Error:", error);
    res.status(500).json({ error: 'An error occurred while calling OpenAI API.' });
  }
}
