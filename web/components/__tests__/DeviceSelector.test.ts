import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DeviceSelector from '../DeviceSelector.vue'
import { useMedia } from '../../composables/useMedia'

const mockSwitchCamera = vi.fn().mockResolvedValue(true)
const mockSwitchMicrophone = vi.fn().mockResolvedValue(true)

vi.mock('../../composables/useMedia', () => ({
  useMedia: vi.fn(() => ({
    devices: { value: [] },
    activeCameraId: { value: '' },
    activeMicrophoneId: { value: '' },
    switchCamera: mockSwitchCamera,
    switchMicrophone: mockSwitchMicrophone,
  })),
}))

describe('DeviceSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMedia).mockReturnValue({
      devices: { value: [] },
      activeCameraId: { value: '' },
      activeMicrophoneId: { value: '' },
      switchCamera: mockSwitchCamera,
      switchMicrophone: mockSwitchMicrophone,
    } as any)
  })

  it('renders toggle button', () => {
    const wrapper = mount(DeviceSelector)
    expect(wrapper.find('.device-toggle').exists()).toBe(true)
  })

  it('does not show dropdown by default', () => {
    const wrapper = mount(DeviceSelector)
    expect(wrapper.find('.device-dropdown').exists()).toBe(false)
  })

  it('shows dropdown when toggle is clicked', async () => {
    const wrapper = mount(DeviceSelector)
    await wrapper.find('.device-toggle').trigger('click')
    expect(wrapper.find('.device-dropdown').exists()).toBe(true)
  })

  it('hides dropdown when toggle is clicked again', async () => {
    const wrapper = mount(DeviceSelector)
    await wrapper.find('.device-toggle').trigger('click')
    await wrapper.find('.device-toggle').trigger('click')
    expect(wrapper.find('.device-dropdown').exists()).toBe(false)
  })

  it('renders camera and microphone sections', async () => {
    const wrapper = mount(DeviceSelector)
    await wrapper.find('.device-toggle').trigger('click')
    expect(wrapper.findAll('.device-section')).toHaveLength(2)
  })

  it('renders labels for camera and microphone', async () => {
    const wrapper = mount(DeviceSelector)
    await wrapper.find('.device-toggle').trigger('click')
    const labels = wrapper.findAll('.device-label')
    expect(labels[0].text()).toBe('Camera')
    expect(labels[1].text()).toBe('Microphone')
  })

  it('renders select elements for camera and microphone', async () => {
    const wrapper = mount(DeviceSelector)
    await wrapper.find('.device-toggle').trigger('click')
    expect(wrapper.findAll('select')).toHaveLength(2)
  })
})

describe('DeviceSelector with devices', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders camera options from devices', async () => {
    vi.mocked(useMedia).mockReturnValue({
      devices: { value: [
        { deviceId: 'cam1', kind: 'videoinput', label: 'Front Camera' } as MediaDeviceInfo,
        { deviceId: 'mic1', kind: 'audioinput', label: 'Built-in Mic' } as MediaDeviceInfo,
      ]},
      activeCameraId: { value: 'cam1' },
      activeMicrophoneId: { value: 'mic1' },
      switchCamera: mockSwitchCamera,
      switchMicrophone: mockSwitchMicrophone,
    } as any)

    const wrapper = mount(DeviceSelector)
    await wrapper.find('.device-toggle').trigger('click')

    const selects = wrapper.findAll('select')
    expect(selects[0].findAll('option')).toHaveLength(1)
    expect(selects[0].find('option').text()).toBe('Front Camera')
    expect(selects[1].findAll('option')).toHaveLength(1)
    expect(selects[1].find('option').text()).toBe('Built-in Mic')
  })

  it('calls switchCamera when camera selection changes', async () => {
    vi.mocked(useMedia).mockReturnValue({
      devices: { value: [
        { deviceId: 'cam1', kind: 'videoinput', label: 'Camera 1' } as MediaDeviceInfo,
        { deviceId: 'cam2', kind: 'videoinput', label: 'Camera 2' } as MediaDeviceInfo,
      ]},
      activeCameraId: { value: 'cam1' },
      activeMicrophoneId: { value: '' },
      switchCamera: mockSwitchCamera,
      switchMicrophone: mockSwitchMicrophone,
    } as any)

    const wrapper = mount(DeviceSelector)
    await wrapper.find('.device-toggle').trigger('click')

    const cameraSelect = wrapper.findAll('select')[0]
    await cameraSelect.setValue('cam2')

    expect(mockSwitchCamera).toHaveBeenCalledWith('cam2')
  })

  it('calls switchMicrophone when microphone selection changes', async () => {
    vi.mocked(useMedia).mockReturnValue({
      devices: { value: [
        { deviceId: 'mic1', kind: 'audioinput', label: 'Mic 1' } as MediaDeviceInfo,
        { deviceId: 'mic2', kind: 'audioinput', label: 'Mic 2' } as MediaDeviceInfo,
      ]},
      activeCameraId: { value: '' },
      activeMicrophoneId: { value: 'mic1' },
      switchCamera: mockSwitchCamera,
      switchMicrophone: mockSwitchMicrophone,
    } as any)

    const wrapper = mount(DeviceSelector)
    await wrapper.find('.device-toggle').trigger('click')

    const micSelect = wrapper.findAll('select')[1]
    await micSelect.setValue('mic2')

    expect(mockSwitchMicrophone).toHaveBeenCalledWith('mic2')
  })

  it('shows fallback label when device has no label', async () => {
    vi.mocked(useMedia).mockReturnValue({
      devices: { value: [
        { deviceId: 'abc123def456', kind: 'videoinput', label: '' } as MediaDeviceInfo,
      ]},
      activeCameraId: { value: '' },
      activeMicrophoneId: { value: '' },
      switchCamera: mockSwitchCamera,
      switchMicrophone: mockSwitchMicrophone,
    } as any)

    const wrapper = mount(DeviceSelector)
    await wrapper.find('.device-toggle').trigger('click')

    const option = wrapper.findAll('select')[0].find('option')
    expect(option.text()).toBe('Camera abc123de')
  })

  it('filters devices by kind correctly', async () => {
    vi.mocked(useMedia).mockReturnValue({
      devices: { value: [
        { deviceId: 'cam1', kind: 'videoinput', label: 'Camera' } as MediaDeviceInfo,
        { deviceId: 'mic1', kind: 'audioinput', label: 'Mic' } as MediaDeviceInfo,
      ]},
      activeCameraId: { value: '' },
      activeMicrophoneId: { value: '' },
      switchCamera: mockSwitchCamera,
      switchMicrophone: mockSwitchMicrophone,
    } as any)

    const wrapper = mount(DeviceSelector)
    await wrapper.find('.device-toggle').trigger('click')

    const selects = wrapper.findAll('select')
    expect(selects[0].findAll('option')).toHaveLength(1)
    expect(selects[1].findAll('option')).toHaveLength(1)
  })
})
