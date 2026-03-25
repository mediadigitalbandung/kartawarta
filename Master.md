# MASTER PLAN - Jurnalis Hukum Bandung

> Platform Media Hukum Digital Modern untuk Kota Bandung
> Versi: 2.0 | Tanggal: 25 Maret 2026

---

## 1. Ringkasan Project

**Jurnalis Hukum Bandung** adalah platform media online yang berfokus pada pemberitaan hukum di wilayah Bandung. Project ini merupakan migrasi total dari WordPress ke arsitektur modern berbasis **Next.js + PostgreSQL**, di-deploy ke **Vercel**.

### Tujuan Utama
- Membangun platform media hukum yang kredibel dan terpercaya
- Menyediakan panel editorial lengkap untuk 20+ jurnalis
- Menerapkan standar jurnalistik anti-hoax
- Performa tinggi, SEO-friendly, dan keamanan maksimal

---

## 2. Tech Stack

| Layer | Teknologi | Status |
|-------|-----------|--------|
| Frontend | Next.js 14 (App Router) + TypeScript | ✅ Implemented |
| Styling | Tailwind CSS | ✅ Implemented |
| Database | PostgreSQL (Supabase - Seoul) | ✅ Connected |
| ORM | Prisma 5 | ✅ Implemented |
| Auth | NextAuth.js (Credentials) | ✅ Implemented |
| Rich Editor | TipTap (React) | ✅ Implemented |
| Icons | Lucide React | ✅ Implemented |
| Deploy | Vercel (CI/CD dari GitHub) | ✅ Deployed |
| Storage | Supabase Storage | 🔲 Planned |
| Email | Resend / SendGrid | 🔲 Planned |
| Analytics | Vercel Analytics + PostHog | 🔲 Planned |

---

## 3. Arsitektur Sistem

```
[Vercel - Frontend & API]
        |
   Next.js 14 App (App Router)
   /     |     \
  SSR   API    Static
  Pages Routes Pages
        |
   [Prisma ORM]
        |
  [PostgreSQL - Supabase (ap-northeast-2)]
```

### Struktur Folder (Aktual)
```
jurnalis-hukum-bandung/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Homepage
│   │   ├── layout.tsx                # Root layout (SEO, fonts, security headers)
│   │   ├── login/page.tsx            # Login page
│   │   ├── search/page.tsx           # Search page
│   │   ├── berita/[slug]/page.tsx    # Article detail (SSR)
│   │   ├── kategori/[slug]/page.tsx  # Category page (SSR)
│   │   ├── penulis/[slug]/page.tsx   # Author profile (SSR)
│   │   ├── tentang/page.tsx          # About page
│   │   ├── kode-etik/page.tsx        # Journalism ethics
│   │   ├── kontak/page.tsx           # Contact page
│   │   ├── redaksi/page.tsx          # Editorial team
│   │   ├── pedoman-media/page.tsx    # Media guidelines
│   │   ├── panel/                    # Protected editorial panel
│   │   │   ├── layout.tsx            # Panel layout with sidebar
│   │   │   ├── dashboard/page.tsx    # Stats dashboard
│   │   │   ├── artikel/page.tsx      # Articles list (CRUD)
│   │   │   ├── artikel/baru/page.tsx # New article editor
│   │   │   ├── pengguna/page.tsx     # User management (admin)
│   │   │   ├── iklan/page.tsx        # Ad management (admin)
│   │   │   └── laporan/page.tsx      # Reports management
│   │   └── api/
│   │       ├── auth/[...nextauth]/   # NextAuth API
│   │       ├── articles/route.ts     # Articles CRUD
│   │       ├── articles/[id]/route.ts# Article by ID
│   │       ├── categories/route.ts   # Categories API
│   │       ├── users/route.ts        # Users API
│   │       ├── ads/route.ts          # Ads API
│   │       ├── reports/route.ts      # Reports API
│   │       ├── search/route.ts       # Search API
│   │       └── setup/route.ts        # One-time DB seed
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Navigation header
│   │   │   ├── Footer.tsx            # Site footer
│   │   │   ├── Sidebar.tsx           # Sidebar (trending/popular)
│   │   │   └── NewsTicker.tsx        # Breaking news ticker
│   │   ├── artikel/
│   │   │   ├── ArticleCard.tsx       # Article card component
│   │   │   └── CopyProtection.tsx    # Anti copy-paste protection
│   │   ├── editor/
│   │   │   └── RichTextEditor.tsx    # TipTap rich text editor
│   │   └── Providers.tsx             # NextAuth session provider
│   └── lib/
│       ├── prisma.ts                 # Prisma client singleton
│       ├── auth.ts                   # NextAuth configuration
│       ├── utils.ts                  # Utility functions (cn, slugify, etc)
│       └── api-utils.ts             # API helpers (auth, errors, audit)
├── prisma/
│   └── schema.prisma                 # Database schema (12 tables)
├── public/                           # Static assets
├── tailwind.config.ts
├── next.config.js                    # Security headers configured
├── tsconfig.json
└── package.json
```

---

## 4. Fitur Yang Sudah Diimplementasi

### 4.1 UI/UX - Halaman Publik ✅

**Homepage:**
- Hero section dengan berita utama
- Ticker berita berjalan (news ticker)
- Grid berita terbaru (responsive)
- Sidebar: berita populer, trending, terbaru
- Kategori hukum dengan navigasi

**Halaman Artikel (`/berita/[slug]`):**
- Layout bersih, fokus konten
- Info penulis (nama, bio)
- Tanggal publish & estimasi waktu baca
- Label verifikasi berita (Terverifikasi/Opini/dll)
- Sumber berita yang dikutip
- Copy protection dengan atribusi otomatis
- SEO meta tags per artikel

**Halaman Kategori (`/kategori/[slug]`):**
- List artikel per kategori
- Info kategori (nama, deskripsi, jumlah artikel)

**Halaman Penulis (`/penulis/[slug]`):**
- Profil jurnalis
- Daftar artikel oleh jurnalis tersebut

**Halaman Pencarian (`/search`):**
- Full-text search across articles
- Filter berdasarkan query

**Halaman Statis:**
- Tentang Kami (`/tentang`)
- Kode Etik Jurnalistik (`/kode-etik`)
- Susunan Redaksi (`/redaksi`)
- Pedoman Media Siber (`/pedoman-media`)
- Kontak (`/kontak`) - dengan form kontak

---

### 4.2 Panel Jurnalis (Dashboard Editorial) ✅

**Authentication & Authorization:**
- Login via email/password (NextAuth.js Credentials)
- 6 role: Super Admin, Chief Editor, Editor, Senior Journalist, Journalist, Contributor
- Role-based access control pada semua API

**Panel Pages:**
- `/panel/dashboard` — Statistik personal (total artikel, published, draft, views)
- `/panel/artikel` — Daftar artikel dengan filter status, aksi edit/hapus
- `/panel/artikel/baru` — Rich text editor (TipTap) untuk tulis artikel baru
- `/panel/pengguna` — Kelola pengguna (CRUD, assign role) - admin only
- `/panel/iklan` — Kelola banner iklan (CRUD, scheduling)
- `/panel/laporan` — Review laporan berita dari pembaca

**Rich Text Editor (TipTap):**
- Heading (H1-H3), bold, italic, underline, strikethrough
- Blockquote (untuk kutipan hukum/UU)
- Ordered & unordered lists
- Image insert (via URL)
- YouTube video embed
- Link embed
- Text alignment (left, center, right, justify)
- SEO fields: meta title, meta description
- Category & status selection

---

### 4.3 Backend API ✅

| Endpoint | Method | Deskripsi | Auth |
|----------|--------|-----------|------|
| `/api/articles` | GET | List artikel publik (filter: status, category, author) | No |
| `/api/articles` | POST | Buat artikel baru | Yes |
| `/api/articles/[id]` | GET | Detail artikel by ID | No |
| `/api/articles/[id]` | PUT | Update artikel | Yes |
| `/api/articles/[id]` | DELETE | Hapus artikel | Yes |
| `/api/categories` | GET | List semua kategori | No |
| `/api/users` | GET | List users | Admin |
| `/api/users` | POST | Buat user baru | Admin |
| `/api/ads` | GET | List iklan aktif | No |
| `/api/ads` | POST | Buat iklan baru | Admin |
| `/api/reports` | GET | List laporan | Editor+ |
| `/api/reports` | POST | Kirim laporan berita | No |
| `/api/search` | GET | Full-text search artikel | No |
| `/api/setup` | GET | One-time database seeding | Setup Key |

---

### 4.4 Security & Proteksi Konten ✅

**Copy Protection:**
- Disable right-click pada konten artikel
- Custom copy handler — append atribusi otomatis:
  ```
  ---
  Sumber: Jurnalis Hukum Bandung
  Link: [URL Artikel]
  © 2026 Jurnalis Hukum Bandung. Seluruh hak cipta dilindungi.
  ```
- Disable drag pada gambar

**Security Headers (next.config.js):**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

**Application Security:**
- Password hashing (bcrypt, 12 rounds)
- Prisma parameterized queries (SQL injection prevention)
- Input validation (Zod)
- Role-based API protection
- Audit logging (user actions tracked)

---

### 4.5 Standar Media & Anti-Hoax ✅

**Label Verifikasi Berita:**
- ✅ Terverifikasi (VERIFIED) — fact-checked
- ⚪ Belum Diverifikasi (UNVERIFIED)
- 🔄 Koreksi (CORRECTION)
- 💭 Opini (OPINION)

**Sumber & Referensi:**
- Field sumber wajib: nama, jabatan, institusi
- Ditampilkan pada halaman artikel

**Pelaporan Publik:**
- Tombol "Laporkan Berita" pada setiap artikel
- Form aduan: Hoax, Tidak Akurat, SARA, Pencemaran Nama Baik, Lainnya
- Dashboard admin untuk review laporan (`/panel/laporan`)

---

## 5. Database Schema

**Database:** PostgreSQL (Supabase)
**Region:** ap-northeast-2 (Seoul)
**Project Ref:** `rbjlasipbucuzegdzboa`

### Tables (12 total)

| Table | Deskripsi | Records |
|-------|-----------|---------|
| `users` | Akun pengguna (admin, editor, jurnalis) | 3 (seeded) |
| `articles` | Artikel berita | 1 (sample) |
| `categories` | Kategori hukum | 10 (seeded) |
| `tags` | Tag artikel | 0 |
| `sources` | Sumber berita per artikel | 1 |
| `corrections` | Koreksi artikel | 0 |
| `revisions` | Riwayat revisi | 0 |
| `reports` | Laporan berita dari pembaca | 0 |
| `ads` | Banner iklan | 0 |
| `audit_logs` | Log aktivitas user | 0 |
| `_ArticleToTag` | Relasi many-to-many artikel-tag | 0 |
| `_prisma_migrations` | Tracking migrasi Prisma | 0 |

### Seeded Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@jurnalishukumbandung.com | Admin@JHB2026! |
| Chief Editor | editor@jurnalishukumbandung.com | Editor@JHB2026! |
| Senior Journalist | jurnalis@jurnalishukumbandung.com | Jurnalis@JHB2026! |

> ⚠️ **SEGERA GANTI PASSWORD setelah login pertama kali!**

### Kategori Default (10)

1. Hukum Pidana
2. Hukum Perdata
3. Hukum Tata Negara
4. Hukum Bisnis
5. HAM
6. Hukum Lingkungan
7. Ketenagakerjaan
8. Opini
9. Infografis
10. Berita Bandung

---

## 6. Deployment

### Infrastructure

| Service | Detail |
|---------|--------|
| Hosting | Vercel (bonelades-projects) |
| Database | Supabase PostgreSQL (Seoul) |
| Repository | github.com/bonelade/Jurnalis-Hukum-Bandung |
| Branch | `master` (auto-deploy) |
| Build | `next build` with `prisma generate` on postinstall |

### Environment Variables (Vercel)

| Variable | Set |
|----------|-----|
| `DATABASE_URL` | ✅ |
| `DIRECT_URL` | ✅ |
| `NEXTAUTH_SECRET` | ✅ |
| `NEXTAUTH_URL` | ✅ |
| `NEXT_PUBLIC_APP_URL` | ✅ |
| `NEXT_PUBLIC_APP_NAME` | ✅ |
| `SETUP_KEY` | ✅ |

### Deployment URL
- **Production:** https://jurnalis-hukum-bandung-bonelades-projects.vercel.app
- **Custom Domain:** jurnalishukumbandung.com (belum dikonfigurasi)

---

## 7. Roadmap

### Phase 1 — Foundation (MVP) ✅ DONE
- [x] Setup Next.js 14 + TypeScript + Tailwind CSS
- [x] Setup Prisma + PostgreSQL (Supabase)
- [x] Implementasi auth (NextAuth.js, role-based)
- [x] CRUD artikel dengan rich text editor (TipTap)
- [x] Halaman publik: homepage, detail artikel, kategori, penulis, search
- [x] Halaman statis: tentang, kode etik, redaksi, pedoman media, kontak
- [x] Panel editorial: dashboard, artikel, pengguna, iklan, laporan
- [x] Copy protection & security headers
- [x] API routes lengkap (articles, categories, users, ads, reports, search)
- [x] Deploy ke Vercel + Supabase database connected
- [x] Seed database (categories, users, sample article)

### Phase 2 — Editorial Workflow Enhancement 🔲
- [ ] Edit artikel existing (`/panel/artikel/[id]/edit`)
- [ ] Workflow editorial lengkap (draft → review → approve → publish)
- [ ] Media library (upload gambar ke Supabase Storage)
- [ ] Revisi history (track changes)
- [ ] Notifikasi email (Resend/SendGrid)
- [ ] Notifikasi in-app (real-time)
- [ ] Dark mode toggle
- [ ] Infinite scroll / pagination pada list artikel

### Phase 3 — Security & Anti-Hoax Advanced 🔲
- [ ] Watermark gambar (server-side)
- [ ] Checklist publish (anti-clickbait, sumber wajib)
- [ ] Halaman koreksi publik
- [ ] Two-factor authentication (2FA) untuk admin/editor
- [ ] Rate limiting pada API
- [ ] CSRF protection
- [ ] Content Security Policy (CSP) headers

### Phase 4 — Monetisasi & Analytics 🔲
- [ ] Ad slot management (preview, scheduling, targeting)
- [ ] Ad statistics (impressions, clicks, CTR)
- [ ] Vercel Analytics integration
- [ ] PostHog user behavior tracking
- [ ] Newsletter integration
- [ ] Google AdSense / custom ad network

### Phase 5 — Migrasi WordPress & Launch 🔲
- [ ] Export data WordPress lama
- [ ] Migrasi konten ke database baru
- [ ] URL redirect mapping (301 redirects)
- [ ] Custom domain setup (jurnalishukumbandung.com)
- [ ] Cloudflare DNS + CDN + DDoS protection
- [ ] Go-live

---

## 8. Kontak & Tim

- **Project:** Jurnalis Hukum Bandung
- **Organisasi:** Aureon
- **Domain:** jurnalishukumbandung.com
- **Repository:** github.com/bonelade/Jurnalis-Hukum-Bandung
- **Status:** Phase 1 Complete — MVP Deployed

---

*Dokumen ini adalah living document yang akan terus diperbarui seiring perkembangan project.*
*Last updated: 25 Maret 2026*
