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

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| Frontend | Next.js 14+ (App Router) | SSR/SSG, SEO-friendly |
| Styling | Tailwind CSS | Responsive, utility-first |
| Database | PostgreSQL (Supabase/Neon) | Relational, scalable |
| ORM | Prisma | Type-safe database access |
| Auth | NextAuth.js / Supabase Auth | Multi-role authentication |
| Storage | Supabase Storage / Cloudinary | Gambar & media |
| Deploy | Vercel | CI/CD otomatis dari GitHub |
| Email | Resend / SendGrid | Notifikasi & newsletter |
| Analytics | Vercel Analytics + PostHog | Traffic & user behavior |

---

## 3. Arsitektur Sistem

```
[Vercel - Frontend & API]
        |
   Next.js App
   /     |     \
  SSR   API    ISR
  Pages Routes Pages
        |
   [Prisma ORM]
        |
  [PostgreSQL - Supabase/Neon]
        |
  [Supabase Storage / Cloudinary]
```

### Struktur Folder
```
jurnalis-hukum-bandung/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Halaman publik (berita, kategori, dll)
│   │   ├── (auth)/             # Login, register, lupa password
│   │   ├── panel/              # Panel Jurnalis (protected)
│   │   │   ├── dashboard/
│   │   │   ├── artikel/
│   │   │   ├── media/
│   │   │   └── settings/
│   │   ├── admin/              # Admin Panel (protected)
│   │   │   ├── users/
│   │   │   ├── iklan/
│   │   │   ├── kategori/
│   │   │   └── analytics/
│   │   └── api/                # API Routes
│   ├── components/
│   │   ├── ui/                 # Komponen UI dasar
│   │   ├── layout/             # Header, Footer, Sidebar
│   │   ├── artikel/            # Komponen artikel
│   │   ├── iklan/              # Komponen banner iklan
│   │   └── editor/             # Rich text editor
│   ├── lib/                    # Utilities, helpers
│   ├── hooks/                  # Custom React hooks
│   └── styles/                 # Global styles
├── prisma/
│   └── schema.prisma           # Database schema
├── public/                     # Static assets
├── .env.local                  # Environment variables
└── next.config.js
```

---

## 4. Fitur Detail

### 4.1 UI/UX - Desain Modern Media Hukum

**Homepage:**
- Hero section dengan breaking news / berita utama
- Ticker berita berjalan (news ticker)
- Grid berita terbaru (responsive: 1/2/3/4 kolom)
- Sidebar: berita populer, trending, terbaru
- Kategori hukum: Pidana, Perdata, Tata Usaha Negara, Konstitusi, dll
- Section khusus: Opini, Analisis Hukum, Infografis
- Dark mode / Light mode toggle
- Font yang nyaman dibaca (serif untuk body artikel)

**Halaman Artikel:**
- Layout bersih, fokus pada konten
- Breadcrumb navigation
- Info penulis (foto, nama, bio singkat)
- Tanggal publish & update
- Estimasi waktu baca
- Share buttons (WhatsApp, Twitter/X, Facebook, Telegram, Copy Link)
- Related articles
- Komentar (moderasi otomatis)
- Tag & kategori
- Navigasi artikel sebelum/sesudah

**Halaman Kategori & Tag:**
- Filter dan sorting (terbaru, populer, relevan)
- Pagination atau infinite scroll
- Jumlah artikel per kategori

**Halaman Penulis/Jurnalis:**
- Profil jurnalis dengan foto, bio, spesialisasi
- Daftar artikel oleh jurnalis tersebut
- Statistik artikel (jumlah, views)

**Responsive Design:**
- Mobile-first approach
- Hamburger menu untuk mobile
- Optimasi gambar (next/image, WebP, lazy loading)
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

---

### 4.2 Panel Jurnalis (Dashboard Editorial)

**Role & Permissions:**

| Role | Hak Akses |
|------|-----------|
| Super Admin | Semua akses, kelola user, iklan, settings |
| Editor Kepala | Approve/reject artikel, assign jurnalis, edit semua artikel |
| Editor | Review & edit artikel di kategori yang ditugaskan |
| Jurnalis Senior | Tulis artikel, edit sendiri, publish langsung |
| Jurnalis | Tulis artikel, edit sendiri, perlu approval editor |
| Kontributor | Tulis artikel draft saja, perlu approval |

**Editorial Workflow:**
```
[Draft] → [Review] → [Editor Approval] → [Published]
                ↓              ↓
           [Revisi]       [Rejected]
                              ↓
                         [Kembali ke Draft]
```

**Fitur Panel:**
- Dashboard dengan statistik personal (artikel, views, pending review)
- Rich Text Editor (TipTap / Editor.js) dengan:
  - Heading, bold, italic, underline
  - Insert gambar & video (YouTube embed)
  - Blockquote untuk kutipan hukum/undang-undang
  - Table untuk data
  - Link embed
  - Code block (untuk pasal-pasal)
- Media Library (upload, crop, resize gambar)
- SEO tools per artikel (meta title, description, slug)
- Jadwal publish (schedule)
- Revisi history (track changes)
- Notifikasi real-time (artikel di-approve, komentar baru, dll)
- Kolaborasi (assign co-author)

---

### 4.3 Backend + Banner Iklan

**API Endpoints (REST):**
```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/forgot-password

GET    /api/articles              # List artikel (public)
GET    /api/articles/:slug        # Detail artikel
POST   /api/articles              # Buat artikel baru (auth)
PUT    /api/articles/:id          # Update artikel (auth)
DELETE /api/articles/:id          # Hapus artikel (auth)
PATCH  /api/articles/:id/status   # Ubah status (review/approve/reject)

GET    /api/categories
GET    /api/tags
GET    /api/authors/:id

POST   /api/media/upload          # Upload media
GET    /api/media                 # List media

GET    /api/ads                   # List iklan aktif
POST   /api/ads                   # Buat iklan (admin)
PUT    /api/ads/:id               # Update iklan
DELETE /api/ads/:id               # Hapus iklan

GET    /api/analytics/overview    # Dashboard analytics
GET    /api/analytics/articles    # Statistik per artikel
```

**Sistem Banner Iklan:**
- Slot iklan yang dapat dikonfigurasi:
  - Header banner (728x90 / responsive)
  - Sidebar banner (300x250)
  - In-article banner (setelah paragraf ke-3)
  - Footer banner
  - Popup/interstitial (dengan frequency cap)
  - Floating bottom banner (mobile)
- Admin panel untuk kelola iklan:
  - Upload banner (gambar/HTML)
  - Set tanggal tayang (mulai - selesai)
  - Target halaman/kategori
  - Statistik: impressions, clicks, CTR
  - Priority/weight system
- Support: gambar statis, GIF, HTML embed (Google Ads, dll)

---

### 4.4 Security & Proteksi Konten

**Proteksi Konten (Anti Copy-Paste):**
- Disable right-click pada konten artikel
- Custom copy handler: saat user copy text, otomatis append:
  ```
  ---
  Sumber: Jurnalis Hukum Bandung
  Penulis: [Nama Penulis]
  Link: [URL Artikel]
  © 2026 Jurnalis Hukum Bandung. Seluruh hak cipta dilindungi.
  ```
- Watermark pada gambar (server-side)
- Disable print screen detection (best effort)
- Canonical URL & structured data untuk klaim kepemilikan di search engine

**Keamanan Aplikasi:**
- HTTPS enforced
- Rate limiting pada API (express-rate-limit / Vercel Edge)
- CSRF protection
- XSS prevention (sanitize semua input)
- SQL injection prevention (Prisma parameterized queries)
- Content Security Policy (CSP) headers
- Helmet.js security headers
- Input validation (Zod)
- Password hashing (bcrypt)
- JWT token rotation
- IP-based brute force protection
- DDoS protection (Vercel + Cloudflare)
- File upload validation (type, size, malware scan)
- Audit log (siapa melakukan apa, kapan)

**Keamanan Akun:**
- Two-factor authentication (2FA) untuk admin & editor
- Session management (auto logout setelah idle)
- Password policy (min 8 char, uppercase, lowercase, number)
- Login attempt limiting & temporary lockout

---

### 4.5 Standar Media & Anti-Hoax

**Fitur Anti-Hoax / Kredibilitas:**
- **Label Verifikasi Berita:**
  - Terverifikasi (fact-checked)
  - Belum Diverifikasi
  - Klarifikasi / Koreksi
  - Opini (bukan berita fakta)

- **Sumber & Referensi:**
  - Wajib cantumkan minimal 1 sumber pada setiap artikel berita
  - Field khusus untuk sumber: nama, jabatan, institusi
  - Link ke dokumen resmi (jika ada)
  - Inline citation (footnotes)

- **Koreksi & Transparansi:**
  - Halaman koreksi publik (jika ada kesalahan berita)
  - Riwayat edit artikel (publik, kapan & apa yang diubah)
  - Disclaimer otomatis pada artikel opini

- **Standar Jurnalistik:**
  - Checklist sebelum publish:
    - [ ] Judul tidak clickbait / sensasional berlebihan
    - [ ] Minimal 1 sumber terverifikasi
    - [ ] Cover both sides (jika ada 2 pihak)
    - [ ] Tidak mengandung SARA
    - [ ] Bahasa sesuai PUEBI
  - Badge "Telah Diverifikasi" pada artikel yang lolos checklist
  - Halaman "Tentang Kami" + Pedoman Media + Kode Etik Jurnalistik

- **Pelaporan Publik:**
  - Tombol "Laporkan Berita Ini" pada setiap artikel
  - Form aduan dengan kategori: hoax, tidak akurat, SARA, dll
  - Dashboard admin untuk review laporan

---

## 5. Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  avatar        String?
  bio           String?
  role          Role      @default(JOURNALIST)
  specialization String?
  phone         String?
  isActive      Boolean   @default(true)
  twoFactorEnabled Boolean @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  articles      Article[]
  auditLogs     AuditLog[]
}

model Article {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  content       String    @db.Text
  excerpt       String?
  featuredImage String?
  status        ArticleStatus @default(DRAFT)
  verificationLabel VerificationLabel @default(UNVERIFIED)
  readTime      Int?
  viewCount     Int       @default(0)
  publishedAt   DateTime?
  scheduledAt   DateTime?
  sources       Source[]
  corrections   Correction[]
  reports       Report[]
  author        User      @relation(fields: [authorId], references: [id])
  authorId      String
  category      Category  @relation(fields: [categoryId], references: [id])
  categoryId    String
  tags          Tag[]
  revisions     Revision[]
  adPlacements  AdPlacement[]
  seoTitle      String?
  seoDescription String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  icon        String?
  articles    Article[]
}

model Tag {
  id       String    @id @default(cuid())
  name     String    @unique
  slug     String    @unique
  articles Article[]
}

model Source {
  id          String  @id @default(cuid())
  name        String
  title       String?
  institution String?
  url         String?
  article     Article @relation(fields: [articleId], references: [id])
  articleId   String
}

model Correction {
  id          String   @id @default(cuid())
  description String
  article     Article  @relation(fields: [articleId], references: [id])
  articleId   String
  createdAt   DateTime @default(now())
}

model Revision {
  id        String   @id @default(cuid())
  content   String   @db.Text
  changedBy String
  article   Article  @relation(fields: [articleId], references: [id])
  articleId String
  createdAt DateTime @default(now())
}

model Report {
  id        String       @id @default(cuid())
  reason    ReportReason
  detail    String?
  email     String?
  status    ReportStatus @default(PENDING)
  article   Article      @relation(fields: [articleId], references: [id])
  articleId String
  createdAt DateTime     @default(now())
}

model Ad {
  id          String   @id @default(cuid())
  name        String
  type        AdType
  imageUrl    String?
  htmlCode    String?  @db.Text
  targetUrl   String?
  slot        AdSlot
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean  @default(true)
  priority    Int      @default(0)
  impressions Int      @default(0)
  clicks      Int      @default(0)
  targetPages String[] @default([])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model AdPlacement {
  id        String  @id @default(cuid())
  article   Article @relation(fields: [articleId], references: [id])
  articleId String
  slot      AdSlot
  adId      String
}

model AuditLog {
  id        String   @id @default(cuid())
  action    String
  entity    String
  entityId  String
  detail    String?
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  ip        String?
  createdAt DateTime @default(now())
}

enum Role {
  SUPER_ADMIN
  CHIEF_EDITOR
  EDITOR
  SENIOR_JOURNALIST
  JOURNALIST
  CONTRIBUTOR
}

enum ArticleStatus {
  DRAFT
  IN_REVIEW
  APPROVED
  PUBLISHED
  REJECTED
  ARCHIVED
}

enum VerificationLabel {
  VERIFIED
  UNVERIFIED
  CORRECTION
  OPINION
}

enum ReportReason {
  HOAX
  INACCURATE
  SARA
  DEFAMATION
  OTHER
}

enum ReportStatus {
  PENDING
  REVIEWED
  RESOLVED
  DISMISSED
}

enum AdType {
  IMAGE
  GIF
  HTML
}

enum AdSlot {
  HEADER
  SIDEBAR
  IN_ARTICLE
  FOOTER
  POPUP
  FLOATING_BOTTOM
}
```

---

## 6. Migrasi dari WordPress

### Langkah Migrasi:
1. **Export WordPress** — Gunakan WP REST API atau WP-CLI untuk export semua:
   - Posts (judul, konten, slug, tanggal, status, featured image)
   - Categories & Tags
   - Users (nama, email, role)
   - Media files (gambar)
2. **Transform data** — Script migrasi untuk konversi format WP ke schema baru
3. **Import ke PostgreSQL** — Seed database dengan data yang sudah ditransformasi
4. **Upload media** — Migrasi gambar ke Supabase Storage / Cloudinary
5. **Redirect mapping** — Setup redirect dari URL WordPress lama ke URL baru (301)
6. **Testing** — Verifikasi semua konten termigrasi dengan benar

---

## 7. Deployment & DevOps

```
GitHub Repository
       |
   Push / PR
       |
  Vercel CI/CD
  (auto build & deploy)
       |
   ┌───┴───┐
Preview  Production
(branch)  (main)
       |
  PostgreSQL (Supabase/Neon)
       |
  Cloudflare (DNS + CDN + DDoS protection)
```

### Environment:
- **Development:** localhost:3000
- **Staging:** preview deployments di Vercel (per branch/PR)
- **Production:** jurnalishukumbandung.com (Vercel + custom domain)

---

## 8. Kategori Hukum Default

1. Hukum Pidana
2. Hukum Perdata
3. Hukum Tata Usaha Negara
4. Hukum Konstitusi
5. Hukum Bisnis & Korporasi
6. Hukum Lingkungan
7. Hukum Ketenagakerjaan
8. Hak Asasi Manusia (HAM)
9. Hukum Adat
10. Opini & Analisis
11. Infografis Hukum
12. Berita Daerah Bandung

---

## 9. Roadmap

### Phase 1 — Foundation (MVP)
- [ ] Setup Next.js + Prisma + PostgreSQL
- [ ] Implementasi auth (login, register, role-based)
- [ ] CRUD artikel dengan rich text editor
- [ ] Halaman publik: homepage, detail artikel, kategori
- [ ] Basic SEO (meta tags, sitemap, robots.txt)
- [ ] Deploy ke Vercel

### Phase 2 — Editorial Workflow
- [ ] Panel jurnalis lengkap (dashboard, statistik)
- [ ] Workflow editorial (draft → review → approve → publish)
- [ ] Media library
- [ ] Revisi history
- [ ] Notifikasi (email + in-app)

### Phase 3 — Security & Anti-Hoax
- [ ] Copy protection dengan atribusi penulis
- [ ] Watermark gambar
- [ ] Label verifikasi berita
- [ ] Checklist publish (anti-clickbait, sumber wajib)
- [ ] Halaman koreksi publik
- [ ] Tombol "Laporkan Berita"
- [ ] 2FA untuk admin/editor
- [ ] Audit log

### Phase 4 — Monetisasi & Analytics
- [ ] Sistem banner iklan (CRUD, scheduling, statistik)
- [ ] Ad slot management
- [ ] Analytics dashboard (views, trending, engagement)
- [ ] Newsletter integration

### Phase 5 — Migrasi & Launch
- [ ] Export data WordPress lama
- [ ] Migrasi konten ke database baru
- [ ] URL redirect mapping
- [ ] DNS migration ke Vercel
- [ ] Go-live

---

## 10. Kontak & Tim

- **Project:** Jurnalis Hukum Bandung
- **Organisasi:** Aureon
- **Domain:** jurnalishukumbandung.com
- **Repository:** GitHub (TBD)
- **Tech Lead:** -
- **Status:** Perencanaan

---

*Dokumen ini adalah living document yang akan terus diperbarui seiring perkembangan project.*
