"use client";

import { useState } from "react";
import { X, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";

export interface Education {
  school: string;
  degree: string;
  year: string;
}

export interface Experience {
  company: string;
  role: string;
  year: string;
}

interface EditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    education: Education[];
    experience: Experience[];
    technical_skills: string[];
  };
  onUpdateSuccess: () => void;
}

export default function EditDetailsModal({ isOpen, onClose, user, onUpdateSuccess }: EditDetailsModalProps) {
  const [education, setEducation] = useState<Education[]>(user.education || []);
  const [experience, setExperience] = useState<Experience[]>(user.experience || []);
  
  const [skills, setSkills] = useState<string[]>(user.technical_skills || []);
  const [skillInput, setSkillInput] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAddEducation = () => {
    setEducation([...education, { school: "", degree: "", year: "" }]);
  };

  const handleRemoveEducation = (index: number) => {
    const newEd = [...education];
    newEd.splice(index, 1);
    setEducation(newEd);
  };

  const handleUpdateEducation = (index: number, field: keyof Education, value: string) => {
    const newEd = [...education];
    newEd[index][field] = value;
    setEducation(newEd);
  };

  const handleAddExperience = () => {
    setExperience([...experience, { company: "", role: "", year: "" }]);
  };

  const handleRemoveExperience = (index: number) => {
    const newExp = [...experience];
    newExp.splice(index, 1);
    setExperience(newExp);
  };

  const handleUpdateExperience = (index: number, field: keyof Experience, value: string) => {
    const newExp = [...experience];
    newExp[index][field] = value;
    setExperience(newExp);
  };

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Filter out empty entries
      const validEducation = education.filter(ed => ed.school.trim() !== "");
      const validExperience = experience.filter(exp => exp.company.trim() !== "");

      const response = await fetch("/api/profile/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          education: validEducation,
          experience: validExperience,
          technical_skills: skills
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile details");
      }

      onUpdateSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] flex-shrink-0">
          <h2 className="font-bold text-lg">Edit About Details</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--card-hover)] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[var(--muted)]" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-grow">
          <form id="edit-details-form" onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Education Section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[var(--foreground)]">Education</h3>
                <button 
                  type="button" 
                  onClick={handleAddEducation}
                  className="text-xs flex items-center gap-1 text-[var(--accent)] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              
              {education.length === 0 && (
                <p className="text-xs text-[var(--muted)] italic mb-2">No education added.</p>
              )}

              <div className="space-y-3">
                {education.map((ed, index) => (
                  <div key={`ed-${index}`} className="flex gap-2 items-start p-3 border border-[var(--border)] rounded-xl bg-[var(--background)]/50">
                    <div className="flex-grow space-y-2">
                      <input 
                        placeholder="School / University" 
                        value={ed.school} 
                        onChange={(e) => handleUpdateEducation(index, "school", e.target.value)}
                        className="w-full text-sm bg-transparent border-b border-[var(--border)] focus:border-[var(--accent)] focus:outline-none py-1"
                        required
                      />
                      <div className="flex gap-2">
                        <input 
                          placeholder="Degree / Field" 
                          value={ed.degree} 
                          onChange={(e) => handleUpdateEducation(index, "degree", e.target.value)}
                          className="w-2/3 text-sm bg-transparent border-b border-[var(--border)] focus:border-[var(--accent)] focus:outline-none py-1"
                        />
                        <input 
                          placeholder="Year (e.g. 2020-2024)" 
                          value={ed.year} 
                          onChange={(e) => handleUpdateEducation(index, "year", e.target.value)}
                          className="w-1/3 text-sm bg-transparent border-b border-[var(--border)] focus:border-[var(--accent)] focus:outline-none py-1"
                        />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveEducation(index)}
                      className="p-1.5 text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Experience Section */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[var(--foreground)]">Experience</h3>
                <button 
                  type="button" 
                  onClick={handleAddExperience}
                  className="text-xs flex items-center gap-1 text-[var(--accent)] hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              
              {experience.length === 0 && (
                <p className="text-xs text-[var(--muted)] italic mb-2">No experience added.</p>
              )}

              <div className="space-y-3">
                {experience.map((exp, index) => (
                  <div key={`exp-${index}`} className="flex gap-2 items-start p-3 border border-[var(--border)] rounded-xl bg-[var(--background)]/50">
                    <div className="flex-grow space-y-2">
                      <input 
                        placeholder="Company" 
                        value={exp.company} 
                        onChange={(e) => handleUpdateExperience(index, "company", e.target.value)}
                        className="w-full text-sm bg-transparent border-b border-[var(--border)] focus:border-[var(--accent)] focus:outline-none py-1"
                        required
                      />
                      <div className="flex gap-2">
                        <input 
                          placeholder="Role" 
                          value={exp.role} 
                          onChange={(e) => handleUpdateExperience(index, "role", e.target.value)}
                          className="w-2/3 text-sm bg-transparent border-b border-[var(--border)] focus:border-[var(--accent)] focus:outline-none py-1"
                        />
                        <input 
                          placeholder="Year (e.g. 2023-Present)" 
                          value={exp.year} 
                          onChange={(e) => handleUpdateExperience(index, "year", e.target.value)}
                          className="w-1/3 text-sm bg-transparent border-b border-[var(--border)] focus:border-[var(--accent)] focus:outline-none py-1"
                        />
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveExperience(index)}
                      className="p-1.5 text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills Section */}
            <section>
              <h3 className="font-semibold text-[var(--foreground)] mb-3">Technical Skills</h3>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center gap-1 bg-[var(--accent)]/10 text-[var(--accent)] px-3 py-1.5 rounded-full text-xs font-medium border border-[var(--accent)]/20">
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:bg-[var(--accent)]/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <input 
                type="text" 
                placeholder="Type a skill and press Enter..." 
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                className="w-full text-sm bg-[var(--background)] border border-[var(--border)] rounded-lg px-3 py-2 focus:border-[var(--accent)] focus:outline-none"
              />
            </section>
          </form>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-[var(--border)] flex-shrink-0 bg-[var(--card)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-[var(--card-hover)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-details-form"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Details
          </button>
        </div>
      </div>
    </div>
  );
}
