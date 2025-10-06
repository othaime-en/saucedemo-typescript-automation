import { WebDriver, By } from 'selenium-webdriver';

import BasePage from './BasePage.js';

/**
 * Products Page Object
 * Represents the SauceDemo products/inventory page and its interactions
 */
export default class ProductsPage extends BasePage {
  private readonly pageTitle: By = By.css('.title');
  private readonly productItems: By = By.css('.inventory_item');

  constructor(driver: WebDriver) {
    super(driver);
  }

  /**
   * Check if user is on products page
   * @returns True if on products page
   */
  public async isOnProductsPage(): Promise<boolean> {
    try {
      const url = await this.getCurrentUrl();
      const titleDisplayed = await this.isElementDisplayed(this.pageTitle);
      return url.includes('inventory.html') && titleDisplayed;
    } catch (error) {
      return false;
    }
  }

  // Get page title text
  public async getPageTitleText(): Promise<string> {
    return await this.getElementText(this.pageTitle);
  }

  
  // Get number of products displayed
  public async getProductCount(): Promise<number> {
    const products = await this.findElements(this.productItems);
    return products.length;
  }
}