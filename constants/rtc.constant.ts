
export const rtcPeerConfiguration = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
}

export const defaultMediaStreamConstraints = {
  audio: true,
  video: {
    width: 480,
    height: 360,
  },
}
