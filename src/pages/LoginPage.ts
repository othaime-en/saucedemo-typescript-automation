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

  
  
}