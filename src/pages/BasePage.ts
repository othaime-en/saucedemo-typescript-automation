import { WebDriver, By, until, WebElement } from 'selenium-webdriver';

import config from '../config/test.config.js';

/**
 * Base Page class containing common web interactions
 * All page objects should extend this class
 */
export default class BasePage {
  protected driver: WebDriver;
  protected timeout: number;

  constructor(driver: WebDriver) {
    this.driver = driver;
    this.timeout = config.getTimeoutConfig().explicit;
  }

  // Navigate to a specific URL
  public async navigateTo(url: string): Promise<void> {
    await this.driver.get(url);
  }

  // Find element with explicit wait
  protected async findElement(locator: By, timeout?: number): Promise<WebElement> {
    const waitTime = timeout || this.timeout;
    try {
      return await this.driver.wait(
        until.elementLocated(locator),
        waitTime,
        `Element not found: ${locator.toString()}`
      );
    } catch (error) {
      throw new Error(`Failed to find element ${locator.toString()}: ${(error as Error).message}`);
    }
  }

  // Find multiple elements
  protected async findElements(locator: By): Promise<WebElement[]> {
    try {
      await this.waitForElement(locator);
      return await this.driver.findElements(locator);
    } catch (error) {
      throw new Error(`Failed to find elements ${locator.toString()}: ${(error as Error).message}`);
    }
  }

  // Click element with wait
  protected async clickElement(locator: By, timeout?: number): Promise<void> {
    try {
      const element = await this.findElement(locator, timeout);
      await this.driver.wait(until.elementIsVisible(element), timeout || this.timeout);
      await this.driver.wait(until.elementIsEnabled(element), timeout || this.timeout);
      await element.click();
    } catch (error) {
      throw new Error(`Failed to click element ${locator.toString()}: ${(error as Error).message}`);
    }
  }

  // Wait for element to be visible
  protected async waitForElement(locator: By, timeout?: number): Promise<WebElement> {
    const waitTime = timeout || this.timeout;
    try {
      const element = await this.driver.wait(
        until.elementLocated(locator),
        waitTime
      );
      await this.driver.wait(until.elementIsVisible(element), waitTime);
      return element;
    } catch (error) {
      throw new Error(`Element not visible: ${locator.toString()}`);
    }
  }

  // Type text into element
  protected async typeText(locator: By, text: string, clearFirst: boolean = true): Promise<void> {
    try {
      const element = await this.findElement(locator);
      await this.driver.wait(until.elementIsVisible(element), this.timeout);
      
      if (clearFirst) {
        await element.clear();
      }
      
      await element.sendKeys(text);
    } catch (error) {
      throw new Error(`Failed to type text into ${locator.toString()}: ${(error as Error).message}`);
    }
  }

  // get text from element
  protected async getElementText(locator: By): Promise<string> {
    try {
      const element = await this.findElement(locator);
      await this.driver.wait(until.elementIsVisible(element), this.timeout);
      return await element.getText();
    } catch (error) {
      throw new Error(`Failed to get text from ${locator.toString()}: ${(error as Error).message}`);
    }
  }


  // get attribute from element
  protected async getElementAttribute(locator: By, attribute: string): Promise<string | null> {
    try {
      const element = await this.findElement(locator);
      return await element.getAttribute(attribute);
    } catch (error) {
      throw new Error(`Failed to get attribute ${attribute} from ${locator.toString()}: ${(error as Error).message}`);
    }
  }

  // check if an element is displayed
  protected async isElementDisplayed(locator: By): Promise<boolean> {
    try {
      const element = await this.findElement(locator);
      return await element.isDisplayed();
    } catch (error) {
      return false;
    }
  }

  //check if an element is displayed
  protected async isElementEnabled(locator: By): Promise<boolean> {
    try {
      const element = await this.findElement(locator);
      return await element.isEnabled();
    } catch (error) {
      return false;
    }
  }

  // wait for an element to be invisible
  protected async waitForElementToDisappear(locator: By, timeout?: number): Promise<void> {
    const waitTime = timeout || this.timeout;
    try {
      await this.driver.wait(async () => {
        const elements = await this.driver.findElements(locator);
        if (elements.length === 0) return true;
        return !(await elements[0].isDisplayed());
      }, waitTime);
    } catch (error) {
      throw new Error(`Element did not disappear: ${locator.toString()}`);
    }
  }

  // wait for the page to load
  protected async waitForPageLoad(timeout?: number): Promise<void> {
    const waitTime = timeout || this.timeout;
    await this.driver.wait(async () => {
      const state = await this.driver.executeScript('return document.readyState') as string;
      return state === 'complete';
    }, waitTime);
  }

  // scroll element into view
  protected async scrollToElement(locator: By): Promise<void> {
    try {
      const element = await this.findElement(locator);
      await this.driver.executeScript('arguments[0].scrollIntoView(true);', element);
      await this.driver.sleep(500);
    } catch (error) {
      throw new Error(`Failed to scroll to element ${locator.toString()}: ${(error as Error).message}`);
    }
  }

  // Get page title
  public async getPageTitle(): Promise<string> {
    return await this.driver.getTitle();
  }

  // get current page url
  public async getCurrentUrl(): Promise<string> {
    return await this.driver.getCurrentUrl();
  }
  
  // refresh the current page
  public async refreshPage(): Promise<void> {
    await this.driver.navigate().refresh();
    await this.waitForPageLoad();
  }

  
}