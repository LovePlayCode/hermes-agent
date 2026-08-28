/** Temporary probe for #93892. Grep desktop.log / DevTools for `[93892]`. */
export function log93892(step: string, data?: Record<string, unknown>): void {
  if (data) {
    console.log(`[93892] ${step}`, data)
  } else {
    console.log(`[93892] ${step}`)
  }
}
