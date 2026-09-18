// Vercel serverless function: /api/rewrite
// Takes the original resume + gap analysis, returns a rewritten resume
// that addresses the identified gaps. Uses the same free Gemini API key.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { resume, jd, analysis } = req.body || {};

  if (!resume || !analysis) {
    return res.status(400).json({ error: 'Missing resume or analysis in request body' });
  }

  const prompt = `You are an expert resume writer. Rewrite the resume below to address the specific gaps identified, while staying truthful to the candidate's actual experience — do not invent skills, tools, or accomplishments they didn't have.

Original Job Description (for context):
${jd || 'Not provided'}

Original Resume:
${resume}

Identified Gaps (from analysis):
- Missing keywords: ${(analysis.missing_keywords || []).join(', ')}
- Weak bullets and their issues: ${(analysis.weak_bullets || []).map(b => `"${b.original}" — ${b.issue}`).join(' | ')}

Instructions:
- Rewrite weak bullets using stronger, more specific language (the rewrite suggestions from the analysis are a good starting point, but improve further if possible)
- Naturally incorporate missing keywords ONLY where the candidate's actual experience genuinely supports it — do not fabricate skills or tools they never used
- Preserve the overall structure and all factual content (roles, companies, dates, education) exactly as given
- Return the full rewritten resume as plain text, formatted clearly with section headers, ready to be copied into a document
- Do NOT add commentary, notes, or explanations — return ONLY the rewritten resume text`;

  try {
    const model = 'gemini-3.6-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 3000
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', errText);
      return res.status(500).json({ error: 'AI provider error' });
    }

    const data = await response.json();
    const rewrittenResume = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rewrittenResume) {
      console.error('Unexpected Gemini response shape:', JSON.stringify(data));
      return res.status(500).json({ error: 'Empty response from AI provider' });
    }

    return res.status(200).json({ rewritten_resume: rewrittenResume.trim() });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
