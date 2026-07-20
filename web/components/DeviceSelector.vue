<template>
  <div class="device-selector">
    <button @click="isOpen = !isOpen" class="device-toggle">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
      </svg>
    </button>

    <div v-if="isOpen" class="device-dropdown">
      <div class="device-section">
        <label class="device-label">Camera</label>
        <select
          :value="activeCameraId"
          @change="handleCameraChange"
          class="device-select"
        >
          <option v-for="camera in cameras" :key="camera.deviceId" :value="camera.deviceId">
            {{ camera.label || `Camera ${camera.deviceId.slice(0, 8)}` }}
          </option>
        </select>
      </div>

      <div class="device-section">
        <label class="device-label">Microphone</label>
        <select
          :value="activeMicrophoneId"
          @change="handleMicrophoneChange"
          class="device-select"
        >
          <option v-for="mic in microphones" :key="mic.deviceId" :value="mic.deviceId">
            {{ mic.label || `Microphone ${mic.deviceId.slice(0, 8)}` }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMedia } from '~/composables/useMedia'

const { devices, activeCameraId, activeMicrophoneId, switchCamera, switchMicrophone } = useMedia()

const isOpen = ref(false)

const cameras = computed(() =>
  devices.value.filter(d => d.kind === 'videoinput')
)

const microphones = computed(() =>
  devices.value.filter(d => d.kind === 'audioinput')
)

async function handleCameraChange(event: Event) {
  const target = event.target as HTMLSelectElement
  await switchCamera(target.value)
}

async function handleMicrophoneChange(event: Event) {
  const target = event.target as HTMLSelectElement
  await switchMicrophone(target.value)
}
</script>

<style scoped>
.device-selector {
  position: relative;
}

.device-toggle {
  @apply p-2 rounded-full bg-elevated hover:bg-hover text-fg-primary transition-colors;
}

.device-dropdown {
  @apply absolute bottom-full right-0 mb-2 w-64 bg-surface rounded-lg shadow-lg p-3;
}

.device-section {
  @apply mb-3 last:mb-0;
}

.device-label {
  @apply block text-xs text-fg-tertiary mb-1;
}

.device-select {
  @apply w-full bg-elevated text-fg-primary rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent;
}
</style>
