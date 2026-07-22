import { test } from "@playwright/test"

test('get purchase code', async ({page}) => {

  await page.goto('https://myrratest.rra.gov.rw/main/service/indexPurchaseInitiation')
  
  await page.waitForLoadState('domcontentloaded')
  
  const getPurchaseBtn = await page.waitForSelector('[id=onlinePurchaseCode_P_D_B_update]')

  //fill inputs
  await page.locator('[name=buyerTel]').fill('0791497421')
  await page.locator('[name=buyerTin]').fill('999910260')
  await page.locator('[name=sellerTin]').fill('999909100')

  await getPurchaseBtn.click()

  //check errors
  const buyerTelError = page.getByText('* Invalid mobile number. (ex.')
  const tinError = page.getByText('* Invalid TIN. (ex.1XXXXXXXX')

  const inuptErrors = []
  if(buyerTelError &&  await buyerTelError.isVisible()) {
    inuptErrors.push(await buyerTelError.innerText())

  }
  
  if(tinError && tinError.first() && await tinError.first().isVisible()) {
    inuptErrors.push('Buyer Tin Invalid')
  }
  
  if(tinError && tinError.last() && await tinError.last().isVisible()) {
    inuptErrors.push('Seller Tin Invalid')
  }

  console.log(inuptErrors.length > 0)
  
  
  const yesBtn = await page.getByRole('button', { name: 'Yes' })
  
  await yesBtn.click()

  try {
    await page.getByText('code has been generated').waitFor({timeout: 10000})
  } catch (error) {
    const msg = `Dear Taxpayer, your TIN : 999910260 does not match with this phone no: 0791497421 Please try again`
    console.log(msg)
  }


})
