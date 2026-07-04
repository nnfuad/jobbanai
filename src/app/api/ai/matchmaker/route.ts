import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({});

// Mock data for users table
const MOCK_USERS = [
  { id: 1, name: "Alice Smith", role: "Backend Developer", skills: ["Node.js", "Express", "PostgreSQL"], location: "New York" },
  { id: 2, name: "Bob Johnson", role: "Frontend Developer", skills: ["React", "Next.js", "Tailwind CSS"], location: "Remote" },
  { id: 3, name: "Charlie Davis", role: "Fullstack Developer", skills: ["Node.js", "React", "MongoDB"], location: "San Francisco" },
  { id: 4, name: "Diana Prince", role: "Data Scientist", skills: ["Python", "TensorFlow", "SQL"], location: "London" },
];

export async function POST(req: Request) {
  try {
    const { chatInput } = await req.json();

    if (!chatInput) {
      return NextResponse.json({ error: 'Chat input is required' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract the requested skills and location from this job search query: "${chatInput}".`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            skills: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: "List of skills requested in the query."
            },
            location: {
              type: 'STRING',
              description: "The requested location, if any. Return empty string if no location is specified."
            }
          }
        }
      }
    });

    const extraction = JSON.parse(response.text || '{}');
    const requiredSkills: string[] = extraction.skills || [];
    const requestedLocation: string = extraction.location || '';

    // Mock query logic: In reality this would be a Supabase RPC or vector search
    const matchedProfiles = MOCK_USERS.filter(user => {
      const hasSkills = requiredSkills.length === 0 || requiredSkills.some(skill => 
        user.skills.some(userSkill => userSkill.toLowerCase().includes(skill.toLowerCase()))
      );
      
      const matchesLocation = !requestedLocation || 
        user.location.toLowerCase().includes(requestedLocation.toLowerCase()) || 
        user.location.toLowerCase() === 'remote';
        
      return hasSkills && matchesLocation;
    });

    return NextResponse.json({ 
      extracted: { skills: requiredSkills, location: requestedLocation },
      matches: matchedProfiles 
    });
  } catch (error) {
    console.error('Error in matchmaker:', error);
    return NextResponse.json({ error: 'Failed to find matches' }, { status: 500 });
  }
}
