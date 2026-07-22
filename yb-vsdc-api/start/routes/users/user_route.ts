import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import '#start/routes/users/user_branch_route'
import '#start/routes/users/user_auth_route'
import '#start/routes/users/user_transaction_route'
import '#start/routes/users/user_report_route'
import '#start/routes/users/user_receipt_route'
import '#start/routes/users/user_stock_route'
import '#start/routes/users/user_code_route'
import '#start/routes/users/user_item_class_route'
import '#start/routes/users/user_customer_route'
import '#start/routes/users/user_notice_route'
import '#start/routes/users/user_cash_route'
import '#start/routes/users/user_queue_route'

const UsersController = () => import('#controllers/users/users_controller')
const TaxConfigsController = () => import('#controllers/users/tax_configs_controller')
const ExchangeRatesController = () => import('#controllers/users/exchange_rates_controller')

router
  .group(() => {
    router.post('/user/init', [UsersController, 'init'])
    router.post('/user/info', [UsersController, 'info'])
    router.patch('/user/edit', [UsersController, 'edit'])
    router.get('/customers/:branchId', [UsersController, 'customer_find'])
    router.get('/items/classification/:branchId', [UsersController, 'items_classification'])

    router.post('/purchasecode', [UsersController, 'purchase_code'])
    
    router.post('/user/mrc', [UsersController, 'updateMrc'])
    router.get('/config/tax', [TaxConfigsController, 'index'])
    // PATCH moved to admin-only — operators can view rates but cannot change them

    router.get('/config/exchange-rates', [ExchangeRatesController, 'index'])
    router.get('/config/exchange-rates/today', [ExchangeRatesController, 'today'])

    router.get('/customers/lookup-by-tin', [UsersController, 'customer_lookup_by_tin']) // F-43: TIN lookup

    router.get('/receipt/verify-signature', [UsersController, 'verify_receipt_signature']) // F-54: Verify receipt signature chain

    // F-58: EBM Response code handlers
    router.get('/ebm/response-codes', [UsersController, 'ebm_response_codes']) // Get all response codes
    router.get('/ebm/response-code/:code', [UsersController, 'ebm_response_code']) // Get specific response code
  })
  .middleware(middleware.auth({ guards: ['api'] }))
