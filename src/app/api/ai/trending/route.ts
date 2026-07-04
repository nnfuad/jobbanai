import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({});

const MOCK_PITCHES = [
  "An AI-powered matchmaking app for stray dogs and adopters.",
  "A decentralized platform for trading carbon credits among households.",
  "A smart mirror that suggests outfits based on the weather and your calendar.",
  "A subscription service for locally sourced, ugly produce.",
  "An automated bookkeeping tool for freelancers using AI receipt scanning.",
  "A VR platform for practicing public speaking in front of simulated crowds.",
  "A marketplace connecting amateur chefs with people looking for home-cooked meals.",
  "A wearable device that tracks hydration levels and alerts you to drink water.",
  "An educational app that teaches coding through interactive storytelling.",
  "A zero-waste packaging solution for e-commerce brands.",
  "A peer-to-peer lending platform specifically for student loans.",
  "A hyper-local delivery service using autonomous drones.",
  "A mental health app that uses voice analysis to detect early signs of depression.",
  "A smart indoor garden system that grows herbs and small vegetables automatically.",
  "An AI assistant that negotiates bills and subscriptions on your behalf."
];

export async function GET() {
  try {
    // TODO: Fetch 15 pitches from Supabase here
    const pitches = MOCK_PITCHES;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Based on the following 15 startup pitches, generate a concise 2-sentence summary of the trending ideas or common themes.\n\nPitches:\n${pitches.map(p => '- ' + p).join('\n')}`
    });

    return NextResponse.json({ summary: response.text });
  } catch (error) {
    console.error('Error generating trending summary:', error);
    return NextResponse.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}
