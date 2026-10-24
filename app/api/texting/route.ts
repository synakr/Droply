import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    const token = authorization?.match(/^Bearer (.+)$/i)?.[1];

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Supabase configuration is missing." },
        { status: 500 },
      );
    }

    // Use the caller's token so Supabase RLS applies.
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Invalid or expired session." },
        { status: 401 },
      );
    }

    const body = await request.json();

    // The client must encrypt the message before calling this endpoint.
    const ciphertext =
      typeof body.ciphertext === "string" ? body.ciphertext : "";
    const iv = typeof body.iv === "string" ? body.iv : "";

    if (!ciphertext || !iv) {
      return NextResponse.json(
        { error: "Encrypted text and IV are required." },
        { status: 400 },
      );
    }

    // AES-GCM output is Base64. Enforce reasonable input limits.
    if (ciphertext.length > 200_000 || iv.length > 100) {
      return NextResponse.json(
        { error: "Encrypted payload exceeds the allowed limit." },
        { status: 413 },
      );
    }

    // Validate Base64 syntax before storing.
    const isBase64 = (value: string) =>
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
        value,
      );

    if (!isBase64(ciphertext) || !isBase64(iv)) {
      return NextResponse.json(
        { error: "Invalid encryption payload." },
        { status: 400 },
      );
    }

    // AES-GCM uses a 12-byte IV. The tag is included in ciphertext.
    if (Buffer.from(iv, "base64").length !== 12) {
      return NextResponse.json(
        { error: "Invalid encryption IV." },
        { status: 400 },
      );
    }

    const encryptedBytes = Buffer.from(ciphertext, "base64");

    // Minimum 16 bytes for the AES-GCM authentication tag.
    if (encryptedBytes.length < 16) {
      return NextResponse.json(
        { error: "Invalid encrypted payload." },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("files")
      .insert({
        user_id: user.id,
        name: crypto.randomUUID(),
        texting: ciphertext,
        encryption_iv: iv,
        encryption_version: 1,
        storage_path: null,
        mime_type: "chat",
        size: encryptedBytes.length,
      })
      .select("id, name, created_at")
      .single();

    if (error) {
      console.error("Encrypted text save failed:", error.message);

      return NextResponse.json(
        { error: "Could not save encrypted text." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, file: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
