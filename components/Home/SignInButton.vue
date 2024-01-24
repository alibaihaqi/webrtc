<template>
  <button
    class="flex justify-center items-center border border-gray-500 py-2 px-4 gap-2 rounded hover:shadow-md hover:brightness-105"
    @click="onClickButtonSigninPopup"
  >
    <nuxt-img
      height="24"
      width="24"
      src="/imgs/google.png"
    />
    <span class="text-sm text-bold text-gray-800">
      Sign in with Google
    </span>
  </button>
</template>

<script lang="ts" setup>
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'

const googleAuthProvider = new GoogleAuthProvider()
const auth = useFirebaseAuth()! // only exists on client side
const error = ref<string | null>(null)

const onClickButtonSigninPopup = async () => {
  try {
    error.value = null
    const result = await signInWithPopup(auth, googleAuthProvider)
  } catch (reason) {
    error.value = reason as string
  }
}
</script>