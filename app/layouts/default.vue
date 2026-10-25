<template>
  <div class="min-h-screen p-3 sm:p-6 md:p-10 flex items-center justify-center">
    <!-- Outer Bezel Frame inspired by Ethereal Dashboard -->
    <div
      class="w-full max-w-[1240px] bg-[#090a0f] rounded-[32px] sm:rounded-[44px] p-3 sm:p-6 md:p-8 border-[4px] sm:border-[8px] border-[#1f212d] shadow-[0_35px_90px_rgba(0,0,0,0.85)] relative overflow-hidden"
    >
      <!-- Navigation Bar -->
      <UiAppNavbar />

      <!-- Main Slot Content -->
      <main class="min-h-[60vh]">
        <slot />
      </main>

      <!-- Store Footer -->
      <UiAppFooter />

      <!-- Global Floating Toast Notification -->
      <UiAppToast />
    </div>
  </div>
</template>
