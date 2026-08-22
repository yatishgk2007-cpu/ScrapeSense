const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const DEFAULT_MODEL = "openai/gpt-oss-20b";

async function analyzeWithOllama(prompt, options = {}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,

      messages: [
        {
          role: "system",
          content: `
You are a product intelligence analyst.

Analyze the product information provided by the user.

Return ONLY valid JSON.
Do not use markdown.
Do not wrap the JSON in \`\`\` blocks.

Use this structure:

{
  "summary": "Short product summary",
  "sentiment": "positive",
  "strengths": [],
  "weaknesses": [],
  "recommendations": [],
  "market_insights": []
}
          `.trim(),
        },
        {
  role: "user",
  content:
    typeof prompt === "string"
      ? prompt
      : JSON.stringify(prompt),
},
      ],

      temperature: 0.2,
      max_tokens: 2000,

      response_format: {
        type: "json_object",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Groq returned an empty response");
  }

 try {
  return JSON.parse(content);
} catch {
  const cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
        return {
      summary: content,
    };
  }
}
}

module.exports = {
  analyzeWithOllama,
  generateJSON: analyzeWithOllama,
};