<template>
  <section :class="`
      flex flex-col justify-around items-center w-[90%] h-96 px-8
      sm:max-w-lg border border-blue-500 rounded-lg shadow-md
    `"
  >
    <div class="flex flex-col items-center gap-4">
      <h1 class="text-3xl font-bold text-blue-500">
        WebRTC Alibaihaqi
      </h1>

      <h3
        v-if="firebase?.userInfo?.value?.displayName"
        class="text-sm text-gray-700"
      >
        Welcome, {{ firebase?.userInfo?.value?.displayName }}
      </h3>
    </div>

    <div class="flex flex-col gap-4 w-full">
      <template v-if="!firebase?.userInfo?.value">
        <SignInButton />
      </template>

      <template v-else>
        <Button
          title="Join a Meeting"
          btn-type="secondary"
          @on-click="onClickRoute()"
        />

        <Button
          title="Host a Meeting"
          @on-click="onClickRoute(true)"
        />

        <Button
          title="Sign Out"
          btn-type="error"
          size="medium"
          @on-click="firebase.userSignOut"
        />
      </template>
    </div>
  </section>
</template>

<script lang="ts" setup>
import Button from '@/components/Common/Button.vue'
import SignInButton from '@/components/Home/SignInButton.vue'
import { useFirebase } from '@/composables/firebase'

const firebase = useFirebase()
const router = useRouter()

const onClickRoute = async (isHost: boolean = false) => {
  const queryRoute = isHost ? '?host=true': ''
 
  try {
    await router.push(`/prepare${queryRoute}`)
  } catch (error) {
    console.log(error)
  }
}
</script>
