import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UserTranscationsController = () => import('#controllers/users/user_transcations_controller')

router
  .group(() => {
    //#region transactions
    router.get('/:branchId', [UserTranscationsController, 'select'])

    //#endregion
    //sales
    router.post('/sale', [UserTranscationsController, 'sale_save'])
    router.get('/sale/list', [UserTranscationsController, 'sale_list'])
    router.get('/sale/find', [UserTranscationsController, 'sale_list_find'])

    //refunds
    router.post('/refund', [UserTranscationsController, 'refund_save'])

    //copy
    router.post('/copy', [UserTranscationsController, 'copy_save'])

    //training
    router.post('/training', [UserTranscationsController, 'training_save'])

    //proforma
    router.post('/proforma', [UserTranscationsController, 'proforma_save'])

    //#region purchases
    router.get('/purchase/list', [UserTranscationsController, 'purchase_list'])
    router.post('/purchase/save', [UserTranscationsController, 'purchase_save'])
    //#endregion


    //#region imports item
    router.post('/items/import/approve', [UserTranscationsController, 'import_items_approve'])
    router.post('/items/import/cancel', [UserTranscationsController, 'import_items_cancel'])

    router
      .get('/items/import/list', [UserTranscationsController, 'import_items_list'])

    router.get('/items/import/select/:branchId', [UserTranscationsController, 'import_select'])

    //#endregion

    //#region utility
    router.post('/training-mode/toggle', [UserTranscationsController, 'training_mode_toggle'])
    router.get('/counters', [UserTranscationsController, 'receipt_counters'])
    router.get('/sale/:id/lock-check', [UserTranscationsController, 'sale_lock_check'])
    // Art. 7.28 — Power failure / paper jam recovery: returns last EBM-approved receipt
    router.get('/last-receipt', [UserTranscationsController, 'last_receipt'])
    // Reconnect to EBM after offline period — updates ebmLastOnlineAt to lift the 24h block
    router.post('/ebm-reconnect', [UserTranscationsController, 'ebm_reconnect'])
    //#endregion
  })
  .prefix('/transactions')
  .middleware(middleware.auth({ guards: ['api'] }))
