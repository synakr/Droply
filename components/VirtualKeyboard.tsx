import React from "react";

interface VirtualKeyboardProps {
  onKeyPress: (char: string) => void;
  onSend: () => void;
  isSending?: boolean;
}

const KEYS = [
  "a", "c", "z", "?", "i",
  "o", "e", "!", "j", "ñ",
  "ü", "~", "g", "o", "e",
  "_", "i", "l", "e", "@",
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onSend,
  isSending = false,
}) => {
  return (
    <div className="grid grid-cols-5 gap-1 w-full sm:w-auto font-mono">
      {KEYS.map((char, idx) => (
        <button
          key={idx}
          onClick={() => onKeyPress(char)}
          className="bg-black text-[#00ff00] border border-[#00ff00] shadow-[0_0_3px_#00ff00] px-2 py-0.5 font-mono text-base cursor-pointer text-center active:bg-[#00ff00] active:text-black hover:bg-[#00ff00]/20 transition-colors"
        >
          {char}
        </button>
      ))}
      <button
        onClick={onSend}
        disabled={isSending}
        className="col-span-5 text-center p-1.5 bg-black text-[#00ff00] border border-[#00ff00] shadow-[0_0_5px_#00ff00] font-mono text-lg cursor-pointer active:bg-[#00ff00] active:text-black hover:bg-[#00ff00]/20 disabled:opacity-50 transition-colors"
      >
        SEND
      </button>
    </div>
  );
};