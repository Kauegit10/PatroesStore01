
import { GoogleGenAI } from "@google/genai";

// Fix: Use correct GoogleGenAI initialization and text property access according to latest guidelines
export async function getGameAssistance(query: string): Promise<string> {
  // Always initialize with an object containing the apiKey from process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction: "Você é um assistente especializado em Car Parking Multiplayer (CPM). Ajude os jogadores com dicas sobre como ganhar dinheiro, melhores carros, tunagem e como usar o painel do Kaue. Seja breve, direto e use uma linguagem informal de gamer.",
        temperature: 0.7,
      },
    });
    // Extract text output using the .text property directly as per @google/genai standards
    return response.text || "Desculpe, não consegui processar sua dúvida agora.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao conectar com o servidor de IA.";
  }
}
