// ─────────────────────────────────────────────────────────────────────────
// Kartawarta — Security Self-Audit (LOCALHOST ONLY)
//
// Paste a Kartawarta news/article link → it runs NON-DESTRUCTIVE checks to
// answer: "can someone change my article titles/content without permission?"
//
// How it works: it sends UNAUTHENTICATED requests to the article mutation
// endpoints. A correctly-secured site REJECTS them (HTTP 401/403) WITHOUT
// changing anything — so this never edits/deletes real data. It also checks
// data-leak endpoints, panel auth, security headers and cookie hygiene.
//
// This is an AUTHORIZED self-test of YOUR OWN site. Do not point it at sites
// you don't own/aren't authorized to test.
//
// Run:   node secaudit/server.mjs      then open  http://127.0.0.1:8788
// ─────────────────────────────────────────────────────────────────────────

import http from "node:http";

const PORT = 8788;
const HOST = "127.0.0.1";
const TIMEOUT_MS = 12_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probe(method, url, { body, cookie } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method,
      redirect: "manual",
      signal: ctrl.signal,
      headers: {
        "user-agent": "Kartawarta-SecAudit/1.0 (authorized self-test)",
        ...(body ? { "content-type": "application/json" } : {}),
        ...(cookie ? { cookie } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    let text = "";
    try { text = (await res.text()).slice(0, 300); } catch { /* ignore */ }
    return {
      status: res.status,
      location: res.headers.get("location") || "",
      headers: res.headers,
      setCookie: res.headers.get("set-cookie") || "",
      body: text,
    };
  } catch (e) {
    return { status: 0, error: e?.name === "AbortError" ? "timeout" : String(e?.cause?.code || e?.message || e) };
  } finally {
    clearTimeout(t);
  }
}

// status helpers
const blocked = (s) => s === 401 || s === 403;

async function runScan(rawUrl) {
  const target = new URL(rawUrl);
  if (!/^https?:$/.test(target.protocol)) throw new Error("URL harus http/https");
  const origin = target.origin;
  const articlePath = target.pathname.startsWith("/berita/") ? target.pathname : null;
  const checks = [];
  const add = (c) => checks.push(c);

  // 1. Anonymous CREATE must be blocked
  {
    const r = await probe("POST", `${origin}/api/articles`, { body: { title: "x", content: "x" } });
    add({
      id: "anon-create", sev: "CRITICAL", title: "Buat artikel tanpa login",
      result: blocked(r.status) ? "pass" : (r.status >= 200 && r.status < 300 ? "fail" : "warn"),
      detail: r.error ? `error: ${r.error}` : `HTTP ${r.status} — ${blocked(r.status) ? "ditolak (benar)" : "TIDAK ditolak!"}`,
    });
  }
  // 2. Anonymous EDIT (title/content) must be blocked
  {
    const r = await probe("PUT", `${origin}/api/articles/__secaudit_probe__`, { body: { title: "HACKED", content: "x".repeat(60) } });
    add({
      id: "anon-edit", sev: "CRITICAL", title: "Ubah judul/isi artikel tanpa login",
      result: blocked(r.status) ? "pass" : (r.status >= 200 && r.status < 300 ? "fail" : "warn"),
      detail: r.error ? `error: ${r.error}` : `HTTP ${r.status} — ${blocked(r.status) ? "ditolak (benar)" : r.status === 404 ? "404: auth tampaknya TIDAK dicek sebelum lookup!" : "TIDAK ditolak!"}`,
    });
  }
  // 3. Anonymous DELETE must be blocked
  {
    const r = await probe("DELETE", `${origin}/api/articles/__secaudit_probe__`);
    add({
      id: "anon-delete", sev: "CRITICAL", title: "Hapus artikel tanpa login",
      result: blocked(r.status) ? "pass" : (r.status >= 200 && r.status < 300 ? "fail" : "warn"),
      detail: r.error ? `error: ${r.error}` : `HTTP ${r.status} — ${blocked(r.status) ? "ditolak (benar)" : "TIDAK ditolak!"}`,
    });
  }
  // 4. Anonymous list (incl. drafts) must be blocked
  {
    const r = await probe("GET", `${origin}/api/articles?status=DRAFT`);
    add({
      id: "anon-list", sev: "HIGH", title: "Lihat daftar artikel/draft tanpa login",
      result: blocked(r.status) ? "pass" : (r.status === 200 ? "fail" : "warn"),
      detail: r.error ? `error: ${r.error}` : `HTTP ${r.status} — ${blocked(r.status) ? "ditolak (benar)" : r.status === 200 ? "BOCOR: data ditampilkan tanpa login!" : "tak terduga"}`,
    });
  }
  // 5. Anonymous user list must be blocked
  {
    const r = await probe("GET", `${origin}/api/users`);
    add({
      id: "anon-users", sev: "HIGH", title: "Lihat daftar pengguna tanpa login",
      result: blocked(r.status) ? "pass" : (r.status === 200 ? "fail" : "warn"),
      detail: r.error ? `error: ${r.error}` : `HTTP ${r.status} — ${blocked(r.status) ? "ditolak (benar)" : r.status === 200 ? "BOCOR: daftar user tanpa login!" : "tak terduga"}`,
    });
  }
  // 6. Panel page requires auth (redirect to /login)
  {
    const r = await probe("GET", `${origin}/panel/artikel/baru`);
    const toLogin = r.status >= 300 && r.status < 400 && /\/login/i.test(r.location);
    add({
      id: "panel-auth", sev: "MEDIUM", title: "Halaman panel butuh login",
      result: toLogin ? "pass" : (r.status === 200 ? "warn" : "warn"),
      detail: r.error ? `error: ${r.error}` : `HTTP ${r.status}${r.location ? ` → ${r.location}` : ""} — ${toLogin ? "redirect ke login (benar)" : "tidak redirect ke login (cek manual)"}`,
    });
  }
  // 7. Security headers on the article/home page
  {
    const r = await probe("GET", articlePath ? `${origin}${articlePath}` : origin);
    const h = r.headers;
    const want = {
      "strict-transport-security": "HSTS (paksa HTTPS)",
      "x-content-type-options": "anti MIME-sniff",
      "x-frame-options / CSP frame-ancestors": "anti clickjacking",
      "content-security-policy": "CSP (mitigasi XSS)",
      "referrer-policy": "Referrer-Policy",
    };
    const present = [], missing = [];
    if (h) {
      h.get("strict-transport-security") ? present.push("HSTS") : missing.push("HSTS");
      h.get("x-content-type-options") ? present.push("X-Content-Type-Options") : missing.push("X-Content-Type-Options");
      (h.get("x-frame-options") || /frame-ancestors/i.test(h.get("content-security-policy") || "")) ? present.push("anti-clickjacking") : missing.push("X-Frame-Options/frame-ancestors");
      h.get("content-security-policy") ? present.push("CSP") : missing.push("Content-Security-Policy");
      h.get("referrer-policy") ? present.push("Referrer-Policy") : missing.push("Referrer-Policy");
    }
    add({
      id: "headers", sev: "MEDIUM", title: "Header keamanan",
      result: r.error ? "warn" : (missing.length === 0 ? "pass" : missing.length >= 3 ? "fail" : "warn"),
      detail: r.error ? `error: ${r.error}` : `Ada: ${present.join(", ") || "—"}. Hilang: ${missing.join(", ") || "—"}`,
    });
  }
  // 8. Session cookie hygiene (via NextAuth csrf endpoint)
  {
    const r = await probe("GET", `${origin}/api/auth/csrf`);
    const sc = (r.setCookie || "").toLowerCase();
    const flags = [];
    if (sc) {
      if (sc.includes("httponly")) flags.push("HttpOnly");
      if (sc.includes("samesite")) flags.push("SameSite");
      if (sc.includes("secure")) flags.push("Secure");
    }
    add({
      id: "cookie", sev: "INFO", title: "Kebersihan cookie sesi",
      result: r.error ? "warn" : (sc ? (flags.includes("HttpOnly") ? "pass" : "warn") : "info"),
      detail: r.error ? `error: ${r.error}` : (sc ? `Flag: ${flags.join(", ") || "(tidak terdeteksi)"}` : "Cookie tidak terlihat pada endpoint ini"),
    });
  }
  // 9. HTTP → HTTPS redirect
  if (target.protocol === "https:") {
    const httpUrl = `http://${target.host}${articlePath || "/"}`;
    const r = await probe("GET", httpUrl);
    const toHttps = r.status >= 300 && r.status < 400 && /^https:/i.test(r.location);
    add({
      id: "https", sev: "MEDIUM", title: "Paksa HTTPS (http → https)",
      result: r.error ? "info" : (toHttps ? "pass" : "warn"),
      detail: r.error ? `error: ${r.error}` : `HTTP ${r.status}${r.location ? ` → ${r.location}` : ""} — ${toHttps ? "dialihkan ke HTTPS (benar)" : "tidak terlihat redirect (cek manual)"}`,
    });
  }
  // 10. Article page reachable
  if (articlePath) {
    const r = await probe("GET", `${origin}${articlePath}`);
    add({
      id: "article", sev: "INFO", title: "Halaman berita dapat diakses",
      result: r.status === 200 ? "pass" : "info",
      detail: r.error ? `error: ${r.error}` : `HTTP ${r.status}`,
    });
  }

  const crit = checks.filter((c) => c.sev === "CRITICAL" && c.result === "fail").length;
  const high = checks.filter((c) => c.sev === "HIGH" && c.result === "fail").length;
  const verdict = crit > 0 ? "RENTAN" : high > 0 ? "PERLU PERHATIAN" : checks.some((c) => c.result === "warn") ? "BAIK (ada catatan)" : "AMAN";
  return { origin, articlePath, verdict, checks };
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://${HOST}:${PORT}`);
  if (req.method === "GET" && u.pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(HTML);
    return;
  }
  if (req.method === "POST" && u.pathname === "/scan") {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    let url;
    try { url = JSON.parse(raw).url; } catch { url = ""; }
    try {
      const out = await runScan(url);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(out));
    } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(e?.message || e) }));
    }
    return;
  }
  res.writeHead(404); res.end("Not found");
});

server.listen(PORT, HOST, () => {
  console.log(`\n  Kartawarta Security Self-Audit — buka di browser:\n  → http://${HOST}:${PORT}\n\n  Ctrl+C untuk berhenti.\n`);
});

const HTML = `<!doctype html>
<html lang="id"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Kartawarta — Uji Keamanan</title>
<style>
  :root{--navy:#002045;--crimson:#b7102a;--bd:#c4c6d0;--muted:#74777f;--bg:#f8f9fa}
  *{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:var(--bg);color:#191c1d}
  header{background:var(--navy);color:#fff;padding:18px 24px}header h1{margin:0;font-size:18px}header p{margin:4px 0 0;font-size:13px;color:#9fb2c9}
  main{max-width:920px;margin:0 auto;padding:24px}
  .warn{background:#fff7ed;border:1px solid #fdba74;color:#9a3412;padding:12px 14px;border-radius:10px;font-size:13px;margin-bottom:18px}
  .card{background:#fff;border:1px solid var(--bd);border-radius:12px;padding:18px;margin-bottom:18px}
  label{display:block;font-size:12px;font-weight:600;color:#44474e;margin-bottom:4px}
  input[type=text]{width:100%;padding:10px 12px;border:1px solid var(--bd);border-radius:8px;font-size:14px}
  .row{display:flex;gap:10px;align-items:center;margin-top:14px;flex-wrap:wrap}
  button{border:0;border-radius:8px;padding:10px 20px;font-weight:700;font-size:14px;cursor:pointer;background:var(--navy);color:#fff}
  button:disabled{opacity:.5;cursor:not-allowed}
  .verdict{font-size:20px;font-weight:800;padding:10px 16px;border-radius:10px;display:inline-block}
  .v-AMAN,.v-BAIK{background:#dcfce7;color:#166534}.v-PERLU{background:#fef9c3;color:#854d0e}.v-RENTAN{background:#fee2e2;color:#991b1b}
  .check{display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #eee;align-items:flex-start}
  .badge{flex-shrink:0;font-size:11px;font-weight:800;padding:3px 8px;border-radius:6px;min-width:62px;text-align:center}
  .pass{background:#dcfce7;color:#166534}.fail{background:#fee2e2;color:#991b1b}.warn2{background:#fef9c3;color:#854d0e}.info{background:#e0e7ff;color:#3730a3}
  .sev{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.5px}
  .ctitle{font-weight:600;font-size:14px}.cdetail{font-size:13px;color:#44474e;margin-top:2px}
  .muted{color:var(--muted);font-size:12px}
</style></head>
<body>
<header><h1>Kartawarta — Uji Keamanan (Self-Audit)</h1>
<p>Tempel link berita Anda → cek apakah judul/isi bisa diubah orang tanpa izin. Non-destruktif (tak mengubah data).</p></header>
<main>
  <div class="warn"><b>Uji situs milik sendiri saja.</b> Tool ini hanya mengirim request <b>tanpa login</b> ke endpoint ubah/hapus —
  situs yang aman akan menolaknya (401), jadi tidak ada data yang berubah.</div>
  <div class="card">
    <label>Link berita Kartawarta</label>
    <input id="url" type="text" placeholder="https://kartawarta.com/berita/judul-artikel-anda" value="https://kartawarta.com" />
    <div class="row"><button id="scanBtn">🔎 Scan Keamanan</button><span class="muted" id="state">Siap.</span></div>
  </div>
  <div class="card" id="resultCard" style="display:none">
    <div class="row" style="justify-content:space-between;margin-top:0">
      <div><span class="muted">Verdict</span><br/><span id="verdict" class="verdict"></span></div>
      <div class="muted" id="origin"></div>
    </div>
    <div id="checks" style="margin-top:14px"></div>
  </div>
</main>
<script>
  const $=(id)=>document.getElementById(id);
  const SEVRANK={CRITICAL:0,HIGH:1,MEDIUM:2,INFO:3};
  $("scanBtn").addEventListener("click",async()=>{
    const url=$("url").value.trim();
    $("scanBtn").disabled=true;$("state").textContent="Memindai…";$("resultCard").style.display="none";
    try{
      const res=await fetch("/scan",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({url})});
      const data=await res.json();
      if(data.error){$("state").textContent="Error: "+data.error;return;}
      render(data);$("state").textContent="Selesai ✓";
    }catch(e){$("state").textContent="Gagal: "+e.message;}
    finally{$("scanBtn").disabled=false;}
  });
  function render(d){
    $("resultCard").style.display="block";
    $("origin").textContent=d.origin;
    const v=$("verdict");v.textContent=d.verdict;
    v.className="verdict v-"+(d.verdict.split(" ")[0]);
    const order=[...d.checks].sort((a,b)=>(SEVRANK[a.sev]-SEVRANK[b.sev]));
    $("checks").innerHTML=order.map(c=>{
      const cls=c.result==="pass"?"pass":c.result==="fail"?"fail":c.result==="warn"?"warn2":"info";
      const txt=c.result==="pass"?"AMAN":c.result==="fail"?"RENTAN":c.result==="warn"?"CEK":"INFO";
      return '<div class="check"><span class="badge '+cls+'">'+txt+'</span><div><div class="sev">'+c.sev+'</div><div class="ctitle">'+c.title+'</div><div class="cdetail">'+c.detail+'</div></div></div>';
    }).join("");
  }
</script>
</body></html>`;
