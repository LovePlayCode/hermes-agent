// 93892 probe: which profile is ACTIVE on the profile rail right now?
import { attach } from './perf/lib/launch.mjs'

const { cdp, teardown } = await attach({ port: 9222 })

try {
  await cdp.send('Runtime.enable')

  const state = await cdp.eval(`(() => {
    const rail = document.querySelector('[data-slot="profile-rail"]')
    if (!rail) return JSON.stringify({ error: 'no rail' })
    const buttons = [...rail.querySelectorAll('button, [role="button"], a')].map(b => ({
      label: (b.getAttribute('aria-label') || b.title || b.textContent || '').trim().slice(0, 40),
      active:
        b.getAttribute('aria-current') ||
        b.getAttribute('data-active') ||
        b.getAttribute('data-state') ||
        (/active|selected|current|primary/i.test(b.className) ? 'class-match' : null)
    }))
    return JSON.stringify({ buttons })
  })()`)

  console.log(state)
} finally {
  teardown?.()
}
