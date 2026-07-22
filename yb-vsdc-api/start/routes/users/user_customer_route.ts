import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UserCustomerController = () => import('#controllers/users/user_customer_controller')

router
  .group(() => {
    router.get('/selectCustomer/:branchId', [UserCustomerController, 'selectCustomer'])
    router.post('/selectCustomer/:branchId', [UserCustomerController, 'selectCustomer'])
  })
  .prefix('/customers')
  .middleware(middleware.auth({ guards: ['api'] }))
