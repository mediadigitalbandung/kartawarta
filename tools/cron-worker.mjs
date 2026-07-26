/**
 * Kartawarta — Internal Cron Worker (PM2 process: kartawarta-cron-worker)
 * Automatically triggers internal cron endpoints (auto-article, sorotan, etc.)
 * every 60 seconds so the site generates auto-articles without requiring Linux crontab setup.
 */

import path from "node:path";

try {
  process.loadEnvFile(path.join(process.cwd(), ".env"));
} catch {
  /* rely on exported env */
}

const APP_URL = (process.env.APP_URL || "http://127.0.0.1:3000").replace(/\/+$/, "");
const CRON_SECRET = process.env.CRON_SECRET || "";
const POLL_INTERVAL_MS = 60_000; // Ping every 1 minute (route handles its own interval throttling)

console.log(`[cron-worker] Starting Kartawarta Cron Worker for ${APP_URL}`);

async function pingCron(endpoint) {
  try {
    const url = `${APP_URL}${endpoint}`;
    const headers = { "Content-Type": "application/json" };
    if (CRON_SECRET) {
      headers["Authorization"] = `Bearer ${CRON_SECRET}`;
    }
    const res = await fetch(url, { method: "POST", headers });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.created > 0) {
      console.log(`[cron-worker] ${endpoint} produced ${json.created} item(s):`, json.articles || json);
    }
  } catch (err) {
    /* Non-critical background ping error */
  }
}

async function tick() {
  await pingCron("/api/cron/auto-article");
  await pingCron("/api/cron/sorotan");
}

// Run initial tick after 10s warmup, then every 60s
setTimeout(() => {
  tick();
  setInterval(tick, POLL_INTERVAL_MS);
}, 10_000);
