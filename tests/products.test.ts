import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';

import WebDriverManager from '../src/utils/WebDriverManager.js';
import TestDataReader from '../src/utils/TestDataReader.js';
import LoginPage from '../src/pages/LoginPage.js';
import ProductsPage from '../src/pages/ProductsPage.js';

describe('Products Tests', function() {
  this.timeout(60000);
  
  let driver: WebDriver;
  let loginPage: LoginPage;
  let productsPage: ProductsPage;

  before(async function() {
    console.log('Starting products test suite');
    driver = await WebDriverManager.createDriver();
    loginPage = new LoginPage(driver);
    productsPage = new ProductsPage(driver);
    
    const user = await TestDataReader.getStandardUser();
    await loginPage.open();
    await loginPage.login(user.username, user.password);
  });

  after(async function() {
    await WebDriverManager.quitDriver();
    console.log('Products test suite completed');
  });

  it('should display all products on products page', async function() {
    const productCount = await productsPage.getProductCount();
    expect(productCount).to.be.greaterThan(0);
    
    const products = await productsPage.getAllProducts();
    expect(products).to.have.lengthOf(6);
  });

  it('should add single product to cart', async function() {
    const productName = 'Sauce Labs Backpack';
    await productsPage.addProductToCartByName(productName);
    
    const cartCount = await productsPage.getCartItemCount();
    expect(cartCount).to.equal(1);
    
    const isInCart = await productsPage.isProductInCart(productName);
    expect(isInCart).to.be.true;
  });

  it('should remove product from cart', async function() {
    await productsPage.resetAppState();
    const productName = 'Sauce Labs Backpack';
    
    await productsPage.addProductToCartByName(productName);
    let cartCount = await productsPage.getCartItemCount();
    expect(cartCount).to.be.greaterThan(0);
    
    await productsPage.removeProductFromCartByName(productName);
    cartCount = await productsPage.getCartItemCount();
    
    const isInCart = await productsPage.isProductInCart(productName);
    expect(isInCart).to.be.false;
  });

  it('should add multiple products to cart', async function() {
    await productsPage.resetAppState();
    const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];
    
    await productsPage.addMultipleProductsToCart(products);
    
    const cartCount = await productsPage.getCartItemCount();
    expect(cartCount).to.equal(products.length);
  });

  it('should sort products by name A to Z', async function() {
    await productsPage.sortProducts('az');
    
    const productNames = await productsPage.getProductNames();
    const sortedNames = [...productNames].sort();
    
    expect(productNames).to.deep.equal(sortedNames);
  });

  it('should sort products by name Z to A', async function() {
    await productsPage.sortProducts('za');
    
    const productNames = await productsPage.getProductNames();
    const sortedNames = [...productNames].sort().reverse();
    
    expect(productNames).to.deep.equal(sortedNames);
  });

  it('should sort products by price low to high', async function() {
    await productsPage.sortProducts('lohi');
    
    const prices = await productsPage.getProductPrices();
    const sortedPrices = [...prices].sort((a, b) => a - b);
    
    expect(prices).to.deep.equal(sortedPrices);
  });

  it('should sort products by price high to low', async function() {
    await productsPage.sortProducts('hilo');
    
    const prices = await productsPage.getProductPrices();
    const sortedPrices = [...prices].sort((a, b) => b - a);
    
    expect(prices).to.deep.equal(sortedPrices);
  });

  it('should identify most expensive product', async function() {
    const mostExpensive = await productsPage.getMostExpensiveProduct();
    
    expect(mostExpensive).to.have.property('name');
    expect(mostExpensive).to.have.property('price');
    expect(mostExpensive.price).to.be.greaterThan(0);
  });

  it('should identify least expensive product', async function() {
    const leastExpensive = await productsPage.getLeastExpensiveProduct();
    
    expect(leastExpensive).to.have.property('name');
    expect(leastExpensive).to.have.property('price');
    expect(leastExpensive.price).to.be.greaterThan(0);
  });

  it('should navigate to cart page', async function() {
    await productsPage.resetAppState();
    await productsPage.addProductToCartByName('Sauce Labs Backpack');
    await productsPage.goToCart();
    
    const url = await driver.getCurrentUrl();
    expect(url).to.include('cart.html');
    await productsPage.navigateToProductsPage();
  });

  it('should display cart badge when items added', async function() {
    await productsPage.resetAppState();
    await productsPage.addProductToCartByName('Sauce Labs Backpack');
    
    const badgeDisplayed = await productsPage.isCartBadgeDisplayed();
    expect(badgeDisplayed).to.be.true;
  });

  it('should verify product data structure', async function() {
    const products = await productsPage.getAllProducts();
    
    products.forEach(product => {
      expect(product).to.have.property('name');
      expect(product).to.have.property('description');
      expect(product).to.have.property('price');
      expect(product).to.have.property('priceText');
      expect(product.name).to.be.a('string').and.not.empty;
      expect(product.price).to.be.a('number').and.greaterThan(0);
    });
  });

  it('should logout successfully', async function() {
    await productsPage.logout();
    
    const isOnLoginPage = await loginPage.isOnLoginPage();
    expect(isOnLoginPage).to.be.true;
  });
});