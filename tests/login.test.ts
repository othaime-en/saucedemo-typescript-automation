import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';

import WebDriverManager from '../src/utils/WebDriverManager.js';
import TestDataReader from '../src/utils/TestDataReader.js';
import LoginPage from '../src/pages/LoginPage.js';
import ProductsPage from '../src/pages/ProductsPage.js';

describe('Login Tests', function() {
  this.timeout(60000);
  
  let driver: WebDriver;
  let loginPage: LoginPage;
  let productsPage: ProductsPage;

  before(async function() {
    console.log('Starting login test suite');
    driver = await WebDriverManager.createDriver();
    loginPage = new LoginPage(driver);
    productsPage = new ProductsPage(driver);
  });

  after(async function() {
    await WebDriverManager.quitDriver();
    console.log('Login test suite completed');
  });

  beforeEach(async function() {
    await loginPage.open();
  });

  it('should successfully login with valid credentials', async function() {
    const user = await TestDataReader.getStandardUser();
    
    await loginPage.login(user.username, user.password);
    
    const isOnProductsPage = await productsPage.isOnProductsPage();
    expect(isOnProductsPage).to.be.true;
  });

  it('should display error for locked out user', async function() {
    const user = await TestDataReader.getUserByUsername('locked_out_user');
    
    if (user) {
      await loginPage.login(user.username, user.password);
      
      const errorDisplayed = await loginPage.isErrorDisplayed();
      expect(errorDisplayed).to.be.true;
      
      const errorMessage = await loginPage.getErrorMessage();
      expect(errorMessage).to.include('locked out');
    }
  });

  it('should display error for invalid username', async function() {
    await loginPage.login('invalid_user', 'secret_sauce');
    
    const errorDisplayed = await loginPage.isErrorDisplayed();
    expect(errorDisplayed).to.be.true;
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).to.include('do not match');
  });

  it('should display error for invalid password', async function() {
    await loginPage.login('standard_user', 'wrong_password');
    
    const errorDisplayed = await loginPage.isErrorDisplayed();
    expect(errorDisplayed).to.be.true;
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).to.include('do not match');
  });

  it('should display error for empty username', async function() {
    await loginPage.enterPassword('secret_sauce');
    await loginPage.clickLoginButton();
    
    const errorDisplayed = await loginPage.isErrorDisplayed();
    expect(errorDisplayed).to.be.true;
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).to.include('Username is required');
  });

  it('should display error for empty password', async function() {
    await loginPage.enterUsername('standard_user');
    await loginPage.clickLoginButton();
    
    const errorDisplayed = await loginPage.isErrorDisplayed();
    expect(errorDisplayed).to.be.true;
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).to.include('Password is required');
  });

  it('should display error for empty credentials', async function() {
    await loginPage.clickLoginButton();
    
    const errorDisplayed = await loginPage.isErrorDisplayed();
    expect(errorDisplayed).to.be.true;
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).to.include('Username is required');
  });

  it('should verify all login page elements are displayed', async function() {
    const usernameDisplayed = await loginPage.isUsernameFieldDisplayed();
    const passwordDisplayed = await loginPage.isPasswordFieldDisplayed();
    const loginButtonEnabled = await loginPage.isLoginButtonEnabled();
    const onLoginPage = await loginPage.isOnLoginPage();
    
    expect(usernameDisplayed).to.be.true;
    expect(passwordDisplayed).to.be.true;
    expect(loginButtonEnabled).to.be.true;
    expect(onLoginPage).to.be.true;
  });

});