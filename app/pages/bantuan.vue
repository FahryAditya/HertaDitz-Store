<script setup lang="ts">
const faqs = [
  {
    q: 'Bagaimana cara mengunduh aset setelah pembayaran berhasil?',
    a: 'Setelah status transaksi menjadi PAID (diverifikasi otomatis oleh server Midtrans), Anda akan langsung dialihkan ke halaman pesanan yang memuat tombol "Unduh File (.ZIP)". Selain itu, link akses unduh instan juga dikirimkan ke alamat email Anda.',
  },
  {
    q: 'Apakah template website sudah termasuk source code lengkap?',
    a: 'Ya, seluruh template website kami menyertakan source code lengkap, file konfigurasi, dokumentasi panduan instalasi, dan aset yang siap pakai baik untuk keperluan personal maupun komersial.',
  },
  {
    q: 'Apa perbedaan preview ber-watermark dengan file asli?',
    a: 'Preview pada halaman produk kami beri watermark transparan untuk mencegah pencurian karya digital. File asli yang Anda unduh setelah membeli adalah file master resolusi penuh tanpa watermark apapun.',
  },
  {
    q: 'Metode pembayaran apa saja yang didukung?',
    a: 'Kami menerima berbagai metode pembayaran melalui Midtrans Snap: QRIS (GoPay, OVO, ShopeePay, Dana), Virtual Account bank (BCA, Mandiri, BNI, BRI), serta transfer bank.',
  },
  {
    q: 'Bagaimana jika link download saya hilang?',
    a: 'Anda cukup mengunjungi menu "Cek Pesanan" di navigasi atas, lalu masukkan kode pesanan dan email pembelian Anda. Sistem akan memverifikasi dan menerbitkan kembali link akses unduhan baru.',
  },
]

const openIndex = ref<number | null>(0)

const toggleFaq = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-10 py-4">
    <!-- Header -->
    <div class="text-center space-y-2">
      <div class="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mx-auto border border-white/10 shadow-lg">
        <Icon name="lucide:help-circle" class="w-6 h-6 text-[#a7f3d0]" />
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        Pusat Bantuan & FAQ
      </h1>
      <p class="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
        Pertanyaan umum seputar pembelian aset digital, lisensi, pembayaran Midtrans, dan unduhan file.
      </p>
    </div>

    <!-- FAQ Accordion -->
    <div class="space-y-3">
      <div
        v-for="(faq, idx) in faqs"
        :key="idx"
        class="bg-[#181926] border border-white/10 rounded-[24px] overflow-hidden transition"
      >
        <button
          type="button"
          @click="toggleFaq(idx)"
          class="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-[#a7f3d0] transition select-none"
        >
          <span>{{ faq.q }}</span>
          <Icon
            name="lucide:chevron-down"
            class="w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300"
            :class="{ 'rotate-180 text-white': openIndex === idx }"
          />
        </button>

        <div
          v-if="openIndex === idx"
          class="px-5 pb-5 pt-1 text-xs text-gray-300 leading-relaxed border-t border-white/5"
        >
          {{ faq.a }}
        </div>
      </div>
    </div>

    <!-- Contact Support Box -->
    <div class="bg-gradient-to-r from-[#1b1c2b] to-[#141520] border border-white/10 rounded-[28px] p-6 text-center space-y-3">
      <h3 class="text-base font-bold text-white">Masih Butuh Bantuan?</h3>
      <p class="text-xs text-gray-400 max-w-sm mx-auto">
        Tim dukungan HertaDitz siap membantu Anda jika mengalami kendala transaksi atau akses file.
      </p>
      <div class="pt-2 flex flex-wrap items-center justify-center gap-3">
        <a
          href="mailto:support@hertaditz.store"
          class="px-5 py-2.5 rounded-full bg-white text-[#0b0c12] hover:bg-gray-100 font-bold text-xs transition shadow-sm inline-flex items-center gap-2"
        >
          <Icon name="lucide:mail" class="w-4 h-4" />
          <span>Hubungi support@hertaditz.store</span>
        </a>
      </div>
    </div>
  </div>
</template>
