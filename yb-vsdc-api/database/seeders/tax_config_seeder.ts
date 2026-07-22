import TaxConfig from '#models/tax_config'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

const DEFAULT_RATES = [
  { taxType: 'A', rate: 0,  divider: 1,      isActive: true },  // Exempt
  { taxType: 'B', rate: 18, divider: 1.18,   isActive: true },  // Standard VAT 18%
  { taxType: 'C', rate: 0,  divider: 1,      isActive: true },  // Zero-rated
  { taxType: 'D', rate: 0,  divider: 1,      isActive: true },  // Non-VAT
]

export default class extends BaseSeeder {
  async run() {
    for (const row of DEFAULT_RATES) {
      await TaxConfig.updateOrCreate({ taxType: row.taxType }, row)
    }
    console.log('Tax configs seeded: A, B, C, D')
  }
}
