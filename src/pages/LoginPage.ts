import { WebDriver, By } from 'selenium-webdriver';

import BasePage from './BasePage.js';

/**
 * Login Page Object
 * Represents the SauceDemo login page and its interactions
 */
export default class LoginPage extends BasePage {
  private readonly usernameInput: By = By.id('user-name');
  private readonly passwordInput: By = By.id('password');
  private readonly loginButton: By = By.id('login-button');
  private readonly errorMessage: By = By.css('[data-test="error"]');
  private readonly errorButton: By = By.css('.error-button');
  private readonly loginLogo: By = By.css('.login_logo');
  private readonly loginCredentials: By = By.id('login_credentials'); 

  constructor(driver: WebDriver) {
    super(driver);
  }

  // Navigate to login page
  public async open() {
  }

  /**
   * Perform login with credentials
   * @param username - Username
   * @param password - Password
   */
  public async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLoginButton();
  }

  // Enter username into input field
  public async enterUsername(username: string): Promise<void> {
    await this.typeText(this.usernameInput, username);
  }

  // Enter password into input field
  public async enterPassword(password: string): Promise<void> {
    await this.typeText(this.passwordInput, password);
  }

  // Click the login button
  public async clickLoginButton(): Promise<void> {
    await this.clickElement(this.loginButton);
  }
  
  // Get error message
  public async getErrorMessage(): Promise<string> {
    try {
      if (await this.isElementDisplayed(this.errorMessage)) {
        return await this.getElementText(this.errorMessage);
      }
      return '';
    } catch (error) {
      return '';
    }
  }

  // Check if error message is displayed
  public async isErrorDisplayed(): Promise<boolean> {
    return await this.isElementDisplayed(this.errorMessage);
  }

  // Close error message by clicking error button
  public async closeErrorMessage(): Promise<void> {
    if (await this.isElementDisplayed(this.errorButton)) {
      await this.clickElement(this.errorButton);
    }
  }


  // Check if user is on login page
  public async isOnLoginPage(): Promise<boolean> {
    try {
      const url = await this.getCurrentUrl();
      const logoDisplayed = await this.isElementDisplayed(this.loginLogo);
      const loginButtonDisplayed = await this.isElementDisplayed(this.loginButton);
      
      return url.includes('saucedemo.com') && 
             logoDisplayed && 
             loginButtonDisplayed &&
             !url.includes('inventory');
    } catch (error) {
      return false;
    }
  }

  // Check if username field is displayed
  public async isUsernameFieldDisplayed(): Promise<boolean> {
    return await this.isElementDisplayed(this.usernameInput);
  }

  // Check if password field is displayed
  public async isPasswordFieldDisplayed(): Promise<boolean> {
    return await this.isElementDisplayed(this.passwordInput);
  }


  // Check if login button is enabled
  public async isLoginButtonEnabled(): Promise<boolean> {
    return await this.isElementEnabled(this.loginButton);
  }

  // Get list of accepted usernames from login page
  public async getAcceptedUsernames(): Promise<string[]> {
    try {
      const credentialsText = await this.getElementText(this.loginCredentials);
      const usernames = credentialsText
        .split('\n')
        .filter(line => line.includes('_user'))
        .map(line => line.trim());
      return usernames;
    } catch (error) {
      return [];
    }
  }

  // Clear login form fields
  public async clearLoginForm(): Promise<void> {
    await this.typeText(this.usernameInput, '', true);
    await this.typeText(this.passwordInput, '', true);
  }


  
}