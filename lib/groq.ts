import Groq from 'groq-sdk';

let _client: Groq | null = null;

function getClient(): Groq {
  if (!_client) {
    _client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return _client;
}

export async function generateContent(
  prompt: string,
  maxTokens = 1200
): Promise<string> {
  const response = await getClient().chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: maxTokens,
    temperature: 0.75,
  });

  return response.choices[0]?.message?.content?.trim() ?? '';
}
