export const MAX_ANSWER_WORDS = 100;

const SYSTEM_PROMPT = 'Answer the specific What-If question using very simple everyday words. In Hinglish avoid heavy English words (no "geopolitical", "realignment", "curricula" etc.); write the way a friend would text. Never invent factual claims, studies, statistics, characters, or numbers. For questions about a movie, anime, show, or myth, follow its established rules and canon. Return only valid JSON with exactly the key whatMightHappen, a string. whatMightHappen: MAX 100 words, written as ONE or TWO short paragraphs. No headings, no "short term / medium term / long term" sections, no lists. Start with the direct answer, explain the main reason, end with one simple example. Write in the required language and script. If the request is unsafe, politely refuse in whatMightHappen and keep the same JSON shape.';

const hinglishPattern = /\b(?:kya|agar|toh|to|hota|hoga|hai|hain|nahi|nhi|jata|jaye|jaaye|kaise|kyun|kyu|mein|me|ka|ki|ke|ko|se|par|bhi|mar|gaya|gayab|karta|kare|ho|aur|tha|thi)\b/gi;

export const detectQuestionLanguage = (question) => {
  const cleanQuestion = question.replace(/^\s*what\s+if\b\s*/i, '');
  if (/[\u0900-\u097F]/.test(cleanQuestion)) return 'Hindi in Devanagari script';
  if ((cleanQuestion.match(hinglishPattern) || []).length >= 2) return 'Hinglish (Hindi written in English/Latin letters, casual, like a friend texting)';
  return 'English';
};

const countWords = (text) => (text.trim().match(/\S+/g) || []).length;

const truncateToLastSentence = (text, maxWords) => {
  const matches = [...text.matchAll(/\S+/g)];
  if (matches.length <= maxWords) return text.trim();
  const cutoffIndex = matches[maxWords - 1].index + matches[maxWords - 1][0].length;
  const sub = text.slice(0, cutoffIndex);
  let lastPunctuation = Math.max(
    sub.lastIndexOf('.'),
    sub.lastIndexOf('!'),
    sub.lastIndexOf('?'),
    sub.lastIndexOf('।')
  );
  if (lastPunctuation >= 0) {
    while (lastPunctuation + 1 < sub.length && /["')\]}]/.test(sub[lastPunctuation + 1])) {
      lastPunctuation += 1;
    }
    return text.slice(0, lastPunctuation + 1).trim();
  }
  return sub.trim() + '.';
};

export const askWhatIf = async (prompt) => {
  const keys = ['whatMightHappen'];
  const lang = detectQuestionLanguage(prompt);
  let jsonRetried = false;
  let languageRetried = false;
  let retryLanguage = false;
  let lengthRetried = false;
  let retryLengthInstruction = '';

  while (true) {
    const messages = [
      { role: 'system', content: `${SYSTEM_PROMPT}\nReply language: ${lang}. Write EVERYTHING in this language only, never mix scripts or switch language.` }
    ];
    if (retryLanguage) messages.push({ role: 'system', content: `You used the wrong language. Reply ONLY in ${lang}.` });
    if (retryLengthInstruction) messages.push({ role: 'system', content: retryLengthInstruction });
    messages.push({ role: 'user', content: prompt });

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL,
        messages,
        temperature: 0.8,
        max_completion_tokens: 600,
        reasoning_effort: 'low'
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Groq API error ${res.status}: ${errorText}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    let reply;
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
      reply = Object.fromEntries(keys.map((key) => [key, parsed[key].trim()]));
    } catch (error) {
      if (jsonRetried) throw error;
      jsonRetried = true;
      continue;
    }

    const hasDevanagari = /[\u0900-\u097F]/.test(reply.whatMightHappen);
    const isHindi = lang === 'Hindi in Devanagari script';
    if (hasDevanagari !== isHindi && !languageRetried) {
      languageRetried = true;
      retryLanguage = true;
      continue;
    }

    const answerWords = countWords(reply.whatMightHappen);
    if (answerWords > 110 && !lengthRetried) {
      lengthRetried = true;
      retryLengthInstruction = 'Too long. Rewrite in under 100 words.';
      continue;
    }

    if (countWords(reply.whatMightHappen) > 110) {
      reply.whatMightHappen = truncateToLastSentence(reply.whatMightHappen, 110);
    }

    return reply;
  }
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
