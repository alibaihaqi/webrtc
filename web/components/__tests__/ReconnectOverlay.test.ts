import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReconnectOverlay from '../ReconnectOverlay.vue'

describe('ReconnectOverlay', () => {
  it('shows when reconnecting', () => {
    const wrapper = mount(ReconnectOverlay, {
      props: {
        isReconnecting: true,
        attempt: 1,
        maxAttempts: 3,
      },
    })

    expect(wrapper.text()).toContain('Reconnecting')
    expect(wrapper.text()).toContain('Attempt 1 of 3')
  })

  it('hides when not reconnecting', () => {
    const wrapper = mount(ReconnectOverlay, {
      props: {
        isReconnecting: false,
        attempt: 0,
        maxAttempts: 3,
      },
    })

    expect(wrapper.text()).not.toContain('Reconnecting')
  })

  it('shows end call button after max attempts', () => {
    const wrapper = mount(ReconnectOverlay, {
      props: {
        isReconnecting: true,
        attempt: 3,
        maxAttempts: 3,
      },
    })

    expect(wrapper.text()).toContain('End Call')
  })

  it('emits giveUp event when end call clicked', async () => {
    const wrapper = mount(ReconnectOverlay, {
      props: {
        isReconnecting: true,
        attempt: 3,
        maxAttempts: 3,
      },
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('giveUp')).toBeTruthy()
  })
})
