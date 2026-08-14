"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import TypingIndicator from "./TypingIndicator";

export type Message = { role: "user" | "bot"; content: string };

const TYPING_DELAY_MS = 800;

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
}

const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

export default function ChatModal({ open, onClose, onRestart }: ChatModalProps) {
  const { t } = useTranslation("common");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  // Identity is collected up front, before the visitor writes anything: an
  // abandoned conversation is still a lead if we already have a name and an
  // email, which is how vacei.com's widget orders it.
  const [step, setStep] = useState<"identity" | "message" | "done">("identity");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [identityError, setIdentityError] = useState("");
  // Honeypot: never shown, never filled by a person, always submitted. The
  // server drops anything that arrives with it set.
  const [companyWebsite, setCompanyWebsite] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  useEffect(() => {
    if (!open) return;
    setMessages([]);
    setStep("identity");
    setName("");
    setEmail("");
    setIdentityError("");
    setCompanyWebsite("");
    setInput("");
    setBotTyping(true);
    const timer = setTimeout(() => {
      setMessages([{ role: "bot", content: t("supportChat.botAskIdentity") }]);
      setBotTyping(false);
    }, TYPING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [open, t]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, botTyping]);

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (botTyping) return;
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || !isValidEmail(trimmedEmail)) {
      setIdentityError(t("supportChat.identityError"));
      return;
    }
    setIdentityError("");
    setName(trimmedName);
    setEmail(trimmedEmail);
    setMessages((prev) => [...prev, { role: "user", content: `${trimmedName} · ${trimmedEmail}` }]);
    setBotTyping(true);
    setStep("message");
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "bot", content: t("supportChat.botWelcome") }]);
      setBotTyping(false);
    }, TYPING_DELAY_MS);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || botTyping || step !== "message") return;

    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setBotTyping(true);
    const fullConversation: Message[] = [...messages, userMessage];
    fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        issue: trimmed,
        conversation: fullConversation,
        company_website: companyWebsite,
      }),
    })
      .then((res) => {
        if (!res.ok) return res.json().then((d) => Promise.reject(new Error(d.error || t("supportChat.submitErrorFailed"))));
        setMessages((prev) => [...prev, { role: "bot", content: t("supportChat.botSuccess") }]);
      })
      .catch(() => {
        setMessages((prev) => [...prev, { role: "bot", content: t("supportChat.botErrorSend") }]);
      })
      .finally(() => {
        setBotTyping(false);
        setStep("done");
      });
  };

  if (!open) return null;

  return (
    <motion.div
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
            <span className="font-semibold text-gray-900">{t("supportChat.headerTitle")}</span>
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

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.role === "user"
                    ? "rounded-br-md bg-[#111111] text-white"
                    : "rounded-bl-md bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
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
              onClick={onRestart}
              className="w-full py-3 rounded-xl bg-[#111111] hover:bg-[#222222] text-white font-semibold text-sm transition-colors"
            >
              {t("supportChat.startNewChat")}
            </button>
          </div>
        ) : step === "identity" ? (
          <form onSubmit={handleIdentitySubmit} className="p-4 border-t border-gray-100" noValidate>
            {identityError && (
              <p role="alert" className="mb-2 text-xs leading-relaxed text-[#9A3412]">
                {identityError}
              </p>
            )}
            <label htmlFor="support-chat-name" className="block mb-1 text-xs font-semibold text-gray-900">
              {t("supportChat.nameLabel")}
            </label>
            <input
              id="support-chat-name"
              type="text"
              autoComplete="name"
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={botTyping}
              className="w-full mb-3 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#111111]/30 focus:border-[#111111] disabled:opacity-60 text-sm"
            />

            <label htmlFor="support-chat-email" className="block mb-1 text-xs font-semibold text-gray-900">
              {t("supportChat.emailLabel")}
            </label>
            <input
              id="support-chat-email"
              type="email"
              autoComplete="email"
              maxLength={200}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={botTyping}
              className="w-full mb-3 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#111111]/30 focus:border-[#111111] disabled:opacity-60 text-sm"
            />

            {/* Honeypot — off-screen, unfocusable, hidden from assistive tech.
                Only a bot ever fills this in; the API drops anything that does. */}
            <input
              type="text"
              name="company_website"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] w-px h-px opacity-0"
            />

            <button
              type="submit"
              disabled={botTyping}
              className="w-full py-3 rounded-xl bg-[#111111] hover:bg-[#222222] text-white font-semibold text-sm disabled:opacity-60 transition-colors"
            >
              {t("supportChat.startChat")}
            </button>
            <p className="mt-2 text-[11px] leading-relaxed text-gray-500">{t("supportChat.privacyNote")}</p>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={botTyping}
                placeholder={t("supportChat.inputPlaceholder")}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#111111]/30 focus:border-[#111111] disabled:opacity-60 text-sm"
              />
              <button
                type="submit"
                disabled={botTyping || !input.trim()}
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
  );
}
