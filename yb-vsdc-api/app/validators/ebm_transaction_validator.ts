import {
  EbmPackagingUnit,
  EbmPaymentMethod,
  EbmTaxType,
  EbmTransactionProgress,
  EbmUnitOfQuantity,
} from '#types/ebm/ebm_type'
import vine from '@vinejs/vine'
import { lastRequestDateValidatorObject } from './ebm_validator.js'
import { EbmYesOrNo } from '#types/ebm/ebm_service_type'

export const saleSaveValidator = vine.compile(
  vine.object({
    customerTin: vine.number().optional().requiredIfExists('purchaseCode'),
    customerName: vine.string(),
    customerMobileNo: vine.string().optional(),
    purchaseCode: vine.string().optional().requiredIfExists('customerTin'), // purchase code needed only when selling to business
    paymentMethod: vine.enum(Object.values(EbmPaymentMethod)),
    paymentBreakdown: vine.array( // F-28: Mixed payment breakdown — e.g., [{method: '01', amount: 500}, {method: '05', amount: 1500}]
      vine.object({
        method: vine.string().maxLength(2),
        amount: vine.number().positive(),
      })
    ).optional(),
    currencyCode: vine.string().maxLength(3).toUpperCase().optional(), // ISO 4217 currency code (USD, EUR, etc.) — optional, defaults to RWF
    originalAmount: vine.number().positive().optional().requiredIfExists('currencyCode'), // Amount in original currency if foreign currency used
    saleStatus: vine.enum(Object.values(EbmTransactionProgress)),
    confirmationDate: lastRequestDateValidatorObject, // Date in the format 'yyyy-MM-dd HH:mm:ss'
    saleDate: vine.string().regex(/\d{4}-\d{2}-\d{2}/), // Date in the format 'yyyy-MM-dd'

    expectedPaymentDate: vine.string().regex(/\d{4}-\d{2}-\d{2}/).optional(), // F-29: Expected payment date for credit sales (yyyy-MM-dd)

    exportDate: vine.string().regex(/\d{4}-\d{2}-\d{2}/).optional(), // F-32: Export date (yyyy-MM-dd) — required if selling to export
    exportDocumentRef: vine.string().maxLength(50).optional().requiredIfExists('exportDate'), // F-32: Export document reference (customs doc, bill of lading, etc.)
    exportCountryCode: vine.string().fixedLength(2).toUpperCase().optional().requiredIfExists('exportDate'), // F-32: ISO 3166-1 country code (e.g., US, TZ, UG)

    stockReleaseDate: lastRequestDateValidatorObject.optional(), // Optional field for stock release date

    cancelRequestDate: lastRequestDateValidatorObject.optional(), // Optional field for cancel request date

    canceledDate: lastRequestDateValidatorObject.optional(), // Optional field for canceled date

    refundDate: lastRequestDateValidatorObject.optional(), // Optional field for refund date

    refundReason: vine.enum(Object.values(EbmTransactionProgress)).optional(), // Optional enum for refund reason

    itemsReceived: vine.enum(Object.values(EbmYesOrNo)), // Enum validation for itemsReceived

    remark: vine.string().optional(), // Optional field for remarks

    receipt: vine.object({
      customerTin: vine.number().optional(),
      customerMobileNo: vine.string().optional(),
      tradeName: vine.string().optional(),
      address: vine.string().optional(),
      topMessage: vine.string().optional(),
      bottomMessage: vine.string().optional(),
      itemReceived: vine.enum(EbmYesOrNo),
    }),

    items: vine.array(
      vine.object({
        classificationCode: vine.string(),
        code: vine.string(),
        name: vine.string(),
        barcode: vine.string().optional(),
        packageUnit: vine.enum(Object.values(EbmPackagingUnit)),
        packageNo: vine.number(),
        quantityUnit: vine.enum(Object.values(EbmUnitOfQuantity)),
        quantity: vine.number(),
        price: vine.number(),
        discountRate: vine.number(),
        // discountAmount: vine.number(),
        taxationType: vine.enum(Object.values(EbmTaxType)),
        insuranceCode: vine.string().optional(),
        insuranceName: vine.string().optional(), //mandatory if insurance code is setted
        insuranceRate: vine.number().optional().requiredIfExists('insuranceName'), //mandatory if insurance code is setted
        insuranceAmount: vine.number().optional().requiredIfExists('insuranceRate'), //mandatory if insurance code is setted
        // taxableAmount: vine.number(),
        // totalAmount: vine.number(),
        // taxAmount: vine.number(),
        expirationDate: vine
          .string()
          .regex(/\d{4}-\d{2}-\d{2}/)
          .minLength(10)
          .maxLength(10)
          .optional(),
      })
    ),
  })
)

export const refundSaveValidator = vine.compile(
  vine.object({
    saleId: vine.string(),
    stockReleaseDate: lastRequestDateValidatorObject.optional(), // Optional field for stock release date
    confirmationDate: lastRequestDateValidatorObject, // Date in the format 'yyyy-MM-dd HH:mm:ss'

    refundReason: vine.enum(Object.values(EbmTransactionProgress)), // Optional enum for refund reason

    itemsReceived: vine.enum(Object.values(EbmYesOrNo)), // Enum validation for itemsReceived

    remark: vine.string().optional(), // Optional field for remarks

    itemSequences: vine.array(vine.number()).optional(),
    purchaseCode: vine.string().fixedLength(6).optional(),
  })
)

export const copySaveValidator = vine.compile(
  vine.object({
    orginalInvoiceNo: vine.number(),
    purchaseCode: vine.string().optional(),
  })
)

export const saleTrainingValidator = vine.compile(
  vine.object({
    customerTin: vine.number().optional(),
    customerName: vine.string(),
    customerMobileNo: vine.string().optional(),
    purchaseCode: vine.string().optional(), // Optional field for purchase code
    paymentMethod: vine.enum(Object.values(EbmPaymentMethod)), // Optional payment method enum
    confirmationDate: lastRequestDateValidatorObject, // Date in the format 'yyyy-MM-dd HH:mm:ss'
    saleDate: vine.string().regex(/\d{4}-\d{2}-\d{2}/), // Date in the format 'yyyy-MM-dd'

    stockReleaseDate: lastRequestDateValidatorObject.optional(), // Optional field for stock release date

    cancelRequestDate: lastRequestDateValidatorObject.optional(), // Optional field for cancel request date

    canceledDate: lastRequestDateValidatorObject.optional(), // Optional field for canceled date

    refundDate: lastRequestDateValidatorObject.optional(), // Optional field for refund date

    refundReason: vine.enum(Object.values(EbmTransactionProgress)).optional(), // Optional enum for refund reason

    itemsReceived: vine.enum(Object.values(EbmYesOrNo)), // Enum validation for itemsReceived

    remark: vine.string().optional(), // Optional field for remarks

    receipt: vine.object({
      customerTin: vine.number().optional(),
      customerMobileNo: vine.string().optional(),
      tradeName: vine.string().optional(),
      address: vine.string().optional(),
      topMessage: vine.string().optional(),
      bottomMessage: vine.string().optional(),
      itemReceived: vine.enum(EbmYesOrNo),
    }),

    items: vine.array(
      vine.object({
        classificationCode: vine.string(),
        code: vine.string(),
        name: vine.string(),
        barcode: vine.string().optional(),
        packageUnit: vine.enum(Object.values(EbmPackagingUnit)),
        packageNo: vine.number(),
        quantityUnit: vine.enum(Object.values(EbmUnitOfQuantity)),
        quantity: vine.number(),
        price: vine.number(),
        discountRate: vine.number(),
        // discountAmount: vine.number(),
        taxationType: vine.enum(Object.values(EbmTaxType)),
        insuranceCode: vine.string().optional().requiredIfExists('insuranceName'),
        insuranceName: vine.string().optional().requiredIfExists('insuranceCode'), //mandatory if insurance code is setted
        insuranceRate: vine.number().optional().requiredIfExists('insuranceName'), //mandatory if insurance code is setted
        // insuranceAmount: vine.number().optional().requiredIfExists('insuranceRate'), //mandatory if insurance code is setted
        // taxableAmount: vine.number(),
        // totalAmount: vine.number(),
        // taxAmount: vine.number(),
        expirationDate: vine
          .string()
          .regex(/\d{4}-\d{2}-\d{2}/)
          .minLength(10)
          .maxLength(10)
          .optional(),
      })
    ),
  })
)

export const saleProformaValidator = vine.compile(
  vine.object({
    customerTin: vine.number().optional(),
    customerName: vine.string(),
    customerMobileNo: vine.string().optional(),
    purchaseCode: vine.string().optional(), // Optional field for purchase code
    paymentMethod: vine.enum(Object.values(EbmPaymentMethod)), // Optional payment method enum
    confirmationDate: lastRequestDateValidatorObject, // Date in the format 'yyyy-MM-dd HH:mm:ss'
    saleDate: vine.string().regex(/\d{4}-\d{2}-\d{2}/), // Date in the format 'yyyy-MM-dd'

    stockReleaseDate: lastRequestDateValidatorObject.optional(), // Optional field for stock release date

    cancelRequestDate: lastRequestDateValidatorObject.optional(), // Optional field for cancel request date

    canceledDate: lastRequestDateValidatorObject.optional(), // Optional field for canceled date

    refundDate: lastRequestDateValidatorObject.optional(), // Optional field for refund date

    refundReason: vine.enum(Object.values(EbmTransactionProgress)).optional(), // Optional enum for refund reason

    itemsReceived: vine.enum(Object.values(EbmYesOrNo)), // Enum validation for itemsReceived

    remark: vine.string().optional(), // Optional field for remarks

    receipt: vine.object({
      customerTin: vine.number().optional(),
      customerMobileNo: vine.string().optional(),
      tradeName: vine.string().optional(),
      address: vine.string().optional(),
      topMessage: vine.string().optional(),
      bottomMessage: vine.string().optional(),
      itemReceived: vine.enum(EbmYesOrNo),
    }),

    items: vine.array(
      vine.object({
        classificationCode: vine.string(),
        code: vine.string(),
        name: vine.string(),
        barcode: vine.string().optional(),
        packageUnit: vine.enum(Object.values(EbmPackagingUnit)),
        packageNo: vine.number(),
        quantityUnit: vine.enum(Object.values(EbmUnitOfQuantity)),
        quantity: vine.number(),
        price: vine.number(),
        discountRate: vine.number(),
        // discountAmount: vine.number(),
        taxationType: vine.enum(Object.values(EbmTaxType)),
        insuranceCode: vine.string().optional(),
        insuranceName: vine.string().optional(), //mandatory if insurance code is setted
        insuranceRate: vine.number().optional().requiredIfExists('insuranceName'), //mandatory if insurance code is setted
        // insuranceAmount: vine.number().optional().requiredIfExists('insuranceRate'), //mandatory if insurance code is setted
        // taxableAmount: vine.number(),
        // totalAmount: vine.number(),
        // taxAmount: vine.number(),
        expirationDate: vine
          .string()
          .regex(/\d{4}-\d{2}-\d{2}/)
          .minLength(10)
          .maxLength(10)
          .optional(),
      })
    ),
  })
)

export const purchaseSaveValidator = vine.compile(
  vine.object({
    purchaseId: vine.string(),
    isConfirm: vine.boolean(),
    items: vine.array(
      vine.object({
        itemId: vine.string().exists({table: 'items', column: 'id'}).optional(),
        sequenceNo: vine.number(),
        name: vine.string().optional().requiredIfMissing('itemId'),
        barcode: vine.string().optional(),
        cisProductId: vine.string().optional(),
        insuranceApplicableYn: vine.enum(EbmYesOrNo)
      })
    ).optional().requiredWhen('isConfirmed', '=', true)
  })
)

//#region purchases

export const purchaseItemSchema = vine.object({
  itemSeq: vine.number(),
  itemCd: vine.string(),
  itemClsCd: vine.string(),
  itemNm: vine.string(),
  bcd: vine.string().optional(),
  spplrItemClsCd: vine.string().optional(),
  spplrItemCd: vine.string().optional(),
  spplrItemNm: vine.string().optional(),
  pkgUnitCd: vine.string(),
  pkg: vine.number(),
  qtyUnitCd: vine.string(),
  qty: vine.number(),
  prc: vine.number(),
  splyAmt: vine.number(),
  dcRt: vine.number(),
  dcAmt: vine.number(),
  taxblAmt: vine.number(),
  taxTyCd: vine.string(),
  taxAmt: vine.number(),
  totAmt: vine.number(),
  itemExprDt: vine.string().optional(),
})

export const savePurchaseValidator = vine.compile(
  vine.object({
    invcNo: vine.number(),
    orgInvcNo: vine.number(),
    spplrTin: vine.string().optional(),
    spplrBhfId: vine.string().optional(),
    spplrNm: vine.string().optional(),
    spplrInvcNo: vine.number().optional(),
    pchsTyCd: vine.string(),
    rcptTyCd: vine.string(),
    pmtTyCd: vine.string(),
    pchsSttsCd: vine.string(),
    // cfmDt: vine.string(),
    wrhsDt: vine.string().optional(),
    cnclReqDt: vine.string().optional(),
    cnclDt: vine.string().optional(),
    rfdDt: vine.string().optional(),
    totItemCnt: vine.number(),
    taxblAmtA: vine.number(),
    taxblAmtB: vine.number(),
    taxblAmtC: vine.number(),
    taxblAmtD: vine.number(),
    taxRtA: vine.number(),
    taxRtB: vine.number(),
    taxRtC: vine.number(),
    taxRtD: vine.number(),
    taxAmtA: vine.number(),
    taxAmtB: vine.number(),
    taxAmtC: vine.number(),
    taxAmtD: vine.number(),
    totTaxblAmt: vine.number(),
    totTaxAmt: vine.number(),
    totAmt: vine.number(),
    remark: vine.string().optional(),

    itemList: vine.array(purchaseItemSchema),
  })
)

export const purchaseRefundValidator = vine.compile(
  vine.object({
    purchaseId: vine.string(), // F-36: Original purchase ID to refund
    refundReason: vine.string().optional(), // F-36: Why the goods are being returned
    itemList: vine.array(purchaseItemSchema).optional(), // F-36: Items being returned (subset of original purchase)
  })
)

//#endregion
