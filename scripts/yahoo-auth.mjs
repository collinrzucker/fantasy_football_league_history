#!/usr/bin/env node
// Yahoo OAuth2 helper for pulling Fantasy Sports league data.
//
// Step 1: node scripts/yahoo-auth.mjs url
//         -> prints an authorization URL. Open it, log in, approve.
//         Yahoo redirects to the (dead) redirect URI with ?code=XXXX in
//         the address bar -- copy that code.
//
// Step 2: node scripts/yahoo-auth.mjs exchange <code>
//         -> exchanges the code for access + refresh tokens, saves them
//         to .env.local (gitignored).
//
// Step 3 (later, tokens expire in ~1hr): node scripts/yahoo-auth.mjs refresh
//         -> uses the saved refresh token to get a fresh access token.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

function loadEnv() {
  const env = {};
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) env[m[1]] = m[2];
    }
  }
  return env;
}

function saveEnv(updates) {
  const env = { ...loadEnv(), ...updates };
  const text = Object.entries(env)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n") + "\n";
  fs.writeFileSync(envPath, text);
}

const AUTH_URL = "https://api.login.yahoo.com/oauth2/request_auth";
const TOKEN_URL = "https://api.login.yahoo.com/oauth2/get_token";

async function main() {
  const [, , cmd, arg] = process.argv;
  const env = loadEnv();

  if (cmd === "url") {
    const url = new URL(AUTH_URL);
    url.searchParams.set("client_id", env.YAHOO_CLIENT_ID);
    url.searchParams.set("redirect_uri", env.YAHOO_REDIRECT_URI);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("language", "en-us");
    console.log(url.toString());
    return;
  }

  if (cmd === "exchange") {
    if (!arg) {
      console.error("Usage: node scripts/yahoo-auth.mjs exchange <code>");
      process.exit(1);
    }
    const basic = Buffer.from(
      `${env.YAHOO_CLIENT_ID}:${env.YAHOO_CLIENT_SECRET}`
    ).toString("base64");
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        redirect_uri: env.YAHOO_REDIRECT_URI,
        code: arg,
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      console.error("Token exchange failed:", body);
      process.exit(1);
    }
    saveEnv({
      YAHOO_ACCESS_TOKEN: body.access_token,
      YAHOO_REFRESH_TOKEN: body.refresh_token,
      YAHOO_TOKEN_EXPIRES_AT: String(Date.now() + body.expires_in * 1000),
    });
    console.log("Saved access + refresh tokens to .env.local");
    return;
  }

  if (cmd === "refresh") {
    const basic = Buffer.from(
      `${env.YAHOO_CLIENT_ID}:${env.YAHOO_CLIENT_SECRET}`
    ).toString("base64");
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        redirect_uri: env.YAHOO_REDIRECT_URI,
        refresh_token: env.YAHOO_REFRESH_TOKEN,
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      console.error("Refresh failed:", body);
      process.exit(1);
    }
    saveEnv({
      YAHOO_ACCESS_TOKEN: body.access_token,
      YAHOO_REFRESH_TOKEN: body.refresh_token ?? env.YAHOO_REFRESH_TOKEN,
      YAHOO_TOKEN_EXPIRES_AT: String(Date.now() + body.expires_in * 1000),
    });
    console.log("Refreshed access token.");
    return;
  }

  console.error("Usage: node scripts/yahoo-auth.mjs <url|exchange|refresh> [code]");
  process.exit(1);
}

main();
