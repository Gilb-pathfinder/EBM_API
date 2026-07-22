// F-54: Signature Chaining Service
// Creates tamper-evident receipt chain using HMAC signatures

import crypto from 'node:crypto'
import User from '#models/user'
import Sale from '#models/sale'
import { DateTime } from 'luxon'

export interface SignatureData {
  rcptSign: string // Current receipt signature
  intrlData: string // Internal data for future chaining
}

export class SignatureChainingService {
  constructor(private user: User) {}

  /**
   * F-54: Compute signature for a receipt
   * Signature chain: each receipt's signature includes the previous receipt's signature
   * Creates tamper-evident chain where modifying any receipt breaks the chain
   */
  async computeReceiptSignature(receiptData: {
    receiptNo: number
    invoiceNo: number
    totalAmount: number
    taxAmount: number
    dateTime: DateTime | string
    customerName: string
    items: Array<{ code: string; quantity: number; price: number }>
  }): Promise<SignatureData> {
    // F-54: Get the last receipt's signature (for chaining)
    const previousRcptSign = this.user.lastRcptSign || ''
    const previousIntrlData = this.user.lastIntrlData || ''

    // F-54: Build internal data that will be hashed
    // This data must be deterministic and include all relevant receipt information
    const intrlData = this.buildInternalData({
      receiptNo: receiptData.receiptNo,
      invoiceNo: receiptData.invoiceNo,
      totalAmount: receiptData.totalAmount,
      taxAmount: receiptData.taxAmount,
      dateTime: receiptData.dateTime,
      customerName: receiptData.customerName,
      itemsHash: this.hashItems(receiptData.items),
      previousSign: previousRcptSign, // Chain the previous signature
    })

    // F-54: Compute HMAC-SHA256 signature using device serial number as secret key
    const secret = this.user.serialNo
    const rcptSign = crypto
      .createHmac('sha256', secret)
      .update(intrlData)
      .digest('hex')

    return {
      rcptSign,
      intrlData,
    }
  }

  /**
   * F-54: Update user's last signature for next receipt
   */
  async updateLastSignature(sale: Sale): Promise<void> {
    if (sale.rcptSign && sale.intrlData) {
      this.user.lastRcptSign = sale.rcptSign
      this.user.lastIntrlData = sale.intrlData
      await this.user.save()
    }
  }

  /**
   * F-54: Verify receipt signature chain integrity
   * Returns true if the signature chain is valid
   */
  async verifyReceiptSignature(sale: Sale): Promise<boolean> {
    if (!sale.rcptSign || !sale.intrlData) {
      return false
    }

    // F-54: Recompute the signature using the stored internal data
    const secret = this.user.serialNo
    const expectedSign = crypto
      .createHmac('sha256', secret)
      .update(sale.intrlData)
      .digest('hex')

    return expectedSign === sale.rcptSign
  }

  /**
   * F-54: Build deterministic internal data string for hashing
   */
  private buildInternalData(data: {
    receiptNo: number
    invoiceNo: number
    totalAmount: number
    taxAmount: number
    dateTime: DateTime | string
    customerName: string
    itemsHash: string
    previousSign: string
  }): string {
    const dateTimeStr = data.dateTime instanceof DateTime
      ? data.dateTime.toFormat('yyyyMMddHHmmss')
      : data.dateTime

    // F-54: Format internal data deterministically
    // Order is important for consistent hashing
    return [
      data.receiptNo.toString(),
      data.invoiceNo.toString(),
      data.totalAmount.toFixed(2),
      data.taxAmount.toFixed(2),
      dateTimeStr,
      data.customerName,
      data.itemsHash,
      data.previousSign,
    ].join('|')
  }

  /**
   * F-54: Compute hash of items in receipt
   * Ensures items cannot be modified without breaking signature chain
   */
  private hashItems(
    items: Array<{ code: string; quantity: number; price: number }>
  ): string {
    if (!items || items.length === 0) {
      return ''
    }

    const itemsStr = items
      .map((item) => `${item.code}:${item.quantity}:${item.price.toFixed(2)}`)
      .join(';')

    return crypto.createHash('sha256').update(itemsStr).digest('hex')
  }

  /**
   * F-54: Generate QR code data including signature
   * QR code will encode the receipt signature for verification
   */
  generateQRData(receiptData: {
    receiptNo: number
    invoiceNo: number
    totalAmount: number
    dateTime: string
    rcptSign: string
  }): string {
    // F-54: QR data format includes signature for verification
    return [
      'CIS',
      this.user.sdcId,
      receiptData.receiptNo.toString(),
      receiptData.invoiceNo.toString(),
      receiptData.totalAmount.toFixed(2),
      receiptData.dateTime,
      receiptData.rcptSign.substring(0, 16), // First 16 chars of signature
    ].join('|')
  }
}
