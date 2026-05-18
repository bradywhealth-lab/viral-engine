"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Bot, Calendar, FileText, Hash, Lightbulb, Search, Send, Sparkles, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const quickPrompts = [
  { icon: Lightbulb, label: "Content Ideas", prompt: "Give me 5 content ideas for today based on viral trends." },
  { icon: Hash, label: "Hashtag Research", prompt: "What hashtags should I use for sports card content right now?" },
  { icon: Calendar, label: "Plan My Week", prompt: "Build a 7-day content calendar for a sports cards TikTok account." },
  { icon: TrendingUp, label: "Trend Analysis", prompt: "What content formats are going viral on TikTok this month?" },
  { icon: FileText, label: "Write Caption", prompt: "Write an engaging caption for a card break video reveal." },
  { icon: Search, label: "Competitor Research", prompt: "How do I research top competitors in the sports cards niche?" },
];

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#e2d6c2] bg-white text-[#9a7b39] mr-2 mt-1">
          <Bot className="h-4 w-4" />
        </span>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
          isUser
            ? "bg-gradient-to-br from-[#d6a43d] to-[#f0c96a] text-white"
            : "border border-[#e2d6c2] bg-[#fffaf2] text-[#2f2418]"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

export function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content:
        "Hey! I'm your AI growth assistant. I can help you with:\n\n• Content ideas and viral strategies\n• Hashtag research\n• Content calendar planning\n• Caption writing\n• Competitor research\n• Trend analysis\n\nWhat would you like to work on?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply ?? data.error ?? "Something went wrong. Please try again.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-[#2f2418] flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-[#d6a43d]" />
          AI Assistant
        </h1>
        <p className="mt-1 text-sm text-[#8a7a67]">Your AI-powered social media growth partner.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8a7a67] mb-3">Quick Actions</p>
              <div className="space-y-2">
                {quickPrompts.map((qp) => {
                  const Icon = qp.icon;
                  return (
                    <button
                      key={qp.label}
                      onClick={() => send(qp.prompt)}
                      disabled={loading}
                      className="flex w-full items-center gap-3 rounded-2xl border border-[#e2d6c2] bg-[#fffaf2] px-3 py-2.5 text-left text-sm text-[#4c4033] transition-all hover:border-[#e2c989] hover:bg-[#f4e7c8] disabled:opacity-50"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#e2d6c2] bg-white text-[#9a7b39]">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="flex-1 font-medium">{qp.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-[#8a7a67]" />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="flex flex-col" style={{ height: "600px" }}>
            <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
              <div className="flex-1 overflow-y-auto space-y-4 p-5">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#e2d6c2] bg-white text-[#9a7b39] mr-2">
                      <Bot className="h-4 w-4" />
                    </span>
                    <div className="flex items-center gap-1 rounded-2xl border border-[#e2d6c2] bg-[#fffaf2] px-4 py-3">
                      <span className="h-2 w-2 rounded-full bg-[#d6a43d] animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-2 w-2 rounded-full bg-[#d6a43d] animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-2 w-2 rounded-full bg-[#d6a43d] animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-[#e2d6c2] p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
                    placeholder="Ask anything about your content strategy…"
                    disabled={loading}
                    className="flex-1"
                  />
                  <Button onClick={() => send(input)} disabled={!input.trim() || loading} className="shrink-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-center text-xs text-[#8a7a67]">AI can make mistakes — verify important information.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
