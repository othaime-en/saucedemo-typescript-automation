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

// Screenshot options
export interface ScreenshotOptions {
  testName: string;
  stepName?: string;
  timestamp?: boolean;
}

//User credentials for testing
export interface UserCredentials {
  username: string;
  password: string;
  userType: string;
  expectedResult: 'success' | 'failure';
  description: string;
}

// Product information
export interface Product {
  name: string;
  description: string;
  price: number;
  priceText: string;
}
