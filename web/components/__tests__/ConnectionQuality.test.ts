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
    expect(wrapper.find('.bg-success').exists()).toBe(true)
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
    expect(wrapper.find('.bg-warning').exists()).toBe(true)
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
    expect(wrapper.find('.bg-danger').exists()).toBe(true)
  })
})
