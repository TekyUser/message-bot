# Messenger Bot Admin Panel

This adds an admin panel for managing Messenger keyword/response rules.

## Features

- `/admin/login` admin login
- `/admin` rule management
- Add keyword + response
- Edit rules
- Enable/disable rules
- Delete rules
- Messenger webhook reads rules from Supabase
- Case-insensitive exact keyword matching
- Ignores Messenger echo events

## 1. Install

This project expects an existing Next.js app.

Install no extra npm package for this implementation. It uses the Supabase REST API directly.

Make sure your existing app has the `@/*` import alias pointing to the project root (the default Next.js setup usually does).

## 2. Supabase

Create a Supabase project.

Open:

Supabase Dashboard -> SQL Editor

Run `supabase/schema.sql`.

Then copy your project URL and service-role key.

IMPORTANT: `SUPABASE_SERVICE_ROLE_KEY` must only exist as a server-side environment variable. Never expose it in client code.

## 3. Environment variables

Add these to Vercel:

SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
META_VERIFY_TOKEN
META_PAGE_ACCESS_TOKEN
META_GRAPH_API_VERSION

Use the current Graph API version shown for your Meta app for `META_GRAPH_API_VERSION`.

Example:

META_GRAPH_API_VERSION=vXX.X

Do not copy the example version literally.

## 4. Copy files

Copy the `app`, `lib`, and `supabase` folders into your existing Next.js project.

The new webhook replaces your existing `app/api/webhook/route.ts`.

## 5. Run locally

npm run dev

Open:

http://localhost:3000/admin/login

Log in with `ADMIN_PASSWORD`.

## 6. Deploy

Commit/push to GitHub and deploy to Vercel.

Then open:

https://YOUR-DOMAIN.vercel.app/admin/login

Add:

Keyword:
secret

Response:
ive spent 18 hours to do this

Send `secret` to the Page.

The webhook will query Supabase and automatically send the stored response.

## Important

Do not put Meta access tokens or the Supabase service-role key into client-side code.

The admin panel API is protected by an HTTP-only session cookie.
