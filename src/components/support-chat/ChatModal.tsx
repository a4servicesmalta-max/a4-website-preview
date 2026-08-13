"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import TypingIndicator from "./TypingIndicator";
import {
  POLL_BASE_MS,
  buildProvenance,
  clearStoredSession,
  extractIdentity,
  fetchChatMessages,
  isSessionGone,
  mergeServerMessages,
  nextPollDelayMs,
  nextSinceCursor,
  openChatSession,
  patchChatIdentity,
  postChatMessage,
  readStoredSession,
  writeStoredSession,
  type ChatServerMessage,
} from "@/lib/chatSession";
import { getCaptchaToken } from "@/lib/turnstileClient";

/**
 * `bot` is scripted local copy (the opening three questions and status lines);
 * `user` and `staff` are real messages that exist on the backend.
 */
export type Message = {
  role: "user" | "bot" | "staff";
  content: string;
  /** Server message id once acknowledged — also the dedupe key against polling. */
  id?: string;
  authorName?: string;
  pending?: boolean;
  failed?: boolean;
};

const TYPING_DELAY_MS = 800;

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
}

export default function ChatModal({ open, onClose, onRestart }: ChatModalProps) {
  const { t } = useTranslation("common");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [step, setStep] = useState<"welcome" | "name" | "email" | "live" | "done">("welcome");
  const [name, setName] = useState("");
  const [issue, setIssue] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [staffJoined, setStaffJoined] = useState(false);
  /**
   * Live-first identity capture: the thread opens BEFORE we know who the
   * visitor is; name/email are asked conversationally inside the live thread
   * and are always optional — 'done' means "stop asking", never "answered".
   */
  const [identityStage, setIdentityStage] = useState<"unasked" | "asked" | "askedEmail" | "done">(
    "unasked"
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * Ids the visitor has already been shown, whether they arrived by polling or
   * were echoed back to us after we posted them. The poll merges against this
   * so a message is never rendered twice.
   */
  const seenIdsRef = useRef<Set<string>>(new Set());
  /** `since` cursor for the next poll. */
  const sinceRef = useRef<string>("");
  /** The opening flow must run once, not on every re-open — reopening resumes. */
  const initialisedRef = useRef(false);
  const tempIdRef = useRef(0);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  const say = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: "bot", content }]);
  }, []);

  /** Render newly-arrived server messages, skipping anything already on screen. */
  const applyServerMessages = useCallback((incoming: ChatServerMessage[], render: boolean) => {
    const seen = seenIdsRef.current;
    const fresh = mergeServerMessages([], incoming).filter((m) => !seen.has(m.id));
    fresh.forEach((m) => seen.add(m.id));
    if (!render || !fresh.length) return;
    if (fresh.some((m) => m.role === "staff")) setStaffJoined(true);
    setMessages((prev) => [
      ...prev,
      ...fresh.map<Message>((m) => ({
        role: m.role === "staff" ? "staff" : "user",
        content: m.content,
        id: m.id,
        authorName: m.role === "staff" ? m.authorName : undefined,
      })),
    ]);
  }, []);

  /* ---------------------------------------------------------------- *
   * Open: resume an existing thread, or start the opening flow.
   * There is deliberately NO state wipe here — closing the modal used to
   * throw the whole conversation away.
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (!open || initialisedRef.current) return;
    initialisedRef.current = true;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    /** No stored thread: the scripted opening flow, exactly as before. */
    const startFresh = () => {
      setBotTyping(true);
      timer = setTimeout(() => {
        if (cancelled) return;
        setMessages([{ role: "bot", content: t("supportChat.botWelcome") }]);
        setBotTyping(false);
      }, TYPING_DELAY_MS);
    };

    /** Stored thread: replay its history and go straight back to live. */
    const resume = async (storedToken: string) => {
      setToken(storedToken);
      setStep("live");
      // A resumed thread was already offered the identity question in its
      // first life — never re-interrogate a returning visitor.
      setIdentityStage("done");
      setBotTyping(true);
      const res = await fetchChatMessages(storedToken);
      if (cancelled) return;
      setBotTyping(false);
      if (!res.ok) {
        if (isSessionGone(res.status)) {
          // The thread is genuinely gone — start over rather than polling a
          // token the backend has forgotten.
          clearStoredSession();
          setToken(null);
          setStep("welcome");
          say(t("supportChat.botWelcome"));
          return;
        }
        // Transient (offline / 429): keep the session, let polling recover.
        say(t("supportChat.botResumed"));
        return;
      }
      say(t("supportChat.botResumed"));
      applyServerMessages(res.data.messages, true);
      sinceRef.current = nextSinceCursor(res.data.messages, res.data.serverTime, sinceRef.current);
    };

    const stored = readStoredSession();
    if (stored) void resume(stored.token);
    else startFresh();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [open, t, say, applyServerMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, botTyping]);

  /* ---------------------------------------------------------------- *
   * Poll for staff replies while the modal is open and the thread is live.
   * Pauses on a hidden tab (no network at all), backs off on errors and 429,
   * and stops for good only when the session itself is gone.
   * ---------------------------------------------------------------- */
  useEffect(() => {
    if (!open || step !== "live" || !token) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let failures = 0;

    const tick = async () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.hidden) {
        // Nobody is looking — do not spend a request, just re-check later.
        timer = setTimeout(tick, POLL_BASE_MS);
        return;
      }
      const res = await fetchChatMessages(token, sinceRef.current || undefined);
      if (cancelled) return;
      if (res.ok) {
        failures = 0;
        applyServerMessages(res.data.messages, true);
        sinceRef.current = nextSinceCursor(res.data.messages, res.data.serverTime, sinceRef.current);
        timer = setTimeout(tick, nextPollDelayMs(0));
        return;
      }
      if (isSessionGone(res.status)) {
        clearStoredSession();
        setToken(null);
        setStep("done");
        say(t("supportChat.botSessionEnded"));
        return; // stop polling — nothing to poll
      }
      failures += 1;
      timer = setTimeout(tick, nextPollDelayMs(failures, res.retryAfterSeconds));
    };

    timer = setTimeout(tick, POLL_BASE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, step, token, applyServerMessages, say, t]);

  /* ---------------------------------------------------------------- *
   * The old one-shot path, kept verbatim as the FALLBACK. If the chat
   * session cannot be opened the visitor still becomes a lead and we still
   * get the email — exactly what happens today.
   * ---------------------------------------------------------------- */
  const submitLegacyFallback = useCallback(
    async (visitorName: string, visitorEmail: string, visitorIssue: string, conversation: Message[]) => {
      try {
        const captchaToken = await getCaptchaToken("support");
        const res = await fetch("/api/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            captchaToken,
            name: visitorName,
            email: visitorEmail,
            issue: visitorIssue,
            conversation: conversation.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        if (!res.ok) throw new Error(t("supportChat.submitErrorFailed"));
        say(t("supportChat.botSuccess"));
      } catch {
        say(t("supportChat.botErrorSend"));
      } finally {
        setBotTyping(false);
        setStep("done");
      }
    },
    [say, t]
  );

  /** Shared tail of a successful session open: persist, prime, go live. */
  const enterLiveThread = useCallback(
    async (session: { token: string; expiresAt: string }) => {
      writeStoredSession(session);
      setToken(session.token);

      // Prime the cursor and the dedupe set: the backend already holds the
      // opening message, which is on screen locally. Mark it seen (render:
      // false) so the first poll does not repeat it back at the visitor.
      const primed = await fetchChatMessages(session.token);
      if (primed.ok) {
        applyServerMessages(primed.data.messages, false);
        sinceRef.current = nextSinceCursor(primed.data.messages, primed.data.serverTime, sinceRef.current);
      } else {
        sinceRef.current = new Date().toISOString();
      }

      setBotTyping(false);
      setStep("live");
    },
    [applyServerMessages]
  );

  /**
   * LIVE-FIRST (2026-08-05): the visitor's FIRST message opens the thread —
   * no name/email gate, staff are notified immediately. Identity is asked
   * conversationally afterwards, inside the live thread, and stays optional.
   * If the open fails we degrade to the scripted intake (which retries a
   * session WITH identity, and only then the legacy one-shot).
   */
  const startLiveFirst = useCallback(
    async (firstMessage: string) => {
      const provenance = buildProvenance(
        typeof window === "undefined" ? "" : window.location.href,
        typeof document === "undefined" ? "" : document.referrer
      );
      const res = await openChatSession({ message: firstMessage, provenance });

      if (!res.ok) {
        // Backend without live-first support / offline / rate limited: run the
        // scripted intake exactly as before — nothing is ever lost.
        setBotTyping(false);
        say(t("supportChat.botAskName"));
        setStep("name");
        return;
      }

      await enterLiveThread(res.data);
      say(t("supportChat.botAskContact"));
      setIdentityStage("asked");
    },
    [enterLiveThread, say, t]
  );

  /** Email step of the FALLBACK intake: open the live session with identity, or one-shot. */
  const startSession = useCallback(
    async (visitorEmail: string, conversation: Message[]) => {
      const provenance = buildProvenance(
        typeof window === "undefined" ? "" : window.location.href,
        typeof document === "undefined" ? "" : document.referrer
      );
      const res = await openChatSession({ name, email: visitorEmail, message: issue, provenance });

      if (!res.ok) {
        // Session unavailable (endpoint not deployed yet, offline, rate limited):
        // do exactly what the widget did before this feature existed.
        await submitLegacyFallback(name, visitorEmail, issue, conversation);
        return;
      }

      await enterLiveThread(res.data);
      // Identity already given through the intake — never re-ask.
      setIdentityStage("done");
      say(t("supportChat.botSessionLive"));
    },
    [name, issue, enterLiveThread, say, t, submitLegacyFallback]
  );

  /**
   * The optional in-thread identity capture. The reply ALWAYS goes to the
   * thread as a normal message (staff read it in context); when it carries an
   * email or a plausible name we ALSO patch it onto the session so the room is
   * retitled and the CRM lead is created. Never nags beyond one follow-up.
   */
  const captureIdentity = useCallback(
    (reply: string) => {
      if (!token || (identityStage !== "asked" && identityStage !== "askedEmail")) return;
      const identity = extractIdentity(reply);
      if (identity.email) {
        void patchChatIdentity(token, identity);
        setIdentityStage("done");
        say(t("supportChat.botIdentityThanks"));
        return;
      }
      if (identityStage === "asked" && identity.name) {
        void patchChatIdentity(token, { name: identity.name });
        setIdentityStage("askedEmail");
        say(t("supportChat.botAskEmailOptional"));
        return;
      }
      // Anything else (a question, a long sentence, silence about identity):
      // drop the subject for good — the conversation matters more.
      setIdentityStage("done");
    },
    [token, identityStage, say, t]
  );

  /** Live step: every further message goes to the thread, not to /api/support. */
  const sendLiveMessage = useCallback(
    async (content: string) => {
      if (!token) return;
      const tempId = `tmp-${++tempIdRef.current}`;
      setMessages((prev) => [...prev, { role: "user", content, id: tempId, pending: true }]);
      const res = await postChatMessage(token, content);
      if (res.ok) {
        seenIdsRef.current.add(res.data.messageId);
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, id: res.data.messageId, pending: false } : m))
        );
        return;
      }
      setMessages((prev) => prev.map((m) => (m.id === tempId ? { ...m, pending: false, failed: true } : m)));
      if (isSessionGone(res.status)) {
        clearStoredSession();
        setToken(null);
        setStep("done");
        say(t("supportChat.botSessionEnded"));
        return;
      }
      say(t("supportChat.botMessageFailed"));
    },
    [token, say, t]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || botTyping) return;

    if (step === "welcome") {
      setIssue(trimmed);
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setInput("");
      setBotTyping(true);
      // LIVE-FIRST: this message opens the thread and reaches staff NOW.
      void startLiveFirst(trimmed);
      return;
    }
    if (step === "name") {
      setName(trimmed);
      setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
      setInput("");
      setBotTyping(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: "bot", content: t("supportChat.botAskEmail") }]);
        setBotTyping(false);
      }, TYPING_DELAY_MS);
      setStep("email");
      return;
    }
    if (step === "email") {
      const userMessage: Message = { role: "user", content: trimmed };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setBotTyping(true);
      void startSession(trimmed, [...messages, userMessage]);
      return;
    }
    if (step === "live") {
      setInput("");
      void sendLiveMessage(trimmed);
      captureIdentity(trimmed);
    }
  };

  /** "Start new chat" abandons the thread on purpose — clear it everywhere. */
  const handleRestart = () => {
    clearStoredSession();
    seenIdsRef.current = new Set();
    sinceRef.current = "";
    initialisedRef.current = false;
    setToken(null);
    setStaffJoined(false);
    setIdentityStage("unasked");
    setMessages([]);
    setInput("");
    setName("");
    setIssue("");
    setStep("welcome");
    setBotTyping(true);
    setTimeout(() => {
      setMessages([{ role: "bot", content: t("supportChat.botWelcome") }]);
      setBotTyping(false);
      initialisedRef.current = true;
    }, TYPING_DELAY_MS);
    onRestart();
  };

  const statusLabel =
    step === "live"
      ? staffJoined
        ? t("supportChat.statusLive")
        : t("supportChat.statusOffline")
      : null;

  // NOTE: this component stays mounted while closed so a conversation survives
  // the modal being dismissed. The exit animation lives here rather than in the
  // parent for exactly that reason.
  return (
    <AnimatePresence>
      {open && (
    <motion.div
      key="support-chat-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-end justify-center sm:items-center p-0 sm:p-4"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-md h-[85vh] sm:h-[600px] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#111111] flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-gray-900">{t("supportChat.headerTitle")}</span>
              {statusLabel && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${staffJoined ? "bg-emerald-500" : "bg-gray-400"}`}
                    aria-hidden
                  />
                  {statusLabel}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
            aria-label={t("supportChat.closeChatAria")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          aria-live="polite"
          aria-atomic="false"
        >
          {messages.map((msg, i) => (
            <div
              key={msg.id ?? `local-${i}`}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[85%]">
                {msg.role === "staff" && (
                  <p className="mb-1 px-1 text-xs font-medium text-gray-500">
                    {msg.authorName || t("supportChat.staffFallbackName")}
                  </p>
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 ${
                    msg.role === "user"
                      ? `rounded-br-md bg-[#111111] text-white ${msg.pending ? "opacity-60" : ""} ${msg.failed ? "opacity-50" : ""}`
                      : msg.role === "staff"
                        ? "rounded-bl-md bg-emerald-50 text-gray-900 border border-emerald-100"
                        : "rounded-bl-md bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {botTyping && (
            <div className="flex justify-start">
              <TypingIndicator className="text-gray-500" />
            </div>
          )}
        </div>

        {step === "done" ? (
          <div className="p-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleRestart}
              className="w-full py-3 rounded-xl bg-[#111111] hover:bg-[#222222] text-white font-semibold text-sm transition-colors"
            >
              {t("supportChat.startNewChat")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={botTyping}
                placeholder={t("supportChat.inputPlaceholder")}
                aria-label={t("supportChat.inputPlaceholder")}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#111111]/30 focus:border-[#111111] disabled:opacity-60 text-sm"
              />
              <button
                type="submit"
                disabled={botTyping || !input.trim()}
                aria-label={t("supportChat.sendAria")}
                className="px-4 py-3 rounded-xl bg-[#111111] hover:bg-[#222222] text-white disabled:opacity-60 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 2 9 18z" />
                </svg>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
