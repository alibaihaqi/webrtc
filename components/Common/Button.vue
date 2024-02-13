<script lang="ts" setup>
defineProps<{
  disabled?: boolean
  title: string
  btnType?: string
  size?: 'default' | 'medium' | 'small'
}>()

const emit = defineEmits(['onClick'])

const onClickHandler = () => {
  emit('onClick')
}
</script>

<template>
  <button
    :class="`
      py-1 rounded-md font-bold text-center
      hover:brightness-105 hover:shadow-md
      self-center w-full
      ${ btnType ? `btn-${btnType}` : 'btn-primary' }
      ${ size ? `s-${size}` : null }
    `"
    :disabled="disabled || false"
    @click="onClickHandler"
  >
    {{ title }}
  </button>
</template>

<style scoped>
.btn-primary {
  @apply bg-blue-500 text-white disabled:bg-gray-500 disabled:hover:brightness-100;
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
