<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h1 class="text-3xl font-bold text-center">WebRTC Video Call</h1>
        <p class="mt-2 text-center text-gray-600">Sign in to start a call</p>
      </div>
      <button
        @click="handleSignIn"
        :disabled="loading"
        class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span v-if="loading">Signing in...</span>
        <span v-else>Sign in with Google</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signInWithGoogle, loading } = useAuth()
const router = useRouter()

async function handleSignIn() {
  try {
    await signInWithGoogle()
    router.push('/')
  } catch (error) {
    console.error('Sign in failed:', error)
  }
}
</script>
