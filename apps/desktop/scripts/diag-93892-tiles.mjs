// 93892 repro probe: dump the raw shape of session tiles from the renderer.
import { attach } from './perf/lib/launch.mjs'

const { cdp, teardown } = await attach({ port: 9222 })

try {
  await cdp.send('Runtime.enable')

  const state = await cdp.eval(`(() => {
    const store = window.__HERMES_SESSION_TILES__
    if (!store) return JSON.stringify({ error: 'no tile store' })
    const entries = Object.entries(store.states())
    return JSON.stringify({
      count: entries.length,
      sample: entries.slice(-2).map(([id, t]) => ({ id, keys: Object.keys(t || {}), tile: t }))
    })
  })()`)

  console.log(state)
} finally {
  teardown?.()
}
