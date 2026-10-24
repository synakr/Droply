"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { decryptText } from "@/lib/crypto/vault";

interface StoredFile {
  id: string;
  user_id: string;
  name: string;
  storage_path: string | null;
  mime_type: string | null;
  size: number | null;
  texting: string | null;
  encryption_iv: string | null;
  encryption_version: number | null;
  created_at: string;
}

interface PreviewFile {
  file: StoredFile;
  url: string;
}

interface FilesPageProps {
  userId: string;
  vaultKey: CryptoKey | null;
}

const formatFileSize = (size: number | null) => {
  if (size === null || size === undefined) return "N/A";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date: string) =>
  new Date(date).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });

const isChatRecord = (file: StoredFile) => file.mime_type === "chat";

const isPreviewable = (file: StoredFile) =>
  isChatRecord(file) ||
  Boolean(file.mime_type?.startsWith("image/")) ||
  file.mime_type === "application/pdf";

const fetchFiles = (userId: string) =>
  supabase
    .from("files")
    .select(
      "id, user_id, name, storage_path, mime_type, size, texting, encryption_iv, encryption_version, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

export const FilesPage: React.FC<FilesPageProps> = ({ userId, vaultKey }) => {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [busyFileId, setBusyFileId] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);
  const [preview, setPreview] = useState<PreviewFile | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);

      const { data, error } = await fetchFiles(userId);

      if (!isMounted) return;

      if (error) {
        setStatus({
          text: `FILE INDEX ERROR: ${error.message}`.toUpperCase(),
          isError: true,
        });
      } else {
        setFiles((data ?? []) as StoredFile[]);
      }

      setIsLoading(false);
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const refreshFiles = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await fetchFiles(userId);

      if (error) {
        setStatus({
          text: `FILE INDEX ERROR: ${error.message}`.toUpperCase(),
          isError: true,
        });
      } else {
        setFiles((data ?? []) as StoredFile[]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setIsUploading(true);
    setStatus(null);

    try {
      // Avoid collisions when two files have the same name.
      const storagePath = `${userId}/${crypto.randomUUID()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("files")
        .upload(storagePath, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`UPLOAD FAILED: ${uploadError.message}`);
      }

      const { error: metadataError } = await supabase.from("files").insert({
        user_id: userId,
        name: file.name,
        storage_path: storagePath,
        mime_type: file.type || "application/octet-stream",
        size: file.size,
      });

      if (metadataError) {
        // Roll back the uploaded object if metadata creation fails.
        await supabase.storage.from("files").remove([storagePath]);
        throw new Error(`METADATA WRITE FAILED: ${metadataError.message}`);
      }

      setStatus({ text: "FILE UPLOADED.", isError: false });
      await refreshFiles();
    } catch (error) {
      setStatus({
        text: (error instanceof Error
          ? error.message
          : "UPLOAD FAILED."
        ).toUpperCase(),
        isError: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const createSignedUrl = async (file: StoredFile) => {
    if (!file.storage_path) {
      setStatus({
        text: "THIS RECORD HAS NO STORAGE FILE.",
        isError: true,
      });
      return null;
    }

    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(file.storage_path, 60 * 60);

    if (error || !data?.signedUrl) {
      setStatus({
        text: `SIGNED URL ERROR: ${
          error?.message ?? "URL NOT CREATED"
        }`.toUpperCase(),
        isError: true,
      });
      return null;
    }

    return data.signedUrl;
  };

  const handlePreview = async (file: StoredFile) => {
    if (!isPreviewable(file)) return;

    setStatus(null);

    if (isChatRecord(file)) {
      // Open synchronously before awaiting decryption to avoid popup blockers.
      const popup = window.open("", "_blank");

      if (!popup) {
        setStatus({
          text: "POPUP BLOCKED. ALLOW POPUPS AND TRY AGAIN.",
          isError: true,
        });
        return;
      }

      popup.opener = null;

      const doc = popup.document;
      doc.title = file.name || "Chat Record";

      const loading = doc.createElement("p");
      loading.textContent = "DECRYPTING MESSAGE...";
      doc.body.replaceChildren(loading);

      try {
        if (!vaultKey) {
          throw new Error("Unlock your vault before previewing messages.");
        }

        if (
          file.encryption_version !== 1 ||
          !file.encryption_iv ||
          !file.texting
        ) {
          throw new Error(
            "This record is not a supported encrypted message. Legacy plaintext records need migration.",
          );
        }

        // Decryption happens locally. Plaintext is never sent to the API.
        const plaintext = await decryptText(
          file.texting,
          file.encryption_iv,
          vaultKey,
        );

        if (popup.closed) return;

        doc.title = file.name || "Chat Record";
        doc.head.replaceChildren();
        doc.body.replaceChildren();

        const style = doc.createElement("style");
        style.textContent = `
          body {
            margin: 0;
            padding: 24px;
            background: #050505;
            color: #00ff00;
            font-family: monospace;
          }
          h2 {
            overflow-wrap: anywhere;
            border-bottom: 1px solid #00ff00;
            padding-bottom: 12px;
          }
          pre {
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            line-height: 1.6;
            font-size: 14px;
          }
        `;

        const heading = doc.createElement("h2");
        heading.textContent = file.name || "CHAT RECORD";

        const content = doc.createElement("pre");
        content.textContent = plaintext;

        doc.head.appendChild(style);
        doc.body.append(heading, content);
      } catch (error) {
        if (!popup.closed) popup.close();

        setStatus({
          text: `DECRYPTION FAILED: ${
            error instanceof Error ? error.message : "UNKNOWN ERROR"
          }`.toUpperCase(),
          isError: true,
        });
      }

      return;
    }

    setBusyFileId(file.id);

    try {
      const signedUrl = await createSignedUrl(file);

      if (signedUrl) {
        setPreview({ file, url: signedUrl });
      }
    } finally {
      setBusyFileId(null);
    }
  };

  const handleDownload = async (file: StoredFile) => {
    if (isChatRecord(file) || !file.storage_path) {
      setStatus({
        text: "DOWNLOAD IS NOT AVAILABLE FOR TEXT RECORDS.",
        isError: true,
      });
      return;
    }

    setBusyFileId(file.id);
    setStatus(null);

    try {
      const signedUrl = await createSignedUrl(file);

      if (!signedUrl) return;

      const link = document.createElement("a");
      link.href = signedUrl;
      link.download = file.name;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.click();
    } finally {
      setBusyFileId(null);
    }
  };

  const handleDelete = async (file: StoredFile) => {
    if (!window.confirm(`DELETE ${file.name}?`)) return;

    setBusyFileId(file.id);
    setStatus(null);

    try {
      if (file.storage_path) {
        const { error: storageError } = await supabase.storage
          .from("files")
          .remove([file.storage_path]);

        if (storageError) {
          throw new Error(`DELETE FAILED: ${storageError.message}`);
        }
      }

      const { error: metadataError } = await supabase
        .from("files")
        .delete()
        .eq("id", file.id)
        .eq("user_id", userId);

      if (metadataError) {
        throw new Error(`INDEX DELETE FAILED: ${metadataError.message}`);
      }

      setFiles((currentFiles) =>
        currentFiles.filter((currentFile) => currentFile.id !== file.id),
      );

      if (preview?.file.id === file.id) {
        setPreview(null);
      }

      setStatus({ text: "FILE DELETED.", isError: false });
    } catch (error) {
      setStatus({
        text: (error instanceof Error
          ? error.message
          : "DELETE FAILED."
        ).toUpperCase(),
        isError: true,
      });
    } finally {
      setBusyFileId(null);
    }
  };

  return (
    <div className="flex-1 min-h-0 p-3 overflow-y-auto glow-border font-mono text-[#00ff00]">
      <div className="flex flex-col gap-3 min-h-full">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg">SECURE FILE VAULT</p>
            <p className="text-xs text-[#00ff00]/70">
              PRIVATE STORAGE // USER CHANNEL
            </p>
          </div>

          <>
            <input
              ref={inputRef}
              type="file"
              onChange={handleUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="p-2 bg-black text-[#00ff00] border border-[#00ff00] shadow-[0_0_5px_#00ff00] font-mono cursor-pointer active:bg-[#00ff00] active:text-black transition-colors disabled:cursor-wait disabled:opacity-60">
              {isUploading ? "UPLOADING..." : "UPLOAD FILE"}
            </button>
          </>
        </div>

        {isLoading && <p>LOADING FILE INDEX...</p>}

        {!isLoading && files.length === 0 && (
          <div className="flex-1 min-h-40 flex items-center justify-center border border-[#00ff00]/50 text-[#00ff00]/70">
            NO FILES ON RECORD. UPLOAD A FILE TO BEGIN.
          </div>
        )}

        {!isLoading && files.length > 0 && (
          <div className="flex flex-col gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="border border-[#00ff00]/70 p-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-lg">{file.name}</p>

                  <p className="text-xs text-[#00ff00]/70">
                    {file.mime_type || "UNKNOWN TYPE"} {" // "}
                    {formatFileSize(file.size)} {" // "}
                    {formatDate(file.created_at)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  {isPreviewable(file) && (
                    <button
                      type="button"
                      onClick={() => void handlePreview(file)}
                      disabled={busyFileId === file.id}
                      className="px-2 py-1 border border-[#00ff00] text-[#00ff00] cursor-pointer hover:bg-[#00ff00] hover:text-black disabled:cursor-wait disabled:opacity-60">
                      PREVIEW
                    </button>
                  )}

                  {!isChatRecord(file) && file.storage_path && (
                    <button
                      type="button"
                      onClick={() => void handleDownload(file)}
                      disabled={busyFileId === file.id}
                      className="px-2 py-1 border border-[#00ff00] text-[#00ff00] cursor-pointer hover:bg-[#00ff00] hover:text-black disabled:cursor-wait disabled:opacity-60">
                      DOWNLOAD
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleDelete(file)}
                    disabled={busyFileId === file.id}
                    className="px-2 py-1 border border-red-600 text-red-500 cursor-pointer hover:bg-red-600 hover:text-black disabled:cursor-wait disabled:opacity-60">
                    DELETE
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {status && (
          <div
            role="status"
            className={`p-2 text-center border shadow-[0_0_5px] ${
              status.isError
                ? "border-red-600 text-red-500 shadow-red-600"
                : "border-[#00ff00] text-[#00ff00] shadow-[#00ff00]"
            }`}>
            {status.text}
          </div>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-10 bg-black/90 p-4 flex items-center justify-center">
          <div className="w-full max-w-4xl h-full max-h-[85vh] border border-[#00ff00] shadow-[0_0_10px_#00ff00] bg-black p-2 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate">PREVIEW: {preview.file.name}</p>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="px-2 py-1 border border-[#00ff00] cursor-pointer hover:bg-[#00ff00] hover:text-black">
                CLOSE
              </button>
            </div>

            <div className="flex-1 min-h-0 flex items-center justify-center overflow-auto border border-[#00ff00]/50 p-2">
              {preview.file.mime_type?.startsWith("image/") ? (
                <img
                  src={preview.url}
                  alt={preview.file.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <iframe
                  src={preview.url}
                  title={preview.file.name}
                  className="w-full h-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
