import {
  getAuth,
  signOut,
} from 'firebase/auth'
import { useCurrentUser } from 'vuefire'

export const useFirebase = () => {
  const userInfo = useCurrentUser()
  const userSignOut = () => {
    const auth = getAuth()

    return signOut(auth)
  }

  return {
    userInfo,
    userSignOut,
  }
}
