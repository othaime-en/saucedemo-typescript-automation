import { WebDriver } from 'selenium-webdriver';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

import config from '../config/test.config.js';
import type { ScreenshotOptions } from '../types/index.js';

/**
 * Screenshot utility for capturing test evidence
 * Provides methods for taking screenshots with timestamps and organizing them
 */
class ScreenshotUtils {
  private screenshotDir: string;

  constructor() {
    this.screenshotDir = config.getScreenshotPath();
    this.ensureDirectoryExists();
  }

  /**
   * Ensure screenshot directory exists
   */
  private ensureDirectoryExists(): void {
    if (!existsSync(this.screenshotDir)) {
      mkdir(this.screenshotDir, { recursive: true }).catch(err => {
        console.error('Failed to create screenshot directory:', err);
      });
    }
  }

  /**
   * Generate timestamped filename
   * @param baseName - Base name for the file
   * @param extension - File extension
   * @returns Timestamped filename
   */
  private generateTimestampedFilename(baseName: string, extension: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedName = baseName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${sanitizedName}_${timestamp}.${extension}`;
  }

  /**
   * Take screenshot and save to file
   * @param driver - WebDriver instance
   * @param options - Screenshot options
   * @returns Path to saved screenshot
   */
  public async takeScreenshot(
    driver: WebDriver,
    options: ScreenshotOptions
  ): Promise<string> {
    try {
      await this.ensureDirectoryExists();
      
      const screenshot = await driver.takeScreenshot();
      const stepSuffix = options.stepName ? `_${options.stepName}` : '';
      const filename = this.generateTimestampedFilename(
        `${options.testName}${stepSuffix}`,
        'png'
      );
      const filePath = path.join(this.screenshotDir, filename);

      await writeFile(filePath, screenshot, 'base64');
      
      return filePath;
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${(error as Error).message}`);
    }
  }

  /**
   * Capture comprehensive failure evidence
   * Includes screenshot, page source, and browser console logs
   * @param driver - WebDriver instance
   * @param testName - Name of the failed test
   * @returns Object containing paths to captured evidence
   */
  public async captureFailureEvidence(
    driver: WebDriver,
    testName: string
  ): Promise<{ screenshot: string; pageSource: string }> {
    try {
      await this.ensureDirectoryExists();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedName = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      const screenshot = await driver.takeScreenshot();
      const screenshotPath = path.join(
        this.screenshotDir,
        `${sanitizedName}_failure_${timestamp}.png`
      );
      await writeFile(screenshotPath, screenshot, 'base64');

      const pageSource = await driver.getPageSource();
      const pageSourcePath = path.join(
        this.screenshotDir,
        `${sanitizedName}_source_${timestamp}.html`
      );
      await writeFile(pageSourcePath, pageSource, 'utf8');

      const currentUrl = await driver.getCurrentUrl();
      const browserInfo = await driver.getCapabilities();
      
      const evidenceInfo = {
        testName,
        timestamp: new Date().toISOString(),
        url: currentUrl,
        browser: browserInfo.getBrowserName(),
        browserVersion: browserInfo.getBrowserVersion(),
        platform: browserInfo.getPlatform()
      };

      const infoPath = path.join(
        this.screenshotDir,
        `${sanitizedName}_info_${timestamp}.json`
      );
      await writeFile(infoPath, JSON.stringify(evidenceInfo, null, 2), 'utf8');

      return {
        screenshot: screenshotPath,
        pageSource: pageSourcePath
      };
    } catch (error) {
      throw new Error(`Failed to capture failure evidence: ${(error as Error).message}`);
    }
  }

  /**
   * Capture screenshot for a specific test step
   * @param driver - WebDriver instance
   * @param testName - Name of the test
   * @param stepName - Name of the step
   * @returns Path to saved screenshot
   */
  public async captureStep(
    driver: WebDriver,
    testName: string,
    stepName: string
  ): Promise<string> {
    return this.takeScreenshot(driver, {
      testName,
      stepName,
      timestamp: true
    });
  }

  /**
   * Get screenshot directory path
   * @returns Path to screenshot directory
   */
  public getScreenshotDirectory(): string {
    return this.screenshotDir;
  }
}

export default new ScreenshotUtils();