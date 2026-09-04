"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Message = { role: "user" | "assistant"; content: string };

/**
 * Parses simple `[label](url)` markdown links out of message text and
 * renders them as real clickable links -- the system prompt is
 * instructed to only ever use this exact link format, so a full
 * markdown parser would be overkill here.
 */
function renderMessageContent(content: string) {
  const parts: (string | React.ReactElement)[] = [];
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = linkPattern.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    const [, label, url] = match;
    const isInternal = url.startsWith("/");

    parts.push(
      isInternal ? (
        <Link
          key={key++}
          href={url}
          className="font-semibold text-[#8C6423] underline underline-offset-2 hover:text-[#152238]"
        >
          {label}
        </Link>
      ) : (
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[#8C6423] underline underline-offset-2 hover:text-[#152238]"
        >
          {label}
        </a>
      )
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}

const GREETING: Message = {
  role: "assistant",
  content:
  "Welcome to Ventariq 👋,What can I help you find today?",
};

const HANDOFF_MESSAGE: Message = {
  role: "assistant",
  content:
    "It sounds like this might need a closer look from our support team. Want to leave your contact info below? We'll reach out personally.",
};

const REPLIES_BEFORE_HANDOFF = 3;

const QUICK_QUESTIONS: { category: string; questions: string[] }[] = [
  {
    category: "What is a Ventariq Experience Planner?",
    questions: [
      "Briefly explain what the customer gets, what problems it solves, and how it differs from doing the research themselves?",
      "How do I get my guide after I pay?",
      "I lost my download link — what now?",
    ],
  },
  {
    category: " I already purchased a planner and need help?",
    questions: [
      "Delivery issue",
      "What events do you currently cover?",
      "Lost planner",
      "Access latest version",
      "Payment/purchase question",
    ],
  },
  {
    category: "🌍 I’m exploring Ventariq",
    questions: [
      "Explain Event Travel Intelligence",
      "Route to the Intelligence Desk/free resources, current events, About Ventariq, etc.",
    ],
  },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(false);

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadDismissed, setLeadDismissed] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadStatus, setLeadStatus] = useState<"idle" | "sending" | "sent">("idle");
  const handoffTriggered = useRef(false);

  const [openCategory, setOpenCategory] = useState<string | null>(
    QUICK_QUESTIONS[0]?.category ?? null
  );
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Proactively open once per browser session, a few seconds after the
  // person arrives -- but never if they've already opened or dismissed
  // it this session, so it's a nudge, not a nag.
  useEffect(() => {
    const alreadyEngaged = sessionStorage.getItem("ventariq-chat-engaged");
    if (alreadyEngaged) return;

    const pulseTimer = setTimeout(() => setPulse(true), 2000);
    const openTimer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem("ventariq-chat-engaged", "1");
    }, 4000);

    return () => {
      clearTimeout(pulseTimer);
      clearTimeout(openTimer);
    };
  }, []);

  function handleToggle() {
    sessionStorage.setItem("ventariq-chat-engaged", "1");
    setPulse(false);
    setOpen((v) => !v);
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, showLeadForm]);

  // Offer a human handoff either after a few real answers, OR
  // immediately if the bot's own reply already mentions a live
  // agent/human/support team -- whichever comes first. Triggers once
  // per conversation either way.
  useEffect(() => {
    if (handoffTriggered.current || leadDismissed) return;

    const assistantReplies = messages.filter((m) => m.role === "assistant").slice(1); // exclude greeting
    const latestReply = assistantReplies[assistantReplies.length - 1];

    const mentionsHandoff =
      !!latestReply &&
      /\b(live agent|human agent|support team|our team|speak (to|with) (a |our )?(human|someone|agent|team member)|connect you (with|to))\b/i.test(
        latestReply.content
      );

    if (mentionsHandoff || assistantReplies.length >= REPLIES_BEFORE_HANDOFF) {
      handoffTriggered.current = true;
      // only add the canned nudge when triggered by the reply count --
      // if the bot's own message already raised it, that's enough
      if (!mentionsHandoff) {
        setMessages((m) => [...m, HANDOFF_MESSAGE]);
      }
      setShowLeadForm(true);
    }
  }, [messages, leadDismissed]);

  async function sendMessage(text: string) {
    if (!text || loading) return;

    setShowQuickQuestions(false);

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.ok ? data.message : "Sorry, something went wrong. Try again, or visit [our contact page](/contact).",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, something went wrong. Try again, or visit [our contact page](/contact)." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    sendMessage(text);
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadEmail.trim()) return;

    setLeadStatus("sending");

    try {
      const res = await fetch("/api/chat/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          phone: leadPhone,
          conversation: messages,
        }),
      });

      if (!res.ok) throw new Error("failed");

      setLeadStatus("sent");
      setShowLeadForm(false);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: `Thanks${leadName ? `, ${leadName}` : ""}! Our team will reach out to ${leadEmail} soon.`,
        },
      ]);
    } catch {
      setLeadStatus("idle");
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Sorry, that didn't go through. Try again, or email us at [hello@ventariq.com](mailto:hello@ventariq.com)." },
      ]);
    }
  }

  function dismissLeadForm() {
    setShowLeadForm(false);
    setLeadDismissed(true);
  }

  return (
    <div className="fixed bottom-3 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[520px] w-[340px] flex-col overflow-hidden rounded-[12px] border border-[#D8D2C2] bg-white shadow-[0_20px_50px_-15px_rgba(13,20,32,0.35)] sm:w-[380px]">
          <div className="flex items-center justify-between bg-[#152238] px-4 py-3.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#B8863B] font-serif text-sm font-bold text-[#0D1420]">
                V
              </span>
              <span className="font-serif text-[15px] font-bold text-white">
                Ventariq Assistant
              </span>
            </div>
            <button
              onClick={handleToggle}
              aria-label="Close chat"
              className="text-lg text-white/60 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[#FCFBF8] p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-[9px] px-3.5 py-2.5 text-[13.5px] leading-[1.5] ${
                  m.role === "user"
                    ? "ml-auto bg-[#B8863B] text-[#0D1420]"
                    : "bg-white text-[#152238] shadow-sm"
                }`}
              >
                {renderMessageContent(m.content)}
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-[9px] bg-white px-3.5 py-2.5 text-[13.5px] text-[#5A6472] shadow-sm">
                …
              </div>
            )}

            {/* Quick-question accordion -- only shown before the person
                has actually started chatting, so it doesn't clutter an
                ongoing conversation */}
            {showQuickQuestions && !loading && (
              <div className="overflow-hidden rounded-[9px] border border-[#D8D2C2] bg-white shadow-sm">
                {QUICK_QUESTIONS.map((group) => {
                  const isOpen = openCategory === group.category;
                  return (
                    <div key={group.category} className="border-b border-[#D8D2C2] last:border-b-0">
                      <button
                        onClick={() => setOpenCategory(isOpen ? null : group.category)}
                        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
                      >
                        <span className="text-[12px] font-bold uppercase tracking-widest text-[#8C6423]">
                          {group.category}
                        </span>
                        <span
                          className={`text-sm text-[#B8863B] transition-transform ${isOpen ? "rotate-45" : ""}`}
                        >
                          +
                        </span>
                      </button>
                      {isOpen && (
                        <div className="space-y-1.5 px-3.5 pb-3">
                          {group.questions.map((q) => (
                            <button
                              key={q}
                              onClick={() => sendMessage(q)}
                              className="block w-full rounded-[6px] bg-[#FCFBF8] px-3 py-2 text-left text-[12.5px] text-[#152238] transition-colors hover:bg-[#F4F1EA]"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!showQuickQuestions && !loading && messages.length > 1 && (
              <button
                onClick={() => setShowQuickQuestions(true)}
                className="flex items-center gap-1.5 self-start rounded-[20px] border border-[#D8D2C2] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#5A6472] transition-colors hover:border-[#B8863B] hover:text-[#152238]"
              >
                ← Browse quick questions
              </button>
            )}

            {showLeadForm && (
              <form
                onSubmit={handleLeadSubmit}
                className="rounded-[9px] border border-[#D8D2C2] bg-white p-3.5 shadow-sm"
              >
                <p className="mb-2.5 text-[11px] font-bold uppercase tracking-widest text-[#8C6423]">
                  Talk to Our Team
                </p>
                <div className="space-y-2">
                  <input
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Name"
                    className="w-full rounded-[5px] border border-[#D8D2C2] px-2.5 py-2 text-[13px] text-[#152238] outline-none focus:border-[#B8863B]"
                  />
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="Email *"
                    className="w-full rounded-[5px] border border-[#D8D2C2] px-2.5 py-2 text-[13px] text-[#152238] outline-none focus:border-[#B8863B]"
                  />
                  <input
                    type="tel"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className="w-full rounded-[5px] border border-[#D8D2C2] px-2.5 py-2 text-[13px] text-[#152238] outline-none focus:border-[#B8863B]"
                  />
                </div>
                <div className="mt-2.5 flex gap-2">
                  <button
                    type="submit"
                    disabled={leadStatus === "sending"}
                    className="flex-1 rounded-[5px] bg-[#B8863B] px-3 py-2 text-[12.5px] font-bold text-[#0D1420] disabled:opacity-50"
                  >
                    {leadStatus === "sending" ? "Sending…" : "Send My Info"}
                  </button>
                  <button
                    type="button"
                    onClick={dismissLeadForm}
                    className="px-3 py-2 text-[12.5px] text-[#5A6472] hover:text-[#152238]"
                  >
                    No thanks
                  </button>
                </div>
              </form>
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2 border-t border-[#D8D2C2] p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about an edition…"
              className="flex-1 rounded-[6px] border border-[#D8D2C2] px-3 py-2 text-[13.5px] text-[#152238] outline-none focus:border-[#B8863B]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-[6px] bg-[#B8863B] px-4 py-2 text-[13.5px] font-bold text-[#0D1420] disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={handleToggle}
        aria-label={open ? "Close chat" : "Open chat"}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#B8863B] text-2xl text-[#0D1420] shadow-[0_10px_25px_-8px_rgba(184,134,59,0.6)] transition-transform hover:scale-105"
      >
        {open ? "✕" : "💬"}
        {pulse && !open && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#8C1C2B] opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-[#8C1C2B]" />
          </span>
        )}
      </button>
    </div>
  );
}
