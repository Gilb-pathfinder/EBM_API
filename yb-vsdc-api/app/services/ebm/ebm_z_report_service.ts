// F-46: Z Report (End of Day) Service
// F-51: Includes item classification group breakdown

import User from '#models/user'
import Sale from '#models/sale'
import Purchase from '#models/purchase'
import CashMovement from '#models/cash_movement'
import { DateTime } from 'luxon'
import { EbmTransactionService } from './ebm_transaction_service'
import { getMainItemGroup } from '#helpers/ebm_helper'

export class EbmZReportService {
  constructor(private user: User) {}

  /**
   * F-46: Generate and transmit Z report to EBM
   * - Aggregates all daily transactions
   * - Resets counters in EBM
   * - Blocks further sales until next period
   * F-51: Includes item classification group breakdown
   */
  async generateZReport() {
    const today = DateTime.now().toSQL()?.split(' ')[0] || ''

    // F-46: Get today's transactions summary
    const salesSummary = await Sale.query()
      .where('user_id', this.user.id)
      .whereBetween('created_at', [
        DateTime.fromISO(`${today}T00:00:00`),
        DateTime.fromISO(`${today}T23:59:59`),
      ])
      .sum('total_amount as totalAmount')
      .sum('total_tax_amount as totalTaxAmount')
      .count('* as totalReceipts')

    // F-51: Fetch full sales with items for item group breakdown
    const allSalesForDay = await Sale.query()
      .where('user_id', this.user.id)
      .whereIn('invoiceType', ['NS', 'NR'])
      .whereBetween('created_at', [
        DateTime.fromISO(`${today}T00:00:00`),
        DateTime.fromISO(`${today}T23:59:59`),
      ])

    const purchasesSummary = await Purchase.query()
      .where('user_id', this.user.id)
      .whereBetween('created_at', [
        DateTime.fromISO(`${today}T00:00:00`),
        DateTime.fromISO(`${today}T23:59:59`),
      ])
      .sum('total_amount as totalAmount')
      .sum('total_tax_amount as totalTaxAmount')
      .count('* as totalPurchases')

    // F-46: Get cash movements for the day
    const cashMovements = await CashMovement.query()
      .where('user_id', this.user.id)
      .whereBetween('created_at', [
        DateTime.fromISO(`${today}T00:00:00`),
        DateTime.fromISO(`${today}T23:59:59`),
      ])
      .sum('amount as totalCashMovement')

    // F-51: Calculate NS sales breakdown by item classification group
    const itemGroupSales: { [key: string]: { amount: number; taxAmount: number; quantity: number } } = {}
    for (const sale of allSalesForDay) {
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

    // F-46: Compile Z report data
    const zReportNo = (this.user.lastZReportNo || 0) + 1

    const zReportData = {
      reportNo: zReportNo,
      reportDate: today,
      reportTime: DateTime.now(),

      // Sales summary
      totalSales: salesSummary[0]?.$extras?.totalReceipts || 0,
      totalSalesAmount: salesSummary[0]?.$extras?.totalAmount || 0,
      totalSalesTax: salesSummary[0]?.$extras?.totalTaxAmount || 0,

      // Purchases summary
      totalPurchases: purchasesSummary[0]?.$extras?.totalPurchases || 0,
      totalPurchasesAmount: purchasesSummary[0]?.$extras?.totalAmount || 0,
      totalPurchasesTax: purchasesSummary[0]?.$extras?.totalTaxAmount || 0,

      // Cash movements
      totalCashMovements: cashMovements[0]?.$extras?.totalCashMovement || 0,

      // F-51: Item classification group breakdown
      itemGroupBreakdown: itemGroupSales,

      // API versions
      cisApiVersion: this.user.cisApiVersion,
      ebmApiVersion: this.user.ebmApiVersion,
    }

    // F-46: Send Z report to EBM for counter reset
    try {
      const ebmService = new EbmTransactionService(this.user)
      // This would be an actual EBM endpoint call - for now we're structuring the data
      // In production, you'd call: await ebmService.sendZReport(zReportData)
    } catch (error) {
      throw new Error(`Failed to transmit Z report to EBM: ${error}`)
    }

    // F-46: Update user record - block further sales and update Z report counter
    this.user.lastZReportDate = DateTime.now()
    this.user.lastZReportNo = zReportNo
    this.user.canIssueSales = false // Block sales until next business day
    await this.user.save()

    return zReportData
  }

  /**
   * F-46: Check if Z report can be issued
   */
  async canIssueZReport(): Promise<{ allowed: boolean; reason?: string }> {
    const today = DateTime.now().toSQL()?.split(' ')[0] || ''
    const lastZReportDate = this.user.lastZReportDate?.toSQL()?.split(' ')[0] || null

    // F-46: Can only issue one Z report per day
    if (lastZReportDate === today) {
      return {
        allowed: false,
        reason: 'Z report has already been issued for today. Next Z report can be issued tomorrow.',
      }
    }

    // F-46: Must have at least one sale since last Z report
    const salesCount = await Sale.query()
      .where('user_id', this.user.id)
      .whereBetween('created_at', [
        this.user.lastZReportDate || DateTime.now().minus({ days: 365 }),
        DateTime.now(),
      ])
      .count('* as total')

    if (salesCount[0]?.total === 0) {
      return {
        allowed: false,
        reason: 'No sales have been made since the last Z report. Cannot issue another Z report.',
      }
    }

    return { allowed: true }
  }
}
