import env from '#start/env'
import { chromium, Browser } from '@playwright/test'

export const PLAYWRIGHT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'

export async function createBroswerPageInstance() {
  const browserlessUrl = env.get('BROWSERLESS_URL' as any)

  const browser: Browser = browserlessUrl
    ? await chromium.connectOverCDP(`${browserlessUrl}/?token=${env.get('BROWSERLESS_TOKEN' as any)}`)
    : await chromium.launch({ headless: true })

  const context = await browser.newContext({ userAgent: PLAYWRIGHT_USER_AGENT })
  const page = await context.newPage()

  return { browser, context, page }
}

export async function closeBroswerPageInstance(browser: Browser) {
  return browser.close()
}
