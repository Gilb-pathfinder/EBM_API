// F-58: EBM Response Code Handler
// Maps EBM response codes to meaningful user messages and recovery actions

export enum EbmResponseAction {
  CONTINUE = 'continue', // Continue normally
  RETRY = 'retry', // Retry the operation
  QUEUE = 'queue', // Queue for later retry
  BLOCK = 'block', // Block the operation, user action required
  REINIT = 'reinit', // Reinitialize the session
  DELAY = 'delay', // Delay and retry with backoff
}

export enum EbmErrorSeverity {
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface EbmResponseCodeInfo {
  code: string
  meaning: string
  userMessage: string
  action: EbmResponseAction
  severity: EbmErrorSeverity
  recoverable: boolean
  retryable: boolean
  suggestedDelay?: number // milliseconds
}

/**
 * F-58: EBM Response Code Handler
 * Comprehensive mapping of EBM response codes to actions
 */
export class EbmResponseCodeHandler {
  // F-58: Complete mapping of EBM response codes
  private static readonly RESPONSE_CODES: { [key: string]: EbmResponseCodeInfo } = {
    // Success codes
    '000': {
      code: '000',
      meaning: 'Success',
      userMessage: 'Operation completed successfully',
      action: EbmResponseAction.CONTINUE,
      severity: EbmErrorSeverity.SUCCESS,
      recoverable: true,
      retryable: false,
    },
    '001': {
      code: '001',
      meaning: 'Success with warning',
      userMessage: 'Operation completed with warnings. Please review the details.',
      action: EbmResponseAction.CONTINUE,
      severity: EbmErrorSeverity.WARNING,
      recoverable: true,
      retryable: false,
    },

    // Validation errors — hard failures
    '800': {
      code: '800',
      meaning: 'Invalid request format',
      userMessage: 'Request format is invalid. Please check your input data.',
      action: EbmResponseAction.BLOCK,
      severity: EbmErrorSeverity.ERROR,
      recoverable: false,
      retryable: false,
    },
    '801': {
      code: '801',
      meaning: 'Invalid TIN (Tax ID)',
      userMessage: 'The provided TIN (Tax ID) is invalid. Please verify and try again.',
      action: EbmResponseAction.BLOCK,
      severity: EbmErrorSeverity.ERROR,
      recoverable: false,
      retryable: false,
    },
    '802': {
      code: '802',
      meaning: 'Invalid item code',
      userMessage: 'One or more item codes are invalid. Please check your inventory.',
      action: EbmResponseAction.BLOCK,
      severity: EbmErrorSeverity.ERROR,
      recoverable: false,
      retryable: false,
    },
    '803': {
      code: '803',
      meaning: 'Item already exists',
      userMessage: 'This item already exists in the system. Treating as update.',
      action: EbmResponseAction.CONTINUE,
      severity: EbmErrorSeverity.WARNING,
      recoverable: true,
      retryable: false,
    },
    '804': {
      code: '804',
      meaning: 'Invalid amount',
      userMessage: 'The amount is invalid. Please check the transaction details.',
      action: EbmResponseAction.BLOCK,
      severity: EbmErrorSeverity.ERROR,
      recoverable: false,
      retryable: false,
    },
    '805': {
      code: '805',
      meaning: 'Invalid customer',
      userMessage: 'The customer information is invalid. Please verify the customer details.',
      action: EbmResponseAction.BLOCK,
      severity: EbmErrorSeverity.ERROR,
      recoverable: false,
      retryable: false,
    },
    '806': {
      code: '806',
      meaning: 'Invalid date',
      userMessage: 'The date provided is invalid. Please check the date format.',
      action: EbmResponseAction.BLOCK,
      severity: EbmErrorSeverity.ERROR,
      recoverable: false,
      retryable: false,
    },
    '807': {
      code: '807',
      meaning: 'Insufficient stock',
      userMessage: 'There is insufficient stock for this item. Please check your inventory.',
      action: EbmResponseAction.BLOCK,
      severity: EbmErrorSeverity.ERROR,
      recoverable: false,
      retryable: false,
    },
    '808': {
      code: '808',
      meaning: 'Duplicate receipt number',
      userMessage: 'This receipt number has already been used. System will reassign.',
      action: EbmResponseAction.CONTINUE,
      severity: EbmErrorSeverity.WARNING,
      recoverable: true,
      retryable: false,
    },

    // Operational errors — potentially recoverable
    '880': {
      code: '880',
      meaning: 'EBM communication error',
      userMessage:
        'Unable to reach EBM device. Your transaction will be queued and sent automatically.',
      action: EbmResponseAction.QUEUE,
      severity: EbmErrorSeverity.ERROR,
      recoverable: true,
      retryable: true,
      suggestedDelay: 5000,
    },
    '881': {
      code: '881',
      meaning: 'EBM offline',
      userMessage:
        'EBM device is offline. Your transaction will be queued and synced when connection restores.',
      action: EbmResponseAction.QUEUE,
      severity: EbmErrorSeverity.ERROR,
      recoverable: true,
      retryable: true,
      suggestedDelay: 10000,
    },
    '882': {
      code: '882',
      meaning: 'EBM device error',
      userMessage:
        'The EBM device encountered an error. Please contact support if the issue persists.',
      action: EbmResponseAction.BLOCK,
      severity: EbmErrorSeverity.CRITICAL,
      recoverable: false,
      retryable: false,
    },
    '883': {
      code: '883',
      meaning: 'Session expired',
      userMessage: 'Your session with EBM has expired. Reinitializing...',
      action: EbmResponseAction.REINIT,
      severity: EbmErrorSeverity.ERROR,
      recoverable: true,
      retryable: true,
      suggestedDelay: 2000,
    },
    '884': {
      code: '884',
      meaning: 'Rate limit exceeded',
      userMessage:
        'Too many requests to EBM. Request has been queued and will be sent shortly.',
      action: EbmResponseAction.QUEUE,
      severity: EbmErrorSeverity.WARNING,
      recoverable: true,
      retryable: true,
      suggestedDelay: 30000,
    },
    '885': {
      code: '885',
      meaning: 'Device not initialized',
      userMessage:
        'The device has not been properly initialized. Please run device setup first.',
      action: EbmResponseAction.REINIT,
      severity: EbmErrorSeverity.CRITICAL,
      recoverable: true,
      retryable: false,
    },
    '886': {
      code: '886',
      meaning: 'Duplicate record',
      userMessage: 'This record has already been processed. Treating as successful.',
      action: EbmResponseAction.CONTINUE,
      severity: EbmErrorSeverity.WARNING,
      recoverable: true,
      retryable: false,
    },
    '887': {
      code: '887',
      meaning: 'Invalid authentication',
      userMessage:
        'Authentication with EBM failed. Please re-authenticate and try again.',
      action: EbmResponseAction.REINIT,
      severity: EbmErrorSeverity.CRITICAL,
      recoverable: true,
      retryable: false,
    },
    '888': {
      code: '888',
      meaning: 'Storage full',
      userMessage: 'Device storage is full. Please contact support.',
      action: EbmResponseAction.BLOCK,
      severity: EbmErrorSeverity.CRITICAL,
      recoverable: false,
      retryable: false,
    },
    '889': {
      code: '889',
      meaning: 'Invalid configuration',
      userMessage: 'Device configuration is invalid. Please reconfigure the device.',
      action: EbmResponseAction.REINIT,
      severity: EbmErrorSeverity.CRITICAL,
      recoverable: true,
      retryable: false,
    },

    // Business logic errors
    '900': {
      code: '900',
      meaning: 'Invalid transaction type',
      userMessage: 'The transaction type is not supported. Please check your request.',
      action: EbmResponseAction.BLOCK,
      severity: EbmErrorSeverity.ERROR,
      recoverable: false,
      retryable: false,
    },
    '901': {
      code: '901',
      meaning: 'Invalid tax category',
      userMessage:
        'The tax category is invalid. Please verify the item tax classification.',
      action: EbmResponseAction.BLOCK,
      severity: EbmErrorSeverity.ERROR,
      recoverable: false,
      retryable: false,
    },
    '902': {
      code: '902',
      meaning: 'Cannot process refund',
      userMessage:
        'This refund cannot be processed. Please check if the original receipt is valid.',
      action: EbmResponseAction.BLOCK,
      severity: EbmErrorSeverity.ERROR,
      recoverable: false,
      retryable: false,
    },
    '903': {
      code: '903',
      meaning: 'Refund limit exceeded',
      userMessage: 'The refund amount exceeds the allowed limit.',
      action: EbmResponseAction.BLOCK,
      severity: EbmErrorSeverity.ERROR,
      recoverable: false,
      retryable: false,
    },
  }

  /**
   * F-58: Get response code information
   */
  static getCodeInfo(code: string): EbmResponseCodeInfo {
    // F-58: Return specific code info if exists, otherwise generic error
    return (
      this.RESPONSE_CODES[code] || {
        code,
        meaning: 'Unknown response code',
        userMessage: `An unexpected response was received from EBM: ${code}. Please contact support.`,
        action: EbmResponseAction.BLOCK,
        severity: EbmErrorSeverity.ERROR,
        recoverable: false,
        retryable: false,
      }
    )
  }

  /**
   * F-58: Check if error is recoverable
   */
  static isRecoverable(code: string): boolean {
    const info = this.getCodeInfo(code)
    return info.recoverable
  }

  /**
   * F-58: Check if error should be retried
   */
  static isRetryable(code: string): boolean {
    const info = this.getCodeInfo(code)
    return info.retryable
  }

  /**
   * F-58: Get suggested action for error code
   */
  static getAction(code: string): EbmResponseAction {
    return this.getCodeInfo(code).action
  }

  /**
   * F-58: Get user-friendly message for error code
   */
  static getUserMessage(code: string): string {
    return this.getCodeInfo(code).userMessage
  }

  /**
   * F-58: Get severity level
   */
  static getSeverity(code: string): EbmErrorSeverity {
    return this.getCodeInfo(code).severity
  }

  /**
   * F-58: Get suggested retry delay in milliseconds
   */
  static getSuggestedDelay(code: string): number {
    const info = this.getCodeInfo(code)
    return info.suggestedDelay || 5000 // Default 5 seconds
  }

  /**
   * F-58: Format error response for user
   */
  static formatErrorResponse(code: string, additionalInfo?: string) {
    const info = this.getCodeInfo(code)

    return {
      code,
      severity: info.severity,
      userMessage: info.userMessage,
      action: info.action,
      meaning: info.meaning,
      recoverable: info.recoverable,
      retryable: info.retryable,
      ...(additionalInfo && { details: additionalInfo }),
    }
  }

  /**
   * F-58: Get all available response codes
   */
  static getAllCodes(): EbmResponseCodeInfo[] {
    return Object.values(this.RESPONSE_CODES)
  }
}
