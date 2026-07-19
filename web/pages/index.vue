<template>
  <div class="min-h-screen bg-slate-900">
    <TopBar />
    <main class="max-w-4xl mx-auto px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <NewMeetingCard />
        <JoinMeetingCard />
      </div>

      <section>
        <h2 class="text-sm font-medium text-frost-teal uppercase tracking-wider mb-4">Recent meetings</h2>
        <BaseCard>
          <p class="text-frost-teal/50 text-sm text-center py-4">No recent meetings yet</p>
        </BaseCard>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})
</script>
