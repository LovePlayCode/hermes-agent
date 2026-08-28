// 93892 repro watcher: 90s of renderer WebSocket lifecycle + reclaimed frames.
import { attach } from './perf/lib/launch.mjs'

const DURATION_MS = Number(process.argv[2] ?? 90_000)
const { cdp, teardown } = await attach({ port: 9222 })
const log = []
const t0 = Date.now()
const stamp = () => new Date().toISOString().slice(11, 19)
const sockets = new Map()

try {
  await cdp.send('Network.enable')
  await cdp.send('Runtime.enable')

  cdp.on('Network.webSocketCreated', p => {
    sockets.set(p.identifier, p.url)
    log.push(`[${stamp()}] +WS ${p.url.replace(/^ws:\/\/[^/]+/, '').slice(0, 80)}`)
  })

  cdp.on('Network.webSocketClosed', p => {
    log.push(`[${stamp()}] -WS ${String(sockets.get(p.identifier) ?? p.identifier).replace(/^ws:\/\/[^/]+/, '').slice(0, 80)}`)
    sockets.delete(p.identifier)
  })

  cdp.on('Network.webSocketFrameReceived', p => {
    const s = String(p.response?.payload ?? '')

    if (s.includes('reclaimed')) {
      log.push(`[${stamp()}] RECLAIM-FRAME ${s.slice(0, 220)}`)
    }
  })

  cdp.on('Runtime.consoleAPICalled', p => {
    const text = (p.args ?? []).map(a => a.value ?? a.description ?? '').join(' ')

    if (/reclaim|prune|93892/i.test(text)) {
      log.push(`[${stamp()}] CONSOLE ${text.slice(0, 200)}`)
    }
  })

  while (Date.now() - t0 < DURATION_MS) {
    await new Promise(r => setTimeout(r, 1_000))
  }

  console.log(`=== ${DURATION_MS / 1000}s watch complete: ${log.length} events ===`)
  console.log(log.join('\n') || '(no events captured)')
} finally {
  teardown?.()
}
