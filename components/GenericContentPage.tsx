import React from "react";

interface GenericContentPageProps {
  children: React.ReactNode;
}

export const GenericContentPage: React.FC<GenericContentPageProps> = ({
  children,
}) => {
  return (
    <div className="flex-1 p-3 overflow-y-auto no-scrollbar leading-tight glow-border font-mono text-[#00ff00]">
      {children}
    </div>
  );
};