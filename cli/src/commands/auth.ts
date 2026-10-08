import type readline from "node:readline";
import { supabase } from "../client/supabase.js";
import { clearLocalSession } from "../client/session.js";

export const login = async (rl: readline.Interface) => {
  const ask = (question: string): Promise<string> =>
    new Promise((resolve) => {
      rl.question(question, resolve);
    });

  const email = (await ask("Email: ")).trim();
  const password = await ask("Password: ");

  if (!email || !password) {
    console.log("Email and password are required.");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.log(`LOGIN FAILED: ${error.message}`);
    return;
  }

  console.log(`\n✓ AUTHENTICATED AS ${data.user.email ?? data.user.id}\n`);
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log(`LOGOUT FAILED: ${error.message}`);
    return;
  }

  clearLocalSession();

  console.log("✓ LOGGED OUT");
};

export const whoami = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("NOT AUTHENTICATED");
    return;
  }

  console.log(`AUTHENTICATED: ${user.email ?? user.id}`);
};
