/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test', 'sandbox'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']),

  /*
  |----------------------------------------------------------
  | Variables for configuring database connection
  |----------------------------------------------------------
  */
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),

  /*
 |----------------------------------------------------------
 | Variables for configuring of App
 |----------------------------------------------------------
 */
  BASE_URL: Env.schema.string({ format: 'url' }),
  APP_PHONE_NUMBER: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring of ADMIN USER
  |----------------------------------------------------------
  */
  ADMIN_EMAIL: Env.schema.string({ format: 'email' }),
  ADMIN_PASSWORD: Env.schema.string(),
  ADMIN_FULL_NAME: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring of EBM
  |----------------------------------------------------------
  */
  EBM_SANDBOX_TIN: Env.schema.number(),
  EBM_SANDBOX_BHF_ID: Env.schema.string(),
  EBM_SANDBOX_MRC: Env.schema.string(),
  EBM_SANDBOX_SRL_NO: Env.schema.string(),
  EBM_BASE_URL: Env.schema.string(),

  EBM_TAX_RATE_A: Env.schema.number(),
  EBM_TAX_RATE_B: Env.schema.number(),
  EBM_TAX_RATE_C: Env.schema.number(),
  EBM_TAX_RATE_D: Env.schema.number(),

  EBM_TAX_DIVIDER_A: Env.schema.number(),
  EBM_TAX_DIVIDER_B: Env.schema.number(),
  EBM_TAX_DIVIDER_C: Env.schema.number(),
  EBM_TAX_DIVIDER_D: Env.schema.number(),

  EBM_API_VERSION: Env.schema.string(),
  EBM_CIS_VERSION: Env.schema.string(),
  EBM_CIS_NAME: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Variables for configuring the drive package
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['fs', 'r2'] as const),
  R2_KEY: Env.schema.string(),
  R2_SECRET: Env.schema.string(),
  R2_BUCKET: Env.schema.string(),
  R2_ENDPOINT: Env.schema.string(),

  /*
 |----------------------------------------------------------
 | Variables for my rra purchase code
 |----------------------------------------------------------
 */
  MY_RRA_PURCHASE_CODE_DEV: Env.schema.string({ format: 'url' }),
  MY_RRA_PURCHASE_CODE: Env.schema.string({ format: 'url' }),

  /*
 |----------------------------------------------------------
 | Variables for browserless
 |----------------------------------------------------------
 */

  ADMIN_TIN: Env.schema.number(),
  ADMIN_SERIAL_NO: Env.schema.string(),

  MEILISEARCH_HOST: Env.schema.string(),
  MEILISEARCH_API_KEY: Env.schema.string()
})
