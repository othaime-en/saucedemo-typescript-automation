import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';

import config from '../config/test.config.js';
import ScreenshotUtils from './ScreenshotUtils.js'

/**
 * WebDriver Manager - Singleton pattern for managing WebDriver instances
 * Handles driver creation, configuration, and lifecycle management
 */
class WebDriverManager {
  private static instance: WebDriverManager;
  private driver: WebDriver | null = null;

  private constructor() {}

  /**
   * Get singleton instance of WebDriverManager
   */
  public static getInstance(): WebDriverManager {
    if (!WebDriverManager.instance) {
      WebDriverManager.instance = new WebDriverManager();
    }
    return WebDriverManager.instance;
  }

  /**
   * Create and configure WebDriver instance
   * @param browserName - Browser to use (chrome or firefox)
   * @param headless - Run in headless mode
   * @returns Configured WebDriver instance
   */
  public async createDriver(
    browserName?: 'chrome' | 'firefox',
    headless?: boolean
  ): Promise<WebDriver> {
    const browserConfig = config.getBrowserConfig();
    const browser = browserName || browserConfig.name;
    const isHeadless = headless !== undefined ? headless : browserConfig.headless;

    const builder = new Builder();

    if (browser === 'chrome') {
      const chromeOptions = new chrome.Options();
      
      if (isHeadless) {
        chromeOptions.addArguments('--headless=new');
      }
      
      chromeOptions.addArguments(
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-extensions',
        `--window-size=${browserConfig.windowSize.width},${browserConfig.windowSize.height}`,
        '--disable-blink-features=AutomationControlled'
      );

      chromeOptions.setUserPreferences({
        'profile.default_content_setting_values.notifications': 2
      });

      builder.forBrowser('chrome').setChromeOptions(chromeOptions);
    } else if (browser === 'firefox') {
      const firefoxOptions = new firefox.Options();
      
      if (isHeadless) {
        firefoxOptions.addArguments('-headless');
      }
      
      firefoxOptions.addArguments(
        `--width=${browserConfig.windowSize.width}`,
        `--height=${browserConfig.windowSize.height}`
      );

      firefoxOptions.setPreference('dom.webnotifications.enabled', false);

      builder.forBrowser('firefox').setFirefoxOptions(firefoxOptions);
    }

    this.driver = await builder.build();

    const timeouts = config.getTimeoutConfig();
    await this.driver.manage().setTimeouts({
      implicit: timeouts.implicit,
      pageLoad: timeouts.pageLoad,
      script: timeouts.explicit
    });

    return this.driver;
  }

  /**
   * Get current WebDriver instance
   * @returns Current WebDriver instance
   * @throws Error if driver not initialized
   */
  public getDriver(): WebDriver {
    if (!this.driver) {
      throw new Error('WebDriver not initialized. Call createDriver() first.');
    }
    return this.driver;
  }

  /**
   * Quit WebDriver and cleanup
   */
  public async quitDriver(): Promise<void> {
    if (this.driver) {
      try {
        await this.driver.quit();
      } catch (error) {
        console.error('Error quitting driver:', (error as Error).message);
      } finally {
        this.driver = null;
      }
    }
  }

  /**
   * Capture screenshot on test failure
   * @param testName - Name of the failed test
   */
  public async captureFailureScreenshot(testName: string): Promise<void> {
    if (this.driver && config.getConfig().screenshots.onFailure) {
      try {
        await ScreenshotUtils.captureFailureEvidence(this.driver, testName);
      } catch (error) {
        console.error('Failed to capture screenshot:', (error as Error).message);
      }
    }
  }

}

export default WebDriverManager.getInstance();