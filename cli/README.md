# DROPly CLI

A command-line client for the DROPly cloud file storage system.

It uses the same Supabase Auth, `files` metadata table, and private `files`
Storage bucket as the DROPly web application.

## 1. Install

```cmd
npm install
```

## 2. Configure Supabase

Create `.env` in this folder:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
DROPly_STORAGE_BUCKET=files
```

Use the same values as the web application.

## 3. Run

```cmd
npm run dev
```

## Commands

```text
login
logout
whoami

ls
upload <local-file>
download <file> [destination]
cat <file>
rm <file>
rename <old> <new>

help
clear
exit
```

## Examples

```text
droply> login
droply> ls
droply> upload ./report.pdf
droply> download report.pdf
droply> download report.pdf ./downloads/report.pdf
droply> cat notes.txt
droply> rename old.txt new.txt
droply> rm old.txt
```

## Authentication

The CLI authenticates with Supabase Auth using the user's email/password.

The Supabase session is persisted locally under:

```text
~/.droply/session.json
```

The password is never stored by the CLI.

## Storage model

Files are stored under:

```text
<user-id>/<random-id>-<filename>
```

Metadata is stored in:

```text
public.files
```

The CLI relies on Supabase RLS and Storage policies to restrict access to
the authenticated user's files.

## Build

```cmd
npm run build
npm start
```

To install the built CLI globally from this folder:

```cmd
npm install -g .
```

Then:

```cmd
droply
```

## Important

Do NOT commit `.env`.

Do NOT use a Supabase service-role key in the CLI.
Use only the public anon/publishable key.
