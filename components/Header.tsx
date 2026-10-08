import React from "react";

interface HeaderProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLoggedIn = false,
  onLogout,
}) => {
  return (
    <div className="flex justify-between items-center text-lg pb-1 font-mono text-[#00ff00]">
      <span>IMF OPS 7.1.00</span>

      <div className="flex items-center gap-3">
        <span>AGENT DOSSIER:</span>

        {isLoggedIn && (
          <button
            type="button"
            onClick={onLogout}
            className="px-2 py-0.5 border border-red-600 text-red-500 hover:bg-red-600 hover:text-black transition-colors font-mono text-xs cursor-pointer"
          >
            LOGOUT
          </button>
        )}
      </div>
    </div>
  );
};