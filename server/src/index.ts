import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import { SignalingServer } from './signaling.js'
import { generateTurnCredentials } from './turn/credentials.js'

const PORT = parseInt(process.env.WS_PORT || '3001', 10)

const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', timestamp: Date.now() }))
    return
  }

  if (req.url === '/turn-credentials') {
    const secretKey = process.env.TURN_SECRET_KEY || ''
    if (!secretKey) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'TURN not configured' }))
      return
    }

    const { username, credential } = generateTurnCredentials(secretKey)
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ username, credential }))
    return
  }

  res.writeHead(404)
  res.end()
})

const wss = new WebSocketServer({ server })
const signaling = new SignalingServer(wss)

server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`)
})

export { server, wss, signaling }
