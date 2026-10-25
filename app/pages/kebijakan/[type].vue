<script setup lang="ts">
const route = useRoute()

const policyType = computed(() => (route.params.type as string)?.toLowerCase() || 'lisensi')

const policyTitles: Record<string, string> = {
  lisensi: 'Ketentuan Lisensi Produk Digital',
  refund: 'Kebijakan Pengembalian Dana (Refund)',
  syarat: 'Syarat dan Ketentuan Layanan',
  privasi: 'Kebijakan Privasi Pengguna',
}

const title = computed(() => policyTitles[policyType.value] || 'Kebijakan Toko')
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-8 py-6">
    <div class="border-b border-white/5 pb-4">
      <NuxtLink to="/" class="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition mb-3">
        <Icon name="lucide:arrow-left" class="w-3.5 h-3.5" />
        <span>Kembali ke Beranda</span>
      </NuxtLink>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
        {{ title }}
      </h1>
      <p class="text-xs text-gray-400 mt-1">Terakhir diperbarui: 24 Oktober 2026</p>
    </div>

    <!-- Content Card -->
    <div class="bg-[#181926] border border-white/10 rounded-[32px] p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-gray-300 leading-relaxed">
      <!-- License Content -->
      <div v-if="policyType === 'lisensi'" class="space-y-4">
        <h2 class="text-base font-bold text-white">1. Cakupan Lisensi Standar</h2>
        <p>
          Setiap pembelian produk digital di HertaDitz Store memberikan hak lisensi non-eksklusif, berlaku selamanya untuk 1 (satu) entitas pengguna atau organisasi dalam menciptakan produk akhir (end product).
        </p>

        <h2 class="text-base font-bold text-white pt-2">2. Yang Diperbolehkan</h2>
        <ul class="list-disc pl-5 space-y-1.5 text-gray-300">
          <li>Menggunakan template website untuk proyek personal maupun website klien.</li>
          <li>Memodifikasi teks, warna, aset visual, dan kode sumber template sesuai kebutuhan.</li>
          <li>Menggunakan stiker dan poster untuk keperluan promosi sosial media, avatar, dan streaming.</li>
        </ul>

        <h2 class="text-base font-bold text-white pt-2">3. Batasan dan Larangan</h2>
        <ul class="list-disc pl-5 space-y-1.5 text-rose-300">
          <li>Dilarang menjual ulang, mendistribusikan ulang, atau menyebarkan file aset asli dalam bentuk apapun.</li>
          <li>Dilarang mengunggah file source code ke repository publik (GitHub/GitLab) tanpa proteksi akses.</li>
        </ul>
      </div>

      <!-- Refund Content -->
      <div v-else-if="policyType === 'refund'" class="space-y-4">
        <h2 class="text-base font-bold text-white">Ketentuan Pengembalian Dana (Refund)</h2>
        <p>
          Karena produk yang kami sediakan adalah barang digital yang dapat langsung diunduh dan digunakan seketika setelah pembayaran terkonfirmasi, kami menerapkan kebijakan refund dengan ketentuan sebagai berikut:
        </p>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>File Rusak / Corrupt:</strong> Jika file yang diunduh terbukti rusak dan tim kami tidak dapat memberikan file pengganti yang berfungsi dalam waktu 2x24 jam, pembeli berhak menerima pengembalian dana 100%.</li>
          <li><strong>Ketidaksesuaian Deskripsi:</strong> Pengajuan refund harus disertai bukti jelas perbedaan signifikan antara deskripsi produk dengan file yang diterima.</li>
          <li><strong>Pembayaran Ganda:</strong> Jika terjadi transaksi terdebit ganda untuk pesanan yang sama, kelebihan bayar akan dikembalikan sepenuhnya melalui verifikasi Midtrans.</li>
        </ul>
      </div>

      <!-- General Terms & Privacy -->
      <div v-else class="space-y-4">
        <h2 class="text-base font-bold text-white">Ketentuan Umum & Privasi</h2>
        <p>
          HertaDitz Store menjamin keamanan data pribadi pembeli. Alamat email yang Anda masukkan hanya digunakan untuk pengiriman tanda terima pembelian, notifikasi link unduhan, dan pengamanan akses digital. Kami tidak pernah membagikan atau menjual data Anda kepada pihak ketiga manapun.
        </p>
      </div>
    </div>
  </div>
</template>
