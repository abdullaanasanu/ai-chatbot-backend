import { textGeneration } from "@huggingface/inference";
import axios from "axios";

export const huggingface = async (message: string) => {
  const response = await textGeneration({
    accessToken: process.env.HUGGINGFACE_ACCESS_TOKEN,
    model: "gpt2",
    inputs: message,
    parameters: {
      max_new_tokens: 250,
    },
  });
  console.log("🤖 AI response:", response);
  return response;
};

export const getBotReply = async (prompt) => {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_ACCESS_TOKEN}`,
        },
      }
    );

    return response.data.generated_text || '...';
  } catch (error) {
    console.error('HuggingFace error:', error?.response?.data || error.message);
    return "Sorry, I couldn't process that.";
  }
}