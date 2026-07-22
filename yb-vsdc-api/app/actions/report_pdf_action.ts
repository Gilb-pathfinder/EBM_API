import drive from '@adonisjs/drive/services/main'
import { readFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DateTime } from 'luxon'
import { chromium } from 'playwright-core'

export class ReportPdfAction {
  /**
   * Renders HTML to a PDF, saves it to drive storage, and returns a public URL.
   *
   * Uses locally installed Google Chrome via playwright-core.
   * Requires Chrome to be installed on the server (standard Google Chrome install).
   */
  static async generateAndStore(reportName: string, html: string): Promise<string> {
    const browser = await chromium.launch({ channel: 'chrome' })
    const page = await browser.newPage()

    const timestamp = DateTime.now().toMillis()
    const tmpDir = join(tmpdir(), `report-${timestamp}`)
    await mkdir(tmpDir, { recursive: true })
    const tmpPath = join(tmpDir, `${reportName}.pdf`)

    try {
      await page.setContent(html, { waitUntil: 'networkidle' })
      await page.emulateMedia({ media: 'print' })
      await page.pdf({ path: tmpPath, format: 'A4', printBackground: true })
    } finally {
      await browser.close()
    }

    const fileBuffer = await readFile(tmpPath)
    const drivePath = `reports/${reportName}-${timestamp}.pdf`

    await drive.use().put(drivePath, fileBuffer, { contentType: 'application/pdf' })

    return drive.use().getUrl(drivePath)
  }
}
