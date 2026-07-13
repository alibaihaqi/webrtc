import { describe, it, expect } from 'vitest'
import type {
  JoinRoomMessage,
  OfferMessage,
  AnswerMessage,
  IceCandidateMessage,
} from '../protocol'

describe('Protocol types', () => {
  it('should have correct message types', () => {
    const join: JoinRoomMessage = {
      type: 'join-room',
      roomId: 'room-1',
      from: 'user-1',
      displayName: 'Alice',
      timestamp: Date.now(),
    }
    expect(join.type).toBe('join-room')
  })

  it('should support offer messages', () => {
    const offer: OfferMessage = {
      type: 'offer',
      roomId: 'room-1',
      from: 'user-1',
      sdp: { type: 'offer', sdp: 'mock-sdp' },
      timestamp: Date.now(),
    }
    expect(offer.type).toBe('offer')
  })

  it('should support answer messages', () => {
    const answer: AnswerMessage = {
      type: 'answer',
      roomId: 'room-1',
      from: 'user-1',
      sdp: { type: 'answer', sdp: 'mock-sdp' },
      timestamp: Date.now(),
    }
    expect(answer.type).toBe('answer')
  })

  it('should support ice candidate messages', () => {
    const candidate: IceCandidateMessage = {
      type: 'ice-candidate',
      roomId: 'room-1',
      from: 'user-1',
      candidate: { candidate: 'mock-candidate', sdpMid: '0', sdpMLineIndex: 0 },
      timestamp: Date.now(),
    }
    expect(candidate.type).toBe('ice-candidate')
  })
})
