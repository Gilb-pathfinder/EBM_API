import { getEbmPaymentMethodDescription, getMainItemGroup } from '#helpers/ebm_helper'
import User from '#models/user'
import Purchase from '#models/purchase'
import { PaymentSummary } from '#types/index'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { closingStockValidator, periodReportValidator, purchaseReportValidator } from '#validators/user_report_validator'
import { EbmStockInOutType } from '#types/ebm/ebm_type'
import { ReportPdfAction } from '#actions/report_pdf_action'

export default class UserReportsController {
  async daily({ view, auth }: HttpContext) {
    const user = auth.user as User

    const startTime = DateTime.now().startOf('day')
    const endTime = DateTime.now().endOf('day')

    const salesSummariesQs = await Promise.all([
      //sales data
      user
        .related('sales')
        .query()
        .where({ invoiceType: 'NS' })
        .andWhereBetween('created_at', [
          startTime.toSQL()!!.toString(),
          endTime.toSQL()!!.toString(),
        ])
        .withScopes((scope) => scope.totaltSummuries())
        .withScopes((scope) => scope.taxAmountSummuries())
        .first(),
      //refunds data
      user
        .related('sales')
        .query()
        .where({ invoiceType: 'NR' })
        .andWhereBetween('created_at', [
          startTime.toSQL()!!.toString(),
          endTime.toSQL()!!.toString(),
        ])
        .withScopes((scope) => scope.totaltSummuries())
        .withScopes((scope) => scope.taxAmountSummuries())
        .first(),
      //copies data
      user
        .related('sales')
        .query()
        .whereIn('invoiceType', ['CS', 'CR'])
        .andWhereBetween('created_at', [
          startTime.toSQL()!!.toString(),
          endTime.toSQL()!!.toString(),
        ])
        .withScopes((scope) => scope.totaltSummuries())
        .first(),
      //training data
      user
        .related('sales')
        .query()
        .whereIn('invoiceType', ['TS', 'TR'])
        .andWhereBetween('created_at', [
          startTime.toSQL()!!.toString(),
          endTime.toSQL()!!.toString(),
        ])
        .withScopes((scope) => scope.totaltSummuries())
        .first(),
      //proforma data
      user
        .related('sales')
        .query()
        .where({ invoiceType: 'PS' })
        .andWhereBetween('created_at', [
          startTime.toSQL()!!.toString(),
          endTime.toSQL()!!.toString(),
        ])
        .withScopes((scope) => scope.totaltSummuries())
        .first(),
    ])

    const paymentSummariesQs = await user
      .related('sales')
      .query()
      .whereIn('invoiceType', ['NS', 'NR'])
      .select(['payment_method', 'invoice_type'])
      .andWhereBetween('created_at', [startTime.toSQL()!!.toString(), endTime.toSQL()!!.toString()])
      .count('payment_method', 'totalReceipt')
      .sum('total_amount', 'totalAmount')
      .groupBy('payment_method', 'invoice_type')
      .exec()

    const salesSummaries = []

    const DEFAULT_MIN_SUM = 0.00

    for (const sumary of salesSummariesQs) {
      const saleSummury = {
        totalReceipt: sumary?.$extras?.totalReceipt || DEFAULT_MIN_SUM,
        totalAmount: sumary?.$extras?.totalAmount || DEFAULT_MIN_SUM,
        taxableAmountA: sumary?.$extras?.taxableAmountA || DEFAULT_MIN_SUM,
        taxableAmountB: sumary?.$extras?.taxableAmountB || DEFAULT_MIN_SUM,
        taxableAmountC: sumary?.$extras?.taxableAmountC || DEFAULT_MIN_SUM,
        taxableAmountD: sumary?.$extras?.taxableAmountD || DEFAULT_MIN_SUM,
        taxAmountA: sumary?.$extras?.taxAmountA || DEFAULT_MIN_SUM,
        taxAmountB: sumary?.$extras?.taxAmountB || DEFAULT_MIN_SUM,
        taxAmountC: sumary?.$extras?.taxAmountC || DEFAULT_MIN_SUM,
        taxAmountD: sumary?.$extras?.taxAmountD || DEFAULT_MIN_SUM,
        totalItems: parseFloat(sumary?.$extras?.totalItems || DEFAULT_MIN_SUM),
      }

      salesSummaries.push(saleSummury)
    }

    const paymentSummaries: PaymentSummary = {}

    for (const payment of paymentSummariesQs) {
      const lastSameData = paymentSummaries[getEbmPaymentMethodDescription(payment.paymentMethod)]

      if (lastSameData) {
        lastSameData[payment.invoiceType] = {
          totalReceipt: payment.$extras.totalReceipt,
          totalAmount: payment.$extras.totalAmount,
        }

        paymentSummaries[getEbmPaymentMethodDescription(payment.paymentMethod)] = lastSameData
        continue
      }

      paymentSummaries[getEbmPaymentMethodDescription(payment.paymentMethod)] = {
        [payment.invoiceType]: {
          totalReceipt: payment.$extras.totalReceipt,
          totalAmount: payment.$extras.totalAmount,
        },
      }
    }

    const [allDiscountNSQs, allDiscountNRQs] = await Promise.all([
      // NS
      user
        .related('sales')
        .query()
        .where('invoiceType', 'NS')
        .andWhereBetween('created_at', [
          startTime.toSQL()!!.toString(),
          endTime.toSQL()!!.toString(),
        ])
        .exec(),
      //NR
      user
        .related('sales')
        .query()
        .where('invoiceType', 'NR')
        .andWhereBetween('created_at', [
          startTime.toSQL()!!.toString(),
          endTime.toSQL()!!.toString(),
        ])
        .exec(),
    ])

    const allDiscountNS = allDiscountNSQs
      .flatMap((d) => d.items.data.map((d) => d.discountAmount))
      .reduce((a, b) => a + b, 0)

    
    const allDiscountNR = allDiscountNRQs
      .flatMap((d) => d.items.data.map((d) => d.discountAmount))
      .reduce((a, b) => a + b, 0)

    const [firstDeposit, cashWithdrawalsQs] = await Promise.all([
      user.related('cashMovements').query()
        .where('movement_type', 'DEPOSIT')
        .andWhereBetween('created_at', [startTime.toSQL()!!.toString(), endTime.toSQL()!!.toString()])
        .orderBy('created_at', 'asc')
        .first(),
      user.related('cashMovements').query()
        .where('movement_type', 'WITHDRAWAL')
        .andWhereBetween('created_at', [startTime.toSQL()!!.toString(), endTime.toSQL()!!.toString()])
        .sum('amount as total')
        .first(),
    ])

    // Count sales that were created locally but never got EBM approval (ebmSaleData is null)
    const incompleteSalesCount = await user.related('sales').query()
      .whereNull('ebm_sale_data')
      .andWhereBetween('created_at', [startTime.toSQL()!!.toString(), endTime.toSQL()!!.toString()])
      .count('id as total')
      .first()

    const html = await view.render('reports/daily', {
      dateTime: DateTime.now().setZone('UTC+2').toFormat('dd/MM/yyyy HH:mm'),
      saleSummury: salesSummaries[0],
      refundSummury: salesSummaries[1],
      copySummury: salesSummaries[2],
      trainingSummury: salesSummaries[3],
      proformaSummury: salesSummaries[4],
      paymentSummaries,
      allDiscount: (allDiscountNS - allDiscountNR).toFixed(2),
      openingDeposit: firstDeposit ? Number(firstDeposit.amount).toFixed(2) : '0.00',
      cashWithdrawals: Number(cashWithdrawalsQs?.$extras?.total ?? 0).toFixed(2),
      incompleteSales: Number(incompleteSalesCount?.$extras?.total ?? 0),
    })

    const url = await ReportPdfAction.generateAndStore('daily', html)
    return { url }
  }

  async period({ request, view, auth }: HttpContext) {
    const payload = await request.validateUsing(periodReportValidator)
    const user = auth.user as User

    const startTime = DateTime.fromISO(payload.start).startOf('day')
    const endTime = DateTime.fromISO(payload.end).endOf('day')

    const salesSummariesQs = await Promise.all([
      user.related('sales').query().where({ invoiceType: 'NS' })
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
        .withScopes((s) => s.totaltSummuries()).withScopes((s) => s.taxAmountSummuries()).first(),
      user.related('sales').query().where({ invoiceType: 'NR' })
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
        .withScopes((s) => s.totaltSummuries()).withScopes((s) => s.taxAmountSummuries()).first(),
      user.related('sales').query().whereIn('invoiceType', ['CS', 'CR'])
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
        .withScopes((s) => s.totaltSummuries()).first(),
      user.related('sales').query().whereIn('invoiceType', ['TS', 'TR'])
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
        .withScopes((s) => s.totaltSummuries()).first(),
      user.related('sales').query().where({ invoiceType: 'PS' })
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
        .withScopes((s) => s.totaltSummuries()).first(),
    ])

    const paymentSummariesQs = await user.related('sales').query()
      .whereIn('invoiceType', ['NS', 'NR'])
      .select(['payment_method', 'invoice_type'])
      .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
      .count('payment_method', 'totalReceipt')
      .sum('total_amount', 'totalAmount')
      .groupBy('payment_method', 'invoice_type').exec()

    const DEFAULT_MIN_SUM = 0.00
    const salesSummaries = salesSummariesQs.map((sumary) => ({
      totalReceipt: sumary?.$extras?.totalReceipt || DEFAULT_MIN_SUM,
      totalAmount: sumary?.$extras?.totalAmount || DEFAULT_MIN_SUM,
      taxableAmountA: sumary?.$extras?.taxableAmountA || DEFAULT_MIN_SUM,
      taxableAmountB: sumary?.$extras?.taxableAmountB || DEFAULT_MIN_SUM,
      taxableAmountC: sumary?.$extras?.taxableAmountC || DEFAULT_MIN_SUM,
      taxableAmountD: sumary?.$extras?.taxableAmountD || DEFAULT_MIN_SUM,
      taxAmountA: sumary?.$extras?.taxAmountA || DEFAULT_MIN_SUM,
      taxAmountB: sumary?.$extras?.taxAmountB || DEFAULT_MIN_SUM,
      taxAmountC: sumary?.$extras?.taxAmountC || DEFAULT_MIN_SUM,
      taxAmountD: sumary?.$extras?.taxAmountD || DEFAULT_MIN_SUM,
      totalItems: parseFloat(sumary?.$extras?.totalItems || DEFAULT_MIN_SUM),
    }))

    const paymentSummaries: PaymentSummary = {}
    for (const payment of paymentSummariesQs) {
      const key = getEbmPaymentMethodDescription(payment.paymentMethod)
      if (!paymentSummaries[key]) paymentSummaries[key] = {}
      paymentSummaries[key][payment.invoiceType] = {
        totalReceipt: payment.$extras.totalReceipt,
        totalAmount: payment.$extras.totalAmount,
      }
    }

    const [allDiscountNSQs, allDiscountNRQs] = await Promise.all([
      user.related('sales').query().where('invoiceType', 'NS')
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!]).exec(),
      user.related('sales').query().where('invoiceType', 'NR')
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!]).exec(),
    ])

    const allDiscountNS = allDiscountNSQs.flatMap((d) => d.items.data.map((d) => d.discountAmount)).reduce((a, b) => a + b, 0)
    const allDiscountNR = allDiscountNRQs.flatMap((d) => d.items.data.map((d) => d.discountAmount)).reduce((a, b) => a + b, 0)

    const [firstDepositPeriod, cashWithdrawalsPeriodQs] = await Promise.all([
      user.related('cashMovements').query()
        .where('movement_type', 'DEPOSIT')
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
        .orderBy('created_at', 'asc')
        .first(),
      user.related('cashMovements').query()
        .where('movement_type', 'WITHDRAWAL')
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
        .sum('amount as total')
        .first(),
    ])

    const incompleteSalesPeriodCount = await user.related('sales').query()
      .whereNull('ebm_sale_data')
      .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
      .count('id as total')
      .first()

    const html = await view.render('reports/daily', {
      dateTime: `${payload.start} to ${payload.end}`,
      saleSummury: salesSummaries[0],
      refundSummury: salesSummaries[1],
      copySummury: salesSummaries[2],
      trainingSummury: salesSummaries[3],
      proformaSummury: salesSummaries[4],
      paymentSummaries,
      allDiscount: (allDiscountNS - allDiscountNR).toFixed(2),
      openingDeposit: firstDepositPeriod ? Number(firstDepositPeriod.amount).toFixed(2) : '0.00',
      cashWithdrawals: Number(cashWithdrawalsPeriodQs?.$extras?.total ?? 0).toFixed(2),
      incompleteSales: Number(incompleteSalesPeriodCount?.$extras?.total ?? 0),
    })

    const url = await ReportPdfAction.generateAndStore('period', html)
    return { url }
  }

  async purchases({ request, view, auth }: HttpContext) {
    const payload = await request.validateUsing(purchaseReportValidator)
    const user = auth.user as User

    const startTime = payload.start
      ? DateTime.fromISO(payload.start).startOf('day')
      : DateTime.now().startOf('month')
    const endTime = payload.end
      ? DateTime.fromISO(payload.end).endOf('day')
      : DateTime.now().endOf('day')

    const purchases = await Purchase.query()
      .where('user_id', user.id)
      .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
      .orderBy('created_at', 'desc')

    // Aggregate totals
    const totals = purchases.reduce(
      (acc, p) => {
        acc.totalAmount += Number(p.totalAmount)
        acc.totalTaxAmount += Number(p.totalTaxAmount)
        acc.totalTaxableAmount += Number(p.totalTaxableAmount)
        acc.totalItems += Number(p.totalItems)
        acc.count++
        return acc
      },
      { totalAmount: 0, totalTaxAmount: 0, totalTaxableAmount: 0, totalItems: 0, count: 0 }
    )

    const html = await view.render('reports/purchases', {
      dateTime: DateTime.now().setZone('UTC+2').toFormat('dd/MM/yyyy HH:mm'),
      periodStart: startTime.toFormat('dd/MM/yyyy'),
      periodEnd: endTime.toFormat('dd/MM/yyyy'),
      purchases,
      totals,
    })

    const url = await ReportPdfAction.generateAndStore('purchases', html)
    return { url }
  }

  async x_report({ view, auth }: HttpContext) {
    const user = auth.user as User

    const startTime = DateTime.now().startOf('day')
    const endTime = startTime.endOf('day')

    const salesSummariesQs = await Promise.all([
      user.related('sales').query().where({ invoiceType: 'NS' })
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
        .withScopes((s) => s.totaltSummuries()).withScopes((s) => s.taxAmountSummuries()).first(),
      user.related('sales').query().where({ invoiceType: 'NR' })
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
        .withScopes((s) => s.totaltSummuries()).withScopes((s) => s.taxAmountSummuries()).first(),
      user.related('sales').query().whereIn('invoiceType', ['CS', 'CR'])
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
        .withScopes((s) => s.totaltSummuries()).first(),
      user.related('sales').query().whereIn('invoiceType', ['TS', 'TR'])
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
        .withScopes((s) => s.totaltSummuries()).first(),
      user.related('sales').query().where({ invoiceType: 'PS' })
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
        .withScopes((s) => s.totaltSummuries()).first(),
    ])

    const paymentSummariesQs = await user.related('sales').query()
      .whereIn('invoiceType', ['NS', 'NR'])
      .select(['payment_method', 'invoice_type'])
      .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
      .count('payment_method', 'totalReceipt')
      .sum('total_amount', 'totalAmount')
      .groupBy('payment_method', 'invoice_type').exec()

    const DEFAULT_MIN_SUM = 0.00
    const salesSummaries = salesSummariesQs.map((sumary) => ({
      totalReceipt: sumary?.$extras?.totalReceipt || DEFAULT_MIN_SUM,
      totalAmount: sumary?.$extras?.totalAmount || DEFAULT_MIN_SUM,
      taxableAmountA: sumary?.$extras?.taxableAmountA || DEFAULT_MIN_SUM,
      taxableAmountB: sumary?.$extras?.taxableAmountB || DEFAULT_MIN_SUM,
      taxableAmountC: sumary?.$extras?.taxableAmountC || DEFAULT_MIN_SUM,
      taxableAmountD: sumary?.$extras?.taxableAmountD || DEFAULT_MIN_SUM,
      taxAmountA: sumary?.$extras?.taxAmountA || DEFAULT_MIN_SUM,
      taxAmountB: sumary?.$extras?.taxAmountB || DEFAULT_MIN_SUM,
      taxAmountC: sumary?.$extras?.taxAmountC || DEFAULT_MIN_SUM,
      taxAmountD: sumary?.$extras?.taxAmountD || DEFAULT_MIN_SUM,
      totalItems: parseFloat(sumary?.$extras?.totalItems || DEFAULT_MIN_SUM),
    }))

    const paymentSummaries: PaymentSummary = {}
    for (const payment of paymentSummariesQs) {
      const key = getEbmPaymentMethodDescription(payment.paymentMethod)
      if (!paymentSummaries[key]) paymentSummaries[key] = {}
      paymentSummaries[key][payment.invoiceType] = {
        totalReceipt: payment.$extras.totalReceipt,
        totalAmount: payment.$extras.totalAmount,
      }
    }

    const [allDiscountNSQs, allDiscountNRQs] = await Promise.all([
      user.related('sales').query().where('invoiceType', 'NS')
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!]).exec(),
      user.related('sales').query().where('invoiceType', 'NR')
        .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!]).exec(),
    ])

    const allDiscountNS = allDiscountNSQs.flatMap((d) => d.items.data.map((d) => d.discountAmount)).reduce((a, b) => a + b, 0)
    const allDiscountNR = allDiscountNRQs.flatMap((d) => d.items.data.map((d) => d.discountAmount)).reduce((a, b) => a + b, 0)

    // F-51: Calculate NS sales breakdown by item classification group
    const itemGroupSales: { [key: string]: { amount: number; taxAmount: number; quantity: number } } = {}
    for (const sale of allDiscountNSQs) {
      if (sale.items?.data && Array.isArray(sale.items.data)) {
        for (const item of sale.items.data) {
          const groupName = getMainItemGroup(item.classificationCode || '')
          if (!itemGroupSales[groupName]) {
            itemGroupSales[groupName] = { amount: 0, taxAmount: 0, quantity: 0 }
          }
          itemGroupSales[groupName].amount += (item.supplyPrice || 0)
          itemGroupSales[groupName].taxAmount += (item.taxAmount || 0)
          itemGroupSales[groupName].quantity += (item.quantity || 0)
        }
      }
    }

    const firstDepositX = await user.related('cashMovements').query()
      .where('movement_type', 'DEPOSIT')
      .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
      .orderBy('created_at', 'asc')
      .first()

    const incompleteSalesXCount = await user.related('sales').query()
      .whereNull('ebm_sale_data')
      .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
      .count('id as total')
      .first()

    const html = await view.render('reports/x_report', {
      dateTime: DateTime.now().setZone('UTC+2').toFormat('dd/MM/yyyy HH:mm'),
      saleSummury: salesSummaries[0],
      refundSummury: salesSummaries[1],
      copySummury: salesSummaries[2],
      trainingSummury: salesSummaries[3],
      proformaSummury: salesSummaries[4],
      paymentSummaries,
      itemGroupSales, // F-51: Item classification group breakdown
      allDiscount: (allDiscountNS - allDiscountNR).toFixed(2),
      openingDeposit: firstDepositX ? Number(firstDepositX.amount).toFixed(2) : '0.00',
      incompleteSales: Number(incompleteSalesXCount?.$extras?.total ?? 0),
    })

    const url = await ReportPdfAction.generateAndStore('x_report', html)
    return { url }
  }

  async plu_report({ request, view, auth }: HttpContext) {
    const payload = await request.validateUsing(periodReportValidator)
    const user = auth.user as User
    const startTime = DateTime.fromISO(payload.start).startOf('day')
    const endTime = DateTime.fromISO(payload.end).endOf('day')

    const sales = await user.related('sales').query()
      .whereIn('invoiceType', ['NS', 'NR'])
      .andWhereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
      .exec()

    const pluSummaries: Record<string, { code: string, name: string, quantity: number, totalAmount: number, unitPrice: number | null, taxationType: string | null, remainingStock: number | null }> = {}

    for (const sale of sales) {
      const isRefund = sale.invoiceType === 'NR'
      for (const item of sale.items.data) {
        if (!pluSummaries[item.code]) {
          pluSummaries[item.code] = {
            code: item.code,
            name: item.name,
            quantity: 0,
            totalAmount: 0,
            unitPrice: item.price ?? null,
            taxationType: item.taxationType ?? null,
            remainingStock: null,
          }
        }
        const qty = item.quantity * (isRefund ? -1 : 1)
        const amt = item.totalAmount * (isRefund ? -1 : 1)
        pluSummaries[item.code].quantity += qty
        pluSummaries[item.code].totalAmount += amt
      }
    }

    // Art. 21.1.6 — Bulk-fetch remaining stock for all item codes to avoid N+1 queries
    const itemCodes = Object.keys(pluSummaries)
    if (itemCodes.length > 0) {
      const stockRecords = await user.related('stockMasters').query()
        .whereIn('itemCode', itemCodes)
        .exec()
      for (const stock of stockRecords) {
        if (pluSummaries[stock.itemCode]) {
          pluSummaries[stock.itemCode].remainingStock = stock.remainQuantity
        }
      }
    }

    const html = await view.render('reports/plu', {
      dateTime: `${payload.start} to ${payload.end}`,
      pluSummaries: Object.values(pluSummaries),
    })

    const url = await ReportPdfAction.generateAndStore('plu', html)
    return { url }
  }

  async ej({ request, view, auth }: HttpContext) {
    const payload = await request.validateUsing(periodReportValidator)
    const user = auth.user as User

    // F-48: Fetch EJ data from EBM using delta sync (authoritative source)
    const { EbmEJReportService } = await import('#services/ebm/ebm_ej_report_service')
    const ejService = new EbmEJReportService(user)
    const transactions = await ejService.fetchEJData(payload.start, payload.end)

    const html = await view.render('reports/ej', {
      dateTime: `${payload.start} to ${payload.end}`,
      transactions // F-48: Use EBM data as authoritative source
    })

    const url = await ReportPdfAction.generateAndStore('ej', html)
    return { url }
  }

  async closing_stock({ request, view, auth }: HttpContext) {
    const payload = await request.validateUsing(closingStockValidator)
    const user = auth.user as User

    const asOf = DateTime.fromISO(payload.date).endOf('day')

    // Get current balances and item metadata in parallel
    const [stockMasters, userItems] = await Promise.all([
      user.related('stockMasters').query(),
      user.related('items').query(),
    ])

    const itemMeta = new Map(userItems.map((i) => [i.code, i.name]))

    // Fetch all movements that occurred AFTER the requested date, to reverse them
    const afterMovements = await user.related('stockMovements').query()
      .where('created_at', '>', asOf.toSQL()!)

    // Build per-item-code quantity delta needed to reverse post-date movements
    const incomingTypes = new Set<string>([
      EbmStockInOutType.IncomingImport,
      EbmStockInOutType.IncomingPurchase,
      EbmStockInOutType.IncomingReturn,
      EbmStockInOutType.IncomingStockMovement,
      EbmStockInOutType.IncomingProcessing,
      EbmStockInOutType.IncomingAdjustment,
    ])

    const delta = new Map<string, number>()
    for (const movement of afterMovements) {
      const isIncoming = incomingTypes.has(movement.storedAndReleasedType)
      for (const item of movement.items.data) {
        const prev = delta.get(item.code) ?? 0
        // Reverse the effect: incoming after date inflated the balance → subtract; outgoing deflated → add
        delta.set(item.code, prev + (isIncoming ? -item.quantity : item.quantity))
      }
    }

    const closingStocks = stockMasters.map((sm) => ({
      itemCode: sm.itemCode,
      name: itemMeta.get(sm.itemCode) ?? sm.itemCode,
      currentQty: sm.remainQuantity,
      closingQty: Math.max(0, sm.remainQuantity + (delta.get(sm.itemCode) ?? 0)),
    }))

    const html = await view.render('reports/closing_stock', {
      dateAs: payload.date,
      dateTime: DateTime.now().setZone('UTC+2').toFormat('dd/MM/yyyy HH:mm'),
      closingStocks,
    })

    const url = await ReportPdfAction.generateAndStore('closing_stock', html)
    return { url }
  }

  async stock_movement({ request, view, auth }: HttpContext) {
    const payload = await request.validateUsing(periodReportValidator)
    const user = auth.user as User
    const startTime = DateTime.fromISO(payload.start).startOf('day')
    const endTime = DateTime.fromISO(payload.end).endOf('day')

    const movements = await user.related('stockMovements').query()
      .whereBetween('created_at', [startTime.toSQL()!!, endTime.toSQL()!!])
      .orderBy('created_at', 'desc')
      .exec()

    const html = await view.render('reports/stock_movement', {
      dateTime: `${payload.start} to ${payload.end}`,
      movements
    })

    const url = await ReportPdfAction.generateAndStore('stock_movement', html)
    return { url }
  }

  // F-46: Z Report (End of Day) — Mandatory daily closure
  async z_report({ response, auth }: HttpContext) {
    try {
      const user = auth.user as User
      const { EbmZReportService } = await import('#services/ebm/ebm_z_report_service')

      const zReportService = new EbmZReportService(user)

      // F-46: Check if Z report can be issued
      const canIssue = await zReportService.canIssueZReport()
      if (!canIssue.allowed) {
        return response.badRequest({
          error: 'Cannot issue Z report',
          reason: canIssue.reason,
        })
      }

      // F-46: Generate and transmit Z report
      const zReport = await zReportService.generateZReport()

      return {
        ...zReport,
        message: 'Z Report issued successfully. Sales are now blocked until next business day.',
        status: 'FINAL',
      }
    } catch (error) {
      return response.badRequest({
        error: 'Failed to generate Z report',
        detail: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
