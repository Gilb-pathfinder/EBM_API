// F-56: Settings Service with Caching

import Setting from '#models/setting'
import User from '#models/user'

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  from: string
}

export interface WebhookConfig {
  url: string
  enabled: boolean
  events: string[]
}

/**
 * F-56: Settings Service
 * Manages persistent admin settings with in-memory caching
 */
export class SettingsService {
  private static cache = new Map<string, any>()
  private static cacheTimestamp = new Map<string, number>()
  private static readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * F-56: Get a setting value
   */
  static async getSetting(key: string, userId?: string | null, defaultValue?: any): Promise<any> {
    const cacheKey = this.getCacheKey(key, userId)

    // F-56: Check cache validity
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey) ?? defaultValue
    }

    try {
      const query = Setting.query().where('key', key)

      if (userId) {
        query.where('userId', userId)
      } else {
        query.whereNull('userId')
      }

      const setting = await query.first()

      if (setting) {
        const value = setting.getValue()
        this.cache.set(cacheKey, value)
        this.cacheTimestamp.set(cacheKey, Date.now())
        return value
      }
    } catch (error) {
      console.error(`Error loading setting ${key}:`, error)
    }

    return defaultValue
  }

  /**
   * F-56: Set a setting value
   */
  static async setSetting(
    key: string,
    value: any,
    options?: {
      userId?: string | null
      description?: string
      isEncrypted?: boolean
    }
  ): Promise<Setting> {
    const userId = options?.userId ?? null

    // F-56: Try to update existing setting
    let setting = await Setting.query()
      .where('key', key)
      .andWhere((q) => {
        if (userId) {
          q.where('userId', userId)
        } else {
          q.whereNull('userId')
        }
      })
      .first()

    if (!setting) {
      setting = new Setting()
      setting.key = key
      setting.userId = userId
    }

    setting.setValue(value)
    if (options?.description) {
      setting.description = options.description
    }
    if (options?.isEncrypted !== undefined) {
      setting.isEncrypted = options.isEncrypted
    }

    await setting.save()

    // F-56: Invalidate cache
    const cacheKey = this.getCacheKey(key, userId)
    this.cache.delete(cacheKey)
    this.cacheTimestamp.delete(cacheKey)

    return setting
  }

  /**
   * F-56: Get all settings for a user (or global if no userId)
   */
  static async getAllSettings(userId?: string | null): Promise<Map<string, any>> {
    const settings = new Map<string, any>()

    try {
      const query = Setting.query()

      if (userId) {
        query.where('userId', userId)
      } else {
        query.whereNull('userId')
      }

      const records = await query.exec()

      for (const record of records) {
        settings.set(record.key, record.getValue())
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }

    return settings
  }

  /**
   * F-56: Get SMTP configuration
   */
  static async getSMTPConfig(): Promise<SMTPConfig | null> {
    const host = await this.getSetting('smtp_host')
    const port = await this.getSetting('smtp_port')
    const secure = await this.getSetting('smtp_secure', null, false)
    const username = await this.getSetting('smtp_username')
    const password = await this.getSetting('smtp_password')
    const from = await this.getSetting('smtp_from')

    if (!host || !port) return null

    return {
      host,
      port: Number(port),
      secure: Boolean(secure),
      username: username || '',
      password: password || '',
      from: from || 'noreply@ybgroup.rw',
    }
  }

  /**
   * F-56: Save SMTP configuration
   */
  static async saveSMTPConfig(config: SMTPConfig): Promise<void> {
    await Promise.all([
      this.setSetting('smtp_host', config.host, { description: 'SMTP server hostname' }),
      this.setSetting('smtp_port', config.port, { description: 'SMTP server port' }),
      this.setSetting('smtp_secure', config.secure, { description: 'Use TLS/SSL' }),
      this.setSetting('smtp_username', config.username, {
        description: 'SMTP authentication username',
      }),
      this.setSetting('smtp_password', config.password, {
        description: 'SMTP authentication password',
        isEncrypted: true,
      }),
      this.setSetting('smtp_from', config.from, { description: 'From email address' }),
    ])
  }

  /**
   * F-56: Get webhook configuration
   */
  static async getWebhookConfig(): Promise<WebhookConfig | null> {
    const url = await this.getSetting('webhook_url')
    const enabled = await this.getSetting('webhook_enabled', null, false)
    const events = await this.getSetting('webhook_events', null, [])

    if (!url) return null

    return {
      url,
      enabled: Boolean(enabled),
      events: Array.isArray(events) ? events : [],
    }
  }

  /**
   * F-56: Save webhook configuration
   */
  static async saveWebhookConfig(config: WebhookConfig): Promise<void> {
    await Promise.all([
      this.setSetting('webhook_url', config.url, { description: 'Webhook URL for events' }),
      this.setSetting('webhook_enabled', config.enabled, { description: 'Enable webhooks' }),
      this.setSetting('webhook_events', config.events, {
        description: 'Events to send to webhook',
      }),
    ])
  }

  /**
   * F-56: Get timezone setting
   */
  static async getTimezone(): Promise<string> {
    return (
      (await this.getSetting('timezone')) || Intl.DateTimeFormat().resolvedOptions().timeZone
    )
  }

  /**
   * F-56: Save timezone setting
   */
  static async setTimezone(timezone: string): Promise<void> {
    await this.setSetting('timezone', timezone, { description: 'Server timezone' })
  }

  /**
   * F-56: Clear all cache
   */
  static clearCache(): void {
    this.cache.clear()
    this.cacheTimestamp.clear()
  }

  /**
   * F-56: Internal helper to get cache key
   */
  private static getCacheKey(key: string, userId?: string | null): string {
    return userId ? `${userId}:${key}` : `global:${key}`
  }

  /**
   * F-56: Check if cache entry is still valid
   */
  private static isCacheValid(cacheKey: string): boolean {
    if (!this.cache.has(cacheKey)) return false

    const timestamp = this.cacheTimestamp.get(cacheKey) || 0
    return Date.now() - timestamp < this.CACHE_TTL
  }
}
