import { Exception } from '@adonisjs/core/exceptions'

export default class EbmServiceErrorException extends Exception {
  static status = 500
}