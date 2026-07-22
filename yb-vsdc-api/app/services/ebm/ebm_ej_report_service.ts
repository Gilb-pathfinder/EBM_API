// F-48: Electronic Journal (EJ) Report Service with EBM Delta Sync

import User from '#models/user'
import { DateTime } from 'luxon'
import { EbmTransactionService } from './ebm_transaction_service'

export interface EJTransaction {
  receiptNo: number
  transactionDate: string
  transactionTime: string
  amount: number
  taxAmount: number
  totalAmount: number
  paymentMethod: string
  customer?: string
  reference?: string
}

export class EbmEJReportService {
  constructor(private user: User) {}

  /**
   * F-48: Fetch EJ data from EBM using delta sync
   * - Uses lastReqDt parameter for incremental fetching
   * - Returns transactions from EBM (authoritative source)
   * - Updates ejLastReqDt for next fetch
   */
  async fetchEJData(startDate?: string, endDate?: string): Promise<EJTransaction[]> {
    const ebmService = new EbmTransactionService(this.user)

    // F-48: Use last sync timestamp or today's date if first sync
    const lastReqDt = this.user.ejLastReqDt || DateTime.now().toISO()

    try {
      // F-48: Fetch transaction data from EBM using delta sync
      const response = await ebmService.selectTrnsPurchaseSales({
        tin: this.user.tin,
        branchId: this.user.branchId,
        lastRequestDt: lastReqDt,
      })

      // F-48: Transform EBM response to EJ transaction format
      const transactions = this.transformEbmToEJ(response)

      // F-48: Filter by date range if specified
      let filtered = transactions
      if (startDate && endDate) {
        const start = DateTime.fromISO(startDate)
        const end = DateTime.fromISO(endDate).endOf('day')
        filtered = transactions.filter((t) => {
          const tDate = DateTime.fromISO(t.transactionDate)
          return tDate >= start && tDate <= end
        })
      }

      // F-48: Update last sync timestamp to current time
      this.user.ejLastReqDt = DateTime.now().toISO()
      await this.user.save()

      return filtered
    } catch (error) {
      throw new Error(`Failed to fetch EJ data from EBM: ${error}`)
    }
  }

  /**
   * F-48: Transform EBM transaction response to EJ format
   */
  private transformEbmToEJ(response: any): EJTransaction[] {
    const transactions: EJTransaction[] = []

    // F-48: Handle EBM response structure (adjust based on actual API response)
    if (!response || !response.data) {
      return transactions
    }

    // F-48: Process sales transactions
    if (response.data.slsList && Array.isArray(response.data.slsList)) {
      response.data.slsList.forEach((sale: any) => {
        transactions.push({
          receiptNo: sale.rctNo || 0,
          transactionDate: sale.trnsDt || '',
          transactionTime: sale.trnsTime || '',
          amount: sale.splyAmt || 0,
          taxAmount: sale.taxAmt || 0,
          totalAmount: sale.totAmt || 0,
          paymentMethod: sale.pymtMtd || '',
          customer: sale.custNm || undefined,
          reference: sale.reference || undefined,
        })
      })
    }

    // F-48: Process purchase transactions if included
    if (response.data.purList && Array.isArray(response.data.purList)) {
      response.data.purList.forEach((purchase: any) => {
        transactions.push({
          receiptNo: purchase.rctNo || 0,
          transactionDate: purchase.trnsDt || '',
          transactionTime: purchase.trnsTime || '',
          amount: purchase.splyAmt || 0,
          taxAmount: purchase.taxAmt || 0,
          totalAmount: purchase.totAmt || 0,
          paymentMethod: 'PURCHASE',
          customer: purchase.spplrNm || undefined,
          reference: purchase.reference || undefined,
        })
      })
    }

    // F-48: Sort by transaction date descending
    return transactions.sort((a, b) => {
      const dateA = DateTime.fromISO(a.transactionDate)
      const dateB = DateTime.fromISO(b.transactionDate)
      return dateB.toMillis() - dateA.toMillis()
    })
  }
}
