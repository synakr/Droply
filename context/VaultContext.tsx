"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import {
  deriveVaultKey,
  generateVaultSalt,
  encryptText,
  decryptText,
} from "@/lib/crypto/vault";
import { supabase } from "@/lib/supabase/client";

interface VaultContextValue {
  vaultKey: CryptoKey | null;
  isVaultUnlocked: boolean;
  isVaultLoading: boolean;
  unlockVault: (passphrase: string) => Promise<void>;
  lockVault: () => void;
}

interface VaultSettings {
  salt: string;
  verifier: string | null;
  verifier_iv: string | null;
}

const VaultContext = createContext<VaultContextValue | null>(null);

// This known value is encrypted with the derived key.
// It is never stored as plaintext in the database.
const VERIFIER_MARKER = "droply-vault-verification-v1";

export function VaultProvider({ children }: { children: ReactNode }) {
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const [isVaultLoading, setIsVaultLoading] = useState(false);

  const lockVault = useCallback(() => {
    setVaultKey(null);
  }, []);

  const unlockVault = useCallback(async (passphrase: string) => {
    if (passphrase.length < 12) {
      throw new Error("Use a vault passphrase of at least 12 characters.");
    }

    setIsVaultLoading(true);
    setVaultKey(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Sign in before unlocking your vault.");
      }

      const { data: settings, error: settingsError } = await supabase
        .from("vault_settings")
        .select("salt, verifier, verifier_iv")
        .eq("user_id", user.id)
        .maybeSingle();

      if (settingsError) {
        throw new Error(
          `Could not load vault settings: ${settingsError.message}`,
        );
      }

      let salt: string;
      let key: CryptoKey;

      if (!settings) {
        // Initialize a new vault with a fresh random salt.
        salt = generateVaultSalt();
        key = await deriveVaultKey(passphrase, salt);

        const encryptedVerifier = await encryptText(VERIFIER_MARKER, key);

        const { error: insertError } = await supabase
          .from("vault_settings")
          .insert({
            user_id: user.id,
            salt,
            verifier: encryptedVerifier.ciphertext,
            verifier_iv: encryptedVerifier.iv,
          });

        if (insertError) {
          throw new Error(
            "Could not initialize the vault. Refresh and try again.",
          );
        }

        setVaultKey(key);
        return;
      }

      const vaultSettings = settings as VaultSettings;
      salt = vaultSettings.salt;
      key = await deriveVaultKey(passphrase, salt);

      if (!vaultSettings.verifier || !vaultSettings.verifier_iv) {
        // Older versions saved only a salt. Never silently reset the
        // passphrase if encrypted messages already exist.
        const { data: encryptedMessages, error: messagesError } = await supabase
          .from("files")
          .select("id")
          .eq("user_id", user.id)
          .eq("encryption_version", 1)
          .limit(1);

        if (messagesError) {
          throw new Error(
            `Could not check existing encrypted messages: ${messagesError.message}`,
          );
        }

        if (encryptedMessages && encryptedMessages.length > 0) {
          throw new Error(
            "Vault verification is missing but encrypted messages exist. Do not reset the passphrase; recovery is required.",
          );
        }

        // Safe to initialize verification only when no version-1
        // encrypted messages exist for this account.
        const encryptedVerifier = await encryptText(VERIFIER_MARKER, key);

        const { data: updatedSettings, error: updateError } = await supabase
          .from("vault_settings")
          .update({
            verifier: encryptedVerifier.ciphertext,
            verifier_iv: encryptedVerifier.iv,
          })
          .eq("user_id", user.id)
          .select("user_id")
          .single();

        if (updateError || !updatedSettings) {
          throw new Error(
            "Could not initialize vault verification. Check your Supabase UPDATE policy and try again.",
          );
        }

        setVaultKey(key);
        return;
      }

      // A wrong passphrase derives a different key. AES-GCM
      // authentication fails when decrypting the verifier.
      let marker: string;

      try {
        marker = await decryptText(
          vaultSettings.verifier,
          vaultSettings.verifier_iv,
          key,
        );
      } catch {
        throw new Error("Incorrect vault passphrase.");
      }

      if (marker !== VERIFIER_MARKER) {
        throw new Error("Incorrect vault passphrase.");
      }

      setVaultKey(key);
    } finally {
      setIsVaultLoading(false);
    }
  }, []);

  return (
    <VaultContext.Provider
      value={{
        vaultKey,
        isVaultUnlocked: vaultKey !== null,
        isVaultLoading,
        unlockVault,
        lockVault,
      }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);

  if (!context) {
    throw new Error("useVault must be used inside VaultProvider.");
  }

  return context;
}
