import env from '#start/env'
import router from '@adonisjs/core/services/router'
import ky from 'ky'

const UserAuthsController = () => import('#controllers/users/user_auths_controller')

router.group(() => {
  router.post('/user/login', [UserAuthsController, 'login'])

})

// Public health check — no auth required
router.get('/health/vsdc', async () => {
  const probeUrl = `${env.get('EBM_BASE_URL')}initializer/selectInitInfo`
  try {
    const res = await ky.get(probeUrl, { timeout: 5000, retry: 0, throwHttpErrors: false })
    // 404 = Tomcat is up but WAR is not deployed at this path
    return { online: res.status !== 404 }
  } catch (error: any) {
    // ECONNREFUSED / ENOTFOUND = Tomcat is not running at all
    return { online: false }
  }
})
