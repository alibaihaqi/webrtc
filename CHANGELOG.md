# Changelog

## 2026-07-15 — v0.2 Reliability shipped

- **Connection Resilience:** Heartbeat ping/pong (30s), reconnection with exponential backoff (1s→16s, max 5 attempts), ICE restart with auto-recovery (max 3 attempts)
- **Device Switching:** Device enumeration + camera/mic switching in `useMedia`, track replacement via `sender.replaceTrack()` in `useWebRTC`, `DeviceSelector` component in RoomFooter
- **Redis Room Persistence:** `RedisRoomManager` with TTL-based expiry, cleanup scheduling, in-memory fallback, graceful degradation
- **Self-Hosted TURN (coturn):** HMAC-SHA1 credential generation, `getTurnConfig()` with env-based config, frontend TURN integration with async `createPeerConnection`
- **Elastic APM Monitoring:** env-gated APM init, custom metrics (room joins/leaves, WebSocket connections), error capture
- **Infrastructure:** Multi-stage Dockerfile, docker-compose (signaling + Redis + coturn), K8s manifests (Deployments, Services, ConfigMaps, Secrets, PVCs, probes), ArgoCD applications (3 apps), GitHub Actions Docker CI
- **Tests:** 103 web tests, 101 server tests (1 pre-existing health test failure)

## 2026-07-13 — v0.1 COMPLETE

- Full pipeline run (brainstorm → spec → CEO review → eng review → implementation plan → 12 subagent execution units)
- Monorepo scaffold with pnpm workspaces, Nuxt 4 frontend + Node.js signaling server (ws library)
- Firebase Auth (Google OAuth), WebRTC core (useMedia, useWebRTC, useSignaling)
- Call UI (VideoGrid, VideoTile, RoomHeader, RoomFooter, ReconnectOverlay)
- Connection quality monitoring (useQuality), TURN credential generation (HMAC), rate limiting, error handling
- Deployment config (Vercel + Railway), integration tests
- 59 web tests, 45 server tests
