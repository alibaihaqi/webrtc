import { ref, onMounted } from 'vue'
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, type User } from 'firebase/auth'

const user = ref<User | null>(null)
const loading = ref(true)

export function useAuth() {
  const auth = getAuth()

  onMounted(() => {
    onAuthStateChanged(auth, (u) => {
      user.value = u
      loading.value = false
    })
  })

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  function signOut() {
    return auth.signOut()
  }

  return { user, loading, signInWithGoogle, signOut }
}
