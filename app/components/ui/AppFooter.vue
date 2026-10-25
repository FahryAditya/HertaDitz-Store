<template>
  <footer class="mt-16 pt-10 pb-8 border-t border-white/5 text-gray-400 text-xs">
    <div class="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
      <!-- Col 1: Brand Info -->
      <div class="md:col-span-5 space-y-3">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
            <Icon name="lucide:sparkles" class="w-4 h-4 text-white" />
          </div>
          <span class="text-base font-bold text-white tracking-tight">hertaditz store</span>
        </div>
        <p class="text-gray-400 text-xs leading-relaxed max-w-sm">
          Platform toko aset digital terpercaya. Menyediakan template website modern, pack stiker anime resolusi tinggi, dan poster vektor siap cetak dengan akses unduh instan & aman.
        </p>
        <div class="flex items-center gap-2 pt-1 text-[11px] text-[#a7f3d0]">
          <Icon name="lucide:shield-check" class="w-4 h-4 text-[#a3e635]" />
          <span>Transaksi Terproteksi Midtrans Snap & Webhook</span>
        </div>
      </div>

      <!-- Col 2: Kategori Produk -->
      <div class="md:col-span-3 space-y-2.5">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-white">Kategori Aset</h4>
        <ul class="space-y-2 text-xs">
          <li>
            <NuxtLink to="/katalog?kategori=WEBSITE" class="hover:text-white transition">Template Website</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/katalog?kategori=STICKER" class="hover:text-white transition">Sticker Anime Chibi</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/katalog?kategori=POSTER" class="hover:text-white transition">Template Poster Acid</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/katalog" class="hover:text-white transition">Semua Produk</NuxtLink>
          </li>
        </ul>
      </div>

      <!-- Col 3: Bantuan & Kebijakan -->
      <div class="md:col-span-4 space-y-2.5">
        <h4 class="text-xs font-semibold uppercase tracking-wider text-white">Bantuan & Legal</h4>
        <ul class="space-y-2 text-xs">
          <li>
            <NuxtLink to="/cek-pesanan" class="hover:text-white transition">Cek Status Pesanan & Download</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/bantuan" class="hover:text-white transition">Pusat Bantuan & FAQ</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/kebijakan/lisensi" class="hover:text-white transition">Ketentuan Lisensi Produk</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/kebijakan/refund" class="hover:text-white transition">Kebijakan Pengembalian Dana</NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- Bottom Copyright -->
    <div class="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-[11px] text-gray-500">
      <p>© {{ new Date().getFullYear() }} HertaDitz Store. Seluruh hak cipta dilindungi.</p>
      <div class="flex items-center gap-4">
        <span>Design System: Ethereal Dark</span>
        <span class="w-1 h-1 rounded-full bg-gray-600"></span>
        <span>Secure Payments by Midtrans</span>
      </div>
    </div>
  </footer>
</template>
