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

// Sort options for products
export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

// Cart item details
export interface CartItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
}

//Checkout information
export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

// Order summary details
export interface OrderSummary {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

// Test result for reporting
export interface TestResult {
  suiteName: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  screenshot?: string;
}

// Report data structure
export interface ReportData {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  testResults: TestResult[];
  environment: {
    browser: string;
    platform: string;
    nodeVersion: string;
  };
}