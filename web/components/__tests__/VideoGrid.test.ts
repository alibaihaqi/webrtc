import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VideoGrid from '../VideoGrid.vue'

const VideoTileStub = {
  template: '<div class="video-tile"><slot /><span class="tile-name">{{ name }}</span></div>',
  props: ['stream', 'name', 'muted', 'placeholder'],
}

describe('VideoGrid', () => {
  it('renders local VideoTile always', () => {
    const wrapper = mount(VideoGrid, {
      props: { localStream: null, remoteStream: null },
      global: { stubs: { VideoTile: VideoTileStub } },
    })

    expect(wrapper.findAll('.video-tile')).toHaveLength(1)
  })

  it('shows waiting message when no remote stream', () => {
    const wrapper = mount(VideoGrid, {
      props: { localStream: null, remoteStream: null },
      global: { stubs: { VideoTile: VideoTileStub } },
    })

    expect(wrapper.text()).toContain('Waiting for remote participant')
  })

  it('displays "You" label for local video', () => {
    const wrapper = mount(VideoGrid, {
      props: { localStream: null, remoteStream: null },
      global: { stubs: { VideoTile: VideoTileStub } },
    })

    expect(wrapper.text()).toContain('You')
  })

  it('renders two VideoTiles when remote stream is present', () => {
    const fakeStream = new MediaStream()
    const wrapper = mount(VideoGrid, {
      props: { localStream: fakeStream, remoteStream: fakeStream, remoteName: 'Alice' },
      global: { stubs: { VideoTile: VideoTileStub } },
    })

    expect(wrapper.findAll('.video-tile')).toHaveLength(2)
    expect(wrapper.text()).toContain('Alice')
  })

  it('displays remote name when stream is present', () => {
    const fakeStream = new MediaStream()
    const wrapper = mount(VideoGrid, {
      props: { localStream: fakeStream, remoteStream: fakeStream, remoteName: 'Bob' },
      global: { stubs: { VideoTile: VideoTileStub } },
    })

    expect(wrapper.text()).toContain('Bob')
  })
})
