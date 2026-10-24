# Droply 🚀

[![GitHub stars](https://img.shields.io/github/stars/your-username/droply?style=social)](https://github.com/your-username/droply/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/your-username/droply?style=social)](https://github.com/your-username/droply/network/members)
[![GitHub issues](https://img.shields.io/github/issues/your-username/droply)](https://github.com/your-username/droply/issues)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Status](https://img.shields.io/badge/status-active-brightgreen)

**A lightweight file vault with client-side encrypted text storage.**

Droply is a web application for uploading, accessing, and managing files from anywhere after authentication. It also supports encrypted text records, allowing users to protect stored messages with a separate vault passphrase.

No unnecessary complexity. Just your files, your data, and an extra layer of privacy.

---

## Features ✨

- 🔐 User authentication with Supabase
- 📂 Upload, preview, and download files
- 🗃️ Personal file vault backed by Supabase Storage
- 📝 Store text messages as encrypted records
- 🔒 Client-side text encryption using AES-256-GCM
- 🔑 Separate vault passphrase, independent of account login
- 🧂 PBKDF2-based encryption key derivation with a per-user salt
- 🌐 Access your encrypted records across devices using your vault passphrase
- 🛡️ Passphrase verification before unlocking an initialized vault
- 🗑️ Delete stored files and text records
- 🖥️ Terminal-inspired interface with a Mission Impossible aesthetic
- 🤖 AI chatbot integration, where configured

## Encryption & Security 🔒

Droply implements **client-side encryption for text records**. Text is encrypted in the browser before it is sent to the API, so the API receives ciphertext rather than the original message.

### Encryption workflow

1. **Vault passphrase:** The user supplies a separate passphrase to unlock the encryption vault.
2. **Salt generation:** A random salt is generated when the vault is initialized and stored in Supabase.
3. **Key derivation:** PBKDF2 with SHA-256 derives an encryption key from the passphrase and stored salt.
4. **Encryption:** Text is encrypted in the browser using AES-256-GCM with a fresh, random initialization vector (IV) for each message.
5. **Storage:** The encrypted text, IV, and encryption version are stored in the database.
6. **Decryption:** When a user previews a supported encrypted text record, the browser decrypts it using the key held in memory.

### Cryptographic components

| Component                     | Purpose                                                        |
| ----------------------------- | -------------------------------------------------------------- |
| AES-256-GCM                   | Authenticated encryption of text records                       |
| PBKDF2 + SHA-256              | Derives an encryption key from the vault passphrase            |
| 600,000 PBKDF2 iterations     | Increases the cost of passphrase guessing                      |
| Random 16-byte salt           | Makes key derivation unique to the vault                       |
| Random 12-byte IV             | Provides a fresh nonce for each encryption operation           |
| AES-GCM authentication tag    | Detects ciphertext tampering or an incorrect key               |
| Encrypted verification record | Checks whether the supplied passphrase derives the correct key |

The cryptographic operations use the browser's Web Crypto API.

### Key management

- The vault passphrase is separate from the user's Supabase account password.
- The derived encryption key is held in application memory while the vault is unlocked.
- The passphrase and derived encryption key are not intentionally stored in Supabase.
- The salt and encrypted verification record are stored in the `vault_settings` table.
- A user must use the same vault passphrase to derive the correct key on another device.
- Locking the vault clears the key from React state. This does not guarantee removal of every copy from browser or JavaScript memory.

### What is encrypted?

**Currently encrypted:**

- Text message content stored in the `files.texting` column for newly encrypted records.

**Not currently encrypted by this feature:**

- Uploaded files in Supabase Storage.
- File names, file sizes, MIME types, timestamps, and other database metadata.
- Vault configuration metadata, including the salt and encrypted verifier.

Supabase authentication, Row Level Security, and storage access policies should also be configured correctly. Encryption does not replace authorization.

### Security considerations ⚠️

- **Protect your passphrase.** If you lose it, the application cannot derive the original key to decrypt your messages.
- **Use a strong, unique passphrase.** A minimum length of 12 characters is enforced by the current vault flow; a longer passphrase is recommended.
- **No automatic recovery:** There is no recovery mechanism that can reconstruct a lost encryption key from the ciphertext.
- **Client-side compromise:** Malicious scripts, cross-site scripting (XSS), browser extensions, or a compromised device may access plaintext while the vault is unlocked.
- **Transport security:** Use HTTPS in production.
- **Legacy records:** Previously stored plaintext messages are not automatically encrypted by the new encryption flow and require a separate migration.
- **File encryption is separate:** Uploading a file does not currently encrypt its contents with the vault key.

The encryption design aims to keep message plaintext and the derived encryption key out of the database and API request payload. It does not guarantee security against a compromised client or incorrectly configured backend permissions.

---

## Tech Stack 🛠️

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Authentication:** Supabase Auth
- **Database:** Supabase PostgreSQL
- **File storage:** Supabase Storage
- **API:** Next.js Route Handlers
- **Cryptography:** Web Crypto API — AES-GCM and PBKDF2
- **AI chatbot:** DeepSeek API, where configured
- **Deployment:** Compatible with supported Next.js hosting platforms

---

## Getting Started ⚡

### 1. Clone the repository

```bash
git clone https://github.com/your-username/droply.git
cd droply
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Add any other environment variables required by your configured integrations, such as the AI chatbot.

**Never expose Supabase service-role keys or private API secrets through `NEXT_PUBLIC_` variables.**

### 4. Configure Supabase

In your Supabase project:

1. Configure authentication for your application.
2. Create the `files` table and its required columns.
3. Create a Storage bucket named `files`.
4. Configure appropriate Row Level Security policies for database access.
5. Create the `vault_settings` table with its `salt`, `verifier`, and `verifier_iv` columns.
6. Add the `encryption_iv` and `encryption_version` columns to `files`.
7. Configure policies so users can access only their own records and files.

Apply the database migrations provided by the project. Do not expose service-role credentials to the client.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Check the project's `package.json` for the available scripts.

---

## How to Use 🔑

1. Sign up or log in to Droply.
2. Upload files through the file vault.
3. Open the Documents section and initialize or unlock the encryption vault.
4. Choose a strong vault passphrase and keep it safe.
5. Send text through the message interface; the browser encrypts it before submission.
6. Open the file vault and preview encrypted text records to decrypt them locally.
7. Lock the vault when finished.

Keep your vault passphrase separate from your account password.

---

## Future Improvements 🚧

- 🔐 Client-side encryption for uploaded files
- ⏳ Automatic file expiration and cleanup
- 🔔 Expiry notifications
- 🔑 Secure vault recovery options that do not compromise encryption
- 🧪 Automated encryption and decryption tests
- 🛡️ Additional security hardening and audit logging
- 📱 Improved mobile experience
- 🤖 Enhanced AI chatbot customization

---

## License 📄

This project is licensed under the [MIT License](LICENSE).

---

## Author 👨‍💻

Developed by **Md Sayan Akram**.

_Caffeine and Code Forever ✨_
