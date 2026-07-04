"use client";

import { useState } from "react";
import { ArrowBigUp, ArrowBigDown, Send, Loader2 } from "lucide-react";
import { Comment } from "./PitchCard";

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  allComments: Comment[];
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onReplySubmit: (content: string, parentId: string) => Promise<void>;
  depth: number;
}

export default function CommentItem({ 
  comment, 
  replies, 
  allComments, 
  onUpvote, 
  onDownvote, 
  onReplySubmit, 
  depth 
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyInput, setReplyInput] = useState(`@${comment.author.username} `);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || submitting) return;
    setSubmitting(true);
    await onReplySubmit(replyInput, comment.id);
    setSubmitting(false);
    setIsReplying(false);
    setReplyInput(`@${comment.author.username} `);
  };

  return (
    <div className={`flex flex-col gap-3 ${depth > 0 ? "ml-4 mt-1 border-l-2 border-[var(--border)]/50 pl-3" : "mt-2"}`}>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--border)] shrink-0 mt-0.5">
          {comment.author.avatar ? (
            <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-semibold text-xs text-[var(--muted)]">
              {comment.author.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="bg-[var(--border)]/30 rounded-2xl rounded-tl-none p-3 text-[14px]">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold">{comment.author.name}</span>
              <span className="text-[11px] text-[var(--muted)]">{comment.timeAgo}</span>
            </div>
            <p className="text-[var(--foreground)] whitespace-pre-wrap">{comment.content}</p>
          </div>
          
          <div className="flex items-center gap-2 mt-1 ml-2">
            <button 
              onClick={() => onUpvote(comment.id)}
              className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${comment.userVoteStatus === "up" ? "text-[#FF4500]" : "text-[var(--muted)] hover:text-[#FF4500]"}`}
            >
              <ArrowBigUp className="w-3.5 h-3.5" fill={comment.userVoteStatus === "up" ? "currentColor" : "none"} />
            </button>
            <span className={`text-[11px] font-bold ${comment.userVoteStatus === "up" ? "text-[#FF4500]" : comment.userVoteStatus === "down" ? "text-[#7193FF]" : "text-[var(--muted)]"}`}>
              {comment.likes}
            </span>
            <button 
              onClick={() => onDownvote(comment.id)}
              className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${comment.userVoteStatus === "down" ? "text-[#7193FF]" : "text-[var(--muted)] hover:text-[#7193FF]"}`}
            >
              <ArrowBigDown className="w-3.5 h-3.5" fill={comment.userVoteStatus === "down" ? "currentColor" : "none"} />
            </button>
            
            <button 
              onClick={() => {
                setIsReplying(!isReplying);
                if (!isReplying) setReplyInput(`@${comment.author.username} `);
              }}
              className="text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--foreground)] ml-2 transition-colors"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
      
      {isReplying && (
        <form onSubmit={handleSubmit} className="flex gap-2 items-end pt-1 ml-11 mb-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder="Write a reply..."
              disabled={submitting}
              autoFocus
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!replyInput.trim() || submitting}
            className="w-9 h-9 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shrink-0 hover:bg-[var(--accent)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
          </button>
        </form>
      )}

      {replies.length > 0 && (
        <div className="flex flex-col">
          {replies.map(reply => (
            <CommentItem 
              key={reply.id} 
              comment={reply} 
              replies={allComments.filter(c => c.parent_id === reply.id)} 
              allComments={allComments}
              onUpvote={onUpvote}
              onDownvote={onDownvote}
              onReplySubmit={onReplySubmit}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
