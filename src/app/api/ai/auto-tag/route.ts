import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { pitchDescription } = await req.json();

    if (!pitchDescription) {
      return NextResponse.json({ error: 'Pitch description is required' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate exactly 3 relevant category tags for this startup pitch description. Description: ${pitchDescription}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'ARRAY',
          items: {
            type: 'STRING'
          },
          description: 'An array of exactly 3 category tags'
        }
      }
    });

    const tags = JSON.parse(response.text || '[]');
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error generating tags:', error);
    return NextResponse.json({ error: 'Failed to generate tags' }, { status: 500 });
  }
}
