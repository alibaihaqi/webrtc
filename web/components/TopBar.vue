<template>
  <header class="flex items-center justify-between h-16 px-6 border-b border-white/10 bg-canvas">
    <h1 class="text-lg font-semibold text-fg-primary">WebRTC</h1>
    <div class="flex items-center gap-3">
      <BaseAvatar :name="userName" size="sm" />
      <button
        @click="handleSignOut"
        class="text-fg-secondary hover:text-fg-primary text-sm transition-colors"
      >
        Sign out
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { user, signOut } = useAuth()
const router = useRouter()

const userName = computed(() => user.value?.displayName || 'User')

async function handleSignOut() {
  await signOut()
  router.push('/login')
}
</script>
