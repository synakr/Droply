"use client";

import React, { useState } from "react";

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ text: string; isError: boolean } | null>(
    null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "user" && password === "password") {
      setStatus({ text: "AUTHENTICATION SUCCESSFUL.", isError: false });
      setTimeout(() => {
        onSuccess();
      }, 800);
    } else {
      setStatus({ text: "AUTHENTICATION FAILED. RETRY.", isError: true });
    }
  };

  return (
    <div className="flex-1 p-3 overflow-y-auto glow-border font-mono text-[#00ff00]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
        <p className="text-lg">USER AUTHENTICATION REQUIRED</p>
        <div className="flex gap-2 items-center">
          <label className="whitespace-nowrap">USERNAME:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            className="flex-1 bg-transparent border border-[#00ff00] text-[#00ff00] font-mono text-xl outline-none shadow-[0_0_3px_#00ff00] focus:shadow-[0_0_5px_#00ff00] px-1"
          />
        </div>
        <div className="flex gap-2 items-center">
          <label className="whitespace-nowrap">PASSWORD:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent border border-[#00ff00] text-[#00ff00] font-mono text-xl outline-none shadow-[0_0_3px_#00ff00] focus:shadow-[0_0_5px_#00ff00] px-1"
          />
        </div>
        <button
          type="submit"
          className="p-2 bg-black text-[#00ff00] border border-[#00ff00] shadow-[0_0_5px_#00ff00] font-mono text-xl cursor-pointer active:bg-[#00ff00] active:text-black transition-colors"
        >
          LOGIN
        </button>
        <p className="text-xs text-[#00ff00]/60 mt-1">
          Hint: Demo credentials username: <code className="text-[#00ff00]">user</code> / password: <code className="text-[#00ff00]">password</code>
        </p>
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
