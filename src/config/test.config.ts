import type { TestConfig } from '../types/index.js';

/**
 * Test configuration management
 * Handles environment-based configuration loading
 */
class Configuration {
  private static instance: Configuration;
  private config: TestConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  /**
   * Get singleton instance of Configuration
   */
  public static getInstance(): Configuration {
    if (!Configuration.instance) {
      Configuration.instance = new Configuration();
    }
    return Configuration.instance;
  }

  /**
   * Load configuration based on environment variables
   */
  private loadConfig(): TestConfig {
    const browser = (process.env.BROWSER || 'chrome') as 'chrome' | 'firefox';
    const headless = process.env.HEADLESS === 'true' || process.env.CI === 'true';
    
    return {
      baseUrl: process.env.BASE_URL || 'https://www.saucedemo.com',
      browser: {
        name: browser,
        headless: headless,
        windowSize: {
          width: 1920,
          height: 1080
        }
      },
      timeout: {
        implicit: 10000,
        explicit: 20000,
        pageLoad: 30000
      },
      screenshots: {
        onFailure: true,
        onSuccess: false,
        path: './reports/screenshots'
      }
    };
  }

  /**
   * Get current test configuration
   */
  public getConfig(): TestConfig {
    return this.config;
  }

  /**
   * Get browser configuration
   */
  public getBrowserConfig(): TestConfig['browser'] {
    return this.config.browser;
  }

}

export default Configuration.getInstance();