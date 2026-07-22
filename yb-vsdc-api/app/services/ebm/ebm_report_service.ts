
import User from '#models/user'
import { EbmReceiptType, EbmTransactionType } from '#types/ebm/ebm_type'
import { DateTime } from 'luxon'

interface TaxSummary {
    taxableAmountA: number
    taxAmountA: number
    taxableAmountB: number
    taxAmountB: number
    taxableAmountC: number
    taxAmountC: number
    taxableAmountD: number
    taxAmountD: number
}

interface TransactionSummary extends TaxSummary {
    totalAmount: number
    totalReceipt: number
    totalItems: number
}

interface PaymentSummary {
    totalAmount: number
    totalReceipt: number
}

export default class EbmReportService {

    static async getDailyZReport(user: User, date: DateTime) {
        const startOfDay = date.startOf('day')
        const endOfDay = date.endOf('day')

        // Fetch all sales/refunds for the day
        const transactions = await user.related('sales')
            .query()
            .whereBetween('created_at', [startOfDay.toSQL()!, endOfDay.toSQL()!])
            .exec()

        // Initialize Summaries
        const salesSummary = this.initSummary()
        const refundsSummary = this.initSummary()
        const copySummary = { totalAmount: 0, totalReceipt: 0 }
        const trainingSummary = { totalAmount: 0, totalReceipt: 0 }
        const proformaSummary = { totalAmount: 0, totalReceipt: 0 }

        // Payment Method Summaries (grouped by Method -> Type -> {Amount, Count})
        const paymentSummaries: Record<string, Record<string, PaymentSummary>> = {}

        for (const trx of transactions) {
            const amount = Number(trx.totalAmount)
            const taxA = Number(trx.taxAmountA)
            const taxB = Number(trx.taxAmountB)
            const taxC = Number(trx.taxAmountC)
            const taxD = Number(trx.taxAmountD)
            const taxableA = Number(trx.taxableAmountA)
            const taxableB = Number(trx.taxableAmountB)
            const taxableC = Number(trx.taxableAmountC)
            const taxableD = Number(trx.taxableAmountD)
            const items = Number(trx.totalItems)

            // Handle Sale Types
            if (trx.saleType === EbmTransactionType.Copy) {
                copySummary.totalAmount += amount
                copySummary.totalReceipt++
                continue
            }
            if (trx.saleType === EbmTransactionType.Training) {
                trainingSummary.totalAmount += amount
                trainingSummary.totalReceipt++
                continue
            }
            if (trx.saleType === EbmTransactionType.Proforma) {
                proformaSummary.totalAmount += amount
                proformaSummary.totalReceipt++
                continue
            }

            // Main Sales and Refunds
            let targetSummary: TransactionSummary

            if (trx.receiptType === EbmReceiptType.Sale) {
                targetSummary = salesSummary
            } else if (trx.receiptType === EbmReceiptType.Refund) {
                targetSummary = refundsSummary
            } else {
                continue // Should not happen for Z-Report relevant types
            }

            // Aggregate Totals
            targetSummary.totalAmount += amount
            targetSummary.totalReceipt++
            targetSummary.totalItems += items

            // Aggregate Tax Breakdown
            targetSummary.taxAmountA += taxA
            targetSummary.taxableAmountA += taxableA
            targetSummary.taxAmountB += taxB
            targetSummary.taxableAmountB += taxableB
            targetSummary.taxAmountC += taxC
            targetSummary.taxableAmountC += taxableC
            targetSummary.taxAmountD += taxD
            targetSummary.taxableAmountD += taxableD

            // Aggregate Payment Methods
            if (!paymentSummaries[trx.paymentMethod]) {
                paymentSummaries[trx.paymentMethod] = {}
            }
            const pType = trx.receiptType === EbmReceiptType.Sale ? 'NS' : 'NR' // Normal Sale / Normal Refund
            if (!paymentSummaries[trx.paymentMethod][pType]) {
                paymentSummaries[trx.paymentMethod][pType] = { totalAmount: 0, totalReceipt: 0 }
            }
            paymentSummaries[trx.paymentMethod][pType].totalAmount += amount
            paymentSummaries[trx.paymentMethod][pType].totalReceipt++
        }

        // Aggregate discounts from NS (positive) and NR (negative) item lines
        const allDiscountNS = transactions
            .filter(t => t.receiptType === EbmReceiptType.Sale && t.saleType === EbmTransactionType.Normal)
            .flatMap(t => t.items?.data ?? [])
            .reduce((sum: number, item: any) => sum + (Number(item.discountAmount) || 0), 0)

        const allDiscountNR = transactions
            .filter(t => t.receiptType === EbmReceiptType.Refund)
            .flatMap(t => t.items?.data ?? [])
            .reduce((sum: number, item: any) => sum + (Number(item.discountAmount) || 0), 0)

        return {
            date: date.toFormat('yyyy-MM-dd'),
            saleSummury: salesSummary, // Typo in edge file 'summury' kept for compatibility
            refundSummury: refundsSummary,
            copySummury: copySummary,
            trainingSummury: trainingSummary,
            proformaSummury: proformaSummary,
            paymentSummaries,
            allDiscount: parseFloat((allDiscountNS - allDiscountNR).toFixed(2)),
        }
    }

    private static initSummary(): TransactionSummary {
        return {
            totalAmount: 0,
            totalReceipt: 0,
            totalItems: 0,
            taxableAmountA: 0,
            taxAmountA: 0,
            taxableAmountB: 0,
            taxAmountB: 0,
            taxableAmountC: 0,
            taxAmountC: 0,
            taxableAmountD: 0,
            taxAmountD: 0
        }
    }
}
