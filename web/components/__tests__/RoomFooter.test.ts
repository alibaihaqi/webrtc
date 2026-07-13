import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RoomFooter from '../RoomFooter.vue'

describe('RoomFooter', () => {
  it('renders control buttons', () => {
    const wrapper = mount(RoomFooter, {
      props: {
        isMuted: false,
        isVideoOff: false,
      },
    })

    expect(wrapper.findAll('button')).toHaveLength(3)
  })

  it('emits toggleMute event', async () => {
    const wrapper = mount(RoomFooter, {
      props: {
        isMuted: false,
        isVideoOff: false,
      },
    })

    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('toggleMute')).toBeTruthy()
  })

  it('emits toggleVideo event', async () => {
    const wrapper = mount(RoomFooter, {
      props: {
        isMuted: false,
        isVideoOff: false,
      },
    })

    await wrapper.findAll('button')[1].trigger('click')
    expect(wrapper.emitted('toggleVideo')).toBeTruthy()
  })

  it('emits hangup event', async () => {
    const wrapper = mount(RoomFooter, {
      props: {
        isMuted: false,
        isVideoOff: false,
      },
    })

    await wrapper.findAll('button')[2].trigger('click')
    expect(wrapper.emitted('hangup')).toBeTruthy()
  })
})
