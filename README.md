# SauceDemo Test Automation Framework

This is a TypeScript-based Selenium WebDriver framework for automated testing of the SauceDemo e-commerce application. I've created this to demonstrate how to use Selenium Webdriver to create a comprehensive test suite that uses a Page Object Model (POM) architecture, Data-driven testing, Headless execution and even integrates a CI/CD pipeline with Github Actions.

## Prerequisites

- Node.js 18+
- npm 9+
- Chrome or Firefox browser

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run all tests
npm test

# Run specific test suite
npm run test:login
npm run test:products
npm run test:cart
npm run test:e2e
```

## Configuration

Edit `.env` file to configure:

```env
BROWSER=chrome          # chrome or firefox
HEADLESS=false         # true for headless mode
BASE_URL=https://www.saucedemo.com
```
