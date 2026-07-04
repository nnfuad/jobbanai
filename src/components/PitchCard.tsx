"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowBigUp, ArrowBigDown, MessageCircle, Share2, MoreHorizontal, Send, Loader2, Edit2, Trash2, X } from "lucide-react";
import AuthPromptModal from "./AuthPromptModal";
import ShareMenu from "./ShareMenu";
import CommentItem from "./CommentItem";

export interface Pitch {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  image_url?: string | null;
  tags: string[];
  likes: number;
  comments: number;
  timeAgo: string;
  userVoteStatus?: "up" | "down" | null;
}

export interface Comment {
  id: string;
  parent_id?: string | null;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  likes: number;
  userVoteStatus: "up" | "down" | null;
  timeAgo: string;
}

interface PitchCardProps {
  pitch: Pitch;
  isAuthenticated: boolean;
  currentUserId?: string;
}

export default function PitchCard({ pitch, isAuthenticated, currentUserId }: PitchCardProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authAction, setAuthAction] = useState("");
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [voteStatus, setVoteStatus] = useState<"up" | "down" | null>(pitch.userVoteStatus || null);
  const [score, setScore] = useState(pitch.likes);
  const [pitchContent, setPitchContent] = useState(pitch.content);
  
  // Post management state
  const [isDeleted, setIsDeleted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(pitch.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  
  // Commenting state
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(pitch.comments);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showComments && commentsList.length === 0) {
      fetchComments();
    }
  }, [showComments]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    if (moreMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreMenuOpen]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/comments?pitch_id=${pitch.id}`);
      const data = await res.json();
      if (res.ok) {
        setCommentsList(data.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const requireAuth = (action: string, callback: () => void) => {
    if (!isAuthenticated) {
      setAuthAction(action);
      setAuthModalOpen(true);
      return;
    }
    callback();
  };

  const submitVote = async (vote_type: number) => {
    try {
      await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch_id: pitch.id, vote_type })
      });
    } catch (e) {
      console.error("Failed to submit vote", e);
    }
  };

  const handleUpvote = () => {
    requireAuth("upvote", () => {
      if (voteStatus === "up") {
        setVoteStatus(null);
        setScore(prev => prev - 1);
        submitVote(0);
      } else if (voteStatus === "down") {
        setVoteStatus("up");
        setScore(prev => prev + 2);
        submitVote(1);
      } else {
        setVoteStatus("up");
        setScore(prev => prev + 1);
        submitVote(1);
      }
    });
  };

  const handleDownvote = () => {
    requireAuth("downvote", () => {
      if (voteStatus === "down") {
        setVoteStatus(null);
        setScore(prev => prev + 1);
        submitVote(0);
      } else if (voteStatus === "up") {
        setVoteStatus("down");
        setScore(prev => prev - 2);
        submitVote(-1);
      } else {
        setVoteStatus("down");
        setScore(prev => prev - 1);
        submitVote(-1);
      }
    });
  };

  const submitCommentVote = async (commentId: string, vote_type: number) => {
    try {
      await fetch('/api/comments/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: commentId, vote_type })
      });
    } catch (e) {
      console.error("Failed to submit comment vote", e);
    }
  };

  const handleCommentUpvote = (commentId: string) => {
    requireAuth("upvote comment", () => {
      setCommentsList(prev => prev.map(c => {
        if (c.id !== commentId) return c;
        let newStatus = c.userVoteStatus;
        let newLikes = c.likes;
        
        if (c.userVoteStatus === "up") {
          newStatus = null;
          newLikes -= 1;
          submitCommentVote(c.id, 0);
        } else if (c.userVoteStatus === "down") {
          newStatus = "up";
          newLikes += 2;
          submitCommentVote(c.id, 1);
        } else {
          newStatus = "up";
          newLikes += 1;
          submitCommentVote(c.id, 1);
        }
        
        return { ...c, userVoteStatus: newStatus, likes: newLikes };
      }));
    });
  };

  const handleCommentDownvote = (commentId: string) => {
    requireAuth("downvote comment", () => {
      setCommentsList(prev => prev.map(c => {
        if (c.id !== commentId) return c;
        let newStatus = c.userVoteStatus;
        let newLikes = c.likes;
        
        if (c.userVoteStatus === "down") {
          newStatus = null;
          newLikes += 1;
          submitCommentVote(c.id, 0);
        } else if (c.userVoteStatus === "up") {
          newStatus = "down";
          newLikes -= 2;
          submitCommentVote(c.id, -1);
        } else {
          newStatus = "down";
          newLikes -= 1;
          submitCommentVote(c.id, -1);
        }
        
        return { ...c, userVoteStatus: newStatus, likes: newLikes };
      }));
    });
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleShare = () => {
    setShareMenuOpen(!shareMenuOpen);
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || submittingComment) return;
    
    requireAuth("comment", async () => {
      setSubmittingComment(true);
      try {
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pitch_id: pitch.id, content: commentInput })
        });
        const data = await res.json();
        
        if (res.ok) {
          setCommentsList([...commentsList, data.comment]);
          setCommentsCount(prev => prev + 1);
          setCommentInput("");
        }
      } catch (e) {
        console.error("Failed to post comment", e);
      } finally {
        setSubmittingComment(false);
      }
    });
  };

  const handleReplySubmit = async (content: string, parentId: string) => {
    return new Promise<void>((resolve) => {
      requireAuth("reply", async () => {
        try {
          const res = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pitch_id: pitch.id, content, parent_id: parentId })
          });
          const data = await res.json();
          
          if (res.ok) {
            setCommentsList(prev => [...prev, data.comment]);
            setCommentsCount(prev => prev + 1);
          }
        } catch (e) {
          console.error("Failed to post reply", e);
        } finally {
          resolve();
        }
      });
    });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this pitch?")) return;
    try {
      const res = await fetch(`/api/pitches/${pitch.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleted(true);
      } else {
        alert("Failed to delete pitch.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred.");
    }
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim()) return;
    setIsSubmittingEdit(true);
    try {
      const res = await fetch(`/api/pitches/${pitch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      if (res.ok) {
        setPitchContent(editContent);
        setIsEditing(false);
      } else {
        alert("Failed to update pitch.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  if (isDeleted) return null;

  const isAuthor = currentUserId === pitch.author.id;

  return (
    <>
      <article className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 transition-all hover:border-[var(--muted)]/30 break-inside-avoid mb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[var(--border)]">
              {pitch.author.avatar ? (
                <img
                  src={pitch.author.avatar}
                  alt={pitch.author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-semibold text-sm text-[var(--muted)]">
                  {pitch.author.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-[15px] leading-tight">
                {pitch.author.name}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                @{pitch.author.username} · {pitch.timeAgo}
              </p>
            </div>
          </div>
          
          <div className="relative" ref={moreMenuRef}>
            <button 
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors rounded-md hover:bg-[var(--card-hover)]"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {moreMenuOpen && isAuthor && (
              <div className="absolute top-full right-0 mt-1 w-36 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden z-10 animate-fade-in">
                <div className="p-1">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-[var(--card-hover)] transition-colors text-sm text-left"
                  >
                    <Edit2 className="w-4 h-4 text-[var(--muted)]" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-500/10 hover:text-red-500 transition-colors text-sm text-left text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="text-[15px] leading-relaxed mb-3 whitespace-pre-wrap">
          {pitchContent}
        </p>

        {pitch.image_url && (
          <div className="mb-4 rounded-xl overflow-hidden border border-[var(--border)]">
            <img 
              src={pitch.image_url} 
              alt="Pitch attachment" 
              className="w-full object-cover max-h-[400px]"
            />
          </div>
        )}

        {/* Tags */}
        {pitch.tags && pitch.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {pitch.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 bg-[var(--accent)]/8 text-[var(--accent)] text-xs font-medium rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 text-[var(--muted)] pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-0.5 bg-[var(--border)]/30 rounded-full px-1 py-0.5">
            <button
              onClick={handleUpvote}
              className={`p-1.5 rounded-full transition-colors ${
                voteStatus === "up"
                  ? "text-[#FF4500] bg-[#FF4500]/10"
                  : "hover:text-[#FF4500] hover:bg-[var(--card-hover)]"
              }`}
            >
              <ArrowBigUp
                className={`w-4 h-4 transition-transform ${voteStatus === "up" ? "scale-110" : ""}`}
                fill={voteStatus === "up" ? "currentColor" : "none"}
              />
            </button>
            <span className={`text-xs font-bold min-w-[1.5rem] text-center ${
              voteStatus === "up" ? "text-[#FF4500]" : 
              voteStatus === "down" ? "text-[#7193FF]" : ""
            }`}>
              {score > 999 ? (score / 1000).toFixed(1) + "k" : score}
            </span>
            <button
              onClick={handleDownvote}
              className={`p-1.5 rounded-full transition-colors ${
                voteStatus === "down"
                  ? "text-[#7193FF] bg-[#7193FF]/10"
                  : "hover:text-[#7193FF] hover:bg-[var(--card-hover)]"
              }`}
            >
              <ArrowBigDown
                className={`w-4 h-4 transition-transform ${voteStatus === "down" ? "scale-110" : ""}`}
                fill={voteStatus === "down" ? "currentColor" : "none"}
              />
            </button>
          </div>
          <button
            onClick={handleComment}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium ${
              showComments ? "text-[var(--accent)] bg-[var(--accent)]/8" : "hover:text-[var(--accent)] hover:bg-[var(--accent)]/8"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            {commentsCount}
          </button>
          <div className="relative ml-auto">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-2.5 py-1.5 hover:text-emerald-500 hover:bg-emerald-500/8 rounded-md transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <ShareMenu
              isOpen={shareMenuOpen}
              onClose={() => setShareMenuOpen(false)}
              pitchId={pitch.id}
              pitchContent={pitchContent}
              authorName={pitch.author.name}
            />
          </div>
        </div>

        {/* Comment Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-4">
            {loadingComments ? (
              <div className="flex justify-center py-4 text-[var(--muted)]">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : commentsList.length === 0 ? (
              <div className="text-center py-2 text-sm text-[var(--muted)]">
                No comments yet. Be the first to share your thoughts!
              </div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {commentsList.filter(c => !c.parent_id).map((comment) => (
                  <CommentItem 
                    key={comment.id}
                    comment={comment}
                    replies={commentsList.filter(c => c.parent_id === comment.id)}
                    allComments={commentsList}
                    onUpvote={handleCommentUpvote}
                    onDownvote={handleCommentDownvote}
                    onReplySubmit={handleReplySubmit}
                    depth={0}
                  />
                ))}
              </div>
            )}

            <form onSubmit={submitComment} className="flex gap-2 items-end pt-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Write a comment..."
                  disabled={submittingComment}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={!commentInput.trim() || submittingComment}
                className="w-9 h-9 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shrink-0 hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
              </button>
            </form>
          </div>
        )}
      </article>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 w-full max-w-lg shadow-2xl animate-fade-in relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Edit Pitch</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-md text-[var(--muted)] hover:bg-[var(--border)]/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[150px] bg-[var(--background)] border border-[var(--border)] rounded-lg p-3 text-[15px] resize-none focus:outline-none focus:border-[var(--accent)] transition-colors mb-4"
              placeholder="Update your pitch..."
              disabled={isSubmittingEdit}
            />
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSubmittingEdit}
                className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--border)]/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={!editContent.trim() || isSubmittingEdit || editContent === pitchContent}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmittingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        action={authAction}
      />
    </>
  );
}
