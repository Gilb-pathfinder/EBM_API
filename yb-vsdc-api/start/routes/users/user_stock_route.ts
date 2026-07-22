import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import '#start/routes/users/user_branch_route'
import '#start/routes/users/user_auth_route'
import '#start/routes/users/user_transaction_route'
import '#start/routes/users/user_report_route'
import '#start/routes/users/user_receipt_route'

const UserStocksController = () => import('#controllers/users/user_stock_controller')

router
  .group(() => {
    //#region items
    router.post('/item/save', [UserStocksController, 'items_save'])

    router.get('/item/list', [UserStocksController, 'items_list'])

    router.get('/item/find/:id', [UserStocksController, 'items_find'])

    router.get('/item/search', [UserStocksController, 'items_search'])

    router.put('/item/update', [UserStocksController, 'items_update'])

    router.delete('/item/:code', [UserStocksController, 'items_delete'])
    
    router.get('/item/:code/compositions', [UserStocksController, 'items_composition_list'])
    router.post('/item/composition/save', [UserStocksController, 'items_composition_save'])

    // F-11 §5.2 — Pull items from EBM (delta sync via itemLastReqDt)
    router.post('/item/sync', [UserStocksController, 'items_sync'])
    //#endregion

    //#region stocks
    router.get('/master/list', [UserStocksController, 'stocks_master_list'])
    router.get('/list', [UserStocksController, 'stocks_list'])

    router.post('/save', [UserStocksController, 'stocks_save'])

    router.post('/save_with_items', [UserStocksController, 'stocks_save_with_items'])

    router.post('/master/save', [UserStocksController, 'stocks_master_save'])

    router.get('/sync', [UserStocksController, 'stocks_sync'])
    router.post('/transfer', [UserStocksController, 'stocks_transfer'])
    //#endregion
  })
  .prefix('/stocks')
  .middleware(middleware.auth({ guards: ['api'] }))
