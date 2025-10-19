import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import WebDriverManager from '../src/utils/WebDriverManager.js';
import TestDataReader from '../src/utils/TestDataReader.js';
import LoginPage from '../src/pages/LoginPage.js';
import ProductsPage from '../src/pages/ProductsPage.js';
import CartPage from '../src/pages/CartPage.js';

describe('Cart Tests', function() {
  this.timeout(60000);
 
  let driver: WebDriver;
  let loginPage: LoginPage;
  let productsPage: ProductsPage;
  let cartPage: CartPage;

  before(async function() {
    console.log('Starting cart test suite');
    driver = await WebDriverManager.createDriver();
    loginPage = new LoginPage(driver);
    productsPage = new ProductsPage(driver);
    cartPage = new CartPage(driver);
   
    const user = await TestDataReader.getStandardUser();
    await loginPage.open();
    await loginPage.login(user.username, user.password);
  });

  after(async function() {
    await WebDriverManager.quitDriver();
    console.log('Cart test suite completed');
  });

  beforeEach(async function() {
    await loginPage.open();
    await loginPage.login((await TestDataReader.getStandardUser()).username, 'secret_sauce');
    await productsPage.resetAppState();
  });

  it('should display items in cart', async function() {
    await productsPage.addProductToCartByName('Sauce Labs Backpack');
    await productsPage.goToCart();
   
    const items = await cartPage.getCartItems();
    expect(items).to.have.lengthOf(1);
    expect(items[0].name).to.equal('Sauce Labs Backpack');
  });

  it('should remove item from cart', async function() {
    await productsPage.addProductToCartByName('Sauce Labs Backpack');
    await productsPage.goToCart();
   
    let itemCount = await cartPage.getCartItemCount();
    expect(itemCount).to.equal(1);
   
    await cartPage.removeItemFromCart('Sauce Labs Backpack');
    const isEmpty = await cartPage.isCartEmpty();
    expect(isEmpty).to.be.true;
  });

  it('should calculate correct subtotal', async function() {
    const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];
    await productsPage.addMultipleProductsToCart(products);
    await productsPage.goToCart();
   
    const expectedSubtotal = await cartPage.calculateExpectedSubtotal();
    expect(expectedSubtotal).to.be.greaterThan(0);
  });

  it('should proceed to checkout successfully', async function() {
    await productsPage.addProductToCartByName('Sauce Labs Backpack');
    await productsPage.goToCart();
    await cartPage.proceedToCheckout();
   
    const url = await driver.getCurrentUrl();
    expect(url).to.include('checkout-step-one');
  });

  it('should complete checkout with valid data', async function() {
    const checkoutData = (await TestDataReader.getValidCheckoutData())[0];
   
    await productsPage.addProductToCartByName('Sauce Labs Backpack');
    await productsPage.goToCart();
    await cartPage.completeCheckout(checkoutData);
   
    const isComplete = await cartPage.isOrderComplete();
    expect(isComplete).to.be.true;
   
    const completionMessage = await cartPage.getCompletionMessage();
    expect(completionMessage).to.include('Thank you');
  });

  it('should test data-driven checkout scenarios', async function() {
    const scenarios = await TestDataReader.getShoppingScenarios();
   
    for (const scenario of scenarios) {
      await loginPage.open();
      await loginPage.login((await TestDataReader.getStandardUser()).username, 'secret_sauce');
     
      await productsPage.addMultipleProductsToCart(scenario.products);
      await productsPage.goToCart();
     
      const actualSubtotal = await cartPage.calculateExpectedSubtotal();
      expect(Math.abs(actualSubtotal - scenario.expectedSubtotal)).to.be.lessThan(0.01);
     
      await cartPage.completeCheckout(scenario.checkoutInfo);
     
      const isComplete = await cartPage.isOrderComplete();
      expect(isComplete).to.be.true;
    }
  });

  it('should verify order summary calculations', async function() {
    await productsPage.addMultipleProductsToCart(['Sauce Labs Backpack', 'Sauce Labs Bike Light']);
    await productsPage.goToCart();
   
    const checkoutData = (await TestDataReader.getValidCheckoutData())[0];
    await cartPage.proceedToCheckout();
    await cartPage.fillCheckoutInformation(checkoutData);
    await cartPage.continueToReview();
   
    const summary = await cartPage.getOrderSummary();
    expect(summary.subtotal).to.be.greaterThan(0);
    expect(summary.tax).to.be.greaterThan(0);
    expect(summary.total).to.equal(summary.subtotal + summary.tax);
  });

  it('should verify cart item details', async function() {
    await productsPage.addProductToCartByName('Sauce Labs Backpack');
    await productsPage.goToCart();
   
    const items = await cartPage.getCartItems();
    expect(items[0]).to.have.property('name');
    expect(items[0]).to.have.property('description');
    expect(items[0]).to.have.property('price');
    expect(items[0]).to.have.property('quantity');
    expect(items[0].quantity).to.equal(1);
  });

  it('should continue shopping from cart', async function() {
    await productsPage.addProductToCartByName('Sauce Labs Backpack');
    await productsPage.goToCart();
    await cartPage.continueShopping();
   
    const isOnProducts = await productsPage.isOnProductsPage();
    expect(isOnProducts).to.be.true;
  });

  it('should verify empty cart state', async function() {
    await productsPage.goToCart();
   
    const isEmpty = await cartPage.isCartEmpty();
    expect(isEmpty).to.be.true;
  });

  it('should handle multiple items with different prices', async function() {
    const products = ['Sauce Labs Fleece Jacket', 'Sauce Labs Onesie', 'Sauce Labs Bolt T-Shirt'];
    await productsPage.addMultipleProductsToCart(products);
    await productsPage.goToCart();
   
    const items = await cartPage.getCartItems();
    expect(items).to.have.lengthOf(3);
   
    const uniquePrices = new Set(items.map(item => item.price));
    expect(uniquePrices.size).to.be.greaterThan(1);
  });

  it('should verify checkout button is displayed', async function() {
    await productsPage.addProductToCartByName('Sauce Labs Backpack');
    await productsPage.goToCart();
   
    const checkoutDisplayed = await cartPage.isCheckoutButtonDisplayed();
    expect(checkoutDisplayed).to.be.true;
  });

  it('should complete full shopping workflow', async function() {
    const checkoutData = (await TestDataReader.getValidCheckoutData())[0];
    const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];
   
    await productsPage.addMultipleProductsToCart(products);
    const cartCount = await productsPage.getCartItemCount();
    expect(cartCount).to.equal(2);
   
    await productsPage.goToCart();
    const isOnCart = await cartPage.isOnCartPage();
    expect(isOnCart).to.be.true;
   
    await cartPage.proceedToCheckout();
    await cartPage.fillCheckoutInformation(checkoutData);
    await cartPage.continueToReview();
   
    const calculationsCorrect = await cartPage.verifyOrderCalculations();
    expect(calculationsCorrect).to.be.true;
   
    await cartPage.finishOrder();
    const isComplete = await cartPage.isOrderComplete();
    expect(isComplete).to.be.true;
  });
});