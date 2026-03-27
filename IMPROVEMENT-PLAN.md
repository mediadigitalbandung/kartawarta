# Improvement, QA & Deployment Plan
## Jurnalis Hukum Bandung v2.0

---

## 1. IMPROVEMENT

### Kode/Codebase
- [ ] Refactor duplikat kode di komponen slider (HeadlineSlider, BreakingSlider, SubHeadlineSlider)
- [ ] Optimasi Prisma queries (select specific fields, not include all)
- [ ] Hapus unused imports dan dead code
- [ ] Perbaiki struktur folder (pisahkan types, constants)
- [ ] Terapkan error boundaries untuk setiap section

### UI/UX
- [ ] Fully responsive semua halaman (mobile-first)
- [ ] Fluid typography dengan clamp()
- [ ] Touch targets minimal 44x44px
- [ ] Aksesibilitas (aria-labels, keyboard navigation)

---

## 2. QUALITY ASSURANCE

### Linting & Code Quality
- [ ] Run ESLint, fix semua warnings
- [ ] Type checking ketat (no any)

### Security
- [ ] Cek exposed secrets di codebase
- [ ] Validasi input di semua API routes
- [ ] Security headers di next.config.js
- [ ] CSRF protection

### Performance
- [ ] Image optimization (Next.js Image priority/lazy)
- [ ] Bundle size check
- [ ] No layout shift (CLS)

---

## 3. RESPONSIVE BREAKPOINTS

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 480px | 1 kolom, stack vertikal |
| Mobile Large | 480-767px | 1 kolom lebih lega |
| Tablet Portrait | 768-1023px | 2 kolom |
| Tablet Landscape | 1024-1279px | Mendekati desktop |
| Desktop | 1280-1535px | Layout penuh |
| Large Desktop | >= 1536px | Max-width container |

---

## 4. DEPLOYMENT

- Build: `npx next build`
- Commit: Conventional Commits
- Push: `git push origin master`
- Deploy: Vercel auto-deploy
- Verify: curl production URL

---

*Generated: 2026-03-27*
