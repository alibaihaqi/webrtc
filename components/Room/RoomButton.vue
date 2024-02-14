<script lang="ts" setup>
import type { IRoomActionButton } from '@/interfaces/room.interface'

const props = defineProps<{
  isActive: boolean
  sources: IRoomActionButton[]
}>()

const generateData = computed(() => {
  return props.sources.find((source) => source.isActive === props.isActive)
})

const emit = defineEmits(['onClick'])

const onClickHandler = () => {
  emit('onClick')
}
</script>

<template>
  <div
    :class="`
      w-24 sm:w-28 flex flex-col items-center gap-1 hover:bg-gray-700
      pt-2 pb-1 px-4 sm:px-6 rounded-md cursor-pointer
    `"
    @click="onClickHandler"
  >
    <nuxt-img
      class="w-5"
      :src="generateData?.iconPath"
    />
    <p class="text-xs text-gray-400">
      {{ generateData?.title }}
    </p>
  </div>
</template>