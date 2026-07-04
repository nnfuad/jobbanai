"use client";

import { useState } from "react";
import { GraduationCap, Briefcase, Code, Pencil } from "lucide-react";
import EditDetailsModal, { Education, Experience } from "./EditDetailsModal";
import { useRouter } from "next/navigation";

interface ProfileDetailsProps {
  user: {
    education: Education[];
    experience: Experience[];
    technical_skills: string[];
  };
  isOwner: boolean;
}

export default function ProfileDetails({ user, isOwner }: ProfileDetailsProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();

  const handleUpdateSuccess = () => {
    router.refresh();
  };

  const hasNoDetails = 
    (!user.education || user.education.length === 0) && 
    (!user.experience || user.experience.length === 0) &&
    (!user.technical_skills || user.technical_skills.length === 0);

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--foreground)]">About</h2>
        {isOwner && (
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 border border-[var(--border)] rounded-lg hover:bg-[var(--card-hover)] transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit Details</span>
          </button>
        )}
      </div>

      {hasNoDetails ? (
        <div className="text-center py-8 text-[var(--muted)]">
          <p className="text-sm">No profile details added yet.</p>
          {isOwner && (
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="mt-3 text-[var(--accent)] hover:underline text-sm"
            >
              Add education, experience, or skills
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Experience Section */}
          {user.experience && user.experience.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 text-[var(--muted)]">
                <Briefcase className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-semibold text-[var(--foreground)]">Experience</h3>
              </div>
              <div className="space-y-4 pl-7 border-l-2 border-[var(--border)] ml-2.5">
                {user.experience.map((exp, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute w-3 h-3 bg-[var(--card)] border-2 border-[var(--accent)] rounded-full -left-[35px] top-1.5" />
                    <h4 className="font-bold text-[var(--foreground)]">{exp.role}</h4>
                    <p className="text-sm font-medium text-[var(--muted)]">{exp.company}</p>
                    {exp.year && <p className="text-xs text-[var(--muted)]/80 mt-1">{exp.year}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Education Section */}
          {user.education && user.education.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 text-[var(--muted)]">
                <GraduationCap className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-semibold text-[var(--foreground)]">Education</h3>
              </div>
              <div className="space-y-4 pl-7 border-l-2 border-[var(--border)] ml-2.5">
                {user.education.map((ed, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute w-3 h-3 bg-[var(--card)] border-2 border-[var(--accent)] rounded-full -left-[35px] top-1.5" />
                    <h4 className="font-bold text-[var(--foreground)]">{ed.school}</h4>
                    <p className="text-sm font-medium text-[var(--muted)]">{ed.degree}</p>
                    {ed.year && <p className="text-xs text-[var(--muted)]/80 mt-1">{ed.year}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills Section */}
          {user.technical_skills && user.technical_skills.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4 text-[var(--muted)]">
                <Code className="w-5 h-5 text-[var(--accent)]" />
                <h3 className="font-semibold text-[var(--foreground)]">Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.technical_skills.map((skill, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1.5 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 rounded-lg text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {isOwner && (
        <EditDetailsModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          user={user}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}
