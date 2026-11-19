const SYSTEM_PROMPT = 'Reply in the same language and script as the user’s question. English questions get English replies. Hindi written in Latin letters (Hinglish) gets natural Hinglish in Latin letters. Hindi in Devanagari gets Hindi in Devanagari. Never translate the question into another language. Return only a valid JSON object with exactly two string keys: whatMightHappen (2-3 sentences) and funFact (1 sentence). Do not include markdown, text outside the JSON, invented statistics, or invented studies. If the request is unsafe, politely refuse in the same language and script, using whatMightHappen for the refusal and a harmless funFact.';

export const askWhatIf = async (prompt) => {
  const keys = ['whatMightHappen', 'funFact'];
  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_completion_tokens: 800,
        reasoning_effort: 'low'
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Groq API error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    try {
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}');
      if (start < 0 || end < start) throw new Error('Reply did not contain JSON.');
      const parsed = JSON.parse(content.slice(start, end + 1));
      if (
        !parsed ||
        Array.isArray(parsed) ||
        Object.keys(parsed).length !== keys.length ||
        keys.some((key) => typeof parsed[key] !== 'string' || !parsed[key].trim())
      ) throw new Error('Reply did not match the required answer shape.');
      return Object.fromEntries(keys.map((key) => [key, parsed[key].trim()]));
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export const generateDaily = async (questionText) => {
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL,
          messages: [
            {
              role: 'system',
              content: 'Return only valid JSON with exactly this shape: {"options":["...","...","...","..."],"explanation":"..."}. Give exactly 4 short plausible outcomes, each no more than 8 words; one option may be "Nothing noticeable". Write the explanation as exactly 3 short sentences in plain English, with no filler and none of these words: however, overall, ultimately, it depends. Sentence 1: state the single most likely outcome and name which option it matches best by quoting that option text. Sentence 2: give one concrete, specific example or number-backed detail; a real-world analogy is fine. Sentence 3: describe one surprising side effect most people would not think of. Be direct and confident without claiming certainty about the hypothetical. No markdown or extra keys.'
            },
            { role: 'user', content: questionText }
          ],
          temperature: 0.3,
          max_completion_tokens: 1500,
          reasoning_effort: 'low'
        })
      });
      if (!res.ok) {
        const error = new Error(`Groq API error ${res.status}`);
        error.groqResponseBody = await res.text();
        throw error;
      }
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      const start = content.indexOf('{');
      const end = content.lastIndexOf('}');
      if (start < 0 || end < start) throw new Error('Daily prediction did not contain JSON.');
      let result;
      try {
        result = JSON.parse(content.slice(start, end + 1));
      } catch {
        throw new Error('Daily prediction contained invalid JSON.');
      }
      const options = result.options;
      if (
        !Array.isArray(options) ||
        options.length !== 4 ||
        options.some((option) => typeof option !== 'string' || !option.trim()) ||
        typeof result.explanation !== 'string' ||
        !result.explanation.trim()
      ) throw new Error('Daily prediction must include four non-empty options and an explanation.');
      return {
        options: options.map((text) => ({ text: text.trim() })),
        explanation: result.explanation.trim()
      };
    } catch (error) {
      lastError = error;
    }
  }
  console.error(lastError.message, lastError.stack, lastError.groqResponseBody);
  return {
    options: ['Big positive change', 'Big negative change', 'Mixed results', 'Nothing noticeable'],
    explanation: '',
    fallback: true
  };
};
