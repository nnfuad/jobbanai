"use client";

import { useState } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function MatchmakerPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your AI Matchmaker. Tell me what kind of role, co-founder, or opportunity you're looking for, and I'll find the best matches from our community.",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I found 3 great matches based on your criteria! I'll connect you with them shortly. (Mock response — Gemini API integration pending).",
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col h-[calc(100vh-64px)] lg:h-screen">
      <header className="px-4 sm:px-6 py-3 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-lg shrink-0 flex items-center gap-3">
        <div className="p-1.5 bg-purple-500/10 rounded-lg">
          <Sparkles className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h1 className="text-base font-bold">AI Matchmaker</h1>
          <p className="text-[10px] text-[var(--muted)]">Powered by Gemini</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 max-w-[85%] ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-[var(--accent)]" : "bg-purple-500"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--accent)] text-white rounded-tr-sm"
                  : "bg-[var(--card)] border border-[var(--border)] rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 sm:p-6 shrink-0 border-t border-[var(--border)] pb-20 lg:pb-6">
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center max-w-3xl mx-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your ideal match..."
            className="w-full bg-[var(--card)] border border-[var(--border)] focus:border-purple-500 rounded-full py-2.5 sm:py-3 pl-4 pr-12 text-sm placeholder:text-[var(--muted)] transition-colors outline-none focus:ring-2 focus:ring-purple-500/20"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-1.5 p-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-40 text-white rounded-full transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
