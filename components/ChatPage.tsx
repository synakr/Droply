"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/app/types";
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
    { sender: "ETHAN", text: "THAT'S SOME IMF-LEVEL INSANITY RIGHT THERE!!!" },
    {
      sender: "YOU",
      text: "FUNNY THING IS… THE IMPOSSIBLE IS JUST ANOTHER DAY AT THE OFFICE.",
      isUser: true,
    },
  ]);

  const [chatInput, setChatInput] = useState("DON'T THINK TOO MUCH ABOUT IT");
  const [isSending, setIsSending] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    const text = chatInput.trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = { sender: "YOU", text, isUser: true };

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      return updated.length > 5 ? updated.slice(updated.length - 5) : updated;
    });

    setChatInput("");
    setIsSending(true);

    const reply = await getEthanResponse(text);
    const agentMsg: ChatMessage = { sender: "ETHAN M'HUNT", text: reply };

    setMessages((prev) => {
      const updated = [...prev, agentMsg];
      return updated.length > 5 ? updated.slice(updated.length - 5) : updated;
    });

    setIsSending(false);
  };

  return (
    <div className="flex-1 flex flex-col md:grid md:grid-cols-[1.6fr_1fr] gap-3 mb-2 min-h-0 overflow-y-auto md:overflow-hidden">
      {/* Left Panel */}
      <div className="flex flex-col gap-2.5 h-full min-w-0">
        <ChatWindow
          messages={messages}
          isSending={isSending}
          chatWindowRef={chatWindowRef}
        />

        <div className="glow-border p-2.5 flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full sm:w-[65%] flex items-center">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="w-full bg-transparent border-none text-[#00ff00] font-mono text-xl outline-none glow-text shadow-[0_0_5px_#00ff0020] focus:shadow-[0_0_5px_#00ff00] py-1"
            />
          </div>
          <VirtualKeyboard
            onKeyPress={(char) => setChatInput((prev) => prev + char)}
            onSend={handleSendMessage}
            isSending={isSending}
          />
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col gap-2.5 h-full min-w-0">
        <ProfileSection />

        <div className="glow-border p-2.5 flex-1 overflow-y-auto no-scrollbar text-white text-xs sm:text-sm leading-tight space-y-2 font-mono">
          <p>
            HUNT WAS RECRUITED INTO THE IMPOSSIBLE MISSION FORCE AFTER OUTSTANDING
            PERFORMANCE IN COVERT OPERATIONS ACROSS EASTERN EUROPE. TRAINED IN
            COUNTER-ESPIONAGE, INFILTRATION, AND ADVANCED TRADECRAFT, HE QUICKLY
            BECAME ONE OF IMF&apos;S MOST RELIABLE FIELD OPERATIVES.
          </p>
          <p>
            HUNT&apos;S MISSIONS HAVE TAKEN HIM ACROSS THE GLOBE, FROM INFILTRATING
            HIGH-SECURITY VAULTS TO STOPPING GLOBAL TERROR NETWORKS. DESPITE CONSTANT
            BETRAYALS AND COMPROMISED OPERATIONS, HIS RECORD REMAINS UNMATCHED. HE IS
            CONSIDERED THE AGENCY&apos;S TOP ASSET—AND ITS MOST DANGEROUS
            VARIABLE.
          </p>
        </div>
      </div>
    </div>
  );
};
