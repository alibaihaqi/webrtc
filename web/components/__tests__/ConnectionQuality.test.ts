import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConnectionQuality from '../ConnectionQuality.vue'

describe('ConnectionQuality', () => {
  it('shows good indicator for good quality', () => {
    const wrapper = mount(ConnectionQuality, {
      props: {
        level: 'good',
        bitrate: 1000000,
        packetLoss: 0.5,
      },
    })

    expect(wrapper.text()).toContain('Good connection')
    expect(wrapper.find('.bg-green-500').exists()).toBe(true)
  })

  it('shows fair indicator for fair quality', () => {
    const wrapper = mount(ConnectionQuality, {
      props: {
        level: 'fair',
        bitrate: 500000,
        packetLoss: 2,
      },
    })

    expect(wrapper.text()).toContain('Fair connection')
    expect(wrapper.find('.bg-yellow-500').exists()).toBe(true)
  })

  it('shows poor indicator for poor quality', () => {
    const wrapper = mount(ConnectionQuality, {
      props: {
        level: 'poor',
        bitrate: 100000,
        packetLoss: 10,
      },
    })

    expect(wrapper.text()).toContain('Poor connection')
    expect(wrapper.find('.bg-red-500').exists()).toBe(true)
  })
})
