
import { test } from '@japa/runner'
import User from '#models/user'
import EbmReportService from '#services/ebm/ebm_report_service'
import { DateTime } from 'luxon'
import Sale from '#models/sale'
import { EbmReceiptType, EbmTransactionType, EbmPaymentMethod } from '#types/ebm/ebm_type'
import { EbmYesOrNo } from '#types/ebm/ebm_service_type'

test.group('Ebm Report Service', () => {

    test('generate daily z-report', async ({ assert }) => {
        // 1. Setup User
        const user = await User.firstOrFail() // Assumes at least one user exists from seeders

        // 2. Create Dummy Sales for Today
        const today = DateTime.now()

        // Normal Sale
        await Sale.create({
            userId: user.id,
            tin: user.tin,
            invoiceNo: 1001,
            saleType: EbmTransactionType.Normal,
            receiptType: EbmReceiptType.Sale,
            paymentMethod: EbmPaymentMethod.CASH,
            totalAmount: 1180,
            totalItems: 1,
            taxableAmountB: 1000,
            taxAmountB: 180,
            saleDate: today,
            createdAt: today,
            branchId: user.branchId,
            resultDt: today.toFormat('yyyyMMddHHmmss'),
            ebmApiVersion: '1.0',
            cisApiVersion: '1.0',
            itemsReceived: EbmYesOrNo.Yes,
            registrantName: 'Test',
            registrantId: '123',
            modifierId: '123',
            modifierName: 'Test',
            items: { data: [] } // Initialize items JSON
        })

        // Normal Refund
        await Sale.create({
            userId: user.id,
            tin: user.tin,
            invoiceNo: 1002,
            saleType: EbmTransactionType.Normal,
            receiptType: EbmReceiptType.Refund,
            paymentMethod: EbmPaymentMethod.CASH,
            totalAmount: 590,
            totalItems: 1,
            taxableAmountB: 500,
            taxAmountB: 90,
            saleDate: today,
            createdAt: today,
            branchId: user.branchId,
            resultDt: today.toFormat('yyyyMMddHHmmss'),
            ebmApiVersion: '1.0',
            cisApiVersion: '1.0',
            itemsReceived: EbmYesOrNo.Yes,
            registrantName: 'Test',
            registrantId: '123',
            modifierId: '123',
            modifierName: 'Test',
            items: { data: [] } // Initialize items JSON
        })

        // 3. Generate Report
        const report = await EbmReportService.getDailyZReport(user, today)

        // 4. Assertions
        assert.equal(report.saleSummury.totalAmount, 1180)
        assert.equal(report.saleSummury.totalReceipt, 1)
        assert.equal(report.refundSummury.totalAmount, 590)
        assert.equal(report.refundSummury.totalReceipt, 1)
        assert.equal(report.saleSummury.taxAmountB, 180)

        // console.log('Z-Report Generated:', JSON.stringify(report, null, 2))
    })
})
