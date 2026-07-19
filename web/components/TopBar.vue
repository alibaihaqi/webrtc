<template>
  <header class="flex items-center justify-between h-16 px-6 border-b border-white/10 bg-slate-900">
    <h1 class="text-lg font-semibold text-frost-white">WebRTC</h1>
    <div class="flex items-center gap-3">
      <BaseAvatar :name="userName" size="sm" />
      <button
        @click="handleSignOut"
        class="text-frost-teal hover:text-frost-white text-sm transition-colors"
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
