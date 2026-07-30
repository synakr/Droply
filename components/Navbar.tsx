import React from "react";
import { PageId } from "@/app/types";

interface NavbarProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  isLoggedIn: boolean;
}

const TABS: { id: PageId; label: string }[] = [
  { id: "login-page", label: "LOGIN" },
  { id: "create-page", label: "CREATE" },
  { id: "chat-page", label: "CHAT" },
  { id: "contacts-page", label: "CONTACTS" },
  { id: "loc-page", label: "LOC" },
  { id: "documents-page", label: "DOCUMENTS" },
  { id: "orders-page", label: "ORDERS" },
  { id: "recordings-page", label: "RECORDINGS" },
  { id: "map-page", label: "MAP" },
];

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  setActivePage,
  isLoggedIn,
}) => {
  return (
    <div className="flex gap-1 py-1 border-b border-[#00ff00] shadow-[0_1px_5px_#00ff00] mb-2.5 flex-wrap font-mono text-sm sm:text-base">
      {TABS.map((tab) => {
        if (isLoggedIn && (tab.id === "login-page" || tab.id === "create-page")) {
          return null;
        }

        const isActive = activePage === tab.id;
        return (
          <span
            key={tab.id}
            onClick={() => setActivePage(tab.id)}
            className={`px-2 py-0.5 sm:px-2.5 sm:py-1 cursor-pointer transition-all duration-200 border glow-text ${
              isActive
                ? "border-[#00ff00] bg-[#00ff001a] shadow-[0_0_5px_#00ff00] text-[#00ff00]"
                : "border-transparent text-[#00ff00]/70 hover:text-[#00ff00]"
            }`}
          >
            {tab.label}
          </span>
        );
      })}
    </div>
  );
};