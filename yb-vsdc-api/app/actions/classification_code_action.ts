import Admin from "#models/admin";
import User from "#models/user";
import ClassificationCode from "#models/classification_code";
import { EbmItemService } from "#services/ebm/ebm_item_service";
import env from "#start/env";
import { EbmApiResponseCode, EbmItemClassification } from "#types/ebm/ebm_type";
import { Meilisearch } from "meilisearch";

const client = new Meilisearch({
  host: env.get('MEILISEARCH_HOST'),
  apiKey: env.get('MEILISEARCH_API_KEY'),
});

export const MEILLISEARCH_PURCHASE_INDEX = 'classification_codes'

export default class ClassificationCodeAction {
  static async sync(caller: Admin | User) {
    let count = 0

    // Admins use delta sync via classificationLastReqDt.
    // Operators always do a full sync since they don't own the delta pointer.
    const lastRequestDt = caller instanceof Admin
      ? (caller.classificationLastReqDt || '20180101000000')
      : '20180101000000'

    const response = await new EbmItemService().selectItemClass({
      branchId: caller instanceof User ? (caller.branchId || '00') : '00',
      tin: caller.tin,
      lastRequestDt,
    })

    if (response.resultCd != EbmApiResponseCode.ServerSucceeded && response.resultCd != EbmApiResponseCode.NoSearchResult) {
      throw response.resultMsg
    }

    if (response.resultCd == EbmApiResponseCode.ServerSucceeded) {
      const items = this.formatItemClassifcationFromEbm(response.data.itemClsList)
      await ClassificationCode.updateOrCreateMany('code', items)
      count = items.length
    }

    // Only persist the delta timestamp on Admin to avoid User model migration
    if (caller instanceof Admin) {
      await caller.merge({ classificationLastReqDt: response.resultDt }).save()
    }

    return Promise.resolve(count)
  }

  static async search(query: string | undefined) {
    const index = client.index(MEILLISEARCH_PURCHASE_INDEX)
    const result = await index.search(query)
    const classificationCodes = result.hits.map((hit) => ({
      name: hit.name,
      code: hit.code,
      taxType: hit.taxType,
      used: hit.used
    }))

    return Promise.resolve(classificationCodes)
  }

  static formatItemClassifcationFromEbm(items: EbmItemClassification[]) {
    return items.map((item) => ({
      name: item.itemClsNm,
      code: item.itemClsCd,
      level: item.itemClsLvl,
      isMajorTarget: item.mjrTgYn,
      taxType: item.taxTyCd,
      used: item.useYn
    }))
  }
}