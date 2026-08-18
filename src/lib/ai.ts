import { GoogleGenAI } from '@google/genai';

export async function askAiAdvisor(question: string, productName?: string, productSpecs?: any) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return `[KLLYEEIN Neural AI Assistant]: Regarding "${productName || 'our luxury gadgets'}", this device features Grade 5 titanium, zero-latency acoustics, and active liquid cooling. What specific specs, battery metrics, or compatibility details would you like to know?`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `You are KLLYEEIN AI, the elite cybernetic tech advisor for the luxury gadget store KLLYEEIN.
Brand Tone: Sophisticated, futuristic, precise, expert, ultra-tech luxury (Apple meets Cyberpunk).
Product Context: ${productName ? `Product: ${productName}. Specs: ${JSON.stringify(productSpecs || {})}` : 'KLLYEEIN Flagship Lineup'}.
Customer Question: ${question}

Provide a concise, highly insightful, bulleted or 2-paragraph response explaining technical advantages, compatibility, or recommendation for the buyer. Keep it under 150 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || 'KLLYEEIN AI Advisor analysis complete.';
  } catch (err: any) {
    console.error('Gemini API error:', err);
    return `KLLYEEIN Neural AI Advisor: ${productName || 'This gadget'} delivers industry-leading performance with aerospace construction, OLED display clarity, and high-speed multi-device connectivity.`;
  }
}
