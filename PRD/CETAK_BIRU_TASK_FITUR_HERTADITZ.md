# CETAK BIRU TASK FITUR — HertaDitz Store

> Versi 1.0 · 24 Oktober 2026
> Pasangan dari `CETAK_BIRU_WEBSITE_HERTADITZ.md`. Dokumen ini berisi **urutan kerja**, **task per fitur**, dan **kriteria selesai**.
> Stack: Next.js · Tailwind CSS · Prisma · Supabase (DB + Storage) · Midtrans.

Legenda: `[ ]` belum · `[~]` sedang · `[x]` selesai · **Dep** = bergantung pada task lain.

---

## Ringkasan Fase

| Fase | Nama | Hasil akhir |
|---|---|---|
| 0 | Persiapan | Proyek berjalan, akun layanan siap |
| 1 | Fondasi UI & Data | Design system + skema database + seed |
| 2 | Katalog Pembeli | Homepage, katalog, halaman produk |
| 3 | Keranjang & Voucher | Hitung harga di server |
| 4 | Checkout & Pembayaran | Order + Midtrans + webhook |
| 5 | Download & Pesanan | Akses file aman + email + cek pesanan |
| 6 | Login Admin | `/admin` terlindungi |
| 7 | Admin Inti | Produk, voucher, pesanan |
| 8 | Admin Lanjutan | Dashboard, tampilan, laporan, refund, log |
| 9 | Halaman Pendukung | Kebijakan, bantuan, SEO |
| 10 | Pengujian & Rilis | Uji sandbox, keamanan, deploy |

**MVP = Fase 0–7** (sudah bisa jualan). Fase 8–10 menyempurnakan.

---

## FASE 0 — Persiapan

- [ ] **T0.1** Buat proyek Next.js (App Router, TypeScript) + Tailwind
- [ ] **T0.2** Pasang Prisma + koneksi ke PostgreSQL (Supabase)
- [ ] **T0.3** Buat proyek Supabase: bucket `previews` (publik) dan `products` (privat)
- [ ] **T0.4** Daftar Midtrans Sandbox, ambil Client Key dan Server Key
- [ ] **T0.5** Siapkan layanan email (Resend/SMTP)
- [ ] **T0.6** Siapkan `.env.local` + `.env.example` (tanpa nilai rahasia)
- [ ] **T0.7** Setup ESLint, Prettier, struktur folder sesuai cetak biru

**Selesai bila:** `npm run dev` jalan, database terhubung, kedua bucket ada.

---

## FASE 1 — Fondasi UI & Data

### T1 Design system Ethereal
- [ ] **T1.1** Token Tailwind: warna, radius, font (Plus Jakarta Sans, JetBrains Mono)
- [ ] **T1.2** Komponen dasar: Button (pill hitam/putih), Badge, Card, Input, Modal, Toast
- [ ] **T1.3** Navbar pill dengan indikator bergeser (responsif)
- [ ] **T1.4** Kartu produk, kartu gradasi hijau-lime, skeleton loading
- [ ] **T1.5** Dukungan `prefers-reduced-motion`

### T2 Skema database
- [ ] **T2.1** Tulis `schema.prisma` (Product, ProductVersion, Order, OrderItem, Voucher, PaymentEvent, DownloadLog, AuditLog, StoreSetting)
- [ ] **T2.2** Migrasi pertama
- [ ] **T2.3** Seed: 2–3 produk contoh per kategori + 1 voucher
- [ ] **T2.4** Helper `lib/db.ts` (Prisma client singleton)

**Selesai bila:** komponen tampil benar di halaman contoh; seed terisi di database.

---

## FASE 2 — Katalog Pembeli

### T3 Homepage
- [ ] **T3.1** Banner promo (gradasi hijau-lime)
- [ ] **T3.2** Baris produk unggulan, kartu kategori, produk terbaru
- [ ] **T3.3** Data dari `StoreSetting` + `Product` (PUBLISHED)
- [ ] **T3.4** Footer: kebijakan + kontak

### T4 Katalog
- [ ] **T4.1** Grid produk + pagination
- [ ] **T4.2** Filter kategori (query string), pencarian, urutan (terbaru/terlaris/termurah/termahal)
- [ ] **T4.3** Fungsi harga efektif (promo aktif atau tidak) di `lib/pricing.ts`

### T5 Halaman produk
- [ ] **T5.1** Galeri preview (ber-watermark untuk sticker/poster)
- [ ] **T5.2** Info: deskripsi, fitur, format/teknologi, ringkasan lisensi
- [ ] **T5.3** Tombol Tambah ke Keranjang, Beli Sekarang, Lihat Demo (template)
- [ ] **T5.4** Produk non-PUBLISHED → 404

**Selesai bila:** pembeli bisa menjelajah tiga kategori di HP dan desktop; hanya preview yang termuat.

---

## FASE 3 — Keranjang & Voucher

### T6 Keranjang
- [ ] **T6.1** State keranjang (daftar `productId`) + localStorage
- [ ] **T6.2** UI: daftar item, hapus, pilih item untuk dibeli
- [ ] **T6.3** Ringkasan subtotal, diskon, total

### T7 Quote server
- [ ] **T7.1** `POST /api/cart/quote`: ambil harga terbaru dari DB, hitung ulang
- [ ] **T7.2** Validasi voucher: aktif, masa berlaku, kuota, minimal belanja
- [ ] **T7.3** Pesan error voucher yang jelas
- [ ] **T7.4** Uji unit untuk `pricing.ts` (promo, voucher persen dan nominal, batas)

**Selesai bila:** total di UI selalu sama dengan hitungan server; mengubah harga di browser tidak berpengaruh.

---

## FASE 4 — Checkout & Pembayaran

### T8 Checkout
- [ ] **T8.1** Form nama + email, validasi zod
- [ ] **T8.2** Checkbox persetujuan lisensi dan syarat
- [ ] **T8.3** `POST /api/checkout`: buat Order `PENDING` + OrderItem (harga dan versi saat itu)
- [ ] **T8.4** Kode order unik + `accessToken` acak (simpan hash)
- [ ] **T8.5** Minta Snap token ke Midtrans (`order_id = code`, `gross_amount = total`)

### T9 Pembayaran
- [ ] **T9.1** Integrasi Snap.js (popup)
- [ ] **T9.2** Halaman status: menunggu / berhasil / kedaluwarsa / gagal + ulangi checkout
- [ ] **T9.3** Polling status ringan di halaman status

### T10 Webhook (kritis)
- [ ] **T10.1** `POST /api/midtrans/notification`
- [ ] **T10.2** Verifikasi `signature_key` (SHA512)
- [ ] **T10.3** Cocokkan `gross_amount` dengan `Order.total`
- [ ] **T10.4** Petakan status Midtrans → status order
- [ ] **T10.5** Idempoten: order `PAID` tidak diproses ulang
- [ ] **T10.6** Transaksi DB: set `paidAt`, naikkan `usedCount` voucher
- [ ] **T10.7** Simpan tiap notifikasi ke `PaymentEvent`
- [ ] **T10.8** Uji dengan simulator Midtrans Sandbox (settlement, pending, expire, cancel, notifikasi ganda, signature salah)

**Selesai bila:** pembayaran sandbox mengubah order jadi `PAID` otomatis; signature salah ditolak; notifikasi ganda tidak menggandakan efek.

---

## FASE 5 — Download & Pesanan

### T11 Download aman
- [ ] **T11.1** `lib/storage.ts`: buat signed URL dari bucket `products`
- [ ] **T11.2** `GET /api/download/[itemId]`: cek token, status `PAID`, batas unduhan, versi yang dibeli
- [ ] **T11.3** Catat `DownloadLog`
- [ ] **T11.4** Halaman `/pesanan/[kode]`: daftar item + tombol Unduh + petunjuk pakai

### T12 Email
- [ ] **T12.1** Template email konfirmasi (ringkasan + link pesanan)
- [ ] **T12.2** Kirim otomatis saat order jadi `PAID`

### T13 Cek pesanan
- [ ] **T13.1** `/cek-pesanan`: kode + email → status
- [ ] **T13.2** Kirim ulang link (token baru, token lama tidak berlaku)
- [ ] **T13.3** Rate limit + pesan error seragam

**Selesai bila:** pembeli sandbox menerima email, bisa mengunduh, link tidak bisa dipakai untuk order lain, dan file tidak bisa diakses tanpa order `PAID`.

---

## FASE 6 — Login Admin

### T14 Autentikasi
- [ ] **T14.1** Buat akun admin manual (tanpa halaman daftar)
- [ ] **T14.2** `/admin/login` (Email + Password) bergaya Ethereal
- [ ] **T14.3** Session cookie httpOnly, diverifikasi di server
- [ ] **T14.4** Penanda hak admin (role/claim) dicek di server
- [ ] **T14.5** `middleware.ts`: blokir `/admin/*` dan `/api/admin/*` tanpa sesi admin
- [ ] **T14.6** Rate limit login, `noindex` halaman admin, tanpa link admin di navbar publik
- [ ] **T14.7** Lupa password (hanya untuk email admin terdaftar)

**Selesai bila:** akses `/admin` tanpa login selalu ditolak, termasuk lewat API langsung.

---

## FASE 7 — Admin Inti

### T15 Layout admin
- [ ] **T15.1** Sidebar/nav pill, header, toast, tabel standar

### T16 Produk
- [ ] **T16.1** Tabel produk + pencarian + filter status
- [ ] **T16.2** Form tambah/ubah (nama, slug, kategori, deskripsi, fitur, lisensi)
- [ ] **T16.3** Upload preview ke bucket publik
- [ ] **T16.4** Upload file asli lewat signed upload URL ke bucket privat
- [ ] **T16.5** Versi produk: unggah versi baru, changelog, tandai `isCurrent`
- [ ] **T16.6** Status Draft / Terbit / Arsip + pratinjau halaman
- [ ] **T16.7** Catat perubahan ke `AuditLog`

### T17 Harga, diskon, voucher
- [ ] **T17.1** Harga normal + harga diskon + jadwal promo
- [ ] **T17.2** CRUD voucher (kode, jenis, nilai, minimal, kuota, masa berlaku, aktif)
- [ ] **T17.3** Validasi (diskon ≤ harga, tanggal akhir > awal, kode unik)

### T18 Pesanan
- [ ] **T18.1** Tabel pesanan + filter status + cari email/kode
- [ ] **T18.2** Detail pesanan: item, riwayat webhook, riwayat unduhan
- [ ] **T18.3** Aksi: Cek Ulang ke Midtrans, Kirim Ulang Akses, Cabut Akses
- [ ] **T18.4** Pastikan **tidak ada** tombol untuk menandai `PAID` manual

**Selesai bila:** admin bisa menambah produk dari nol sampai tampil di toko, membuat voucher, dan memantau pesanan.

> **MVP tercapai di titik ini.**

---

## FASE 8 — Admin Lanjutan

### T19 Dashboard
- [ ] **T19.1** Kartu total penjualan (gradasi hijau-lime), pemasukan, jumlah pesanan
- [ ] **T19.2** Grafik batang penjualan per periode + tooltip
- [ ] **T19.3** Donat penjualan per kategori, produk terlaris, pesanan terbaru
- [ ] **T19.4** Query agregasi hanya dari order `PAID` (dikurangi `REFUNDED`)

### T20 Tampilan toko
- [ ] **T20.1** Atur urutan produk, produk unggulan, kategori
- [ ] **T20.2** Ubah banner + judul dan deskripsi bagian homepage
- [ ] **T20.3** Aktif/nonaktifkan bagian homepage
- [ ] **T20.4** Pratinjau sebelum publikasi (draft → aktif) + revalidate cache

### T21 Refund
- [ ] **T21.1** Daftar permintaan + setujui/tolak
- [ ] **T21.2** Panggil Midtrans Refund API bila metode mendukung
- [ ] **T21.3** Order → `REFUNDED`, cabut akses download

### T22 Laporan
- [ ] **T22.1** Filter periode + tabel penjualan
- [ ] **T22.2** Ekspor CSV
- [ ] **T22.3** Ekspor Excel

### T23 Log
- [ ] **T23.1** Halaman log webhook (`PaymentEvent`)
- [ ] **T23.2** Halaman audit log (`AuditLog`)

### T24 Pengaturan toko
- [ ] **T24.1** Profil toko, kontak, teks kebijakan, batas unduhan, masa berlaku link

---

## FASE 9 — Halaman Pendukung

- [ ] **T25.1** Halaman kebijakan: lisensi, refund, syarat dan ketentuan, privasi (isi dari `StoreSetting`)
- [ ] **T25.2** Halaman bantuan/kontak + FAQ
- [ ] **T25.3** SEO: metadata, Open Graph, sitemap, robots (admin `noindex`)
- [ ] **T25.4** Halaman 404 dan error bergaya Ethereal
- [ ] **T25.5** Audit responsif (HP dulu), aksesibilitas dasar, performa gambar

---

## FASE 10 — Pengujian & Rilis

### Uji fungsional (sandbox Midtrans)
- [ ] **T26.1** Beli 1 produk per kategori sampai unduh
- [ ] **T26.2** Beli dengan voucher (persen, nominal, kedaluwarsa, kuota habis)
- [ ] **T26.3** Pembayaran kedaluwarsa dan dibatalkan
- [ ] **T26.4** Refund sampai akses dicabut

### Uji keamanan
- [ ] **T27.1** Coba buka file `products` tanpa signed URL → harus gagal
- [ ] **T27.2** Coba download dengan order `PENDING` atau token salah → harus gagal
- [ ] **T27.3** Webhook dengan signature palsu / nominal beda → harus ditolak
- [ ] **T27.4** Akses `/admin` dan `/api/admin/*` tanpa login → harus ditolak
- [ ] **T27.5** Ubah harga lewat request manual → server mengabaikan
- [ ] **T27.6** Coba rate limit login dan cek pesanan

### Rilis
- [ ] **T28.1** Lengkapi dokumen verifikasi merchant Midtrans
- [ ] **T28.2** Ganti ke key produksi (`MIDTRANS_IS_PRODUCTION=true`) + daftarkan URL webhook produksi
- [ ] **T28.3** Deploy ke Firebase + atur variabel environment
- [ ] **T28.4** Uji transaksi nyata nominal kecil
- [ ] **T28.5** Pantau log webhook 1–2 minggu pertama

---

## Urutan Ketergantungan (ringkas)

```
F0 → F1 → F2 → F3 → F4 → F5
                    └──────→ F6 → F7 → F8 → F9 → F10
```

Fase 6–7 bisa dikerjakan paralel dengan Fase 3–5 bila ingin mempercepat (admin dibutuhkan untuk mengisi produk nyata).

---

## Definition of Done (berlaku untuk semua task)

1. Berfungsi di HP dan desktop.
2. Sesuai design system Ethereal.
3. Input divalidasi (zod) dan error ditangani dengan pesan jelas.
4. Tidak ada rahasia (key) di kode atau browser.
5. Sudah diuji manual, dan logika harga/webhook punya uji otomatis.

---

## Keputusan yang Harus Ditutup Lebih Dulu

| Keputusan | Menghambat task |
|---|---|
| Auth admin (Supabase Auth atau Firebase Auth) | T14 |
| Hosting Next.js di Firebase (jenis layanan) | T28.3 |
| Format sticker (pack grid 4×4 atau ukuran 4×4) | T5.1, T16.4 |
| Format poster (Canva/Figma/PSD atau PNG/PDF) | T5.1, T16.4 |
| Batas unduhan + masa berlaku link | T11.2, T24.1 |
| Mode terang untuk halaman publik | T1.1 |
