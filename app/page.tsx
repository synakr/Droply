"use client";

import React, { useState } from "react";
import { PageId } from "./types";
import { Header } from "@/components/Header";
import { Navbar } from "@/components/Navbar";
import { LoginPage } from "@/components/LoginPage";
import { ChatPage } from "@/components/ChatPage";
import { GenericContentPage } from "@/components/GenericContentPage";
import { Footer } from "@/components/Footer";

export default function App() {
  const [activePage, setActivePage] = useState<PageId>("login-page");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setActivePage("chat-page");
  };

  return (
    <div className="bg-black text-[#00ff00] min-h-screen w-full flex items-center justify-center p-2 sm:p-5 font-mono relative overflow-x-hidden selection:bg-[#00ff00] selection:text-black crt-overlay">
      <div className="w-full max-w-[1100px] h-[95vh] max-h-[850px] flex flex-col border-2 border-[#00ff00] shadow-[0_0_10px_#00ff00] p-2.5 sm:p-4 bg-black box-border">
        <Header />
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          isLoggedIn={isLoggedIn}
        />

        <div id="main-content-area" className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {activePage === "login-page" && (
            <LoginPage onSuccess={handleLoginSuccess} />
          )}

          {activePage === "chat-page" && <ChatPage />}

          {activePage === "contacts-page" && (
            <GenericContentPage>
              <p className="text-lg">CONTACTS LIST</p>
              <p>-----------------------------------</p>
              <p>1. O&apos;NEIL, J. (Homicide)</p>
              <p>2. COLVIN, H. (Major, Western District)</p>
              <p>3. COLE, R. (Detective)</p>
              <p>4. FREAMON, L. (Detective, Major Crimes)</p>
              <p>5. GREGGS, K. (Detective, Narcotics)</p>
              <p>-----------------------------------</p>
              <p className="mt-2 text-yellow-400">
                MESSAGE: SELECT A CONTACT FOR MORE INFORMATION.
              </p>
            </GenericContentPage>
          )}

          {activePage === "loc-page" && (
            <GenericContentPage>
              <p className="text-lg">LOCATION LOGS</p>
              <p>-----------------------------------</p>
              <p>10/26/2025 09:30:45 | PINGED: 212 N CHARLES STREET</p>
              <p>10/26/2025 10:15:22 | PINGED: WESTERN DISTRICT HQS</p>
              <p>10/26/2025 11:40:01 | PINGED: 1045 E BALTIMORE ST</p>
              <p>10/26/2025 12:05:58 | PINGED: JOHNS HOPKINS HOSPITAL</p>
              <p>-----------------------------------</p>
              <p className="mt-2 text-yellow-400">
                MESSAGE: LAST KNOWN LOCATIONS FOR UNIT A-34-D-1.
              </p>
            </GenericContentPage>
          )}

          {activePage === "documents-page" && (
            <GenericContentPage>
              <p className="text-lg">DOCUMENTS FOLDER</p>
              <p>-----------------------------------</p>
              <p>FILE: HOMICIDE-988-2000-CASE.DOC</p>
              <p>FILE: PERSONNEL-O&apos;NEIL-48532695.DOC</p>
              <p>FILE: BOLO-45-789.DOC (BE ON THE LOOKOUT)</p>
              <p>FILE: WARRANT-GRIFFITH-42.PDF</p>
              <p>-----------------------------------</p>
              <p className="mt-2 text-yellow-400">
                MESSAGE: VIEWING DOCUMENTS REQUIRES A VALID R-KEY.
              </p>
            </GenericContentPage>
          )}

          {activePage === "orders-page" && (
            <GenericContentPage>
              <p className="text-lg">ORDERS LOG</p>
              <p>-----------------------------------</p>
              <p>DIRECTIVE 99-A: SECURE VAULT ACCESS CODES BEFORE 04:00 ZULU.</p>
              <p>DIRECTIVE 99-B: MAINTAIN RADIO SILENCE IN SECTOR 7.</p>
            </GenericContentPage>
          )}

          {activePage === "recordings-page" && (
            <GenericContentPage>
              <p className="text-lg">RECORDINGS LOG</p>
              <p>-----------------------------------</p>
              <p>[AUDIO] TRANSMISSION_20251026_01.WAV - 02:14</p>
              <p>[AUDIO] WIRE_TAP_BALTIMORE_EAST.WAV - 14:02</p>
            </GenericContentPage>
          )}

          {activePage === "map-page" && (
            <GenericContentPage>
              <p className="text-lg">MAP VIEW</p>
              <p>-----------------------------------</p>
              <p>GRID COORD: 39°17&apos;26.0&quot;N 76°36&apos;44.0&quot;W</p>
              <p>TACTICAL SATELLITE FEED: ACTIVE</p>
            </GenericContentPage>
          )}

          {activePage === "create-page" && (
            <GenericContentPage>
              <p className="text-lg">CREATE NEW ACCOUNT</p>
              <p>-----------------------------------</p>
              <p>CONTACT YOUR IMF FIELD OFFICER TO PROVISION NEW CREDENTIALS.</p>
            </GenericContentPage>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}