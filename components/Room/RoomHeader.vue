<template>
  <header class="flex justify-center items-center bg-gray-800 select-none py-2 px-4 sm:px-8">
    <div class="rounded-md">
      <p class="text-sm text-white">
        <span>Room ID: </span>
        <span
          class="hover:text-blue-400 hover:cursor-pointer"
          @click="onClickRoomId"
        >
          {{ roomId }}
        </span>
      </p>
    </div>

    <ClientOnly>
      <Teleport to="body">
        <section
          v-if="isShowAlert"
          class="absolute flex justify-center top-2 right-0 left-0 w-full"
        >
          <div class="w-[90%] sm:w-[50%] bg-blue-500 text-center rounded-md py-1 px-2 text-sm text-white">
            <span>Copy Room ID: </span>
            <span>{{ roomId }}</span>
          </div>
        </section>
      </Teleport>
    </ClientOnly>
  </header>
</template>

<script lang="ts" setup>
const props = defineProps<{
  roomId: string
}>()

const isShowAlert = ref(false)

const onClickRoomId = async () => {
  try {
    await navigator.clipboard.writeText(props.roomId)
    isShowAlert.value = true

    setTimeout(() => {
      isShowAlert.value = false
    }, 2000);
  } catch (error) {
    console.log('Error copy text:', error)
  }
}
</script>
