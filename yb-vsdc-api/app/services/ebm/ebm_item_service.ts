import {
  EbmEndpoint,
  EbmItemCompositionSave,
  EbmSelectRequest,
  UpdateImportItemOption,
} from '#types/ebm/ebm_service_type'
import { EbmDefaultResponse, EbmItemClassificationResponse } from '#types/ebm/ebm_type'
import { EbmService } from './ebm_service.js'

export class EbmItemService extends EbmService {
  // Your code here
  async selectItemClass(options: EbmSelectRequest) {
    return this.selectEbmData<EbmItemClassificationResponse>(EbmEndpoint.selectItemsClass, options)
  }

  async updateImportItem(options: UpdateImportItemOption) {
    const body = this.convertImportItemClassOptionToEbmProps(options)
    return this.postEbmData<EbmDefaultResponse>(EbmEndpoint.updateImportItems, body, {
      tin: options.tin,
      bhfId: options.branchId,
    })
  }

  async saveItemComposition(options: EbmItemCompositionSave) {
    return this.postEbmData<EbmDefaultResponse>(
      EbmEndpoint.saveItemComposition,
      JSON.stringify(options),
      {
        tin: Number(options.tin),
        bhfId: options.bhfId,
      }
    )
  }

  private convertImportItemClassOptionToEbmProps(options: UpdateImportItemOption) {
    return JSON.stringify({
      taskCd: Number(options.taskCode),
      dclDe: options.declarationDate,
      itemSeq: options.itemSequence,
      hsCd: options.hsCode,
      itemClsCd: options.itemClassificationCode,
      itemCd: options.itemCode,
      imptItemSttsCd: options.importStatus,
      remark: options.remark,
      modrNm: options.modifierName || this.user?.taxPayerName,
      modrId: String(options.modifierId || this.user?.tin),
      tin: String(options.tin || this.user?.tin),
      bhfId: String(options.branchId || this.user?.branchId || '00')
    })
  }
}
