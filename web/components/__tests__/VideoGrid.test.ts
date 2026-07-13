import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VideoGrid from '../VideoGrid.vue'

describe('VideoGrid', () => {
  it('renders local and remote video elements', () => {
    const wrapper = mount(VideoGrid, {
      props: {
        localStream: null,
        remoteStream: null,
      },
    })

    expect(wrapper.findAll('video')).toHaveLength(2)
  })

  it('shows waiting message when no remote stream', () => {
    const wrapper = mount(VideoGrid, {
      props: {
        localStream: null,
        remoteStream: null,
      },
    })

    expect(wrapper.text()).toContain('Waiting for remote participant')
  })

  it('displays "You" label for local video', () => {
    const wrapper = mount(VideoGrid, {
      props: {
        localStream: null,
        remoteStream: null,
      },
    })

    expect(wrapper.text()).toContain('You')
  })

  it('displays "Remote" label for remote video', () => {
    const wrapper = mount(VideoGrid, {
      props: {
        localStream: null,
        remoteStream: null,
      },
    })

    expect(wrapper.text()).toContain('Remote')
  })
})
