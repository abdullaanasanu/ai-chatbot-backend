import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY as string;

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'deepseek/deepseek-chat:free',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('🤖 AI Data:', response.data)

    return response.data.choices[0].message.content.trim();
  } catch (error: any) {
    console.error('OpenRouter API Error:', error?.response?.data || error.message);
    return "Sorry, I couldn't process that.";
  }
}
