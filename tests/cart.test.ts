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
    itemCount = await cartPage.getCartItemCount();
    expect(itemCount).to.equal(0);
  });

  it('should calculate correct subtotal', async function() {
    const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light'];
    await productsPage.addMultipleProductsToCart(products);
    await productsPage.goToCart();
   
    const expectedSubtotal = await cartPage.calculateExpectedSubtotal();
    expect(expectedSubtotal).to.be.greaterThan(0);
  });

  it('should verify empty cart state', async function() {
    await productsPage.goToCart();
   
    const isEmpty = await cartPage.isCartEmpty();
    expect(isEmpty).to.be.true;
  });
});