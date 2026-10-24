const PBKDF2_ITERATIONS = 600_000;
const AES_ALGORITHM = "AES-GCM";

function toBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

export function generateVaultSalt(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(16)));
}

export async function deriveVaultKey(
  passphrase: string,
  saltBase64: string,
): Promise<CryptoKey> {
  const passphraseBytes = new TextEncoder().encode(passphrase);

  // Copy into an ArrayBuffer-backed byte array for Web Crypto typings.
  const passphraseBuffer = new Uint8Array(passphraseBytes).buffer;

  const material = await crypto.subtle.importKey(
    "raw",
    passphraseBuffer,
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  const salt = fromBase64(saltBase64);

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    material,
    { name: AES_ALGORITHM, length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptText(
  plaintext: string,
  key: CryptoKey,
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ivBuffer = new Uint8Array(iv).buffer;
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const plaintextBuffer = new Uint8Array(plaintextBytes).buffer;

  const encrypted = await crypto.subtle.encrypt(
    { name: AES_ALGORITHM, iv: ivBuffer },
    key,
    plaintextBuffer,
  );

  return {
    ciphertext: toBase64(new Uint8Array(encrypted)),
    iv: toBase64(iv),
  };
}

export async function decryptText(
  ciphertext: string,
  ivBase64: string,
  key: CryptoKey,
): Promise<string> {
  const iv = fromBase64(ivBase64);
  const ciphertextBytes = fromBase64(ciphertext);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: AES_ALGORITHM,
      iv,
    },
    key,
    ciphertextBytes,
  );

  return new TextDecoder().decode(decrypted);
}
