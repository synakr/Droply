"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, ApiMessage } from "@/app/types";
import { getEthanResponse } from "@/services/api";
import { ChatWindow } from "./ChatWindow";
import { VirtualKeyboard } from "./VirtualKeyboard";
import { ProfileSection } from "./ProfileSection";

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "ETHAN", text: "WHAT THE HELL DID I JUST WALK INTO??" },
    {
      sender: "YOU",
      text: "A MISSION, ETHAN. YOU KNOW WHAT THAT IS? IT'S THE IMPOSSIBLE TASK NO ONE ELSE CAN DO.",
      isUser: true,
    },
    {
      sender: "ETHAN",
      text: "THAT'S SOME IMF-LEVEL INSANITY RIGHT THERE!!!",
    },
    {
      sender: "YOU",
      text: "FUNNY THING IS… THE IMPOSSIBLE IS JUST ANOTHER DAY AT THE OFFICE.",
      isUser: true,
    },
  ]);

  const [apiMessages, setApiMessages] = useState<ApiMessage[]>([
    {
      role: "assistant",
      content: "WHAT THE HELL DID I JUST WALK INTO??",
    },
    {
      role: "user",
      content:
        "A MISSION, ETHAN. YOU KNOW WHAT THAT IS? IT'S THE IMPOSSIBLE TASK NO ONE ELSE CAN DO.",
    },
    {
      role: "assistant",
      content: "THAT'S SOME IMF-LEVEL INSANITY RIGHT THERE!!!",
    },
    {
      role: "user",
      content:
        "FUNNY THING IS… THE IMPOSSIBLE IS JUST ANOTHER DAY AT THE OFFICE.",
    },
  ]);
  const [chatInput, setChatInput] = useState(
    "DON'T THINK TOO MUCH ABOUT IT",
  );
  const [isSending, setIsSending] = useState(false);

  const chatWindowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop =
        chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    const text = chatInput.trim();

    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      sender: "YOU",
      text,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsSending(true);

    const updatedHistory: ApiMessage[] = [
      ...apiMessages,
      {
        role: "user",
        content: text,
      },
    ];

    setApiMessages(updatedHistory);

    try {
      const reply = await getEthanResponse(updatedHistory);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ETHAN M'HUNT",
          text: reply,
        },
      ]);

      setApiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      console.error("Failed to get Ethan response:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ETHAN M'HUNT",
          text: "COMMUNICATION'S COMPROMISED. TRY AGAIN.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1.65fr_1fr] gap-2 overflow-hidden">
      {/* LEFT */}
      <div className="flex flex-col gap-2 min-h-0">
        {/* Chat */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ChatWindow
            messages={messages}
            isSending={isSending}
            chatWindowRef={chatWindowRef}
          />
        </div>

        {/* Input */}
        <div className="glow-border p-2 flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            className="flex-1 bg-transparent outline-none text-[#00ff00] font-mono text-sm sm:text-base py-1"
            disabled={isSending}
          />

          <VirtualKeyboard
            onKeyPress={(char) =>
              setChatInput((prev) => prev + char)
            }
            onSend={handleSendMessage}
            isSending={isSending}
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col gap-2 min-h-0">
        <ProfileSection />

        <div className="glow-border p-2 flex-1 overflow-y-auto no-scrollbar font-mono text-[11px] sm:text-xs leading-relaxed text-white space-y-2">
          <p>
            HUNT WAS RECRUITED INTO THE IMPOSSIBLE MISSION FORCE AFTER
            OUTSTANDING PERFORMANCE IN COVERT OPERATIONS ACROSS EASTERN
            EUROPE. TRAINED IN COUNTER-ESPIONAGE, INFILTRATION, AND
            ADVANCED TRADECRAFT, HE QUICKLY BECAME ONE OF IMF&apos;S MOST
            RELIABLE FIELD OPERATIVES.
          </p>

          <p>
            HUNT&apos;S MISSIONS HAVE TAKEN HIM ACROSS THE GLOBE, FROM
            INFILTRATING HIGH-SECURITY VAULTS TO STOPPING GLOBAL TERROR
            NETWORKS. DESPITE CONSTANT BETRAYALS AND COMPROMISED
            OPERATIONS, HIS RECORD REMAINS UNMATCHED. HE IS CONSIDERED
            THE AGENCY&apos;S TOP ASSET—AND ITS MOST DANGEROUS VARIABLE.
          </p>
        </div>
      </div>
    </div>
  );
};