// Vercel serverless function: /api/analyze
// Uses Google's Gemini API (free tier, no credit card required).
// Set GEMINI_API_KEY in Vercel's Environment Variables
// (Project Settings > Environment Variables).
// Get a free key at: https://aistudio.google.com/app/apikey

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { jd, resume } = req.body || {};

  if (!jd || !resume) {
    return res.status(400).json({ error: 'Missing jd or resume in request body' });
  }

  const prompt = `You are a resume analysis engine. Return ONLY valid JSON, no other text, no markdown code fences, no explanation.

Job Description:
${jd}

Resume:
${resume}

Analyze the gap between this resume and this JD. Return JSON with this exact shape:
{
  "missing_keywords": ["skill1", "skill2"],
  "weak_bullets": [
    {"original": "...", "issue": "why it's weak", "rewrite": "improved version"}
  ],
  "fit_summary": "2-3 sentence honest assessment",
  "fit_score": 7
}

Return 3-5 missing keywords max and 2-3 weak bullets max. Be specific and honest, not generic.`;

  try {
    const candidateModels = ['gemini-3.6-flash', 'gemini-flash-latest'];
    let response = null;
    let lastErrText = '';

    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1500,
              responseMimeType: 'application/json'
            }
          })
        });

        if (res.ok) {
          response = res;
          break;
        } else {
          lastErrText = await res.text();
          console.warn(`Model ${model} failed (${res.status}): ${lastErrText}. Trying next model...`);
        }
      } catch (networkErr) {
        lastErrText = networkErr.message;
        console.warn(`Network error with ${model}: ${networkErr.message}`);
      }
    }

    if (!response) {
      console.error('All Gemini candidate models failed:', lastErrText);
      return res.status(500).json({ error: 'AI provider error' });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      console.error('Unexpected Gemini response shape:', JSON.stringify(data));
      return res.status(500).json({ error: 'Empty response from AI provider' });
    }

    // Strip any accidental markdown fences before parsing
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse model output:', rawText);
      return res.status(500).json({ error: 'Could not parse AI response' });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
