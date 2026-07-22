// F-56: Settings Controller for Admin

import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import {
  smtpConfigValidator,
  webhookConfigValidator,
  timezoneValidator,
  settingValidator,
} from '#validators/settings_validator'
import { SettingsService } from '#services/settings_service'

/**
 * F-56: Settings Controller
 * Manages persistent admin settings (SMTP, webhooks, timezone)
 */
export default class SettingsController {
  /**
   * F-56: Get all settings
   */
  async index({ auth, response }: HttpContext) {
    try {
      const user = auth.user as User

      // F-56: Only allow admins to view global settings
      const settings = await SettingsService.getAllSettings(null)
      const settingsMap: { [key: string]: any } = {}

      for (const [key, value] of settings) {
        // F-56: Hide sensitive values from response
        if (key.includes('password') || key.includes('api_key')) {
          settingsMap[key] = '***HIDDEN***'
        } else {
          settingsMap[key] = value
        }
      }

      return { settings: settingsMap }
    } catch (error) {
      return response.internalServerError({
        error: 'Failed to fetch settings',
        detail: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * F-56: Get specific setting
   */
  async show({ params, response }: HttpContext) {
    try {
      const { key } = params

      const value = await SettingsService.getSetting(key)

      if (value === null || value === undefined) {
        return response.notFound({
          error: `Setting "${key}" not found`,
        })
      }

      return {
        key,
        value: key.includes('password') || key.includes('api_key') ? '***HIDDEN***' : value,
      }
    } catch (error) {
      return response.internalServerError({
        error: 'Failed to fetch setting',
        detail: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * F-56: Update a setting
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const { key } = params
      const payload = await request.validateUsing(settingValidator)

      // F-56: Update the setting
      await SettingsService.setSetting(key, payload.value, {
        description: payload.description,
        isEncrypted: payload.isEncrypted,
      })

      return {
        message: `Setting "${key}" updated successfully`,
        key,
      }
    } catch (error) {
      return response.badRequest({
        error: 'Failed to update setting',
        detail: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * F-56: Get SMTP configuration
   */
  async getSmtp({ response }: HttpContext) {
    try {
      const config = await SettingsService.getSMTPConfig()

      if (!config) {
        return response.notFound({
          error: 'SMTP configuration not found',
        })
      }

      return {
        ...config,
        password: '***HIDDEN***',
      }
    } catch (error) {
      return response.internalServerError({
        error: 'Failed to fetch SMTP configuration',
        detail: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * F-56: Update SMTP configuration
   */
  async updateSmtp({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(smtpConfigValidator)

      // F-56: Get existing config to merge (don't overwrite if not provided)
      const existing = await SettingsService.getSMTPConfig()
      const config = {
        host: payload.host || existing?.host || '',
        port: payload.port || existing?.port || 587,
        secure: payload.secure !== undefined ? payload.secure : existing?.secure || false,
        username: payload.username || existing?.username || '',
        password: payload.password || existing?.password || '',
        from: payload.from || existing?.from || 'noreply@ybgroup.rw',
      }

      await SettingsService.saveSMTPConfig(config)

      return {
        message: 'SMTP configuration updated successfully',
        config: {
          ...config,
          password: '***HIDDEN***',
        },
      }
    } catch (error) {
      return response.badRequest({
        error: 'Failed to update SMTP configuration',
        detail: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * F-56: Get webhook configuration
   */
  async getWebhook({ response }: HttpContext) {
    try {
      const config = await SettingsService.getWebhookConfig()

      if (!config) {
        return {
          message: 'No webhook configuration found',
          config: {
            url: '',
            enabled: false,
            events: [],
          },
        }
      }

      return { config }
    } catch (error) {
      return response.internalServerError({
        error: 'Failed to fetch webhook configuration',
        detail: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * F-56: Update webhook configuration
   */
  async updateWebhook({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(webhookConfigValidator)

      // F-56: Get existing config to merge
      const existing = await SettingsService.getWebhookConfig()
      const config = {
        url: payload.url || existing?.url || '',
        enabled: payload.enabled !== undefined ? payload.enabled : existing?.enabled || false,
        events: payload.events || existing?.events || [],
      }

      await SettingsService.saveWebhookConfig(config)

      return {
        message: 'Webhook configuration updated successfully',
        config,
      }
    } catch (error) {
      return response.badRequest({
        error: 'Failed to update webhook configuration',
        detail: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * F-56: Get timezone setting
   */
  async getTimezone({ response }: HttpContext) {
    try {
      const timezone = await SettingsService.getTimezone()

      return { timezone }
    } catch (error) {
      return response.internalServerError({
        error: 'Failed to fetch timezone',
        detail: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  /**
   * F-56: Update timezone setting
   */
  async updateTimezone({ request, response }: HttpContext) {
    try {
      const payload = await request.validateUsing(timezoneValidator)

      await SettingsService.setTimezone(payload.timezone)

      return {
        message: 'Timezone updated successfully',
        timezone: payload.timezone,
      }
    } catch (error) {
      return response.badRequest({
        error: 'Failed to update timezone',
        detail: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
}
