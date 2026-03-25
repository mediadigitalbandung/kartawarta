# CLAUDE.md - Instruksi untuk Claude Code

## Project
- **Nama:** Jurnalis Hukum Bandung v2.0
- **Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma, Supabase (PostgreSQL), NextAuth
- **Deploy:** Vercel (auto-deploy dari GitHub master)
- **Repo:** github.com/bonelade/Jurnalis-Hukum-Bandung
- **URL:** https://jurnalis-hukum-bandung.vercel.app

## Workflow: Auto Commit, Push & Deploy

**PENTING:** Setiap kali selesai melakukan perubahan kode, WAJIB langsung:

1. **Build** — `npx next build` untuk pastikan tidak ada error
2. **Stage** — `git add` file yang berubah (jangan pakai `git add -A` jika ada `.env`)
3. **Commit** — dengan pesan deskriptif dalam bahasa Inggris, format:
   - `feat:` untuk fitur baru
   - `fix:` untuk bug fix
   - `style:` untuk perubahan UI/styling
   - `refactor:` untuk refactoring
   - `docs:` untuk dokumentasi
   - Akhiri dengan `Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>`
4. **Push** — `git push origin master`
5. **Verifikasi** — cek HTTP status dari URL production (curl)

Jangan tunggu user minta commit/push — **langsung lakukan** setelah perubahan selesai dan build sukses.

## Design System

### Warna
- **Brand (Hijau Emerald):** `#0d7c4a` — logo, tombol, badge, ticker bg, avatar
- **Gold Elegan:** `#c9a84c` — aksen premium: link, angka trending, ikon kategori, label
- **Background:** `#0a0a0a` (hitam), `#141414` (secondary), `#1e1e1e` (card)
- **Text:** `#ffffff` (primary), `#a1a1aa` (secondary), `#71717a` (muted)
- **Border:** `#27272a`
- **DARK MODE ONLY** — tidak ada light mode, jangan pakai prefix `dark:`

### Layout Style (Vidio.com-inspired)
- Horizontal scroll carousels (`scroll-row`) untuk konten
- Full-width hero banner untuk featured article
- Section headers: judul kiri + "Lihat Semua" kanan (gold)
- Compact dark cards tanpa border, hover bg change
- Minimal chrome, content-centric

### Komponen CSS Utility
- `.container-main` — max-w-[1400px] centered
- `.scroll-row` — horizontal scroll dengan snap
- `.section-header` / `.section-title` / `.section-link`
- `.card` / `.card-flat`
- `.btn-primary` / `.btn-secondary` / `.btn-ghost`
- `.input`
- `.badge` / `.badge-live` / `.badge-verified` / `.badge-category`

## Database

- **Provider:** Supabase (Seoul region)
- **Ref:** `rbjlasipbucuzegdzboa`
- **Schema:** `prisma/schema.prisma`
- **Migrate:** `npx prisma db push`
- **Env:** `DATABASE_URL` (port 6543 + pgbouncer) dan `DIRECT_URL` (port 5432)

## File Penting

```
prisma/schema.prisma    — Database schema
src/app/page.tsx        — Homepage
src/app/layout.tsx      — Root layout
src/app/globals.css     — Global styles + utilities
tailwind.config.ts      — Tailwind color system
src/lib/auth.ts         — NextAuth config
src/lib/prisma.ts       — Prisma client singleton
src/lib/api-utils.ts    — API helpers (auth, error handling)
src/components/layout/  — Header, Footer, Sidebar, NewsTicker
src/components/artikel/ — ArticleCard, CopyProtection
src/app/api/            — All API routes
src/app/panel/          — Admin panel pages
```

## Aturan Kode

- Semua halaman publik query langsung via Prisma (server components)
- Panel admin pakai client components + fetch API routes
- Gunakan `export const dynamic = "force-dynamic"` untuk halaman yang query database
- Jangan commit file `.env` — sudah di `.gitignore`
- Vercel env vars dikelola via `npx vercel env` CLI
- Password di-hash dengan `bcryptjs` (12 rounds)
