import {
  EbmCountryCode,
  EbmCurrencyCode,
  EbmDefaultResponse,
  EbmImportItemStatus,
  EbmPackagingUnit,
  EbmPaymentMethod,
  EbmProductType,
  EbmReceiptType,
  EbmRegistrationType,
  EbmStockInOutType,
  EbmTaxType,
  EbmTransactionProgress,
  EbmTransactionType,
  EbmUnitOfQuantity,
  EbmYesOrNo,
} from '#types/ebm/ebm_type'

export {
  EbmCountryCode,
  EbmCurrencyCode,
  EbmImportItemStatus,
  EbmPackagingUnit,
  EbmPaymentMethod,
  EbmProductType,
  EbmReceiptType,
  EbmRegistrationType,
  EbmStockInOutType,
  EbmTaxType,
  EbmTransactionProgress,
  EbmTransactionType,
  EbmUnitOfQuantity,
  EbmYesOrNo,
}

export type { EbmDefaultResponse }

export interface EbmSelectRequest {
  tin?: number
  branchId?: string
  lastRequestDt: string
}

export interface EbmItemClassificationCode {
  countryCode: EbmCountryCode
  productType: EbmProductType
  packingUnit: EbmPackagingUnit
  quantityUnit: EbmUnitOfQuantity
}

export interface ItemCodeEbmOptions {
  itemCode: EbmItemClassificationCode
  lastItemCode?: string
}

export interface InitEbmOption {
  tin: number
  branchId: string
  deviceSerialNo: string
}

export interface SaveDeviceInfoOption {
  tin: number
  branchId: string
  deviceSerialNo: string
  mrcNo?: string | null
  sdcId?: string | null
}

export type InitEbmInfo = {
  tin: string
  taxprNm: string
  bsnsActv: string
  bhfId: string
  bhfNm: string
  bhfOpenDt: string
  prvncNm: string
  dstrtNm: string
  sctrNm: string
  locDesc: string
  hqYn: string
  mgrNm: string
  mgrTelNo: string
  mgrEmail: string
  sdcId: string | null
  mrcNo: string | null
  dvcId: string | null
  intrlKey: string | null
  signKey: string | null
  cmcKey: string | null
  lastPchsInvcNo: number | null
  lastSaleRcptNo: number | null
  lastInvcNo: number | null
  lastSaleInvcNo: number | null
  lastTrainInvcNo: number | null
  lastProfrmInvcNo: number | null
  lastCopyInvcNo: number | null
}

//#region customers

export interface EbmSelectCustomerRequest {
  tin: number
  branchId: string
  customerTin: number
}

export interface EbmSelectCustomerResponse {
  resultCd: string
  resultMsg: string
  resultDt: string
  data: {
    custList: Array<{
      tin: string
      taxprNm: string
      taxprSttsCd: string
      prvncNm: string
      dstrtNm: string
      sctrNm: string
      locDesc: string
    }>
  } | null
}

//#endregion
export interface EbmTaxpayerInfo {
  tin: number
  taxperName: string
  taxPayerSstatusCode: string
  province: string
  district: string
  sector: string
  address: string
}

export interface EbmLastRequestDateTime {
  year?: string
  month?: string
  day?: string
  hour?: string
  minute?: string
  second?: string
}

export interface SelectBranchEbmOption {
  tin: number
  branchId: string
  lastRequestDt: string
}


export interface SaveSaleEbmOptions {
  tin: number
  branchId: string
  invoiceNo: number
  originalInvoiceNo?: number
  customerTin?: number //needed if customer tin is setted
  purchaseCode?: string | null
  customerName: string
  saleType: EbmTransactionType
  receiptType: EbmReceiptType
  paymentMethod: EbmPaymentMethod
  saleStatus: EbmTransactionProgress
  confirmationDate: EbmLastRequestDateTime
  saleDate: string //yyyyMMdd format
  stockReleaseDate?: EbmLastRequestDateTime
  cancelRequestDate?: EbmLastRequestDateTime
  canceledDate?: EbmLastRequestDateTime
  refundDate?: EbmLastRequestDateTime
  refundReason?: EbmTransactionProgress
  totalItems: number
  taxableAmountA: number
  taxableAmountB: number
  taxableAmountC: number
  taxableAmountD: number
  taxRateA: number
  taxRateB: number
  taxRateC: number
  taxRateD: number
  taxAmountA: number
  taxAmountB: number
  taxAmountC: number
  taxAmountD: number
  totalTaxableAmount: number
  totalTaxAmount: number
  totalAmount: number
  itemsReceived: EbmYesOrNo
  remark?: string
  registrantName: string
  registrantId: string
  modifierId: string
  modifierName: string
  receipt: EbmReceipt
  items: EbmItem[]
}

export interface SaveRefundEbmOptions {
  tin: number
  branchId: string
  invoiceNo: number
  originalInvoiceNo: number
  customerTin?: number | null //needed if customer tin is setted
  purchaseCode?: string | null
  customerName: string
  saleType: EbmTransactionType
  receiptType: EbmReceiptType
  paymentMethod: EbmPaymentMethod
  saleStatus: EbmTransactionProgress
  confirmationDate: EbmLastRequestDateTime
  saleDate: string //yyyyMMdd format
  stockReleaseDate?: EbmLastRequestDateTime
  cancelRequestDate?: EbmLastRequestDateTime
  canceledDate?: EbmLastRequestDateTime
  refundDate: EbmLastRequestDateTime
  refundReason: EbmTransactionProgress
  totalItems: number
  taxableAmountA: number
  taxableAmountB: number
  taxableAmountC: number
  taxableAmountD: number
  taxRateA: number
  taxRateB: number
  taxRateC: number
  taxRateD: number
  taxAmountA: number
  taxAmountB: number
  taxAmountC: number
  taxAmountD: number
  totalTaxableAmount: number
  totalTaxAmount: number
  totalAmount: number
  itemsReceived: EbmYesOrNo
  remark?: string
  registrantName: string
  registrantId: string
  modifierId: string
  modifierName: string
  receipt: EbmReceipt
  items: EbmItem[]
}

export interface SaveCopyEbmOptions {
  tin: number
  branchId: string
  invoiceNo: number
  originalInvoiceNo: number
  customerTin?: number | null
  //needed if customer tin is setted
  purchaseCode?: string | null
  customerName: string
  saleType: EbmTransactionType
  receiptType: EbmReceiptType
  paymentMethod: EbmPaymentMethod
  saleStatus: EbmTransactionProgress
  confirmationDate: EbmLastRequestDateTime
  saleDate: string //yyyyMMdd format
  stockReleaseDate?: EbmLastRequestDateTime | null
  cancelRequestDate?: EbmLastRequestDateTime
  canceledDate?: EbmLastRequestDateTime
  refundDate?: EbmLastRequestDateTime | null
  refundReason?: EbmTransactionProgress | null
  totalItems: number
  taxableAmountA: number
  taxableAmountB: number
  taxableAmountC: number
  taxableAmountD: number
  taxRateA: number
  taxRateB: number
  taxRateC: number
  taxRateD: number
  taxAmountA: number
  taxAmountB: number
  taxAmountC: number
  taxAmountD: number
  totalTaxableAmount: number
  totalTaxAmount: number
  totalAmount: number
  itemsReceived: EbmYesOrNo
  remark?: string | null
  registrantName: string
  registrantId: string
  modifierId: string
  modifierName: string
  receipt: EbmReceipt
  items: EbmItem[]
}

export interface SaveTrainingEbmOptions {
  tin: number
  branchId: string
  invoiceNo: number
  originalInvoiceNo?: number
  customerTin?: number
  //needed if customer tin is setted
  purchaseCode?: string | null
  customerName: string
  customerMobileNo?: string | null
  saleType: EbmTransactionType
  receiptType: EbmReceiptType
  paymentMethod: EbmPaymentMethod
  saleStatus: EbmTransactionProgress
  confirmationDate: EbmLastRequestDateTime
  saleDate: string //yyyyMMdd format
  stockReleaseDate?: EbmLastRequestDateTime
  cancelRequestDate?: EbmLastRequestDateTime
  canceledDate?: EbmLastRequestDateTime
  refundDate?: EbmLastRequestDateTime
  refundReason?: EbmTransactionProgress
  totalItems: number
  taxableAmountA: number
  taxableAmountB: number
  taxableAmountC: number
  taxableAmountD: number
  taxRateA: number
  taxRateB: number
  taxRateC: number
  taxRateD: number
  taxAmountA: number
  taxAmountB: number
  taxAmountC: number
  taxAmountD: number
  totalTaxableAmount: number
  totalTaxAmount: number
  totalAmount: number
  itemsReceived: EbmYesOrNo
  remark?: string
  registrantName: string
  registrantId: string
  modifierId: string
  modifierName: string
  receipt: EbmReceipt
  items: EbmItem[]
}

export interface EbmReceipt {
  customerTin?: number
  customerMobileNo?: string | null
  reportNo: number
  tradeName?: string
  address?: string
  topMessage?: string
  bottomMessage?: string
  itemReceived: EbmYesOrNo
}

export interface EbmItem {
  sequenceNo: number
  code: string
  classificationCode: string
  name: string
  barcode?: string
  packageUnit: EbmPackagingUnit
  packageNo: number
  quantityUnit: EbmUnitOfQuantity
  quantity: number
  price: number
  supplyPrice: number
  discountRate: number
  discountAmount: number
  insuranceCode?: string
  insuranceName?: string //mandatory if insurance code is setted
  insuranceRate?: number //mandatory if insurance code is setted
  insuranceAmount?: number //mandatory if insurance code is setted
  taxationType: EbmTaxType
  taxableAmount: number
  totalAmount: number
  taxAmount: number
  expirationDate?: string
}

export enum EbmEndpoint {
  SelectInitInfo = 'initializer/selectInitInfo',
  saveDeviceInfo = 'device/saveDvcInfo',
  selectCustomer = 'customers/selectCustomer',
  selectBranches = 'branches/selectBranches',
  saveSales = 'trnsSales/saveSales',
  selectItemsClass = 'itemClass/selectItemsClass',
  savePurchases = 'trnsPurchase/savePurchases',
  saveStockItems = 'items/saveItems',
  selectItems = 'items/selectItems',
  selectStockItems = 'stock/selectStockItems',
  saveStock = 'stock/saveStockItems',
  saveStockMaster = 'stockMaster/saveStockMaster',
  updateImportItems = 'imports/updateImportItems',
  saveBranchCustomers = 'branches/saveBranchCustomers',
  saveBranchUsers = 'branches/saveBranchUsers',
  saveBranchInsurances = 'branches/saveBranchInsurances',
  selectCodes = 'code/selectCodes',
  selectNotices = 'notices/selectNotices',
  selectImportItems = 'imports/selectImportItems',
  selectBranchUsers = 'branches/selectBranchUser',
  selectBranchInsurances = 'branches/selectBranchInsurance',
  selectTrnsPurchaseSales = 'trnsPurchase/selectTrnsPurchaseSales',
  saveItemComposition = 'items/saveItemComposition',
}

export interface SaleEbmResponseData {
  rcptNo: number
  intrlData: string
  rcptSign: string
  totRcptNo: number
  vsdcRcptPbctDate: string // Date in the format 'yyyyMMddHHmmss'
  sdcId: string
  mrcNo: string
}

export interface selectItemClassEbmOption {
  tin: number
  branchId: string
  lastReqDt: string
}
//#region purchase
export interface TrnsPurchaseSalesRequestResponse {
  // Top-level response metadata
  resultCd: string
  resultMsg: string
  resultDt: string

  // Sale list (can be multiple sales)
  data: {
    saleList: Array<{
      spplrTin: string // Supplier TIN
      spplrNm: string // Supplier Name
      spplrBhfId: string // Supplier Branch ID
      spplrInvcNo: number // Supplier Invoice Number
      prcOrdCd: string // Purchase Order Code
      spplrSdcId: string // Supplier SDC ID
      spplrMrcNo: string // Supplier MRC Number
      rcptTyCd: string // Receipt Type Code
      pmtTyCd: string // Payment Type Code
      cfmDt: string // Confirmed Date (YYYY-MM-DD HH:mm:ss)
      salesDt: string // Sales Date (YYYYMMDD)
      stockRlsDt: string // Stock Released Date (YYYY-MM-DD HH:mm:ss)
      totItemCnt: number // Total Item Count

      taxblAmtA: number
      taxblAmtB: number
      taxblAmtC: number
      taxblAmtD: number

      taxRtA: number
      taxRtB: number
      taxRtC: number
      taxRtD: number

      taxAmtA: number
      taxAmtB: number
      taxAmtC: number
      taxAmtD: number

      totTaxblAmt: number
      totTaxAmt: number
      totAmt: number

      remark: string | null

      itemList: Array<{
        itemSeq: number // Item Sequence
        itemCd: string // Item Code
        itemClsCd: string // Item Classification Code
        itemNm: string // Item Name
        bcd: string | null // Barcode
        pkgUnitCd: string // Packaging Unit Code
        pkg: number // Package
        qtyUnitCd: string // Quantity Unit Code
        qty: number // Quantity
        prc: number // Unit Price
        splyAmt: number // Supply Amount
        dcRt: number // Discount Rate
        dcAmt: number // Discount Amount
        taxTyCd: string // Taxation Type Code
        taxblAmt: number // Taxable Amount
        taxAmt: number // Tax Amount
        totAmt: number // Total Amount
      }>
    }>
  }
}

export interface EbmPurchaseItem {
  sequenceNo: number
  code: string
  classificationCode: string
  name: string
  barcode?: string
  supplierItemClassificationCode: string
  supplierItemCode: string
  supplierItemName: string
  packageUnit: EbmPackagingUnit
  packageNo: number
  quantityUnit: EbmUnitOfQuantity
  quantity: number
  price: number
  supplyPrice: number
  discountRate: number
  discountAmount: number
  taxationType: EbmTaxType
  taxableAmount: number
  totalAmount: number
  taxAmount: number
  expirationDate?: string
}

export interface EbmPurchaseSave {
  tin: number
  branchId: string
  invoiceNo: number
  originalInvoiceNo: number
  supplierTin?: number | null
  supplierBranchId?: string | null
  supplierName?: string | null
  supplierInvoiceNo?: number | null
  supplierSdcId?: string | null
  prcOrdCd?: string | null
  registrationTypeCode: EbmRegistrationType
  purchaseTypeCode: EbmTransactionType
  receiptTypeCode: EbmReceiptType
  paymentMethod: EbmPaymentMethod
  purchaseStatusCode: EbmTransactionProgress
  confirmationDate?: string
  purchaseDate: string //yyyyMMdd format;
  warehousingDate?: string | null
  cancelRequestDate?: string
  canceledDate?: string
  refundDate?: string
  totalItems: number
  taxableAmountA: number
  taxableAmountB: number
  taxableAmountC: number
  taxableAmountD: number
  taxRateA: number
  taxRateB: number
  taxRateC: number
  taxRateD: number
  taxAmountA: number
  taxAmountB: number
  taxAmountC: number
  taxAmountD: number
  totalTaxableAmount: number
  totalTaxAmount: number
  totalAmount: number
  registrantName: string
  registrantId: string
  modifierId: string
  modifierName: string
  remark?: string | null
  items: EbmPurchaseItem[]
}

//#endregion

export interface EbmItemSave {
  tin?: number
  branchId?: string
  code: string
  classificationCode: string
  typeCode: EbmProductType
  name: string
  standarName?: string
  originalNationCode: EbmCountryCode
  packagingUnitCode: EbmPackagingUnit
  quantityUnitCode: EbmUnitOfQuantity
  taxTypeCode: EbmTaxType
  batchNo?: string
  barcode?: string
  defaultUnitPrice: number
  groupPriceL1?: number
  groupPriceL2?: number
  groupPriceL3?: number
  groupPriceL4?: number
  groupPriceL5?: number
  additinalInfo?: string
  saftyQuantity?: number
  insuranceApplicableYn: EbmYesOrNo
  useYn: EbmYesOrNo
  regristantName?: string
  regristrantId?: string
  modifierName?: string
  modifierId?: string
  deviceId?: string
  deviceSerialNo?: string
}

export interface EbmItemSelect {
  tin?: number
  branchId?: string
  lastRequestDt: string
}

export interface EbmStockItem {
  sequenceNo: number
  code: string
  classificationCode: string
  name: string
  barcode?: string
  packageUnit: EbmPackagingUnit
  packageNo: number
  quantityUnit: EbmUnitOfQuantity
  quantity: number
  itemExpireDt?: string
  price: number
  supplyPrice: number
  discountAmount: number
  taxationType: EbmTaxType
  taxableAmount: number
  taxAmount: number
  totalAmount: number
  expirationDate?: string
}

export interface EbmStockWithItem {
  code: string
  classificationCode: string
  name: string
  barcode?: string
  packageUnit: EbmPackagingUnit
  packageNo: number
  quantityUnit: EbmUnitOfQuantity
  quantity: number
  itemExpireDt?: string
  price: number
  discountAmount: number
  taxationType: EbmTaxType
  expirationDate?: string
}

export interface EbmStock {
  tin?: number
  branchId?: string
  storedAndReleasedNo: number
  originalStoredAndReleaseNo: number
  registrationType: EbmRegistrationType
  customerTin?: string
  customerName?: string
  customerBranchId?: string
  storedAndReleasedType: EbmStockInOutType
  occuredDt: string
  totalItem: number
  totalTaxableAmount: number
  totalTaxAmount: number
  totalAmount: number
  remark?: string
  regristrantId?: string
  regristrantName?: string
  modifierName?: string
  modifierId?: string
  deviceId?: string
  deviceSerialNo?: string
  items: EbmStockItem[]
}

export interface InventoryItem {
  tin?: number
  branchId?: string
  itemCode: string
  remainQuantity: number
  // stockTyCd: 1=Opening Stock, 2=Purchase IN, 3=Manual Adjustment (§9.1)
  stockTyCd?: '1' | '2' | '3'
  registrantId?: string
  registrantName?: string
  modifierId?: string
  modifierName?: string
  deviceId?: string
  deviceSerialNo?: string
}

//#region import items
export interface ImportDeclarationItem {
  taskCd: string
  dclDe: string
  itemSeq: number
  dclNo: string
  hsCd: string
  itemNm: string
  imptItemsttsCd: EbmImportItemStatus
  orgnNatCd: EbmCountryCode
  exptNatCd: EbmCountryCode
  pkg: number
  pkgUnitCd: EbmPackagingUnit
  qty: number
  qtyUnitCd: EbmUnitOfQuantity
  totWt: number
  netWt: number
  spplrNm: string
  agntNm: string
  invcFcurAmt: number
  invcFcurCd: EbmCurrencyCode
  invcFcurExcrt: number
}

export interface UpdateImportItemOption {
  tin?: number
  branchId?: string
  taskCode: number
  declarationDate: string
  itemSequence: number
  hsCode: string
  itemClassificationCode: string
  itemCode: string
  importStatus: EbmImportItemStatus
  remark?: string
  modifierName?: string
  modifierId?: string
}

export interface EbmImportItemsSelect {
  tin?: number
  branchId?: string
  lastRequestDt: string
}

//#endregion

//#region branches
export interface BranchCustomerInfo {
  tin: number
  branchId: string
  customerNo: string
  customerPhoneNumber: string
  customerTin: number
  customerName: string
  address?: string
  contact?: string
  email?: string
  faxNumber?: string
  used: EbmYesOrNo
  remark?: string
  registrantName: string
  registrantId: string
  modifierName: string
  modifierId: string
}

export interface BranchUsersInfo {
  tin: number
  branchId: string
  userId: string
  userName: string
  password: string
  address?: string
  contact?: string
  authorityCode?: string
  remark?: string
  used: EbmYesOrNo
  registrantName: string
  registrantId: string
  modifierName: string
  modifierId: string
}

export interface BranchInsuranceInfo {
  tin: number
  branchId: string
  insuranceCode: string
  insuranceName: string
  premiumRate: number
  used: EbmYesOrNo
  registrantName: string
  registrantId: string
  modifierName: string
  modifierId: string
}

//#endregion

//#region codes
export interface SelectCodesEbmOption {
  tin: number
  branchId: string
  lastRequestDt: string
}

//#endregion

//#region notices
export interface SelectNoticesEbmOption {
  tin: number
  branchId: string
  lastRequestDt: string
}

export interface SelectNoticesEbmResponse extends EbmDefaultResponse {
  noticeNo: number // Notice Number
  title: string // Title (max 1000 characters)
  cont: string // Contents (max 4000 characters)
  dtlUrl: string // Detail URL (max 200 characters)
  regrNm: string // Registration name (max 60 characters)
  regDt: string // Registration date time (14-character string, e.g., "20240714123000")
}

//#endregion

//#region purchases
export interface EbmPurchaseSaveRequest {
  tin: number
  bhfId: string
  invcNo: number
  orgInvcNo: number
  spplrTin?: string | null
  spplrBhfId?: string | null
  spplrNm?: string | null
  spplrInvcNo?: number
  prcOrdCd?: string | null
  regTyCd: string
  pchsTyCd: string
  rcptTyCd: string
  pmtTyCd: string
  pchsSttsCd: string
  cfmDt: string
  pchsDt: string
  wrhsDt?: string
  cnclReqDt?: string
  cnclDt?: string
  rfdDt?: string
  totItemCnt: number
  taxblAmtA: number
  taxblAmtB: number
  taxblAmtC: number
  taxblAmtD: number
  taxRtA: number
  taxRtB: number
  taxRtC: number
  taxRtD: number
  taxAmtA: number
  taxAmtB: number
  taxAmtC: number
  taxAmtD: number
  totTaxblAmt: number
  totTaxAmt: number
  totAmt: number
  remark: string | null
  regrNm: string
  regrId: string
  modrNm: string
  modrId: string
  spplrSdcId?: string
  itemList: EbmPurchaseSaveItem[]
}

export interface EbmPurchaseSaveItem {
  itemSeq: number
  itemCd: string
  itemClsCd: string
  itemNm: string
  bcd?: string
  spplrItemClsCd?: string
  spplrItemCd?: string
  spplrItemNm?: string
  pkgUnitCd: string
  pkg: number
  qtyUnitCd: string
  qty: number
  prc: number
  splyAmt: number
  dcRt: number
  dcAmt: number
  taxblAmt: number
  taxTyCd: string
  taxAmt: number
  totAmt: number
  itemExprDt?: string
}

//#endregion

export type ItemClassificationCode = {
  name: string
  code: string
  level: number
  taxType?: EbmTaxType | null
  isMajorTarget?: boolean | null
  used: EbmYesOrNo
}

export interface EbmSelectBranchUsersResponse extends EbmDefaultResponse {
  data: {
    userList: Array<{
      tin: string
      bhfId: string
      userId: string
      userNm: string
      pwd: string
      adrs: string | null
      cntc: string | null
      authCd: string | null
      useYn: EbmYesOrNo
      regrNm: string
      regrId: string
      regDt: string
      modrNm: string
      modrId: string
      modDt: string
    }>
  } | null
}

export interface EbmSelectBranchInsurancesResponse extends EbmDefaultResponse {
  data: {
    isrcList: Array<{
      tin: string
      bhfId: string
      isrccCd: string
      isrccNm: string
      isrcRt: number
      useYn: EbmYesOrNo
      regrNm: string
      regrId: string
      regDt: string
      modrNm: string
      modrId: string
      modDt: string
    }>
  } | null
}

export interface EbmSelectStockItemsResponse extends EbmDefaultResponse {
  data: {
    stockList: Array<{
      itemCd: string
      rsdQty: number
    }>
  } | null
}

export interface EbmItemComposition {
  itemCd: string
  cpstItemCd: string
  qty: number
  prc: number
}

export interface EbmItemCompositionSave {
  tin: string
  bhfId: string
  regrId: string
  regrNm: string
  modrId: string
  modrNm: string
  itemList: EbmItemComposition[]
}