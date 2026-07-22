import env from '#start/env'
import {
  EbmEndpoint,
  EbmLastRequestDateTime,
  ItemCodeEbmOptions,
  EbmSelectRequest,
} from '#types/ebm/ebm_service_type'
import { EbmDefaultResponse } from '#types/ebm/ebm_type'
import Admin from '#models/admin'
import User from '#models/user'
import ky, { KyInstance } from 'ky'
import app from '@adonisjs/core/services/app'

const DEV_MOCK_RESPONSES: Partial<Record<EbmEndpoint, object>> = {
  [EbmEndpoint.SelectInitInfo]: {
    resultCd: '902',
    resultMsg: 'It is succeeded',
    resultDt: '20260101000000',
    data: {
      info: {
        tin: '999909100', taxprNm: 'TEST VSDC', bsnsActv: 'TESTING',
        bhfId: '00', bhfNm: 'Headquarter', bhfOpenDt: '20210214',
        prvncNm: 'KIGALI CITY', dstrtNm: 'GASABO', sctrNm: 'REMERA',
        locDesc: 'KG 100 St', hqYn: 'Y', mgrNm: 'Test Manager',
        mgrTelNo: '0780000000', mgrEmail: 'manager@test.com',
        sdcId: 'SDC010000001', mrcNo: 'MRC0000001',
        dvcId: 'DVCTEST0000001',
        lastPchsInvcNo: 0, lastSaleRcptNo: 0,
        lastInvcNo: 0, lastSaleInvcNo: 0,
        lastTrainInvcNo: 0, lastProfrmInvcNo: 0, lastCopyInvcNo: 0,
      },
    },
  },
  [EbmEndpoint.saveDeviceInfo]: { resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.saveStockItems]: { resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.saveStock]:      { resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.saveStockMaster]:{ resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.saveSales]: {
    resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000',
    data: {
      rcptNo: 1, intrlData: 'DEVMOCKINTRLDATA001', rcptSign: 'DEVMOCKSIGN001',
      totRcptNo: 1, vsdcRcptPbctDate: '20260101000000',
      sdcId: 'SDC010000001', mrcNo: 'MRC0000001',
    },
  },
  [EbmEndpoint.savePurchases]:       { resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.saveItemComposition]: { resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.saveBranchCustomers]: { resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.saveBranchUsers]:     { resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.saveBranchInsurances]:{ resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.updateImportItems]:   { resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000', data: null },
  [EbmEndpoint.selectItems]: {
    resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000',
    data: {
      itemList: [
        {
          itemCd: 'RW2BQKGM0000001', itemClsCd: '5020110100', itemTyCd: '2',
          itemNm: 'Inyange Mineral Water 500ml', itemStdNm: 'Mineral Water',
          orgnNatCd: 'RW', pkgUnitCd: 'BQ', qtyUnitCd: 'U',
          taxTyCd: 'B', bcd: '50201101', dftPrc: 500,
          grpPrcL1: 500, grpPrcL2: 450, grpPrcL3: 420, grpPrcL4: 400, grpPrcL5: 380,
          btchNo: '260101', addInfo: 'Bottled mineral water', sftyQty: 50,
          isrcAplcbYn: 'N', useYn: 'Y', rraModYn: 'N',
        },
        {
          itemCd: 'RW2CTKGM0000002', itemClsCd: '5020120100', itemTyCd: '2',
          itemNm: 'Coca-Cola 50cl', itemStdNm: 'Carbonated Soft Drink',
          orgnNatCd: 'RW', pkgUnitCd: 'CT', qtyUnitCd: 'U',
          taxTyCd: 'B', bcd: '50201201', dftPrc: 800,
          grpPrcL1: 800, grpPrcL2: 720, grpPrcL3: null, grpPrcL4: null, grpPrcL5: null,
          btchNo: '260101', addInfo: null, sftyQty: 24,
          isrcAplcbYn: 'N', useYn: 'Y', rraModYn: 'N',
        },
        {
          itemCd: 'RW1BGKGM0000003', itemClsCd: '5010110100', itemTyCd: '1',
          itemNm: 'White Rice 1kg', itemStdNm: 'Milled White Rice',
          orgnNatCd: 'RW', pkgUnitCd: 'BG', qtyUnitCd: 'KGM',
          taxTyCd: 'A', bcd: '50101101', dftPrc: 1200,
          grpPrcL1: 1200, grpPrcL2: 1100, grpPrcL3: 1000, grpPrcL4: null, grpPrcL5: null,
          btchNo: '260101', addInfo: 'Basic food — exempt', sftyQty: 100,
          isrcAplcbYn: 'N', useYn: 'Y', rraModYn: 'N',
        },
        {
          itemCd: 'RW2CTKGM0000004', itemClsCd: '5020210100', itemTyCd: '2',
          itemNm: 'Primus Beer 72cl', itemStdNm: 'Lager Beer',
          orgnNatCd: 'RW', pkgUnitCd: 'CT', qtyUnitCd: 'U',
          taxTyCd: 'B', bcd: '50202101', dftPrc: 1500,
          grpPrcL1: 1500, grpPrcL2: 1400, grpPrcL3: null, grpPrcL4: null, grpPrcL5: null,
          btchNo: '260101', addInfo: null, sftyQty: 24,
          isrcAplcbYn: 'N', useYn: 'Y', rraModYn: 'N',
        },
        {
          itemCd: 'RW3NTKGM0000005', itemClsCd: '9010100100', itemTyCd: '3',
          itemNm: 'IT Support Service', itemStdNm: 'Software Support',
          orgnNatCd: 'RW', pkgUnitCd: 'NT', qtyUnitCd: 'U',
          taxTyCd: 'B', bcd: null, dftPrc: 50000,
          grpPrcL1: null, grpPrcL2: null, grpPrcL3: null, grpPrcL4: null, grpPrcL5: null,
          btchNo: null, addInfo: 'IT consulting — service type, no stock', sftyQty: null,
          isrcAplcbYn: 'N', useYn: 'Y', rraModYn: 'N',
        },
      ]
    }
  },
  [EbmEndpoint.selectStockItems]: {
    resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000',
    data: {
      stockList: [
        { itemCd: 'RW2BQKGM0000001', rsdQty: 120 },
        { itemCd: 'RW2CTKGM0000002', rsdQty: 48  },
        { itemCd: 'RW1BGKGM0000003', rsdQty: 250 },
        { itemCd: 'RW2CTKGM0000004', rsdQty: 72  },
        { itemCd: 'RW3NTKGM0000005', rsdQty: 0   },
      ]
    }
  },
  [EbmEndpoint.selectImportItems]: {
    resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260331000000',
    data: {
      itemList: [{
        taskCd: 'TASK001', dclDe: '20260331', itemSeq: 1,
        dclNo: 'DCL202603310001', hsCd: '2201100000',
        itemNm: 'Mineral Water Import Batch',
        imptItemsttsCd: '2',
        orgnNatCd: 'KE', exptNatCd: 'KE',
        pkg: 100, pkgUnitCd: 'BQ',
        qty: 1000, qtyUnitCd: 'KGM',
        totWt: 500, netWt: 450,
        spplrNm: 'Kenya Beverages Ltd', agntNm: 'RW Clearing Agent',
        invcFcurAmt: 800, invcFcurCd: 'USD', invcFcurExcrt: 1300,
      }],
    },
  },
  [EbmEndpoint.selectTrnsPurchaseSales]: {
    resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260331000000',
    data: {
      saleList: [{
        spplrTin: '999909100', spplrNm: 'TEST VSDC', spplrBhfId: '00',
        spplrInvcNo: 2, spplrSdcId: 'SDC010000001', spplrMrcNo: 'MRC0000001',
        prcOrdCd: 'ABC001', rcptTyCd: 'P', pmtTyCd: '02',
        cfmDt: '2026-03-31 11:00:00', salesDt: '20260331',
        stockRlsDt: '2026-03-31 11:00:00',
        totItemCnt: 1,
        taxblAmtA: 0, taxblAmtB: 2000, taxblAmtC: 0, taxblAmtD: 0,
        taxRtA: 0, taxRtB: 18, taxRtC: 0, taxRtD: 0,
        taxAmtA: 0, taxAmtB: 0, taxAmtC: 0, taxAmtD: 0,
        totTaxblAmt: 2000, totTaxAmt: 0, totAmt: 2000,
        itemList: [{
          itemSeq: 1, itemCd: 'RW3NTKGM0000003', itemClsCd: '5020230301',
          itemNm: 'Delivery Service', pkgUnitCd: 'NT', pkg: 1,
          qtyUnitCd: 'KGM', qty: 1, prc: 2000, splyAmt: 2000,
          dcRt: 0, dcAmt: 0, taxTyCd: 'B', taxblAmt: 2000, taxAmt: 0, totAmt: 2000,
        }],
      }],
    },
  },
  [EbmEndpoint.selectBranchUsers]:        { resultCd: '001', resultMsg: 'No search result', resultDt: '20260101000000', data: null },
  [EbmEndpoint.selectBranchInsurances]:   { resultCd: '001', resultMsg: 'No search result', resultDt: '20260101000000', data: null },
  [EbmEndpoint.selectItemsClass]: {
    resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000',
    data: {
      itemClsList: [
        // Level 1 — top categories
        { itemClsCd: '5000000000', itemClsNm: 'Food, Beverages & Tobacco',       itemClsLvl: 1, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '6000000000', itemClsNm: 'Clothing & Accessories',           itemClsLvl: 1, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '4400000000', itemClsNm: 'Electronic Components & Supplies', itemClsLvl: 1, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '8500000000', itemClsNm: 'Healthcare & Medical',             itemClsLvl: 1, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '7800000000', itemClsNm: 'Building & Construction',          itemClsLvl: 1, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '9000000000', itemClsNm: 'Services',                         itemClsLvl: 1, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        // Level 2 — sub-categories
        { itemClsCd: '5020000000', itemClsNm: 'Beverages',           itemClsLvl: 2, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5010000000', itemClsNm: 'Food products',       itemClsLvl: 2, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5030000000', itemClsNm: 'Tobacco products',    itemClsLvl: 2, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '8510000000', itemClsNm: 'Pharmaceuticals',     itemClsLvl: 2, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '9010000000', itemClsNm: 'Professional Services', itemClsLvl: 2, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '9020000000', itemClsNm: 'Transportation Services', itemClsLvl: 2, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        // Level 3
        { itemClsCd: '5020100000', itemClsNm: 'Non-alcoholic beverages', itemClsLvl: 3, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5020200000', itemClsNm: 'Alcoholic beverages',     itemClsLvl: 3, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5010100000', itemClsNm: 'Cereals & Grains',        itemClsLvl: 3, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5010200000', itemClsNm: 'Dairy products',          itemClsLvl: 3, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5010300000', itemClsNm: 'Meat & Poultry',          itemClsLvl: 3, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '8510100000', itemClsNm: 'Medicines & Drugs',       itemClsLvl: 3, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '9010100000', itemClsNm: 'IT & Software Services',  itemClsLvl: 3, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        // Level 4
        { itemClsCd: '5020110000', itemClsNm: 'Water',           itemClsLvl: 4, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5020120000', itemClsNm: 'Soft drinks',     itemClsLvl: 4, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5020130000', itemClsNm: 'Fruit juices',    itemClsLvl: 4, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5020210000', itemClsNm: 'Beer & Lager',    itemClsLvl: 4, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5020220000', itemClsNm: 'Wine',            itemClsLvl: 4, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5020230000', itemClsNm: 'Spirits & Liquor',itemClsLvl: 4, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5010110000', itemClsNm: 'Rice',            itemClsLvl: 4, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5010120000', itemClsNm: 'Maize / Corn',    itemClsLvl: 4, taxTyCd: null, mjrTgYn: 'Y', useYn: 'Y' },
        // Level 5 — selectable leaf codes
        { itemClsCd: '5020110100', itemClsNm: 'Mineral water (bottled)',   itemClsLvl: 5, taxTyCd: 'B', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5020110200', itemClsNm: 'Sparkling water',           itemClsLvl: 5, taxTyCd: 'B', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5020120100', itemClsNm: 'Carbonated soft drinks',    itemClsLvl: 5, taxTyCd: 'B', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5020120200', itemClsNm: 'Energy drinks',             itemClsLvl: 5, taxTyCd: 'B', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5020130100', itemClsNm: 'Orange juice',              itemClsLvl: 5, taxTyCd: 'B', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5020210100', itemClsNm: 'Beer (standard)',           itemClsLvl: 5, taxTyCd: 'B', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5020220100', itemClsNm: 'Red wine',                  itemClsLvl: 5, taxTyCd: 'B', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5010110100', itemClsNm: 'White rice (milled)',       itemClsLvl: 5, taxTyCd: 'A', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5010110200', itemClsNm: 'Brown rice',               itemClsLvl: 5, taxTyCd: 'A', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5010120100', itemClsNm: 'Maize flour',              itemClsLvl: 5, taxTyCd: 'A', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5010200100', itemClsNm: 'Fresh milk',               itemClsLvl: 5, taxTyCd: 'A', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5010200200', itemClsNm: 'Yoghurt',                  itemClsLvl: 5, taxTyCd: 'B', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5010300100', itemClsNm: 'Fresh chicken',            itemClsLvl: 5, taxTyCd: 'A', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '5010300200', itemClsNm: 'Beef (fresh)',             itemClsLvl: 5, taxTyCd: 'A', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '8510100100', itemClsNm: 'Prescription medicines',   itemClsLvl: 5, taxTyCd: 'A', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '8510100200', itemClsNm: 'Over-the-counter medicines',itemClsLvl: 5, taxTyCd: 'A', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '9010100100', itemClsNm: 'Software development service', itemClsLvl: 5, taxTyCd: 'B', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '9010100200', itemClsNm: 'IT consulting service',    itemClsLvl: 5, taxTyCd: 'B', mjrTgYn: 'Y', useYn: 'Y' },
        { itemClsCd: '9020100100', itemClsNm: 'Freight transport service',itemClsLvl: 5, taxTyCd: 'B', mjrTgYn: 'Y', useYn: 'Y' },
      ]
    }
  },
  [EbmEndpoint.selectCodes]:       { resultCd: '001', resultMsg: 'No search result', resultDt: '20260101000000', data: null },
  [EbmEndpoint.selectNotices]:  {
    resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260531120000',
    data: {
      noticeList: [
        {
          noticeNo: 1,
          title: 'VAT Rate Adjustment for 2026',
          cont: 'Dear Taxpayers,\n\nPlease be informed that the VAT rates have been adjusted for the year 2026. The new rates are as follows:\n- Category A: 0%\n- Category B: 18%\n- Category C: 0%\n- Category D: 0%\n\nThese changes are effective from January 1, 2026.',
          dtlUrl: 'https://www.rra.gov.rw/notices/vat-2026',
          regrNm: 'Rwanda Revenue Authority',
          regDt: '20260501100000',
        },
        {
          noticeNo: 2,
          title: 'Electronic Invoice Requirements Update',
          cont: 'All taxpayers are required to submit invoices electronically through the VSDC system. The new requirements include:\n1. All invoices must be signed electronically\n2. Invoices must be transmitted within 24 hours\n3. Use of QR codes is now mandatory for all invoice types\n\nFor more information, please visit our website.',
          dtlUrl: 'https://www.rra.gov.rw/notices/invoice-requirements',
          regrNm: 'Rwanda Revenue Authority',
          regDt: '20260515140000',
        },
        {
          noticeNo: 3,
          title: 'Year-End Tax Compliance Reminder',
          cont: 'As we approach the end of the fiscal year, please ensure all your tax obligations are met:\n- Reconcile all transactions\n- Ensure all receipts are recorded\n- Submit final reports before the deadline\n- Maintain proper documentation\n\nFailure to comply may result in penalties.',
          dtlUrl: 'https://www.rra.gov.rw/notices/tax-compliance',
          regrNm: 'Rwanda Revenue Authority',
          regDt: '20260520090000',
        },
      ],
    },
  },
  [EbmEndpoint.selectCustomer]: { resultCd: '001', resultMsg: 'No search result', resultDt: '20260101000000', data: null },
  [EbmEndpoint.selectBranches]: {
    resultCd: '000', resultMsg: 'It is succeeded', resultDt: '20260101000000',
    data: {
      bhfList: [
        {
          tin: '999909100', bhfId: '00', bhfNm: 'Headquarter', bhfSttsCd: 'A',
          prvncNm: 'KIGALI CITY', dstrtNm: 'GASABO', sctrNm: 'REMERA',
          locDesc: 'KG 100 St', hqYn: 'Y',
          mgrNm: 'Test Manager', mgrTelNo: '0780000000', mgrEmail: 'manager@test.com',
        },
      ],
    },
  },
}

export interface EbmHeaders {
  tin?: string | number
  bhfId?: string
  dvcSrlNo?: string
}

export class EbmService {
  private baseUrl = env.get('EBM_BASE_URL')
  protected client: KyInstance
  private static instance: KyInstance | null = null
  protected user?: User | Admin

  constructor(user?: User | Admin) {
    this.user = user
    this.client = EbmService.instance || this.createClient()
  }

  private createClient() {
    return ky.create({
      prefixUrl: this.baseUrl,
      retry: 3,
      timeout: 1000 * 150,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  public generateItemCode(options: ItemCodeEbmOptions) {
    let lastIncrementCode = ''

    if (!options.lastItemCode) {
      lastIncrementCode = '0000001'
    } else {
      const itemCodeMatch = options.lastItemCode.slice(-7)

      const lastCodePart = (parseInt(itemCodeMatch, 10) + 1).toString()

      for (let i = 0; i < 7 - lastCodePart.length; i++) {
        lastIncrementCode += '0'
      }

      lastIncrementCode += lastCodePart
    }

    return (
      options.itemCode.countryCode +
      options.itemCode.productType +
      options.itemCode.packingUnit +
      options.itemCode.quantityUnit +
      lastIncrementCode
    )
  }

  public generateLastReqDt(options: EbmLastRequestDateTime) {
    options.year = options.year || '2018'
    options.month = options.month || '05'
    options.day = options.day || '20'
    options.hour = options.hour || '00'
    options.minute = options.minute || '00'
    options.second = options.second || '00'

    const newOptions = this.serializeLastReqDtAttribute(options)

    return (
      newOptions.year +
      newOptions.month +
      newOptions.day +
      newOptions.hour +
      newOptions.minute +
      newOptions.second
    )
  }

  private serializeLastReqDtAttribute(options: EbmLastRequestDateTime) {
    let newOptions: any = { year: options.year }

    for (const key of Object.keys(options)) {
      if (key === 'year') continue
      const value = options[key as 'month']
      newOptions[key as 'month'] = value?.length == 2 ? value : '0' + value
    }

    return {
      year: newOptions.year,
      month: newOptions.month,
      day: newOptions.day,
      hour: newOptions.hour,
      minute: newOptions.minute,
      second: newOptions.second,
    }
  }

  protected async selectEbmData<T>(
    endpoint: EbmEndpoint,
    options: EbmSelectRequest
  ) {
    const body = this.convertSelectEbmDataOptionToEbmProps(options)
    const headers: EbmHeaders = {
      tin: options.tin,
      bhfId: options.branchId,
    }
    return this.postEbmData<T>(endpoint, body, headers)
  }

  protected async postEbmData<T>(endpoint: EbmEndpoint, body: string, overrides?: EbmHeaders) {
    console.log(`[EBM REQ] ${endpoint}`, body)

    if (app.inDev && DEV_MOCK_RESPONSES[endpoint] !== undefined) {
      const mock = DEV_MOCK_RESPONSES[endpoint] as EbmDefaultResponse & T
      console.log(`[EBM DEV MOCK] ${endpoint}`, mock)
      return mock
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (overrides) {
      if (overrides.tin) headers['tin'] = String(overrides.tin)
      if (overrides.bhfId) headers['bhfId'] = String(overrides.bhfId)
      if (overrides.dvcSrlNo) headers['dvcSrlNo'] = String(overrides.dvcSrlNo)
    }

    if (this.user) {
      if (!headers['tin'] && this.user.tin) headers['tin'] = String(this.user.tin)
      if (!headers['bhfId']) headers['bhfId'] = String(this.user.branchId || '00')
      if (!headers['dvcSrlNo'] && this.user.serialNo) headers['dvcSrlNo'] = String(this.user.serialNo)
    }

    try {
      const res = await this.client.post(endpoint, { body, headers })
      const data = await res.json<EbmDefaultResponse & T>()
      console.log(`[EBM RES] ${endpoint}`, data)
      return data
    } catch (error) {
      console.error(`[EBM ERR] ${endpoint}`, error)
      throw error
    }
  }

  protected convertSelectEbmDataOptionToEbmProps(options: EbmSelectRequest) {
    return JSON.stringify({
      tin: String(options.tin || this.user?.tin),
      bhfId: String(options.branchId || this.user?.branchId || '00'),
      lastReqDt: options.lastRequestDt,
    })
  }
}
