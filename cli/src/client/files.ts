import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { supabase, BUCKET } from "./supabase.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export interface StoredFile {
  id: string;
  user_id: string;
  name: string;
  storage_path: string;
  mime_type: string | null;
  size: number | null;
  created_at: string;
}

/* ---------------------------------- */
/* Helpers                            */
/* ---------------------------------- */

function guessMimeType(fileName: string): string {
  const extension = path.extname(fileName).toLowerCase();

  const mimeTypes: Record<string, string> = {
    ".txt": "text/plain",
    ".json": "application/json",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".zip": "application/zip",
    ".csv": "text/csv",
    ".md": "text/markdown",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".ts": "text/typescript",
  };

  return mimeTypes[extension] ?? "application/octet-stream";
}

export function formatSize(bytes: number | null): string {
  if (bytes === null) return "UNKNOWN";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/* ---------------------------------- */
/* List Files                         */
/* ---------------------------------- */

export async function listFiles(): Promise<StoredFile[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You are not authenticated.");
  }

  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  return data as StoredFile[];
}

/* ---------------------------------- */
/* Upload File                        */
/* ---------------------------------- */

export async function uploadFile(localPath: string): Promise<StoredFile> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You are not authenticated. Run 'login' first.");
  }

  const resolvedPath = path.resolve(localPath);

  let stats;

  try {
    stats = await fs.stat(resolvedPath);
  } catch {
    throw new Error(`File not found: ${resolvedPath}`);
  }

  if (!stats.isFile()) {
    throw new Error(`Not a file: ${resolvedPath}`);
  }

  /* 5 MB client-side limit */
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum allowed size is 5 MB.`);
  }

  const fileName = path.basename(resolvedPath);
  const fileBuffer = await fs.readFile(resolvedPath);

  const mimeType = guessMimeType(fileName);

  /*
   * Random UUID prevents filename collisions.
   *
   * Storage path:
   * <user-id>/<uuid>-<original-filename>
   */
  const storagePath = `${user.id}/${crypto.randomUUID()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  /* ---------------------------------- */
  /* Save metadata                       */
  /* ---------------------------------- */

  const { data, error: metadataError } = await supabase
    .from("files")
    .insert({
      user_id: user.id,
      name: fileName,
      storage_path: storagePath,
      mime_type: mimeType,
      size: stats.size,
    })
    .select()
    .single();

  /*
   * If metadata insertion fails,
   * remove the uploaded object so we don't
   * leave an orphaned file in Storage.
   */
  if (metadataError) {
    await supabase.storage.from(BUCKET).remove([storagePath]);

    throw new Error(
      `File uploaded but metadata save failed: ${metadataError.message}`,
    );
  }

  return data as StoredFile;
}

/* ---------------------------------- */
/* Download File                      */
/* ---------------------------------- */

export async function downloadFile(
  file: StoredFile,
  destination?: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(file.storage_path);

  if (error) {
    throw new Error(`Download failed: ${error.message}`);
  }

  const outputPath = path.resolve(destination ?? file.name);

  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(outputPath, buffer);

  return outputPath;
}

/* ---------------------------------- */
/* Delete File                        */
/* ---------------------------------- */

export async function deleteFile(file: StoredFile): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([file.storage_path]);

  if (storageError) {
    throw new Error(`Failed to delete storage object: ${storageError.message}`);
  }

  const { error: metadataError } = await supabase
    .from("files")
    .delete()
    .eq("id", file.id);

  if (metadataError) {
    throw new Error(
      `File removed from storage but metadata deletion failed: ${metadataError.message}`,
    );
  }
}

/* ---------------------------------- */
/* Read Text File                     */
/* ---------------------------------- */

export async function readTextFile(file: StoredFile): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(file.storage_path);

  if (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }

  return await data.text();
}

/* ---------------------------------- */
/* Rename File                        */
/* ---------------------------------- */

export async function renameFile(
  file: StoredFile,
  newName: string,
): Promise<StoredFile> {
  const cleanName = path.basename(newName).trim();

  if (!cleanName) {
    throw new Error("New filename cannot be empty.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You are not authenticated.");
  }

  /* Download old object */
  const { data: oldData, error: downloadError } = await supabase.storage
    .from(BUCKET)
    .download(file.storage_path);

  if (downloadError) {
    throw new Error(`Failed to read existing file: ${downloadError.message}`);
  }

  /* Create new storage path */
  const newStoragePath = `${user.id}/${crypto.randomUUID()}-${cleanName}`;

  const arrayBuffer = await oldData.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  /* Upload renamed object */
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(newStoragePath, buffer, {
      contentType: file.mime_type ?? guessMimeType(cleanName),
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to rename file: ${uploadError.message}`);
  }

  /* Update metadata */
  const { data, error: metadataError } = await supabase
    .from("files")
    .update({
      name: cleanName,
      storage_path: newStoragePath,
      mime_type: file.mime_type ?? guessMimeType(cleanName),
    })
    .eq("id", file.id)
    .select()
    .single();

  if (metadataError) {
    /*
     * Cleanup new object if metadata update fails.
     */
    await supabase.storage.from(BUCKET).remove([newStoragePath]);

    throw new Error(`Rename metadata update failed: ${metadataError.message}`);
  }

  /* Remove old object */
  const { error: removeError } = await supabase.storage
    .from(BUCKET)
    .remove([file.storage_path]);

  if (removeError) {
    console.warn(
      `Warning: renamed file but failed to remove old object: ${removeError.message}`,
    );
  }

  return data as StoredFile;
}

/* ---------------------------------- */
/* Find File                          */
/* ---------------------------------- */

export async function findFile(nameOrId: string): Promise<StoredFile | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You are not authenticated.");
  }

  const value = nameOrId.trim();

  if (!value) {
    return null;
  }

  /*
   * Only query the UUID column when the input
   * is actually a valid UUID.
   */
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(value)) {
    const { data: byId, error: idError } = await supabase
      .from("files")
      .select("*")
      .eq("id", value)
      .eq("user_id", user.id)
      .maybeSingle();

    if (idError) {
      throw new Error(`Failed to find file: ${idError.message}`);
    }

    if (byId) {
      return byId as StoredFile;
    }
  }

  /*
   * Otherwise search by filename.
   */
  const { data: byName, error: nameError } = await supabase
    .from("files")
    .select("*")
    .eq("name", value)
    .eq("user_id", user.id)
    .maybeSingle();

  if (nameError) {
    throw new Error(`Failed to find file: ${nameError.message}`);
  }

  return (byName as StoredFile | null) ?? null;
}
