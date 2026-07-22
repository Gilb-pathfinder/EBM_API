import Receipt from '#models/receipt'
import env from '#start/env'
import router from '@adonisjs/core/services/router'
import { tmpdir } from 'os'
import { join } from 'path'
import { PrintPaperSize } from '#types/index'
import { DateTime } from 'luxon'
import { createBroswerPageInstance } from '#helpers/scrapping_helper'

export class ReceiptAction {
  static async generateLink(id: string, userId: string) {
    const [link] = await Promise.all([
      router.builder().prefixUrl(env.get('BASE_URL')).params({ id }).make('user.receipt'),
      Receipt.create({saleId: id, userId })
    ])

    return link
  }

  static async generatePdf(title: string, html: string, format: PrintPaperSize) {
    const { browser, page } = await createBroswerPageInstance()
    const path = join(tmpdir(), `${DateTime.now().toMillis()}/${title}.pdf`)

    try {
      await Promise.all([page.setContent(html, { waitUntil: 'networkidle' }), page.emulateMedia({ media: 'print' })])

      // Puppeteer has no 'Roll' format — must use explicit width/height for thermal paper
      if (format === PrintPaperSize.Roll) {
        await page.pdf({ path, width: '80mm', height: '297mm', printBackground: false })
      } else {
        await page.pdf({ path, format, printBackground: false })
      }
    } finally {
      await browser.close()
    }

    return path
  }
}
