# CETAK BIRU WEBSITE — HertaDitz Store

> Versi 1.0 · 24 Oktober 2026
> Dokumen ini menjelaskan **bentuk, arsitektur, data, alur, dan aturan** website HertaDitz Store.
> Daftar pekerjaan ada di file terpisah: `CETAK_BIRU_TASK_FITUR_HERTADITZ.md`.

---

## 1. Gambaran Umum

HertaDitz Store adalah toko aset digital dengan tiga kategori produk:

| Kategori | Isi produk | Preview (publik) | File asli (privat) |
|---|---|---|---|
| Template Website | Source code (ZIP) + dokumentasi | Screenshot + demo singkat | ZIP |
| Sticker Anime | PNG 4×4 | Contoh kecil ber-watermark | ZIP/PNG resolusi penuh |
| Template Poster | File poster | Versi resolusi rendah ber-watermark | File asli (format ditentukan) |

**Satu domain** untuk semuanya:

- `/` dan halaman produk → publik (pembeli)
- `/admin/*` → hanya bisa dibuka setelah **login Email + Password**

### Prinsip yang tidak boleh dilanggar

1. Pembeli hanya melihat **preview singkat**.
2. File asli **tidak pernah punya URL publik**.
3. Status `PAID` **hanya** dari webhook Midtrans yang diverifikasi server.
4. Setelah `PAID`, server memberi akses lewat **signed URL berumur pendek**.
5. Harga, diskon, dan total **selalu dihitung ulang di server**.
6. Admin dijaga **di server**, bukan hanya menyembunyikan menu.

---

## 2. Stack Teknologi

| Lapisan | Teknologi | Catatan |
|---|---|---|
| Framework | Next.js (App Router) | Halaman, Route Handler (API), middleware |
| Styling | Tailwind CSS | Mengikuti design system Ethereal |
| ORM | Prisma | Satu-satunya akses ke database |
| Database | PostgreSQL | Usulan: Supabase Postgres |
| File | Supabase Storage | Bucket `previews` (publik), `products` (privat) |
| Pembayaran | Midtrans (Snap) | QRIS, Virtual Account, e-wallet + webhook |
| Email | Resend / SMTP | Konfirmasi + link download |
| Auth admin | Email + Password | Rekomendasi: Supabase Auth (alternatif: Firebase Auth) |
| Hosting | Firebase | Satu domain untuk pembeli dan admin |
| Validasi | zod | Semua input API |

> **Catatan:** auth admin dan hosting adalah dua hal yang masih bisa disesuaikan. Rekomendasi di atas dipilih agar database, file, dan auth berada di satu tempat (Supabase).

---

## 3. Design System (Ethereal)

Sumber: `Ethereal_Fintech_Dashboard.html`.

**Warna**

| Peran | Nilai |
|---|---|
| Canvas | `#0b0c12` (+ gradasi radial ungu gelap di body) |
| Panel / kartu | `#181926`, `#1e2030`, hover `#26293d` |
| Aksen utama (gradasi) | `#86efac → #a7f3d0 → #d9f99d → #bef264` |
| Positif | `#a3e635` |
| Negatif | `#f87171` |
| Aksen ungu | `#c084fc`, `#818cf8`, `#5b4d78` |
| Teks | putih; sekunder `gray-300/400` |
| Border | putih transparan (`white/10`) |

**Tipografi:** Plus Jakarta Sans (400–700) untuk teks; JetBrains Mono untuk angka/kode; `tabular-nums` untuk harga.

**Bentuk:** radius kartu 24–28px, tombol dan badge pill penuh, wadah luar 36–48px.

**Komponen khas:** navbar pill dengan indikator putih bergeser, kartu gradasi hijau-lime untuk sorotan, badge persentase, grafik batang animasi + tooltip melayang, kartu kaca (blur).

**Gerak:** `ease-out-expo`, hormati `prefers-reduced-motion`.

**Keputusan terbuka:** apakah halaman publik perlu mode terang selain dark.

---

## 4. Peta Halaman (Sitemap)

### Pembeli (publik)

| Rute | Halaman |
|---|---|
| `/` | Homepage (banner, unggulan, kategori, terbaru) |
| `/katalog` | Katalog + filter + pencarian |
| `/kategori/[kategori]` | Katalog per kategori |
| `/produk/[slug]` | Detail produk |
| `/keranjang` | Keranjang + voucher |
| `/checkout` | Data pembeli + persetujuan lisensi |
| `/pesanan/[kode]` | Status pesanan + download |
| `/cek-pesanan` | Cek pesanan (kode + email) + kirim ulang link |
| `/bantuan` | Kontak / FAQ |
| `/kebijakan/lisensi`, `/refund`, `/syarat`, `/privasi` | Halaman kebijakan |

### Admin (login)

| Rute | Halaman |
|---|---|
| `/admin/login` | Login |
| `/admin` | Dashboard |
| `/admin/produk` (+ `/baru`, `/[id]`) | Kelola produk |
| `/admin/voucher` | Voucher dan diskon |
| `/admin/tampilan` | Tampilan toko (banner, urutan, unggulan) |
| `/admin/pesanan` (+ `/[id]`) | Pesanan |
| `/admin/refund` | Permintaan refund |
| `/admin/laporan` | Statistik dan ekspor |
| `/admin/log` | Log webhook dan audit log |
| `/admin/pengaturan` | Profil toko, kontak, kebijakan |

### API (Route Handler)

| Endpoint | Fungsi |
|---|---|
| `POST /api/cart/quote` | Hitung ulang harga + voucher |
| `POST /api/checkout` | Buat order + Snap token |
| `POST /api/midtrans/notification` | Webhook Midtrans |
| `GET /api/download/[itemId]` | Cek akses lalu redirect ke signed URL |
| `POST /api/orders/lookup` | Cek pesanan |
| `POST /api/orders/resend` | Kirim ulang link |
| `/api/admin/*` | CRUD admin (semua dilindungi) |

---

## 5. Struktur Folder (usulan)

```
hertaditz/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  ├─ (store)/            # halaman pembeli
│  │  ├─ admin/              # halaman admin (middleware)
│  │  └─ api/                # route handler
│  ├─ components/
│  │  ├─ ui/                 # tombol, kartu, badge, pill-nav
│  │  ├─ store/
│  │  └─ admin/
│  ├─ lib/
│  │  ├─ db.ts               # Prisma client
│  │  ├─ midtrans.ts
│  │  ├─ storage.ts          # Supabase signed URL
│  │  ├─ pricing.ts          # hitung harga/diskon/voucher
│  │  ├─ email.ts
│  │  └─ auth.ts
│  ├─ middleware.ts          # proteksi /admin dan /api/admin
│  └─ styles/ (token Ethereal)
└─ .env.local
```

---

## 6. Model Data (ringkas)

```prisma
enum Category      { WEBSITE STICKER POSTER }
enum ProductStatus { DRAFT PUBLISHED ARCHIVED }
enum OrderStatus   { PENDING PAID EXPIRED CANCELED FAILED REFUNDED }
enum DiscountType  { PERCENT FIXED }

model Product        { id slug name category description features[] price salePrice? saleStart? saleEnd? status featured sortOrder demoUrl? previewPaths[] licenseId }
model ProductVersion { id productId version filePath changelog? isCurrent }
model Order          { id code(unik) buyerName buyerEmail status subtotal discount total voucherId? accessToken(hash) midtransRef? paidAt? createdAt }
model OrderItem      { id orderId productId versionId priceAtBuy }
model Voucher        { id code(unik) type value minTotal maxUses? usedCount startsAt? endsAt? active }
model PaymentEvent   { id orderId rawStatus payload valid createdAt }   // log webhook
model DownloadLog    { id orderId itemId ip? createdAt }
model AuditLog       { id adminId action target diff? createdAt }
model StoreSetting   { key value(Json) }                                 // banner, bagian homepage, kontak, kebijakan
```

Aturan penting:

- `OrderItem` menyimpan **harga saat beli** dan **versi yang dibeli**.
- `accessToken` hanya disimpan sebagai **hash**.
- Kuota voucher dikurangi **hanya saat order `PAID`**.

---

## 7. Alur Utama

### 7.1 Pembelian

```
Pilih produk → Keranjang → /api/cart/quote (hitung di server)
→ Checkout (nama, email, setuju lisensi)
→ /api/checkout: buat Order PENDING + Snap token
→ Bayar di Snap (QRIS/VA/e-wallet)
→ Midtrans kirim webhook → verifikasi → Order PAID
→ Email berisi link /pesanan/[kode]?token=...
→ Unduh lewat /api/download (signed URL pendek)
```

### 7.2 Webhook Midtrans

1. Hitung `SHA512(order_id + status_code + gross_amount + ServerKey)` → bandingkan dengan `signature_key`. Tidak cocok → tolak + catat `valid=false`.
2. Cocokkan `gross_amount` dengan `Order.total`.
3. (Opsional) konfirmasi lewat Midtrans Status API.
4. Petakan status: `settlement`/`capture` → `PAID`; `pending` → `PENDING`; `expire` → `EXPIRED`; `cancel` → `CANCELED`; `deny` → `FAILED`.
5. **Idempoten:** order yang sudah `PAID` tidak diproses ulang.
6. Saat jadi `PAID` (dalam satu transaksi DB): set `paidAt`, naikkan `usedCount` voucher, kirim email.
7. Simpan setiap notifikasi ke `PaymentEvent`.

### 7.3 Download

1. Verifikasi token (hash).
2. Pastikan `Order.status = PAID`.
3. Cek batas unduhan.
4. Ambil `filePath` dari versi yang dibeli.
5. Buat signed URL Supabase (5–10 menit), catat `DownloadLog`, redirect.

### 7.4 Admin menambah produk

```
Tambah Produk → isi data → upload preview (bucket publik)
→ upload file asli (signed upload URL, bucket privat)
→ atur harga + lisensi → pratinjau → Draft / Terbitkan
```

---

## 8. Aturan Bisnis

- Produk digital: kuantitas per item dikunci **1**.
- Harga efektif = `salePrice` bila `saleStart ≤ sekarang ≤ saleEnd`, selain itu `price`.
- Voucher valid bila: aktif, dalam masa berlaku, `usedCount < maxUses`, `subtotal ≥ minTotal`.
- Update file produk membuat `ProductVersion` baru; pembeli lama tetap memegang versi yang dibeli (kecuali admin memberi akses versi baru).
- Admin **tidak bisa** mengubah status menjadi `PAID` secara manual; hanya "Cek Ulang ke Midtrans".
- Refund → order `REFUNDED`, akses download dicabut.

---

## 9. Keamanan

- Signature webhook diverifikasi; nominal dan ID order dicocokkan; pemrosesan idempoten.
- Bucket `products` privat; `SERVICE_ROLE_KEY` hanya di server.
- Middleware + pengecekan di **setiap** API admin.
- Tidak ada pendaftaran publik untuk admin; password kuat; aktifkan MFA jika tersedia.
- Rate limit: login admin, cek pesanan, kirim ulang link.
- Pesan error seragam pada cek pesanan agar order tidak bisa ditebak.
- Halaman admin `noindex`; tidak ada link admin di navbar publik.
- Validasi input dengan zod; HTTPS wajib.
- Watermark pada semua preview sticker dan poster.

---

## 10. Variabel Environment (hanya server)

```
DATABASE_URL=
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=          # boleh publik (NEXT_PUBLIC_)
MIDTRANS_IS_PRODUCTION=false
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
EMAIL_API_KEY=
SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=
```

---

## 11. Halaman Wajib untuk Verifikasi Merchant

Midtrans umumnya meminta: deskripsi produk jelas, harga, kebijakan refund, syarat dan ketentuan, kontak, dan informasi toko. Siapkan sebelum pindah ke mode produksi.

---

## 12. Keputusan Terbuka

| # | Keputusan | Status |
|---|---|---|
| 1 | Database: Supabase Postgres | Usulan |
| 2 | Auth admin: Supabase Auth vs Firebase Auth | Pilih satu |
| 3 | Hosting Next.js di Firebase (App Hosting atau lainnya) | Pilih satu |
| 4 | Format sticker (pack 16 sticker grid 4×4 atau ukuran 4×4) | Perlu ditentukan |
| 5 | Format poster (Canva/Figma/PSD atau PNG/PDF) | Perlu ditentukan |
| 6 | Batas unduhan dan masa berlaku link | Perlu ditentukan |
| 7 | Mode terang untuk halaman publik | Perlu ditentukan |
| 8 | Karakter sticker orisinal (hak cipta) | Disarankan |
