import User from '#models/user'
import { EbmTransactionService } from '#services/ebm/ebm_transaction_service'
import {
  EbmItem, EbmReceipt,
  EbmYesOrNo,
  SaleEbmResponseData,
  SaveCopyEbmOptions,
  SaveRefundEbmOptions
} from '#types/ebm/ebm_service_type'
import {
  EbmApiResponseCode,
  EbmDefaultResponse, EbmReceiptType, EbmTaxType,
  EbmTransactionProgress,
  EbmTransactionType,
  EbmPaymentMethod
} from '#types/ebm/ebm_type'
import {
  copySaveValidator,
  purchaseSaveValidator,
  refundSaveValidator,
  saleProformaValidator,
  saleSaveValidator,
  saleTrainingValidator
} from '#validators/ebm_transaction_validator'
import type { HttpContext } from '@adonisjs/core/http'
import { Infer } from '@vinejs/vine/types'
import {
  convertDateTimeToLastRequestDtOption,
  convertEbmLastRequestDateToDt,
  getTaxAmountByType,
  getTaxRateByType,
} from '../../helpers/ebm_helper.js'
import { DateTime } from 'luxon'
import env from '#start/env'
import { ApiOperation } from '@foadonis/openapi/decorators'
import {
  userTransactionFindQsValidator,
  userTransactionListQsValidator,
} from '#validators/users/user_transcation_validator'
import Sale from '#models/sale'
import { formatNumberBy2Decimals, isDevOrSandboxEnv } from '#helpers/index'
import CatchEbmAndAllError from '#helpers/classes/catch_ebm_and_all_error'
import { PurchaseAction } from '#actions/purchase_action'
import { ImportItemAction } from '#actions/import_item_action'
import { EbmInitService } from '#services/ebm/ebm_init_service'
import ImportItemList from '#models/import_item_list'
import { approveImportItemValidator, cancelImportItemValidator } from '#validators/ebm_item_validator'
import { listRequestValidator } from '#validators/ebm_validator'
import { StockAction } from '#actions/stock_action'
import SaleQueue from '#models/sale_queue'

const isDevOrSandboxEnvironment = isDevOrSandboxEnv()

export default class UserTranscationsController extends CatchEbmAndAllError {
  //#region transactions
  async select({ response, auth, request }: HttpContext) {
    const usr = auth.user as User
    const lastRequestDt = request.input('dt', '')
    const branchId = request.param('branchId')

    try {
      const res = await new EbmTransactionService(usr).selectTrnsPurchaseSales({
        tin: usr.tin,
        branchId,
        lastRequestDt,
      })

      return res
    } catch (error) {
      this.catchErrors(response, error)
    }
  }

  async sale_save({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(saleSaveValidator)

    try {
      const usr = auth.user as User

      // Req #42 — Training mode guard: block real sales when in training mode
      if (usr.isTrainingMode) {
        return response.badRequest({
          error: 'Training mode is active. Use the training receipt endpoint or disable training mode first.',
          isTrainingMode: true,
        })
      }

      // Art. 7.30 — 24-hour offline block: stop issuing receipts if EBM unreachable for 24+ hours
      if (usr.ebmLastOnlineAt && DateTime.now().diff(usr.ebmLastOnlineAt, 'hours').hours >= 24) {
        return response.serviceUnavailable({
          error: 'EBM has been unreachable for over 24 hours. Receipt issuance is blocked until connectivity is restored.',
          ebmLastOnlineAt: usr.ebmLastOnlineAt,
        })
      }

      const convertedItems = await this.convertItems(payload.items, usr.id)

      // Art. 7.30 — Validate stock availability before calling EBM (skip items with no stockMaster entry — services)
      const stockMap = new Map(
        (await usr.related('stockMasters').query().whereIn('itemCode', convertedItems.map((i) => i.code)))
          .map((s) => [s.itemCode, s])
      )
      for (const item of convertedItems) {
        const stock = stockMap.get(item.code)
        if (stock && stock.remainQuantity < item.quantity) {
          return response.badRequest({
            error: `Insufficient stock for "${item.name}" (code: ${item.code}). Available: ${stock.remainQuantity}, requested: ${item.quantity}.`,
            itemCode: item.code,
          })
        }
      }

      // F-27: Multi-Currency Support — handle currency conversion if foreign currency used
      let currencyCode: string | null = null
      let originalAmount: number | null = null
      let exchangeRate: number | null = null
      let exchangeRateDate: DateTime | null = null

      if (payload.currencyCode && payload.currencyCode !== 'RWF') {
        const ExchangeRate = (await import('#models/exchange_rate')).default
        const today = new Date().toISOString().slice(0, 10)

        const rate = await ExchangeRate.query()
          .where('currency_code', payload.currencyCode)
          .where('is_active', true)
          .where('effective_date', '<=', today)
          .orderBy('effective_date', 'desc')
          .first()

        if (!rate) {
          return response.badRequest({
            error: `No active exchange rate found for ${payload.currencyCode}. Please add the rate in admin settings or use RWF.`,
            currencyCode: payload.currencyCode,
          })
        }

        if (!payload.originalAmount) {
          return response.badRequest({
            error: 'Original amount must be provided when using a foreign currency.',
          })
        }

        currencyCode = payload.currencyCode
        originalAmount = payload.originalAmount
        exchangeRate = rate.rateToRwf
        exchangeRateDate = DateTime.fromISO(rate.effectiveDate)
      }

      // F-32: Export invoice validation — all items must have tax type D (zero-rated)
      if (payload.exportDate || payload.exportDocumentRef) {
        const allItemsAreD = convertedItems.every(item => item.taxationType === EbmTaxType.D)

        if (!allItemsAreD) {
          return response.badRequest({
            error: 'Export invoices (Category D) must contain ONLY items with tax type D (export/zero-rated). Cannot mix with other tax types (A, B, C).',
            itemsWithWrongTax: convertedItems.filter(i => i.taxationType !== EbmTaxType.D).map(i => ({ code: i.code, name: i.name, tax: i.taxationType })),
          })
        }
      }

      // F-29: Credit sale (deferred payment) handling
      let creditStatus: 'none' | 'outstanding' | 'partial' | 'paid' = 'none'
      if (payload.paymentMethod === EbmPaymentMethod.CREDIT && payload.expectedPaymentDate) {
        creditStatus = 'outstanding'
      }

      const itemsTaxRateAndAmount = this.getTaxRatesAndAmounts(convertedItems)

      const invoiceNo = +usr.lastSaleInvoiceNo + 1
      const reportNo = (usr.lastSaleReceiptNo = +usr.lastSaleReceiptNo + 1)

      const receipt: EbmReceipt = {
        ...payload.receipt,
        reportNo,
        bottomMessage: this.getReceiptBottomMessage(payload.receipt.bottomMessage),
      }

      const saleData = {
        invoiceNo,
        modifierId: usr.tin.toString(),
        modifierName: usr.taxPayerName,
        registrantId: usr.tin.toString(),
        registrantName: usr.taxPayerName,
        tin: usr.tin,
        receiptType: EbmReceiptType.Sale,
        saleType: EbmTransactionType.Normal,
        itemsReceived: EbmYesOrNo.Yes,
        saleStatus: payload.saleStatus,
        confirmationDate: payload.confirmationDate,
        totalItems: payload.items.length,
        branchId: usr.branchId,
        customerName: payload.customerName,
        customerMobileNo: payload.customerMobileNo,
        items: convertedItems,
        receipt,
        saleDate: payload.saleDate.replaceAll('-', ''),
        paymentMethod: payload.paymentMethod,
        ...itemsTaxRateAndAmount,
        customerTin: payload.customerTin,
        purchaseCode: payload.purchaseCode,
      }
      // Capture current chain tip before calling EBM
      const prevRcptSign = usr.lastRcptSign ?? null
      const prevIntrlData = usr.lastIntrlData ?? null

      let res: EbmDefaultResponse & { data: SaleEbmResponseData }
      try {
        res = (await new EbmTransactionService(usr).SaveSale(saleData)) as EbmDefaultResponse & {
          data: SaleEbmResponseData
        }
      } catch (ebmError: any) {
        const code = ebmError?.cause?.code || ebmError?.code
        const networkCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'EAI_AGAIN']
        if (networkCodes.includes(code)) {
          await SaleQueue.create({
            userId: usr.id,
            invoiceNo,
            salePayload: saleData,
            previousRcptSign: prevRcptSign,
            previousIntrlData: prevIntrlData,
            status: 'pending',
            attemptCount: 0,
            queuedAt: DateTime.now(),
          })
          await usr.save()
          return { queued: true, invoiceNo, message: 'EBM offline — sale queued and will sync automatically when connection restores.' }
        }
        throw ebmError
      }

      // EBM responded — server is reachable regardless of result code
      usr.ebmLastOnlineAt = DateTime.now()

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        usr.lastSaleInvoiceNo = res.data.rcptNo
        usr.lastRcptSign = res.data.rcptSign ?? null
        usr.lastIntrlData = res.data.intrlData ?? null

        // F-54: Store signature chain data in sale record
        const rcptSign = res.data.rcptSign ?? null
        const intrlData = res.data.intrlData ?? null

        const [sale] = await Promise.all([
          usr.related('sales').create({
            ...saleData,
            invoiceNo,
            items: { data: convertedItems },
            confirmationDate: convertEbmLastRequestDateToDt(saleData.confirmationDate),
            stockReleaseDate:
              saleData.confirmationDate && convertEbmLastRequestDateToDt(saleData.confirmationDate),
            saleDate: DateTime.fromFormat(saleData.saleDate, 'yyyyMMdd'),
            ebmSaleData: res.data,
            resultDt: res.resultDt,
            rcptSign, // F-54: Current receipt signature (from EBM)
            previousRcptSign: prevRcptSign, // F-54: Previous signature for chain verification
            intrlData, // F-54: Internal data for signature computation
            previousIntrlData: prevIntrlData,
            currencyCode,
            originalAmount,
            exchangeRate,
            exchangeRateDate,
            paymentBreakdown: payload.paymentBreakdown || null, // F-28: Mixed payment breakdown
            expectedPaymentDate: payload.expectedPaymentDate ? DateTime.fromISO(payload.expectedPaymentDate) : null, // F-29: Credit sale
            creditStatus, // F-29: Credit status
            creditPaidAmount: 0, // F-29: Initially no amount paid
            exportDate: payload.exportDate ? DateTime.fromISO(payload.exportDate) : null, // F-32: Export date
            exportDocumentRef: payload.exportDocumentRef || null, // F-32: Export document reference
            exportCountryCode: payload.exportCountryCode || null, // F-32: Export country code
          }),
          usr.save(),
        ])

        await StockAction.decrementStock(usr, convertedItems)

        return { ...sale.toJSON(), print: true }
      } else if (
        res.resultCd === EbmApiResponseCode.InvoiceNumberAlreadyExists &&
        isDevOrSandboxEnvironment
      ) {
        await usr.save()
      }

      return response.badRequest(res)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async refund_save({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(refundSaveValidator)

    try {
      const usr = auth.user as User

      const sale = await Sale.findOrFail(payload.saleId)

      // Art. 7.30 / 5.7 — Refund must reference an EBM-approved fiscal sale
      if (!sale.ebmSaleData?.rcptNo) {
        return response.badRequest({ error: 'Cannot refund a sale that has not been approved by EBM (no receipt number).' })
      }
      // 5.8 — Proforma invoices cannot be refunded
      if (sale.saleType === EbmTransactionType.Proforma) {
        return response.badRequest({ error: 'Proforma invoices cannot be refunded. Convert to a fiscal sale first.' })
      }
      // §7.17 — An original transaction may only be cancelled once
      const existingRefund = await Sale.query()
        .where('originalInvoiceNo', sale.invoiceNo)
        .where('receiptType', EbmReceiptType.Refund)
        .first()
      if (existingRefund) {
        return response.badRequest({ error: `Sale #${sale.invoiceNo} has already been refunded (NR #${existingRefund.invoiceNo}).` })
      }

      const refundService = new EbmTransactionService(usr)

      const refundItems = sale.items.data.filter((i) =>
        payload.itemSequences?.includes(i.sequenceNo)
      )

      const convertedRefundItems =
        refundItems.length > 0
          ? refundItems.map((item, index) => {
            item.sequenceNo = index + 1
            return item
          })
          : sale.items.data

      const refundItemsTaxRateAmounts =
        refundItems.length > 0
          ? this.getTaxRatesAndAmounts(convertedRefundItems)
          : {
            taxableAmountA: sale.taxableAmountA,
            taxableAmountB: sale.taxableAmountB,
            taxableAmountC: sale.taxableAmountC,
            taxableAmountD: sale.taxableAmountD,
            taxAmountA: sale.taxAmountA,
            taxAmountB: sale.taxAmountB,
            taxAmountC: sale.taxAmountC,
            taxAmountD: sale.taxAmountD,
            totalTaxableAmount: sale.totalTaxableAmount,
            totalTaxAmount: sale.totalTaxAmount,
            totalAmount: sale.totalAmount,
          }

      /*
        confirmationDate
        invoiceNo
        ReceiptType
      */

      sale.receipt.bottomMessage = this.getReceiptBottomMessage(sale.receipt.bottomMessage)

      let invoiceNo

      if (sale.saleType === EbmTransactionType.Copy) {
        invoiceNo = +usr.lastCopyInvoiceNo + 1
      }
      else if (sale.saleType === EbmTransactionType.Training) {
        invoiceNo = +usr.lastTrainingInvoiceNo + 1
      }
      else {
        invoiceNo = +usr.lastSaleInvoiceNo + 1
      }

      const refundData: SaveRefundEbmOptions = {
        //sale data needs for refund
        customerName: sale.customerName,
        modifierId: usr.tin.toString(),
        modifierName: usr.taxPayerName,
        paymentMethod: sale.paymentMethod,
        receipt: sale.receipt,
        registrantId: sale.tin.toString(),
        registrantName: sale.registrantName,
        saleDate: sale.saleDate.toFormat('yyyyMMdd'),
        saleStatus: sale.saleStatus,
        saleType: sale.saleType,
        taxRateA: sale.taxRateA,
        taxRateB: sale.taxRateB,
        taxRateC: sale.taxRateC,
        taxRateD: sale.taxRateD,
        tin: sale.tin,
        canceledDate: convertDateTimeToLastRequestDtOption(sale.canceledDate),
        cancelRequestDate: convertDateTimeToLastRequestDtOption(sale.cancelRequestDate),
        customerTin: sale.customerTin,
        purchaseCode: payload.purchaseCode,
        branchId: sale.branchId,

        //refund data
        items: convertedRefundItems,
        totalItems: convertedRefundItems.length,
        taxableAmountA: refundItemsTaxRateAmounts.taxableAmountA,
        taxableAmountB: refundItemsTaxRateAmounts.taxableAmountB,
        taxableAmountC: refundItemsTaxRateAmounts.taxableAmountC,
        taxableAmountD: refundItemsTaxRateAmounts.taxableAmountD,
        taxAmountA: refundItemsTaxRateAmounts.taxAmountA,
        taxAmountB: refundItemsTaxRateAmounts.taxAmountB,
        taxAmountC: refundItemsTaxRateAmounts.taxAmountC,
        taxAmountD: refundItemsTaxRateAmounts.taxAmountD,
        totalTaxableAmount: refundItemsTaxRateAmounts.totalTaxableAmount,
        totalTaxAmount: refundItemsTaxRateAmounts.totalTaxAmount,
        totalAmount: refundItemsTaxRateAmounts.totalAmount,

        originalInvoiceNo: sale.invoiceNo,
        invoiceNo,
        receiptType: EbmReceiptType.Refund,
        stockReleaseDate: payload.stockReleaseDate,
        remark: payload.remark,
        refundReason: payload.refundReason,
        itemsReceived: payload.itemsReceived,
        refundDate: {
          year: payload.confirmationDate.year,
          month: payload.confirmationDate.month,
          day: payload.confirmationDate.day,
        },

        confirmationDate: {
          year: payload.confirmationDate.year,
          month: payload.confirmationDate.month,
          day: payload.confirmationDate.day,
          hour: payload.confirmationDate.hour,
          minute: payload.confirmationDate.minute,
          second: payload.confirmationDate.second,
        },
      }

      const res = (await refundService.SaveRefund(refundData)) as EbmDefaultResponse & {
        data: SaleEbmResponseData
      }

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {

        if (sale.saleType === EbmTransactionType.Copy) {
          usr.lastCopyInvoiceNo = res.data.rcptNo
        }
        else if (sale.saleType === EbmTransactionType.Training) {
          usr.lastTrainingInvoiceNo = res.data.rcptNo
        }
        else {
          usr.lastSaleInvoiceNo = res.data.rcptNo
        }

        const [refund] = await Promise.all([
          await usr.related('sales').create({
            ...refundData,
            canceledDate: sale.canceledDate,
            cancelRequestDate: sale.cancelRequestDate,
            ebmSaleData: res.data,
            items: { data: refundData.items },
            confirmationDate: convertEbmLastRequestDateToDt(refundData.confirmationDate),
            stockReleaseDate:
              refundData.confirmationDate &&
              convertEbmLastRequestDateToDt(refundData.confirmationDate),
            saleDate: DateTime.fromFormat(refundData.saleDate, 'yyyyMMdd'),
            refundDate: convertEbmLastRequestDateToDt(payload.confirmationDate),
            resultDt: res.resultDt,
          }),
          usr.save(),
        ])

        await StockAction.incrementStock(usr, convertedRefundItems)

        return { ...refund.toJSON(), print: true }
      }

      return response.badRequest(res)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async copy_save({ request, auth, response }: HttpContext) {
    const payload = await request.validateUsing(copySaveValidator)

    try {
      const oldSale = await Sale.findByOrFail('invoice_no', payload.orginalInvoiceNo)

      // 5.8 — Proforma invoices cannot be copied as fiscal receipts
      if (oldSale.saleType === EbmTransactionType.Proforma) {
        return response.badRequest({ error: 'Proforma invoices cannot be copied as fiscal receipts.' })
      }

      const confirmationDate = DateTime.now()
      const usr = auth.user as User
      const invoiceNo = ++usr.lastCopyInvoiceNo

      oldSale.receipt.bottomMessage = this.getReceiptBottomMessage(oldSale.receipt.bottomMessage)

      const copyData: SaveCopyEbmOptions = {
        //sale data needs for copy
        customerName: oldSale.customerName,
        modifierId: usr.tin.toString(),
        modifierName: usr.tin.toString(),
        paymentMethod: oldSale.paymentMethod,
        receipt: oldSale.receipt,
        registrantId: usr.tin.toString(),
        registrantName: usr.taxPayerName,
        saleDate: oldSale.saleDate.toFormat('yyyyMMdd'),
        saleStatus: oldSale.saleStatus,
        taxRateA: oldSale.taxRateA,
        taxRateB: oldSale.taxRateB,
        taxRateC: oldSale.taxRateC,
        taxRateD: oldSale.taxRateD,
        tin: oldSale.tin,
        canceledDate: convertDateTimeToLastRequestDtOption(oldSale.canceledDate),
        cancelRequestDate: convertDateTimeToLastRequestDtOption(oldSale.cancelRequestDate),
        customerTin: oldSale.customerTin,
        purchaseCode: payload.purchaseCode,
        branchId: oldSale.branchId,
        items: oldSale.items.data,
        totalItems: oldSale.items.data.length,
        taxableAmountA: oldSale.taxableAmountA,
        taxableAmountB: oldSale.taxableAmountB,
        taxableAmountC: oldSale.taxableAmountC,
        taxableAmountD: oldSale.taxableAmountD,
        taxAmountA: oldSale.taxAmountA,
        taxAmountB: oldSale.taxAmountB,
        taxAmountC: oldSale.taxAmountC,
        taxAmountD: oldSale.taxAmountD,
        totalTaxableAmount: oldSale.totalTaxableAmount,
        totalTaxAmount: oldSale.totalTaxAmount,
        totalAmount: oldSale.totalAmount,
        originalInvoiceNo: oldSale.originalInvoiceNo,
        invoiceNo,
        receiptType: oldSale.receiptType,
        stockReleaseDate: convertDateTimeToLastRequestDtOption(oldSale.stockReleaseDate),
        remark: oldSale.remark,
        refundReason: oldSale.refundReason,
        itemsReceived: oldSale.itemsReceived as EbmYesOrNo,
        refundDate: oldSale.refundDate && convertDateTimeToLastRequestDtOption(oldSale.refundDate),

        //copy data
        saleType: EbmTransactionType.Copy,
        confirmationDate: {
          year: confirmationDate.year.toString(),
          month: confirmationDate.month.toString(),
          day: confirmationDate.day.toString(),
          hour: confirmationDate.hour.toString(),
          minute: confirmationDate.minute.toString(),
          second: confirmationDate.second.toString(),
        },
      }

      const res = await new EbmTransactionService(usr).SaveCopy(copyData)

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        const [copyTransaction] = await Promise.all([
          await usr.related('sales').create({
            ...copyData,
            canceledDate: oldSale.canceledDate,
            cancelRequestDate: oldSale.cancelRequestDate,
            ebmSaleData: res.data,
            confirmationDate: oldSale.confirmationDate,
            stockReleaseDate: oldSale.stockReleaseDate,
            refundDate: oldSale.refundDate,
            saleDate: oldSale.saleDate,
            items: oldSale.items,
            resultDt: res.resultDt,
          }),
          usr.save(),
        ])

        return { ...copyTransaction.toJSON(), print: true }
      }

      return response.badRequest(res)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async training_save({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(saleTrainingValidator)

    try {
      const usr = auth.user as User

      const convertedItems = await this.convertItems(payload.items, usr.id)

      const itemsTaxRateAndAmount = this.getTaxRatesAndAmounts(convertedItems)

      const invoiceNo = +usr.lastTrainingInvoiceNo + 1

      const receipt: EbmReceipt = {
        ...payload.receipt,
        reportNo: invoiceNo,
        bottomMessage: this.getReceiptBottomMessage(payload.receipt.bottomMessage),
      }

      const saleData = {
        invoiceNo,
        modifierId: usr.tin.toString(),
        modifierName: usr.taxPayerName,
        registrantId: usr.tin.toString(),
        registrantName: usr.taxPayerName,
        tin: usr.tin,
        saleType: EbmTransactionType.Training,
        receiptType: EbmReceiptType.Sale,
        itemsReceived: EbmYesOrNo.Yes,
        saleStatus: EbmTransactionProgress.Approved,
        confirmationDate: payload.confirmationDate,
        totalItems: payload.items.length,
        branchId: usr.branchId,
        customerName: payload.customerName,
        customerMobileNo: payload.customerMobileNo,
        customerTin: payload.customerTin,
        purchaseCode: payload.purchaseCode,
        items: convertedItems,
        receipt,
        saleDate: payload.saleDate.replaceAll('-', ''),
        paymentMethod: payload.paymentMethod,
        ...itemsTaxRateAndAmount,
      }

      const res = (await new EbmTransactionService(usr).SaveTraining(saleData)) as EbmDefaultResponse & {
        data: SaleEbmResponseData
      }

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        usr.lastTrainingInvoiceNo = res.data.rcptNo

        const [sale] = await Promise.all([
          usr.related('sales').create({
            ...saleData,
            invoiceNo,
            items: { data: convertedItems },
            confirmationDate: convertEbmLastRequestDateToDt(saleData.confirmationDate),
            stockReleaseDate:
              saleData.confirmationDate && convertEbmLastRequestDateToDt(saleData.confirmationDate),
            saleDate: DateTime.fromFormat(saleData.saleDate, 'yyyyMMdd'),
            ebmSaleData: res.data,
            resultDt: res.resultDt,
          }),
          usr.save(),
        ])

        return sale
      } else if (
        res.resultCd === EbmApiResponseCode.InvoiceNumberAlreadyExists &&
        isDevOrSandboxEnvironment
      ) {
        await usr.save()
      }

      return response.badRequest(res)
    } catch (error) {
      console.log({ error })
      return this.catchErrors(response, error)
    }
  }

  async proforma_save({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(saleProformaValidator)

    try {
      const usr = auth.user as User

      const convertedItems = await this.convertItems(payload.items, usr.id)

      const itemsTaxRateAndAmount = this.getTaxRatesAndAmounts(convertedItems)

      const invoiceNo = ++usr.lastSaleInvoiceNo

      const receipt: EbmReceipt = {
        ...payload.receipt,
        reportNo: invoiceNo,
        bottomMessage: this.getReceiptBottomMessage(payload.receipt.bottomMessage),
      }

      const saleData = {
        invoiceNo,
        modifierId: usr.tin.toString(),
        modifierName: usr.taxPayerName,
        registrantId: usr.tin.toString(),
        registrantName: usr.taxPayerName,
        tin: usr.tin,
        saleType: EbmTransactionType.Proforma,
        receiptType: EbmReceiptType.Sale,
        itemsReceived: EbmYesOrNo.Yes,
        saleStatus: EbmTransactionProgress.Approved,
        confirmationDate: payload.confirmationDate,
        totalItems: payload.items.length,
        branchId: usr.branchId,
        customerName: payload.customerName,
        customerMobileNo: payload.customerMobileNo,
        items: convertedItems,
        receipt,
        saleDate: payload.saleDate.replaceAll('-', ''),
        paymentMethod: payload.paymentMethod,
        ...itemsTaxRateAndAmount,
        customerTin: payload.customerTin,
        purchaseCode: payload.purchaseCode,
      }

      const res = (await new EbmTransactionService(usr).SaveTraining(saleData)) as EbmDefaultResponse & {
        data: SaleEbmResponseData
      }

      if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
        usr.lastProformaInvoiceNo = usr.lastSaleInvoiceNo = res.data.rcptNo
        const [sale] = await Promise.all([
          usr.related('sales').create({
            ...saleData,
            invoiceNo,
            items: { data: convertedItems },
            confirmationDate: convertEbmLastRequestDateToDt(saleData.confirmationDate),
            stockReleaseDate:
              saleData.confirmationDate && convertEbmLastRequestDateToDt(saleData.confirmationDate),
            saleDate: DateTime.fromFormat(saleData.saleDate, 'yyyyMMdd'),
            ebmSaleData: res.data,
            resultDt: res.resultDt,
          }),
          usr.save(),
        ])

        return sale
      } else if (
        res.resultCd === EbmApiResponseCode.InvoiceNumberAlreadyExists &&
        isDevOrSandboxEnvironment
      ) {

        await usr.save()
      }

      return response.badRequest(res)
    } catch (error) {
      console.log('PBBB', error?.json ? await error.json() : error)
      return this.catchErrors(response, error)
    }
  }

  @ApiOperation({ summary: 'List Transaction all Transcation belongs to user' })
  async sale_list({ request, auth }: HttpContext) {
    const { page, perPage } = await userTransactionListQsValidator.validate(request.qs())

    const usr = auth.user as User

    return await usr
      .related('sales')
      .query()
      .orderBy('id', 'desc')
      .paginate(page || 1, perPage || 12)
  }

  @ApiOperation({ summary: 'Find Transcation' })
  async sale_list_find({ request, auth, response }: HttpContext) {
    const payload = await userTransactionFindQsValidator.validate(request.qs())
    const usr = auth.user as User

    try {
      return await usr
        .related('sales')
        .query()
        .preload('user')
        .where('id', payload.id || -1)
        //FIXME: add ability to find sale correctly with other parameters(columns)
        // .where((query) => {
        //   query
        //     .orWhere('invoice_no', payload.invoiceNo || -1)
        //     .orWhereRaw(`ebm_sale_data->>'intrlData' = ?`, [payload.ebmInternalData || ''])
        //     .orWhereRaw(`ebm_sale_data->>'rcptSign' = ?`, [payload.ebmReceiptSignature || ''])
        // })
        .firstOrFail()
    } catch (error) {
      this.catchErrors(response, error, 'Transaction not find')
    }
  }
  //#endregion

  //#region purchase

  async purchase_save({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(purchaseSaveValidator)

    try {
      return await PurchaseAction.confirmOrReject(auth.user as User, payload)

    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  // F-36: Purchase Refund — return goods to supplier
  async purchase_refund({ request, response, auth }: HttpContext) {
    const { purchaseRefundValidator } = await import('#validators/ebm_transaction_validator')
    const payload = await request.validateUsing(purchaseRefundValidator)

    try {
      const usr = auth.user as User
      const Purchase = (await import('#models/purchase')).default

      // F-36: Find the original purchase to refund
      const originalPurchase = await Purchase.find(payload.purchaseId)
      if (!originalPurchase) {
        return response.notFound({ error: 'Original purchase not found' })
      }

      if (originalPurchase.userId !== usr.id) {
        return response.forbidden({ error: 'Cannot refund a purchase from another user' })
      }

      // F-36: Check if already refunded
      const existingRefund = await Purchase.query()
        .where('originalInvoiceNo', originalPurchase.invoiceNo)
        .where('receiptTypeCode', 'R') // R = Refund
        .first()

      if (existingRefund) {
        return response.badRequest({
          error: `Purchase #${originalPurchase.invoiceNo} has already been refunded (Refund #${existingRefund.invoiceNo}).`,
        })
      }

      // F-36: Create refund via PurchaseAction
      return await PurchaseAction.createRefund(usr, originalPurchase, payload)

    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async purchase_list({ request, response, auth }: HttpContext) {
    const { page, perPage } = await listRequestValidator.validate(request.qs())
    const user = auth.user as User
    let purchaseAdded = 0

    try {
      purchaseAdded = await PurchaseAction.sync(user)

      const purchases = await
        user
          .related('puchaseList')
          .query()
          .orderBy('created_at', 'desc')
          .paginate(page || 1, perPage || 12)

      return { purchases, purchaseAdded }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  //#endregion

  //#region imports item
  async import_items_list({ response, auth, request }: HttpContext) {
    const { page, perPage } = await listRequestValidator.validate(request.qs())
    const user = auth.user as User

    let importItemAdded = 0

    try {
      importItemAdded = await ImportItemAction.sync(user)

      const importItems = await user
        .related('importItemList')
        .query()
        .withScopes(scope => scope.isNotAcceptedAndCanceled())
        .paginate(page || 1, perPage || 12)

      return { importItems, importItemAdded }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async import_items_approve({ request, response, auth }: HttpContext) {
    try {
      const payload = await request.validateUsing(approveImportItemValidator)
      const user = auth.user as User

      // Req #67 — Import date validation: The user's importLastReqDt acts as the
      // authoritative "last successful import date"; the approve action will update it.
      // If any downstream validation is needed on specific dates, check via the ImportItem record.
      const importItem = await ImportItemList.find(payload.id)
      if (importItem && user.importLastReqDt && importItem.taskDt) {
        if (String(importItem.taskDt) < user.importLastReqDt) {
          return response.badRequest({
            error: 'Import request date must be newer than the last approved import date.',
            lastRequestDt: user.importLastReqDt,
          })
        }
      }

      console.log(payload)
      return await ImportItemAction.approve(user, payload)

    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async import_items_cancel({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(cancelImportItemValidator)

    try {

      return await ImportItemAction.cancel(auth.user as User, payload)

    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async import_select({ params, response, auth }: HttpContext) {
    try {
      const user = auth.user as User
      const branchId = params.branchId

      return await ImportItemList.query().where({
        userId: user.id,
        branchId: branchId
      })
    } catch (error) {
      if (error?.cause?.code === 'ECONNREFUSED') {
        return response.serviceUnavailable({ resultMsg: 'EBM server is not connected!' })
      }

      console.error(error)
      return response.badRequest(error)
    }
  }

  //#endregion

  //#region methods

  private async convertItems(items: Infer<typeof saleSaveValidator>['items'], userId: string) {
    const convertedItems = items.map((item, index) => {
      const discountRate = item.discountRate
      const supplyPrice = item.price * item.quantity
      const discountAmount = (supplyPrice * discountRate) / 100
      const taxableAmount = supplyPrice - discountAmount
      const rate = getTaxRateByType(item.taxationType)
      const taxAmount =
        rate > 0 ? (getTaxAmountByType(item.taxationType) * taxableAmount) / rate : 0

      console.log({ taxAmount })
      const totalAmount = taxableAmount

      return {
        ...item,
        sequenceNo: index + 1,
        discountRate,
        quantity: formatNumberBy2Decimals(item.quantity),
        price: formatNumberBy2Decimals(item.price),
        supplyPrice: formatNumberBy2Decimals(supplyPrice),
        discountAmount: formatNumberBy2Decimals(discountAmount),
        taxAmount: formatNumberBy2Decimals(taxAmount),
        taxableAmount: formatNumberBy2Decimals(taxableAmount),
        totalAmount: formatNumberBy2Decimals(totalAmount),
      }
    })

    return Promise.resolve(convertedItems)
  }

  private getTaxRatesAndAmounts(items: EbmItem[]) {
    const taxRateA = env.get('EBM_TAX_RATE_A')
    const taxRateB = env.get('EBM_TAX_RATE_B')
    const taxRateC = env.get('EBM_TAX_RATE_C')
    const taxRateD = env.get('EBM_TAX_RATE_D')

    const caluclateTaxableAmount = (items: EbmItem[]) =>
      formatNumberBy2Decimals(
        items.length <= 0 ? 0 : items.map((v) => v.taxableAmount).reduce((a, b) => a + b, 0.0)
      )

    const caluclateTaxAmount = (items: EbmItem[]) =>
      formatNumberBy2Decimals(
        items.length <= 0 ? 0 : items.map((v) => v.taxAmount).reduce((a, b) => a + b, 0.0)
      )

    const taxableAmountAItems = items.filter((item) => item.taxationType === EbmTaxType.A)
    const taxableAmountA = caluclateTaxableAmount(taxableAmountAItems)

    const taxAmountA = parseFloat('0.00')

    const taxableAmountBItems = items.filter((item) => item.taxationType === EbmTaxType.B)

    const taxableAmountB = caluclateTaxableAmount(taxableAmountBItems)
    const taxAmountB = caluclateTaxAmount(taxableAmountBItems)

    const taxableAmountCItems = items.filter((item) => item.taxationType === EbmTaxType.C)
    const taxableAmountC = caluclateTaxableAmount(taxableAmountCItems)
    const taxAmountC = caluclateTaxAmount(taxableAmountCItems)

    const taxableAmountDItems = items.filter((item) => item.taxationType === EbmTaxType.D)
    const taxableAmountD = caluclateTaxableAmount(taxableAmountDItems)
    const taxAmountD = caluclateTaxAmount(taxableAmountDItems)

    const totalTaxAmount = taxAmountA + taxAmountB + taxAmountC + taxAmountD

    const totalTaxableAmount = taxableAmountA + taxableAmountB + taxableAmountC + taxableAmountD

    return {
      taxableAmountA,
      taxableAmountB,
      taxableAmountC,
      taxableAmountD,
      taxAmountA,
      taxAmountB,
      taxAmountC,
      taxAmountD,
      taxRateA,
      taxRateB,
      taxRateC,
      taxRateD,
      totalTaxableAmount,
      totalTaxAmount,
      totalAmount: totalTaxableAmount,
    }
  }

  private getReceiptBottomMessage(message: string | undefined) {
    const versionMsg = `${env.get('EBM_CIS_NAME')} ${env.get('EBM_CIS_VERSION')} power by RRA VSDC EBM ${env.get('EBM_API_VERSION')}`
    let bottomMessage = ''

    if (message?.includes('RRA')) {
      const newMessage = message && message.split('\n').slice(1).join('\n')
      bottomMessage = `${versionMsg}\n${newMessage}`
    } else {
      bottomMessage = message ? `${versionMsg}\n${message}` : versionMsg
    }

    return bottomMessage
  }

  //#endregion

  //#region utility endpoints

  async ebm_reconnect({ response, auth }: HttpContext) {
    const usr = auth.user as User
    try {
      await new EbmInitService(usr).InitilizeDevice({
        tin: usr.tin,
        branchId: usr.branchId,
        deviceSerialNo: usr.serialNo,
      })
      usr.ebmLastOnlineAt = DateTime.now()
      await usr.save()
      return { reconnected: true }
    } catch (error: any) {
      const code = error?.cause?.code || error?.code
      const networkCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'EAI_AGAIN']
      if (networkCodes.includes(code)) {
        return response.serviceUnavailable({ reconnected: false, error: 'EBM server is unreachable.' })
      }
      // EBM responded with an error code (e.g. 896) — server IS reachable, clear the block
      if (error?.resultCd) {
        usr.ebmLastOnlineAt = DateTime.now()
        await usr.save()
        return { reconnected: true, resultCd: error.resultCd, resultMsg: error.resultMsg }
      }
      return this.catchErrors(response, error)
    }
  }

  async training_mode_toggle({ response, auth }: HttpContext) {
    try {
      const user = auth.user as User
      user.isTrainingMode = !user.isTrainingMode
      await user.save()
      return {
        isTrainingMode: user.isTrainingMode,
        message: user.isTrainingMode ? 'Training mode activated' : 'Training mode deactivated',
      }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  async receipt_counters({ auth }: HttpContext) {
    const user = auth.user as User
    return {
      lastSaleInvoiceNo: user.lastSaleInvoiceNo,
      lastTrainingInvoiceNo: user.lastTrainingInvoiceNo,
      lastProformaInvoiceNo: user.lastProformaInvoiceNo,
      lastCopyInvoiceNo: user.lastCopyInvoiceNo,
      lastPurchaseInvoiceNo: user.lastPurchaseInvoiceNo,
      lastInvoiceNo: user.lastInvoiceNo,
      lastSaleReceiptNo: user.lastSaleReceiptNo,
    }
  }

  // Art. 7.28 — Return last EBM-approved receipt for power failure / paper jam recovery
  async last_receipt({ auth }: HttpContext) {
    const usr = auth.user as User
    return await usr.related('sales').query()
      .whereNotNull('ebm_sale_data')
      .orderBy('created_at', 'desc')
      .first()
  }

  async sale_lock_check({ request, response, auth }: HttpContext) {
    try {
      const user = auth.user as User
      const saleId = request.param('id')
      const sale = await user.related('sales').query().where('id', saleId).firstOrFail()

      // Req #28 — Approved receipts must not be modified
      if (sale.ebmSaleData && sale.ebmSaleData.rcptNo) {
        return response.forbidden({ error: 'This receipt has been approved by EBM and cannot be modified. Use a refund to reverse it.' })
      }

      return { locked: false, saleId }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }

  //#endregion
}
