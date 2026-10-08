import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { SupportedStorage } from "@supabase/supabase-js";

const dir = path.join(os.homedir(), ".droply");
const file = path.join(dir, "session.json");

const ensureDir = () => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

export const localStorage: SupportedStorage = {
  getItem(key) {
    try {
      if (!fs.existsSync(file)) return null;
      const data = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, string>;
      return data[key] ?? null;
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    ensureDir();
    let data: Record<string, string> = {};
    try {
      if (fs.existsSync(file)) {
        data = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, string>;
      }
    } catch {
      data = {};
    }
    data[key] = value;
    fs.writeFileSync(file, JSON.stringify(data, null, 2), { mode: 0o600 });
  },
  removeItem(key) {
    if (!fs.existsSync(file)) return;
    try {
      const data = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, string>;
      delete data[key];
      fs.writeFileSync(file, JSON.stringify(data, null, 2), { mode: 0o600 });
    } catch {
      // Ignore corrupted/removed local session data.
    }
  },
};

export const clearLocalSession = () => {
  try {
    if (fs.existsSync(file)) fs.rmSync(file, { force: true });
  } catch {
    // Ignore.
  }
};
