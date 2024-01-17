<template>
  <button
    :class="`
      py-1 rounded-md font-bold text-center
      hover:brightness-105 hover:shadow-md
      self-center w-full
      ${ btnType ? `btn-${btnType}` : 'btn-primary' }
      ${ size ? `s-${size}` : null }
    `"
    @click="onClickHandler"
  >
    {{ title }}
  </button>
</template>

<script lang="ts" setup>
defineProps<{
  title: string
  btnType?: string
  size?: 'default' | 'medium' | 'small'
}>()

const emit = defineEmits(['onClick'])

const onClickHandler = () => {
  emit('onClick')
}
</script>

<style scoped>
.btn-primary {
  @apply bg-blue-500 text-white;
}

.btn-secondary {
  @apply bg-white text-blue-500 border border-blue-500;
}

.btn-error {
  @apply bg-white text-red-500 border border-red-500;
}

.s-default {
  @apply max-w-[100%];
}

.s-medium {
  @apply max-w-[50%];
}
.s-small {
  @apply max-w-[25%];
}
</style>
