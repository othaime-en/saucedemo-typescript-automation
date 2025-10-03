/**
 * Type definitions for the test automation framework
 */

// Browser configuration options
export interface BrowserConfig {
  name: 'chrome' | 'firefox';
  headless: boolean;
  windowSize: {
    width: number;
    height: number;
  };
}

// Test configuration interface
export interface TestConfig {
  baseUrl: string;
  browser: BrowserConfig;
  timeout: {
    implicit: number;
    explicit: number;
    pageLoad: number;
  };
  screenshots: {
    onFailure: boolean;
    onSuccess: boolean;
    path: string;
  };
}
