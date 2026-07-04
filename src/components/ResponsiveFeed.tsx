import PitchCard, { Pitch } from "./PitchCard";

interface ResponsiveFeedProps {
  pitches: Pitch[];
  isAuthenticated: boolean;
  currentUserId?: string;
}

export default function ResponsiveFeed({ pitches, isAuthenticated, currentUserId }: ResponsiveFeedProps) {
  return (
    <div className="w-full px-4 sm:px-6 py-6">
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {pitches.map((pitch) => (
          <PitchCard 
            key={pitch.id} 
            pitch={pitch} 
            isAuthenticated={isAuthenticated}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}
