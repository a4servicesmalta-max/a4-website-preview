"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import ChatLauncher from "./ChatLauncher";
import GreetingCard from "./GreetingCard";
import ChatModal from "./ChatModal";

export default function SupportChat() {
  const [greetingOpen, setGreetingOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const openGreeting = () => setGreetingOpen(true);
  const closeGreeting = () => setGreetingOpen(false);
  const openChat = () => {
    setGreetingOpen(false);
    setChatOpen(true);
  };
  const closeChat = () => setChatOpen(false);
  const restartChat = () => {
    setChatOpen(false);
    setChatOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <div className="relative">
          <AnimatePresence>
            {greetingOpen && (
              <GreetingCard
                onChatNow={openChat}
                onClose={closeGreeting}
              />
            )}
          </AnimatePresence>
          <ChatLauncher
          onClick={() => (greetingOpen ? closeGreeting() : openGreeting())}
          disabled={chatOpen}
        />
        </div>
      </div>

      {/*
        Always mounted. The chat is a real conversation now: unmounting on close
        would throw away the thread the visitor is halfway through. ChatModal
        renders nothing (and runs its own exit animation) while `open` is false.
      */}
      <ChatModal open={chatOpen} onClose={closeChat} onRestart={restartChat} />
    </>
  );
}
