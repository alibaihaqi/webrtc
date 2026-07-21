# TODOs

## Done
- [x] v0.1 — WebRTC core, Firebase auth, call UI, signaling server, TURN, quality
- [x] v0.2 — Reliability (heartbeat, reconnect backoff, ICE restart, device switch, Redis rooms, coturn, APM, K8s manifests)
- [x] UI redesign — Frost design system, dashboard landing, room UI polish, chat sidebar (106 web tests green)

## Planned
- [ ] Deploy to K8s (signaling + Redis + coturn)
- [ ] Wire SignalingServer to getRoomManager() factory (Redis vs in-memory)
- [ ] Add jitter to reconnection backoff
