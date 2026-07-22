import ClassificationCodeAction from '#actions/classification_code_action'
import CatchEbmAndAllError from '#helpers/classes/catch_ebm_and_all_error'
import Admin from '#models/admin'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class ClassificationCodesController extends CatchEbmAndAllError {
  async sync({ response, auth }: HttpContext) {
    try {
      const caller = auth.user as Admin | User
      return await ClassificationCodeAction.sync(caller)
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }
}