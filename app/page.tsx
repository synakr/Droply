"use client";

import React, { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { PageId } from "./types";
import { supabase } from "@/lib/supabase/client";
import { Header } from "@/components/Header";
import { Navbar } from "@/components/Navbar";
import { LoginPage } from "@/components/LoginPage";
import { SignupPage } from "@/components/SignupPage";
import { ChatPage } from "@/components/ChatPage";
import { FilesPage } from "@/components/FilesPage";
import { GenericContentPage } from "@/components/GenericContentPage";
import { Footer } from "@/components/Footer";
import { encryptText } from "@/lib/crypto/vault";
import { VaultProvider, useVault } from "@/context/VaultContext";

function AppContent() {
  const [activePage, setActivePage] = useState<PageId>("login-page");
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [texting, setTexting] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");
  const [vaultPassphrase, setVaultPassphrase] = useState("");
  const [vaultStatus, setVaultStatus] = useState("");

  // Hooks must be called at the component's top level.
  const { vaultKey, isVaultUnlocked, isVaultLoading, unlockVault, lockVault } =
    useVault();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      setUser(session?.user ?? null);
      setActivePage(session ? "chat-page" : "login-page");
      setIsAuthLoading(false);
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      setUser(session?.user ?? null);
      setActivePage(session ? "chat-page" : "login-page");
      setIsAuthLoading(false);

      if (!session) {
        lockVault();
        setVaultPassphrase("");
        setVaultStatus("");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [lockVault]);

  const handleLoginSuccess = () => {
    setActivePage("chat-page");
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed:", error);
      return;
    }

    lockVault();
    setVaultPassphrase("");
    setVaultStatus("");
    setUser(null);
    setActivePage("login-page");
  };

  const handleUnlockVault = async () => {
    setVaultStatus("");

    try {
      await unlockVault(vaultPassphrase);
      setVaultPassphrase("");
      setVaultStatus("VAULT KEY DERIVED.");
    } catch (error) {
      setVaultStatus(
        error instanceof Error ? error.message : "FAILED TO UNLOCK VAULT.",
      );
    }
  };

  const handleSendText = async () => {
    const message = texting.trim();

    if (!message || isSending) return;

    if (!vaultKey) {
      setSendStatus("ERROR: UNLOCK YOUR VAULT BEFORE SENDING MESSAGES.");
      return;
    }

    setIsSending(true);
    setSendStatus("");

    try {
      // Encrypt in the browser. Only ciphertext and IV are sent to the API.
      const { ciphertext, iv } = await encryptText(message, vaultKey);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch("/api/texting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ ciphertext, iv }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save encrypted message.");
      }

      setTexting("");
      setSendStatus("MESSAGE ENCRYPTED AND SAVED.");
    } catch (error) {
      console.error("Failed to send encrypted message:", error);

      setSendStatus(
        `ERROR: ${
          error instanceof Error ? error.message : "Failed to save message."
        }`,
      );
    } finally {
      setIsSending(false);
    }
  };

  const isLoggedIn = Boolean(user);

  return (
    <div className="bg-black text-[#00ff00] min-h-screen w-full flex items-center justify-center p-2 sm:p-5 font-mono relative overflow-x-hidden selection:bg-[#00ff00] selection:text-black crt-overlay">
      <div className="w-full max-w-[1100px] h-[95vh] max-h-[850px] flex flex-col border-2 border-[#00ff00] shadow-[0_0_10px_#00ff00] p-2.5 sm:p-4 bg-black box-border">
        <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />

        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          isLoggedIn={isLoggedIn}
        />

        <div
          id="main-content-area"
          className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {isAuthLoading && (
            <div className="flex-1 p-3 glow-border font-mono text-[#00ff00]">
              CHECKING AUTHENTICATION STATUS...
            </div>
          )}

          {!isAuthLoading && !isLoggedIn && activePage === "login-page" && (
            <LoginPage onSuccess={handleLoginSuccess} />
          )}

          {!isAuthLoading && !isLoggedIn && activePage === "create-page" && (
            <SignupPage onSuccess={handleLoginSuccess} />
          )}

          {!isAuthLoading && isLoggedIn && activePage === "chat-page" && (
            <ChatPage />
          )}

          {!isAuthLoading &&
            isLoggedIn &&
            activePage === "files-page" &&
            user && <FilesPage userId={user.id} vaultKey={vaultKey} />}

          {!isAuthLoading && isLoggedIn && activePage === "contacts-page" && (
            <GenericContentPage>
              <p className="text-lg">CONTACTS LIST</p>
              <p>-----------------------------------</p>
              <p>1. O&apos;NEIL, J. (Homicide)</p>
              <p>2. COLVIN, W. (Major, Western District)</p>
              <p>3. COLE, R. (Detective, Narcotics)</p>
              <p>4. FREAMON, L. (Major Crimes)</p>
              <p>5. GREGGS, K. (Detective, Narcotics)</p>
              <p>-----------------------------------</p>
              <p className="mt-2 text-yellow-400">
                MESSAGE: SELECT A CONTACT FOR MORE INFORMATION.
              </p>
            </GenericContentPage>
          )}

          {!isAuthLoading && isLoggedIn && activePage === "loc-page" && (
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

          {!isAuthLoading && isLoggedIn && activePage === "documents-page" && (
            <GenericContentPage>
              <p className="text-lg">DOCUMENTS FOLDER</p>
              <p>-----------------------------------</p>
              <p>FILE: HOMICIDE-988-2000-CASE.DOC</p>
              <p>FILE: PERSONNEL-ONEIL-48532695.DOC</p>
              <p>FILE: BOLO-45-789.DOC (BE ON THE LOOKOUT)</p>
              <p>FILE: WARRANT-GRIFFITH-42.PDF</p>
              <p>-----------------------------------</p>

              <div className="mt-5 border border-[#00ff00]/70 p-3">
                <p className="text-lg">ENCRYPTION VAULT</p>
                <p className="mt-1 text-sm text-[#00ff00]/70">
                  {isVaultUnlocked
                    ? "VAULT KEY IS IN MEMORY."
                    : "ENTER YOUR VAULT PASSPHRASE TO CONTINUE."}
                </p>

                {!isVaultUnlocked && (
                  <form
                    className="mt-3 flex flex-col gap-2 sm:flex-row"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleUnlockVault();
                    }}>
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={vaultPassphrase}
                      onChange={(event) =>
                        setVaultPassphrase(event.target.value)
                      }
                      placeholder="VAULT PASSPHRASE"
                      minLength={12}
                      required
                      className="min-w-0 flex-1 border border-[#00ff00] bg-black p-2 text-[#00ff00] outline-none placeholder:text-[#00ff00]/50"
                    />

                    <button
                      type="submit"
                      disabled={isVaultLoading}
                      className="border border-[#00ff00] px-4 py-2 hover:bg-[#00ff00] hover:text-black disabled:opacity-50">
                      {isVaultLoading ? "UNLOCKING..." : "UNLOCK VAULT"}
                    </button>
                  </form>
                )}

                {isVaultUnlocked && (
                  <button
                    type="button"
                    onClick={() => {
                      lockVault();
                      setVaultStatus("VAULT LOCKED.");
                      setSendStatus("");
                    }}
                    className="mt-3 border border-yellow-400 px-3 py-2 text-yellow-400 hover:bg-yellow-400 hover:text-black">
                    LOCK VAULT
                  </button>
                )}

                {vaultStatus && (
                  <p role="status" className="mt-2 text-sm text-yellow-400">
                    {vaultStatus}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-end gap-2 border border-[#00ff00] p-2 shadow-[0_0_8px_#00ff00]">
                <textarea
                  placeholder="TYPE MESSAGE..."
                  rows={2}
                  value={texting}
                  onChange={(event) => setTexting(event.target.value)}
                  disabled={isSending}
                  maxLength={100_000}
                  className="min-w-0 flex-1 resize-y bg-transparent p-2 text-[#00ff00] placeholder:text-[#00ff00]/50 outline-none"
                />

                <button
                  type="button"
                  onClick={() => void handleSendText()}
                  disabled={isSending || !texting.trim()}
                  className="border border-[#00ff00] px-4 py-2 text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                  {isSending ? "SENDING..." : "SEND"}
                </button>
              </div>

              {sendStatus && (
                <p
                  role="status"
                  className={`mt-2 text-sm ${
                    sendStatus.startsWith("ERROR")
                      ? "text-red-500"
                      : "text-yellow-400"
                  }`}>
                  {sendStatus}
                </p>
              )}
            </GenericContentPage>
          )}

          {!isAuthLoading && isLoggedIn && activePage === "orders-page" && (
            <GenericContentPage>
              <p className="text-lg">ORDERS LOG</p>
              <p>-----------------------------------</p>
              <p>
                DIRECTIVE 99-A: SECURE VAULT ACCESS CODES BEFORE 04:00 ZULU.
              </p>
              <p>DIRECTIVE 99-B: MAINTAIN RADIO SILENCE IN SECTOR 7.</p>
            </GenericContentPage>
          )}

          {!isAuthLoading && isLoggedIn && activePage === "recordings-page" && (
            <GenericContentPage>
              <p className="text-lg">RECORDINGS LOG</p>
              <p>-----------------------------------</p>
              <p>[AUDIO] TRANSMISSION_20251026_01.WAV - 02:14</p>
              <p>[AUDIO] WIRE_TAP_BALTIMORE_EAST.WAV - 14:02</p>
            </GenericContentPage>
          )}

          {!isAuthLoading && isLoggedIn && activePage === "map-page" && (
            <GenericContentPage>
              <p className="text-lg">MAP VIEW</p>
              <p>-----------------------------------</p>
              <p>GRID COORD: 39°17&apos;26.0&quot;N 76°36&apos;44.0&quot;W</p>
              <p>TACTICAL SATELLITE FEED: ACTIVE</p>
            </GenericContentPage>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <VaultProvider>
      <AppContent />
    </VaultProvider>
  );
}
