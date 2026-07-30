import React from "react";
import { ChatMessage } from "@/app/types";

interface ChatWindowProps {
  messages: ChatMessage[];
  isSending: boolean;
  chatWindowRef: React.RefObject<HTMLDivElement | null>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isSending,
  chatWindowRef,
}) => {
  return (
    <div
      ref={chatWindowRef}
      className="glow-border p-3 flex flex-col flex-1 overflow-y-auto no-scrollbar h-[280px] md:h-[320px] max-h-[320px] min-h-[220px] font-mono"
    >
      {messages.map((msg, index) => (
        <p
          key={index}
          className={`mb-2 leading-tight text-base sm:text-lg ${
            msg.isUser ? "text-[#00ffff]" : "text-[#00ff00]"
          }`}
        >
          {msg.sender}: {msg.text}
        </p>
      ))}
      {isSending && (
        <p className="text-yellow-400 text-base sm:text-lg animate-pulse">
          ETHAN M&apos;HUNT: [TRANSMITTING ENCRYPTED RESPONSE...]
        </p>
      )}
    </div>
  );
};