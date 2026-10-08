"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface SignupPageProps {
  onSuccess: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setStatus(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setStatus({ text: error.message.toUpperCase(), isError: true });
      return;
    }

    if (data.session) {
      setStatus({ text: "ACCOUNT CREATED.", isError: false });
      onSuccess();
      return;
    }

    setStatus({
      text: "ACCOUNT CREATED. CHECK YOUR EMAIL TO CONFIRM.",
      isError: false,
    });
  };

  return (
    <div className="flex-1 p-3 overflow-y-auto glow-border font-mono text-[#00ff00]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
        <p className="text-lg">CREATE USER ACCOUNT</p>
        <div className="flex gap-2 items-center">
          <label className="whitespace-nowrap">EMAIL:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoCorrect="off"
            autoCapitalize="off"
            required
            className="flex-1 bg-transparent border border-[#00ff00] text-[#00ff00] font-mono text-xl outline-none shadow-[0_0_3px_#00ff00] focus:shadow-[0_0_5px_#00ff00] px-1"
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="whitespace-nowrap">PASSWORD:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
            className="flex-1 bg-transparent border border-[#00ff00] text-[#00ff00] font-mono text-xl outline-none shadow-[0_0_3px_#00ff00] focus:shadow-[0_0_5px_#00ff00] px-1"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="p-2 bg-black text-[#00ff00] border border-[#00ff00] shadow-[0_0_5px_#00ff00] font-mono text-xl cursor-pointer active:bg-[#00ff00] active:text-black transition-colors"
        >
          {isSubmitting ? "PROVISIONING..." : "CREATE ACCOUNT"}
        </button>
        {status && (
          <div
            className={`p-2 text-center border shadow-[0_0_5px] mt-2 ${
              status.isError
                ? "border-red-600 text-red-500 shadow-red-600"
                : "border-[#00ff00] text-[#00ff00] shadow-[#00ff00]"
            }`}
          >
            {status.text}
          </div>
        )}
      </form>
    </div>
  );
};