
import { GoogleGenAI, Type } from "@google/genai";
import { Booking } from "../types";

export const analyzeLead = async (booking: Booking): Promise<{ summary: string; quality: 'Kall' | 'Varm' | 'Het' }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `Analysera följande potentiella kundbokning och ge en kort sammanfattning (max 2 meningar) samt bedöm led-kvaliteten (Kall, Varm eller Het).
  
  Kund: ${booking.customerName}
  Anteckningar: ${booking.notes}
  Handläggare: ${booking.representative}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: 'En kort sammanfattning av prospektet.' },
            quality: { type: Type.STRING, enum: ['Kall', 'Varm', 'Het'], description: 'Bedömd kvalitet.' }
          },
          required: ['summary', 'quality']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      summary: result.summary || 'Ingen analys tillgänglig.',
      quality: result.quality || 'Kall'
    };
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return { summary: 'Kunde inte analysera just nu.', quality: 'Kall' };
  }
};
