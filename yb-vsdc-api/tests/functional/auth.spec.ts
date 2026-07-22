import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import Admin from '#models/admin'
import User from '#models/user'

const ADMIN_EMAIL = 'admin@test.com'
const ADMIN_PASSWORD = 'admin'
const USER_EMAIL = 'operator@test.com'
const USER_PASSWORD = 'admin'

const userDefaults = {
  fullName: 'Test Operator',
  serialNo: 'DEV-TEST-001',
  mrc: 'MRC-TEST-001',
  taxPayerName: 'Test Operator Business',
  tin: 999909100,
  phoneNumber: '0780000000',
  province: 'Kigali',
  district: 'Gasabo',
  sector: 'Kacyiru',
  address: 'Test Street',
  lastItemCode: '000000',
  branchId: '00',
  branchName: 'Head Office',
  initLastReqDt: '20180101000000',
  itemLastReqDt: '20180101000000',
  importLastReqDt: '20180101000000',
  purchaseLastReqDt: '20180101000000',
  classificationItemLastReqDt: '20180101000000',
  branchLastReqDt: '20180101000000',
  noticesLastReqDt: '20180101000000',
  stockLastReqDt: '20180101000000',
  deviceId: 'DEV-TEST-001',
  ebmApiVersion: '1.0',
  cisApiVersion: '1.0',
  businessActivity: 'Retail',
  branchOpenDate: '20240101000000',
  managerName: 'Manager Test',
  managerTel: '0780000001',
  managerEmail: 'manager@test.com',
  headquarterYn: 'Y',
  createdAt: DateTime.now().toJSDate(),
  updatedAt: DateTime.now().toJSDate(),
}

test.group('Auth and guard routes', (group) => {
  group.setup(async () => {
    await Admin.updateOrCreate({ email: ADMIN_EMAIL }, {
      fullName: 'Admin User',
      password: ADMIN_PASSWORD,
      tin: 999909100,
      serialNo: 'ADMIN-DEV-001',
      branchId: '00',
      classificationLastReqDt: '20180101000000',
    })

    await User.updateOrCreate({ email: USER_EMAIL }, {
      password: USER_PASSWORD,
      ...userDefaults,
    })
  })

  test('admin login returns a valid token', async ({ client, assert }) => {
    const response = await client
      .post('/admin/login')
      .json({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })

    response.assertStatus(200)
    assert.isString(response.body().value)
    assert.equal(response.body().msg, 'Login Successfully')
  })

  test('user login returns a valid token and info endpoint works', async ({ client, assert }) => {
    const loginResponse = await client
      .post('/user/login')
      .json({ email: USER_EMAIL, password: USER_PASSWORD })

    loginResponse.assertStatus(200)
    assert.isString(loginResponse.body().value)

    const token = loginResponse.body().value
    const infoResponse = await client
      .post('/user/info')
      .header('Authorization', `Bearer ${token}`)

    infoResponse.assertStatus(200)
    assert.equal(infoResponse.body().email, USER_EMAIL)
    assert.equal(infoResponse.body().taxPayerName, userDefaults.taxPayerName)
  })

  test('admin token cannot access operator-only route /user/info', async ({ client }) => {
    const loginResponse = await client
      .post('/admin/login')
      .json({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })

    loginResponse.assertStatus(200)
    const token = loginResponse.body().value

    const response = await client
      .post('/user/info')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(401)
  })

  test('user token cannot access admin-only route /admin/settings', async ({ client }) => {
    const loginResponse = await client
      .post('/user/login')
      .json({ email: USER_EMAIL, password: USER_PASSWORD })

    loginResponse.assertStatus(200)
    const token = loginResponse.body().value

    const response = await client
      .get('/admin/settings')
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(401)
  })
})
