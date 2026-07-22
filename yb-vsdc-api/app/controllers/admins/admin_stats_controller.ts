import Branch from '#models/branch'
import ClassificationCode from '#models/classification_code'
import TaxConfig from '#models/tax_config'
import User from '#models/user'
import CatchEbmAndAllError from '#helpers/classes/catch_ebm_and_all_error'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class AdminStatsController extends CatchEbmAndAllError {
  async index({ response }: HttpContext) {
    try {
      const [
        totalUsers,
        initializedUsers,
        trainingUsers,
        totalBranches,
        hqBranches,
        totalTax,
        activeTax,
        totalClassifications,
        recentUsers,
      ] = await Promise.all([
        User.query().count('* as total').first(),
        User.query().whereNotNull('sdc_id').count('* as total').first(),
        User.query().where('is_training_mode', true).count('* as total').first(),
        Branch.query().count('* as total').first(),
        Branch.query().where('is_headquarter', 'Y').count('* as total').first(),
        TaxConfig.query().count('* as total').first(),
        TaxConfig.query().where('is_active', true).count('* as total').first(),
        ClassificationCode.query().count('* as total').first(),
        User.query()
          .select(['id', 'email', 'full_name', 'tin', 'sdc_id', 'branch_name', 'created_at'])
          .orderBy('created_at', 'desc')
          .limit(5),
      ])

      const n = (row: any) => Number(row?.$extras?.total ?? row?.total ?? 0)

      return {
        users: {
          total:       n(totalUsers),
          initialized: n(initializedUsers),
          pending:     n(totalUsers) - n(initializedUsers),
          training:    n(trainingUsers),
        },
        branches: {
          total: n(totalBranches),
          hq:    n(hqBranches),
          sub:   n(totalBranches) - n(hqBranches),
        },
        tax: {
          total:  n(totalTax),
          active: n(activeTax),
        },
        classifications: {
          total: n(totalClassifications),
        },
        recentUsers,
      }
    } catch (error) {
      return this.catchErrors(response, error)
    }
  }
}
