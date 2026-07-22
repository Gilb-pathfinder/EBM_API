import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import SaleQueue from '#models/sale_queue'
import { EbmTransactionService } from '#services/ebm/ebm_transaction_service'
import { EbmApiResponseCode, EbmDefaultResponse } from '#types/ebm/ebm_type'
import { SaleEbmResponseData } from '#types/ebm/ebm_service_type'
import { StockAction } from '#actions/stock_action'
import { convertEbmLastRequestDateToDt } from '#helpers/ebm_helper'
import { DateTime } from 'luxon'

export default class UserQueueController {
  async status({ auth }: HttpContext) {
    const usr = auth.user as User
    const [pending, failed] = await Promise.all([
      SaleQueue.query().where('userId', usr.id).where('status', 'pending').count('* as total'),
      SaleQueue.query().where('userId', usr.id).where('status', 'failed').count('* as total'),
    ])
    return {
      pending: Number((pending[0] as any).$extras.total ?? 0),
      failed:  Number((failed[0]  as any).$extras.total ?? 0),
    }
  }

  async flush({ response, auth }: HttpContext) {
    const usr = auth.user as User

    const items = await SaleQueue.query()
      .where('userId', usr.id)
      .where('status', 'pending')
      .orderBy('queuedAt', 'asc')

    if (items.length === 0) return { flushed: 0, failed: 0, message: 'Queue is empty.' }

    let flushed = 0
    let failed = 0

    for (const item of items) {
      item.status = 'processing'
      item.attemptCount += 1
      await item.save()

      try {
        const res = (await new EbmTransactionService(usr).SaveSale(item.salePayload)) as EbmDefaultResponse & {
          data: SaleEbmResponseData
        }

        if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
          usr.lastSaleInvoiceNo = res.data.rcptNo
          usr.ebmLastOnlineAt = DateTime.now()
          usr.lastRcptSign = res.data.rcptSign ?? null
          usr.lastIntrlData = res.data.intrlData ?? null

          const payload = item.salePayload
          await usr.related('sales').create({
            ...payload,
            invoiceNo: item.invoiceNo,
            items: { data: payload.items },
            confirmationDate: convertEbmLastRequestDateToDt(payload.confirmationDate),
            stockReleaseDate: payload.confirmationDate
              ? convertEbmLastRequestDateToDt(payload.confirmationDate)
              : null,
            saleDate: DateTime.fromFormat(payload.saleDate, 'yyyyMMdd'),
            ebmSaleData: res.data,
            resultDt: res.resultDt,
            previousRcptSign: item.previousRcptSign,
            previousIntrlData: item.previousIntrlData,
          })

          await StockAction.decrementStock(usr, payload.items)
          await usr.save()

          item.status = 'done'
          item.processedAt = DateTime.now()
          flushed++
        } else {
          item.status = 'failed'
          item.lastError = res.resultMsg ?? 'EBM rejected the sale'
          failed++
        }
      } catch (err: any) {
        item.status = 'failed'
        item.lastError = err?.message ?? 'Unknown error'
        failed++
      }

      await item.save()
    }

    return { flushed, failed, message: `Processed ${items.length} queued sale(s).` }
  }
}
