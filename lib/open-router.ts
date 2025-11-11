import OpenAI from 'openai';

const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function getMarketAnalysis(marketQuestion: string): Promise<string> {
  if (!marketQuestion) {
    return 'No market question provided.';
  }

  try {
    const completion = await openrouter.chat.completions.create({
      model: 'z-ai/glm-4.5-air:free',
      messages: [
        {
          role: 'system',
          content: `You are a market analyst. Provide a brief analysis of the following market question. The analysis should include a prediction, a short explanation of why the prediction is likely, and a short explanation of why it might not be. The question is: ${marketQuestion}`,
        },
      ],
    });

    return completion.choices[0].message.content ?? 'No analysis available.';
  } catch (error) {
    console.error('OpenRouter API error:', error);
    return 'Error fetching analysis.';
  }
}