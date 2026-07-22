import User from "#models/user";
import { EbmInitService } from "#services/ebm/ebm_init_service";
import { InitEbmOption } from "#types/ebm/ebm_service_type";
import { EbmApiResponseCode } from "#types/ebm/ebm_type";
import { userCreationStoreValidator } from "#validators/users/user_creation_validator";
import app from "@adonisjs/core/services/app";
import { attachmentManager } from "@jrmc/adonis-attachment";
import { Infer } from "@vinejs/vine/types";

const fakeData = `{
  "resultCd": "000",
  "resultMsg": "It is succeeded",
  "resultDt": "20220130101912",
  "data": {
    "info": {
      "tin": "999000099",
      "taxprNm": "TEST VSDC",
      "bsnsActv": "TESTING",
      "bhfId": "00",
      "bhfNm": "Headquarter",
      "bhfOpenDt": "20210214",
      "prvncNm": "KIGALI CITY",
      "dstrtNm": "GASABO",
      "sctrNm": "JALI",
      "locDesc": "KN 5 St.",
      "hqYn": "Y",
      "mgrNm": "Minsoo",
      "mgrTelNo": "0780000000",
      "mgrEmail": "test@gaoin.kr",
      "sdcId": null,
      "mrcNo": null,
      "dvcId": "9990000997006310",
      "intrlKey": null,
      "signKey": null,
      "cmcKey": null,
      "lastPchsInvcNo": 0,
      "lastSaleRcptNo": 0,
      "lastInvcNo": null,
      "lastSaleInvcNo": 0,
      "lastTrainInvcNo": null,
      "lastProfrmInvcNo": null,
      "lastCopyInvcNo": null
    }
  }
}
`

export default class UserAction {
  static async init(payload: Infer<typeof userCreationStoreValidator>) {
    const res = app.inDev ? JSON.parse(fakeData) : await new EbmInitService().InitilizeDevice({
      branchId: "00",
      tin: payload.tin,
      deviceSerialNo: payload.serialNo
    })

    if (res.resultCd === EbmApiResponseCode.ServerSucceeded) {
      const user = this.formatForEbm(res.data)

      return User.create({
        ...user,
        ...payload,
        initLastReqDt: res.resultDt,
        image: payload.image ? await attachmentManager.createFromFile(payload.image) : null
      })
    }

    throw 'device is not installed properly'
  }

  static async checkDevice(option: InitEbmOption) {
    const res = await new EbmInitService().InitilizeDevice(option)

    if (res.resultCd === EbmApiResponseCode.ServerDeviceInstalled) {
      return Promise.resolve({ success: res.resultMsg })
    }

    throw 'device is not installed'
  }

  static formatForEbm(data: any) {
    return {
      tin: Number(data.info.tin),
      taxPayerName: data.info.taxprNm,
      businessActivity: data.info.bsnsActv,
      branchId: data.info.bhfId,
      branchName: data.info.bhfNm,
      branchOpenDate: data.info.bhfOpenDt,
      province: data.info.prvncNm,
      district: data.info.dstrtNm,
      sector: data.info.sctrNm,
      address: data.info.locDesc,
      headquarterYn: data.info.hqYn,
      managerName: data.info.mgrNm,
      managerTel: data.info.mgrTelNo,
      managerEmail: data.info.mgrEmail,
      sdcId: data.info.sdcId,
      mrc: data.info.mrcNo,
      deviceId: data.info.dvcId,
      // internalKey: data.info.intrlKey,
      // signKey: data.info.signKey,
      // cmcKey: data.info.cmcKey,
      lastPurchaseInvoiceNo: data.info.lastPchsInvcNo,
      lastSaleReceiptNo: data.info.lastSaleRcptNo,
      lastInvoiceNo: data.info.lastInvcNo,
      lastSaleInvoiceNo: data.info.lastSaleInvcNo,
      lastTrainingInvoiceNo: data.info.lastTrainInvcNo,
      lastProformaInvoiceNo: data.info.lastProfrmInvcNo,
      lastCopyInvoiceNo: data.info.lastCopyInvcNo
    }
  }
}