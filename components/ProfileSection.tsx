import React from "react";

export const ProfileSection: React.FC = () => {
  return (
    <div className="glow-border p-2.5 flex flex-row items-start justify-between font-mono">
      <div className="flex flex-col gap-1 text-xs sm:text-sm text-[#00ff00]">
        <span>AGENT: M-17-I-6</span>
        <span>
          LEGAL NAME: ETHAN
          <br />
          M&apos;HUNT
        </span>
        <span>
          MISSION CODE:
          <br />
          48532695-IMF
        </span>
        <span>
          STANDARD ISSUE:
          <br />
          WALTHER P99
        </span>
      </div>
      <div className="w-[120px] h-[120px] flex-shrink-0">
        <img
          src="https://tse4.mm.bing.net/th/id/OIP.No2rMpmZzMYgjDsMIzVn0AHaEK?rs=1&pid=ImgDetMain&o=7&rm=3"
          alt="Ethan Hunt Dossier Photo"
          className="w-full h-full border border-[#00ff00] shadow-[0_0_5px_#00ff00] object-cover object-top sepia saturate-[300%] hue-rotate-90"
        />
      </div>
    </div>
  );
}