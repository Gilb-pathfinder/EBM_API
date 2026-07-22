// F-56: Settings Validators

import vine from '@vinejs/vine'

/**
 * F-56: Validator for SMTP configuration
 */
export const smtpConfigValidator = vine.compile(
  vine.object({
    host: vine.string().minLength(3),
    port: vine.number().range([1, 65535]),
    secure: vine.boolean().optional(),
    username: vine.string().optional(),
    password: vine.string().optional(),
    from: vine.string().email().optional(),
  })
)

/**
 * F-56: Validator for webhook configuration
 */
export const webhookConfigValidator = vine.compile(
  vine.object({
    url: vine.string().url().optional(),
    enabled: vine.boolean().optional(),
    events: vine.array(vine.string()).optional(),
  })
)

/**
 * F-56: Validator for timezone setting
 */
export const timezoneValidator = vine.compile(
  vine.object({
    timezone: vine.string().minLength(3),
  })
)

/**
 * F-56: Validator for generic setting update
 */
export const settingValidator = vine.compile(
  vine.object({
    key: vine.string().minLength(1),
    value: vine.any(),
    description: vine.string().optional(),
    isEncrypted: vine.boolean().optional(),
  })
)
