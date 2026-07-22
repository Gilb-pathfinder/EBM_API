import router from '@adonisjs/core/services/router'

const AdminController = () => import('#controllers/admins/admin_auths_controller')

router.group(() => {
  router.post('/admin/login', [AdminController, 'login'])
  
})
