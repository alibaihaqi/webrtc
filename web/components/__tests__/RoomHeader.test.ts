import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RoomHeader from '../RoomHeader.vue'

describe('RoomHeader', () => {
  it('displays room name', () => {
    const wrapper = mount(RoomHeader, {
      props: {
        roomName: 'test-room',
        participantCount: 2,
        status: 'connected',
      },
    })

    expect(wrapper.text()).toContain('test-room')
  })

  it('displays participant count', () => {
    const wrapper = mount(RoomHeader, {
      props: {
        roomName: 'test-room',
        participantCount: 2,
        status: 'connected',
      },
    })

    expect(wrapper.text()).toContain('2 participants')
  })

  it('displays status', () => {
    const wrapper = mount(RoomHeader, {
      props: {
        roomName: 'test-room',
        participantCount: 2,
        status: 'connected',
      },
    })

    expect(wrapper.text()).toContain('connected')
  })
})
