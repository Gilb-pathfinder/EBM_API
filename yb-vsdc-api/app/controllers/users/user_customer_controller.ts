import { EbmCustomerService } from '#services/ebm/ebm_customer_service'
import { EbmApiResponseCode } from '#types/ebm/ebm_type'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserCustomerController {
  async selectCustomer({ response, auth, request }: HttpContext) {
    try {
      const usr = auth.user as User
      const customerTin = request.input('customerTin') || request.input('custmTin')
      const branchId = request.param('branchId') || usr.branchId || '00'

      if (!customerTin) {
        return response.badRequest({
          error: 'Customer TIN is required',
          paramName: 'customerTin or custmTin'
        })
      }

      const res = await new EbmCustomerService().selectCustumer({
        tin: usr.tin,
        branchId,
        customerTin: Number(customerTin),
      })

      return res
    } catch (error) {
      console.error(error)
      return response.status(500).json({
        error: 'Failed to fetch customer information',
        detail: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  async lookupByTin({ response, auth, request }: HttpContext) {
    try {
      const tin = request.input('tin')
      const { isValidTinFormat } = await import('#helpers/tin_helper')

      if (!tin) {
        return response.badRequest({ error: 'TIN is required' })
      }

      if (!isValidTinFormat(tin)) {
        return response.badRequest({
          error: 'Invalid TIN format. RRA TINs must be 15 digits.',
          format: 'XXXXXXXXXXXXXXX (15 digits)',
        })
      }

      const user = auth.user as User

      try {
        const result = await new EbmCustomerService().selectCustumer({
          tin: user.tin,
          branchId: user.branchId || '00',
          customerTin: Number(tin),
        })

        if (result?.data?.custList && result.data.custList.length > 0) {
          const customer = result.data.custList[0]
          return {
            found: true,
            tin,
            name: customer.taxprNm,
            status: customer.taxprSttsCd,
            location: `${customer.dstrtNm}, ${customer.prvncNm}`,
            detail: {
              tin: customer.tin,
              name: customer.taxprNm,
              status: customer.taxprSttsCd,
              province: customer.prvncNm,
              district: customer.dstrtNm,
              sector: customer.sctrNm,
              address: customer.locDesc,
            }
          }
        }
      } catch (ebmError) {
        // EBM lookup failed, return not found
        console.debug('EBM lookup failed:', ebmError)
      }

      return {
        found: false,
        tin,
        message: 'Customer not found in RRA database.',
      }
    } catch (error) {
      return response.badRequest({
        error: 'TIN lookup failed',
        detail: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
