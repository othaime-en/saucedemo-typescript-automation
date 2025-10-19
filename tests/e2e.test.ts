import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';

import WebDriverManager from '../src/utils/WebDriverManager.js';
import TestDataReader from '../src/utils/TestDataReader.js';
import ScreenshotUtils from '../src/utils/ScreenshotUtils.js';
import LoginPage from '../src/pages/LoginPage.js';
import ProductsPage from '../src/pages/ProductsPage.js';
import CartPage from '../src/pages/CartPage.js';

describe('End-to-End Tests', function() {
  this.timeout(120000);
  
  let driver: WebDriver;
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;

  before(async function() {
    console.log('Starting E2E test suite');
    driver = await WebDriverManager.createDriver();
    loginPage = new LoginPage(driver);
    productsPage = new ProductsPage(driver);
    cartPage = new CartPage(driver);
  });

  after(async function() {
    await WebDriverManager.quitDriver();
    console.log('E2E test suite completed');
  });

  it('should complete full user journey from login to order', async function() {
    const user = await TestDataReader.getStandardUser();
    const checkoutData = (await TestDataReader.getValidCheckoutData())[0];
    
    await loginPage.open();
    await ScreenshotUtils.captureStep(driver, 'e2e-full-journey', '01-login-page');
    
    await loginPage.login(user.username, user.password);
    await ScreenshotUtils.captureStep(driver, 'e2e-full-journey', '02-after-login');
    
    const isOnProducts = await productsPage.isOnProductsPage();
    expect(isOnProducts).to.be.true;
    
    await productsPage.addProductToCartByName('Sauce Labs Backpack');
    await ScreenshotUtils.captureStep(driver, 'e2e-full-journey', '03-product-added');
    
    const cartCount = await productsPage.getCartItemCount();
    expect(cartCount).to.equal(1);
    
    await productsPage.goToCart();
    await ScreenshotUtils.captureStep(driver, 'e2e-full-journey', '04-cart-page');
    
    const items = await cartPage.getCartItems();
    expect(items).to.have.lengthOf(1);
    
    await cartPage.proceedToCheckout();
    await ScreenshotUtils.captureStep(driver, 'e2e-full-journey', '05-checkout-info');
    
    await cartPage.fillCheckoutInformation(checkoutData);
    await cartPage.continueToReview();
    await ScreenshotUtils.captureStep(driver, 'e2e-full-journey', '06-order-review');
    
    const summary = await cartPage.getOrderSummary();
    expect(summary.subtotal).to.be.greaterThan(0);
    expect(summary.tax).to.be.greaterThan(0);
    expect(summary.total).to.equal(summary.subtotal + summary.tax);
    
    await cartPage.finishOrder();
    await ScreenshotUtils.captureStep(driver, 'e2e-full-journey', '07-order-complete');
    
    const isComplete = await cartPage.isOrderComplete();
    expect(isComplete).to.be.true;
  });
});