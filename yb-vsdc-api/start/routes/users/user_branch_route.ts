import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const UserBranchesController = () => import('#controllers/users/user_branches_controller')

router
  .group(() => {
    router.get('/', [UserBranchesController, 'list'])

    router.get('/find', [UserBranchesController, 'find'])
    router.get('/selectBranches/:branchId', [UserBranchesController, 'selectBranches'])
    router.post('/selectBranches/:branchId', [UserBranchesController, 'selectBranches'])

    router.post('/users/save', [UserBranchesController, 'save_branch_user'])
    router.put('/users/update', [UserBranchesController, 'update_branch_user'])
    router.delete('/users/:id', [UserBranchesController, 'delete_branch_user'])
    router.get('/users/list', [UserBranchesController, 'list_branch_user'])
    router.post('/insurances/save', [UserBranchesController, 'save_branch_insurance'])
    router.get('/insurances/list', [UserBranchesController, 'list_branch_insurance'])
    
    //#region customers
    router.post('/customers/save', [UserBranchesController, 'save_branch_customer'])
    router.put('/customers/update', [UserBranchesController, 'update_branch_customer'])
    router.delete('/customers/:id', [UserBranchesController, 'delete_branch_customer'])
    router.get('/customers/list', [UserBranchesController, 'list_branch_customer'])
    router.get('/customers/search', [UserBranchesController, 'search_branch_customer'])
    router.post('/customers/sync', [UserBranchesController, 'sync_branch_customer'])

    //#endregion
  })
  .prefix('/branches')
  .middleware(middleware.auth({ guards: ['api'] }))
