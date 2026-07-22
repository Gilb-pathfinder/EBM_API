import type { HttpContext } from '@adonisjs/core/http'

export default class CatchEbmAndAllError {
  protected catchErrors(response: HttpContext['response'], error: any, msg?: string) {
    const networkErrorCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET', 'EADDRINUSE', 'EAI_AGAIN']
    const code = error?.cause?.code || error?.code

    if (networkErrorCodes.includes(code)) {
      console.error(`[VSDC COMM ERR] ${code}: ${error.message}`)
      return response.serviceUnavailable({ 
        resultCd: '999',
        resultMsg: `VSDC Communication Failure (${code}). Receipt blocked.` 
      })
    }

    if (error.name === 'HTTPError') {
      const httpError = error as any
      console.error(`[EBM HTTP ERR] ${httpError.response.status} ${httpError.response.statusText}`)
      return response.status(httpError.response.status).send({
        resultCd: '999',
        resultMsg: 'EBM Server Error: ' + httpError.message,
        status: httpError.response.status,
      })
    }

    if (error.name === 'E_ROW_NOT_FOUND' || error.message === 'Row not found') {
      return response.notFound({ resultCd: '404', resultMsg: 'Record not found.' })
    }

    console.error('[GENERAL ERR]', error)
    return response.badRequest(msg ? { resultCd: '999', resultMsg: msg } : { resultCd: '999', resultMsg: error.message || error })
  }
}
